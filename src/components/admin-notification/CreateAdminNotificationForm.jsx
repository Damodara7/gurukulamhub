'use client'

import React, { useState, useRef, useEffect } from 'react'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import AudienceByFilter from '@/components/audience/AudienceByFilter'
import AudienceUserMultiSelect from '@/components/audience/AudienceUserMultiSelect'
import {
  Button,
  Card,
  CardContent,
  Collapse,
  FormControlLabel,
  Grid,
  IconButton,
  Switch,
  TextField,
  Typography,
  Snackbar,
  Alert,
  Stack,
  Box,
  useTheme
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import {
  ExpandLess,
  ExpandMore,
  NotificationsActive as NotificationIcon,
  FilterList as FilterListIcon,
  People as PeopleIcon
} from '@mui/icons-material'

const validateForm = formData => {
  const errors = {}
  if (!formData.title?.trim()) {
    errors.title = 'Title is required'
  } else if (formData.title.trim().length < 3) {
    errors.title = 'Title must be at least 3 characters'
  } else if (formData.title.trim().length > 120) {
    errors.title = 'Title must be less than 120 characters'
  }
  if (!formData.message?.trim()) {
    errors.message = 'Message is required'
  } else if (formData.message.trim().length < 10) {
    errors.message = 'Message must be at least 10 characters'
  } else if (formData.message.trim().length > 1000) {
    errors.message = 'Message must be less than 1000 characters'
  }
  return errors
}

const CreateAdminNotificationForm = ({
  onSubmit,
  onCancel,
  showHeader = true,
  editMode = false,
  adminNotificationId = null,
  initialData = null
}) => {
  const theme = useTheme()
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    actionUrl: '',
    actionLabel: '',
    includeForNewUsers: false
  })
  const [errors, setErrors] = useState({})
  const [touches, setTouches] = useState({})
  const [showErrorSnackbar, setShowErrorSnackbar] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(true)
  const [users, setUsers] = useState([])
  const [canonicalFilters, setCanonicalFilters] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const fieldRefs = { title: useRef(), message: useRef() }

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true)
      try {
        const result = await RestApi.get(`${API_URLS.v0.USER}?isVerified=true`)
        if (result?.status === 'success') {
          const userList = result.result || []
          setUsers(userList)
          const allIds = userList.map(u => u._id).filter(Boolean)
          setSelectedUsers(allIds)
        }
      } catch (error) {
        console.error('Error fetching users:', error)
        setErrorMessage('Failed to load users')
        setShowErrorSnackbar(true)
      } finally {
        setLoadingUsers(false)
      }
    }
    fetchUsers()
  }, [])

  useEffect(() => {
    if (editMode && initialData) {
      setFormData({
        title: initialData.title || '',
        message: initialData.message || '',
        actionUrl: initialData.actionUrl || '',
        actionLabel: initialData.actionLabel || '',
        includeForNewUsers: initialData.includeForNewUsers === true || initialData.includeForNewUsers === 'true'
      })
      setCanonicalFilters(Array.isArray(initialData.filters) ? initialData.filters : [])
      if (users.length > 0 && Array.isArray(initialData.recipientUserIds) && initialData.recipientUserIds.length > 0) {
        const allIds = users.map(u => u._id).filter(Boolean)
        const validIds = initialData.recipientUserIds.filter(id =>
          allIds.some(uid => String(uid) === String(id))
        )
        setSelectedUsers(validIds.length > 0 ? validIds : allIds)
      }
    }
  }, [editMode, initialData, users.length])

  const handleFilterChange = (filteredUserIds, _criteria, operationsData = {}) => {
    setSelectedUsers(filteredUserIds)
    setCanonicalFilters(operationsData?.canonicalFilters || [])
  }

  const convertCanonicalToLegacyFormat = filters => {
    if (!Array.isArray(filters) || filters.length === 0) {
      return { ageGroup: null, location: null, gender: null }
    }
    let ageGroup = null
    let location = null
    let gender = null
    filters.forEach((filter, index) => {
      const operation = index === 0 ? undefined : filter.operator
      switch (filter.type) {
        case 'age':
          ageGroup = { ...filter.criteria, operation }
          break
        case 'location':
          location = { ...filter.criteria, operation }
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
    return { ageGroup, location, gender }
  }


  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setTouches(prev => ({ ...prev, [name]: true }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }))
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? !!checked : value }))
  }

  const handleBlur = e => {
    const { name } = e.target
    setTouches(prev => ({ ...prev, [name]: true }))
    const fieldErrors = validateForm({ ...formData, [name]: formData[name] })
    if (fieldErrors[name]) setErrors(prev => ({ ...prev, [name]: fieldErrors[name] }))
    else setErrors(prev => ({ ...prev, [name]: undefined }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setIsSubmitting(true)
    const formErrors = validateForm(formData)
    setErrors(formErrors)
    setTouches({ title: true, message: true })

    if (Object.keys(formErrors).length > 0) {
      const firstError = formErrors.title || formErrors.message
      setErrorMessage(firstError)
      setShowErrorSnackbar(true)
      const refField = formErrors.title ? 'title' : 'message'
      if (fieldRefs[refField]?.current) {
        fieldRefs[refField].current.scrollIntoView({ behavior: 'smooth', block: 'center' })
        fieldRefs[refField].current?.focus?.()
      }
      setIsSubmitting(false)
      return
    }

    try {
      const hasFilters = canonicalFilters && canonicalFilters.length > 0
      const allUserIds = users.map(u => u._id).filter(Boolean)
      const isAllSelected = selectedUsers.length === allUserIds.length
      const isFilteredOrManual =
        hasFilters || (selectedUsers.length > 0 && selectedUsers.length < allUserIds.length)
      const sendToAll = !hasFilters && isAllSelected
      await onSubmit({
        title: formData.title.trim(),
        message: formData.message.trim(),
        actionUrl: formData.actionUrl?.trim() || undefined,
        actionLabel: formData.actionLabel?.trim() || undefined,
        sendTo: sendToAll ? 'all' : 'filtered',
        includeForNewUsers: formData.includeForNewUsers === true || formData.includeForNewUsers === 'true',
        ...(!sendToAll && {
          targetUserIds: selectedUsers,
          filters: hasFilters ? canonicalFilters : undefined
        })
      })
    } catch (err) {
      setErrorMessage(err.message || 'Failed to create notification')
      setShowErrorSnackbar(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: `radial-gradient(circle at 20% 20%, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 50%),
                     radial-gradient(circle at 80% 80%, ${alpha(
                       theme.palette.secondary.main,
                       0.05
                     )} 0%, transparent 50%),
                     ${theme.palette.background.default}`
      }}
    >
      {showHeader && (
        <Box
          sx={{
            backdropFilter: 'blur(20px)',
            bgcolor:
              theme.palette.mode === 'dark'
                ? alpha(theme.palette.background.paper, 0.8)
                : alpha(theme.palette.background.paper, 0.7),
            borderBottom: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.12 : 0.08)}`,
            pt: isHeaderExpanded ? { xs: 4, md: 6 } : { xs: 2, md: 2.5 },
            pb: isHeaderExpanded ? { xs: 4, md: 6 } : { xs: 2, md: 2.5 },
            transition: 'padding 0.3s ease'
          }}
        >
          <Box sx={{ maxWidth: '1200px', margin: '0 auto', px: { xs: 2, sm: 3, md: 4 }, position: 'relative' }}>
            <IconButton
              onClick={() => setIsHeaderExpanded(!isHeaderExpanded)}
              sx={{
                position: 'absolute',
                right: { xs: 2, sm: 3, md: 4 },
                top: '50%',
                transform: 'translateY(-50%)',
                color: theme.palette.text.secondary,
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }
              }}
            >
              {isHeaderExpanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
            <Box sx={{ textAlign: 'center', pr: { xs: 6, sm: 7, md: 8 } }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: isHeaderExpanded ? 2 : 1.5,
                  mb: isHeaderExpanded ? 2 : 0
                }}
              >
                <Box
                  sx={{
                    width: isHeaderExpanded ? { xs: 48, sm: 56 } : { xs: 36, sm: 40 },
                    height: isHeaderExpanded ? { xs: 48, sm: 56 } : { xs: 36, sm: 40 },
                    borderRadius: '12px',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.3)}`
                  }}
                >
                  <NotificationIcon sx={{ fontSize: isHeaderExpanded ? 28 : 22, color: 'white' }} />
                </Box>
                <Typography
                  sx={{
                    fontSize: isHeaderExpanded
                      ? { xs: '1.5rem', sm: '1.75rem', md: '2.5rem' }
                      : { xs: '1.125rem', sm: '1.25rem', md: '1.5rem' },
                    fontWeight: 700,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.02em'
                  }}
                >
                  {editMode ? 'Edit Admin Notification' : 'Create Admin Notification'}
                </Typography>
              </Box>
              <Collapse in={isHeaderExpanded} timeout={300}>
                <Typography
                  variant='body1'
                  color='text.secondary'
                  sx={{ fontSize: '1.05rem', lineHeight: 1.8, maxWidth: 600, mx: 'auto', mt: 2 }}
                >
                  {editMode
                    ? 'Update the notification. Changes will be sent to the new recipient set.'
                    : 'Compose a new admin notification. It will appear in the admin notification list.'}
                </Typography>
              </Collapse>
            </Box>
          </Box>
        </Box>
      )}

      <Box sx={{ margin: '0 auto', px: { xs: 2, sm: 3, md: 4 }, py: { xs: 3, md: 4 }, flex: 1, overflow: 'auto' }}>
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
            <Snackbar
              open={showErrorSnackbar}
              autoHideDuration={6000}
              onClose={() => setShowErrorSnackbar(false)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
              <Alert onClose={() => setShowErrorSnackbar(false)} severity='error' variant='filled'>
                {errorMessage}
              </Alert>
            </Snackbar>

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='Title'
                    name='title'
                    value={formData.title}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={!!errors.title && touches.title}
                    helperText={errors.title}
                    required
                    inputRef={fieldRefs.title}
                    inputProps={{ maxLength: 120 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='Message'
                    name='message'
                    value={formData.message}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={!!errors.message && touches.message}
                    helperText={errors.message}
                    multiline
                    rows={4}
                    inputRef={fieldRefs.message}
                    inputProps={{ maxLength: 1000 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='Action URL (optional)'
                    name='actionUrl'
                    value={formData.actionUrl}
                    onChange={handleChange}
                    placeholder='/management/...'
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='Action label (optional)'
                    name='actionLabel'
                    value={formData.actionLabel}
                    onChange={handleChange}
                    placeholder='View'
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant='subtitle1' gutterBottom sx={{ fontWeight: 600, mb: 1.5 }}>
                    <FilterListIcon
                      sx={{ fontSize: 20, mr: 1, verticalAlign: 'middle', color: theme.palette.primary.main }}
                    />
                    Filter users
                  </Typography>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ mb: 2, fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
                  >
                    Target specific users by age, gender, or location. Combine filters with AND, OR, or NOT operators.
                    Leave empty to send to all users.
                  </Typography>
                  {loadingUsers ? (
                    <Typography variant='body2' color='text.secondary'>
                      Loading users...
                    </Typography>
                  ) : (
                    <>
                      <AudienceByFilter
                        users={users}
                        onFilterChange={handleFilterChange}
                        initialCriteria={{ ageGroup: null, location: null, gender: null }}
                        initialCanonicalFilters={canonicalFilters}
                      />
                      {canonicalFilters.length > 0 && selectedUsers.length === 0 && (
                        <Alert severity='warning' sx={{ mt: 2 }}>
                          No users match the selected filters. Add or adjust filters to target users.
                        </Alert>
                      )}
                    </>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <Typography variant='subtitle1' gutterBottom sx={{ fontWeight: 600 }}>
                    <PeopleIcon
                      sx={{ fontSize: 20, mr: 1, verticalAlign: 'middle', color: theme.palette.primary.main }}
                    />
                    Recipients
                  </Typography>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ mb: 2, fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
                  >
                    Users who will receive this notification (determined by filters above).
                  </Typography>
                  {loadingUsers ? (
                    <Typography variant='body2' color='text.secondary'>
                      Loading users...
                    </Typography>
                  ) : (
                    <AudienceUserMultiSelect
                      users={users}
                      matchedUserIds={selectedUsers}
                      hasFilters={canonicalFilters.length > 0}
                      filterCriteria={convertCanonicalToLegacyFormat(canonicalFilters)}
                    />
                  )}
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.includeForNewUsers === true || formData.includeForNewUsers === 'true'}
                        onChange={handleChange}
                        name='includeForNewUsers'
                        color='primary'
                      />
                    }
                    label={
                      <Typography
                        variant='body1'
                        sx={{
                          fontWeight: 500,
                          color: 'text.primary',
                          fontSize: { xs: '0.875rem', sm: '0.9375rem' }
                        }}
                      >
                        Include new users
                      </Typography>
                    }
                  />
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    sx={{
                      display: 'block',
                      mt: 0.5,
                      ml: 4.5,
                      fontSize: { xs: '0.75rem', sm: '0.8125rem' }
                    }}
                  >
                    New users who sign up later will also receive this notification.
                  </Typography>
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
                      disabled={isSubmitting || selectedUsers.length === 0}
                      sx={{ color: 'white' }}
                    >
                      {isSubmitting ? (editMode ? 'Updating...' : 'Creating...') : editMode ? 'Update Notification' : 'Create Notification'}
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

export default CreateAdminNotificationForm
