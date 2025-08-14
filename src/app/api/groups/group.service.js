import connectMongo from '@/utils/dbConnect-mongo'
import mongoose from 'mongoose'
import Group from './group.model.js'
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
    const groups = await Group.find({...filter, isDeleted: false})
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

    // Validate gender if provided
    if (groupData.gender && !['male', 'female', 'other'].includes(groupData.gender)) {
      return {
        status: 'error',
        result: null,
        message: 'Gender must be one of: male, female, other'
      }
    }

    // Validate members array
    if (groupData.members && Array.isArray(groupData.members)) {
      for (const memberId of groupData.members) {
        if (!mongoose.Types.ObjectId.isValid(memberId)) {
          return {
            status: 'error',
            result: null,
            message: `Invalid member ID format: ${memberId}`
          }
        }
      }
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
