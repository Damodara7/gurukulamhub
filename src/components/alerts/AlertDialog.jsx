// 'use client'
// MUI Imports
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
  Select,
  InputLabel
} from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { useSession } from 'next-auth/react'
import MediaPreviewPopup from '../videos/MediaPreviewPopup'
import MultiSelect from '../MultiSelect'
import { addAlert, updateAlert } from '../../actions/alerts'
import { getAllVideos } from '../../actions/videos'
import ReactQuillHTMLEditor from '@/components/ReactQuillHTMLEditor'
import IconButtonTooltip from '../IconButtonTooltip'

const alertTypes = ['LOGIN_ALERT', 'FEATURE_ALERT']

// AddContent Component
const AddContent = ({ handleClose, onCreate, videosList = [] }) => {
  const reactQuillContentRef = useRef()
  const [formData, setFormData] = useState({
    name: '',
    alertType: '',
    isActive: true,
    priority: 1,
    content: null,
    videos: []
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

  return (
    <DialogContent className='overflow-visible pbs-0 pbe-6 pli-10 sm:pli-16'>
      <IconButtonTooltip title={"Close"} onClick={handleClose} className='absolute block-start-4 inline-end-4'>
        <i className='ri-close-line text-textSecondary' />
      </IconButtonTooltip>

      <Grid container spacing={2}>
        {/* Alert Name */}
        <Grid item xs={12}>
          <TextField
            label='Alert Name'
            value={formData.name}
            onChange={e => handleSetFormValue('name', e.target.value)}
            fullWidth
            margin='dense'
            required
          />
          {renderErrorMessage(errors?.name)}
        </Grid>

        {/* Alert Type */}
        <Grid item xs={12}>
          <TextField
            label='Alert Type'
            select
            value={formData.alertType}
            onChange={e => handleSetFormValue('alertType', e.target.value)}
            fullWidth
            margin='dense'
            required
          >
            <MenuItem value={''}>Select an option</MenuItem>
            {alertTypes.map(type => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>
          {renderErrorMessage(errors?.alertType)}
        </Grid>

        {/* Priority */}
        <Grid item xs={12}>
          <TextField
            label='Priority'
            type='number'
            value={formData.priority}
            onChange={e => handleSetFormValue('priority', parseInt(e.target.value, 10))}
            fullWidth
            margin='dense'
            inputProps={{ min: 1 }}
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
      <FormControl margin='dense'>
        <FormControlLabel
          control={
            <Switch
              checked={formData.isActive}
              onChange={e => handleSetFormValue('isActive', e.target.checked)}
              name='statusSwitch'
              color='primary'
            />
          }
          label={formData.isActive ? 'Active' : 'Inactive'}
        />
      </FormControl>
      {/* Actions */}
      <DialogActions className='gap-2 justify-center'>
        <Button onClick={handleClose} variant='outlined' color='primary'>
          Cancel
        </Button>
        <Button component='label' variant='contained' style={{ color: 'white' }} onClick={handleAddRow}>
          Add
        </Button>
      </DialogActions>
    </DialogContent>
  )
}

const EditContent = ({ handleClose, data, onUpdate, videosList = [] }) => {
  const reactQuillContentRef = useRef()
  const [formData, setFormData] = useState({
    name: data?.name || '',
    alertType: data?.alertType || '',
    priority: data?.priority || 1,
    videos: data?.videos.map(videoObj => videoObj._id) || [],
    content: data?.content || null,
    isActive: data?.isActive || false
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

  return (
    <>
      {/* "overflow-visible" class affecting the DialogActions & DialogTitle to not fixed */}
      <DialogContent className='overflow-visible pbs-0 pbe-6 pli-10 sm:pli-16'>
        <IconButtonTooltip title='Close' onClick={handleClose} className='absolute block-start-4 inline-end-4'>
          <i className='ri-close-line text-textSecondary' />
        </IconButtonTooltip>
        <Grid container spacing={2}>
          {/* Alert Name */}
          <Grid item xs={12}>
            <TextField
              label='Alert Name'
              value={formData.name}
              onChange={e => handleSetFormValue('name', e.target.value)}
              fullWidth
              margin='dense'
              required
            />
            {renderErrorMessage(errors?.name)}
          </Grid>

          {/* Alert Type */}
          <Grid item xs={12}>
            <TextField
              label='Alert Type'
              select
              value={formData.alertType}
              onChange={e => handleSetFormValue('alertType', e.target.value)}
              fullWidth
              margin='dense'
              required
            >
              <MenuItem value={''}>Select an option</MenuItem>
              {alertTypes.map(type => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
            {renderErrorMessage(errors?.alertType)}
          </Grid>

          {/* Priority */}
          <Grid item xs={12}>
            <TextField
              label='Priority'
              type='number'
              value={formData.priority}
              onChange={e => handleSetFormValue('priority', parseInt(e.target.value, 10))}
              fullWidth
              margin='dense'
              inputProps={{ min: 1 }}
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
        <FormControl margin='normal'>
          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={e => handleSetFormValue('isActive', e.target.checked)}
                name='statusSwitch'
                color='primary'
              />
            }
            label={formData.isActive ? 'Active' : 'Inactive'}
          />
        </FormControl>
      </DialogContent>
      {/* Actions */}
      <DialogActions className='gap-2 justify-center'>
        <Button onClick={handleClose} variant='outlined' color='primary'>
          Cancel
        </Button>
        <Button component='label' variant='contained' style={{ color: 'white' }} onClick={handleUpdateRow}>
          Update
        </Button>
      </DialogActions>
    </>
  )
}

// Main Video Dialog Component
const AlertDialog = ({ open, setOpen, data, onSuccess }) => {
  const { data: session } = useSession()
  const [videosList, setVideosList] = useState([])

  useEffect(() => {
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

    fetchVideos()
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

  console.log({ data: data })

  return (
    <Dialog fullWidth maxWidth='lg' open={open} onClose={handleClose}>
      <DialogTitle
        variant='h4'
        className='flex flex-col gap-2 text-center pbs-10 pbe-6 pli-10 sm:pbs-16 sm:pbe-6 sm:pli-16'
      >
        {data ? 'Edit Alert' : 'Add New Alert'}
        <Typography component='span' className='flex flex-col text-center'>
          {data ? 'Edit and customize the alert as per your requirements.' : 'Alerts you may use and assign to your users.'}
        </Typography>
      </DialogTitle>
      {data ? (
        <EditContent handleClose={handleClose} data={data} onUpdate={handleUpdateRow} videosList={videosList} />
      ) : (
        <AddContent handleClose={handleClose} onCreate={handleCreateNewRow} videosList={videosList} />
      )}
    </Dialog>
  )
}

export default AlertDialog
