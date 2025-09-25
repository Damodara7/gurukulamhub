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
  // Helper function to filter users based on criteria
  const filterUsersByCriteria = (users, criteria) => {
    return users
      .filter(user => {
        const profile = user.profile || {}

        // Age filter
        const ageMatch =
          !criteria.ageGroup ||
          (profile.age && profile.age >= criteria.ageGroup.min && profile.age <= criteria.ageGroup.max)

        // Location filter
        const locationMatch =
          !criteria.location ||
          ((!criteria.location.country ||
            (profile.country && profile.country.toLowerCase() === criteria.location.country.toLowerCase())) &&
            (!criteria.location.region ||
              (profile.region && profile.region.toLowerCase() === criteria.location.region.toLowerCase())) &&
            (!criteria.location.city ||
              (profile.locality && profile.locality.toLowerCase() === criteria.location.city.toLowerCase())))

        // Gender filter
        const genderMatch =
          !criteria.gender ||
          (profile.gender &&
            (Array.isArray(criteria.gender)
              ? criteria.gender.includes(profile.gender.toLowerCase())
              : profile.gender.toLowerCase() === criteria.gender.toLowerCase()))

        return ageMatch && locationMatch && genderMatch
      })
      .map(user => user._id)
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

    // Prepare submission data
    const submission = {
      _id: data?._id || null, // Include ID for updates
      audienceName: formData.audienceName.trim(),
      description: formData.description.trim(),
      ...filterCriteria, // Include the current filter criteria (legacy)
      filters: formData.filters || [], // Include structured filters
      createdBy: data?.createdBy || session?.user?.id || null,
      creatorEmail: data?.creatorEmail || session?.user?.email || null,
      membersCount: matchedUserIds.length
    }

    console.log('📤 Submitting audience data:', submission)
    console.log('🔍 Structured filters being sent:', submission.filters)

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
  const handleFilterChange = (filteredUserIds, criteria, structuredFilters) => {
    console.log('🔄 Filter change received:', {
      filteredUserIds: filteredUserIds.length,
      criteria,
      structuredFilters
    })

    setFilterCriteria(criteria)
    setMatchedUserIds(filteredUserIds)
    // Store structured filters for backend
    setFormData(prev => {
      const updated = {
        ...prev,
        filters: structuredFilters || []
      }
      console.log('📝 Updated formData.filters:', updated.filters)
      return updated
    })
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
                  onFilterChange={(userIds, criteria) => handleFilterChange(userIds, criteria)}
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
