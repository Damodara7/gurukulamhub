import connectMongo from '@/utils/dbConnect-mongo'
import mongoose from 'mongoose'
import Audience from './audience.model.js'
import User from '@/app/models/user.model.js'
import Game from '../game/game.model.js'
import { broadcastAudiencesList } from '../ws/audiences/publishers.js'
import { broadcastAudienceDetails } from '../ws/audiences/[audienceId]/publishers.js'

const SUPPORTED_OPERATORS = new Set(['AND', 'OR', 'NOT'])

const normalizeOperator = (operator, index) => {
  if (index === 0) {
    return undefined
  }

  if (!operator || typeof operator !== 'string') {
    return 'AND'
  }

  const normalized = operator.trim().toUpperCase()
  return SUPPORTED_OPERATORS.has(normalized) ? normalized : 'AND'
}

const sanitizeCriteriaForType = (type, criteria) => {
  if (criteria === undefined || criteria === null) {
    return undefined
  }

  switch (type) {
    case 'age': {
      const min = typeof criteria.min === 'number' ? criteria.min : undefined
      const max = typeof criteria.max === 'number' ? criteria.max : undefined
      if (min === undefined && max === undefined) {
        return undefined
      }
      return { min, max }
    }

    case 'location': {
      const sanitized = {}
      if (typeof criteria.country === 'string' && criteria.country.trim()) {
        sanitized.country = criteria.country.trim()
      }
      if (typeof criteria.region === 'string' && criteria.region.trim()) {
        sanitized.region = criteria.region.trim()
      }
      if (typeof criteria.city === 'string' && criteria.city.trim()) {
        sanitized.city = criteria.city.trim()
      }
      return Object.keys(sanitized).length > 0 ? sanitized : undefined
    }

    case 'gender': {
      let rawValues = []
      if (Array.isArray(criteria.values)) {
        rawValues = criteria.values
      } else if (Array.isArray(criteria)) {
        rawValues = criteria
      }

      const values = rawValues
        .map(value => (typeof value === 'string' ? value.trim().toLowerCase() : null))
        .filter(Boolean)

      return values.length > 0 ? { values } : undefined
    }

    default:
      return criteria
  }
}

const normalizeFiltersArray = filtersArray => {
  if (!Array.isArray(filtersArray)) {
    return []
  }

  return filtersArray
    .map((filter, index) => {
      if (!filter || !filter.type || filter.criteria === undefined) {
        return null
      }

      const type = String(filter.type).trim().toLowerCase()
      const sanitizedCriteria = sanitizeCriteriaForType(type, filter.criteria)

      if (sanitizedCriteria === undefined) {
        return null
      }

      const order = Number.isFinite(filter.order) ? filter.order : index
      const operator = filter.operator ?? filter.operation

      return {
        type,
        criteria: sanitizedCriteria,
        operator,
        order
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.order - b.order)
    .map((filter, index) => ({
      type: filter.type,
      criteria: filter.criteria,
      operator: normalizeOperator(filter.operator, index)
    }))
}

const normalizeLegacyFilters = audienceLike => {
  if (!audienceLike || typeof audienceLike !== 'object') {
    return []
  }

  const legacyFilters = []

  const { ageGroup, location, gender } = audienceLike

  if (ageGroup && (ageGroup.min !== undefined || ageGroup.max !== undefined)) {
    legacyFilters.push({
      type: 'age',
      criteria: {
        min: ageGroup.min,
        max: ageGroup.max
      },
      operator: ageGroup.operation,
      order: ageGroup.order
    })
  }

  if (location && (location.country || location.region || location.city)) {
    legacyFilters.push({
      type: 'location',
      criteria: {
        country: location.country,
        region: location.region,
        city: location.city
      },
      operator: location.operation,
      order: location.order
    })
  }

  if (gender) {
    let rawGenderValues = []

    if (Array.isArray(gender.values)) {
      rawGenderValues = gender.values
    } else if (Array.isArray(gender)) {
      rawGenderValues = gender
    } else if (typeof gender === 'object' && gender !== null) {
      rawGenderValues = Object.entries(gender)
        .filter(([, isEnabled]) => Boolean(isEnabled))
        .map(([key]) => key)
    }

    const genderValues = rawGenderValues
      .map(value => (typeof value === 'string' ? value.trim().toLowerCase() : null))
      .filter(Boolean)

    if (genderValues.length > 0) {
      legacyFilters.push({
        type: 'gender',
        criteria: { values: genderValues },
        operator: gender.operation,
        order: gender.order
      })
    }
  }

  return normalizeFiltersArray(legacyFilters)
}

const buildCanonicalFilters = audienceLike => {
  const filtersFromArray = normalizeFiltersArray(audienceLike?.filters)
  if (filtersFromArray.length > 0) {
    return filtersFromArray
  }
  return normalizeLegacyFilters(audienceLike)
}

const decorateLegacyFilterFields = audienceLike => {
  if (!audienceLike || typeof audienceLike !== 'object') {
    return audienceLike
  }

  const filters = Array.isArray(audienceLike.filters) ? audienceLike.filters : []

  let ageGroup = null
  let location = null
  let gender = null

  filters.forEach((filter, index) => {
    const order = index + 1
    const operation = index === 0 ? undefined : filter.operator

    switch (filter.type) {
      case 'age':
        ageGroup = {
          ...filter.criteria,
          order,
          operation
        }
        break
      case 'location':
        location = {
          ...filter.criteria,
          order,
          operation
        }
        break
      case 'gender':
        gender = {
          values: Array.isArray(filter.criteria?.values) ? filter.criteria.values : [],
          order,
          operation
        }
        break
      default:
        break
    }
  })

  return {
    ...audienceLike,
    ageGroup,
    location,
    gender
  }
}

const validateCanonicalFilters = filters => {
  const errors = []

  filters.forEach(filter => {
    switch (filter.type) {
      case 'age': {
        const { min, max } = filter.criteria || {}
        if (min === undefined || max === undefined) {
          errors.push('Both minimum and maximum age are required when specifying age group')
          break
        }

        if (min < 0 || max < 0) {
          errors.push('Age values cannot be negative')
        }

        if (min > 120 || max > 120) {
          errors.push('Age values cannot exceed 120 years')
        }

        if (min >= max) {
          errors.push('Minimum age must be less than maximum age')
        }

        if (max - min < 1) {
          errors.push('Age range must be at least 1 year')
        }
        break
      }

      case 'gender': {
        const allowedGenders = ['male', 'female', 'other']
        const values = (filter.criteria?.values || []).map(value =>
          typeof value === 'string' ? value.toLowerCase() : value
        )
        const invalidGenders = values.filter(value => !allowedGenders.includes(value))
        if (invalidGenders.length > 0) {
          errors.push('Gender must be one or more of: male, female, other')
        }
        break
      }

      default:
        break
    }
  })

  return errors
}

// Helper function to apply individual schema filters with order and operations (INCREMENTAL FILTERING)
export const applyIndividualSchemaFilters = (users, audience) => {
  const filters = buildCanonicalFilters(audience)

  if (filters.length === 0) {
    return users
  }

  let currentUsers = users // Start with all users

  filters.forEach((filter, index) => {
    // Apply current filter to current user set
    const filteredUsers = applySingleFilterToUsers(currentUsers, filter)

    if (filteredUsers === null) {
      return
    }

    if (index === 0) {
      // First filter - no operation needed, just update current users
      currentUsers = filteredUsers
    } else {
      // Apply operation from CURRENT filter to combine with previous result
      const operation = (filter.operator || 'AND').toUpperCase()

      if (operation === 'OR') {
        const currentFilterAppliedToAllUsers = applySingleFilterToUsers(users, filter)

        if (currentFilterAppliedToAllUsers === null) {
          return
        }

        const currentUserIds = new Set(currentUsers.map(user => user._id?.toString()))
        const allFilterUserIds = new Set(currentFilterAppliedToAllUsers.map(user => user._id?.toString()))
        const combinedUserIds = new Set([...currentUserIds, ...allFilterUserIds])
        currentUsers = users.filter(user => combinedUserIds.has(user._id?.toString()))
      } else {
        // Default to AND (intersection)
        const filteredUserIds = new Set(filteredUsers.map(user => user._id?.toString()))
        currentUsers = currentUsers.filter(user => filteredUserIds.has(user._id?.toString()))
      }
    }
  })

  return currentUsers
}

// Helper function to filter users by a single filter (returns user objects)
const FILTER_HANDLERS = {
  age: (user, criteria) => {
    const userAge = user.profile?.age
    if (typeof userAge !== 'number') {
      return false
    }

    const { min, max } = criteria
    const meetsMin = min === undefined || userAge >= min
    const meetsMax = max === undefined || userAge <= max
    return meetsMin && meetsMax
  },
  location: (user, criteria) => {
    const userCountry = user.profile?.country
    const userRegion = user.profile?.region
    const userLocality = user.profile?.locality

    const matchesCountry =
      !criteria.country ||
      (typeof userCountry === 'string' && userCountry.trim().toLowerCase() === criteria.country.toLowerCase())
    const matchesRegion =
      !criteria.region ||
      (typeof userRegion === 'string' && userRegion.trim().toLowerCase() === criteria.region.toLowerCase())
    const matchesCity =
      !criteria.city ||
      (typeof userLocality === 'string' && userLocality.trim().toLowerCase() === criteria.city.toLowerCase())

    return matchesCountry && matchesRegion && matchesCity
  },
  gender: (user, criteria) => {
    const userGender = user.profile?.gender
    if (typeof userGender !== 'string') {
      return false
    }
    const selectedGenders = Array.isArray(criteria.values) ? criteria.values : []
    return selectedGenders.includes(userGender.trim().toLowerCase())
  }
}

const applySingleFilterToUsers = (users, filter) => {
  const handler = FILTER_HANDLERS[filter.type]

  if (!handler) {
    return null
  }

  return users.filter(user => handler(user, filter.criteria))
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

    if (!audience) {
      return {
        status: 'error',
        result: null,
        message: 'Audience not found'
      }
    }

    const decoratedAudience = decorateLegacyFilterFields(audience)

    return {
      status: 'success',
      result: decoratedAudience,
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
    const decoratedAudiences = audiences.map(audience => decorateLegacyFilterFields(audience))
    return {
      status: 'success',
      result: decoratedAudiences,
      message: `Found ${decoratedAudiences.length} audiences`
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
    // Get the audience
    const audienceResult = await getOne({ _id: audienceId })

    if (audienceResult.status !== 'success') {
      return audienceResult
    }

    const audience = audienceResult.result

    // Get all verified users only
    const users = await User.find({ isVerified: true }).select('-password').populate('profile').lean()

    // Apply individual schema filters with order and operations
    const filteredUsers = applyIndividualSchemaFilters(users, audience)

    return {
      status: 'success',
      result: filteredUsers,
      message: `Found ${filteredUsers.length} users matching audience criteria`
    }
  } catch (error) {
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

    const canonicalFilters = buildCanonicalFilters(audienceData)
    const requiredFields = ['audienceName', 'description', 'createdBy', 'creatorEmail']
    const missingFields = requiredFields.filter(field => !audienceData[field])

    if (missingFields.length > 0) {
      return {
        status: 'error',
        result: null,
        message: `Missing required fields: ${missingFields.join(', ')}`
      }
    }

    const filterValidationErrors = validateCanonicalFilters(canonicalFilters)
    if (filterValidationErrors.length > 0) {
      return {
        status: 'error',
        result: null,
        message: `Validation failed: ${filterValidationErrors.join(', ')}`
      }
    }

    audienceData.filters = canonicalFilters
    audienceData.ageGroup = undefined
    audienceData.gender = undefined
    audienceData.location = undefined

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

    const responseAudience = decorateLegacyFilterFields(savedAudience.toObject())

    // Broadcast WebSocket event for audience creation
    try {
      broadcastAudiencesListUpdates()
    } catch (wsError) {
      console.error('Error broadcasting audience created event:', wsError)
    }

    return {
      status: 'success',
      result: responseAudience,
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

    const filterKeys = ['filters', 'ageGroup', 'location', 'gender']
    const filtersTouched = filterKeys.some(key => Object.prototype.hasOwnProperty.call(updateData, key))

    const canonicalFilters = filtersTouched
      ? buildCanonicalFilters({
          filters: updateData.filters,
          ageGroup: updateData.ageGroup,
          location: updateData.location,
          gender: updateData.gender
        })
      : buildCanonicalFilters(existingAudience.toObject())

    const filterValidationErrors = validateCanonicalFilters(canonicalFilters)
    if (filterValidationErrors.length > 0) {
      return {
        status: 'error',
        result: null,
        message: `Validation failed: ${filterValidationErrors.join(', ')}`
      }
    }

    // Apply updates to the existing audience document
    Object.keys(updateData).forEach(key => {
      if (['filters', 'ageGroup', 'gender', 'location'].includes(key)) {
        return
      }

      if (updateData[key] !== undefined) {
        existingAudience[key] = updateData[key]
      }
    })

    existingAudience.filters = canonicalFilters
    existingAudience.markModified('filters')
    existingAudience.ageGroup = undefined
    existingAudience.gender = undefined
    existingAudience.location = undefined

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
    const responseAudience = decorateLegacyFilterFields(updatedAudience.toObject())

    // Broadcast WebSocket event for audience update
    try {
      broadcastAudiencesListUpdates()
      broadcastAudienceDetails(audienceId, responseAudience)
    } catch (wsError) {
      console.error('Error broadcasting audience updated event:', wsError)
    }

    return {
      status: 'success',
      result: responseAudience,
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
