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
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import { Group as GroupIcon, People as PeopleIcon } from '@mui/icons-material'

import { useSession } from 'next-auth/react'
import GroupUserMultiSelect from './GroupUserMultiSelect'
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
  const theme = useTheme()
  const initialFormData = {
    groupName: '',
    description: '',
    status: 'private'
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
  console.log('selected user in the creategroup form ', selectedUsers)
  //if edit group?

  useEffect(() => {
    if (data) {
      console.log('edit mode data', data)
      setFormData({
        ...initialFormData,
        groupName: data.groupName || '',
        description: data.description || '',
        status: data.status || 'private',
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
  console.log('selected user in the creategroup after the  useeffect ', selectedUsers)
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
    groupName: useRef(),
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
      status: formData.status,
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

  console.log('selected user in the creategroup form after the handleUserSelection ', selectedUsers)
  return (
    <Box
      sx={{
        minHeight: '100vh',
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
                <GroupIcon sx={{ fontSize: '28px', color: 'white' }} />
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
                {data ? 'Edit Group' : 'Create Group'}
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
                ? 'Update group details and manage members with smart filters'
                : 'Create a new group and organize members with custom criteria'}
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
                  <FormControl fullWidth>
                    <InputLabel id='status-label'>Group Status</InputLabel>
                    <Select
                      labelId='status-label'
                      name='status'
                      value={formData.status}
                      onChange={handleChange}
                      label='Group Status'
                    >
                      <MenuItem value='public'>Public</MenuItem>
                      <MenuItem value='private'>Private</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <GroupByFilter
                    users={users}
                    key={data}
                    onFilterChange={(userIds, criteria) => handleFilterChange(userIds, criteria)}
                    initialCriteria={filterCriteria}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant='subtitle1' gutterBottom sx={{ fontWeight: 600 }}>
                    <PeopleIcon
                      sx={{ fontSize: 20, mr: 1, verticalAlign: 'middle', color: theme.palette.primary.main }}
                    />
                    Group Members
                  </Typography>
                  <GroupUserMultiSelect
                    users={users}
                    selectedUsers={selectedUsers}
                    onSelectChange={handleUserSelection}
                    matchedUserIds={matchedUserIds}
                    unmatchedUserIds={unmatchedUserIds}
                  />
                </Grid>
                <Grid item xs={12} mt={4}>
                  <Stack direction='row' spacing={2} justifyContent='center'>
                    <Button
                      variant='outlined'
                      onClick={onCancel}
                      disabled={isSubmitting}
                      sx={{
                        color: theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.text.primary
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
                      disabled={isSubmitting || selectedUsers.length === 0}
                    >
                      {isSubmitting ? 'Saving...' : data ? 'Update ' : 'Submit'}
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

export default CreateGroupForm
