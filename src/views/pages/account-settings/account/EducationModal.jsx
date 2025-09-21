import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogContentText,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Box,
  Typography,
  IconButton,
  Divider,
  Stack
} from '@mui/material'
import React, { useState, useEffect } from 'react'
import { DemoContainer } from '@mui/x-date-pickers/internals/demo'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers'
import { Edit as EditIcon } from '@mui/icons-material'
import dayjs from 'dayjs'

const initialFormData = {
  school: '',
  degree: '',
  highestQualification: '',
  fieldOfStudy: '',
  startDate: '',
  endDate: '',
  description: ''
}

const highestQualificationOptions = [
  '7th Grade',
  '10th Grade',
  '12th Grade',
  'Diploma / Vocational Training',
  'Associate Degree',
  "Bachelor's Degree / Graduation",
  "Master's Degree / Post Graduation",
  'Doctorate (Ph.D.)',
  'Professional Degree (MD, JD, etc.)',
  'Certificate Course',
  'Postdoctoral Fellowship',
  'Other'
]

function EducationModal({
  open,
  onClose,
  email,
  onAddEducationToState,
  onUpdateEducationInState,
  existingSchools = [],
  editingEducation = null
}) {
  const [formData, setFormData] = useState(initialFormData)
  const [isFormValid, setIsFormValid] = useState(true)
  const [isFormSubmitting, setIsFormSubmitting] = useState(false)

  // Populate form data when editing
  useEffect(() => {
    if (editingEducation) {
      setFormData({
        school: editingEducation.school || '',
        degree: editingEducation.degree || '',
        highestQualification: editingEducation.highestQualification || '',
        fieldOfStudy: editingEducation.fieldOfStudy || '',
        startDate: editingEducation.startDate || '',
        endDate: editingEducation.endDate || '',
        description: editingEducation.description || ''
      })
    } else {
      setFormData(initialFormData)
    }
  }, [editingEducation])

  function handleClose() {
    setFormData(initialFormData)
    setIsFormValid(true)
    onClose()
  }

  const handleFormChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
  }
  function handleSubmit() {
    // Validate form
    setIsFormSubmitting(true)

    if (!formData.school.trim()) {
      setIsFormValid(false)
      setIsFormSubmitting(false)
      return
    }

    setIsFormValid(true)

    try {
      if (editingEducation) {
        // Update existing education in state
        const updatedEducation = {
          _id: editingEducation._id,
          school: formData.school,
          degree: formData.degree,
          highestQualification: formData.highestQualification,
          fieldOfStudy: formData.fieldOfStudy,
          startDate: formData.startDate,
          endDate: formData.endDate,
          description: formData.description
        }
        onUpdateEducationInState(updatedEducation)
      } else {
        // Add new education to state
        const newEducation = {
          _id: `temp_${Date.now()}`, // Temporary ID for state management
          school: formData.school,
          degree: formData.degree,
          highestQualification: formData.highestQualification,
          fieldOfStudy: formData.fieldOfStudy,
          startDate: formData.startDate,
          endDate: formData.endDate,
          description: formData.description
        }
        onAddEducationToState(newEducation)
      }

      console.log('Education added to state successfully')
      onClose()
    } catch (error) {
      console.error('Unexpected error:', error)
    } finally {
      setIsFormSubmitting(false)
    }
  }

  return (
    <Grid xs={12} sm={8} md={6}>
      <Dialog sx={{ width: '100%', margin: 'auto' }} open={open} onClose={handleClose}>
        <DialogTitle>{editingEducation ? 'Edit Education' : 'Add Your Education'}</DialogTitle>

        <DialogContent>
          <form>
            <Grid container spacing={5}>
              {/* School */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='School'
                  value={formData.school}
                  placeholder='Ex: ZPHS Veerannapet'
                  onChange={e => handleFormChange('school', e.target.value)}
                  error={!isFormValid && formData.school.trim().length === 0}
                  helperText={!isFormValid && formData.school.trim().length === 0 ? 'School is a required field!' : ''}
                />
              </Grid>

              {/* Highest Qualification */}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Highest Qualification</InputLabel>
                  <Select
                    value={formData.highestQualification}
                    onChange={e => handleFormChange('highestQualification', e.target.value)}
                    label='Highest Qualification'
                  >
                    {highestQualificationOptions.map((qualification, index) => (
                      <MenuItem key={index} value={qualification}>
                        {qualification}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Degree */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Degree'
                  value={formData.degree}
                  placeholder="Ex: Bachelor's"
                  onChange={e => handleFormChange('degree', e.target.value)}
                />
              </Grid>

              {/* Field of study */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Field of study'
                  value={formData.fieldOfStudy}
                  placeholder='Ex: Business'
                  onChange={e => handleFormChange('fieldOfStudy', e.target.value)}
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
                {isFormSubmitting ? 'Saving...' : editingEducation ? 'Update' : 'Save education'}
              </Button>
            </Stack>
          </Grid>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

// Education View Modal Component
export function EducationViewModal({ open, onClose, education, onEdit }) {
  function handleEdit() {
    onEdit(education)
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>Education Details</DialogTitle>
      <DialogContent>
        {education && (
          <Box sx={{ pt: 1 }}>
            <DialogContentText>
              <Box sx={{ mb: 2 }}>
                <Typography variant='h6' sx={{ fontWeight: 'bold', mb: 1 }}>
                  {education.highestQualification === '7th Grade' || education.highestQualification === '10th Grade'
                    ? 'School Name'
                    : 'College Name'}
                </Typography>
                <Typography variant='body1'>{education.school}</Typography>
              </Box>

              {education.degree && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant='h6' sx={{ fontWeight: 'bold', mb: 1 }}>
                    Degree
                  </Typography>
                  <Typography variant='body1'>{education.degree}</Typography>
                </Box>
              )}

              {education.fieldOfStudy && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant='h6' sx={{ fontWeight: 'bold', mb: 1 }}>
                    Field of Study
                  </Typography>
                  <Typography variant='body1'>{education.fieldOfStudy}</Typography>
                </Box>
              )}

              {education.highestQualification && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant='h6' sx={{ fontWeight: 'bold', mb: 1 }}>
                    Highest Qualification
                  </Typography>
                  <Typography variant='body1'>{education.highestQualification}</Typography>
                </Box>
              )}

              <Box sx={{ mb: 2 }}>
                <Typography variant='h6' sx={{ fontWeight: 'bold', mb: 1 }}>
                  Duration
                </Typography>
                <Typography variant='body1'>
                  {education.startDate ? new Date(education.startDate).toLocaleDateString() : 'N/A'} -{' '}
                  {education.endDate ? new Date(education.endDate).toLocaleDateString() : 'Present'}
                </Typography>
              </Box>

              {education.description && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant='h6' sx={{ fontWeight: 'bold', mb: 1 }}>
                    Description
                  </Typography>
                  <Typography variant='body1'>{education.description}</Typography>
                </Box>
              )}
            </DialogContentText>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant='outlined'>
          Close
        </Button>
        <Button
          onClick={handleEdit}
          variant='contained'
          color='primary'
          component='label'
          sx={{
            color: 'white'
          }}
          startIcon={<EditIcon />}
        >
          Edit
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default EducationModal
