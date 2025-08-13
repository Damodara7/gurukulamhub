import connectMongo from '@/utils/dbConnect-mongo'
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
    const requiredFields = ['groupName', 'description']
    const missingFields = requiredFields.filter(field => !groupData[field])

    if (missingFields.length > 0) {
      return {
        status: 'error',
        result: null,
        message: `Missing required fields: ${missingFields.join(', ')}`
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
