import connectMongo from '@/utils/dbConnect-mongo'
import mongoose from 'mongoose'
import Group from './group.model.js'
import User from '@/app/models/user.model.js'
import Game from '../game/game.model.js'
import GroupRequest from '../group-request/group-request.model.js'
import { broadcastGroupsList } from '../ws/groups/publishers'
import { broadcastGroupDetails } from '../ws/groups/[groupId]/publishers'

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

export const addOne = async groupData => {
  await connectMongo()
  try {
    const user = await User.findOne({ email: groupData.creatorEmail })
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

    // Update all selected users' groupIds arrays with the new group ID
    if (groupData.members && groupData.members.length > 0) {
      try {
        // Add group to selected users
        await User.updateMany({ _id: { $in: groupData.members } }, { $addToSet: { groupIds: savedGroup._id } })
        console.log(`Updated ${groupData.members.length} users with group ID ${savedGroup._id}`)
      } catch (updateError) {
        console.error('Error updating users with group ID:', updateError)
        // Don't fail group creation if user update fails
      }
    }

    // Broadcast WebSocket event for group creation
    try {
      broadcastGroupsListUpdates()
    } catch (wsError) {
      console.error('Error broadcasting group created event:', wsError)
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
        // Get current users in this group
        const currentUsersInGroup = await User.find({ groupIds: groupId }, { _id: 1 }).lean()
        const currentUserIds = currentUsersInGroup.map(u => u._id.toString())

        // Find users to add and remove
        const usersToAdd = updateData.members.filter(userId => !currentUserIds.includes(userId.toString()))
        const usersToRemove = currentUserIds.filter(userId => !updateData.members.includes(userId.toString()))

        // Add group to new users
        if (usersToAdd.length > 0) {
          await User.updateMany({ _id: { $in: usersToAdd } }, { $addToSet: { groupIds: groupId } })
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
            const addedUsers = await UserModel.find({ _id: { $in: usersToAdd } }).lean()
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
                await createSystemMessage(
                  groupId,
                  `${userName} was added by ${adminName}`,
                  adminEmail
                )
              } catch (msgError) {
                console.error('Error creating system message for added member:', msgError)
                // Don't fail the update if system message creation fails
              }
            }
          }
        }

        // Remove group from users who are no longer members
        if (usersToRemove.length > 0) {
          await User.updateMany({ _id: { $in: usersToRemove } }, { $pull: { groupIds: groupId } })
          console.log(`Removed group from ${usersToRemove.length} users`)
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
      broadcastGroupsListUpdates()
      broadcastGroupDetails(groupId, populatedGroup || updatedGroup.toObject())
    } catch (wsError) {
      console.error('Error broadcasting group updated event:', wsError)
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
    const existingGroup = await Group.findOne({ _id: groupId, isDeleted: false })

    if (!existingGroup) {
      return {
        status: 'error',
        result: null,
        message: 'Group not found or already deleted'
      }
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

    // Delete all group requests associated with this group
    try {
      const deleteResult = await GroupRequest.deleteMany({ groupId: groupId })
      console.log(`Deleted ${deleteResult.deletedCount} group requests for group ${groupId}`)
    } catch (groupRequestError) {
      console.error('Error deleting group requests:', groupRequestError)
      // Continue with group deletion even if group request cleanup fails
    }

    // Perform soft delete
    existingGroup.isDeleted = true
    existingGroup.deletedAt = new Date()

    // Save the updated group
    const deletedGroup = await existingGroup.save()

    // Broadcast WebSocket event for group deletion
    try {
      broadcastGroupsListUpdates()
    } catch (wsError) {
      console.error('Error broadcasting group deleted event:', wsError)
    }

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
