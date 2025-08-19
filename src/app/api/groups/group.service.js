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
    const usersInGroup = await User.find({ groupIds: group._id }, { _id: 1 }).lean()
    const derivedMembers = usersInGroup.map(u => u._id)

    return {
      status: 'success',
      result: { ...group, members: derivedMembers, membersCount: derivedMembers.length },
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
    console.log('Found groups:', groups)
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
    const newGroup = new Group({ ...groupData })

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

    // Update all users' groupIds arrays with the new group ID
    if (groupData.members && groupData.members.length > 0) {
      try {
        await User.updateMany({ _id: { $in: groupData.members } }, { $addToSet: { groupIds: savedGroup._id } })
        console.log(`Updated ${groupData.members.length} users with group ID ${savedGroup._id}`)
      } catch (updateError) {
        console.error('Error updating users with group ID:', updateError)
        // Don't fail group creation if user update fails
      }
    }

    return {
      status: 'success',
      result: savedGroup,
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

    // Apply updates to the existing group document
    Object.keys(updateData).forEach(key => {
      existingGroup[key] = updateData[key]
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
      result: updatedGroup,
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
