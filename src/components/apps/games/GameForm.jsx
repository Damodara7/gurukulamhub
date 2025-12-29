import React, { useState, useEffect, useRef } from 'react'

import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Collapse,
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
  Radio,
  CircularProgress,
  useTheme
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  DateRange as DateRangeIcon,
  AccessTime as AccessTimeIcon,
  VideocamOff as VideocamOffIcon,
  ExpandLess,
  ExpandMore
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
import { timezones } from '@/data/timezones'
import { gmttimezones } from '@/data/gmttimezones'
import { countryTimezones } from '@/data/country-timezones'
import moment, { tz } from 'moment-timezone'
import { userAgent } from 'next/server'
import { convertWithGMTOffset } from '@/utils/timezoneconverter'
import GroupAutocomplete from '@/components/group/GroupAutocomplete'

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

  if (!formData.timezone?.value) {
    errors.timezone = 'Timezone is required.'
  }
  // if (!formData.zipcode) {
  //   errors.zipcode = 'Creator zipcode is required'
  // }
  //  if (!selectedAdminCountry?.country) {
  //    errors.creatorCountry = 'Creator country is required'
  //  }
  // if (!formData.zipcode) {
  //   errors.zipcode = 'ZipCode is Required to determine Timezone'
  // }

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
  'timezone',
  'pin',
  'description',
  'quiz',
  'startTime',
  // 'creatorZipcode',
  // 'creatorTimeZone',
  // 'creatorCountry',
  'gameMode',
  'duration',
  'requireRegistration',
  'registrationEndTime',
  'limitPlayers',
  'maxPlayers',
  'location.country',
  'location.region',
  'location.city',
  'location.zipcode',
  'promotionalVideoUrl',
  'thumbnailPoster',
  'tags',
  'rewards',
  'forwardType'
]

// Main Game Form component
const GameForm = ({ onSubmit, quizzes = [], onCancel, data = null }) => {
  const theme = useTheme()
  // Initial form data
  const initialFormData = {
    title: '',
    pin: Math.floor(100000 + Math.random() * 900000).toString(),
    description: '',
    quiz: '',
    startTime: null,
    timezone: { value: '', label: '' },
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
    groupId: null,
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
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(true)
  const fileInputRef = useRef(null)
  const [showErrorSnackbar, setShowErrorSnackbar] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  // const [pinCodes, setPinCodes] = useState([])
  // const [loadingPincodes, setLoadingPincodes] = useState(false)
  // const [selectedPincode, setSelectedPincode] = useState('')
  const [localTimeDisplay, setLocalTimeDisplay] = useState(null)
  // Loading state
  const [loading, setLoading] = useState({
    fetchCities: false,
    submitting: false
  })

  // const fetchPinCodesForState = async selectedStateName => {
  //   if (!selectedStateName) {
  //     setPinCodes([])
  //     return
  //   }
  //   setLoadingPincodes(true)
  //   try {
  //     const response = await fetch(`/api/pincodes/${selectedStateName}`)
  //     const data = await response.json()
  //     setPinCodes(data?.pinCodes || [])
  //   } catch (e) {
  //     console.error('Error fetching pincodes:', e)
  //   } finally {
  //     setLoadingPincodes(false)
  //   }
  // }

  // Reward Dialog states
  const [openRewardDialog, setOpenRewardDialog] = useState(false)
  const [editingReward, setEditingReward] = useState(null)

  // Create refs for each field
  const fieldRefs = {
    title: useRef(),
    timezone: useRef(),
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
    // creatorZipcode: useRef(),
    // creatorTimezone: useRef(),
    // creatorCountry: useRef()
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
        gameMode: data?.gameMode || 'live',
        timezone: gmttimezones.find(tz => tz.value === data?.timezone) || {},
        groupId: data?.groupId || null,
        location: data?.location || { country: '', region: '', city: '' }
      })

      // Set location data for editing
      if (data?.location?.country) {
        const loadLocationData = async () => {
          const regions = await getCountryRegions(data?.location?.country || '')
          setSelectedCountryObject({
            country: data?.location?.country,
            countryCode: getCountryByName(data?.location?.country)?.countryCode,
            regions: regions
          })
          setSelectedRegion(data?.location?.region || '')
          setSelectedCity(data?.location?.city || '')

          // Fetch cities if region exists
          if (data?.location?.region) {
            getCitiesData(data?.location?.region)
          }
        }
        loadLocationData()
      }
    }
  }, [data])

  useEffect(() => {
    const usedPositions = formData?.rewards?.map(r => r.position)
    setAvailablePositions(POSITION_OPTIONS.filter(pos => !usedPositions.includes(pos)))
  }, [formData?.rewards])

  useEffect(() => {
    if (formData.startTime && formData.timezone?.value) {
      // IST is GMT+05:30 - we pass it as an object to match your timezone data structure
      const istOffset = { value: '+05:30' }

      const localTime = convertWithGMTOffset(formData.startTime, istOffset, formData.timezone.value)

      if (localTime) {
        // Format the timezone display (e.g., "GMT+05:30")
        const tzDisplay = formData.timezone?.value ? `GMT${formData.timezone.value}` : ''
        //  console.log( 'formdata' , formData.timezone);
        //  console.log('timezonevalue' , formData.timezone.value);
        setLocalTimeDisplay(localTime.format('YYYY-MM-DD hh:mm A') + ` (${tzDisplay})`)
      }
    } else {
      setLocalTimeDisplay(null)
    }
  }, [formData.startTime, formData.timezone])

  // Fetch Cities from DB
  const getCitiesData = async (region = '') => {
    setLoading(prev => ({ ...prev, fetchCities: true }))
    try {
      console.log('Fetching Cities Data now...')
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

  // Get country regions
  const getCountryRegions = async countryCode => {
    try {
      // Import the regions data dynamically
      const { CountryRegionData } = await import('@/data/regions')

      // Find the country in the data
      const countryData = CountryRegionData.find(
        country =>
          country[1] === countryCode || // Match by country code
          country[0].toLowerCase() === countryCode.toLowerCase() // Match by country name
      )

      if (countryData && countryData[2]) {
        // Parse the regions string format: "Region1~Code1|Region2~Code2|..."
        const regionsString = countryData[2]
        const regions = regionsString.split('|').map(region => {
          const [name] = region.split('~') // Get the region name before the ~
          return name
        })
        return regions
      }
    } catch (error) {
      console.error('Error fetching country regions:', error)
    }
    return []
  }

  // Handle country change
  const handleCountryChange = async countryObject => {
    const regions = await getCountryRegions(countryObject?.country || '')
    setSelectedCountryObject({
      ...countryObject,
      regions: regions
    })
    setSelectedRegion('')
    setSelectedCity('')
    setFormData(prev => ({
      ...prev,
      location: {
        country: countryObject?.country || '',
        region: '',
        city: ''
      }
    }))
  }

  // Handle region change
  const handleRegionChange = newValue => {
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
  }

  // Handle city change
  const handleCityChange = newValue => {
    setSelectedCity(newValue)
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        city: newValue
      }
    }))
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
      timezone: formData?.timezone?.value || '',
      location: {
        country: selectedCountryObject?.country || '',
        region: selectedRegion || '',
        city: selectedCity || ''
      }
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

  // const handleChangeCountry = countryValue => {
  //   setSelectedRegion('')
  // }

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
    <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          overflow: 'hidden',
          background: `radial-gradient(circle at 20% 20%, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 50%),
                      radial-gradient(circle at 80% 80%, ${alpha(
                        theme.palette.secondary.main,
                        0.05
                      )} 0%, transparent 50%),
                      ${theme.palette.background.default}`
      }}
    >
      {/* Elegant Header */}
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
          {/* Chevron Toggle Button - Right side, vertically centered */}
          <IconButton
            onClick={() => setIsHeaderExpanded(!isHeaderExpanded)}
            sx={{
              position: 'absolute',
              right: { xs: 2, sm: 3, md: 4 },
              top: '50%',
              transform: 'translateY(-50%)',
              color: theme.palette.text.secondary,
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main
              }
            }}
          >
            {isHeaderExpanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>

          {/* Centered Content */}
          <Box sx={{ textAlign: 'center', pr: { xs: 6, sm: 7, md: 8 } }}>
            {/* Icon and Title */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: isHeaderExpanded ? 2 : 1.5,
                mb: isHeaderExpanded ? 2 : 0,
                transition: 'all 0.3s ease'
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
                  boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.3)}`,
                  transition: 'all 0.3s ease'
                }}
              >
                <i
                  className='ri-gamepad-line'
                  style={{
                    fontSize: isHeaderExpanded ? '28px' : '20px',
                    color: 'white',
                    transition: 'font-size 0.3s ease'
                  }}
                />
              </Box>
              <Typography
                sx={{
                  fontSize: isHeaderExpanded
                    ? { xs: '2rem', md: '2.5rem' }
                    : { xs: '1.125rem', sm: '1.25rem', md: '1.5rem' },
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.02em',
                  transition: 'font-size 0.3s ease'
                }}
              >
                {data ? 'Edit Your Game' : 'Create & Schedule Game'}
              </Typography>
            </Box>

            {/* Collapsible Subheading */}
            <Collapse in={isHeaderExpanded} timeout={300}>
              <Typography
                variant='body1'
                color='text.secondary'
                sx={{
                  fontSize: '1.05rem',
                  lineHeight: 1.8,
                  fontWeight: 400,
                  maxWidth: '600px',
                  mx: 'auto',
                  mt: 2
                }}
              >
                {data
                  ? 'Update your game details and settings'
                  : 'Design an exciting game experience with rewards and scheduling'}
              </Typography>
            </Collapse>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box
        sx={{ p: { xs: 1, sm: 2, md: 3 }, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}
      >
        <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
          <Card
            sx={{
              flexShrink: 0,
              borderRadius: { xs: 1, sm: 2 },
              background: theme.palette.background.paper,
              boxShadow:
                theme.palette.mode === 'dark'
                  ? `0 2px 8px ${alpha(theme.palette.common.black, 0.3)}`
                  : `0 2px 8px ${alpha(theme.palette.primary.main, 0.08)}`,
              border: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.12 : 0.08)}`,
              '&:hover': {
                boxShadow:
                  theme.palette.mode === 'dark'
                    ? `0 4px 16px ${alpha(theme.palette.primary.main, 0.25)}`
                    : `0 4px 16px ${alpha(theme.palette.primary.main, 0.12)}`
              }
            }}
          >
            <CardContent sx={{ p: { xs: 1.5, sm: 2.5, md: 3, lg: 4 } }}>
              <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
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
                <Grid item xs={12} sm={6}>
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

                <Grid item xs={12} sm={6}>
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
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            maxHeight: { xs: 300, sm: 400 },
                            maxWidth: { xs: '90vw', sm: '600px' },
                            mt: 1,
                            '& .MuiMenuItem-root': {
                              whiteSpace: 'normal',
                              wordWrap: 'break-word'
                            }
                          }
                        },
                        anchorOrigin: {
                          vertical: 'bottom',
                          horizontal: 'left'
                        },
                        transformOrigin: {
                          vertical: 'top',
                          horizontal: 'left'
                        }
                      }}
                    >
                      <MenuItem value=''>
                        <em>Select Quiz</em>
                      </MenuItem>
                      {quizzes?.map(quiz => (
                        <MenuItem
                          key={quiz._id}
                          value={quiz._id}
                          sx={{
                            py: { xs: 1.5, sm: 2 },
                            px: { xs: 1.5, sm: 2 },
                            display: 'flex',
                            alignItems: 'flex-start',
                            minHeight: { xs: 60, sm: 80 },
                            '&:hover': {
                              backgroundColor: 'action.hover'
                            },
                            '&.Mui-selected': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.08),
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.12)
                              }
                            }
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: { xs: 1, sm: 1.5 },
                              width: '100%',
                              minWidth: 0
                            }}
                          >
                            {/* Quiz Thumbnail */}
                            <Box
                              sx={{
                                flexShrink: 0,
                                width: { xs: 40, sm: 48 },
                                height: { xs: 40, sm: 48 },
                                mt: 0.5
                              }}
                            >
                              <img
                                src={quiz?.thumbnail || 'https://via.placeholder.com/150x150'}
                                alt={quiz.title}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  borderRadius: '50%',
                                  objectFit: 'cover'
                                }}
                              />
                            </Box>

                            {/* Title and Details */}
                            <Box
                              sx={{
                                flex: 1,
                                minWidth: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 0.5
                              }}
                            >
                              <Typography
                                variant='body2'
                                sx={{
                                  fontWeight: 600,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  fontSize: { xs: '0.875rem', sm: '0.95rem' },
                                  lineHeight: 1.4
                                }}
                              >
                                {quiz.title}
                              </Typography>
                              <Typography
                                variant='caption'
                                sx={{
                                  color: 'text.secondary',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  display: 'block',
                                  fontSize: { xs: '0.7rem', sm: '0.75rem' }
                                }}
                              >
                                by {quiz.createdBy}
                              </Typography>
                              {quiz.details && (
                                <Typography
                                  variant='caption'
                                  sx={{
                                    color: 'text.secondary',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 1,
                                    WebkitBoxOrient: 'vertical',
                                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                    lineHeight: 1.3
                                  }}
                                >
                                  {quiz.details}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{errors.quiz || 'Select a quiz'}</FormHelperText>
                  </FormControl>
                </Grid>

                {/* Group Selection */}
                <Grid item xs={12}>
                  <GroupAutocomplete
                    value={formData.groupId}
                    onChange={groupId => {
                      setFormData(prev => ({ ...prev, groupId }))
                    }}
                    label='Target Group (Optional)'
                    placeholder='Search for a group to restrict game access...'
                  />
                </Grid>
                <Grid item xs={12}>
                  {/* <Typography variant='subtitle1' gutterBottom>
            Location of Game Creator (Admin)
          </Typography> */}
                  <Grid container spacing={2}>
                    {/* <Grid item xs={12} sm={4} md={4}>
              <CountryRegionDropdown
                defaultCountryCode=''
                selectedCountryObject={selectedAdminCountry}
                setSelectedCountryObject={setSelectedAdminCountry}
              />
            </Grid>
            <Grid item xs={12} sm={4} md={4}>
              <TextField
                fullWidth
                label='creator zipcode'
                name='creatorZipcode'
                value={formData.creatorZipcode}
                onChange={handleChange}
                helperText={errors.creatorZipcode || 'Enter the Creator Zipcode'}
                required
                inputRef={fieldRefs.creatorZipcode}
              />
            </Grid> */}

                    {/* Add a timezone display field (read-only) to show the detected timezone:
            <Grid item xs={12} sm={4} md={4}>
              <TextField
                fullWidth
                label='Timezone'
                name='timezone'
                value={formData.timezone || ''}
                InputProps={{
                  readOnly: true
                }}
                helperText={errors.timezone || 'Timezone will be determined from zipcode'}
                error={!!errors.timezone && touches.timezone}
                required
                inputRef={fieldRefs.timezone}
              />
            </Grid> */}

                    <Grid item xs={12} sm={6} md={6}>
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
                            helperText: (touches.startTime && errors.startTime) || 'Select start time of the game',
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
                            inputRef: fieldRefs.startTime,
                            size: 'medium'
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6}>
                      <FormControl fullWidth required error={!!errors.timezone && touches.timezone}>
                        <Autocomplete
                          id='timezone-autocomplete'
                          options={gmttimezones}
                          getOptionLabel={option => option.label}
                          value={
                            formData.timezone?.value
                              ? gmttimezones.find(tz => tz.value === formData.timezone?.value)
                              : null
                          }
                          onChange={(e, newValue) => {
                            setFormData(prev => ({ ...prev, timezone: newValue || null }))
                            setTouches(prev => ({ ...prev, timezone: true }))
                            setErrors(prev => ({ ...prev, timezone: '' }))
                          }}
                          onBlur={() => {
                            setTouches(prev => ({ ...prev, timezone: true }))
                            validateField('timezone')
                          }}
                          renderInput={params => (
                            <TextField
                              {...params}
                              label='Timezone'
                              required
                              error={!!errors.timezone && touches.timezone}
                              helperText={errors.timezone || 'where we are conducting the game'}
                              inputRef={fieldRefs.timezone}
                            />
                          )}
                          isOptionEqualToValue={(option, value) => option === value}
                          autoHighlight
                          clearOnBlur
                          clearOnEscape
                          disableClearable={false}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      {localTimeDisplay && (
                        <TextField
                          fullWidth
                          label='Local Time'
                          value={localTimeDisplay}
                          InputProps={{
                            readOnly: true,
                            startAdornment: (
                              <InputAdornment position='start'>
                                <AccessTimeIcon color='action' />
                              </InputAdornment>
                            )
                          }}
                          variant='outlined'
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': {
                                borderColor:
                                  theme.palette.mode === 'dark'
                                    ? alpha(theme.palette.divider, 0.3)
                                    : 'rgba(0, 0, 0, 0.23)'
                              },
                              '&:hover fieldset': {
                                borderColor: theme.palette.mode === 'dark' ? theme.palette.divider : 'rgba(0, 0, 0, 0.87)'
                              }
                            }
                          }}
                        />
                      )}
                    </Grid>
                  </Grid>
                </Grid>

                {/* Timezone Autocomplete */}

                {/* Game Mode Selection */}
                <Grid item xs={12} sm={6}>
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
                  <>
                    <Grid item xs={12} sm={6}>
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
                    <Grid item xs={12} sm={6}></Grid>
                  </>
                )}

                {/* Duration (only if self-paced) */}
                {formData.gameMode === 'self-paced' && (
                  <>
                    <Grid item xs={12} sm={6}>
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
                    <Grid item xs={12} sm={6}></Grid>
                  </>
                )}

                <Grid item xs={12} sm={6}></Grid>

                {/* Registration */}
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.requireRegistration}
                        onChange={handleChange}
                        name='requireRegistration'
                      />
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
                            (touches.registrationEndTime && errors.registrationEndTime) ||
                            'Select the registration end time',
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
                <Grid item xs={12} sm={6}>
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

                {/* Location Section */}
                <Grid item xs={12}>
                  <Typography
                    variant='subtitle1'
                    gutterBottom
                    sx={{
                      fontWeight: 600,
                      mb: { xs: 1.5, sm: 2 },
                      fontSize: { xs: '0.95rem', sm: '1rem' }
                    }}
                  >
                    Game Location (Optional - Accessible anywhere if not specified)
                  </Typography>
                  <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                    <Grid item xs={12} sm={6} md={4}>
                      <CountryRegionDropdown
                        defaultCountryCode=''
                        selectedCountryObject={selectedCountryObject}
                        setSelectedCountryObject={handleCountryChange}
                      />
                    </Grid>

                    {selectedCountryObject?.country && (
                      <Grid item xs={12} sm={6} md={4}>
                        <FormControl fullWidth>
                          <Autocomplete
                            autoHighlight
                            onChange={(e, newValue) => handleRegionChange(newValue)}
                            id='autocomplete-region-select'
                            options={selectedCountryObject?.regions || []}
                            getOptionLabel={option => option || ''}
                            renderInput={params => (
                              <TextField
                                {...params}
                                key={params.id}
                                label='Choose a region'
                                placeholder='Select region'
                                inputProps={{
                                  ...params.inputProps,
                                  autoComplete: 'region'
                                }}
                              />
                            )}
                            value={selectedRegion}
                            noOptionsText='No regions available'
                          />
                        </FormControl>
                      </Grid>
                    )}

                    {selectedRegion && (
                      <Grid item xs={12} sm={6} md={4}>
                        {loading.fetchCities ? (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              p: 2,
                              bgcolor: 'action.hover',
                              borderRadius: 1
                            }}
                          >
                            <CircularProgress size={20} />
                            <Typography variant='body2' color='text.secondary'>
                              Loading cities...
                            </Typography>
                          </Box>
                        ) : (
                          <FormControl fullWidth>
                            <Autocomplete
                              autoHighlight
                              onChange={(e, newValue) => handleCityChange(newValue)}
                              id='autocomplete-city-select'
                              options={cityOptions || []}
                              getOptionLabel={option => option || ''}
                              renderInput={params => (
                                <TextField
                                  {...params}
                                  key={params.id}
                                  label='Choose a City'
                                  placeholder='Select city'
                                  inputProps={{
                                    ...params.inputProps,
                                    autoComplete: 'city'
                                  }}
                                />
                              )}
                              value={selectedCity}
                              noOptionsText='No cities available'
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
                      p: { xs: 2, sm: 3 },
                      mb: { xs: 1.5, sm: 2 }
                    }}
                  >
                    <Typography
                      variant='subtitle1'
                      gutterBottom
                      sx={{
                        mb: { xs: 1.5, sm: 2 },
                        fontSize: { xs: '0.95rem', sm: '1rem' },
                        fontWeight: 600
                      }}
                    >
                      Media
                    </Typography>

                    <Grid container spacing={{ xs: 2, sm: 3 }}>
                      {/* Video Section - Full width on xs, half on md+ */}
                      <Grid item xs={12} md={6}>
                        <Box sx={{ height: '100%' }}>
                          <Typography variant='subtitle2' gutterBottom sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
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
                            size='medium'
                          />
                          <Box
                            sx={{
                              mt: { xs: 1.5, sm: 2 },
                              borderRadius: 1,
                              overflow: 'hidden',
                              border: '1px solid',
                              borderColor: 'divider',
                              height: { xs: '180px', sm: '200px' },
                              backgroundColor:
                                theme.palette.mode === 'dark' ? alpha(theme.palette.common.black, 0.3) : '#f5f5f5',
                              position: 'relative'
                            }}
                          >
                            {formData.promotionalVideoUrl ? (
                              <ReactPlayer
                                url={formData.promotionalVideoUrl}
                                width='100%'
                                height='100%'
                                controls
                                style={{
                                  backgroundColor:
                                    theme.palette.mode === 'dark' ? alpha(theme.palette.common.black, 0.3) : '#f5f5f5'
                                }}
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
                                <VideocamOffIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: 'text.disabled', mb: 1 }} />
                                <Typography
                                  variant='body2'
                                  color='text.secondary'
                                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                                >
                                  No video URL provided
                                </Typography>
                                <Typography
                                  variant='caption'
                                  color='text.disabled'
                                  sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                                >
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
                          <Typography variant='subtitle2' gutterBottom sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
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
                            <Box
                              sx={{
                                position: 'relative',
                                mb: { xs: 1.5, sm: 2 },
                                height: { xs: '180px', sm: '200px' },
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor:
                                  theme.palette.mode === 'dark' ? alpha(theme.palette.common.black, 0.3) : '#f5f5f5'
                              }}
                            >
                              <img
                                src={formData.thumbnailPoster}
                                alt='Game thumbnail'
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  borderRadius: 4,
                                  border: `1px solid ${alpha(
                                    theme.palette.divider,
                                    theme.palette.mode === 'dark' ? 0.3 : 0.5
                                  )}`
                                }}
                              />
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: { xs: 4, sm: 8 },
                                  right: { xs: 4, sm: 8 },
                                  display: 'flex',
                                  gap: 0.5,
                                  backgroundColor:
                                    theme.palette.mode === 'dark'
                                      ? alpha(theme.palette.background.paper, 0.9)
                                      : 'rgba(255, 255, 255, 0.9)',
                                  borderRadius: 1,
                                  p: 0.5,
                                  boxShadow: 1,
                                  zIndex: 2
                                }}
                              >
                                <IconButton
                                  color='primary'
                                  size='small'
                                  onClick={triggerFileInput}
                                  sx={{
                                    backgroundColor:
                                      theme.palette.mode === 'dark'
                                        ? alpha(theme.palette.action.hover, 0.5)
                                        : 'rgba(0, 0, 0, 0.04)',
                                    '&:hover': {
                                      backgroundColor:
                                        theme.palette.mode === 'dark'
                                          ? alpha(theme.palette.action.hover, 0.7)
                                          : 'rgba(0, 0, 0, 0.08)'
                                    }
                                  }}
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
                                    setTouches(prev => ({ ...prev, thumbnailPoster: true }))
                                    validateField('thumbnailPoster', updatingFormData)
                                  }}
                                  sx={{
                                    backgroundColor:
                                      theme.palette.mode === 'dark'
                                        ? alpha(theme.palette.action.hover, 0.5)
                                        : 'rgba(0, 0, 0, 0.04)',
                                    '&:hover': {
                                      backgroundColor: alpha(theme.palette.error.main, 0.1)
                                    }
                                  }}
                                >
                                  <DeleteIcon fontSize='small' />
                                </IconButton>
                              </Box>
                            </Box>
                          ) : (
                            <Box
                              onClick={triggerFileInput}
                              sx={{
                                height: { xs: '180px', sm: '200px' },
                                border: '2px dashed',
                                borderColor:
                                  !!errors.thumbnailPoster && touches.thumbnailPoster ? 'error.main' : 'divider',
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
                              <Typography
                                color='text.secondary'
                                sx={{
                                  fontSize: { xs: '0.875rem', sm: '1rem' },
                                  textAlign: 'center',
                                  px: 2
                                }}
                              >
                                Click to upload thumbnail image
                              </Typography>
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
                            sx={{ mt: { xs: 1.5, sm: 2 } }}
                            inputRef={fieldRefs.thumbnailPoster}
                            size='medium'
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
                  <Divider sx={{ my: { xs: 1.5, sm: 2 } }} />
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent='space-between'
                    alignItems={{ xs: 'stretch', sm: 'center' }}
                    spacing={{ xs: 2, sm: 0 }}
                  >
                    <Typography
                      variant='h5'
                      sx={{
                        fontSize: { xs: '1.25rem', sm: '1.5rem' },
                        fontWeight: 600
                      }}
                    >
                      Rewards
                    </Typography>
                    <Button
                      variant='outlined'
                      startIcon={<AddIcon />}
                      onClick={handleAddReward}
                      disabled={availablePositions.length === 0}
                      sx={{ minWidth: { sm: '140px' } }}
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
                            reward.rewardType === 'cash'
                              ? reward.rewardValuePerWinner * reward.numberOfWinnersForThisPosition
                              : 0

                          return (
                            <Card key={reward?._id || reward?.id} variant='outlined' sx={{ mb: { xs: 1.5, sm: 2 } }}>
                              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                                <Stack
                                  direction={{ xs: 'column', sm: 'row' }}
                                  justifyContent='space-between'
                                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                                  spacing={{ xs: 1, sm: 0 }}
                                  mb={2}
                                >
                                  <Typography variant='h6' sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                                    Position {reward.position} Reward
                                  </Typography>
                                  <Stack direction='row' spacing={0.5}>
                                    <IconButton
                                      size='small'
                                      onClick={() => handleEditReward(reward)}
                                      sx={{
                                        '&:hover': { backgroundColor: 'action.hover' }
                                      }}
                                    >
                                      <EditIcon fontSize='small' />
                                    </IconButton>
                                    <IconButton
                                      size='small'
                                      onClick={() => handleRemoveReward(reward?._id || reward?.id)}
                                      sx={{
                                        '&:hover': { backgroundColor: 'error.light', color: 'error.main' }
                                      }}
                                    >
                                      <CloseIcon fontSize='small' />
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
                                  <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                                    {reward.sponsors.map(sponsor => (
                                      <Grid item xs={12} sm={6} key={sponsor?._id || sponsor?.id}>
                                        <Paper
                                          variant='outlined'
                                          sx={{
                                            p: { xs: 1.5, sm: 2 },
                                            borderRadius: 1
                                          }}
                                        >
                                          <Typography
                                            variant='body2'
                                            sx={{
                                              fontWeight: 500,
                                              mb: 0.5,
                                              wordBreak: 'break-word'
                                            }}
                                          >
                                            {sponsor.email}
                                          </Typography>
                                          <Typography
                                            variant='body2'
                                            color='text.secondary'
                                            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                                          >
                                            {reward.rewardType === 'cash'
                                              ? `Contributed: ${sponsor.currency} ${(sponsor.allocated || 0).toFixed(2)}`
                                              : `Provided: ${sponsor.allocated || 0} items`}
                                          </Typography>
                                          <Typography
                                            variant='caption'
                                            color='text.secondary'
                                            sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                                          >
                                            {reward.rewardType === 'cash'
                                              ? `Remaining balance: ${sponsor.currency} ${(
                                                  sponsor.availableAmount || 0
                                                ).toFixed(2)}`
                                              : `Remaining stock: ${sponsor.availableItems || 0}`}
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
                <Grid item xs={12} sx={{ mt: { xs: 2, sm: 3, md: 4 } }}>
                  <Stack direction='row' spacing={2} justifyContent='center' sx={{ width: '100%' }}>
                    <Button
                      variant='outlined'
                      onClick={onCancel}
                      sx={{
                        color: theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.text.primary
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      component='label'
                      variant='contained'
                      color='primary'
                      sx={{
                        color: 'white'
                      }}
                    >
                      {data ? 'Update ' : 'Submit'}
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  )
}

export default GameForm
