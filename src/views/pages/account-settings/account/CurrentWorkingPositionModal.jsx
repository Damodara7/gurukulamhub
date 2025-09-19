import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Box,
  Typography,
  IconButton,
  Divider,
  Chip,
  Stack
} from '@mui/material'
import React, { useEffect, useState } from 'react'

import * as RestApi from '@/utils/restApiUtil'
import { API_URLS as ApiUrls } from '@/configs/apiConfig'

import { DemoContainer } from '@mui/x-date-pickers/internals/demo'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers'
import dayjs from 'dayjs'
import { toast } from 'react-toastify'

const initialFormData = {
  title: '',
  employmentType: '',
  companyName: '',
  location: '',
  locationType: '',
  isCurrentlyWorking: true,
  startDate: '',
  endDate: '',
  description: ''
}

function CurrentWorkingPositionModal({
  open,
  onClose,
  email,
  onRefetchUserProfileData,
  existingPositions = [],
  editingWorkingPosition = null
}) {
  const [formData, setFormData] = useState(initialFormData)
  const [isFormValid, setIsFormValid] = useState(true)
  const [isFormSubmitting, setIsFormSubmitting] = useState(false)

  // Populate form data when editing
  useEffect(() => {
    if (editingWorkingPosition) {
      setFormData({
        title: editingWorkingPosition.title || '',
        employmentType: editingWorkingPosition.employmentType || '',
        companyName: editingWorkingPosition.companyName || '',
        location: editingWorkingPosition.location || '',
        locationType: editingWorkingPosition.locationType || '',
        isCurrentlyWorking:
          editingWorkingPosition.isCurrentlyWorking !== undefined ? editingWorkingPosition.isCurrentlyWorking : true,
        startDate: editingWorkingPosition.startDate || '',
        endDate: editingWorkingPosition.endDate || '',
        description: editingWorkingPosition.description || ''
      })
    } else {
      setFormData(initialFormData)
    }
  }, [editingWorkingPosition])

  function handleClose() {
    setFormData(initialFormData)
    setIsFormValid(true)
    onClose()
  }

  const handleFormChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
  }
  async function handleSubmit() {
    setIsFormSubmitting(true)
    // Validate form
    if (!formData.title.trim() || !formData.companyName.trim() || !formData.employmentType.trim()) {
      setIsFormValid(false)
      setIsFormSubmitting(false)
      return
    }

    setIsFormValid(true)

    try {
      let response
      if (editingWorkingPosition) {
        // Update existing working position
        response = await RestApi.put(`${ApiUrls.v0.USERS_PROFILE}/working-positions?id=${editingWorkingPosition._id}`, {
          email,
          workingPosition: formData
        })
      } else {
        // Add new working position
        response = await RestApi.post(`${ApiUrls.v0.USERS_PROFILE}/working-positions`, {
          email,
          workingPosition: formData
        })
      }

      if (response.status === 'success') {
        // Optionally update local state or refetch data
        console.log('Working position details saved successfully:', response.result)
        toast.success(
          editingWorkingPosition ? 'Working position updated successfully.' : 'Working position added successfully.'
        )
        onClose()
        onRefetchUserProfileData()
      } else {
        toast.error('Error: ' + response.message)
        console.error('Error adding working position details:', response.message)
      }
    } catch (error) {
      toast.error('An unexpected error occurred.')
      console.error('Unexpected error:', error)
    } finally {
      setIsFormSubmitting(false)
    }
  }

  useEffect(() => {
    if (formData.isCurrentlyWorking) {
      setFormData(prev => ({ ...prev, endDate: '' }))
    }
  }, [formData.isCurrentlyWorking])

  return (
    <Grid xs={12} sm={8} md={6}>
      <Dialog sx={{ width: '100%', margin: 'auto' }} open={open} onClose={handleClose}>
        <DialogTitle>{editingWorkingPosition ? 'Edit Working Position' : 'Add Your Experience'}</DialogTitle>

        <DialogContent>
          <form>
            <Grid container spacing={5}>
              {/* Title */}
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label='Title'
                  value={formData.title}
                  placeholder='Ex: Associate Software Engineer'
                  onChange={e => handleFormChange('title', e.target.value)}
                  error={!isFormValid && formData.title.trim().length === 0}
                  helperText={!isFormValid && formData.title.trim().length === 0 ? 'Title is a required field!' : ''}
                />
              </Grid>

              {/* Employment Type */}
              <Grid item xs={12}>
                <FormControl fullWidth required error={!isFormValid && !formData.employmentType.trim()}>
                  <InputLabel>Employment Type</InputLabel>
                  <Select
                    fullWidth
                    label='Employment Type'
                    value={formData.employmentType}
                    error={!isFormValid && !formData.employmentType.trim()}
                    onChange={e => handleFormChange('employmentType', e.target.value)}
                  >
                    <MenuItem value='fullTime'>Full-Time</MenuItem>
                    <MenuItem value='partTime'>Part-Time</MenuItem>
                    <MenuItem value='selfEmployed'>Self-employed</MenuItem>
                    <MenuItem value='freelance'>Freelance</MenuItem>
                    <MenuItem value='internship'>Internship</MenuItem>
                    <MenuItem value='trainee'>Trainee</MenuItem>
                  </Select>
                  {!isFormValid && formData.employmentType.trim().length === 0 && (
                    <FormHelperText>Employment type is a required field!</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* Company Name */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label='Company Name'
                  value={formData.companyName}
                  error={!isFormValid && !formData.companyName.trim()}
                  helperText={!isFormValid && !formData.companyName.trim() ? 'Company name is a required field!' : ''}
                  placeholder='Ex: Triesol Tech'
                  onChange={e => handleFormChange('companyName', e.target.value)}
                />
              </Grid>

              {/* Location */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Location'
                  value={formData.location}
                  placeholder='Ex: Hyderabad, Telangana, India'
                  onChange={e => handleFormChange('location', e.target.value)}
                />
              </Grid>

              {/* Location Type */}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Location Type</InputLabel>
                  <Select
                    fullWidth
                    label='Location Type'
                    value={formData.locationType}
                    onChange={e => handleFormChange('locationType', e.target.value)}
                  >
                    <MenuItem value={'onSite'}>On-site</MenuItem>
                    <MenuItem value={'hybrid'}>Hybrid</MenuItem>
                    <MenuItem value={'remote'}>Remote</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Is Currently Working */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.isCurrentlyWorking}
                      onChange={(e, checked) => handleFormChange('isCurrentlyWorking', checked)}
                    />
                  }
                  label='I am currently working in this role.'
                />
              </Grid>

              {/* Start Date */}
              <Grid item xs={12}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DemoContainer components={['DatePicker']}>
                    <DatePicker
                      sx={{ width: '100%' }}
                      label='Start date'
                      format='DD-MM-YYYY'
                      value={dayjs(formData.startDate)}
                      onChange={value => handleFormChange('startDate', value)}
                      slotProps={{
                        textField: {
                          variant: 'outlined',
                          error: false
                        }
                      }}
                    />
                  </DemoContainer>
                </LocalizationProvider>
              </Grid>

              {/* End Date */}
              <Grid item xs={12}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DemoContainer components={['DatePicker']}>
                    <DatePicker
                      sx={{ width: '100%' }}
                      label='End date'
                      format='DD-MM-YYYY'
                      value={dayjs(formData.endDate)}
                      disabled={formData.isCurrentlyWorking}
                      onChange={value => handleFormChange('endDate', value)}
                      minDate={dayjs(formData.startDate).add(1, 'days')}
                      slotProps={{
                        textField: {
                          variant: 'outlined',
                          error: false
                        }
                      }}
                    />
                  </DemoContainer>
                </LocalizationProvider>
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Description'
                  multiline
                  rows={4}
                  value={formData.description}
                  placeholder='Write a brief description of your education experience.'
                  onChange={e => handleFormChange('description', e.target.value)}
                />
              </Grid>
            </Grid>
          </form>
        </DialogContent>

        <DialogActions>
          <Grid item xs={12} mt={4}>
            <Stack direction='row' spacing={2} justifyContent='center'>
              <Button variant='outlined' onClick={handleClose} disabled={isFormSubmitting}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                component='label'
                variant='contained'
                color='primary'
                style={{ color: 'white' }}
                disabled={isFormSubmitting}
              >
                {isFormSubmitting ? 'Saving...' : editingWorkingPosition ? 'Update position' : 'Save position'}
              </Button>
            </Stack>
          </Grid>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default CurrentWorkingPositionModal
