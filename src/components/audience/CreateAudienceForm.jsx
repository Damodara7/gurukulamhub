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

const CreateAudienceForm = ({ onSubmit, onCancel, data = null, showHeading = true }) => {
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
  const [canonicalFilters, setCanonicalFilters] = useState([])

  useEffect(() => {
    if (data) {
      setFormData({
        ...initialFormData,
        audienceName: data.audienceName || '',
        description: data.description || ''
      })
      // Set canonical filters from audience data (backend already converts legacy to canonical)
      const filters = Array.isArray(data.filters) ? data.filters : []
      setCanonicalFilters(filters)

      if (users.length > 0) {
        if (filters.length > 0) {
          const matched = applyCanonicalFilters(users, filters)
          setMatchedUserIds(matched.map(user => user._id))
        } else {
          setMatchedUserIds(users.map(user => user._id))
        }
      }
    } else {
      // Reset filters when in create mode
      setCanonicalFilters([])
      if (users.length > 0) {
        setMatchedUserIds(users.map(user => user._id))
      }
    }
  }, [data, users])
  // Helper function to filter users based on criteria using incremental filtering logic
  const canonicalFilterHandlers = {
    age: (user, criteria) => {
      const age = user.profile?.age
      if (typeof age !== 'number') return false
      const { min, max } = criteria || {}
      // Require both min and max to be defined (matching backend validation)
      if (min === undefined || max === undefined) {
        return false
      }
      const meetsMin = age >= min
      const meetsMax = age <= max
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

      // Apply filter to current user set (for AND and NOT operations)
      const matched = usersPool.filter(user => handler(user, filter.criteria))

      if (index === 0) {
        currentUsers = matched
        return
      }

      const operation = (filter.operator || 'AND').toUpperCase()

      if (operation === 'OR') {
        // OR operation: Apply current filter to ALL users first, then union with current results
        // This matches the backend logic for consistency
        const currentFilterAppliedToAllUsers = usersPool.filter(user => handler(user, filter.criteria))
        const currentUserIds = new Set(currentUsers.map(user => user._id?.toString()))
        const allFilterUserIds = new Set(currentFilterAppliedToAllUsers.map(user => user._id?.toString()))
        const combinedUserIds = new Set([...currentUserIds, ...allFilterUserIds])
        currentUsers = usersPool.filter(user => combinedUserIds.has(user._id?.toString()))
      } else if (operation === 'NOT') {
        // NOT operation: exclude users that match the filter from current set
        const matchedIds = new Set(matched.map(user => user._id?.toString()))
        currentUsers = currentUsers.filter(user => !matchedIds.has(user._id?.toString()))
      } else {
        // Default to AND (intersection)
        const matchedIds = new Set(matched.map(user => user._id?.toString()))
        currentUsers = currentUsers.filter(user => matchedIds.has(user._id?.toString()))
      }
    })

    return dedupeUsersById(currentUsers)
  }

  // Convert canonical filters to legacy format for display purposes only
  const convertCanonicalToLegacyFormat = filters => {
    if (!Array.isArray(filters) || filters.length === 0) {
      return {
        ageGroup: null,
        location: null,
        gender: null
      }
    }

    let ageGroup = null
    let location = null
    let gender = null

    filters.forEach((filter, index) => {
      const operation = index === 0 ? undefined : filter.operator

      switch (filter.type) {
        case 'age':
          ageGroup = {
            ...filter.criteria,
            operation
          }
          break
        case 'location':
          location = {
            ...filter.criteria,
            operation
          }
          break
        case 'gender':
          gender = {
            values: Array.isArray(filter.criteria?.values) ? filter.criteria.values : [],
            operation
          }
          break
        default:
          break
      }
    })

    return {
      ageGroup,
      location,
      gender
    }
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
        if (!data || !data.filters || data.filters.length === 0) {
          setMatchedUserIds(verifiedUsers.map(user => user._id))
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error)
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

    try {
      await onSubmit(submission)
    } catch (error) {
      setErrorMessage(error.message || 'Failed to save audience')
      setShowErrorSnackbar(true)
    } finally {
      setIsSubmitting(false)
    }
  }
  // Handle filter changes from AudienceByFilter
  const handleFilterChange = (filteredUserIds, criteria, meta) => {
    setMatchedUserIds(filteredUserIds)
    // Update canonical filters from meta data
    if (meta && Array.isArray(meta.canonicalFilters)) {
      setCanonicalFilters(meta.canonicalFilters)
    } else {
      setCanonicalFilters([])
    }
  }

  const isDarkMode = theme.palette.mode === 'dark'

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        background: `radial-gradient(circle at 20% 20%, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 50%),
                     radial-gradient(circle at 80% 80%, ${alpha(
                       theme.palette.secondary.main,
                       0.05
                     )} 0%, transparent 50%),
                     ${theme.palette.background.default}`,
        overflow: 'hidden'
      }}
    >
      {/* Elegant Header */}
      {showHeading && (
        <Box
          sx={{
            backdropFilter: 'blur(20px)',
            bgcolor:
              theme.palette.mode === 'dark'
                ? alpha(theme.palette.background.paper, 0.8)
                : alpha(theme.palette.background.paper, 0.7),
            borderBottom: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.12 : 0.08)}`,
            pt: { xs: 3, sm: 4, md: 5 },
            pb: { xs: 3, sm: 4, md: 5 },
            flexShrink: 0
          }}
        >
          <Box sx={{ maxWidth: '1200px', margin: '0 auto', px: { xs: 2, sm: 3, md: 4 } }}>
            <Box sx={{ textAlign: 'center' }}>
              {/* Icon and Title */}
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1.5,
                  mb: 1
                }}
              >
                <Box
                  sx={{
                    width: { xs: 36, sm: 40, md: 44 },
                    height: { xs: 36, sm: 40, md: 44 },
                    borderRadius: '10px',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.3)}`
                  }}
                >
                  <i className='ri-team-line' style={{ fontSize: '20px', color: 'white' }} />
                </Box>
                <Typography
                  sx={{
                    fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
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
                variant='body2'
                color='text.secondary'
                sx={{
                  fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
                  lineHeight: 1.6,
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
      )}

      {/* Main Content - Scrollable */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          pt: { xs: 2, sm: 3, md: 3 },
          pb: { xs: 3, sm: 4, md: 4 },
          px: { xs: 2, sm: 3, md: 4 },
          minHeight: 0,
          maxHeight: '100%',
          WebkitOverflowScrolling: 'touch',
          scrollbarGutter: 'stable',
          // Custom scrollbar styling for better appearance
          '&::-webkit-scrollbar': {
            width: '10px'
          },
          '&::-webkit-scrollbar-track': {
            background: isDarkMode ? alpha(theme.palette.common.black, 0.1) : alpha(theme.palette.common.black, 0.05),
            borderRadius: '5px',
            margin: '8px 0'
          },
          '&::-webkit-scrollbar-thumb': {
            background: isDarkMode ? alpha(theme.palette.common.white, 0.3) : alpha(theme.palette.primary.main, 0.3),
            borderRadius: '5px',
            border: `2px solid ${isDarkMode ? 'transparent' : alpha(theme.palette.background.default, 0.1)}`,
            '&:hover': {
              background: isDarkMode ? alpha(theme.palette.common.white, 0.5) : alpha(theme.palette.primary.main, 0.5)
            }
          },
          // Firefox scrollbar
          scrollbarWidth: 'thin',
          scrollbarColor: isDarkMode
            ? `${alpha(theme.palette.common.white, 0.3)} ${alpha(theme.palette.common.black, 0.1)}`
            : `${alpha(theme.palette.primary.main, 0.3)} ${alpha(theme.palette.common.black, 0.05)}`
        }}
      >
        <Card
          sx={{
            borderRadius: 2,
            background: theme.palette.background.paper,
            boxShadow:
              theme.palette.mode === 'dark'
                ? `0 2px 8px ${alpha(theme.palette.common.black, 0.3)}`
                : `0 2px 8px ${alpha(theme.palette.primary.main, 0.08)}`,
            border: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.12 : 0.08)}`,
            width: '100%',
            boxSizing: 'border-box',
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
              <Grid container spacing={3} sx={{ pb: 2 }}>
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
                    initialCriteria={{
                      ageGroup: null,
                      location: null,
                      gender: null
                    }}
                    initialCanonicalFilters={canonicalFilters}
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
                    hasFilters={canonicalFilters.length > 0}
                    filterCriteria={convertCanonicalToLegacyFormat(canonicalFilters)}
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
