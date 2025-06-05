import React, { useState, useEffect } from 'react'
import { Box, Typography, Button, Divider, CircularProgress } from '@mui/material'
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
  rewardValuePerItem: '',
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
      if (!formData.rewardValuePerItem) newErrors.rewardValuePerItem = 'Estimated value is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    console.log('submitting...')
    if (validateForm()) {
      setLoading(prev => ({ ...prev, submitting: true }))

      try {
        const payload = {
          email: session?.user?.email,
          fullname: formData.fullname,
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
            sponsorshipStatus: 'created', // Only for cash rewards
            nonCashSponsorshipStatus: undefined,
            sponsorshipExpiresAt: new Date(Date.now() + 2 * 60 * 1000) // 2 minutes
          }),
          ...(rewardType === REWARD_TYPES.PHYSICAL_GIFT && {
            nonCashItem: formData.nonCashItem,
            numberOfNonCashItems: Number(formData.numberOfNonCashItems),
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

  return (
    <Box sx={{ p: 2 }}>
      <>
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
      </>

      <form>
        <QuizSelection
          quizzes={quizzes}
          selectedQuizzes={selectedQuizzes}
          setSelectedQuizzes={setSelectedQuizzes}
          errors={errors}
          setErrors={setErrors}
        />

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

        <SponsorerInfo
          sponsorerType={sponsorerType}
          setSponsorerType={setSponsorerType}
          formData={formData}
          errors={errors}
          handleChange={handleChange}
        />

        <RewardSection
          rewardTypeOptions={rewardTypeOptions}
          rewardType={rewardType}
          setRewardType={setRewardType}
          formData={formData}
          handleChange={handleChange}
          errors={errors}
        />

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
