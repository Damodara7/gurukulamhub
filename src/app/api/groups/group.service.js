import connectMongo from '@/utils/dbConnect-mongo'
import mongoose from 'mongoose'
import Group from './group.model.js'
import User from '@/app/models/user.model.js'
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

    const group = await Group.findOne({ ...filter, isDeleted: false }).lean()

    if (!group) {
      return {
        status: 'error',
        result: null,
        message: 'Group not found'
      }
    }

    // Derive members from users' groupIds and do not persist on the group
    const usersInGroup = await User.find({ groupIds: group._id }).lean().populate('profile')
    console.log('users in group: ', usersInGroup)
    const derivedMembers = usersInGroup.map(u => u._id)

    return {
      status: 'success',
      result: { ...group, members: derivedMembers,  membersDetails: usersInGroup, membersCount: derivedMembers.length },
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

    // For each group, get the members from users
    const groupsWithMembers = await Promise.all(
      groups.map(async group => {
        const usersInGroup = await User.find({ groupIds: group._id }, { _id: 1 }).lean()
        const derivedMembers = usersInGroup.map(u => u._id)

        return {
          ...group,
          members: derivedMembers,
          // membersDetails: usersInGroup,
          membersCount: derivedMembers.length
        }
      })
    )

    return {
      status: 'success',
      result: groupsWithMembers,
      message: `Found ${groupsWithMembers.length} groups`
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

    /// Create new group instance (without members array as it's not stored in DB)
    const { members, ...groupDataWithoutMembers } = groupData
    const newGroup = new Group({ ...groupDataWithoutMembers })

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
    if (members && members.length > 0) {
      try {
        // Add group to selected users
        await User.updateMany({ _id: { $in: members } }, { $addToSet: { groupIds: savedGroup._id } })
        console.log(`Updated ${members.length} users with group ID ${savedGroup._id}`)
      } catch (updateError) {
        console.error('Error updating users with group ID:', updateError)
        // Don't fail group creation if user update fails
      }
    }

    return {
      status: 'success',
      result: { ...savedGroup.toObject(), members, membersCount: members.length },
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
        message: 'A group with this name already exists'
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

    // Extract members from update data (they're not stored in the group document)
    const { members, ...groupUpdateData } = updateData

    // Apply updates to the existing group document
    Object.keys(groupUpdateData).forEach(key => {
      if (groupUpdateData[key] !== undefined) {
        existingGroup[key] = groupUpdateData[key]
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

    // Handle member synchronization if members array is provided
    if (members !== undefined) {
      try {
        // Get current users in this group
        const currentUsersInGroup = await User.find({ groupIds: groupId }, { _id: 1 }).lean()
        const currentUserIds = currentUsersInGroup.map(u => u._id.toString())

        // Find users to add and remove
        const usersToAdd = members.filter(userId => !currentUserIds.includes(userId.toString()))
        const usersToRemove = currentUserIds.filter(userId => !members.includes(userId.toString()))

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

    // Get updated members list for response
    const updatedUsersInGroup = await User.find({ groupIds: groupId }, { _id: 1 }).lean()
    const updatedMembers = updatedUsersInGroup.map(u => u._id)

    return {
      status: 'success',
      result: { ...updatedGroup.toObject(), members: updatedMembers },
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
