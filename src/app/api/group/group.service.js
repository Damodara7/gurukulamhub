import connectMongo from '@/utils/dbConnect-mongo'
import mongoose from 'mongoose'
import Group from './group.model.js'
import User from '@/app/models/user.model.js'
import UserProfile from '@/app/api/profile/profile.model.js'
import Game from '../game/game.model.js'
import GroupRequest from '../group-request/group-request.model.js'
import { broadcastGroupsList } from '../ws/groups/publishers'
import { broadcastGroupDetails } from '../ws/groups/[groupId]/publishers'
import {
  createGroupJoinedNotification,
  createGroupRemovedNotification,
  createGameCreatedNotification
} from '../notifications/notification.helpers.js'

export const getOne = async (filter = {}) => {
  await connectMongo()
  try {
    if (filter._id && !mongoose.Types.ObjectId.isValid(filter._id)) {
      return {
        status: 'error',
        result: null,
        message: 'Invalid group ID format'
      }
    }

    const group = await Group.findOne({ ...filter, isDeleted: false })
      .lean()
      .populate({
        path: 'members',
        populate: {
          path: 'profile'
        }
      })
    console.log('filter', filter)

    if (!group) {
      return {
        status: 'error',
        result: null,
        message: 'Group not found'
      }
    }

    return {
      status: 'success',
      result: group,
      message: 'Group retrieved successfully'
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to retrieve group'
    }
  }
}

export const getAll = async (filter = {}) => {
  await connectMongo()
  try {
    const groups = await Group.find({ ...filter, isDeleted: false })
      .sort({ createdAt: -1 })
      .lean()
      .populate([
        {
          path: 'members',
          populate: {
            path: 'profile'
          }
        }
      ])
    return {
      status: 'success',
      result: groups,
      message: `Found ${groups.length} groups`
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to retrieve groups'
    }
  }
}

// Get groups where user is either creator or member (optimized backend filtering)
export const getUserGroups = async (userEmail) => {
  await connectMongo()
  try {
    if (!userEmail) {
      return {
        status: 'error',
        result: null,
        message: 'User email is required'
      }
    }

    // First, get the user's ObjectId
    const user = await User.findOne({ email: userEmail }).lean()
    if (!user) {
      return {
        status: 'error',
        result: null,
        message: 'User not found'
      }
    }

    const userId = user._id

    // Query groups where:
    // 1. User is the creator (creatorEmail matches)
    // 2. OR user is in the members array (members contains userId)
    // 3. AND group is not deleted
    const groups = await Group.find({
      isDeleted: false,
      $or: [
        { creatorEmail: userEmail },
        { members: userId }
      ]
    })
      .sort({ createdAt: -1 })
      .lean()
      .populate([
        {
          path: 'members',
          populate: {
            path: 'profile'
          }
        }
      ])

    return {
      status: 'success',
      result: groups,
      message: `Found ${groups.length} user groups`
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to retrieve user groups'
    }
  }
}

export const addOne = async groupData => {
  await connectMongo()
  try {
    const user = await User.findOne({ email: groupData.creatorEmail })
    if (!user) {
      return {
        status: 'error',
        result: null,
        message: 'Creator user not found'
      }
    }
    groupData.createdBy = user._id
    // Validate required fields
    console.log('groupData', groupData)
    const requiredFields = ['groupName', 'description', 'createdBy', 'creatorEmail']
    const missingFields = requiredFields.filter(field => !groupData[field])

    if (missingFields.length > 0) {
      return {
        status: 'error',
        result: null,
        message: `Missing required fields: ${missingFields.join(', ')}`
      }
    }

    // Validate filters if provided
    if (groupData.filters && Array.isArray(groupData.filters)) {
      for (const filter of groupData.filters) {
        // Validate required fields
        if (!filter.type || !filter.criteria) {
          return {
            status: 'error',
            result: null,
            message: 'Each filter must have a type and criteria'
          }
        }

        // Validate operator if provided
        if (filter.operator && !['AND', 'OR', 'NOT'].includes(filter.operator)) {
          return {
            status: 'error',
            result: null,
            message: 'Filter operator must be AND, OR, or NOT'
          }
        }

        // Validate specific filter types
        if (filter.type === 'age') {
          const { min, max } = filter.criteria
          if (min === undefined || max === undefined) {
            return {
              status: 'error',
              result: null,
              message: 'Age filter must have min and max values'
            }
          }
          if (min < 0 || max < 0 || min > 120 || max > 120) {
            return {
              status: 'error',
              result: null,
              message: 'Age values must be between 0 and 120'
            }
          }
          if (min >= max) {
            return {
              status: 'error',
              result: null,
              message: 'Minimum age must be less than maximum age'
            }
          }
        }

        if (filter.type === 'gender') {
          const allowedGenders = ['male', 'female', 'other']
          const genders = Array.isArray(filter.criteria) ? filter.criteria : [filter.criteria]
          const invalidGenders = genders.filter(g => !allowedGenders.includes(g))
          if (invalidGenders.length > 0) {
            return {
              status: 'error',
              result: null,
              message: 'Gender must be one of: male, female, other'
            }
          }
        }
      }
    }

    // Create new group instance
    const newGroup = new Group(groupData)

    // Validate the group
    const validationError = newGroup.validateSync()
    if (validationError) {
      const errors = Object.values(validationError.errors).map(err => err.message)
      return {
        status: 'error',
        result: null,
        message: `Validation failed: ${errors.join(', ')}`
      }
    }

    const savedGroup = await newGroup.save()

    // Ensure creator is always added to the group (regardless of filters)
    const creatorId = savedGroup.createdBy?.toString() || groupData.createdBy?.toString()
    const creatorObjectId = user._id

    try {
      // Add creator to group members array if not already present
      if (!savedGroup.members || !savedGroup.members.some(m => m.toString() === creatorId)) {
        savedGroup.members = savedGroup.members || []
        savedGroup.members.push(creatorObjectId)
        savedGroup.membersCount = savedGroup.members.length
        await savedGroup.save()
        console.log(`[Group Service] Automatically added creator ${groupData.creatorEmail} to group members`)
      }

      // Add creator to their own groupIds array
      await User.findByIdAndUpdate(creatorObjectId, { $addToSet: { groupIds: savedGroup._id } })
      console.log(`[Group Service] Added group ${savedGroup._id} to creator's groupIds`)
    } catch (creatorError) {
      console.error('[Group Service] Error adding creator to group:', creatorError)
      // This is critical - rethrow to let main catch handle it
      throw new Error(`Failed to add creator to group: ${creatorError.message}`)
    }

    // Update all selected users' groupIds arrays with the new group ID
    if (groupData.members && groupData.members.length > 0) {
      try {
        // Filter out creator from members list (already added above)
        const membersWithoutCreator = groupData.members.filter(memberId => memberId.toString() !== creatorId)

        if (membersWithoutCreator.length > 0) {
          // Add group to selected users (excluding creator)
          await User.updateMany({ _id: { $in: membersWithoutCreator } }, { $addToSet: { groupIds: savedGroup._id } })
          console.log(`Updated ${membersWithoutCreator.length} users with group ID ${savedGroup._id}`)

          // Create notifications for members (excluding the creator)
          const membersToNotify = membersWithoutCreator

          if (membersToNotify.length > 0) {
            try {
              const UserModel = mongoose.model('users')
              const addedUsers = await UserModel.find({ _id: { $in: membersToNotify } }).lean()

              for (const addedUser of addedUsers) {
                try {
                  await createGroupJoinedNotification(addedUser._id, {
                    _id: savedGroup._id,
                    groupName: savedGroup.groupName,
                    addedBy: groupData.creatorEmail || 'Admin',
                    membersCount: savedGroup.membersCount || savedGroup.members?.length || 0
                  })
                } catch (notificationError) {
                  console.error('Error creating group joined notification for user:', addedUser._id, notificationError)
                  // Don't fail group creation if notification creation fails
                }
              }
              console.log(`Created notifications for ${membersToNotify.length} group members`)
            } catch (notificationError) {
              console.error('Error creating group joined notifications:', notificationError)
              // Don't fail group creation if notification creation fails
            }
          }
        }
      } catch (updateError) {
        console.error('Error updating users with group ID:', updateError)
        // Don't fail group creation if user update fails
      }
    }

    // Broadcast WebSocket event for group creation
    try {
      await broadcastGroupsListUpdates()
    } catch (wsError) {
      console.error('Error broadcasting group created event:', wsError)
      // Don't fail group creation if WebSocket broadcast fails
    }

    return {
      status: 'success',
      result: savedGroup.toObject(),
      message: 'Group created successfully'
    }
  } catch (error) {
    // Handle mongoose validation errors specifically
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message)
      return {
        status: 'error',
        result: null,
        message: `Validation failed: ${validationErrors.join(', ')}`
      }
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return {
        status: 'error',
        result: null,
        message: 'An group with this name already exists'
      }
    }

    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to create group'
    }
  }
}

export const updateOne = async (groupId, updateData) => {
  await connectMongo()
  try {
    // Find the existing group by ID
    const existingGroup = await Group.findOne({ _id: groupId, isDeleted: false })
    if (!existingGroup) {
      return {
        status: 'error',
        result: null,
        message: 'Group not found'
      }
    }

    // Handle member synchronization if members array is provided
    if (updateData.members !== undefined) {
      try {
        // Ensure creator is always in the group (regardless of filters or member updates)
        const creatorId = existingGroup.createdBy?.toString()
        if (creatorId) {
          try {
            // Get creator user
            const creatorUser = await User.findById(creatorId)
            if (!creatorUser) {
              console.warn(`[Group Service] Creator user ${creatorId} not found, skipping creator auto-add`)
            } else {
              // Ensure creator is in members array
              const updateDataMembers = updateData.members || []
              const creatorInNewMembers = updateDataMembers.some(memberId =>
                memberId.toString ? memberId.toString() === creatorId : String(memberId) === creatorId
              )

              if (!creatorInNewMembers) {
                // Add creator to members array if not present
                updateData.members = [...updateDataMembers, new mongoose.Types.ObjectId(creatorId)]
                console.log(`[Group Service] Automatically re-added creator to group members during update`)
              }

              // Ensure creator has group in their groupIds
              await User.findByIdAndUpdate(creatorId, { $addToSet: { groupIds: groupId } })
              console.log(`[Group Service] Ensured creator has group in their groupIds`)
            }
          } catch (creatorError) {
            console.error('[Group Service] Error ensuring creator is in group:', creatorError)
            // Continue with update even if creator check fails
          }
        }

        // Get current members from the group document (source of truth)
        const currentMemberIds = (existingGroup.members || []).map(memberId =>
          memberId.toString ? memberId.toString() : String(memberId)
        )

        // Convert updateData.members to strings for comparison (after ensuring creator is included)
        const newMemberIds = (updateData.members || []).map(memberId =>
          memberId.toString ? memberId.toString() : String(memberId)
        )

        // Find users to add (in new list but not in current list, excluding creator)
        const usersToAdd = newMemberIds.filter(userId => !currentMemberIds.includes(userId) && userId !== creatorId)

        // Find users to remove (in current list but not in new list, excluding creator)
        const usersToRemove = currentMemberIds.filter(userId => !newMemberIds.includes(userId) && userId !== creatorId)

        console.log('[Group Service] Member changes detected:', {
          currentCount: currentMemberIds.length,
          newCount: newMemberIds.length,
          toAdd: usersToAdd.length,
          toRemove: usersToRemove.length
        })

        // Add group to new users
        if (usersToAdd.length > 0) {
          // Convert string IDs back to ObjectIds for MongoDB query
          const usersToAddObjectIds = usersToAdd.map(id => new mongoose.Types.ObjectId(id))
          await User.updateMany({ _id: { $in: usersToAddObjectIds } }, { $addToSet: { groupIds: groupId } })
          console.log(`Added group to ${usersToAdd.length} users`)

          // Create system messages for added members
          const adminEmail = updateData.updatorEmail || existingGroup.creatorEmail
          if (adminEmail) {
            const UserModel = mongoose.model('users')
            const UserProfile = mongoose.model('userprofiles')

            // Get admin's name
            const adminUser = await UserModel.findOne({ email: adminEmail }).lean()
            let adminName = adminEmail.split('@')[0]
            if (adminUser?.profile) {
              const adminProfile = await UserProfile.findById(adminUser.profile).lean()
              if (adminProfile) {
                adminName = `${adminProfile.firstname || ''} ${adminProfile.lastname || ''}`.trim() || adminName
              }
            }

            // Get names of added users and create system messages
            const addedUsers = await UserModel.find({ _id: { $in: usersToAddObjectIds } }).lean()
            for (const addedUser of addedUsers) {
              let userName = addedUser.email?.split('@')[0] || 'User'
              if (addedUser.profile) {
                const userProfile = await UserProfile.findById(addedUser.profile).lean()
                if (userProfile) {
                  userName = `${userProfile.firstname || ''} ${userProfile.lastname || ''}`.trim() || userName
                }
              }

              // Create system message
              try {
                const { createSystemMessage } = await import('../group-chat/group-chat.service.js')
                await createSystemMessage(groupId, `${userName} was added by ${adminName}`, adminEmail)
              } catch (msgError) {
                console.error('Error creating system message for added member:', msgError)
                // Don't fail the update if system message creation fails
              }

              // Create notification for added user
              try {
                await createGroupJoinedNotification(addedUser._id, {
                  _id: groupId,
                  groupName: existingGroup.groupName,
                  addedBy: adminEmail,
                  membersCount: existingGroup.membersCount || existingGroup.members?.length || 0
                })
              } catch (notificationError) {
                console.error('Error creating group joined notification:', notificationError)
                // Don't fail the update if notification creation fails
              }
            }

            // *** NEW: Send game notifications for users added to group ***
            try {
              console.log('[Group Service] ===== GAME NOTIFICATIONS FOR ADDED USERS START =====')
              const Notification = mongoose.model('notifications')
              const { createGameCreatedNotification } = await import('../notifications/notification.helpers.js')

              // Find all games using this group that are still active/joinable
              const gamesUsingGroup = await Game.find({
                groupId: groupId,
                isDeleted: false,
                status: { $in: ['created', 'approved', 'lobby', 'live'] } // Active/joinable statuses
              }).lean()

              console.log(`[Group Service] Found ${gamesUsingGroup.length} active games using this group`)

              for (const game of gamesUsingGroup) {
                console.log(`[Group Service] Processing game: ${game.title} (${game._id})`)

                // Find users who already have GAME_CREATED notification for this game
                const existingNotifications = await Notification.find({
                  type: 'GAME_CREATED',
                  'relatedEntity.entityType': 'game',
                  'relatedEntity.entityId': game._id.toString(),
                  userId: { $in: usersToAddObjectIds }
                })
                  .select('userId')
                  .lean()

                const usersWithExistingNotifications = existingNotifications.map(n => n.userId.toString())
                console.log(
                  `[Group Service] Found ${usersWithExistingNotifications.length} users who already have notifications for this game`
                )

                // Exclude users who already have notifications
                const usersToNotify = usersToAdd.filter(userId => !usersWithExistingNotifications.includes(userId))

                console.log(`[Group Service] Users to notify for game ${game.title}:`, {
                  totalAdded: usersToAdd.length,
                  alreadyHaveNotification: usersWithExistingNotifications.length,
                  toNotify: usersToNotify.length
                })

                // Send welcome notifications to users who don't already have one
                if (usersToNotify.length > 0) {
                  await createGameCreatedNotification(usersToNotify, {
                    _id: game._id,
                    title: game.title,
                    groupName: existingGroup.groupName,
                    createdBy: game.creatorEmail,
                    registrationDeadline: game.registrationEndTime || game.endTime,
                    maxParticipants: game.maxPlayers
                  })
                  console.log(`[Group Service] ✅ Sent game welcome notifications for game: ${game.title}`)
                } else {
                  console.log(`[Group Service] ⏭️ All added users already have notifications for game: ${game.title}`)
                }
              }
              console.log('[Group Service] ===== GAME NOTIFICATIONS FOR ADDED USERS COMPLETE =====')
            } catch (gameNotificationError) {
              console.error('[Group Service] Error sending game notifications for added users:', gameNotificationError)
              // Don't fail the group update if game notification creation fails
            }
          }
        }

        // Remove group from users who are no longer members
        if (usersToRemove.length > 0) {
          // Convert string IDs back to ObjectIds for MongoDB query
          const usersToRemoveObjectIds = usersToRemove.map(id => new mongoose.Types.ObjectId(id))
          await User.updateMany({ _id: { $in: usersToRemoveObjectIds } }, { $pull: { groupIds: groupId } })
          console.log(`Removed group from ${usersToRemove.length} users`)

          // Create notifications for removed users
          const adminEmail = updateData.updatorEmail || existingGroup.creatorEmail
          if (adminEmail) {
            const UserModel = mongoose.model('users')
            const removedUsers = await UserModel.find({ _id: { $in: usersToRemoveObjectIds } }).lean()

            for (const removedUser of removedUsers) {
              try {
                await createGroupRemovedNotification(removedUser._id, {
                  _id: groupId,
                  groupName: existingGroup.groupName,
                  removedBy: adminEmail,
                  updatorEmail: adminEmail
                })
              } catch (notificationError) {
                console.error('Error creating group removed notification:', notificationError)
                // Don't fail the update if notification creation fails
              }
            }
          }

          // *** NEW: Send game notifications for users removed from group ***
          try {
            console.log('[Group Service] ===== GAME NOTIFICATIONS FOR REMOVED USERS START =====')
            const { createGameAccessRemovedNotification } = await import('../notifications/notification.helpers.js')

            // Find all games using this group that are still active/joinable
            const gamesUsingGroup = await Game.find({
              groupId: groupId,
              isDeleted: false,
              status: { $in: ['created', 'approved', 'lobby', 'live'] } // Active/joinable statuses
            }).lean()

            console.log(`[Group Service] Found ${gamesUsingGroup.length} active games using this group`)

            for (const game of gamesUsingGroup) {
              console.log(`[Group Service] Processing game: ${game.title} (${game._id})`)

              // Send removal notifications to users removed from group
              if (usersToRemove.length > 0) {
                await createGameAccessRemovedNotification(usersToRemove, {
                  _id: game._id,
                  title: game.title,
                  groupName: existingGroup.groupName,
                  updatedBy: adminEmail || 'Admin'
                })
                console.log(`[Group Service] ✅ Sent game removal notifications for game: ${game.title}`)
              }
            }
            console.log('[Group Service] ===== GAME NOTIFICATIONS FOR REMOVED USERS COMPLETE =====')
          } catch (gameNotificationError) {
            console.error('[Group Service] Error sending game notifications for removed users:', gameNotificationError)
            // Don't fail the group update if game notification creation fails
          }
        }
      } catch (memberUpdateError) {
        console.error('Error updating group members:', memberUpdateError)
        // Don't fail the group update if member synchronization fails
      }
    }

    // Apply updates to the existing group document
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        existingGroup[key] = updateData[key]
      }
    })

    // Validate the updated group document
    const validationError = existingGroup.validateSync()
    if (validationError) {
      const errors = Object.values(validationError.errors).map(err => err.message)
      return {
        status: 'error',
        result: null,
        message: `Validation failed: ${errors.join(', ')}`
      }
    }

    // Save the updated group
    const updatedGroup = await existingGroup.save()

    // Populate members with profiles before returning
    const populatedGroup = await Group.findById(groupId)
      .populate({
        path: 'members',
        populate: {
          path: 'profile'
        }
      })
      .lean()

    // Broadcast WebSocket event for group update
    try {
      await broadcastGroupsListUpdates()
      broadcastGroupDetails(groupId, populatedGroup || updatedGroup.toObject())
    } catch (wsError) {
      console.error('Error broadcasting group updated event:', wsError)
      // Don't fail group update if WebSocket broadcast fails
    }

    return {
      status: 'success',
      result: populatedGroup || updatedGroup.toObject(),
      message: 'Group updated successfully'
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to update group'
    }
  }
}

export const deleteOne = async groupId => {
  await connectMongo()
  try {
    // Find the existing group by ID and ensure it's not already deleted
    const existingGroup = await Group.findOne({ _id: groupId, isDeleted: false }).populate('members').lean()

    if (!existingGroup) {
      return {
        status: 'error',
        result: null,
        message: 'Group not found or already deleted'
      }
    }

    // Get group members BEFORE deletion (for notifications)
    const groupMemberIds = existingGroup.members
      ? existingGroup.members.map(member => (member._id || member).toString())
      : []
    const groupName = existingGroup.groupName || 'the group'

    console.log(`[Group Service] Group deletion: Found ${groupMemberIds.length} members to notify`)

    // Send GROUP_REMOVED notifications to all group members
    try {
      console.log('[Group Service] ===== GROUP DELETION NOTIFICATIONS START =====')
      if (groupMemberIds.length > 0) {
        const UserModel = mongoose.model('users')
        const groupMembers = await UserModel.find({ _id: { $in: groupMemberIds } }).lean()

        for (const member of groupMembers) {
          try {
            await createGroupRemovedNotification(member._id, {
              _id: groupId,
              groupName: groupName,
              removedBy: 'System',
              updatorEmail: 'System',
              isDeleted: true
            })
          } catch (notificationError) {
            console.error(`Error creating group removed notification for user ${member._id}:`, notificationError)
            // Continue even if notification fails
          }
        }
        console.log(`[Group Service] ✅ Sent GROUP_REMOVED notifications to ${groupMembers.length} group members`)
      } else {
        console.log('[Group Service] ⏭️ No group members to notify')
      }
    } catch (notificationError) {
      console.error('[Group Service] Error sending group deletion notifications:', notificationError)
      // Continue with deletion even if notifications fail
    }

    // Find all games using this group (BEFORE removing groupId)
    let gamesUsingGroup = []
    try {
      gamesUsingGroup = await Game.find({
        groupId: groupId,
        isDeleted: false
      }).lean()
      console.log(`[Group Service] Found ${gamesUsingGroup.length} games using this group`)
    } catch (gameQueryError) {
      console.error('[Group Service] Error finding games using group:', gameQueryError)
    }

    // Remove group from all users before soft delete
    try {
      await User.updateMany({ groupIds: groupId }, { $pull: { groupIds: groupId } })
      console.log(`Removed group ${groupId} from all users`)
    } catch (userUpdateError) {
      console.error('Error removing group from users:', userUpdateError)
      // Continue with group deletion even if user update fails
    }

    // Remove groupId from all games that reference this group
    try {
      await Game.updateMany({ groupId: groupId }, { $unset: { groupId: 1 } })
      console.log(`Removed groupId ${groupId} from all games`)
    } catch (gameUpdateError) {
      console.error('Error removing groupId from games:', gameUpdateError)
      // Continue with group deletion even if game update fails
    }

    // Send GAME_CREATED notifications to users who were NOT in the group
    try {
      if (gamesUsingGroup.length > 0) {
        console.log('[Group Service] ===== GAME NOTIFICATIONS FOR GROUP DELETION START =====')
        const Notification = mongoose.model('notifications')

        // Get all active users
        const allActiveUsers = await User.find({
          isActive: true,
          isVerified: true
        })
          .select('_id')
          .lean()

        const allActiveUserIds = allActiveUsers.map(user => user._id.toString())
        console.log(`[Group Service] Found ${allActiveUserIds.length} active users`)

        // Exclude users who were in the deleted group
        const usersNotInGroup = allActiveUserIds.filter(userId => !groupMemberIds.includes(userId))
        console.log(`[Group Service] Users not in deleted group: ${usersNotInGroup.length}`)

        for (const game of gamesUsingGroup) {
          try {
            // Find users who already have GAME_CREATED notification for this game
            const existingNotifications = await Notification.find({
              type: 'GAME_CREATED',
              'relatedEntity.entityType': 'game',
              'relatedEntity.entityId': game._id.toString()
            })
              .select('userId')
              .lean()

            const usersWithExistingNotifications = existingNotifications.map(n => n.userId.toString())
            console.log(
              `[Group Service] Game "${game.title}": ${usersWithExistingNotifications.length} users already have notification`
            )

            // Exclude users who already have notifications
            const usersToNotify = usersNotInGroup.filter(userId => !usersWithExistingNotifications.includes(userId))

            console.log(`[Group Service] Game "${game.title}": ${usersToNotify.length} users to notify`)

            // Send GAME_CREATED notifications to eligible users
            if (usersToNotify.length > 0) {
              await createGameCreatedNotification(usersToNotify, {
                _id: game._id,
                title: game.title,
                groupName: null, // Game is now public, no group
                createdBy: game.creatorEmail,
                registrationDeadline: game.registrationEndTime || game.endTime,
                maxParticipants: game.maxPlayers,
                thumbnailPoster: game.thumbnailPoster || game.thumbnailUrl,
                quiz: game.quiz
              })
              console.log(
                `[Group Service] ✅ Sent GAME_CREATED notifications for game "${game.title}" to ${usersToNotify.length} users`
              )
            } else {
              console.log(`[Group Service] ⏭️ All eligible users already have notifications for game "${game.title}"`)
            }
          } catch (gameNotificationError) {
            console.error(`[Group Service] Error sending notifications for game ${game._id}:`, gameNotificationError)
            // Continue with next game even if this one fails
          }
        }
        console.log('[Group Service] ===== GAME NOTIFICATIONS FOR GROUP DELETION COMPLETE =====')
      } else {
        console.log('[Group Service] ⏭️ No games using this group, skipping game notifications')
      }
    } catch (gameNotificationError) {
      console.error('[Group Service] Error processing game notifications for group deletion:', gameNotificationError)
      // Continue with deletion even if game notifications fail
    }

    // Delete all group requests associated with this group
    try {
      const deleteResult = await GroupRequest.deleteMany({ groupId: groupId })
      console.log(`Deleted ${deleteResult.deletedCount} group requests for group ${groupId}`)
    } catch (groupRequestError) {
      console.error('Error deleting group requests:', groupRequestError)
      // Continue with group deletion even if group request cleanup fails
    }

    // Perform soft delete
    const groupToDelete = await Group.findById(groupId)
    if (groupToDelete) {
      groupToDelete.isDeleted = true
      groupToDelete.deletedAt = new Date()
      await groupToDelete.save()
    }

    // Get deleted group for return
    const deletedGroup = await Group.findById(groupId).lean()

    // Broadcast WebSocket event for group deletion
    try {
      await broadcastGroupsListUpdates()
    } catch (wsError) {
      console.error('Error broadcasting group deleted event:', wsError)
    }

    console.log('[Group Service] ===== GROUP DELETION NOTIFICATIONS COMPLETE =====')

    return {
      status: 'success',
      result: deletedGroup,
      message: 'Group soft deleted successfully'
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to delete group'
    }
  }
}

// Function to permanently delete a group and clean up all references
export const hardDeleteOne = async groupId => {
  await connectMongo()
  try {
    // Find the existing group by ID
    const existingGroup = await Group.findOne({ _id: groupId })

    if (!existingGroup) {
      return {
        status: 'error',
        result: null,
        message: 'Group not found'
      }
    }

    // Remove group from all users
    try {
      await User.updateMany({ groupIds: groupId }, { $pull: { groupIds: groupId } })
      console.log(`Removed group ${groupId} from all users`)
    } catch (userUpdateError) {
      console.error('Error removing group from users:', userUpdateError)
      // Continue with group deletion even if user update fails
    }

    // Remove groupId from all games that reference this group
    try {
      await Game.updateMany({ groupId: groupId }, { $unset: { groupId: 1 } })
      console.log(`Removed groupId ${groupId} from all games`)
    } catch (gameUpdateError) {
      console.error('Error removing groupId from games:', gameUpdateError)
      // Continue with group deletion even if game update fails
    }

    // Delete all group requests associated with this group
    try {
      const deleteResult = await GroupRequest.deleteMany({ groupId: groupId })
      console.log(`Deleted ${deleteResult.deletedCount} group requests for group ${groupId}`)
    } catch (groupRequestError) {
      console.error('Error deleting group requests:', groupRequestError)
      // Continue with group deletion even if group request cleanup fails
    }

    // Permanently delete the group
    await Group.deleteOne({ _id: groupId })

    return {
      status: 'success',
      result: null,
      message: 'Group permanently deleted and all references cleaned up'
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to permanently delete group'
    }
  }
}

// Exit group - remove user from group
export const exitGroup = async (groupId, userEmail) => {
  await connectMongo()
  try {
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return {
        status: 'error',
        result: null,
        message: 'Invalid group ID format'
      }
    }

    const group = await Group.findOne({ _id: groupId, isDeleted: false })
      .populate('members', 'email profile')
    
    if (!group) {
      return {
        status: 'error',
        result: null,
        message: 'Group not found'
      }
    }

    // Creator cannot exit the group (they must delete it instead)
    if (group.creatorEmail === userEmail) {
      return {
        status: 'error',
        result: null,
        message: 'Group creator cannot exit the group. Please delete the group instead.'
      }
    }

    // Check if user is a member
    const user = await User.findOne({ email: userEmail }).lean()
    if (!user) {
      return {
        status: 'error',
        result: null,
        message: 'User not found'
      }
    }

    const userId = user._id
    const isMember = group.members?.some(m => {
      const memberId = typeof m === 'object' && m._id ? m._id.toString() : m.toString()
      return memberId === userId.toString()
    })

    if (!isMember) {
      return {
        status: 'error',
        result: null,
        message: 'You are not a member of this group'
      }
    }

    // Remove user from group members
    group.members = group.members.filter(m => {
      const memberId = typeof m === 'object' && m._id ? m._id.toString() : m.toString()
      return memberId !== userId.toString()
    })

    // Remove group from user's groupIds
    await User.findByIdAndUpdate(userId, { $pull: { groupIds: groupId } })

    // Save updated group
    await group.save()

    // Create system message
    try {
      let userName = userEmail.split('@')[0]
      if (user.profile) {
        const userProfile = await UserProfile.findById(user.profile).lean()
        if (userProfile) {
          userName = `${userProfile.firstname || ''} ${userProfile.lastname || ''}`.trim() || userName
        }
      }
      
      const { createSystemMessage } = await import('../group-chat/group-chat.service.js')
      await createSystemMessage(groupId, `${userName} left the group`, userEmail)
    } catch (msgError) {
      console.error('Error creating system message for exited member:', msgError)
    }

    // Broadcast group list update
    try {
      const { broadcastGroupsList } = await import('../ws/groups/publishers')
      if (broadcastGroupsList) {
        broadcastGroupsList()
      }
    } catch (wsError) {
      console.error('Error broadcasting group list update:', wsError)
    }

    return {
      status: 'success',
      result: { groupId, groupName: group.groupName },
      message: 'Successfully exited the group'
    }
  } catch (error) {
    console.error('Error in exitGroup:', error)
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to exit group'
    }
  }
}

// Function to restore a soft-deleted group
export const restoreOne = async groupId => {
  await connectMongo()
  try {
    // Find the soft-deleted group by ID
    const existingGroup = await Group.findOne({ _id: groupId, isDeleted: true })

    if (!existingGroup) {
      return {
        status: 'error',
        result: null,
        message: 'Soft-deleted group not found'
      }
    }

    // Restore the group
    existingGroup.isDeleted = false
    existingGroup.deletedAt = undefined

    // Save the updated group
    const restoredGroup = await existingGroup.save()

    return {
      status: 'success',
      result: restoredGroup,
      message: 'Group restored successfully'
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to restore group'
    }
  }
}

// Note: Join request functionality has been moved to the separate group-request service
// Use the group-request API endpoints instead of these methods

export async function broadcastGroupsListUpdates() {
  try {
    const groupsRes = await getAll()
    if (groupsRes.status === 'success') {
      broadcastGroupsList(groupsRes.result)
    }
  } catch (error) {
    console.error('Error broadcasting groups list updates:', error)
  }
}
