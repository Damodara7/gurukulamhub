'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Divider,
  CircularProgress,
  Container,
  Stack,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  alpha,
  useTheme,
  useMediaQuery,
  IconButton,
  Collapse
} from '@mui/material'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
// Import components
import QuizSelection from './QuizSelection'
import LocationSelection from './LocationSelection'
import RewardSection from './RewardSection'
import SponsorerInfo from './SponsorerInfo'
import { toast } from 'react-toastify'
// Phone input imports
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
// Country region data
import { CountryRegionData } from '@/data/regions'
import {
  ArrowBack,
  CheckCircleOutline,
  EmojiEvents,
  LocationOn,
  MonetizationOn,
  Public,
  Redeem,
  School,
  VolunteerActivism,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material'

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
  email: '',
  fullname: '',
  sponsorshipAmount: '',
  orgName: '',
  website: '',
  orgType: '',
  mobileNumber: '',
  nonCashItem: '',
  numberOfNonCashItems: '',
  rewardValuePerItem: '',
  rewardDescription: ''
}

const SponsorQuizzes = () => {
  const router = useRouter()
  const theme = useTheme()
  const isDarkMode = theme.palette.mode === 'dark'
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'))
  const { data: session } = useSession()

  // State for quizzes selection
  const [selectedQuizzes, setSelectedQuizzes] = useState(['any-quiz'])

  // State for location
  const [selectedCountryObject, setSelectedCountryObject] = useState(() => {
    // Default to India
    const indiaData = CountryRegionData.find(data => data[1]?.toLowerCase() === 'in')
    return indiaData ? { country: indiaData[0], countryCode: indiaData[1] } : null
  })
  const [selectedRegion, setSelectedRegion] = useState('')
  const [city, setCity] = useState('')
  const [cityOptions, setCityOptions] = useState([])
  const [quizzes, setQuizzes] = useState([])

  const [sponsorerType, setSponsorerType] = useState('individual')
  const [rewardType, setRewardType] = useState(REWARD_TYPES.CASH)
  const [formData, setFormData] = useState({ ...initialFormData, email: session?.user?.email })
  
  // State for header collapse
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false)

  // Phone input states
  const [phoneInput, setPhoneInput] = useState('')
  const [countryDialCode, setCountryDialCode] = useState('91') // Default to India +91
  const [phoneValid, setPhoneValid] = useState(false)

  // Loading state
  const [loading, setLoading] = useState({
    fetchCities: false,
    fetchQuizzes: false,
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
      setQuizzes(result.result)
    } else {
      // toast.error('Error:' + result?.result?.message)
      console.log('Error Fetching quizes:', result)
      setQuizzes([])
    }
    setLoading(prev => ({ ...prev, fetchQuizzes: false }))
  }

  useEffect(() => {
    getQuizData()
  }, [])

  // Auto-collapse header after 1 minute
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsHeaderCollapsed(true)
    }, 60000) // 1 minute = 60000ms

    return () => clearTimeout(timer)
  }, [])

  // Update formData.phone when phoneInput or countryDialCode changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      mobileNumber: phoneInput.startsWith(countryDialCode) ? phoneInput.slice(countryDialCode.length) : phoneInput
    }))
  }, [phoneInput, countryDialCode])

  // Update phone input country when selectedCountryObject changes from LocationSelection
  useEffect(() => {
    if (selectedCountryObject?.countryCode) {
      // The PhoneInput will automatically update when the country prop changes
      // We just need to ensure the dial code is in sync
      // PhoneInput library handles the dial code automatically based on country code
    }
  }, [selectedCountryObject?.countryCode])

  const validatePhone = (value, dialCode) => {
    const indianRegex = new RegExp('^[6-9][0-9]{9}$')
    if (dialCode === '91') {
      let contactWithoutCountryCode = value.substring(2, value.length)
      const result = indianRegex.test(contactWithoutCountryCode)
      setPhoneValid(result)
      return result
    }
    // For other countries, just check if it's not empty
    const result = value.length > dialCode.length
    setPhoneValid(result)
    return result
  }

  const handlePhoneInputChange = (value, country) => {
    // Update phone number
    setPhoneInput(value)
    validatePhone(value, country.dialCode)

    // Check if the dial code or country code has changed
    if (country.dialCode !== countryDialCode) {
      // Update country dial code
      setCountryDialCode(country.dialCode)

      // Map country code to country name
      const countryObj = CountryRegionData.find(data => data[1]?.toLowerCase() === country.countryCode?.toLowerCase())

      if (countryObj) {
        setSelectedCountryObject({ country: countryObj[0], countryCode: countryObj[1] })
      } else {
        console.warn('Country not found in CountryRegionData:', country.countryCode)
      }
    }
  }

  const validateMobileNumber = number => {
    // For Indian numbers, validate 10-digit format
    if (countryDialCode === '91') {
      const regex = /^[6-9]\d{9}$/
      return regex.test(number)
    }
    // For other countries, just check if number exists
    return number && number.length > 0
  }

  const validateEmail = email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateForm = () => {
    const newErrors = {}

    // Common fields - always validated
    if (!formData.fullname) {
      newErrors.fullname = 'Full name is required'
    }

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Organization-specific fields - only validated when sponsorerType is 'organization'
    if (sponsorerType === 'organization') {
      if (!formData.orgName) {
        newErrors.orgName = 'Organization name is required'
      }
      if (!formData.website) {
        newErrors.website = 'Website is required'
      }
      if (!formData.orgType) {
        newErrors.orgType = 'Organization type is required'
      }
    }
    // Note: Individual type doesn't have additional required fields beyond common ones

    if (!phoneInput || phoneInput.length <= countryDialCode.length) {
      newErrors.mobileNumber = 'Mobile number is required'
    } else if (!phoneValid) {
      newErrors.mobileNumber =
        countryDialCode === '91'
          ? 'Please enter a valid 10-digit Indian mobile number'
          : 'Please enter a valid mobile number'
    } else if (!validateMobileNumber(formData.mobileNumber)) {
      newErrors.mobileNumber =
        countryDialCode === '91'
          ? 'Please enter a valid 10-digit Indian mobile number'
          : 'Please enter a valid mobile number'
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
      if (!formData.rewardValuePerItem) newErrors.rewardValuePerItem = 'Estimated value is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async event => {
    // event?.preventDefault()
    console.log('submitting...')
    if (validateForm()) {
      setLoading(prev => ({ ...prev, submitting: true }))

      try {
        const payload = {
          accountHolderEmail: session?.user?.email,
          email: formData?.email || session?.user?.email,
          fullname: formData?.fullname,
          quizzes: selectedQuizzes?.filter(x => x !== 'any-quiz'),
          sponsorType: 'quiz',
          sponsorerType,
          location: {
            country: selectedCountryObject?.country || '',
            region: selectedRegion,
            city
          },
          mobileNumber: formData.mobileNumber,
          rewardType,
          currency: 'INR', // Hardcoded as per requirements
          ...(sponsorerType === 'organization' && {
            orgName: formData?.orgName,
            website: formData?.website,
            orgType: formData?.orgType
          }),
          ...(rewardType === REWARD_TYPES.CASH && {
            sponsorshipAmount: Number(formData.sponsorshipAmount),
            availableAmount: Number(formData.sponsorshipAmount),
            sponsorshipStatus: 'created', // Only for cash rewards
            nonCashSponsorshipStatus: undefined,
            sponsorshipExpiresAt: new Date(Date.now() + 2 * 60 * 1000) // 2 minutes
          }),
          ...(rewardType === REWARD_TYPES.PHYSICAL_GIFT && {
            nonCashItem: formData.nonCashItem,
            numberOfNonCashItems: Number(formData.numberOfNonCashItems),
            availableItems: Number(formData.numberOfNonCashItems),
            rewardValuePerItem: Number(formData.rewardValuePerItem),
            rewardValue: Number(formData.rewardValuePerItem) * Number(formData?.numberOfNonCashItems),
            rewardDescription: formData.rewardDescription,
            nonCashSponsorshipStatus: 'completed', // For physical gifts
            sponsorshipStatus: undefined
          })
        }

        console.log('Form submitted:', payload)

        const res = await RestApi.post(API_URLS.v0.SPONSORSHIP, payload)
        if (res.status === 'success') {
          // Only redirect to payment for cash rewards
          if (rewardType === REWARD_TYPES.CASH) {
            router.push(`/sponsor/${res.result._id}/payment`)
          } else {
            // Handle successful physical gift submission
            toast.success('Sponsorship is successful!')
            router.push(`/sponsor/${res.result._id}/success`)
          }
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

  const handleSponsorerTypeChange = newType => {
    setSponsorerType(newType)

    // Clear errors for fields that are no longer relevant
    if (newType === 'individual') {
      // Clear organization-specific errors
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.orgName
        delete newErrors.website
        delete newErrors.orgType
        return newErrors
      })
      // Optionally clear organization form data
      setFormData(prev => ({
        ...prev,
        orgName: '',
        website: '',
        orgType: ''
      }))
    } else if (newType === 'organization') {
      // Clear individual-specific errors (if any)
      // Currently no individual-specific fields that need clearing
      // But we ensure organization fields are validated
    }
  }

  const formatNumber = value => {
    if (!value || isNaN(value)) return null
    return new Intl.NumberFormat('en-IN').format(Number(value))
  }

  const selectedQuizNames = useMemo(() => {
    const quizIds = new Set(selectedQuizzes)
    return quizzes?.filter(quiz => quizIds.has(quiz._id))?.map(quiz => quiz.title || quiz.name)
  }, [quizzes, selectedQuizzes])

  const hasSpecificQuizzes = selectedQuizzes.some(quizId => quizId !== 'any-quiz')

  const locationSummary = useMemo(() => {
    const parts = [selectedCountryObject?.country, selectedRegion, city].filter(Boolean)
    if (parts.length === 0) return 'Open to all locations'
    return parts.join(', ')
  }, [city, selectedCountryObject?.country, selectedRegion])

  const rewardSummary =
    rewardType === REWARD_TYPES.CASH
      ? {
          icon: <MonetizationOn sx={{ color: theme.palette.success.main }} />,
          title: 'Cash Sponsorship',
          primaryText: formData.sponsorshipAmount
            ? `INR ${formatNumber(formData.sponsorshipAmount)}`
            : 'Amount to be finalized',
          secondaryText: 'Funds will be directly allocated to quiz rewards and outreach.'
        }
      : {
          icon: <Redeem sx={{ color: theme.palette.warning.main }} />,
          title: 'Physical Gifts',
          primaryText:
            formData.nonCashItem && formData.numberOfNonCashItems
              ? `${formData.numberOfNonCashItems} × ${formData.nonCashItem}`
              : 'Gift selection in progress',
          secondaryText: formData.rewardValuePerItem
            ? `Estimated total value: INR ${formatNumber(
                Number(formData.rewardValuePerItem) * Number(formData.numberOfNonCashItems || 0)
              )}`
            : 'Provide estimated value to help us plan distribution.'
        }

  const impactHighlights = [
    {
      icon: <School sx={{ fontSize: 24, color: theme.palette.primary.main }} />,
      title: 'Empower Learners',
      description: 'Fund quizzes that celebrate India’s timeless knowledge systems.'
    },
    {
      icon: <Public sx={{ fontSize: 24, color: theme.palette.secondary.main }} />,
      title: 'Reach Communities',
      description: 'Support culturally rich content accessible across regions and languages.'
    },
    {
      icon: <VolunteerActivism sx={{ fontSize: 24, color: theme.palette.success.main }} />,
      title: 'Create Impact',
      description: 'Enable quiz creators, moderators, and participants with meaningful rewards.'
    }
  ]

  const isQuizzesLoading = loading.fetchQuizzes

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        bgcolor: theme.palette.background.default,
        overflow: 'hidden'
      }}
    >
      {/* Hero Section - Fixed */}
      <Box
        sx={{
          flexShrink: 0,
          bgcolor: theme.palette.background.paper,
          pt: isHeaderCollapsed ? { xs: 1, md: 1.5 } : { xs: 2.5, md: 3 },
          pb: isHeaderCollapsed ? { xs: 1, md: 1.5 } : { xs: 2.5, md: 3 },
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
          transition: 'padding 0.3s ease'
        }}
      >
        <Container maxWidth='lg'>
          <Stack spacing={isHeaderCollapsed ? { xs: 0.5, sm: 0.75 } : { xs: 1.5, sm: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
              <Button
                variant='text'
                startIcon={<ArrowBack sx={{ fontSize: isHeaderCollapsed ? { xs: 16, sm: 18 } : { xs: 20, sm: 22 } }} />}
                onClick={() => router.back()}
                sx={{
                  width: 'fit-content',
                  textTransform: 'none',
                  fontWeight: 600,
                  color: 'text.secondary',
                  px: 0,
                  fontSize: isHeaderCollapsed ? { xs: '0.8rem', sm: '0.85rem' } : { xs: '0.95rem', sm: '1rem' },
                  minWidth: 'auto',
                  '&:hover': {
                    bgcolor: 'transparent',
                    color: 'primary.main'
                  }
                }}
              >
                Back
              </Button>
              <IconButton
                onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
                size='small'
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main'
                  }
                }}
              >
                {isHeaderCollapsed ? <ExpandMore /> : <ExpandLess />}
              </IconButton>
            </Box>

            <Typography
              variant='h4'
              fontWeight={700}
              sx={{
                fontSize: isHeaderCollapsed
                  ? { xs: '1rem', sm: '1.1rem', md: '1.2rem' }
                  : { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: 1.3,
                transition: 'font-size 0.3s ease'
              }}
            >
              Sponsor Traditional Knowledge Quizzes
            </Typography>

            <Collapse in={!isHeaderCollapsed} timeout={300}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={{ xs: 1, sm: 1 }}
              >
                <Chip
                  icon={<EmojiEvents sx={{ fontSize: { xs: 14, sm: 16 } }} />}
                  label='Quiz Sponsorship Program'
                  sx={{
                    fontWeight: 700,
                    bgcolor: alpha(theme.palette.primary.main, isDarkMode ? 0.15 : 0.08),
                    color: theme.palette.primary.main,
                    border: `1px solid ${alpha(theme.palette.primary.main, isDarkMode ? 0.3 : 0.2)}`,
                    fontSize: { xs: '0.75rem', sm: '0.8rem' },
                    height: { xs: 24, sm: 28 }
                  }}
                />
                <Chip
                  icon={<LocationOn sx={{ fontSize: { xs: 14, sm: 16 } }} />}
                  label='Pan-India Outreach'
                  sx={{
                    fontWeight: 700,
                    bgcolor: alpha(theme.palette.secondary?.main || theme.palette.primary.main, isDarkMode ? 0.15 : 0.08),
                    color: theme.palette.secondary?.main || theme.palette.primary.main,
                    border: `1px solid ${alpha(
                      theme.palette.secondary?.main || theme.palette.primary.main,
                      isDarkMode ? 0.3 : 0.2
                    )}`,
                    fontSize: { xs: '0.75rem', sm: '0.8rem' },
                    height: { xs: 24, sm: 28 }
                  }}
                />
              </Stack>
            </Collapse>

            <Collapse in={!isHeaderCollapsed} timeout={300}>
              <Typography
                variant='body2'
                sx={{
                  fontSize: { xs: '0.85rem', sm: '0.9rem', md: '0.95rem' },
                  color: 'text.secondary',
                  lineHeight: 1.6,
                  maxWidth: { xs: '100%', sm: '800px', md: '900px' }
                }}
              >
                Your sponsorship helps us preserve, celebrate, and share India&apos;s ancient knowledge systems through
                curated quizzes. Join a community of patrons championing cultural education and high-quality learning
                content.
              </Typography>
            </Collapse>
          </Stack>
        </Container>
      </Box>

      {/* Content Section - Scrollable */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          minHeight: 0,
          WebkitOverflowScrolling: 'touch',
          scrollbarGutter: 'stable',
          // Custom scrollbar styling
          '&::-webkit-scrollbar': {
            width: '8px'
          },
          '&::-webkit-scrollbar-track': {
            background: alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.1 : 0.05),
            borderRadius: '4px'
          },
          '&::-webkit-scrollbar-thumb': {
            background:
              theme.palette.mode === 'dark'
                ? alpha(theme.palette.common.white, 0.3)
                : alpha(theme.palette.common.black, 0.2),
            borderRadius: '4px',
            '&:hover': {
              background:
                theme.palette.mode === 'dark'
                  ? alpha(theme.palette.common.white, 0.4)
                  : alpha(theme.palette.common.black, 0.3)
            }
          }
        }}
      >
        <Container maxWidth='lg' sx={{ mt: 4, pb: { xs: 6, sm: 8, md: 10 } }}>
          <Stack spacing={4}>
            {/* Impact Highlights */}
            <Grid container spacing={2}>
              {impactHighlights.map(highlight => (
                <Grid item xs={12} md={4} key={highlight.title}>
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                      boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 2px 10px rgba(0,0,0,0.08)',
                      height: '100%'
                    }}
                  >
                    <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                      <Stack
                        direction='row'
                        spacing={{ xs: 1.5, sm: 2 }}
                        alignItems='center'
                        sx={{ mb: { xs: 1.5, sm: 2 } }}
                      >
                        <Box
                          sx={{
                            width: { xs: 40, sm: 44 },
                            height: { xs: 40, sm: 44 },
                            borderRadius: { xs: 1.5, sm: 2 },
                            bgcolor:
                              theme.palette.mode === 'dark'
                                ? alpha(theme.palette.primary.main, 0.18)
                                : alpha(theme.palette.primary.main, 0.08),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {highlight.icon}
                        </Box>
                        <Typography
                          variant='subtitle1'
                          fontWeight={700}
                          sx={{
                            color: 'text.primary',
                            fontSize: { xs: '0.95rem', sm: '1rem' }
                          }}
                        >
                          {highlight.title}
                        </Typography>
                      </Stack>
                      <Typography
                        variant='body2'
                        sx={{
                          color: 'text.secondary',
                          lineHeight: 1.6,
                          fontSize: { xs: '0.88rem', sm: '0.9rem', md: '0.95rem' }
                        }}
                      >
                        {highlight.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <Card
                  sx={{
                    borderRadius: 4,
                    border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                    boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 2px 12px rgba(0,0,0,0.08)'
                  }}
                >
                  <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                    <Stack spacing={2}>
                      <Stack direction='row' spacing={2} alignItems='center'>
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 2,
                            bgcolor:
                              theme.palette.mode === 'dark'
                                ? alpha(theme.palette.primary.main, 0.2)
                                : alpha(theme.palette.primary.main, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <EmojiEvents sx={{ color: theme.palette.primary.main }} />
                        </Box>
                        <Box>
                          <Typography variant='h6' fontWeight={700}>
                            Choose the quizzes you want to sponsor
                          </Typography>
                          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                            Target specific quizzes or back the entire program for maximum outreach.
                          </Typography>
                        </Box>
                      </Stack>

                      <Divider sx={{ my: 1 }} />

                      {isQuizzesLoading ? (
                        <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
                          <CircularProgress size={32} />
                        </Box>
                      ) : (
                        <QuizSelection
                          quizzes={quizzes}
                          selectedQuizzes={selectedQuizzes}
                          setSelectedQuizzes={setSelectedQuizzes}
                          errors={errors}
                          setErrors={setErrors}
                        />
                      )}
                    </Stack>
                  </CardContent>
                </Card>

                <Card
                  sx={{
                    borderRadius: 4,
                    border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                    boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 2px 12px rgba(0,0,0,0.08)'
                  }}
                >
                  <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                    <Stack spacing={2}>
                      <Stack direction='row' spacing={2} alignItems='center'>
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 2,
                            bgcolor:
                              theme.palette.mode === 'dark'
                                ? alpha(theme.palette.secondary.main, 0.22)
                                : alpha(theme.palette.secondary.main, 0.12),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <LocationOn sx={{ color: theme.palette.secondary.main }} />
                        </Box>
                        <Box>
                          <Typography variant='h6' fontWeight={700}>
                            Define your preferred locations
                          </Typography>
                          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                            Focus your sponsorship on specific regions or open it up to all participants.
                          </Typography>
                        </Box>
                      </Stack>

                      <Divider sx={{ my: 1 }} />

                      <LocationSelection
                        selectedCountryObject={selectedCountryObject}
                        setSelectedCountryObject={setSelectedCountryObject}
                        selectedRegion={selectedRegion}
                        setSelectedRegion={setSelectedRegion}
                        city={city}
                        setCity={setCity}
                        cityOptions={cityOptions}
                        loading={loading}
                        getCitiesData={getCitiesData}
                      />
                    </Stack>
                  </CardContent>
                </Card>

                <Card
                  sx={{
                    borderRadius: 4,
                    border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                    boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 2px 12px rgba(0,0,0,0.08)'
                  }}
                >
                  <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                    <Stack spacing={2}>
                      <Stack direction='row' spacing={2} alignItems='center'>
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 2,
                            bgcolor:
                              theme.palette.mode === 'dark'
                                ? alpha(theme.palette.success.main, 0.22)
                                : alpha(theme.palette.success.main, 0.12),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <VolunteerActivism sx={{ color: theme.palette.success.main }} />
                        </Box>
                        <Box>
                          <Typography variant='h6' fontWeight={700}>
                            Share your sponsor profile
                          </Typography>
                          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                            Tell us more about yourself or your organisation so that we can recognise your support.
                          </Typography>
                        </Box>
                      </Stack>

                      <Divider sx={{ my: 1 }} />

                      <SponsorerInfo
                        sponsorerType={sponsorerType}
                        setSponsorerType={handleSponsorerTypeChange}
                        formData={formData}
                        errors={errors}
                        handleChange={handleChange}
                        phoneInput={phoneInput}
                        countryDialCode={countryDialCode}
                        selectedCountryObject={selectedCountryObject}
                        handlePhoneInputChange={handlePhoneInputChange}
                      />
                    </Stack>
                  </CardContent>
                </Card>

                <Card
                  sx={{
                    borderRadius: 4,
                    border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                    boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 2px 12px rgba(0,0,0,0.08)'
                  }}
                >
                  <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                    <Stack spacing={2}>
                      <Stack direction='row' spacing={2} alignItems='center'>
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 2,
                            bgcolor:
                              theme.palette.mode === 'dark'
                                ? alpha(theme.palette.warning.main, 0.24)
                                : alpha(theme.palette.warning.main, 0.12),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Redeem sx={{ color: theme.palette.warning.main }} />
                        </Box>
                        <Box>
                          <Typography variant='h6' fontWeight={700}>
                            Choose your reward contribution
                          </Typography>
                          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                            Decide between cash sponsorship or curated physical rewards for quiz winners.
                          </Typography>
                        </Box>
                      </Stack>

                      <Divider sx={{ my: 1 }} />

                      <RewardSection
                        rewardTypeOptions={rewardTypeOptions}
                        rewardType={rewardType}
                        setRewardType={setRewardType}
                        formData={formData}
                        handleChange={handleChange}
                        errors={errors}
                      />
                    </Stack>
                  </CardContent>
                </Card>

                <Stack spacing={{ xs: 1.5, sm: 2 }}>
                  <Button
                    component='label'
                    variant='contained'
                    onClick={handleSubmit}
                    size='large'
                    sx={{
                      color: 'white',
                      py: { xs: 1.25, sm: 1.5 },
                      fontWeight: 700,
                      textTransform: 'none',
                      borderRadius: { xs: 1.5, sm: 2 },
                      fontSize: { xs: '0.95rem', sm: '1rem' },
                      boxShadow: isDarkMode ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}` : undefined,
                      '&:hover': {
                        boxShadow: isDarkMode
                          ? `0 8px 20px ${alpha(theme.palette.primary.main, 0.4)}`
                          : '0 8px 20px rgba(0,0,0,0.16)',
                        transform: 'translateY(-1px)'
                      }
                    }}
                    disabled={loading.submitting}
                  >
                    {loading.submitting ? (
                      <Stack direction='row' spacing={1.5} alignItems='center'>
                        <CircularProgress size={22} sx={{ color: 'white' }} />
                        <span>Submitting...</span>
                      </Stack>
                    ) : (
                      'Submit Sponsorship'
                    )}
                  </Button>

                  <Alert
                    icon={<CheckCircleOutline fontSize='inherit' />}
                    severity='success'
                    sx={{
                      borderRadius: { xs: 2, sm: 3 },
                      bgcolor:
                        theme.palette.mode === 'dark'
                          ? alpha(theme.palette.success.main, 0.18)
                          : alpha(theme.palette.success.main, 0.08),
                      color: theme.palette.mode === 'dark' ? theme.palette.success.light : theme.palette.success.dark,
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                      '& .MuiAlert-icon': {
                        fontSize: { xs: '1.2rem', sm: '1.5rem' }
                      }
                    }}
                  >
                    Sponsors are acknowledged across campaign promotions and receive periodic impact reports on their
                    contribution.
                  </Alert>
                </Stack>
              </Stack>
            </form>

            <Card
              sx={{
                borderRadius: { xs: 3, md: 4 },
                border: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.3 : 0.5)}`,
                boxShadow: isDarkMode
                  ? `0 2px 12px ${alpha(theme.palette.common.black, 0.3)}`
                  : '0 2px 12px rgba(0,0,0,0.08)',
                bgcolor: isDarkMode ? alpha(theme.palette.background.paper, 0.6) : undefined
              }}
            >
              <CardContent sx={{ p: { xs: 2.5, sm: 3, md: 4 } }}>
                <Typography
                  variant='body2'
                  fontWeight={700}
                  sx={{
                    color: theme.palette.primary.main,
                    letterSpacing: { xs: 1, sm: 1.5 },
                    fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' }
                  }}
                  gutterBottom
                >
                  SPONSORSHIP SNAPSHOT
                </Typography>

                <Stack spacing={{ xs: 2, sm: 2.5 }}>
                  <Box>
                    <Typography
                      variant='subtitle2'
                      fontWeight={700}
                      sx={{
                        color: 'text.primary',
                        fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' }
                      }}
                      gutterBottom
                    >
                      Quiz Focus
                    </Typography>
                    <Typography
                      variant='body2'
                      sx={{
                        color: 'text.secondary',
                        lineHeight: 1.6,
                        fontSize: { xs: '0.88rem', sm: '0.9rem', md: '0.95rem' }
                      }}
                    >
                      {hasSpecificQuizzes && selectedQuizNames?.length
                        ? selectedQuizNames.join(', ')
                        : 'Supporting any quiz that aligns with our traditional knowledge initiative.'}
                    </Typography>
                  </Box>

                  <Divider sx={{ borderColor: alpha(theme.palette.divider, isDarkMode ? 0.3 : 0.5) }} />

                  <Box>
                    <Typography
                      variant='subtitle2'
                      fontWeight={700}
                      sx={{
                        color: 'text.primary',
                        fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' }
                      }}
                      gutterBottom
                    >
                      Location Preference
                    </Typography>
                    <Typography
                      variant='body2'
                      sx={{
                        color: 'text.secondary',
                        fontSize: { xs: '0.88rem', sm: '0.9rem', md: '0.95rem' }
                      }}
                    >
                      {locationSummary}
                    </Typography>
                  </Box>

                  <Divider sx={{ borderColor: alpha(theme.palette.divider, isDarkMode ? 0.3 : 0.5) }} />

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1.5, sm: 2 }} alignItems='flex-start'>
                    <Box
                      sx={{
                        width: { xs: 44, sm: 48 },
                        height: { xs: 44, sm: 48 },
                        borderRadius: { xs: 1.5, sm: 2 },
                        bgcolor:
                          theme.palette.mode === 'dark'
                            ? alpha(theme.palette.primary.main, 0.2)
                            : alpha(theme.palette.primary.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {rewardSummary.icon}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant='subtitle2'
                        fontWeight={700}
                        sx={{
                          color: 'text.primary',
                          fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' }
                        }}
                      >
                        {rewardSummary.title}
                      </Typography>
                      <Typography
                        variant='body1'
                        fontWeight={600}
                        sx={{
                          color: theme.palette.primary.main,
                          fontSize: { xs: '0.95rem', sm: '1rem', md: '1.05rem' }
                        }}
                      >
                        {rewardSummary.primaryText}
                      </Typography>
                      <Typography
                        variant='body2'
                        sx={{
                          color: 'text.secondary',
                          mt: 0.5,
                          fontSize: { xs: '0.88rem', sm: '0.9rem', md: '0.95rem' }
                        }}
                      >
                        {rewardSummary.secondaryText}
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Container>
      </Box>
    </Box>
  )
}

export default SponsorQuizzes
