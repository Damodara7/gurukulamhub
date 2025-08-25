import connectMongo from '@/utils/dbConnect-mongo'
import mongoose from 'mongoose'
import Audience from './audience.model.js'
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

    const audience = await Audience.findOne({ ...filter, isDeleted: false })
      .lean()
      .populate({
        path: 'members',
        populate: {
          path: 'profile'
        }
      })
    console.log('filter', filter)

    if (!audience) {
      return {
        status: 'error',
        result: null,
        message: 'Audience not found'
      }
    }

    return {
      status: 'success',
      result: audience,
      message: 'Audience retrieved successfully'
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to retrieve audience'
    }
  }
}

export const getAll = async (filter = {}) => {
  await connectMongo()
  try {
    const audiences = await Audience.find({ ...filter, isDeleted: false })
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
      result: audiences,
      message: `Found ${audiences.length} audiences`
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to retrieve audiences'
    }
  }
}

export const addOne = async audienceData => {
  await connectMongo()
  try {
    const user = await User.findOne({ email: audienceData.creatorEmail })
    audienceData.createdBy = user._id
    // Validate required fields
    console.log('audienceData', audienceData)
    const requiredFields = ['audienceName', 'description', 'createdBy', 'creatorEmail']
    const missingFields = requiredFields.filter(field => !audienceData[field])

    if (missingFields.length > 0) {
      return {
        status: 'error',
        result: null,
        message: `Missing required fields: ${missingFields.join(', ')}`
      }
    }

    // Validate age group if provided
    if (audienceData.ageGroup) {
      const { min, max } = audienceData.ageGroup
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
    if (audienceData.gender) {
      const allowedGenders = ['male', 'female', 'other']
      let gendersArray
      if (Array.isArray(audienceData.gender)) {
        gendersArray = audienceData.gender
      } else if (typeof audienceData.gender === 'object' && audienceData.gender !== null) {
        gendersArray = Object.entries(audienceData.gender)
          .filter(([, isOn]) => Boolean(isOn))
          .map(([key]) => key)
      } else {
        gendersArray = [audienceData.gender]
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
      audienceData.gender = gendersArray
    }

    // Create new audience instance
    const newAudience = new Audience(audienceData)

    // Validate the audience
    const validationError = newAudience.validateSync()
    if (validationError) {
      const errors = Object.values(validationError.errors).map(err => err.message)
      return {
        status: 'error',
        result: null,
        message: `Validation failed: ${errors.join(', ')}`
      }
    }

    const savedAudience = await newAudience.save()

    // Update all selected users' audienceIds arrays with the new audience ID
    if (audienceData.members && audienceData.members.length > 0) {
      try {
        // Add audience to selected users
        await User.updateMany({ _id: { $in: audienceData.members } }, { $addToSet: { audienceIds: savedAudience._id } })
        console.log(`Updated ${audienceData.members.length} users with audience ID ${savedAudience._id}`)
      } catch (updateError) {
        console.error('Error updating users with audience ID:', updateError)
        // Don't fail audience creation if user update fails
      }
    }

    return {
      status: 'success',
      result: savedAudience.toObject(),
      message: 'Audience created successfully'
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
        message: 'An audience with this name already exists'
      }
    }

    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to create audience'
    }
  }
}

export const updateOne = async (audienceId, updateData) => {
  await connectMongo()
  try {
    // Find the existing audience by ID
    const existingAudience = await Audience.findOne({ _id: audienceId, isDeleted: false })
    if (!existingAudience) {
      return {
        status: 'error',
        result: null,
        message: 'Audience not found'
      }
    }

    // Handle member synchronization if members array is provided
    if (updateData.members !== undefined) {
      try {
        // Get current users in this group
        const currentUsersInAudience = await User.find({ audienceIds: audienceId }, { _id: 1 }).lean()
        const currentUserIds = currentUsersInAudience.map(u => u._id.toString())

        // Find users to add and remove
        const usersToAdd = updateData.members.filter(userId => !currentUserIds.includes(userId.toString()))
        const usersToRemove = currentUserIds.filter(userId => !updateData.members.includes(userId.toString()))

        // Add audience to new users
        if (usersToAdd.length > 0) {
          await User.updateMany({ _id: { $in: usersToAdd } }, { $addToSet: { audienceIds: audienceId } })
          console.log(`Added audience to ${usersToAdd.length} users`)
        }

        // Remove audience from users who are no longer members
        if (usersToRemove.length > 0) {
          await User.updateMany({ _id: { $in: usersToRemove } }, { $pull: { audienceIds: audienceId } })
          console.log(`Removed audience from ${usersToRemove.length} users`)
        }
      } catch (memberUpdateError) {
        console.error('Error updating audience members:', memberUpdateError)
        // Don't fail the audience update if member synchronization fails
      }
    }

    // Apply updates to the existing audience document
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        existingAudience[key] = updateData[key]
      }
    })

    // Validate the updated audience document
    const validationError = existingAudience.validateSync()
    if (validationError) {
      const errors = Object.values(validationError.errors).map(err => err.message)
      return {
        status: 'error',
        result: null,
        message: `Validation failed: ${errors.join(', ')}`
      }
    }

    // Save the updated audience
    const updatedAudience = await existingAudience.save()

    return {
      status: 'success',
      result: updatedAudience.toObject(),
      message: 'Audience updated successfully'
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to update audience'
    }
  }
}

export const deleteOne = async audienceId => {
  await connectMongo()
  try {
    // Find the existing group by ID and ensure it's not already deleted
    const existingAudience = await Audience.findOne({ _id: audienceId, isDeleted: false })

    if (!existingAudience) {
      return {
        status: 'error',
        result: null,
        message: 'Audience not found or already deleted'
      }
    }

    // Remove audience from all users before soft delete
    try {
      await User.updateMany({ audienceIds: audienceId }, { $pull: { audienceIds: audienceId } })
      console.log(`Removed audience ${audienceId} from all users`)
    } catch (userUpdateError) {
      console.error('Error removing audience from users:', userUpdateError)
      // Continue with audience deletion even if user update fails
    }

    // Remove audienceId from all games that reference this audience
    try {
      await Game.updateMany({ audienceId: audienceId }, { $unset: { audienceId: 1 } })
      console.log(`Removed audienceId ${audienceId} from all games`)
    } catch (gameUpdateError) {
      console.error('Error removing audienceId from games:', gameUpdateError)
      // Continue with audience deletion even if game update fails
    }

    // Perform soft delete
    existingAudience.isDeleted = true
    existingAudience.deletedAt = new Date()

    // Save the updated audience
    const deletedAudience = await existingAudience.save()

    return {
      status: 'success',
      result: deletedAudience,
      message: 'Audience soft deleted successfully'
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to delete audience'
    }
  }
}

// Function to permanently delete a audience and clean up all references
export const hardDeleteOne = async audienceId => {
  await connectMongo()
  try {
    // Find the existing audience by ID
    const existingAudience = await Audience.findOne({ _id: audienceId })

    if (!existingAudience) {
      return {
        status: 'error',
        result: null,
        message: 'Audience not found'
      }
    }

    // Remove audience from all users
    try {
      await User.updateMany({ audienceIds: audienceId }, { $pull: { audienceIds: audienceId } })
      console.log(`Removed audience ${audienceId} from all users`)
    } catch (userUpdateError) {
      console.error('Error removing audience from users:', userUpdateError)
      // Continue with audience deletion even if user update fails
    }

    // Remove audienceId from all games that reference this audience
    try {
      await Game.updateMany({ audienceId: audienceId }, { $unset: { audienceId: 1 } })
      console.log(`Removed audienceId ${audienceId} from all games`)
    } catch (gameUpdateError) {
      console.error('Error removing audienceId from games:', gameUpdateError)
      // Continue with audience deletion even if game update fails
    }

    // Permanently delete the group
    await Audience.deleteOne({ _id: audienceId })

    return {
      status: 'success',
      result: null,
      message: 'Audience permanently deleted and all references cleaned up'
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to permanently delete audience'
    }
  }
}

// Function to restore a soft-deleted group
export const restoreOne = async audienceId => {
  await connectMongo()
  try {
    // Find the soft-deleted audience by ID
    const existingAudience = await Audience.findOne({ _id: audienceId, isDeleted: true })

    if (!existingAudience) {
      return {
        status: 'error',
        result: null,
        message: 'Soft-deleted audience not found'
      }
    }

    // Restore the audience
    existingAudience.isDeleted = false
    existingAudience.deletedAt = undefined

    // Save the updated audience
    const restoredAudience = await existingAudience.save()

    return {
      status: 'success',
      result: restoredAudience,
      message: 'Audience restored successfully'
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to restore audience'
    }
  }
}
