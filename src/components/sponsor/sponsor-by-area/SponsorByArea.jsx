import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Button,
  Divider,
  Grid,
  Autocomplete,
  Checkbox,
  ListItemText,
  FormHelperText,
  CircularProgress,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material'
import CountryRegionDropdown from '@/views/pages/auth/register-multi-steps/CountryRegionDropdown'
import Loading from '@/components/Loading'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

// Reward types
const REWARD_TYPES = {
  CASH: 'cash',
  PHYSICAL_GIFT: 'physicalGift',
  OTHER: 'other'
}

const rewardTypeOptions = [
  { value: 'cash', label: 'Cash' },
  { value: 'physicalGift', label: 'Physical Gift' },
  // { value: 'other', label: 'Other' }
]

const SponsorByArea = () => {
  const router = useRouter()
  const { data: session } = useSession()

  // State for location
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedCountryObject, setSelectedCountryObject] = useState(null)
  const [selectedRegion, setSelectedRegion] = useState('')
  const [city, setCity] = useState('')
  const [cityOptions, setCityOptions] = useState([])
  const [zipCode, setZipCode] = useState('')

  const [sponsorerType, setSponsorerType] = useState('individual')
  const [rewardType, setRewardType] = useState('cash')
  const [formData, setFormData] = useState({
    sponsorshipAmount: '',
    orgName: '',
    website: '',
    orgType: '',
    mobileNumber: '', // Changed from contactPerson to mobileNumber
    numberOfGames: 1,
    rewardValue: '',
    rewardDescription: '',
    otherDetails: ''
  })

  // Loading state
  const [loading, setLoading] = useState({
    fetchCities: false,
    submitting: false
  })

  // Errors state
  const [errors, setErrors] = useState({})

  // Fetch Cities from DB
  const getCitiesData = async (region = '') => {
    setLoading(prev => ({ ...prev, fetchCities: true }))
    try {
      console.log('Fetching Cities Data now...')
      // const result = await clientApi.getAllCities()
      const result = await RestApi.get(`/api/cities?state=${region}`)
      if (result?.status === 'success') {
        console.log('Cities Fetched result', result)
        setCityOptions(result?.result?.map(each => each.city)) // Store the fetched cities
      } else {
        console.log('Error Fetching cities:', result)
      }
    } catch (error) {
      console.log('Error:', error)
    } finally {
      setLoading(prev => ({ ...prev, fetchCities: false }))
    }
  }

  const handleChangeCountry = countryValue => {
    setSelectedRegion('')
  }

  const validateMobileNumber = number => {
    const regex = /^[6-9]\d{9}$/ // Indian mobile number validation
    return regex.test(number)
  }

  const validateForm = () => {
    const newErrors = {}

    if (!selectedCountry) {
      newErrors.selectedCountry = 'Please select a country'
    }

    // if (!zipCode) {
    //   newErrors.zipCode = 'Please enter zip code'
    // }
    if (sponsorerType === 'organization') {
      if (!formData.orgName) newErrors.orgName = 'Organization name is required'
      if (!formData.website) newErrors.website = 'Website is required'
      if (!formData.orgType) newErrors.orgType = 'Organization type is required'
      if (!formData.mobileNumber) {
        newErrors.mobileNumber = 'Mobile number is required'
      } else if (!validateMobileNumber(formData.mobileNumber)) {
        newErrors.mobileNumber = 'Please enter a valid 10-digit Indian mobile number'
      }
    }

    if (rewardType === REWARD_TYPES.CASH && !formData.sponsorshipAmount) {
      newErrors.sponsorshipAmount = 'Amount is required'
    } else if (
      rewardType === REWARD_TYPES.CASH &&
      (isNaN(formData.sponsorshipAmount) || formData.sponsorshipAmount <= 0)
    ) {
      newErrors.sponsorshipAmount = 'Please enter a valid amount'
    }

    if ([REWARD_TYPES.PHYSICAL_GIFT, REWARD_TYPES.OTHER].includes(rewardType)) {
      if (!formData.rewardValue) newErrors.rewardValue = 'Value is required'
      if (!formData.rewardDescription) newErrors.rewardDescription = 'Description is required'
      if (rewardType === 'other' && !formData.otherDetails) {
        newErrors.otherDetails = 'Details are required'
      }
    }

    if (!formData.numberOfGames) {
      newErrors.numberOfGames = 'Please enter number of games'
    } else if (isNaN(formData.numberOfGames) || formData.numberOfGames <= 0) {
      newErrors.numberOfGames = 'Please enter a valid number'
    }

    setErrors(newErrors)
    console.log(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    console.log('submitting...')
    if (validateForm()) {
      setLoading(prev => ({ ...prev, submitting: true }))

      try {
        const submissionData = {
          email: session?.user?.email,
          location: {
            country: selectedCountry,
            region: selectedRegion,
            city,
            zipCode
          },
          sponsorerType,
          sponsorType: 'area',
          ...(sponsorerType === 'organization' && {
            orgName: formData.orgName,
            website: formData.website,
            orgType: formData.orgType,
            mobileNumber: formData.mobileNumber
          }),
          rewardType,
          ...(rewardType === REWARD_TYPES.CASH && { sponsorshipAmount: formData.sponsorshipAmount }),
          ...([REWARD_TYPES.PHYSICAL_GIFT, REWARD_TYPES.OTHER].includes(rewardType) && {
            rewardValue: formData.rewardValue,
            rewardDescription: formData.rewardDescription,
            ...(rewardType === REWARD_TYPES.OTHER && { otherRewardDetails: formData.otherDetails })
          })
        }

        console.log('Form submitted:', submissionData)
        const res = await RestApi.post(API_URLS.v0.SPONSORSHIP, submissionData)
        if (res.status === 'success') {
          router.push(`/sponsor/${res.result._id}/payment`)
          // Reset form
          setSelectedCountry('')
          setSelectedCountryObject(null)
          setSelectedRegion('')
          setCity('')
          setZipCode('')
          setSponsorerType('individual')
          setFormData({
            sponsorshipAmount: '',
            orgName: '',
            website: '',
            orgType: '',
            mobileNumber: '',
            numberOfGames: 1
          })
        }
      } catch (error) {
        console.error('Submission error:', error)
        alert('Failed to submit sponsorship. Please try again.')
      } finally {
        setLoading(prev => ({ ...prev, submitting: false }))
      }
    }
  }

  const handleChange = e => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' })
    }
  }

  // Render appropriate fields based on reward type
  const renderRewardFields = () => {
    switch (rewardType) {
      case REWARD_TYPES.CASH:
        return (
          <TextField
            fullWidth
            sx={{ mb: 3 }}
            label='Sponsorship Amount (INR)'
            type='text' // Changed to text input
            name='sponsorshipAmount'
            value={formData.sponsorshipAmount}
            onChange={e => {
              // Only allow numbers and decimal point
              const value = e.target.value.replace(/[^0-9.]/g, '').replace(/^0+(\d)/, '$1') // Remove leading zeros;
              handleChange({ target: { name: e.target.name, value } })
            }}
            error={!!errors.sponsorshipAmount}
            helperText={errors.sponsorshipAmount}
            InputProps={{ inputProps: { min: 0 } }}
          />
        )
      case REWARD_TYPES.PHYSICAL_GIFT:
        return (
          <>
            <TextField
              fullWidth
              sx={{ mb: 3 }}
              label='Gift Value (INR)'
              type='text'
              name='rewardValue'
              value={formData.rewardValue}
              onChange={e => {
                // Only allow numbers and decimal point
                const value = e.target.value.replace(/[^0-9.]/g, '').replace(/^0+(\d)/, '$1') // Remove leading zeros;
                handleChange({ target: { name: e.target.name, value } })
              }}
              error={!!errors.rewardValue}
              helperText={errors.rewardValue}
              InputProps={{ inputProps: { min: 0 } }}
            />
            <TextField
              fullWidth
              sx={{ mb: 3 }}
              label='Gift Description'
              name='rewardDescription'
              value={formData.rewardDescription}
              onChange={handleChange}
              error={!!errors.rewardDescription}
              helperText={errors.rewardDescription}
            />
          </>
        )
      case REWARD_TYPES.OTHER:
        return (
          <>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                sx={{ mb: 3 }}
                label='Reward Value (INR)'
                type='text'
                name='rewardValue'
                value={formData.rewardValue}
                onChange={e => {
                  // Only allow numbers and decimal point
                  const value = e.target.value.replace(/[^0-9.]/g, '').replace(/^0+(\d)/, '$1') // Remove leading zeros;
                  handleChange({ target: { name: e.target.name, value } })
                }}
                error={!!errors.rewardValue}
                helperText={errors.rewardValue}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                sx={{ mb: 3 }}
                label='Reward Description'
                name='rewardDescription'
                value={formData.rewardDescription}
                onChange={handleChange}
                error={!!errors.rewardDescription}
                helperText={errors.rewardDescription}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                sx={{ mb: 3 }}
                label='Other Details'
                name='otherDetails'
                value={formData.otherDetails}
                onChange={handleChange}
                error={!!errors.otherDetails}
                helperText={errors.otherDetails}
                multiline
                rows={3}
              />
            </Grid>
          </>
        )
      default:
        return null
    }
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant='h4' gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        Sponsor Traditional Knowledge Quizzes & Games in any area you wish to.
      </Typography>

      <Typography variant='body1' paragraph>
        {`Your sponsorship helps promote India's ancient knowledge systems through engaging quiz competitions. Support
        these educational initiatives to:`}
      </Typography>

      <ul>
        <li>Preserve and propagate traditional Indian knowledge</li>
        <li>Encourage youth participation in cultural education</li>
        <li>Support quiz masters and content creators</li>
        <li>Provide platforms for showcasing traditional wisdom</li>
      </ul>

      <Divider sx={{ my: 3 }} />

      <form>
        {/* Location Selection */}
        <Typography variant='h6' gutterBottom>
          Sponsorship Location
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <CountryRegionDropdown
              setSelectedCountry={setSelectedCountry}
              selectedCountryObject={selectedCountryObject}
              setSelectedCountryObject={setSelectedCountryObject}
              onCountryChange={handleChangeCountry}
              error={!!errors.selectedCountry}
            />
          </Grid>

          {selectedCountryObject?.country && (
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <Autocomplete
                  autoHighlight
                  onChange={(e, newValue) => {
                    setSelectedRegion(newValue)
                    getCitiesData(newValue)
                    setCity('')
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
            <Grid item xs={12} md={6}>
              {loading.fetchCities && <Loading />}
              {!loading.fetchCities && (
                <FormControl fullWidth>
                  <Autocomplete
                    autoHighlight
                    onChange={(e, newValue) => {
                      setCity(newValue)
                    }}
                    id='autocomplete-city-select'
                    options={cityOptions}
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
                    value={city}
                  />
                </FormControl>
              )}
            </Grid>
          )}
        </Grid>

        {/* Sponsor Type Selection */}
        <Typography variant='h6' gutterBottom sx={{ mt: 2 }}>
          Sponsorship Type
        </Typography>
        <RadioGroup value={sponsorerType} onChange={e => setSponsorerType(e.target.value)} sx={{ mb: 3 }}>
          <FormControlLabel value='individual' control={<Radio />} label='Sponsor as an Individual' />
          <FormControlLabel value='organization' control={<Radio />} label='Sponsor as an Organization' />
        </RadioGroup>

        {/* Organization Sponsor Fields */}
        {sponsorerType === 'organization' && (
          <>
            <TextField
              fullWidth
              sx={{ mb: 3 }}
              label='Organization Name'
              name='orgName'
              value={formData.orgName}
              onChange={handleChange}
              error={!!errors.orgName}
              helperText={errors.orgName}
            />
            <TextField
              fullWidth
              sx={{ mb: 3 }}
              label='Website'
              name='website'
              value={formData.website}
              onChange={handleChange}
              error={!!errors.website}
              helperText={errors.website}
            />
            <FormControl fullWidth sx={{ mb: 3 }} error={!!errors.orgType}>
              <InputLabel id='org-type-label'>Organization Type</InputLabel>
              <Select
                labelId='org-type-label'
                label='Organization Type'
                name='orgType'
                value={formData.orgType}
                onChange={handleChange}
              >
                <MenuItem value=''>Select Organization Type</MenuItem>
                <MenuItem value='public-company'>Public Company</MenuItem>
                <MenuItem value='self-employed'>Self-employed</MenuItem>
                <MenuItem value='government-agency'>Government Agency</MenuItem>
                <MenuItem value='non-profit'>Non-profit</MenuItem>
                <MenuItem value='sole-proprietorship'>Sole proprietorship</MenuItem>
                <MenuItem value='privately-held'>Privately held</MenuItem>
                <MenuItem value='partnership'>Partnership</MenuItem>
              </Select>
              {errors.orgType && (
                <Typography color='error' variant='caption'>
                  {errors.orgType}
                </Typography>
              )}
            </FormControl>
            <TextField
              fullWidth
              sx={{ mb: 3 }}
              label='Mobile Number'
              name='mobileNumber'
              type='number'
              value={formData.mobileNumber}
              onChange={handleChange}
              error={!!errors.mobileNumber}
              helperText={errors.mobileNumber || 'Enter 10-digit Indian mobile number'}
              inputProps={{ maxLength: 10 }}
            />
          </>
        )}

        {/* Reward Type Selection */}
        <Typography variant='h6' gutterBottom sx={{ mt: 2 }}>
          Reward Type
        </Typography>
        <FormControl fullWidth sx={{ mb: 3 }} error={!!errors.rewardType}>
          <InputLabel id='reward-type-label'>Select Reward Type</InputLabel>
          <Select
            labelId='reward-type-label'
            value={rewardType}
            label='Select Reward Type'
            onChange={e => {
              setRewardType(e.target.value)
              if (errors.rewardType) setErrors({ ...errors, rewardType: '' })
            }}
          >
            {rewardTypeOptions.map(type => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </Select>
          {errors.rewardType && (
            <Typography color='error' variant='caption'>
              {errors.rewardType}
            </Typography>
          )}
        </FormControl>

        {/* Render reward-specific fields */}
        {renderRewardFields()}

        {/* Sponsorship Details */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label='Number of Games to Sponsor'
              type='number'
              name='numberOfGames'
              value={formData.numberOfGames}
              onChange={handleChange}
              error={!!errors.numberOfGames}
              helperText={errors.numberOfGames}
              InputProps={{ inputProps: { min: 1 } }}
            />
          </Grid>
        </Grid>

        <Button
          onClick={handleSubmit}
          component='label'
          variant='contained'
          size='large'
          sx={{ mt: 2, color: 'white' }}
          disabled={loading.submitting}
        >
          {loading.submitting ? (
            <>
              <CircularProgress size={24} sx={{ mr: 1 }} />
              Submitting...
            </>
          ) : (
            'Submit Sponsorship'
          )}
        </Button>
      </form>

      <Typography variant='body2' sx={{ mt: 4, fontStyle: 'italic' }}>
        Note: Sponsors will be recognized in all promotional materials and will receive detailed reports on the impact
        of their contribution to preserving traditional knowledge systems.
      </Typography>
    </Box>
  )
}

export default SponsorByArea
