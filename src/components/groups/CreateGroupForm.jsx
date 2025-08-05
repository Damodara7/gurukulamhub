'use client'
import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Snackbar,
  Alert,
  Stack
} from '@mui/material'
import CountryRegionDropdown from '@/views/pages/auth/register-multi-steps/CountryRegionDropdown'
import Loading from '../Loading'
import * as RestApi from '@/utils/restApiUtil'

const validateForm = formData => {
  const errors = {}
  if (!formData.groupName) {
    errors.groupName = 'Group name is required'
  }
  if (!formData.location?.country) {
    errors['location.country'] = 'Country is required'
  }
  if (!formData.gender) {
    errors.gender = 'Gender is required'
  }
  // Age validation
  // if (formData.ageGroup.min === '' || formData.ageGroup.max === '') {
  //   errors.ageGroup = 'Both age fields are required'
  // } else {
  //   const min = parseInt(formData.ageGroup.min)
  //   const max = parseInt(formData.ageGroup.max)

  //   if (isNaN(min) || isNaN(max)) {
  //     errors.ageGroup = 'Please enter valid numbers'
  //   }
  //   else if( min < 0 || max < 0) {
  //     errors.ageGroup = 'Age cannot be negative'
  //   }
  //   else if (min > 120 || max > 120) {
  //     errors.ageGroup = 'Age cannot be more than 120'
  //   }
  //   else if (min > max) {
  //     errors.ageGroup = 'Min age should be less than Max age'
  //   }
  //   else if (min === max) {
  //     errors.ageGroup = 'Min age should be less than Max age'
  //   }
  // }
  return errors
}

const formFieldOrder = ['groupName', 'location.country', 'gender', 'ageGroup.min', 'ageGroup.max']

const CreateGroupForm = ({ onSubmit, onCancel }) => {
  const initialFormData = {
    groupName: '',
    description: '',
    location: {
      country: '',
      region: '',
      city: ''
    },
    gender: '',
    ageGroup: {
      min: '',
      max: ''
    }
  }

  const [formData, setFormData] = useState(initialFormData)
  const [selectedCountryObject, setSelectedCountryObject] = useState(null)
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [cityOptions, setCityOptions] = useState([])
  const [loading, setLoading] = useState({
    fetchCities: false,
    submitting: false
  })
  const [errors, setErrors] = useState({})
  const [touches, setTouches] = useState({})
  const [showErrorSnackbar, setShowErrorSnackbar] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Create refs for each field
  const fieldRefs = {
    groupName: useRef(),
    description: useRef(),
    gender: useRef(),
    ageGroupMin: useRef(),
    ageGroupMax: useRef(),
    country: useRef()
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

 const handleAgeChange = (field, value) => {
    // Only allow numbers or empty string
    if (value === '' || /^\d+$/.test(value)) {
      setFormData(prev => ({
        ...prev,
        ageGroup: {
          ...prev.ageGroup,
          [field]: value
        }
      }))

    // Validate age group when both fields have values
    if (formData.ageGroup.min !== '' && formData.ageGroup.max !== '') {
      validateField('ageGroup')
    }
  }
}

 const handleCountryChange = (countryObject) => {
   setSelectedCountryObject(countryObject)
   setSelectedRegion('')
   setSelectedCity('')
   setFormData(prev => ({
     ...prev,
     location: {
       ...prev.location,
       country: countryObject?.country || '',
       region: '',
       city: ''
     }
   }))
   // Clear country error when selected
   if (errors['location.country']) {
     setErrors(prev => {
       const newErrors = { ...prev }
       delete newErrors['location.country']
       return newErrors
     })
   }
 }
  // Fetch Cities from DB
  const getCitiesData = async (region = '') => {
    setLoading(prev => ({ ...prev, fetchCities: true }))
    try {
      const result = await RestApi.get(`/api/cities?state=${region}`)
      if (result?.status === 'success') {
        setCityOptions(result?.result?.map(each => each.city))
      }
    } catch (error) {
      console.error('Error fetching cities:', error)
    } finally {
      setLoading(prev => ({ ...prev, fetchCities: false }))
    }
  }

  useEffect(() => {
    getCitiesData()
  }, [])

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
      'location.country': true,
      gender: true,
      'ageGroup.min': true,
      'ageGroup.max': true
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
      ...formData,
      groupName: formData.groupName.trim(),
      description: formData.description.trim(),
      location: {
        country: selectedCountryObject?.country,
        region: selectedRegion,
        city: selectedCity
      },
      gender: formData.gender,
      ageGroup: {
        min: parseInt(formData.ageGroup.min),
        max: parseInt(formData.ageGroup.max)
      }
    }

    try {
      await onSubmit(submission)
    } catch (error) {
      setErrorMessage(error.message || 'Failed to create group')
      setShowErrorSnackbar(true)
    } finally {
      setIsSubmitting(false)
    }
  }
  // console.log('form data after submission ', formData);

  return (
    <Card>
      <CardContent>
        <Typography variant='h5' gutterBottom>
          Create New Group
        </Typography>
        <Divider sx={{ my: 2 }} />

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
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Description (Optional)'
                name='description'
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={3}
                inputRef={fieldRefs.description}
              />
            </Grid>

            {/* Location */}
            <Grid item xs={12}>
              <Typography variant='subtitle1' gutterBottom>
                Location of the Group Creation
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <CountryRegionDropdown
                    defaultCountryCode=''
                    selectedCountryObject={selectedCountryObject}
                    setSelectedCountryObject={handleCountryChange}
                    error={!!errors['location.country'] && touches['location.country']}
                    helperText={errors['location.country']}
                    required
                  />
                </Grid>

                {selectedCountryObject?.country && (
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControl fullWidth>
                      <Autocomplete
                        autoHighlight
                        onChange={(e, newValue) => {
                          setSelectedRegion(newValue)
                          setSelectedCity('')
                          setFormData(prev => ({
                            ...prev,
                            location: {
                              ...prev.location,
                              region: newValue,
                              city: ''
                            }
                          }))
                          getCitiesData(newValue)
                        }}
                        id='autocomplete-region-select'
                        options={selectedCountryObject?.regions || []}
                        getOptionLabel={option => option || ''}
                        renderInput={params => (
                          <TextField
                            {...params}
                            key={params.id}
                            label='Choose a region'
                            inputProps={{
                              ...params.inputProps,
                              autoComplete: 'region'
                            }}
                          />
                        )}
                        value={selectedRegion}
                      />
                    </FormControl>
                  </Grid>
                )}

                {selectedRegion && (
                  <Grid item xs={12} sm={6} md={4}>
                    {loading.fetchCities && <Loading />}
                    {!loading.fetchCities && (
                      <FormControl fullWidth>
                        <Autocomplete
                          autoHighlight
                          onChange={(e, newValue) => {
                            setSelectedCity(newValue)
                            setFormData(prev => ({
                              ...prev,
                              location: {
                                ...prev.location,
                                city: newValue
                              }
                            }))
                          }}
                          id='autocomplete-city-select'
                          options={cityOptions || []}
                          getOptionLabel={option => option || ''}
                          renderInput={params => (
                            <TextField
                              {...params}
                              key={params.id}
                              label='Choose a City'
                              inputProps={{
                                ...params.inputProps,
                                autoComplete: 'city'
                              }}
                            />
                          )}
                          value={selectedCity}
                        />
                      </FormControl>
                    )}
                  </Grid>
                )}
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Typography variant='h6' gutterBottom>
                Group Criteria
              </Typography>
              <Divider />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.gender && touches.gender}>
                <InputLabel>Gender</InputLabel>
                <Select
                  name='gender'
                  value={formData.gender}
                  label='Gender'
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  inputRef={fieldRefs.gender}
                >
                  <MenuItem value=''>Select Gender</MenuItem>
                  <MenuItem value='male'>Male</MenuItem>
                  <MenuItem value='female'>Female</MenuItem>
                  <MenuItem value='other'>Other</MenuItem>
                </Select>
                {errors.gender && <FormHelperText>{errors.gender}</FormHelperText>}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label='Min Age'
                name='ageGroup.min'
                type='number'
                value={formData.ageGroup.min}
                onChange={e => handleAgeChange('min', e.target.value)}
                onBlur={handleBlur}
                inputProps={{ min: 0, max: 120 }}
                error={!!errors.ageGroup && touches['ageGroup.min']}
                helperText={errors.ageGroup && touches['ageGroup.min'] ? errors.ageGroup : ''}
                required
                inputRef={fieldRefs.ageGroupMin}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label='Max Age'
                name='ageGroup.max'
                type='number'
                value={formData.ageGroup.max}
                onChange={e => handleAgeChange('max', e.target.value)}
                onBlur={handleBlur}
                inputProps={{ min: 0, max: 120 }}
                error={!!errors.ageGroup && touches['ageGroup.max']}
                helperText={errors.ageGroup && touches['ageGroup.max'] ? errors.ageGroup : ''}
                inputRef={fieldRefs.ageGroupMax}
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
                >
                  Create Group
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default CreateGroupForm