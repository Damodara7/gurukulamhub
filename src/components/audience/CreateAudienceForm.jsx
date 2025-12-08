'use client'
import React, { useEffect, useState, useRef } from 'react'
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
  useTheme
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import { People as PeopleIcon, Groups as GroupsIcon } from '@mui/icons-material'

import { useSession } from 'next-auth/react'
import AudienceUserMultiSelect from './AudienceUserMultiSelect'
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
  const theme = useTheme()
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
  const [canonicalFilters, setCanonicalFilters] = useState([])
  //if edit audience?

  useEffect(() => {
    if (data) {
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
      const canonical = buildCanonicalFromAudience(data)
      setCanonicalFilters(canonical)

      if (users.length > 0) {
        if (canonical.length > 0) {
          const matched = applyCanonicalFilters(users, canonical)
          setMatchedUserIds(matched.map(user => user._id))
        } else {
          setMatchedUserIds(users.map(user => user._id))
        }
      }
    }
  }, [data, users])
  // Helper function to filter users based on criteria using incremental filtering logic
  const canonicalFilterHandlers = {
    age: (user, criteria) => {
      const age = user.profile?.age
      if (typeof age !== 'number') return false
      const { min, max } = criteria || {}
      const meetsMin = min === undefined || age >= min
      const meetsMax = max === undefined || age <= max
      return meetsMin && meetsMax
    },
    location: (user, criteria) => {
      const userCountry = user.profile?.country
      const userRegion = user.profile?.region
      const userLocality = user.profile?.locality

      const matchesCountry =
        !criteria?.country ||
        (typeof userCountry === 'string' && userCountry.trim().toLowerCase() === criteria.country.toLowerCase())
      const matchesRegion =
        !criteria?.region ||
        (typeof userRegion === 'string' && userRegion.trim().toLowerCase() === criteria.region.toLowerCase())
      const matchesCity =
        !criteria?.city ||
        (typeof userLocality === 'string' && userLocality.trim().toLowerCase() === criteria.city.toLowerCase())

      return matchesCountry && matchesRegion && matchesCity
    },
    gender: (user, criteria) => {
      const userGender = user.profile?.gender
      if (typeof userGender !== 'string') return false
      const values = Array.isArray(criteria?.values) ? criteria.values : []
      return values.includes(userGender.trim().toLowerCase())
    }
  }

  const dedupeUsersById = usersList => {
    const map = new Map()
    usersList.forEach(user => {
      const id = user._id?.toString()
      if (id && !map.has(id)) {
        map.set(id, user)
      }
    })
    return Array.from(map.values())
  }

  const applyCanonicalFilters = (usersPool, filters = []) => {
    if (!Array.isArray(filters) || filters.length === 0) {
      return usersPool
    }

    const normalizedFilters = filters
      .map((filter, index) => ({
        type: filter.type,
        criteria: filter.criteria || {},
        operator: index === 0 ? null : filter.operator || null
      }))
      .filter(Boolean)

    if (normalizedFilters.length === 0) {
      return usersPool
    }

    let currentUsers = []

    normalizedFilters.forEach((filter, index) => {
      const handler = canonicalFilterHandlers[filter.type]
      if (!handler) {
        return
      }

      const matched = usersPool.filter(user => handler(user, filter.criteria))

      if (index === 0) {
        currentUsers = matched
        return
      }

      const operation = (filter.operator || 'AND').toUpperCase()

      if (operation === 'OR') {
        currentUsers = dedupeUsersById([...currentUsers, ...matched])
      } else {
        const matchedIds = new Set(matched.map(user => user._id?.toString()))
        currentUsers = currentUsers.filter(user => matchedIds.has(user._id?.toString()))
      }
    })

    return dedupeUsersById(currentUsers)
  }

  const buildCanonicalFromAudience = audienceLike => {
    if (Array.isArray(audienceLike?.filters) && audienceLike.filters.length > 0) {
      return audienceLike.filters
    }

    const legacyFilters = []

    if (
      audienceLike?.ageGroup &&
      (audienceLike.ageGroup.min !== undefined || audienceLike.ageGroup.max !== undefined)
    ) {
      legacyFilters.push({
        type: 'age',
        criteria: {
          min: audienceLike.ageGroup.min,
          max: audienceLike.ageGroup.max
        },
        operator: audienceLike.ageGroup.operation || null
      })
    }

    if (
      audienceLike?.location &&
      (audienceLike.location.country || audienceLike.location.region || audienceLike.location.city)
    ) {
      legacyFilters.push({
        type: 'location',
        criteria: {
          country: audienceLike.location.country,
          region: audienceLike.location.region,
          city: audienceLike.location.city
        },
        operator: audienceLike.location.operation || null
      })
    }

    if (audienceLike?.gender) {
      const genderValues = Array.isArray(audienceLike.gender?.values)
        ? audienceLike.gender.values
        : Array.isArray(audienceLike.gender)
          ? audienceLike.gender
          : []

      if (genderValues.length > 0) {
        legacyFilters.push({
          type: 'gender',
          criteria: { values: genderValues },
          operator: audienceLike.gender.operation || null
        })
      }
    }

    return legacyFilters
  }

  //fetching the users
  const fetchUsers = async () => {
    setLoading(true)
    try {
      const result = await RestApi.get(`${API_URLS.v0.USER}?isVerified=true`)
      if (result?.status === 'success') {
        const verifiedUsers = (result.result || []).filter(user => user?.isVerified)
        setUsers(verifiedUsers)
        // If no filters applied initially, show all verified users
        if (!data?.ageGroup && !data?.location && !data?.gender) {
          setMatchedUserIds(verifiedUsers.map(user => user._id))
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

    // Prepare submission data with operation for individual schemas
    const submission = {
      _id: data?._id || null, // Include ID for updates
      audienceName: formData.audienceName.trim(),
      description: formData.description.trim(),
      createdBy: data?.createdBy || session?.user?.id || null,
      creatorEmail: data?.creatorEmail || session?.user?.email || null
    }

    submission.filters = Array.isArray(canonicalFilters) ? canonicalFilters : []

    // Add individual schema filters with operation
    // Handle ageGroup filter
    if (filterCriteria.ageGroup) {
      submission.ageGroup = {
        ...filterCriteria.ageGroup,
        operation: formData.ageOperation || null
      }
    } else {
      // Explicitly set to null when filter is removed
      submission.ageGroup = null
    }

    // Handle location filter
    if (filterCriteria.location) {
      submission.location = {
        ...filterCriteria.location,
        operation: formData.locationOperation || null
      }
    } else {
      // Explicitly set to null when filter is removed
      submission.location = null
    }

    // Handle gender filter
    if (filterCriteria.gender) {
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

      // Create gender object with values array and metadata
      submission.gender = {
        values: genderArray,
        operation: formData.genderOperation || null
      }
    } else {
      // Explicitly set to null when filter is removed
      submission.gender = null
    }

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
  // Add this to handle filter changes from GroupByFilter
  const handleFilterChange = (filteredUserIds, criteria, meta) => {
    // Update filter criteria - this handles both additions and removals
    setFilterCriteria(criteria)
    setMatchedUserIds(filteredUserIds)

    // Store operation data for individual schemas
    if (meta) {
      setFormData(prev => ({
        ...prev,
        ageOperation: meta.ageOperation,
        locationOperation: meta.locationOperation,
        genderOperation: meta.genderOperation
      }))
      setCanonicalFilters(Array.isArray(meta.canonicalFilters) ? meta.canonicalFilters : [])
    } else {
      // If no operationsData, clear all operation data
      setFormData(prev => ({
        ...prev,
        ageOperation: null,
        locationOperation: null,
        genderOperation: null
      }))
      setCanonicalFilters([])
    }
  }

  return (
    <Box
      sx={{
        // minHeight: '100vh',
        background: `radial-gradient(circle at 20% 20%, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 50%),
                     radial-gradient(circle at 80% 80%, ${alpha(
                       theme.palette.secondary.main,
                       0.05
                     )} 0%, transparent 50%),
                     ${theme.palette.background.default}`
      }}
    >
      {/* Elegant Header */}
      <Box
        sx={{
          backdropFilter: 'blur(20px)',
          bgcolor:
            theme.palette.mode === 'dark'
              ? alpha(theme.palette.background.paper, 0.8)
              : alpha(theme.palette.background.paper, 0.7),
          borderBottom: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.12 : 0.08)}`,
          pt: { xs: 4, md: 6 },
          pb: { xs: 4, md: 6 }
        }}
      >
        <Box sx={{ maxWidth: '1200px', margin: '0 auto', px: { xs: 2, sm: 3, md: 4 } }}>
          <Box sx={{ textAlign: 'center' }}>
            {/* Icon and Title */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 2,
                mb: 2
              }}
            >
              <Box
                sx={{
                  width: { xs: 48, sm: 56 },
                  height: { xs: 48, sm: 56 },
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.3)}`
                }}
              >
                <i className='ri-team-line' style={{ fontSize: '28px', color: 'white' }} />
              </Box>
              <Typography
                sx={{
                  fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.5rem' },
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.02em'
                }}
              >
                {data ? 'Edit Audience' : 'Create Audience'}
              </Typography>
            </Box>
            <Typography
              variant='body1'
              color='text.secondary'
              sx={{
                fontSize: '1.05rem',
                lineHeight: 1.8,
                fontWeight: 400,
                maxWidth: '600px',
                mx: 'auto'
              }}
            >
              {data
                ? 'Update audience details and filter criteria to refine your target group'
                : 'Define your target audience with smart filters and custom criteria'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ maxWidth: '1200px', margin: '0 auto', px: { xs: 2, sm: 3, md: 4 }, py: { xs: 3, md: 4 } }}>
        <Card
          sx={{
            borderRadius: 2,
            background: theme.palette.background.paper,
            boxShadow:
              theme.palette.mode === 'dark'
                ? `0 2px 8px ${alpha(theme.palette.common.black, 0.3)}`
                : `0 2px 8px ${alpha(theme.palette.primary.main, 0.08)}`,
            border: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.12 : 0.08)}`,
            overflow: 'hidden',
            '&:hover': {
              boxShadow:
                theme.palette.mode === 'dark'
                  ? `0 4px 16px ${alpha(theme.palette.primary.main, 0.2)}`
                  : `0 4px 16px ${alpha(theme.palette.primary.main, 0.12)}`
            }
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            {/* Error Snackbar */}
            <Snackbar
              open={showErrorSnackbar}
              autoHideDuration={6000}
              onClose={() => setShowErrorSnackbar(false)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
              sx={{
                '& .MuiSnackbar-root': {
                  top: { xs: 90, sm: 0 }
                }
              }}
            >
              <Alert
                onClose={() => setShowErrorSnackbar(false)}
                severity='error'
                variant='filled'
                sx={{
                  width: '100%',
                  animation: 'slideUp 0.5s ease-out',
                  '@keyframes slideUp': {
                    '0%': {
                      transform: 'translateY(100%)',
                      opacity: 0
                    },
                    '100%': {
                      transform: 'translateY(0)',
                      opacity: 1
                    }
                  }
                }}
              >
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
                    key={data?._id || 'create-audience'}
                    onFilterChange={(userIds, criteria, operationsData) =>
                      handleFilterChange(userIds, criteria, operationsData)
                    }
                    initialCriteria={filterCriteria}
                    initialCanonicalFilters={data?.filters || []}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant='subtitle1' gutterBottom sx={{ fontWeight: 600 }}>
                    <GroupsIcon
                      sx={{ fontSize: 20, mr: 1, verticalAlign: 'middle', color: theme.palette.primary.main }}
                    />
                    Audience Members
                  </Typography>
                  <AudienceUserMultiSelect
                    users={users}
                    matchedUserIds={matchedUserIds}
                    hasFilters={!!(filterCriteria.ageGroup || filterCriteria.location || filterCriteria.gender)}
                    filterCriteria={filterCriteria}
                  />
                </Grid>
                <Grid item xs={12} mt={4}>
                  <Stack direction='row' spacing={2} justifyContent='center'>
                    <Button
                      variant='outlined'
                      onClick={onCancel}
                      disabled={isSubmitting}
                      sx={{
                        color: theme.palette.mode === 'dark' ? 'white' : 'inherit',
                        borderColor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.3) : 'inherit',
                        '&:hover': {
                          borderColor:
                            theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.5) : 'inherit',
                          backgroundColor:
                            theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.1) : 'inherit'
                        }
                      }}
                    >
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
                      {isSubmitting ? 'Saving...' : data ? 'Update' : 'Submit'}
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}

export default CreateAudienceForm
