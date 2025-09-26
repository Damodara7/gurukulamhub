'use client'
import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import AudienceByFilter from './AudienceByFilter'
import {
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  TextField,
  Typography,
  Snackbar,
  Alert,
  Stack,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'

import UserMultiSelect from './UserMultiSelect'
import { useSession } from 'next-auth/react'
const validateForm = formData => {
  const errors = {}

  // Audience name validation
  if (!formData.audienceName) {
    errors.audienceName = 'Audience name is required'
  } else if (formData.audienceName.trim().length < 3) {
    errors.audienceName = 'Audience name must be at least 3 characters long'
  } else if (formData.audienceName.trim().length > 50) {
    errors.audienceName = 'Audience name must be less than 50 characters'
  } else if (!/^[a-zA-Z0-9\s\-_]+$/.test(formData.audienceName.trim())) {
    errors.audienceName = 'Audience name can only contain letters, numbers, spaces, hyphens, and underscores'
  }

  // Description validation
  if (!formData.description) {
    errors.description = 'Description is required'
  } else if (formData.description.trim().length < 10) {
    errors.description = 'Description must be at least 10 characters long'
  } else if (formData.description.trim().length > 500) {
    errors.description = 'Description must be less than 500 characters'
  }

  return errors
}

const formFieldOrder = ['audienceName', 'description']

const CreateAudienceForm = ({ onSubmit, onCancel, data = null }) => {
  const initialFormData = {
    audienceName: '',
    description: ''
  }
  const { data: session } = useSession()
  const [formData, setFormData] = useState(initialFormData)
  const [loading, setLoading] = useState({
    fetchCities: false,
    submitting: false
  })
  const [errors, setErrors] = useState({})
  const [touches, setTouches] = useState({})
  const [showErrorSnackbar, setShowErrorSnackbar] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [users, setUsers] = useState([])
  const [matchedUserIds, setMatchedUserIds] = useState([])
  // Add this state to track the filter criteria
  const [filterCriteria, setFilterCriteria] = useState({
    ageGroup: null,
    location: null,
    gender: null
  })
  //if edit audience?

  useEffect(() => {
    if (data) {
      console.log('edit mode data', data)
      setFormData({
        ...initialFormData,
        audienceName: data.audienceName || '',
        description: data.description || ''
      })
      // Set initial filter criteria from audience data
      setFilterCriteria({
        ageGroup: data.ageGroup || null,
        location: data.location || null,
        gender: data.gender || null
      })
      // Calculate matched users based on filters if they exist
      if (data.ageGroup || data.location || data.gender) {
        const filteredUserIds = filterUsersByCriteria(users, {
          ageGroup: data.ageGroup,
          location: data.location,
          gender: data.gender
        })
        setMatchedUserIds(filteredUserIds)
      } else {
        // If no filters, show all users initially
        setMatchedUserIds(users.map(user => user._id))
      }
    }
  }, [data, users])
  // Helper function to filter users based on criteria using incremental filtering logic
  const filterUsersByCriteria = (users, criteria) => {
    // Collect all filters with their order and operation
    const filters = []

    if (criteria.ageGroup && criteria.ageGroup.min !== undefined) {
      filters.push({
        type: 'age',
        value: criteria.ageGroup,
        order: criteria.ageGroup.order || 1,
        operation: criteria.ageGroup.operation
      })
    }

    if (criteria.location && (criteria.location.country || criteria.location.region || criteria.location.city)) {
      filters.push({
        type: 'location',
        value: criteria.location,
        order: criteria.location.order || 1,
        operation: criteria.location.operation
      })
    }

    if (criteria.gender && criteria.gender.values && criteria.gender.values.length > 0) {
      filters.push({
        type: 'gender',
        value: criteria.gender.values,
        order: criteria.gender.order || 1,
        operation: criteria.gender.operation
      })
    }

    if (filters.length === 0) {
      return users.map(user => user._id)
    }

    // Sort filters by order
    const sortedFilters = [...filters].sort((a, b) => a.order - b.order)

    console.log(
      '🔍 Frontend INCREMENTAL FILTERING: Applying filters in order:',
      sortedFilters.map(f => ({
        type: f.type,
        order: f.order,
        operation: f.operation
      }))
    )

    let currentUsers = users // Start with all users
    console.log(`🔍 Frontend: Starting with ${currentUsers.length} users`)

    sortedFilters.forEach((filter, index) => {
      console.log(`🔍 Frontend: Step ${index + 1}: Applying ${filter.type} filter (order: ${filter.order})`)
      const filteredUsers = applySingleFilterToUsers(currentUsers, filter)
      console.log(
        `🔍 Frontend: ${filter.type} filter matched ${filteredUsers.length} users from ${currentUsers.length} users`
      )

      if (index === 0) {
        currentUsers = filteredUsers
        console.log(`🔍 Frontend: First filter result: ${currentUsers.length} users`)
      } else {
        const previousFilter = sortedFilters[index - 1]
        const operation = previousFilter.operation
        console.log(`🔍 Frontend: Applying operation "${operation}" between ${previousFilter.type} and ${filter.type}`)

        if (operation === 'AND') {
          currentUsers = currentUsers.filter(user => filteredUsers.some(fu => fu._id === user._id))
          console.log(`🔍 Frontend: AND operation result: ${currentUsers.length} users`)
        } else if (operation === 'OR') {
          // For OR, we need to apply current filter to ALL users, not just currentUsers
          const currentFilterAppliedToAllUsers = applySingleFilterToUsers(users, filter)
          const combinedUserIds = [
            ...new Set([...currentUsers.map(u => u._id), ...currentFilterAppliedToAllUsers.map(u => u._id)])
          ]
          currentUsers = users.filter(user => combinedUserIds.includes(user._id))
          console.log(`🔍 Frontend: OR operation result: ${currentUsers.length} users`)
        } else {
          currentUsers = currentUsers.filter(user => filteredUsers.some(fu => fu._id === user._id))
          console.log(`🔍 Frontend: Default AND operation result: ${currentUsers.length} users`)
        }
      }
    })

    console.log(`🔍 Frontend INCREMENTAL FILTERING: Final result: ${currentUsers.length} users`)
    return currentUsers.map(user => user._id)
  }

  // Helper function to apply a single filter to users (returns user objects)
  const applySingleFilterToUsers = (users, filter) => {
    return users.filter(user => {
      const userAge = user.profile?.age
      const userGender = user.profile?.gender
      const userCountry = user.profile?.country
      const userRegion = user.profile?.region
      const userLocality = user.profile?.locality

      switch (filter.type) {
        case 'age':
          return !filter.value || (userAge && userAge >= filter.value.min && userAge <= filter.value.max)

        case 'location':
          return (
            !filter.value ||
            ((!filter.value.country ||
              (userCountry && userCountry.toLowerCase() === String(filter.value.country).toLowerCase())) &&
              (!filter.value.region ||
                (userRegion && userRegion.toLowerCase() === String(filter.value.region).toLowerCase())) &&
              (!filter.value.city ||
                (userLocality && userLocality.toLowerCase() === String(filter.value.city).toLowerCase())))
          )

        case 'gender':
          return !filter.value || (userGender && filter.value.includes(userGender.toLowerCase()))

        default:
          return false
      }
    })
  }

  //fetching the users
  const fetchUsers = async () => {
    setLoading(true)
    try {
      const result = await RestApi.get(`${API_URLS.v0.USER}`)
      if (result?.status === 'success') {
        setUsers(result.result || [])
        // If no filters applied initially, show all users
        if (!data?.ageGroup && !data?.location && !data?.gender) {
          setMatchedUserIds(result.result?.map(user => user._id) || [])
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('An error occurred while loading users')
      setErrorMessage('Failed to load users')
      setShowErrorSnackbar(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Create refs for each field
  const fieldRefs = {
    audienceName: useRef(),
    description: useRef()
  }

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setTouches(prev => ({ ...prev, [name]: true }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }

    // Handle nested fields
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
    }
  }

  const handleBlur = e => {
    const { name } = e.target
    setTouches(prev => ({ ...prev, [name]: true }))
    validateField(name)
  }

  const validateField = (fieldname, latestFormData = formData) => {
    const fieldErrors = validateForm(latestFormData)
    if (fieldErrors[fieldname]) {
      setErrors(prev => ({
        ...prev,
        [fieldname]: fieldErrors[fieldname]
      }))
    } else {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[fieldname]
        return newErrors
      })
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validate the entire form
    const formErrors = validateForm(formData)
    setErrors(formErrors)

    // Mark all fields as touched
    const touchedFields = {
      audienceName: true,
      description: true
    }
    setTouches(touchedFields)

    if (Object.keys(formErrors).length > 0) {
      // Show first error in snackbar
      let firstError = ''
      let firstErrorField = ''

      for (const field of formFieldOrder) {
        if (formErrors[field]) {
          firstError = formErrors[field]
          firstErrorField = field.split('.')[0] // Handle nested fields
          break
        }
      }

      if (!firstError) firstError = Object.values(formErrors)[0]
      setErrorMessage(firstError)
      setShowErrorSnackbar(true)

      // Scroll to the first errored field
      const refField = firstErrorField === 'location' ? 'country' : firstErrorField
      if (refField && fieldRefs[refField] && fieldRefs[refField].current) {
        fieldRefs[refField].current.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        })
        if (typeof fieldRefs[refField].current.focus === 'function') {
          fieldRefs[refField].current.focus()
        }
      }

      setIsSubmitting(false)
      return
    }

    // Prepare submission data with order and operation for individual schemas
    const submission = {
      _id: data?._id || null, // Include ID for updates
      audienceName: formData.audienceName.trim(),
      description: formData.description.trim(),
      createdBy: data?.createdBy || session?.user?.id || null,
      creatorEmail: data?.creatorEmail || session?.user?.email || null,
      membersCount: matchedUserIds.length
    }

    // Add individual schema filters with order and operation
    if (filterCriteria.ageGroup) {
      submission.ageGroup = {
        ...filterCriteria.ageGroup,
        order: formData.ageOrder || 1,
        operation: formData.ageOperation || null
      }
    }

    if (filterCriteria.location) {
      submission.location = {
        ...filterCriteria.location,
        order: formData.locationOrder || 1,
        operation: formData.locationOperation || null
      }
    }

    if (filterCriteria.gender) {
      console.log('🔍 filterCriteria.gender:', filterCriteria.gender)

      // Check if gender is already an array or an object
      let genderArray
      if (Array.isArray(filterCriteria.gender)) {
        // If it's already an array, check if it contains indexes or names
        if (filterCriteria.gender.some(item => item === '0' || item === '1' || item === '2')) {
          // Convert indexes to gender names
          const genderMap = { 0: 'male', 1: 'female', 2: 'other' }
          genderArray = filterCriteria.gender.map(index => genderMap[index]).filter(Boolean)
        } else {
          // Already contains gender names
          genderArray = filterCriteria.gender
        }
      } else if (filterCriteria.gender && filterCriteria.gender.values && Array.isArray(filterCriteria.gender.values)) {
        // New format with values array
        genderArray = filterCriteria.gender.values
      } else {
        // Convert gender object to array format (old format with boolean properties)
        genderArray = Object.entries(filterCriteria.gender)
          .filter(([, isSelected]) => isSelected)
          .map(([gender]) => gender)
      }

      console.log('🔍 genderArray:', genderArray)

      // Create gender object with values array and metadata
      submission.gender = {
        values: genderArray,
        order: formData.genderOrder || 1,
        operation: formData.genderOperation || null
      }

      console.log('🔍 final gender object:', submission.gender)
    }

    console.log('📤 Submitting audience data:', submission)
    // Removed filters logging - not using filter schema

    try {
      await onSubmit(submission)
    } catch (error) {
      setErrorMessage(error.message || 'Failed to save audience')
      setShowErrorSnackbar(true)
    } finally {
      setIsSubmitting(false)
    }
  }
  // console.log('form data after submission ', formData);
  // Add this to handle filter changes from GroupByFilter
  const handleFilterChange = (filteredUserIds, criteria, orderAndOperations) => {
    console.log('🔄 Filter change received:', {
      filteredUserIds: filteredUserIds.length,
      criteria,
      orderAndOperations
    })

    setFilterCriteria(criteria)
    setMatchedUserIds(filteredUserIds)

    // Store order and operation data for individual schemas
    if (orderAndOperations) {
      setFormData(prev => ({
        ...prev,
        ageOrder: orderAndOperations.ageOrder,
        ageOperation: orderAndOperations.ageOperation,
        locationOrder: orderAndOperations.locationOrder,
        locationOperation: orderAndOperations.locationOperation,
        genderOrder: orderAndOperations.genderOrder,
        genderOperation: orderAndOperations.genderOperation
      }))
    }
  }

  return (
    <Box>
      {/* {!isInline && ( */}
      <Card sx={{ maxWidth: 'lg' }}>
        <CardContent>
          {/* Error Snackbar */}
          <Snackbar
            open={showErrorSnackbar}
            autoHideDuration={6000}
            onClose={() => setShowErrorSnackbar(false)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert onClose={() => setShowErrorSnackbar(false)} severity='error' variant='filled' sx={{ width: '100%' }}>
              {errorMessage}
            </Alert>
          </Snackbar>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Audience Name'
                  name='audienceName'
                  value={formData.audienceName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!errors.audienceName && touches.audienceName}
                  helperText={errors.audienceName}
                  required
                  inputRef={fieldRefs.audienceName}
                  inputProps={{
                    maxLength: 50
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Description (Optional)'
                  name='description'
                  value={formData.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!errors.description && touches.description}
                  helperText={errors.description}
                  multiline
                  rows={3}
                  inputRef={fieldRefs.description}
                  inputProps={{
                    maxLength: 500
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <AudienceByFilter
                  users={users}
                  key={data}
                  onFilterChange={(userIds, criteria, orderAndOperations) =>
                    handleFilterChange(userIds, criteria, orderAndOperations)
                  }
                  initialCriteria={filterCriteria}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography>Audience Members</Typography>
                <UserMultiSelect
                  users={users}
                  matchedUserIds={matchedUserIds}
                  hasFilters={!!(filterCriteria.ageGroup || filterCriteria.location || filterCriteria.gender)}
                />
              </Grid>
              <Grid item xs={12} mt={4}>
                <Stack direction='row' spacing={2} justifyContent='center'>
                  <Button variant='outlined' onClick={onCancel} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    component='label'
                    variant='contained'
                    color='primary'
                    style={{ color: 'white' }}
                    disabled={isSubmitting || matchedUserIds.length === 0}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Audience'}
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  )
}

export default CreateAudienceForm
