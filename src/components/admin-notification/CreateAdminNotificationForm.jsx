'use client'

import React, { useState, useRef } from 'react'
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
import { ExpandLess, ExpandMore, NotificationsActive as NotificationIcon } from '@mui/icons-material'

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

const CreateAdminNotificationForm = ({ onSubmit, onCancel, showHeader = true }) => {
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
  const fieldRefs = { title: useRef(), message: useRef() }

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
      await onSubmit({
        title: formData.title.trim(),
        message: formData.message.trim(),
        actionUrl: formData.actionUrl?.trim() || undefined,
        actionLabel: formData.actionLabel?.trim() || undefined,
        sendTo: 'all',
        includeForNewUsers: formData.includeForNewUsers === true || formData.includeForNewUsers === 'true'
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
                  Create Admin Notification
                </Typography>
              </Box>
              <Collapse in={isHeaderExpanded} timeout={300}>
                <Typography
                  variant='body1'
                  color='text.secondary'
                  sx={{ fontSize: '1.05rem', lineHeight: 1.8, maxWidth: 600, mx: 'auto', mt: 2 }}
                >
                  Compose a new admin notification. It will appear in the admin notification list.
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
                      disabled={isSubmitting}
                      sx={{ color: 'white' }}
                    >
                      {isSubmitting ? 'Creating...' : 'Create Notification'}
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
