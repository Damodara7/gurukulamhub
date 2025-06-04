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
  Radio,
  Dialog,
  DialogContent
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
  PHYSICAL_GIFT: 'physicalGift'
}

const rewardTypeOptions = [
  { value: REWARD_TYPES.CASH, label: 'Cash (INR)' },
  { value: REWARD_TYPES.PHYSICAL_GIFT, label: 'Physical Gift' }
]

const initialFormData = {
  fullname: '',
  sponsorshipAmount: '',
  orgName: '',
  website: '',
  orgType: '',
  mobileNumber: '',
  nonCashItem: '',
  numberOfNonCashItems: '',
  rewardValue: '',
  rewardDescription: ''
}

const SponsorQuizzes = () => {
  const router = useRouter()
  const { data: session } = useSession()

  // State for quizzes selection
  const [selectedQuizzes, setSelectedQuizzes] = useState(['any-quiz'])

  // State for location
  const [selectedCountryObject, setSelectedCountryObject] = useState(null)
  const [selectedRegion, setSelectedRegion] = useState('')
  const [city, setCity] = useState('')
  const [cityOptions, setCityOptions] = useState([])
  const [zipCode, setZipCode] = useState('')
  const [quizzes, setQuizzes] = useState([])

  const [sponsorerType, setSponsorerType] = useState('individual')
  const [rewardType, setRewardType] = useState(REWARD_TYPES.CASH)
  const [formData, setFormData] = useState(initialFormData)

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

  async function getQuizData() {
    //// toast.success('Fetching My Quiz Data now...')
    setLoading(prev => ({ ...prev, fetchQuizzes: true }))
    const result = await RestApi.get(`${API_URLS.v0.USERS_QUIZ}`)
    if (result?.status === 'success') {
      console.log('Quizzes Fetched result', result)
      //// toast.success('Quizzes Fetched Successfully .')
      setLoading(prev => ({ ...prev, fetchQuizzes: false }))
      setQuizzes(result.result)
    } else {
      // toast.error('Error:' + result?.result?.message)
      console.log('Error Fetching quizes:', result)
      setLoading(prev => ({ ...prev, fetchQuizzes: false }))
      setQuizzes([])
    }
  }

  useEffect(() => {
    getQuizData()
  }, [])

  const handleChangeCountry = countryValue => {
    setSelectedRegion('')
  }

  const validateMobileNumber = number => {
    const regex = /^[6-9]\d{9}$/ // Indian mobile number validation
    return regex.test(number)
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.fullname) {
      newErrors.fullname = 'Full name is required'
    }

    if (sponsorerType === 'organization') {
      if (!formData.orgName) newErrors.orgName = 'Organization name is required'
      if (!formData.website) newErrors.website = 'Website is required'
      if (!formData.orgType) newErrors.orgType = 'Organization type is required'
    }

    if (!formData.mobileNumber) {
      newErrors.mobileNumber = 'Mobile number is required'
    } else if (!validateMobileNumber(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit Indian mobile number'
    }

    if (rewardType === REWARD_TYPES.CASH && !formData.sponsorshipAmount) {
      newErrors.sponsorshipAmount = 'Amount is required'
    } else if (
      rewardType === REWARD_TYPES.CASH &&
      (isNaN(formData.sponsorshipAmount) || formData.sponsorshipAmount <= 0)
    ) {
      newErrors.sponsorshipAmount = 'Please enter a valid amount'
    }

    if (rewardType === REWARD_TYPES.PHYSICAL_GIFT) {
      if (!formData.nonCashItem) newErrors.nonCashItem = 'Item description is required'
      if (!formData.numberOfNonCashItems) {
        newErrors.numberOfNonCashItems = 'Quantity is required'
      } else if (isNaN(formData.numberOfNonCashItems) || formData.numberOfNonCashItems <= 0) {
        newErrors.numberOfNonCashItems = 'Please enter a valid quantity'
      }
      if (!formData.rewardValue) newErrors.rewardValue = 'Estimated value is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    console.log('submitting...')
    if (validateForm()) {
      setLoading(prev => ({ ...prev, submitting: true }))

      try {
        const submissionData = {
          email: session?.user?.email,
          fullname: formData.fullname,
          quizzes: selectedQuizzes,
          sponsorType: 'quiz',
          sponsorerType,
          location: {
            country: selectedCountryObject.country,
            region: selectedRegion,
            city,
            zipCode
          },
          mobileNumber: formData.mobileNumber,
          rewardType,
          currency: 'INR', // Hardcoded as per requirements
          ...(sponsorerType === 'organization' && {
            orgName: formData.orgName,
            website: formData.website,
            orgType: formData.orgType
          }),
          ...(rewardType === REWARD_TYPES.CASH && {
            sponsorshipAmount: formData.sponsorshipAmount
          }),
          ...(rewardType === REWARD_TYPES.PHYSICAL_GIFT && {
            nonCashItem: formData.nonCashItem,
            numberOfNonCashItems: formData.numberOfNonCashItems,
            rewardValue: formData.rewardValue,
            rewardDescription: formData.rewardDescription
          })
        }

        console.log('Form submitted:', submissionData)
        const res = await RestApi.post(API_URLS.v0.SPONSORSHIP, submissionData)
        if (res.status === 'success') {
          router.push(`/sponsor/${res.result._id}/payment`)
          // Reset form
          setSelectedQuizzes([])
          setSelectedCountryObject(null)
          setSelectedRegion('')
          setCity('')
          setZipCode('')
          setSponsorerType('individual')
          setFormData(initialFormData)
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
    console.log({ name, value })
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
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
            type='text'
            name='sponsorshipAmount'
            value={formData.sponsorshipAmount}
            onChange={e => {
              const value = e.target.value.replace(/[^0-9.]/g, '').replace(/^0+(\d)/, '$1')
              handleChange({ target: { name: e.target.name, value } })
            }}
            error={!!errors.sponsorshipAmount}
            helperText={errors.sponsorshipAmount}
          />
        )
      case REWARD_TYPES.PHYSICAL_GIFT:
        return (
          <>
            <TextField
              fullWidth
              sx={{ mb: 3 }}
              label='Item Name'
              name='nonCashItem'
              value={formData.nonCashItem}
              onChange={handleChange}
              error={!!errors.nonCashItem}
              helperText={errors.nonCashItem}
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label='Quantity'
                  type='number'
                  name='numberOfNonCashItems'
                  value={formData.numberOfNonCashItems}
                  onChange={handleChange}
                  error={!!errors.numberOfNonCashItems}
                  helperText={errors.numberOfNonCashItems}
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label='Estimated Value (INR)'
                  type='number'
                  name='rewardValue'
                  value={formData.rewardValue}
                  onChange={handleChange}
                  error={!!errors.rewardValue}
                  helperText={errors.rewardValue}
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
            </Grid>
            <TextField
              fullWidth
              sx={{ mt: 3 }}
              label='Additional Details About The Gift'
              name='rewardDescription'
              value={formData.rewardDescription}
              onChange={handleChange}
              multiline
              rows={2}
            />
          </>
        )
      default:
        return null
    }
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant='h4' gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        Sponsor Traditional Knowledge Quizzes
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
        {/* Quizzes Selection */}
        {/* Quizzes Selection */}
        <FormControl fullWidth sx={{ mb: 3 }} error={!!errors.selectedQuizzes}>
          <InputLabel>Select Quizzes</InputLabel>
          <Select
            name='quiz'
            value={selectedQuizzes}
            label='Select Quizzes'
            onChange={e => {
              const value = e.target.value

              // If user clicked "any-quiz" (check if it's the last selected item)
              if (value[value.length - 1] === 'any-quiz') {
                // When selecting "any-quiz", deselect all other quizzes
                setSelectedQuizzes(['any-quiz'])
              }
              // If user selected a regular quiz (not "any-quiz")
              else {
                // Deselect "any-quiz" if it was previously selected
                const newSelection = value.filter(v => v !== 'any-quiz')

                // If no quizzes are selected, default to "any-quiz"
                if (newSelection.length === 0) {
                  setSelectedQuizzes(['any-quiz'])
                } else {
                  setSelectedQuizzes(newSelection)
                }
              }
            }}
            onFocus={() => setErrors(prev => ({ ...prev, selectedQuizzes: '' }))}
            required
            multiple
            renderValue={selected => {
              if (selected.includes('any-quiz')) {
                return 'Sponsor Any Quiz'
              }
              // Map selected IDs to their quiz titles
              const selectedTitles = selected.map(id => {
                const quiz = quizzes.find(q => q._id === id)
                return quiz ? quiz.title : id
              })
              return selectedTitles.join(', ')
            }}
          >
            {/* "Sponsoring Any Quiz" option */}
            <MenuItem key='any-quiz' value='any-quiz'>
              <Grid container alignItems='center' spacing={2} justifyContent='space-between'>
                <Grid item xs={12}>
                  <Typography variant='body2' noWrap={false}>
                    <Box component='span' fontWeight='bold'>
                      Sponsor Any Quiz
                    </Box>
                  </Typography>
                  <Typography variant='body2' noWrap={false}>
                    <Box component='span' sx={{ color: 'text.secondary', mx: 0.5 }}>
                      Will be applied to all available quizzes
                    </Box>
                  </Typography>
                </Grid>
              </Grid>
            </MenuItem>

            {/* Regular quiz options */}
            {quizzes.map(quiz => (
              <MenuItem key={quiz._id} value={quiz._id}>
                <Grid container alignItems='center' spacing={2} justifyContent='space-between'>
                  <Grid item xs={8}>
                    <Grid container alignItems='center' spacing={2}>
                      <Grid item>
                        <img
                          src={quiz?.thumbnail || 'https://via.placeholder.com/150x150'}
                          alt={quiz.title}
                          style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                        />
                      </Grid>
                      <Grid item>
                        <Typography variant='body2' noWrap={false}>
                          <Box component='span' fontWeight='bold'>
                            {quiz.title}
                          </Box>
                          <Box component='span' sx={{ color: 'text.secondary', mx: 0.5 }}>
                            - by
                          </Box>
                          <Box component='span'>{quiz.createdBy}</Box>
                        </Typography>
                        <Typography variant='body2' color='textSecondary' noWrap>
                          {quiz.details}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{errors.selectedQuizzes || 'Select a quiz'}</FormHelperText>
        </FormControl>
        {/* <FormControl fullWidth sx={{ mb: 3 }} error={!!errors.selectedQuizzes}>
          <InputLabel id='quizzes-select-label'>Select Quizzes to Sponsor</InputLabel>
          <Select
            labelId='quizzes-select-label'
            label='Select Quizzes to Sponsor'
            multiple
            value={selectedQuizzes}
            onChange={e => {
              setSelectedQuizzes(e.target.value)
              if (errors.selectedQuizzes) setErrors({ ...errors, selectedQuizzes: '' })
            }}
            renderValue={selected => {
              // Map selected IDs to their quiz titles
              const selectedTitles = selected.map(id => {
                const quiz = quizzes.find(q => q._id === id)
                return quiz ? quiz.title : id // Fallback to ID if quiz not found
              })
              return selectedTitles.join(', ') // Display titles separated by commas
            }}
          >
            {quizzes.map(quiz => (
              <MenuItem key={quiz._id} value={quiz._id}>
                <Checkbox checked={selectedQuizzes.indexOf(quiz._id) > -1} />
                <ListItemText primary={quiz.title} />
              </MenuItem>
            ))}
          </Select>
          {errors.selectedQuizzes && <FormHelperText error>{errors.selectedQuizzes}</FormHelperText>}
        </FormControl> */}

        {/* Location Selection */}
        <Typography variant='h6' gutterBottom>
          Sponsorship Location
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <CountryRegionDropdown
              defaultCountryCode=''
              selectedCountryObject={selectedCountryObject}
              setSelectedCountryObject={setSelectedCountryObject}
              onCountryChange={handleChangeCountry}
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
        <RadioGroup
          style={{ display: 'block' }}
          value={sponsorerType}
          onChange={e => setSponsorerType(e.target.value)}
          sx={{ mb: 2 }}
        >
          <FormControlLabel value='individual' control={<Radio />} label='Sponsor as an Individual' />
          <FormControlLabel value='organization' control={<Radio />} label='Sponsor as an Organization' />
        </RadioGroup>

        {/* Basic Information */}
        <TextField
          fullWidth
          sx={{ mb: 3 }}
          label={sponsorerType === 'individual' ? 'Your Full Name' : 'Contact Person Name'}
          name='fullname'
          value={formData.fullname}
          onChange={handleChange}
          error={!!errors.fullname}
          helperText={errors.fullname}
        />

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

export default SponsorQuizzes
