'use client'

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  FormControl,
  FormControlLabel,
  Switch,
  Button,
  TextField,
  Typography,
  Box,
  Chip,
  Grid,
  MenuItem,
  Stack,
  IconButton,
  alpha,
  useTheme,
  useMediaQuery,
  Divider,
  Paper
} from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import { useSession } from 'next-auth/react'
import MediaPreviewPopup from '../videos/MediaPreviewPopup'
import MultiSelect from '../MultiSelect'
import { addAlert, updateAlert } from '../../actions/alerts'
import { getAllVideos } from '../../actions/videos'
import { getAllAudiences, addAudience } from '../../actions/audience'
import ReactQuillHTMLEditor from '@/components/ReactQuillHTMLEditor'
import AddIcon from '@mui/icons-material/Add'
import GroupsIcon from '@mui/icons-material/Groups'
import CreateAudienceForm from '../audience/CreateAudienceForm'

const alertTypes = ['LOGIN_ALERT', 'FEATURE_ALERT']

// Helper function to format filter criteria for display
const formatFilterCriteria = (filter) => {
  if (!filter || !filter.criteria) return ''
  
  switch (filter.type) {
    case 'age':
      const { min, max } = filter.criteria
      if (min !== undefined && max !== undefined) {
        return `${min}-${max} years`
      } else if (min !== undefined) {
        return `${min}+ years`
      } else if (max !== undefined) {
        return `up to ${max} years`
      }
      return 'Age'
    
    case 'location':
      const parts = []
      if (filter.criteria.city) parts.push(filter.criteria.city)
      if (filter.criteria.region) parts.push(filter.criteria.region)
      if (filter.criteria.country) parts.push(filter.criteria.country)
      return parts.join(', ') || 'Location'
    
    case 'gender':
      if (filter.criteria.values && Array.isArray(filter.criteria.values)) {
        return filter.criteria.values.map(g => g.charAt(0).toUpperCase() + g.slice(1)).join(', ')
      }
      return 'Gender'
    
    default:
      return filter.type
  }
}

// Helper function to format all filters with operators
const formatAudienceFilters = (filters) => {
  if (!filters || filters.length === 0) return 'No filters applied'
  
  return filters.map((filter, index) => {
    const criteria = formatFilterCriteria(filter)
    const operator = filter.operator && index > 0 ? ` ${filter.operator} ` : ''
    return `${operator}${filter.type}: ${criteria}`
  }).join(' ')
}

// Component to display audience option with filters
const AudienceOption = ({ audience, showFilters = true }) => {
  const theme = useTheme()
  const isDarkMode = theme.palette.mode === 'dark'
  
  return (
    <Box sx={{ py: 0.5, width: '100%' }}>
      <Stack direction='row' spacing={1} alignItems='center' sx={{ mb: showFilters ? 0.5 : 0 }}>
        <GroupsIcon fontSize='small' sx={{ color: theme.palette.primary.main }} />
        <Typography fontWeight={600} sx={{ fontSize: '0.95rem' }}>
          {audience.audienceName}
        </Typography>
      </Stack>
      {showFilters && audience.filters && audience.filters.length > 0 && (
        <Box
          sx={{
            ml: 3.5,
            p: 0.75,
            // bgcolor: alpha(theme.palette.primary.main, isDarkMode ? 0.1 : 0.05),
            borderRadius: 1,
            // border: `1px solid ${alpha(theme.palette.primary.main, isDarkMode ? 0.2 : 0.15)}`
          }}
        >
          <Stack direction='row' spacing={0.5} flexWrap='wrap' alignItems='center'>
            {audience.filters.map((filter, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                {index > 0 && filter.operator && (
                  <Chip
                    label={filter.operator}
                    size='small'
                    sx={{
                      height: '20px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      mr: 0.5,
                      bgcolor: alpha(theme.palette.warning.main, isDarkMode ? 0.2 : 0.15),
                      color: theme.palette.warning.main,
                      border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`
                    }}
                  />
                )}
                <Chip
                  label={`${filter.type.toUpperCase()}: ${formatFilterCriteria(filter)}`}
                  size='small'
                  sx={{
                    height: '20px',
                    fontSize: '0.7rem',
                    mr: 0.5,
                    mb: 0.5,
                    bgcolor: alpha(theme.palette.info.main, isDarkMode ? 0.15 : 0.1),
                    color: theme.palette.info.main,
                    border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`
                  }}
                />
              </Box>
            ))}
          </Stack>
        </Box>
      )}
      {showFilters && (!audience.filters || audience.filters.length === 0) && (
        <Typography
          variant='caption'
          sx={{
            ml: 3.5,
            color: 'text.secondary',
            fontStyle: 'italic',
            fontSize: '0.75rem'
          }}
        >
          No filters applied
        </Typography>
      )}
    </Box>
  )
}

// AddContent Component
const AddContent = ({ handleClose, onCreate, videosList = [], audiencesList = [], showCreateAudience, setShowCreateAudience, refreshAudiences }) => {
  const theme = useTheme()
  const isDarkMode = theme.palette.mode === 'dark'
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const reactQuillContentRef = useRef()
  const [formData, setFormData] = useState({
    name: '',
    alertType: '',
    isActive: true,
    priority: 1,
    content: null,
    videos: [],
    audience: ''
  })
  const [errors, setErrors] = useState({}) // State to track errors

  const validateField = (field, value) => {
    let error = ''
    if (field === 'name' && value.trim() === '') error = 'Alert name is required.'
    if (field === 'alertType' && value === '') error = 'Alert type is required.'
    if (field === 'priority' && (isNaN(value) || value < 1)) error = 'Priority must be a positive number.'
    return error
  }

  const handleSetFormValue = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Validate the field on typing
    const error = validateField(field, value)
    setErrors(prev => ({ ...prev, [field]: error }))
  }

  const validateForm = () => {
    const newErrors = {}
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field])
      if (error) newErrors[field] = error
    })

    // Validate ReactQuill content
    if (reactQuillContentRef.current) {
      const proceed = reactQuillContentRef.current.onSubmit()
      if (!proceed) newErrors.content = 'Content cannot be empty.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0 // Return true if no errors
  }

  const handleAddRow = () => {
    // Validation
    if (!validateForm()) return // Prevent submission if form is invalid

    onCreate({
      ...formData
    })
    handleClose()
  }

  const renderErrorMessage = error => {
    if (error) {
      return (
        <Typography variant='body2' color='error' sx={{ mb: 1, textAlign: 'left', width: '100%' }}>
          {error}
        </Typography>
      )
    } else {
      return null
    }
  }

  if (showCreateAudience) {
    return (
      <DialogContent
        sx={{
          p: { xs: 2.5, sm: 3, md: 4 },
          overflow: 'auto',
          width: '100%',
          maxWidth: '100%',
          // maxHeight: '70vh'
        }}
      >
        <CreateAudienceForm
          onSubmit={async (audienceData) => {
            try {
              const result = await addAudience({ data: audienceData })
              if (result?.status === 'success') {
                handleSetFormValue('audience', result.result._id)
                setShowCreateAudience(false)
                // Refresh audiences list without reloading the page
                if (refreshAudiences) {
                  await refreshAudiences()
                }
              }
            } catch (error) {
              console.error('Error creating audience:', error)
            }
          }}
          onCancel={() => setShowCreateAudience(false)}
        />
      </DialogContent>
    )
  }

  return (
    <DialogContent
      sx={{
        p: { xs: 2.5, sm: 3, md: 4 },
        overflow: 'visible',
        width: '100%',
        maxWidth: '100%'
      }}
    >
      <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
        {/* Alert Name */}
        <Grid item xs={12}>
          <TextField
            label='Alert Name'
            value={formData.name}
            onChange={e => handleSetFormValue('name', e.target.value)}
            fullWidth
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: { xs: 1.5, sm: 2 },
                fontSize: { xs: '0.9375rem', sm: '1rem' }
              }
            }}
          />
          {renderErrorMessage(errors?.name)}
        </Grid>

        {/* Alert Type */}
        <Grid item xs={12} sm={6}>
          <TextField
            label='Alert Type'
            select
            value={formData.alertType}
            onChange={e => handleSetFormValue('alertType', e.target.value)}
            fullWidth
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: { xs: 1.5, sm: 2 },
                fontSize: { xs: '0.9375rem', sm: '1rem' }
              }
            }}
          >
            <MenuItem value={''}>Select an option</MenuItem>
            {alertTypes.map(type => (
              <MenuItem key={type} value={type}>
                {type.replace('_', ' ')}
              </MenuItem>
            ))}
          </TextField>
          {renderErrorMessage(errors?.alertType)}
        </Grid>

        {/* Priority */}
        <Grid item xs={12} sm={6}>
          <TextField
            label='Priority'
            type='number'
            value={formData.priority}
            onChange={e => handleSetFormValue('priority', parseInt(e.target.value, 10))}
            fullWidth
            inputProps={{ min: 1 }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: { xs: 1.5, sm: 2 },
                fontSize: { xs: '0.9375rem', sm: '1rem' }
              }
            }}
          />
          {renderErrorMessage(errors?.priority)}
        </Grid>

        {/* Content */}
        <Grid item xs={12}>
          <ReactQuillHTMLEditor
            ref={reactQuillContentRef}
            value={formData?.content?.htmlContent || ''}
            onChange={htmlContent => handleSetFormValue('content', { htmlContent: htmlContent, source: 'react-quill' })}
            required={true}
          />
        </Grid>

        {/* Audience Selection */}
        <Grid item xs={12}>
          <Stack spacing={1}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant='outlined'
                size='small'
                startIcon={<AddIcon fontSize='small' />}
                onClick={() => setShowCreateAudience(true)}
                sx={{
                  minWidth: 'fit-content',
                  height: '32px',
                  borderRadius: 1,
                  px: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  whiteSpace: 'nowrap'
                }}
              >
                New Audience
              </Button>
            </Box>
            <TextField
              label='Select Audience (Optional)'
              select
              value={formData.audience}
              onChange={e => handleSetFormValue('audience', e.target.value)}
              fullWidth
              SelectProps={{
                renderValue: (selected) => {
                  if (!selected) return <em>None</em>
                  const selectedAudience = audiencesList.find(a => a._id === selected)
                  return selectedAudience ? (
                    <AudienceOption audience={selectedAudience} showFilters={true} />
                  ) : <em>None</em>
                },
                MenuProps: {
                  PaperProps: {
                    sx: {
                      maxHeight: 400,
                      '& .MuiMenuItem-root': {
                        whiteSpace: 'normal',
                        py: 1.5
                      }
                    }
                  }
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: { xs: 1.5, sm: 2 },
                  fontSize: { xs: '0.9375rem', sm: '1rem' }
                }
              }}
            >
              <MenuItem value=''>
                <em>None</em>
              </MenuItem>
              {audiencesList.map(audience => (
                <MenuItem key={audience._id} value={audience._id}>
                  <AudienceOption audience={audience} showFilters={true} />
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </Grid>

        {/* Videos Selection */}
        <Grid item xs={12}>
          <MultiSelect
            label='Select Videos (Optional)'
            placeholder='Select Videos'
            selectedValues={formData.videos}
            onChange={values => handleSetFormValue('videos', values)}
            options={videosList.map(videoObj => ({
              value: videoObj._id,
              optionLabel: (
                <>
                  <Box>
                    <Typography variant='h5'>{videoObj.name}</Typography>
                    <MediaPreviewPopup showPopup={true} url={videoObj.url} mediaType='video' height='80px' />
                  </Box>
                </>
              ),
              selectedLabel: videoObj.name
            }))}
          />
        </Grid>
      </Grid>

      {/* Status */}
      <Grid item xs={12}>
        <Paper
          sx={{
            p: { xs: 1.5, sm: 2 },
            borderRadius: { xs: 1.5, sm: 2 },
            bgcolor: alpha(theme.palette.primary.main, isDarkMode ? 0.08 : 0.04),
            border: `1px solid ${alpha(theme.palette.primary.main, isDarkMode ? 0.2 : 0.15)}`
          }}
        >
          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={e => handleSetFormValue('isActive', e.target.checked)}
                name='statusSwitch'
                color='primary'
              />
            }
            label={
              <Typography fontWeight={600} fontSize={{ xs: '0.9375rem', sm: '1rem' }}>
                {formData.isActive ? 'Active' : 'Inactive'}
              </Typography>
            }
          />
        </Paper>
      </Grid>

      {/* Actions */}
      <Grid item xs={12}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 1.5, sm: 2 }}
          justifyContent='flex-end'
          sx={{ pt: { xs: 1, sm: 2 } }}
        >
          <Button
            onClick={handleClose}
            variant='outlined'
            color='primary'
            fullWidth={isMobile}
            sx={{
              borderRadius: { xs: 1.5, sm: 2 },
              px: { xs: 3, sm: 4 },
              py: { xs: 1.1, sm: 1.25 },
              textTransform: 'none',
              fontWeight: 600,
              fontSize: { xs: '0.9375rem', sm: '1rem' }
            }}
          >
            Cancel
          </Button>
          <Button
            variant='contained'
            component='label'
            onClick={handleAddRow}
            fullWidth={isMobile}
            sx={{
              borderRadius: { xs: 1.5, sm: 2 },
              px: { xs: 3, sm: 4 },
              py: { xs: 1.1, sm: 1.25 },
              textTransform: 'none',
              fontWeight: 700,
              fontSize: { xs: '0.9375rem', sm: '1rem' },
              color: 'white',
              boxShadow: isDarkMode
                ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
                : `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`
            }}
          >
            Add Alert
          </Button>
        </Stack>
      </Grid>
    </DialogContent>
  )
}

const EditContent = ({ handleClose, data, onUpdate, videosList = [], audiencesList = [], showCreateAudience, setShowCreateAudience, refreshAudiences }) => {
  const theme = useTheme()
  const isDarkMode = theme.palette.mode === 'dark'
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const reactQuillContentRef = useRef()
  const [formData, setFormData] = useState({
    name: data?.name || '',
    alertType: data?.alertType || '',
    priority: data?.priority || 1,
    videos: data?.videos.map(videoObj => videoObj._id) || [],
    content: data?.content || null,
    isActive: data?.isActive || false,
    audience: data?.audience?._id || ''
  })

  const [errors, setErrors] = useState({}) // State to track errors

  const validateField = (field, value) => {
    let error = ''
    if (field === 'name' && value.trim() === '') error = 'Alert name is required.'
    if (field === 'alertType' && value === '') error = 'Alert type is required.'
    if (field === 'priority' && (isNaN(value) || value < 1)) error = 'Priority must be a positive number.'
    return error
  }

  const handleSetFormValue = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Validate the field on typing
    const error = validateField(field, value)
    setErrors(prev => ({ ...prev, [field]: error }))
  }

  const validateForm = () => {
    const newErrors = {}
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field])
      if (error) newErrors[field] = error
    })

    // Validate ReactQuill content
    if (reactQuillContentRef.current) {
      const proceed = reactQuillContentRef.current.onSubmit()
      if (!proceed) newErrors.content = 'Content cannot be empty.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0 // Return true if no errors
  }

  const handleUpdateRow = () => {
    // Validation
    if (!validateForm()) return // Prevent submission if form is invalid

    onUpdate({
      _id: data._id,
      ...formData
    })
    handleClose()
  }

  const renderErrorMessage = error => {
    if (error) {
      return (
        <Typography variant='body2' color='error' sx={{ mb: 1, textAlign: 'left', width: '100%' }}>
          {error}
        </Typography>
      )
    } else {
      return null
    }
  }

  if (showCreateAudience) {
    return (
      <DialogContent
        sx={{
          p: { xs: 2.5, sm: 3, md: 4 },
          overflow: 'auto',
          width: '100%',
          maxWidth: '100%',
          maxHeight: '70vh'
        }}
      >
        <CreateAudienceForm
          onSubmit={async (audienceData) => {
            try {
              const result = await addAudience({ data: audienceData })
              if (result?.status === 'success') {
                handleSetFormValue('audience', result.result._id)
                setShowCreateAudience(false)
                // Refresh audiences list without reloading the page
                if (refreshAudiences) {
                  await refreshAudiences()
                }
              }
            } catch (error) {
              console.error('Error creating audience:', error)
            }
          }}
          onCancel={() => setShowCreateAudience(false)}
        />
      </DialogContent>
    )
  }

  return (
    <>
      <DialogContent
        sx={{
          p: { xs: 2.5, sm: 3, md: 4 },
          overflow: 'visible',
          width: '100%',
          maxWidth: '100%'
        }}
      >
        <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
          {/* Alert Name */}
          <Grid item xs={12}>
            <TextField
              label='Alert Name'
              value={formData.name}
              onChange={e => handleSetFormValue('name', e.target.value)}
              fullWidth
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: { xs: 1.5, sm: 2 },
                  fontSize: { xs: '0.9375rem', sm: '1rem' }
                }
              }}
            />
            {renderErrorMessage(errors?.name)}
          </Grid>

          {/* Alert Type */}
          <Grid item xs={12} sm={6}>
            <TextField
              label='Alert Type'
              select
              value={formData.alertType}
              onChange={e => handleSetFormValue('alertType', e.target.value)}
              fullWidth
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: { xs: 1.5, sm: 2 },
                  fontSize: { xs: '0.9375rem', sm: '1rem' }
                }
              }}
            >
              <MenuItem value={''}>Select an option</MenuItem>
              {alertTypes.map(type => (
                <MenuItem key={type} value={type}>
                  {type.replace('_', ' ')}
                </MenuItem>
              ))}
            </TextField>
            {renderErrorMessage(errors?.alertType)}
          </Grid>

          {/* Priority */}
          <Grid item xs={12} sm={6}>
            <TextField
              label='Priority'
              type='number'
              value={formData.priority}
              onChange={e => handleSetFormValue('priority', parseInt(e.target.value, 10))}
              fullWidth
              inputProps={{ min: 1 }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: { xs: 1.5, sm: 2 },
                  fontSize: { xs: '0.9375rem', sm: '1rem' }
                }
              }}
            />
            {renderErrorMessage(errors?.priority)}
          </Grid>

          {/* Content */}
          <Grid item xs={12}>
            <ReactQuillHTMLEditor
              ref={reactQuillContentRef}
              value={formData?.content?.htmlContent || ''}
              onChange={htmlContent =>
                handleSetFormValue('content', { htmlContent: htmlContent, source: 'react-quill' })
              }
              required={true}
            />
          </Grid>

          {/* Audience Selection */}
          <Grid item xs={12}>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant='outlined'
                  size='small'
                  startIcon={<AddIcon fontSize='small' />}
                  onClick={() => setShowCreateAudience(true)}
                  sx={{
                    minWidth: 'fit-content',
                    height: '32px',
                    borderRadius: 1,
                    px: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    whiteSpace: 'nowrap'
                  }}
                >
                  New Audience
                </Button>
              </Box>
              <TextField
                label='Select Audience (Optional)'
                select
                value={formData.audience}
                onChange={e => handleSetFormValue('audience', e.target.value)}
                fullWidth
                SelectProps={{
                  renderValue: (selected) => {
                    if (!selected) return <em>None</em>
                    const selectedAudience = audiencesList.find(a => a._id === selected)
                    return selectedAudience ? (
                      <AudienceOption audience={selectedAudience} showFilters={true} />
                    ) : <em>None</em>
                  },
                  MenuProps: {
                    PaperProps: {
                      sx: {
                        maxHeight: 400,
                        '& .MuiMenuItem-root': {
                          whiteSpace: 'normal',
                          py: 1.5
                        }
                      }
                    }
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: { xs: 1.5, sm: 2 },
                    fontSize: { xs: '0.9375rem', sm: '1rem' }
                  }
                }}
              >
                <MenuItem value=''>
                  <em>None</em>
                </MenuItem>
                {audiencesList.map(audience => (
                  <MenuItem key={audience._id} value={audience._id}>
                    <AudienceOption audience={audience} showFilters={true} />
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </Grid>

          {/* Videos Selection */}
          <Grid item xs={12}>
            <MultiSelect
              label='Select Videos (Optional)'
              placeholder='Select Videos'
              selectedValues={formData.videos}
              onChange={values => handleSetFormValue('videos', values)}
              options={videosList.map(videoObj => ({
                value: videoObj._id,
                selectedLabel: videoObj.name,
                optionLabel: (
                  <>
                    <Box>
                      <Typography variant='h5'>{videoObj.name}</Typography>
                      <MediaPreviewPopup url={videoObj.url} mediaType='video' height='60px' />
                    </Box>
                  </>
                )
              }))}
            />
          </Grid>
        </Grid>
        {/* Status */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: { xs: 1.5, sm: 2 },
              borderRadius: { xs: 1.5, sm: 2 },
              bgcolor: alpha(theme.palette.primary.main, isDarkMode ? 0.08 : 0.04),
              border: `1px solid ${alpha(theme.palette.primary.main, isDarkMode ? 0.2 : 0.15)}`
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={e => handleSetFormValue('isActive', e.target.checked)}
                  name='statusSwitch'
                  color='primary'
                />
              }
              label={
                <Typography fontWeight={600} fontSize={{ xs: '0.9375rem', sm: '1rem' }}>
                  {formData.isActive ? 'Active' : 'Inactive'}
                </Typography>
              }
            />
          </Paper>
        </Grid>

        {/* Actions */}
        <Grid item xs={12}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 1.5, sm: 2 }}
            justifyContent='flex-end'
            sx={{ pt: { xs: 1, sm: 2 } }}
          >
            <Button
              onClick={handleClose}
              variant='outlined'
              color='primary'
              fullWidth={isMobile}
              sx={{
                borderRadius: { xs: 1.5, sm: 2 },
                px: { xs: 3, sm: 4 },
                py: { xs: 1.1, sm: 1.25 },
                textTransform: 'none',
                fontWeight: 600,
                fontSize: { xs: '0.9375rem', sm: '1rem' }
              }}
            >
              Cancel
            </Button>
            <Button
              variant='contained'
              component='label'
              onClick={handleUpdateRow}
              fullWidth={isMobile}
              sx={{
                borderRadius: { xs: 1.5, sm: 2 },
                px: { xs: 3, sm: 4 },
                py: { xs: 1.1, sm: 1.25 },
                textTransform: 'none',
                fontWeight: 700,
                fontSize: { xs: '0.9375rem', sm: '1rem' },
                color: 'white',
                boxShadow: isDarkMode
                  ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
                  : `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`
              }}
            >
              Update Alert
            </Button>
          </Stack>
        </Grid>
      </DialogContent>
    </>
  )
}

// Main Video Dialog Component
const AlertDialog = ({ open, setOpen, data, onSuccess }) => {
  const { data: session } = useSession()
  const [videosList, setVideosList] = useState([])
  const [audiencesList, setAudiencesList] = useState([])
  const [showCreateAudience, setShowCreateAudience] = useState(false)

  // Fetch the list of videos from the server
  const fetchVideos = async () => {
    try {
      const response = await getAllVideos()
      if (response?.status === 'success') {
        setVideosList(response?.result || [])
      } else {
        console.error('Error fetching videos:', response?.message)
      }
    } catch (error) {
      console.error('An error occurred while fetching videos:', error)
    }
  }

  // Fetch the list of audiences from the server
  const fetchAudiences = async () => {
    try {
      const response = await getAllAudiences()
      if (response?.status === 'success') {
        setAudiencesList(response?.result || [])
      } else {
        console.error('Error fetching audiences:', response?.message)
      }
    } catch (error) {
      console.error('An error occurred while fetching audiences:', error)
    }
  }

  useEffect(() => {
    if (open) {
      fetchVideos()
      fetchAudiences()
    }
  }, [open])

  const handleClose = () => {
    setOpen(false)
  }

  const handleCreateNewRow = async newRow => {
    try {
      const result = await addAlert({
        data: { ...newRow, createdBy: session?.user?.email }
      })

      if (result?.status === 'success') {
        console.log('Row created successfully:', result)
        await onSuccess() // Call the success handler
      } else {
        console.error('Error creating Row:', result?.message)
        // Optionally, show a user-friendly error message here
      }
    } catch (error) {
      console.error('An error occurred while creating the Row:', error)
      // Handle the error (e.g., show a notification)
    }
  }

  const handleUpdateRow = async updatingRow => {
    try {
      const result = await updateAlert({
        id: updatingRow._id,
        data: {
          ...updatingRow,
          updatedBy: session?.user?.email
        }
      })

      if (result?.status === 'success') {
        console.log('Row updated successfully:', result)
        await onSuccess() // Call the success handler
      } else {
        console.error('Error updating Row:', result?.message)
        // Optionally, show a user-friendly error message here
      }
    } catch (error) {
      // Handle the error (e.g., show a notification)
    }
  }

  const theme = useTheme()
  const isDarkMode = theme.palette.mode === 'dark'
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <Dialog
      fullWidth
      maxWidth='lg'
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          borderRadius: { xs: 2, sm: 3, md: 4 },
          bgcolor: isDarkMode ? theme.palette.background.paper : 'white',
          backgroundImage: 'none',
          boxShadow: isDarkMode
            ? `0 24px 48px ${alpha(theme.palette.common.black, 0.5)}`
            : '0 24px 48px rgba(15, 23, 42, 0.12)'
        }
      }}
    >
      <DialogTitle
        sx={{
          pt: { xs: 3, sm: 4 },
          pb: { xs: 2, sm: 2.5 },
          px: { xs: 2.5, sm: 3, md: 4 },
          position: 'relative',
          borderBottom: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.15 : 0.1)}`
        }}
      >
        {!showCreateAudience && (
          <IconButton
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: { xs: 12, sm: 16 },
              top: { xs: 12, sm: 16 },
              color: theme.palette.text.secondary,
              '&:hover': {
                bgcolor: alpha(theme.palette.error.main, 0.08),
                color: theme.palette.error.main
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        )}

        <Stack direction='row' spacing={1.5} alignItems='center' sx={{ mb: 1 }}>
          <Box
            sx={{
              width: { xs: 40, sm: 44 },
              height: { xs: 40, sm: 44 },
              borderRadius: { xs: 1.5, sm: 2 },
              bgcolor: alpha(theme.palette.primary.main, isDarkMode ? 0.15 : 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.palette.primary.main
            }}
          >
            <NotificationsActiveIcon sx={{ fontSize: { xs: 22, sm: 24 } }} />
          </Box>
          <Box>
            <Typography
              variant='h5'
              fontWeight={700}
              sx={{
                color: 'text.primary',
                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' }
              }}
            >
              {data ? 'Edit Alert' : 'Add New Alert'}
            </Typography>
            <Typography
              variant='body2'
              sx={{
                color: 'text.secondary',
                fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                mt: 0.5
              }}
            >
              {data
                ? 'Edit and customize the alert as per your requirements.'
                : 'Create alerts you may use and assign to your users.'}
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>
      {data ? (
        <EditContent 
          handleClose={handleClose} 
          data={data} 
          onUpdate={handleUpdateRow} 
          videosList={videosList} 
          audiencesList={audiencesList}
          showCreateAudience={showCreateAudience}
          setShowCreateAudience={setShowCreateAudience}
          refreshAudiences={fetchAudiences}
        />
      ) : (
        <AddContent 
          handleClose={handleClose} 
          onCreate={handleCreateNewRow} 
          videosList={videosList} 
          audiencesList={audiencesList}
          showCreateAudience={showCreateAudience}
          setShowCreateAudience={setShowCreateAudience}
          refreshAudiences={fetchAudiences}
        />
      )}
    </Dialog>
  )
}

export default AlertDialog
