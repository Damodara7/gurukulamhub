import connectMongo from '@/utils/dbConnect-mongo'
import mongoose from 'mongoose'
import Audience from './audience.model.js'
import User from '@/app/models/user.model.js'
import Game from '../game/game.model.js'
import { broadcastAudiencesList } from '../ws/audiences/publishers.js'
import { broadcastAudienceDetails } from '../ws/audiences/[audienceId]/publishers.js'

// Helper function to apply individual schema filters with order and operations (INCREMENTAL FILTERING)
export const applyIndividualSchemaFilters = (users, audience) => {
  // Collect all filters with their order and operation
  const filters = []

  if (audience.ageGroup && audience.ageGroup.min !== undefined) {
    filters.push({
      type: 'age',
      value: audience.ageGroup,
      order: audience.ageGroup.order || 1,
      operation: audience.ageGroup.operation
    })
  }

  if (audience.location && (audience.location.country || audience.location.region || audience.location.city)) {
    filters.push({
      type: 'location',
      value: audience.location,
      order: audience.location.order || 1,
      operation: audience.location.operation
    })
  }

  if (audience.gender && audience.gender.values && audience.gender.values.length > 0) {
    filters.push({
      type: 'gender',
      value: audience.gender.values,
      order: audience.gender.order || 1,
      operation: audience.gender.operation
    })
  }

  if (filters.length === 0) {
    return users
  }

  // Sort filters by order
  const sortedFilters = [...filters].sort((a, b) => a.order - b.order)

  console.log(
    '🔍 INCREMENTAL FILTERING: Applying filters in order:',
    sortedFilters.map(f => ({
      type: f.type,
      order: f.order,
      operation: f.operation
    }))
  )

  let currentUsers = users // Start with all users
  console.log(`🔍 Starting with ${currentUsers.length} users`)

  sortedFilters.forEach((filter, index) => {
    console.log(`🔍 Step ${index + 1}: Applying ${filter.type} filter (order: ${filter.order})`)

    // Apply current filter to current user set
    const filteredUsers = applySingleFilterToUsers(currentUsers, filter)
    console.log(`🔍 ${filter.type} filter matched ${filteredUsers.length} users from ${currentUsers.length} users`)

    if (index === 0) {
      // First filter - no operation needed, just update current users
      currentUsers = filteredUsers
      console.log(`🔍 First filter result: ${currentUsers.length} users`)
    } else {
      // Apply operation from CURRENT filter to combine with previous result
      const operation = filter.operation

      console.log(`🔍 Applying operation "${operation}" to combine ${filter.type} with previous results`)

      if (operation === 'AND') {
        // OPTIMIZED: Intersection using pre-computed filter results
        const filteredUserIds = new Set(filteredUsers.map(u => u._id))
        currentUsers = currentUsers.filter(user => filteredUserIds.has(user._id))
        console.log(`🔍 OPTIMIZED AND operation result: ${currentUsers.length} users`)
      } else if (operation === 'OR') {
        // OPTIMIZED: Union using pre-computed filter results
        // Apply current filter to ALL users only once, then use Set operations
        const currentFilterAppliedToAllUsers = applySingleFilterToUsers(users, filter)
        const currentUserIds = new Set(currentUsers.map(u => u._id))
        const allFilterUserIds = new Set(currentFilterAppliedToAllUsers.map(u => u._id))
        const combinedUserIds = new Set([...currentUserIds, ...allFilterUserIds])
        currentUsers = users.filter(user => combinedUserIds.has(user._id))
        console.log(`🔍 OPTIMIZED OR operation result: ${currentUsers.length} users`)
      } else {
        // No operation specified, default to AND
        const filteredUserIds = new Set(filteredUsers.map(u => u._id))
        currentUsers = currentUsers.filter(user => filteredUserIds.has(user._id))
        console.log(`🔍 OPTIMIZED Default AND operation result: ${currentUsers.length} users`)
      }
    }
  })

  console.log(`🔍 INCREMENTAL FILTERING: Final result: ${currentUsers.length} users`)
  return currentUsers
}

// Helper function to filter users by a single filter (returns user objects)
const applySingleFilterToUsers = (users, filter) => {
  return users.filter(user => {
    const userAge = user.profile?.age
    const userGender = user.profile?.gender
    const userCountry = user.profile?.country
    const userRegion = user.profile?.region
    const userLocality = user.profile?.locality

    switch (filter.type) {
      case 'age':
        const ageGroup = filter.value
        return userAge && userAge >= ageGroup.min && userAge <= ageGroup.max

      case 'location':
        const location = filter.value
        return (
          (!location.country || (userCountry && userCountry.toLowerCase() === location.country.toLowerCase())) &&
          (!location.region || (userRegion && userRegion.toLowerCase() === location.region.toLowerCase())) &&
          (!location.city || (userLocality && userLocality.toLowerCase() === location.city.toLowerCase()))
        )

      case 'gender':
        // filter.value is now an array like ['male', 'female']
        const selectedGenders = Array.isArray(filter.value) ? filter.value : [filter.value]
        return userGender && selectedGenders.includes(userGender.toLowerCase())

      default:
        return false
    }
  })
}

export const getOne = async (filter = {}) => {
  await connectMongo()
  try {
    if (filter._id && !mongoose.Types.ObjectId.isValid(filter._id)) {
      return {
        status: 'error',
        result: null,
        message: 'Invalid audience ID format'
      }
    }

    const audience = await Audience.findOne({ ...filter, isDeleted: false }).lean()
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

// New function to get filtered users for an audience
export const getFilteredUsers = async audienceId => {
  await connectMongo()
  try {
    console.log('getFilteredUsers called with audienceId:', audienceId)

    // Get the audience
    const audienceResult = await getOne({ _id: audienceId })
    console.log('Audience result:', audienceResult)

    if (audienceResult.status !== 'success') {
      return audienceResult
    }

    const audience = audienceResult.result
    console.log('Audience data:', audience)

    // Get all verified users only
    const users = await User.find({ isVerified: true }).select('-password').populate('profile').lean()
    console.log('Total verified users found:', users.length)

    // Apply individual schema filters with order and operations
    const filteredUsers = applyIndividualSchemaFilters(users, audience)

    console.log('Final filtered users count:', filteredUsers.length)
    return {
      status: 'success',
      result: filteredUsers,
      message: `Found ${filteredUsers.length} users matching audience criteria`
    }
  } catch (error) {
    console.error('Error in getFilteredUsers:', error)
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to get filtered users'
    }
  }
}

export const addOne = async audienceData => {
  await connectMongo()
  try {
    const user = await User.findOne({ email: audienceData.creatorEmail, isVerified: true })
    audienceData.createdBy = user._id
    // Validate required fields
    console.log('📝 Creating audience with data:', audienceData)
    console.log('🔍 Structured filters:', audienceData.filters)
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
        // Check if it's the new structure with values array
        if (audienceData.gender.values && Array.isArray(audienceData.gender.values)) {
          gendersArray = audienceData.gender.values
        } else {
          // Handle old structure with boolean values
          gendersArray = Object.entries(audienceData.gender)
            .filter(([, isOn]) => Boolean(isOn))
            .map(([key]) => key)
        }
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

      // Keep the original structure if it has values, order, operation
      if (typeof audienceData.gender === 'object' && audienceData.gender.values) {
        // Already in correct format, no need to change
      } else {
        // Normalize to array for the model schema which expects [String]
        audienceData.gender = gendersArray
      }
    }

    // Create new audience instance
    console.log('🔍 About to create audience with data:', JSON.stringify(audienceData, null, 2))
    const newAudience = new Audience(audienceData)
    console.log('🔍 Audience instance created:', JSON.stringify(newAudience.toObject(), null, 2))

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
    console.log('💾 Saved audience:', JSON.stringify(savedAudience.toObject(), null, 2))

    // Broadcast WebSocket event for audience creation
    try {
      broadcastAudiencesListUpdates()
    } catch (wsError) {
      console.error('Error broadcasting audience created event:', wsError)
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

    // Broadcast WebSocket event for audience update
    try {
      broadcastAudiencesListUpdates()
      broadcastAudienceDetails(audienceId, updatedAudience.toObject())
    } catch (wsError) {
      console.error('Error broadcasting audience updated event:', wsError)
    }

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
    // Find the existing audience by ID and ensure it's not already deleted
    const existingAudience = await Audience.findOne({ _id: audienceId, isDeleted: false })

    if (!existingAudience) {
      return {
        status: 'error',
        result: null,
        message: 'Audience not found or already deleted'
      }
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

    // Broadcast WebSocket event for audience deletion
    try {
      broadcastAudiencesListUpdates()
    } catch (wsError) {
      console.error('Error broadcasting audience deleted event:', wsError)
    }

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

    // Remove audienceId from all games that reference this audience
    try {
      await Game.updateMany({ audienceId: audienceId }, { $unset: { audienceId: 1 } })
      console.log(`Removed audienceId ${audienceId} from all games`)
    } catch (gameUpdateError) {
      console.error('Error removing audienceId from games:', gameUpdateError)
      // Continue with audience deletion even if game update fails
    }

    // Permanently delete the audience
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

// Function to restore a soft-deleted audience
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

export async function broadcastAudiencesListUpdates() {
  try {
    const audiencesRes = await getAll()
    if (audiencesRes.status === 'success') {
      broadcastAudiencesList(audiencesRes.result)
    }
  } catch (error) {
    console.error('Error broadcasting audiences list updates:', error)
  }
}
