import connectMongo from '@/utils/dbConnect-mongo'
import mongoose from 'mongoose'
import Group from './group.model.js'
import User from '@/app/models/user.model.js'
import Game from '../game/game.model.js'

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

    // Validate age group if provided
    if (groupData.ageGroup) {
      const { min, max } = groupData.ageGroup
      if (min === undefined || max === undefined) {
        return {
          status: 'error',
          result: null,
          message: 'Both minimum and maximum age are required when specifying age group'
        }
      }

      if (min < 0 || max < 0) {
        return {
          status: 'error',
          result: null,
          message: 'Age values cannot be negative'
        }
      }

      if (min > 120 || max > 120) {
        return {
          status: 'error',
          result: null,
          message: 'Age values cannot exceed 120 years'
        }
      }

      if (min >= max) {
        return {
          status: 'error',
          result: null,
          message: 'Minimum age must be less than maximum age'
        }
      }

      if (max - min < 1) {
        return {
          status: 'error',
          result: null,
          message: 'Age range must be at least 1 year'
        }
      }
    }

    // Validate gender if provided (supports single or multiple selections)
    if (groupData.gender) {
      const allowedGenders = ['male', 'female', 'other']
      let gendersArray
      if (Array.isArray(groupData.gender)) {
        gendersArray = groupData.gender
      } else if (typeof groupData.gender === 'object' && groupData.gender !== null) {
        gendersArray = Object.entries(groupData.gender)
          .filter(([, isOn]) => Boolean(isOn))
          .map(([key]) => key)
      } else {
        gendersArray = [groupData.gender]
      }

      const invalidGenders = gendersArray.filter(gender => !allowedGenders.includes(gender))
      if (invalidGenders.length > 0) {
        return {
          status: 'error',
          result: null,
          message: 'Gender must be one or more of: male, female, other'
        }
      }

      // Normalize to array for the model schema which expects [String]
      groupData.gender = gendersArray
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

    return {
      status: 'success',
      result: updatedGroup.toObject(),
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

    // Perform soft delete
    existingGroup.isDeleted = true
    existingGroup.deletedAt = new Date()

    // Save the updated group
    const deletedGroup = await existingGroup.save()

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

// Join Request Methods
export const sendJoinRequest = async (groupId, userEmail) => {
  await connectMongo()
  try {
    console.log('sendJoinRequest called with:', { groupId, userEmail })

    // Validate groupId format
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      console.log('Invalid groupId format:', groupId)
      return {
        status: 'error',
        result: null,
        message: 'Invalid group ID format'
      }
    }

    // Check if group exists and is public
    const group = await Group.findOne({ _id: groupId, isDeleted: false })
    console.log('Group found:', !!group)

    if (!group) {
      return {
        status: 'error',
        result: null,
        message: 'Group not found'
      }
    }

    // Ensure joinRequests field exists
    if (!group.joinRequests) {
      group.joinRequests = []
    }

    if (group.status !== 'public') {
      return {
        status: 'error',
        result: null,
        message: 'Group is not public'
      }
    }

    // Check if user is already a member
    const user = await User.findOne({ email: userEmail })
    if (!user) {
      return {
        status: 'error',
        result: null,
        message: 'User not found'
      }
    }

    const isMember = group.members?.some(member => member.toString() === user._id.toString())
    if (isMember) {
      return {
        status: 'error',
        result: null,
        message: 'You are already a member of this group'
      }
    }

    // Check if user already has a pending request
    const existingRequest = group.joinRequests?.find(req => req.email === userEmail && req.status === 'pending')
    if (existingRequest) {
      return {
        status: 'error',
        result: null,
        message: 'You already have a pending request for this group'
      }
    }

    // Add join request
    const joinRequest = {
      email: userEmail,
      status: 'pending',
      requestedAt: new Date()
    }

    console.log('Adding join request:', joinRequest)
    console.log('Current joinRequests:', group.joinRequests)

    group.joinRequests.push(joinRequest)

    console.log('Updated joinRequests:', group.joinRequests)
    console.log('Saving group...')

    await group.save()
    console.log('Group saved successfully')

    return {
      status: 'success',
      result: joinRequest,
      message: 'Join request sent successfully'
    }
  } catch (error) {
    console.error('Error in sendJoinRequest:', error)
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to send join request'
    }
  }
}

export const getJoinRequests = async (groupId, status, userEmail) => {
  await connectMongo()
  try {
    const group = await Group.findOne({ _id: groupId, isDeleted: false })
    if (!group) {
      return {
        status: 'error',
        result: null,
        message: 'Group not found'
      }
    }

    // Check if user is admin of the group
    const isAdmin = group.creatorEmail === userEmail
    if (!isAdmin) {
      return {
        status: 'error',
        result: null,
        message: 'Only group admins can view join requests'
      }
    }

    const requests = group.joinRequests?.filter(req => req.status === status) || []

    return {
      status: 'success',
      result: requests,
      message: `Found ${requests.length} ${status} requests`
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to get join requests'
    }
  }
}

export const processJoinRequest = async (groupId, userEmail, action, rejectionReason, adminEmail) => {
  await connectMongo()
  try {
    const group = await Group.findOne({ _id: groupId, isDeleted: false })

    if (!group) {
      return {
        status: 'error',
        result: null,
        message: 'Group not found'
      }
    }

    // Check if user is admin of the group
    const isAdmin = group.creatorEmail === adminEmail
    if (!isAdmin) {
      return {
        status: 'error',
        result: null,
        message: 'Only group admins can process join requests'
      }
    }

    // Validate rejection reason if rejecting
    if (action === 'reject' && (!rejectionReason || rejectionReason.trim() === '')) {
      return {
        status: 'error',
        result: null,
        message: 'Rejection reason is required when rejecting a join request'
      }
    }

    // Find the specific request by user email
    const request = group.joinRequests.find(req => req.email === userEmail && req.status === 'pending')
    if (!request) {
      return {
        status: 'error',
        result: null,
        message: 'Pending join request not found for this user'
      }
    }

    // Update request status
    request.status = action === 'approve' ? 'approved' : 'rejected'
    request.processedAt = new Date()
    request.processedBy = adminEmail
    if (action === 'reject' && rejectionReason) {
      request.rejectionReason = rejectionReason
    }

    // If approved, add user to group members
    if (action === 'approve') {
      const user = await User.findOne({ email: userEmail })
      if (user) {
        // Check if user is already a member
        const isAlreadyMember = group.members.some(member => member.toString() === user._id.toString())
        if (!isAlreadyMember) {
          group.members.push(user._id)
          group.membersCount = group.members.length
        }

        // Add group to user's groupIds
        if (!user.groupIds) {
          user.groupIds = []
        }
        if (!user.groupIds.includes(group._id)) {
          user.groupIds.push(group._id)
          await user.save()
        }
      }
    }

    await group.save()

    return {
      status: 'success',
      result: request,
      message: `Join request ${action}d successfully`
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to process join request'
    }
  }
}

export const cancelJoinRequest = async (groupId, userEmail) => {
  await connectMongo()
  try {
    const group = await Group.findOne({ _id: groupId, isDeleted: false })

    if (!group) {
      return {
        status: 'error',
        result: null,
        message: 'Group not found'
      }
    }

    // Find the user's pending request
    const request = group.joinRequests.find(req => req.email === userEmail && req.status === 'pending')
    if (!request) {
      return {
        status: 'error',
        result: null,
        message: 'No pending join request found for this user'
      }
    }

    // Remove the request
    group.joinRequests = group.joinRequests.filter(req => !(req.email === userEmail && req.status === 'pending'))
    await group.save()

    return {
      status: 'success',
      result: null,
      message: 'Join request cancelled successfully'
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to cancel join request'
    }
  }
}
