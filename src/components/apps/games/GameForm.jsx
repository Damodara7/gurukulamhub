import React, { useState, useEffect, useRef } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  Autocomplete,
  Snackbar,
  Alert,
  FormLabel,
  RadioGroup,
  Radio
} from '@mui/material'
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  DateRange as DateRangeIcon,
  AccessTime as AccessTimeIcon,
  VideocamOff as VideocamOffIcon
} from '@mui/icons-material'

import RewardDialog from './RewardDialog'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import dayjs from 'dayjs'
import ReactPlayer from 'react-player'
import CountryRegionDropdown from '@/views/pages/auth/register-multi-steps/CountryRegionDropdown'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import Loading from '@/components/Loading'
import { getCountryByName } from '@/utils/countryRegionUtil'
// Reward position options
const POSITION_OPTIONS = [1, 2, 3, 4, 5]

//validate the form

const validateForm = formData => {
  const errors = {}
  if (!formData.title) {
    errors.title = 'Game title is required.'
  }
  if (!formData.pin || formData.pin.length !== 6 || isNaN(formData.pin)) {
    errors.pin = 'A valid 6-digit PIN is required.'
  }
  if (!formData.quiz) {
    errors.quiz = 'Quiz selection is required.'
  }
  if (!formData.thumbnailPoster) {
    errors.thumbnailPoster = 'Thumbnail image is required.'
  }

  if (formData.startTime === null) {
    errors.startTime = 'Start time is required.'
  } else {
    const parsedDate = dayjs(formData.startTime)
    if (!parsedDate.isValid()) {
      errors.startTime = 'Invalid date format. Please select a valid time'
    } else if (!parsedDate.isAfter(dayjs())) {
      errors.startTime = 'Start time must be in the future.'
    }
  }

  if (formData.requireRegistration) {
    if (formData.registrationEndTime === null) {
      errors.registrationEndTime = 'Please enter a valid date'
    } else if (new Date(formData.registrationEndTime) >= new Date(formData.startTime)) {
      errors.registrationEndTime = 'Registration end time must be before the start time'
    }
  }

  // Only validate duration if gameMode is self-paced
  if (formData.gameMode === 'self-paced') {
    if (!formData.duration || formData.duration < 1) {
      errors.duration = 'Duration must be at least 1 minute.'
    }
  }
  // Only validate forwardType if gameMode is live
  if (formData.gameMode === 'live') {
    if (!formData.forwardType) {
      errors.forwardType = 'Forward type is required for live games.'
    }
  }

  if (formData.limitPlayers && (!formData.maxPlayers || formData.maxPlayers <= 0)) {
    errors.maxPlayers = 'Maximum players must be a positive number.'
  }
  if (!formData.promotionalVideoUrl || !formData.promotionalVideoUrl.startsWith('https://')) {
    errors.promotionalVideoUrl = 'Please enter a valid promotional video URL.'
  }
  return errors
}

const formFieldOrder = [
  'title',
  'pin',
  'description',
  'quiz',
  'startTime',
  'gameMode',
  'duration',
  'requireRegistration',
  'registrationEndTime',
  'limitPlayers',
  'maxPlayers',
  'location.country',
  'location.region',
  'location.city',
  'promotionalVideoUrl',
  'thumbnailPoster',
  'tags',
  'rewards',
  'forwardType'
]

// Main Game Form component
const GameForm = ({ onSubmit, quizzes, onCancel, data = null }) => {
  // Initial form data
  const initialFormData = {
    title: '',
    pin: Math.floor(100000 + Math.random() * 900000).toString(),
    description: '',
    quiz: '',
    timezone: '',
    startTime: null,
    duration: null, // 10 minutes in seconds
    promotionalVideoUrl: '',
    thumbnailPoster: '',
    forwardType: 'auto',
    gameMode: 'live',
    requireRegistration: false,
    registrationEndTime: null,
    limitPlayers: false,
    maxPlayers: 100000,
    tags: [],
    location: {
      country: '',
      region: '',
      city: ''
    },
    rewards: []
  }
  const [formData, setFormData] = useState(initialFormData)
  const [availablePositions, setAvailablePositions] = useState(POSITION_OPTIONS)
  const [selectedCountryObject, setSelectedCountryObject] = useState(null)
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [cityOptions, setCityOptions] = useState([])
  const [errors, setErrors] = useState({})
  const [touches, setTouches] = useState({})
  const fileInputRef = useRef(null)
  const [showErrorSnackbar, setShowErrorSnackbar] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Loading state
  const [loading, setLoading] = useState({
    fetchCities: false,
    submitting: false
  })

  // Reward Dialog states
  const [openRewardDialog, setOpenRewardDialog] = useState(false)
  const [editingReward, setEditingReward] = useState(null)

  // Create refs for each field
  const fieldRefs = {
    title: useRef(),
    pin: useRef(),
    description: useRef(),
    quiz: useRef(),
    startTime: useRef(),
    duration: useRef(),
    registrationEndTime: useRef(),
    maxPlayers: useRef(),
    promotionalVideoUrl: useRef(),
    thumbnailPoster: useRef(),
    tags: useRef(),
    forwardType: useRef(),
    gameMode: useRef()
    // Add more if needed
  }
  // If Edit Game?
  useEffect(() => {
    if (data) {
      console.log({ data })
      setFormData({
        ...initialFormData, // Start with initial values
        ...data,
        quiz: data?.quiz?._id || null,
        startTime: data?.startTime ? new Date(data.startTime) : null,
        registrationEndTime: data?.registrationEndTime ? new Date(data.registrationEndTime) : null,
        duration: data?.duration ? Math.floor(data.duration / 60) : '',
        gameMode: data?.gameMode || 'live'
      })
      setSelectedCountryObject(
        data?.location?.country
          ? { country: data?.location?.country, countryCode: getCountryByName(data?.location?.country)?.countryCode }
          : null
      )
      setSelectedRegion(data?.location?.region || '')
      setSelectedCity(data?.location?.city || '')
    }
  }, [data])

  // Update available positions when rewards change
  useEffect(() => {
    const usedPositions = formData?.rewards?.map(r => r.position)
    setAvailablePositions(POSITION_OPTIONS.filter(pos => !usedPositions.includes(pos)))
  }, [formData?.rewards])

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

  useEffect(() => {
    getCitiesData()
  }, [])

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setTouches(prev => ({ ...prev, [name]: true })) // Mark field as touched
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name] // Remove error for this field
        return newErrors
      })
    }

    if (name.includes('.')) {
      // Handle nested fields (like location.country)
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
    }
  }

  const handleDateChange = (name, date) => {
    console.log('Type of date: ', typeof date)
    setTouches(prev => ({ ...prev, [name]: true })) // Mark field as touched
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name] // Remove error for this field
        return newErrors
      })
    }

    setFormData(prev => ({
      ...prev,
      [name]: date
    }))
  }

  const handleBlur = e => {
    const { name } = e.target
    setTouches(prev => ({ ...prev, [name]: true })) // Mark field as touched
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
        delete newErrors[fieldname] // Remove error for this field
        return newErrors
      })
    }
  }

  // ********* Reward Related Functions - START ***********
  const handleAddReward = () => {
    setEditingReward(null)
    setOpenRewardDialog(true)
  }

  const handleEditReward = reward => {
    setEditingReward(reward)
    setOpenRewardDialog(true)
  }

  const handleSaveReward = (reward, updatedDisplaySponsorships) => {
    console.log('saving reward...: ', reward)
    // update all sponsors with the same sponsorshipId across all rewards whenever a reward is saved,
    //  ensuring they reflect the latest availableItems/availableAmount
    setFormData(prev => {
      // First create a map of the latest sponsor data from the current reward
      const latestSponsorsMap = new Map()
      reward.sponsors?.forEach(sponsor => {
        latestSponsorsMap.set(sponsor.sponsorshipId, {
          ...(reward.rewardType === 'cash'
            ? { availableAmount: sponsor.availableAmount }
            : { availableItems: sponsor.availableItems }),
          allocated: sponsor.allocated,
          rewardType: sponsor.rewardType
        })
      })

      console.log('latestSponsorsMap: ', latestSponsorsMap)

      let updatedRewards = prev.rewards

      // START:  Update all rewards to reflect the removed sponsors - correct avaialableAmount/availableItems by adding their allocated amount/items (compare currentReward.sponsors with matching reward (in formData.rewards sponsors)
      const prevVersionOfCurrentReward = updatedRewards?.find(r => (r?._id || r?.id) === (reward?._id || reward?.id))
      const removedSponsorsMap = new Map()
      prevVersionOfCurrentReward?.sponsors?.forEach(prevSponsor => {
        const currentSponsor = reward.sponsors.find(s => (s?._id || s?.id) === (prevSponsor?._id || prevSponsor?.id))
        if (!currentSponsor) {
          removedSponsorsMap.set(prevSponsor?._id || prevSponsor?.id, {
            allocated: prevSponsor.allocated,
            rewardType: prevSponsor.rewardType,
            sponsorship: updatedDisplaySponsorships.find(s => (s?._id || s?.id) === prevSponsor?.sponsorshipId)
          })
        }
      })

      console.log('removedSponsorsMap in handleSaveReward in GameForm : ', removedSponsorsMap)

      // anyMap.forEach((value, key) => {
      removedSponsorsMap?.forEach(({ allocated, rewardType, sponsorship }, sponsorId) => {
        updatedRewards?.forEach(r => {
          r?.sponsors?.forEach(s => {
            if (s.sponsorshipId === sponsorship?._id) {
              s.availableAmount = sponsorship?.availableAmount
              s.availableItems = sponsorship?.availableItems
              s.sponsored = sponsorship?.sponsored
            }
          })
        })
      })
      console.log('updatedRewards after removing sponsors: ', updatedRewards)
      // END:  Update all rewards to reflect the removed sponsors - correct avaialableAmount/availableItems by adding their allocated amount/items (compare currentReward.sponsors with matching reward (in formData.rewards sponsors)

      // Update all rewards
      updatedRewards = updatedRewards?.map(r => {
        // For the current reward being saved, just use it as-is
        if ((r?._id || r?.id) === (reward?._id || reward?.id)) {
          console.log('Reward ....', reward)
          return reward
        }

        // For other rewards, update any matching sponsors
        const updatedSponsors = r.sponsors?.map(sponsor => {
          const latestSponsorData = latestSponsorsMap.get(sponsor.sponsorshipId)
          if (latestSponsorData) {
            return {
              ...sponsor,
              ...(reward.rewardType === 'cash'
                ? { availableAmount: latestSponsorData.availableAmount }
                : { availableItems: latestSponsorData.availableItems })
            }
          }
          return sponsor
        })

        console.log('updatedSponsors: ', updatedSponsors)

        return {
          id: Date.now().toString(),
          ...r,
          sponsors: updatedSponsors || []
        }
      })

      // Handle adding new reward or updating existing
      const finalRewards = editingReward ? updatedRewards : [...updatedRewards, reward]
      console.log('finalRewards: ', finalRewards)

      return {
        ...prev,
        rewards: finalRewards
      }
    })
  }

  const handleRemoveReward = rewardId => {
    setFormData(prev => {
      // Find the reward being removed
      const removedReward = prev.rewards.find(r => (r?._id || r?.id) === rewardId)

      // Create a map of sponsorships that need to be updated
      const sponsorshipsToUpdate = new Map()

      // For each sponsor in the removed reward
      removedReward?.sponsors?.forEach(sponsor => {
        const sponsorshipId = sponsor.sponsorshipId
        const currentData = sponsorshipsToUpdate.get(sponsorshipId) || {
          cash: 0,
          items: 0,
          rewardType: sponsor.rewardType
        }

        // Add the allocated amount/items back to the sponsorship
        if (sponsor.rewardType === 'cash') {
          currentData.cash += parseFloat(sponsor.allocated) || 0
        } else {
          currentData.items += parseFloat(sponsor.allocated) || 0
        }

        sponsorshipsToUpdate.set(sponsorshipId, currentData)
      })

      // Update remaining rewards with the new sponsorship data
      const updatedRewards = prev.rewards
        .filter(r => (r?._id || r?.id) !== rewardId) // Remove the reward
        .map(reward => {
          // Update sponsors in this reward
          const updatedSponsors = reward.sponsors?.map(sponsor => {
            const updatedData = sponsorshipsToUpdate.get(sponsor.sponsorshipId)
            if (updatedData) {
              return {
                ...sponsor,
                ...(sponsor.rewardType === 'cash'
                  ? { availableAmount: sponsor.availableAmount + updatedData.cash }
                  : { availableItems: sponsor.availableItems + updatedData.items })
              }
            }
            return sponsor
          })

          return {
            ...reward,
            sponsors: updatedSponsors
          }
        })

      return {
        ...prev,
        rewards: updatedRewards
      }
    })
  }
  // ********* Reward Related Functions - END ***********

  const handleSubmit = async e => {
    e.preventDefault()
    const formErrors = validateForm(formData)
    setErrors(formErrors)
    const allFields = Object.keys(formData)
    const touchedFields = allFields.reduce((acc, field) => {
      acc[field] = true
      return acc
    }, {})
    setTouches(touchedFields)

    if (Object.keys(formErrors).length > 0) {
      // Show error snackbar with the first error in form field order
      let firstError = ''
      let firstErrorField = ''
      for (const field of formFieldOrder) {
        if (formErrors[field]) {
          firstError = formErrors[field]
          firstErrorField = field
          break
        }
      }
      if (!firstError) firstError = Object.values(formErrors)[0]
      setErrorMessage(firstError)
      setShowErrorSnackbar(true)

      // Scroll to the first errored field if ref exists
      if (firstErrorField && fieldRefs[firstErrorField] && fieldRefs[firstErrorField].current) {
        fieldRefs[firstErrorField].current.scrollIntoView({ behavior: 'smooth', block: 'center' })
        // Optionally, focus the field
        if (typeof fieldRefs[firstErrorField].current.focus === 'function') {
          fieldRefs[firstErrorField].current.focus()
        }
      }
      return // If there are validation errors, do not submit
    }
    // Only include relevant fields
    const submission = {
      ...formData,
      location: { country: selectedCountryObject?.country, region: selectedRegion, city: selectedCity }
    }
    if (formData.gameMode !== 'self-paced') {
      delete submission.duration
    }
    if (formData.gameMode !== 'live') {
      delete submission.forwardType
      submission.duration = Number(submission.duration)
    }
    console.log('submission data: ', submission)
    await onSubmit(submission)
  }

  // Image upload
  const handleImageUpload = async e => {
    const file = e.target.files[0]
    if (!file) return

    let updatingFormData = { ...formData }

    // Resize image if over 2MB
    if (file.size > 2 * 1024 * 1024) {
      try {
        const compressedFile = await compressImage(file)
        updatingFormData = { ...updatingFormData, thumbnailPoster: compressedFile }
        setFormData(updatingFormData)
        validateThumbnailPoster(updatingFormData)
      } catch (error) {
        console.error('Compression error:', error)
      }
    } else {
      const reader = new FileReader()
      reader.onload = event => {
        updatingFormData = { ...updatingFormData, thumbnailPoster: event.target.result }
        setFormData(updatingFormData)
        validateThumbnailPoster(updatingFormData)
      }
      reader.readAsDataURL(file)
    }
    function validateThumbnailPoster(latestFormData) {
      setTouches(prev => ({ ...prev, thumbnailPoster: true }))
      validateField('thumbnailPoster', latestFormData)
    }
  }

  // Image compression function
  const compressImage = file => {
    return new Promise(resolve => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = event => {
        const img = new Image()
        img.src = event.target.result
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const MAX_WIDTH = 800
          const MAX_HEIGHT = 800
          let width = img.width
          let height = img.height

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width
              width = MAX_WIDTH
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height
              height = MAX_HEIGHT
            }
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)

          canvas.toBlob(
            blob => {
              resolve(URL.createObjectURL(blob))
            },
            'image/jpeg',
            0.7
          )
        }
      }
    })
  }

  const triggerFileInput = () => {
    fileInputRef.current.click()
  }

  const handleChangeCountry = countryValue => {
    setSelectedRegion('')
  }

  // Handle gameMode change to clear irrelevant fields' errors/touches
  const handleGameModeChange = e => {
    const { value } = e.target
    setFormData(prev => ({
      ...prev,
      gameMode: value
    }))
    setTouches(prev => {
      const newTouches = { ...prev }
      if (value === 'live') {
        delete newTouches.duration
      } else {
        delete newTouches.forwardType
      }
      return newTouches
    })
    setErrors(prev => {
      const newErrors = { ...prev }
      if (value === 'live') {
        delete newErrors.duration
      } else {
        delete newErrors.forwardType
      }
      return newErrors
    })
  }

  return (
    <Grid container spacing={3}>
      {/* Add Snackbar for error messages */}
      <Snackbar
        open={showErrorSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowErrorSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{
          '& .MuiSnackbar-root': {
            top: { xs: 90, sm: 0 }
          }
        }}
      >
        <Alert
          onClose={() => setShowErrorSnackbar(false)}
          severity='error'
          variant='filled'
          sx={{
            width: '100%',
            animation: 'slideUp 0.5s ease-out',
            '@keyframes slideUp': {
              '0%': {
                transform: 'translateY(100%)',
                opacity: 0
              },
              '100%': {
                transform: 'translateY(0)',
                opacity: 1
              }
            }
          }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>

      {/* Basic Information */}
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label='Game Title'
          name='title'
          value={formData.title}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={() => setErrors(prev => ({ ...prev, title: '' }))}
          error={!!errors.title && touches.title}
          helperText={errors.title || 'Enter the title'}
          required
          inputRef={fieldRefs.title}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label='6-digit PIN'
          name='pin'
          value={formData.pin}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={() => setErrors(prev => ({ ...prev, pin: '' }))}
          error={!!errors.pin && touches.pin}
          helperText={errors.pin || 'Enter a unique 6-digit PIN'}
          required
          inputProps={{ maxLength: 6, pattern: '\\d{6}' }}
          inputRef={fieldRefs.pin}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label='Description'
          name='description'
          value={formData.description}
          onChange={handleChange}
          hypertext={'enter the description'}
          multiline
          rows={3}
          inputRef={fieldRefs.description}
        />
      </Grid>

      {/* Quiz Selection */}
      <Grid item xs={12}>
        <FormControl fullWidth error={!!errors.quiz && touches.quiz}>
          <InputLabel>Quiz</InputLabel>
          <Select
            name='quiz'
            value={formData.quiz}
            label='Quiz'
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={() => setErrors(prev => ({ ...prev, quiz: '' }))}
            required
            ref={fieldRefs.quiz}
          >
            <MenuItem value=''>
              <em>Select Quiz</em>
            </MenuItem>
            {quizzes.map(quiz => (
              <MenuItem key={quiz._id} value={quiz._id}>
                <Grid container alignItems='center' spacing={2} justifyContent='space-between'>
                  {/* Left side - Thumbnail and Quiz Info */}
                  <Grid item xs={8}>
                    <Grid container alignItems='center' spacing={2}>
                      {/* Quiz Thumbnail */}
                      <Grid item>
                        <img
                          src={quiz?.thumbnail || 'https://via.placeholder.com/150x150'}
                          alt={quiz.title}
                          style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                        />
                      </Grid>

                      {/* Title and Details */}
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
          <FormHelperText>{errors.quiz || 'Select a quiz'}</FormHelperText>
        </FormControl>
      </Grid>

      {/* Start Date & Time */}
      <Grid item xs={12} md={6}>
        <DateTimePicker
          disablePast
          minDateTime={dayjs().add(1, 'minute')}
          timeSteps={{ hours: 1, minutes: 1 }}
          sx={{ width: '100%' }}
          label='Start Time'
          value={formData.startTime ? dayjs(formData.startTime) : null}
          onChange={newValue => {
            // explicitly set to 'null' if cleared
            const newDate = newValue ? newValue.toDate() : null
            console.log('new Date ', newDate)

            handleDateChange('startTime', newDate)

            validateField('startTime')
            if (formData.requireRegistration) {
              validateField('registrationEndTime')
            }
          }}
          onClose={() => validateField('startTime')}
          slotProps={{
            textField: {
              error: !!errors.startTime && touches.startTime,
              helperText: (touches.startTime && errors.startTime) || 'Select the start time',
              required: true,
              onBlur: () => {
                setTouches(prev => ({ ...prev, startTime: true }))
                validateField('startTime')
              },
              onFocus: () => {
                setTouches(prev => ({ ...prev, startTime: true }))
                setErrors(prev => ({ ...prev, startTime: undefined }))
              },
              InputLabelProps: {
                shrink: true
              },
              inputRef: fieldRefs.startTime
            }
          }}
        />
      </Grid>

      {/* Game Mode Selection */}
      <Grid item xs={6}>
        <FormControl fullWidth required error={!!errors.gameMode && touches.gameMode}>
          <InputLabel id='game-mode-label'>Game Mode</InputLabel>
          <Select
            labelId='game-mode-label'
            id='game-mode-select'
            name='gameMode'
            value={formData.gameMode}
            label='Game Mode'
            onChange={handleGameModeChange}
            onBlur={handleBlur}
            onFocus={() => setErrors(prev => ({ ...prev, gameMode: '' }))}
            inputRef={fieldRefs.gameMode}
          >
            <MenuItem value='live'>Live</MenuItem>
            <MenuItem value='self-paced'>Self-paced</MenuItem>
          </Select>
          <FormHelperText>
            {formData.gameMode === 'live'
              ? 'The game will be live for all players'
              : 'The game will be like an assessment'}
          </FormHelperText>
        </FormControl>
      </Grid>

      {/* Forward Type Selection - now as Select, only if live */}
      {formData.gameMode === 'live' && (
        <Grid item xs={6}>
          <FormControl fullWidth required error={!!errors.forwardType && touches.forwardType}>
            <InputLabel id='forward-type-label'>Forward Type</InputLabel>
            <Select
              labelId='forward-type-label'
              id='forward-type-select'
              name='forwardType'
              value={formData.forwardType}
              label='Forward Type'
              onChange={handleChange}
              onBlur={handleBlur}
              onFocus={() => setErrors(prev => ({ ...prev, forwardType: '' }))}
              inputRef={fieldRefs.forwardType}
            >
              <MenuItem value='auto'>Auto</MenuItem>
              <MenuItem value='admin'>Admin</MenuItem>
            </Select>
            <FormHelperText>Select how the game will be forwarded</FormHelperText>
          </FormControl>
        </Grid>
      )}

      {/* Duration (only if self-paced) */}
      {formData.gameMode === 'self-paced' && (
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label='Duration (minutes)'
            name='duration'
            type='number'
            value={formData.duration}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={() => setErrors(prev => ({ ...prev, duration: '' }))}
            error={!!errors.duration && touches.duration}
            helperText={errors.duration || 'Enter the duration in minutes'}
            required
            inputProps={{ min: 1 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <AccessTimeIcon />
                </InputAdornment>
              )
            }}
            inputRef={fieldRefs.duration}
          />
        </Grid>
      )}

      <Grid item xs={12} md={6}></Grid>

      {/* Registration */}
      <Grid item xs={12} md={6}>
        <FormControlLabel
          control={
            <Checkbox checked={formData.requireRegistration} onChange={handleChange} name='requireRegistration' />
          }
          label='Require Registration'
        />
        {formData.requireRegistration && (
          <DateTimePicker
            disablePast
            minDateTime={dayjs().add(1, 'minute')} // ensure the future time
            maxDateTime={dayjs(formData.startTime).subtract(1, 'minute')} // must be before start time
            timeSteps={{ hours: 1, minutes: 1 }}
            sx={{ width: '100%' }}
            label='Registration End Time'
            value={formData.registrationEndTime ? dayjs(formData.registrationEndTime) : null}
            onChange={newValue => {
              handleDateChange('registrationEndTime', newValue ? newValue.toDate() : null)
              validateField('registrationEndTime')
            }}
            onClose={() => validateField('registrationEndTime')}
            slotProps={{
              textField: {
                error: !!errors.registrationEndTime && touches.registrationEndTime,
                helperText:
                  (touches.registrationEndTime && errors.registrationEndTime) || 'Select the registration end time',
                required: true,
                onBlur: () => {
                  setTouches(prev => ({ ...prev, registrationEndTime: true }))
                  validateField('registrationEndTime')
                },
                onFocus: () => {
                  setTouches(prev => ({ ...prev, registrationEndTime: true }))
                  setErrors(prev => ({ ...prev, registrationEndTime: undefined }))
                },
                InputLabelProps: {
                  shrink: true
                },
                inputRef: fieldRefs.registrationEndTime
              }
            }}
          />
        )}
      </Grid>

      {/* Limit Players */}
      <Grid item xs={12} md={6}>
        <FormControlLabel
          control={<Checkbox checked={formData.limitPlayers} onChange={handleChange} name='limitPlayers' />}
          label='Limit Players'
        />
        {formData.limitPlayers && (
          <TextField
            fullWidth
            label='Max Players'
            name='maxPlayers'
            type='number'
            value={formData.maxPlayers}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={() => setErrors(prev => ({ ...prev, maxPlayers: '' }))}
            error={!!errors.maxPlayers && touches.maxPlayers}
            helperText={errors.maxPlayers || 'Set a maximum number of players'}
            inputProps={{ min: 1 }}
            inputRef={fieldRefs.maxPlayers}
          />
        )}
      </Grid>

      {/* Location */}
      <Grid item xs={12}>
        <Typography variant='subtitle1' gutterBottom>
          Location (Optional)
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <CountryRegionDropdown
              defaultCountryCode=''
              selectedCountryObject={selectedCountryObject}
              setSelectedCountryObject={setSelectedCountryObject}
              onCountryChange={handleChangeCountry}
            />
          </Grid>

          {selectedCountryObject?.country && (
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <Autocomplete
                  autoHighlight
                  onChange={(e, newValue) => {
                    setSelectedRegion(newValue)
                    getCitiesData(newValue)
                    setSelectedCity('')
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

      {/* Media Section */}
      <Grid item xs={12}>
        <Box
          sx={{
            border: '1px dashed',
            borderColor: 'divider',
            borderRadius: 1,
            p: 3,
            mb: 2
          }}
        >
          <Typography variant='subtitle1' gutterBottom sx={{ mb: 2 }}>
            Media
          </Typography>

          <Grid container spacing={3}>
            {/* Video Section - Full width on xs, half on md+ */}
            <Grid item xs={12} md={6}>
              <Box sx={{ height: '100%' }}>
                <Typography variant='subtitle2' gutterBottom>
                  Promotional Video
                </Typography>
                <TextField
                  fullWidth
                  label='Video URL'
                  name='promotionalVideoUrl'
                  value={formData.promotionalVideoUrl}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onFocus={() => setErrors(prev => ({ ...prev, promotionalVideoUrl: '' }))}
                  error={!!errors.promotionalVideoUrl && touches.promotionalVideoUrl}
                  helperText={errors.promotionalVideoUrl || 'Enter a YouTube or video URL'}
                  type='url'
                  placeholder='https://youtube.com/watch?v=...'
                  inputRef={fieldRefs.promotionalVideoUrl}
                />
                <Box
                  sx={{
                    mt: 2,
                    borderRadius: 1,
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: 'divider',
                    height: '200px',
                    backgroundColor: '#f5f5f5',
                    position: 'relative'
                  }}
                >
                  {formData.promotionalVideoUrl ? (
                    <ReactPlayer
                      url={formData.promotionalVideoUrl}
                      width='100%'
                      height='200px'
                      controls
                      style={{ backgroundColor: '#f5f5f5' }}
                    />
                  ) : (
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        textAlign: 'center',
                        p: 2
                      }}
                    >
                      <VideocamOffIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                      <Typography variant='body2' color='text.secondary'>
                        No video URL provided
                      </Typography>
                      <Typography variant='caption' color='text.disabled'>
                        Add a YouTube or video URL above
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Grid>

            {/* Image Upload Section - Full width on xs, half on md+ */}
            <Grid item xs={12} md={6}>
              <Box sx={{ height: '100%' }}>
                <Typography variant='subtitle2' gutterBottom>
                  Thumbnail Image
                </Typography>
                <input
                  type='file'
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  onBlur={handleBlur}
                  accept='image/*'
                  style={{ display: 'none' }}
                />
                {formData.thumbnailPoster ? (
                  <Box sx={{ position: 'relative',
                    mb: 2,
                    height: '200px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f5f5f5' // Light gray background for error state
                }}>
                    <img
                      src={formData.thumbnailPoster}
                      alt='Game thumbnail'
                      style={{
                        width: '100%',
                        height: '200px',
                        objectFit: 'cover',
                        borderRadius: 4,
                        border: '1px solid #e0e0e0'
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        display: 'flex',
                        gap: 1,
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: 1,
                        p: 0.5,
                        boxShadow: 1,
                        zIndex:2,
                        transform: 'translateY(-1px)',
                      }}
                    >
                      <IconButton
                        color='primary'
                        size='small'
                        onClick={triggerFileInput}
                        sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}
                      >
                        <EditIcon fontSize='small' />
                      </IconButton>
                      <IconButton
                        color='error'
                        size='small'
                        onClick={() => {
                          if (formData.thumbnailPoster.startsWith('blob:')) {
                            URL.revokeObjectURL(formData.thumbnailPoster)
                          }
                          let updatingFormData = { ...formData, thumbnailPoster: '' }
                          setFormData(updatingFormData)
                          setTouches(prev => ({ ...prev, thumbnailPoster: true })) // Mark field as touched
                          validateField('thumbnailPoster', updatingFormData)
                        }}
                        sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}
                      >
                        <DeleteIcon fontSize='small' />
                      </IconButton>
                    </Box>
                  </Box>
                ) : (
                  <Box
                    onClick={triggerFileInput}
                    sx={{
                      height: '200px',
                      border: '2px dashed',
                      borderColor: !!errors.thumbnailPoster && touches.thumbnailPoster ? 'red' : 'divider',
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      backgroundColor: 'action.hover',
                      '&:hover': {
                        backgroundColor: 'action.selected'
                      }
                    }}
                  >
                    <Typography color='text.secondary'>Click to upload thumbnail image</Typography>
                  </Box>
                )}
                <TextField
                  fullWidth
                  label='Or enter image URL'
                  name='thumbnailPoster'
                  value={formData.thumbnailPoster}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onFocus={() => setErrors(prev => ({ ...prev, thumbnailPoster: '' }))}
                  error={!!errors.thumbnailPoster && touches.thumbnailPoster}
                  helperText={errors.thumbnailPoster}
                  placeholder='https://example.com/image.jpg'
                  type='url'
                  sx={{ mt: 2 }}
                  inputRef={fieldRefs.thumbnailPoster}
                />
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Grid>

      <Grid item xs={12}>
        <Autocomplete
          multiple
          freeSolo
          options={[]}
          value={formData.tags}
          onChange={(event, newValue) => {
            setFormData(prev => ({ ...prev, tags: newValue }))
          }}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip key={index} variant='outlined' label={option} {...getTagProps({ index })} />
            ))
          }
          renderInput={params => (
            <TextField {...params} label='Tags' placeholder='Add tags' inputRef={fieldRefs.tags} />
          )}
        />
      </Grid>

      {/* Rewards Section */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <Stack direction='row' justifyContent='space-between' alignItems='center'>
          <Typography variant='h5'>Rewards</Typography>
          <Button
            variant='outlined'
            startIcon={<AddIcon />}
            onClick={handleAddReward}
            disabled={availablePositions.length === 0}
          >
            Add Reward
          </Button>
        </Stack>

        {formData?.rewards?.length === 0 ? (
          <Typography variant='body2' color='text.secondary' sx={{ mt: 2 }}>
            No rewards added yet
          </Typography>
        ) : (
          <Box sx={{ mt: 2 }}>
            {formData?.rewards
              ?.sort((a, b) => a.position - b.position)
              ?.map(reward => {
                // Calculate total cash reward if reward type is cash
                const totalCashReward =
                  reward.rewardType === 'cash' ? reward.rewardValuePerWinner * reward.numberOfWinnersForThisPosition : 0

                return (
                  <Card key={reward?._id || reward?.id} variant='outlined' sx={{ mb: 2 }}>
                    <CardContent>
                      <Stack direction='row' justifyContent='space-between' alignItems='center' mb={2}>
                        <Typography variant='h6'>Position {reward.position} Reward</Typography>
                        <Stack direction='row'>
                          <IconButton onClick={() => handleEditReward(reward)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton onClick={() => handleRemoveReward(reward?._id || reward?.id)}>
                            <CloseIcon />
                          </IconButton>
                        </Stack>
                      </Stack>

                      <Stack spacing={1} mb={2}>
                        <Typography variant='body1'>
                          {reward.rewardType === 'cash' ? (
                            <>
                              Cash Reward: {reward.currency} {reward.rewardValuePerWinner} per winner
                              <Typography variant='body2' color='text.secondary'>
                                Total: {reward.currency} {totalCashReward.toFixed(2)} (
                                {reward.numberOfWinnersForThisPosition} winners)
                              </Typography>
                            </>
                          ) : (
                            <>Physical Gift: {reward.nonCashReward}</>
                          )}
                        </Typography>
                        <Typography variant='body1'>
                          Number of Winners: {reward.numberOfWinnersForThisPosition}
                        </Typography>
                      </Stack>

                      <Typography variant='subtitle1' gutterBottom>
                        Sponsor Contributions ({reward?.sponsors?.length})
                      </Typography>

                      {reward?.sponsors?.length > 0 && (
                        <Grid container spacing={2}>
                          {reward.sponsors.map(sponsor => (
                            <Grid item xs={12} sm={6} key={sponsor?._id || sponsor?.id}>
                              <Paper variant='outlined' sx={{ p: 2 }}>
                                <Typography variant='body2'>{sponsor.email}</Typography>
                                <Typography variant='body2' color='text.secondary'>
                                  {reward.rewardType === 'cash'
                                    ? `Contributed: ${sponsor.currency} ${sponsor.allocated.toFixed(2)}`
                                    : `Provided: ${sponsor.allocated} items`}
                                </Typography>
                                <Typography variant='caption' color='text.secondary'>
                                  {reward.rewardType === 'cash'
                                    ? `Remaining balance: ${sponsor.currency} ${sponsor.availableAmount //- sponsor.allocated
                                        .toFixed(2)}`
                                    : `Remaining stock: ${sponsor.availableItems}`}
                                </Typography>
                              </Paper>
                            </Grid>
                          ))}
                        </Grid>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
          </Box>
        )}
        {/* Reward Dialog */}
        <RewardDialog
          open={openRewardDialog}
          key={openRewardDialog}
          onClose={() => setOpenRewardDialog(false)}
          reward={editingReward}
          onSave={handleSaveReward}
          availablePositions={availablePositions}
          allPositions={POSITION_OPTIONS}
          isEditing={!!editingReward}
          formData={formData}
          setFormData={setFormData}
          gameData={data}
        />
      </Grid>

      {/* Form Actions */}
      <Grid item xs={12} mt={4}>
        <Stack direction='row' spacing={2} justifyContent='center'>
          <Button variant='outlined' onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            component='label'
            variant='contained'
            color='primary'
            style={{ color: 'white' }}
          >
            Save Game
          </Button>
        </Stack>
      </Grid>
    </Grid>
  )
}

export default GameForm
