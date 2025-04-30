'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Container,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  MenuItem,
  Input,
  useTheme
} from '@mui/material'
import { PhotoCamera, CheckCircle as CheckCircleIcon, Error as ErrorIcon } from '@mui/icons-material'

import * as RestApi from '@/utils/restApiUtil' // Assuming RestApi and ApiUrls are defined
import { API_URLS } from '@/configs/apiConfig'
import IconButtonTooltip from '@/components/IconButtonTooltip'

const EventRegistrationForm = () => {
  const router = useRouter()
  const theme = useTheme()
  const [formData, setFormData] = useState({
    name: '',
    fatherOrHusbandName: '',
    age: '',
    gender: '',
    designation: '',
    village: '',
    taluka: '',
    district: '',
    mobileNumber: '',
    profilePhoto: null
  })
  const [errors, setErrors] = useState({})
  const [isRegistered, setIsRegistered] = useState(false)
  const [isSuccess, setIsSuccess] = useState(null)
  const [formError, setFormError] = useState('')

  const handleChange = e => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    validateField(name, value)
    setFormError('')
  }

  const validateField = (field, value) => {
    const newErrors = { ...errors }

    switch (field) {
      case 'name':
      case 'fatherOrHusbandName':
      case 'designation':
      case 'village':
      case 'taluka':
      case 'district':
        newErrors[field] = !value.trim()
        break
      case 'age':
        newErrors.age = !value || value < 6 || value > 120
        break
      case 'gender':
        newErrors.gender = !value
        break
      case 'mobileNumber':
        newErrors.mobileNumber = !/^\d{10}$/.test(value)
        break
      default:
        break
    }

    setErrors(newErrors)
  }

  const handlePhotoChange = e => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, profilePhoto: URL.createObjectURL(e.target.files[0]) })
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name) newErrors.name = true
    if (!formData.fatherOrHusbandName) newErrors.fatherOrHusbandName = true
    if (!formData.age || formData.age < 6 || formData.age > 120) newErrors.age = true
    if (!formData.gender) newErrors.gender = true
    if (!formData.mobileNumber || !/^\d{10}$/.test(formData.mobileNumber)) newErrors.mobileNumber = true
    if (!formData.designation) newErrors.designation = true
    if (!formData.village) newErrors.village = true
    if (!formData.taluka) newErrors.taluka = true
    if (!formData.district) newErrors.district = true

    setErrors(newErrors)
    setFormError(Object.keys(newErrors).length > 0 ? 'Please fill all the required fields' : '')
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      // console.log(hello)
      const result = await RestApi.post(API_URLS.v0.EVENT_USER, {
        ...formData
      })

      if (result?.status === 'success') {
        console.log('EventUser created successfully:', result)
        setIsSuccess(true)
      } else {
        console.error('Error creating EventUser:', result?.message)
        setIsSuccess(false)
        // Optionally, show a user-friendly error message here
      }
    } catch (error) {
      setIsSuccess(false)
      console.error('An error occurred while creating the EventUser:', error)
    } finally {
      setIsRegistered(true)
    }
  }

  const handleCloseDialog = () => {
    setIsRegistered(false)
    if (isSuccess) router.push('/')
  }

  return (
    <Container maxWidth='sm' sx={{ mt: 4, pb: 2 }}>
      <Typography
        variant='h4'
        align='center'
        gutterBottom
        sx={{
          fontWeight: 'bold',
          fontSize: '2rem',
          color: 'transparent',
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
          letterSpacing: '0.05em',
          mb: 2
        }}
      >
        Event Registration
      </Typography>
      <Box component='form' onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
        <Grid item xs={12} textAlign='center'>
          <Avatar src={formData.profilePhoto} alt='Profile Photo' sx={{ width: 100, height: 100, mx: 'auto', mb: 2 }} />
          <label htmlFor='profile-photo'>
            <input
              style={{ display: 'none' }}
              accept='.jpg, .png, .jpeg'
              id='profile-photo'
              type='file'
              onChange={handlePhotoChange}
            />
            <IconButtonTooltip title='Upload' color='primary' aria-label='upload picture' component='span'>
              <PhotoCamera />
            </IconButtonTooltip>
          </label>
        </Grid>
        <Grid container spacing={2}>
          {[
            'name',
            'age',
            'gender',
            'mobileNumber',
            'fatherOrHusbandName',
            'designation',
            'village',
            'taluka',
            'district'
          ].map((field, index) => (
            <Grid item xs={field === 'age' || field === 'gender' ? 6 : 12} key={index}>
              <TextField
                fullWidth
                required
                label={
                  field === 'fatherOrHusbandName'
                    ? 'Father/Husband Name'
                    : field.charAt(0).toUpperCase() + field.slice(1)
                }
                name={field}
                variant='outlined'
                value={formData[field]}
                onChange={handleChange}
                error={!!errors[field]}
                type={field === 'age' ? 'number' : 'text'}
                select={field === 'gender'}
                sx={{ '& .MuiOutlinedInput-root.Mui-error': { borderColor: theme.palette.error.main } }}
              >
                {field === 'gender' &&
                  ['Male', 'Female', 'Other'].map(option => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
              </TextField>
            </Grid>
          ))}
        </Grid>
        {formError && (
          <Alert severity='error' sx={{ mt: 2 }}>
            {formError}
          </Alert>
        )}
        <Box textAlign='center' mt={3}>
          <Button type='submit' variant='contained' color='primary' style={{ color: 'white' }}>
            Submit
          </Button>
        </Box>
      </Box>
      <Dialog open={isRegistered} onClose={handleCloseDialog} sx={{ backdropFilter: 'blur(5px)' }}>
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.5rem' }}>
          {isSuccess ? 'Registration Successful!' : 'Registration Failed'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box textAlign='center' sx={{ mb: 2 }}>
            {isSuccess ? (
              <CheckCircleIcon color='success' sx={{ fontSize: 80 }} />
            ) : (
              <ErrorIcon color='error' sx={{ fontSize: 80 }} />
            )}
          </Box>
          <Typography
            variant='h6'
            sx={{ color: isSuccess ? 'success.main' : 'error.main', mb: 2, textAlign: 'center' }}
          >
            {isSuccess
              ? 'You have successfully registered for the event!'
              : 'An error occurred during registration. Please try again.'}
          </Typography>
          <Typography variant='body2' sx={{ color: 'text.secondary', textAlign: 'center', mb: 3 }}>
            {isSuccess ? 'Thank you for your participation. We look forward to seeing you at the event!' : ''}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', mb: 2 }}>
          <Button
            variant='contained'
            color={isSuccess ? 'success' : 'error'}
            component='label'
            onClick={handleCloseDialog}
            sx={{
              borderRadius: '20px',
              padding: '10px 20px',
              transition: 'background-color 0.3s ease',
              '&:hover': {
                backgroundColor: isSuccess ? 'success.dark' : 'error.dark'
              }
            }}
          >
            {isSuccess ? 'OK' : 'Close'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default EventRegistrationForm
