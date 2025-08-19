'use client'
import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import GroupByFilter from './GroupByFilter'
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
  Box
} from '@mui/material'

import UserMultiSelect from './UserMultiSelect'
import { useSession } from 'next-auth/react'
const validateForm = formData => {
  const errors = {}

  // Group name validation
  if (!formData.groupName) {
    errors.groupName = 'Group name is required'
  } else if (formData.groupName.trim().length < 3) {
    errors.groupName = 'Group name must be at least 3 characters long'
  } else if (formData.groupName.trim().length > 50) {
    errors.groupName = 'Group name must be less than 50 characters'
  } else if (!/^[a-zA-Z0-9\s\-_]+$/.test(formData.groupName.trim())) {
    errors.groupName = 'Group name can only contain letters, numbers, spaces, hyphens, and underscores'
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

const formFieldOrder = ['groupName', 'description']

const CreateGroupForm = ({ onSubmit, onCancel, data = null }) => {
  const initialFormData = {
    groupName: '',
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
  const [selectedUsers, setSelectedUsers] = useState([])
  const [matchedUserIds, setMatchedUserIds] = useState([])
  const [unmatchedUserIds, setUnmatchedUserIds] = useState([])
  // Add this state to track the filter criteria
  const [filterCriteria, setFilterCriteria] = useState({
    ageGroup: null,
    location: null,
    gender: null
  })

  //if edit group?

  useEffect(() => {
    if (data) {
      console.log('edit mode data', data)
      setFormData({
        ...initialFormData,
        groupName: data.groupName || '',
        description: data.description || '',
        members: data.members || []
      })

      // Set initial filter criteria from group data
      setFilterCriteria({
        ageGroup: data.ageGroup || null,
        location: data.location || null,
        gender: data.gender || null
      })

      // Set initial selected users
      setSelectedUsers(data.members || [])

      // Calculate matched users based on filters if they exist
      if (data.ageGroup || data.location || data.gender) {
        const filteredUserIds = filterUsersByCriteria(users, {
          ageGroup: data.ageGroup,
          location: data.location,
          gender: data.gender
        })
        setMatchedUserIds(filteredUserIds)
        setUnmatchedUserIds(users.filter(user => !filteredUserIds.includes(user._id)).map(user => user._id))
        // If there were no explicit members saved, default selection to filtered users
        if (!data.members || data.members.length === 0) {
          setSelectedUsers(filteredUserIds)
        }
      } else {
        // If no filters, consider all users as matched
        setMatchedUserIds(users.map(user => user._id))
        setUnmatchedUserIds([])
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
        // In edit mode, preserve existing selection; otherwise preselect all
        setSelectedUsers(prev => (data?.members ? prev : result.result?.map(user => user._id) || []))
        console.log('users data ', result.result)
      }
    } catch (error) {
      console.error('Error fetching games:', error)
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
    groupName: useRef(),
    description: useRef()
  }

  const handleChange = e => {
    const { name, value } = e.target
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
        [name]: value
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
      groupName: true,
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
      groupName: formData.groupName.trim(),
      description: formData.description.trim(),
      ...filterCriteria, // Include the current filter criteria
      createdBy: data?.createdBy || session?.user?.id || null,
      creatorEmail: data?.creatorEmail || session?.user?.email || null,
      members: selectedUsers,
      membersCount: selectedUsers.length
    }

    try {
      await onSubmit(submission)
    } catch (error) {
      setErrorMessage(error.message || 'Failed to save group')
      setShowErrorSnackbar(true)
    } finally {
      setIsSubmitting(false)
    }
  }
  // console.log('form data after submission ', formData);
  // Add this to handle filter changes from GroupByFilter
  const handleFilterChange = (filteredUserIds, criteria) => {
    setSelectedUsers(filteredUserIds)
    setFilterCriteria(criteria)

    // Calculate which users are matched and unmatched
    const allUserIds = users.map(user => user._id)
    const unmatched = allUserIds.filter(id => !filteredUserIds.includes(id))

    setMatchedUserIds(filteredUserIds)
    setUnmatchedUserIds(unmatched)
  }

  const handleUserSelection = newSelectedUsers => {
    setSelectedUsers(newSelectedUsers)
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
                  label='Group Name'
                  name='groupName'
                  value={formData.groupName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!errors.groupName && touches.groupName}
                  helperText={errors.groupName}
                  required
                  inputRef={fieldRefs.groupName}
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
                <GroupByFilter
                  users={users}
                  onFilterChange={(userIds, criteria) => handleFilterChange(userIds, criteria)}
                  initialCriteria={
                    data?.ageGroup || data?.location || data?.gender
                      ? {
                          ageGroup: data?.ageGroup,
                          location: data?.location,
                          gender: data?.gender
                        }
                      : null
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <Typography>Group Members</Typography>
                <UserMultiSelect
                  users={users}
                  selectedUsers={selectedUsers}
                  onSelectChange={handleUserSelection}
                  matchedUserIds={matchedUserIds}
                  unmatchedUserIds={unmatchedUserIds}
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
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Group'}
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
      {/* )} */}
    </Box>
  )
}

export default CreateGroupForm
