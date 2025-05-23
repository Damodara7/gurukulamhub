'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Grid,
  Typography,
  Autocomplete,
  FormControlLabel
} from '@mui/material'
import { toast } from 'react-toastify' // Assuming you are using react-toastify for notifications
import * as RestApi from '@/utils/restApiUtil' // Assuming RestApi and ApiUrls are defined
import { API_URLS } from '@/configs/apiConfig'
import { useSession } from 'next-auth/react'
import PrizeTable from './PrizeTable'
import CertificateForm from './CertificateForm'
import MediaViewer from '@/components/media-viewer/MediaViewer'
import ChevronToggleComponent from '@/components/media-viewer/ChevronToggleComponent'
import useUUID from '@/app/hooks/useUUID'
import ImageUploader from '@/components/media-viewer/ImageUploader'
import { useRouter } from 'next/navigation'

import { generateGamePinOfSixDigit } from './gameUtils'
import { LocationCityTwoTone } from '@mui/icons-material'
import CountryRegionDropdown from '../pages/auth/register-multi-steps/CountryRegionDropdown'
import MultiSelect from '@/components/MultiSelect'
import Loading from '@/components/Loading'
import Rewards from '@/components/game/Rewards'

const urls = [
  'https://avatars.githubusercontent.com/u/33640448?v=4',
  'https://httpbin.org/image/webp',
  'https://upload.wikimedia.org/wikipedia/commons/a/a3/June_odd-eyed-cat.jpg',
  'https://youtu.be/Whc8if9P5So?si=oI1NiAtEd4OPsW7k'
]

const rewardTypes = [
  { label: 'Gifts', value: 'gifts' },
  { label: 'Reward Points', value: 'rewardpoints' },
  { label: 'Cash', value: 'cash' },
  { label: 'Voucher', value: 'voucher' }
]

// Function to get the current local date and time + 20 minutes
const getInitialTimePlusMinutes = (addMinutes = 20) => {
  const now = new Date()
  now.setMinutes(now.getMinutes() + addMinutes) // Add 20 minutes

  // Get the local date and time in 'YYYY-MM-DDTHH:MM' format
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0') // Months are 0-based
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

// Function to get the current time + specified minutes in ISO format
const getInitialTimePlusMinutesISO = (addMinutes = 20) => {
  const now = new Date()
  now.setMinutes(now.getMinutes() + addMinutes) // Add specified minutes
  // Return the date-time in ISO format
  return now.toISOString()
}

function CreateGame({ mode = 'create', quizId = '', gameId }) {
  const { data: session, update, status } = useSession()
  const [myQuizzes, setMyQuizzes] = useState([])
  const [selectedQuiz, setSelectedQuiz] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedCountryObject, setSelectedCountryObject] = useState(null)
  const [selectedRegion, setSelectedRegion] = useState('')
  const [city, setCity] = useState('')
  const [cityOptions, setCityOptions] = useState([])
  const [selectedRewardType, setSelectedRewardType] = useState('')
  const { uuid, regenerateUUID, getUUID } = useUUID()
  const router = useRouter()
  const [isoDateTime, setIsoDateTime] = useState('')
  const [dateTimeInput, setDateTimeInput] = useState(getInitialTimePlusMinutes(1))
  const [endDateTimeInput, setEndDateTimeInput] = useState(getInitialTimePlusMinutes(120))
  const [sponsorships, setSponsorships] = useState([])
  const [selectedSponsors, setSelectedSponsors] = useState([])

  // Loading state
  const [loading, setLoading] = useState({
    fetchCities: false,
    submitting: false
  })

  const [gameData, setGameData] = useState({
    _id: getUUID().substring(0, 32),
    gamePin: generateGamePinOfSixDigit(),
    quizId: quizId,
    title: '',
    details: '',
    startDate: getInitialTimePlusMinutesISO(1),
    endDate: getInitialTimePlusMinutesISO(120),
    slogan: 'Play & Win Goodies',
    owner: session?.user?.email,
    moderatorId: '',
    moderatorEmail: '',
    thumbnailUrl: 'https://www.triesoltech.com/squizmelogosvg@2x.967c6784.png',
    promoVideoUrl: 'https://youtu.be/mJahGSGPVNQ?si=bRn4BBZUxvsNb4Td',
    sponsorName: '',
    sponsorWebSite: '',
    sponsorPhone: '',
    totalRewardsValue: '',
    remarks: '',
    remarksNotes: '',
    status: 'active',
    gameStatus: 'active' // active/live/archived
  })

  async function getQuizData() {
    //// toast.success('Fetching My Quiz Data now...')
    setLoading(true)
    const result = await RestApi.get(`${API_URLS.v0.USERS_QUIZ}`)
    if (result?.status === 'success') {
      console.log('Quizzes Fetched result', result)
      //// toast.success('Quizzes Fetched Successfully .')
      setLoading(false)
      setMyQuizzes(result.result)
    } else {
      // toast.error('Error:' + result?.result?.message)
      console.log('Error Fetching quizes:', result)
      setLoading(false)
      setMyQuizzes([])
    }
  }

  async function getGameData() {
    setLoading(true)
    const result = await RestApi.get(`${API_URLS.v0.USERS_GAME}?email=${session?.user?.email}`)
    if (result?.status === 'success') {
      console.log('Quizzes Fetched result', result)
      //toast.success('Quizzes Fetched Successfully .')
      setLoading(false)
      setMyQuizzes(result.result)
    } else {
      toast.error('Error:' + result?.result?.message)
      console.log('Error Fetching quizes:', result)
      setLoading(false)
      setMyQuizzes([])
    }
  }

  useEffect(() => {
    getQuizData()
  }, [])

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

  useEffect(() => {
    setSelectedSponsors([])
    async function getSponsorships() {
      try {
        if (!selectedQuiz && !selectedCountry) {
          setSponsorships([])
          return
        }

        let searchParams = []
        if (selectedQuiz) {
          searchParams.push(`quizId=${selectedQuiz}`)
          searchParams.push(`sponsorType=quiz`)
        }
        if (selectedCountry) {
          searchParams.push(`country=${selectedCountry}`)
        }
        if (selectedRegion) {
          searchParams.push(`region=${selectedRegion}`)
        }
        if (city) {
          searchParams.push(`city=${city}`)
        }

        const url = `${API_URLS.v0.SPONSORSHIP}?${searchParams.join('&')}`

        const res = await RestApi.get(url)

        // console.log({getSponsorshipsRes: res})

        if (res.status === 'success') {
          setSponsorships(res.result)
          toast.success(res.message)
        } else {
          toast.error(res.message)
          setSponsorships([])
        }
      } catch (error) {
        console.log(error)
        setSponsorships([])
      }
    }

    getSponsorships()
  }, [selectedQuiz, selectedCountry, selectedRegion, city])

  const handleQuizSelect = async event => {
    setSelectedQuiz(event.target.value)
    console.log('Quiz selected:', event.target.value)
    const quiz = myQuizzes.find(quiz => quiz._id === event.target.value)
    setGameData({
      ...gameData,
      [event.target.name]: event.target.value,
      ['title']: 'Game On ' + quiz.title,
      ['details']: quiz.details
    })
  }

  const handleRewardTypeSelect = event => {
    setSelectedRewardType(event.target.value)
    console.log('RewardType selected:', event.target.value)
  }

  const handleChange = event => {
    setGameData({
      ...gameData,
      [event.target.name]: event.target.value
    })
  }

  // Function to convert ISO to local time
  const convertToLocalTime = isoDateTime => {
    if (isoDateTime) {
      const localDate = new Date(isoDateTime)
      setLocalDateTime(localDate.toLocaleString()) // Convert to local string format
    }
  }

  const handleTimeChange = event => {
    console.log('Game Date:', event.target.value) // Store in UTC
    // Convert the input date (expected to be in the correct format) to ISO format
    var date = new Date(event.target.value)
    const value = event.target.value
    setDateTimeInput(value)

    // Convert the input date to ISO format
    date = new Date(value)
    const isoString = date.toISOString()
    setIsoDateTime(isoString)

    //setIsoDateTime(); // Update the ISO date state
    setGameData({
      ...gameData,
      [event.target.name]: isoString
    })
  }

  const handleEndTimeChange = event => {
    console.log('Game Date:', event.target.value) // Store in UTC
    // Convert the input date (expected to be in the correct format) to ISO format
    var date = new Date(event.target.value)
    const value = event.target.value
    setEndDateTimeInput(value)

    // Convert the input date to ISO format
    date = new Date(value)
    const isoString = date.toISOString()
    setIsoDateTime(isoString)

    //setIsoDateTime(); // Update the ISO date state
    setGameData({
      ...gameData,
      [event.target.name]: isoString
    })
  }

  const setTheFormValue = (name, val) => {
    setGameData({
      ...gameData,
      [name]: val
    })
  }

  const handleSubmit = e => {
    e.preventDefault()
    // Handle game creation logic here
    console.log('Game Data:', gameData, 'Selected Quiz:', selectedQuiz)
    onSubmit()
  }

  const onSubmit = async () => {
    console.log('GameDataValues: ', gameData) // Access form values here
    const result = await RestApi.post(API_URLS.v0.USERS_GAME, gameData)
    if (result?.status === 'success') {
      console.log('gridTemplateAreas:  Added result', result)
      // toast.success('Game Added Successfully .')
      setLoading(false)
      router.push('/mygames/view')
    } else {
      // toast.error('Error:' + result.message)
      setLoading(false)
    }
  }

  const handleChangeCountry = countryValue => {
    setSelectedRegion('')
  }

  return (
    <Box className='pb-2'>
      <Typography variant='h4' gutterBottom>
        {mode === 'edit' ? 'Edit Game' : mode === 'create' ? 'Create Game' : 'view'}
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={4}>
          {/* Game Id */}
          <Grid item xs={12} md={6}>
            <TextField
              label='Game Id'
              name='_id'
              value={gameData._id.substring(0, 32)}
              onChange={handleChange}
              fullWidth
              variant='outlined'
            />
          </Grid>
          {/* Game pin */}
          <Grid item xs={12} md={6}>
            <TextField
              label='Game Pin'
              name='gamePin'
              value={gameData.gamePin}
              onChange={handleChange}
              fullWidth
              variant='outlined'
            />
          </Grid>
        </Grid>

        {/* Location Selection */}
        <Typography variant='h6' className='mt-2' gutterBottom>
          Select Quiz & Location for the game
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* Quiz Selection */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth variant='outlined'>
              <InputLabel id='quiz-select-label'>Select Quiz</InputLabel>
              <Select
                labelId='quiz-select-label'
                value={selectedQuiz}
                name='quizId'
                onChange={handleQuizSelect}
                label='Select Quiz'
                renderValue={selected => {
                  const quiz = myQuizzes.find(quiz => quiz._id === selected)
                  return quiz ? `${quiz.title}` : 'Select Quiz'
                }}
              >
                {myQuizzes.map(quiz => (
                  <MenuItem key={quiz._id} value={quiz._id}>
                    <Grid container alignItems='center' spacing={2}>
                      {/* Quiz Thumbnail on the Left */}
                      <Grid item>
                        <img
                          src={quiz.thumbnail || 'https://via.placeholder.com/150'}
                          alt={quiz.title}
                          style={{ width: 50, height: 50, borderRadius: '50%' }}
                        />
                      </Grid>

                      {/* Title and ID on the Right, stacked */}
                      <Grid item>
                        <Typography variant='body1' fontWeight='bold'>
                          {quiz.title}
                        </Typography>
                        <Typography variant='body2' color='textSecondary'>
                          {quiz.details}
                        </Typography>
                      </Grid>
                    </Grid>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <CountryRegionDropdown
              setSelectedCountry={setSelectedCountry}
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

        <Grid container spacing={4}>
          {/* Game Title */}
          <Grid item xs={12} md={6}>
            <TextField
              label='Game Title'
              name='title'
              value={gameData.title}
              onChange={handleChange}
              fullWidth
              variant='outlined'
            />
          </Grid>

          {/* Game Details */}
          <Grid item xs={12} md={6}>
            <TextField
              label='Game Details'
              name='details'
              value={gameData.details}
              onChange={handleChange}
              fullWidth
              variant='outlined'
              multiline
              rows={4}
            />
          </Grid>

          {/* Start Date & Time */}
          <Grid item xs={12} md={3}>
            <TextField
              label='Start Date & Time'
              name='startDate'
              value={dateTimeInput}
              onChange={handleTimeChange}
              type='datetime-local'
              fullWidth
              InputLabelProps={{ shrink: true }}
              variant='outlined'
            />
          </Grid>
          {/* Start Date & Time */}
          <Grid item xs={12} md={3}>
            <TextField
              label='End Date & Time'
              name='endDate'
              //disabled={true}
              value={endDateTimeInput}
              onChange={handleEndTimeChange}
              type='datetime-local'
              fullWidth
              InputLabelProps={{ shrink: true }}
              variant='outlined'
            />
          </Grid>

          {/*  Slogan */}
          <Grid item xs={12} md={6}>
            <TextField
              label='Slogan'
              name='slogan'
              value={gameData.slogan}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
              variant='outlined'
            />
          </Grid>
          {/*  Owner */}
          <Grid item xs={12} md={6}>
            <TextField
              name='Owner'
              label='Owner'
              variant='outlined'
              fullWidth
              aria-readonly
              inputProps={{
                readOnly: 'true'
              }}
              value={session?.user?.email}
            />
          </Grid>
          {/*  Owner */}
          <Grid item xs={12} md={6}>
            <TextField
              name='moderatorId'
              label='Moderator ID'
              variant='outlined'
              fullWidth
              aria-readonly
              value={session?.user?.email}
            />
          </Grid>
          {/*  Owner */}
          <Grid item xs={12} md={6}>
            <TextField
              name='moderatorEmail'
              label='Moderator Email'
              variant='outlined'
              fullWidth
              aria-readonly
              value={session?.user?.email}
            />
          </Grid>

          {/* <Grid item xs={12} md={6}>
          <FormControl fullWidth variant='outlined'>
            <InputLabel id='rewardtype-select-label'>Select RewardType</InputLabel>
            <Select
              labelId='rewardtype-select-label'
              value={selectedRewardType}
              onChange={handleRewardTypeSelect}
              label='Select Reward Type'
              renderValue={selected => {
                const rewardType = rewardTypes.find(rewardType => rewardType.value === selected)
                return rewardType ? `${rewardType.label}` : 'Select RewardType'
              }}
            >
              {rewardTypes.map(type => (
                <MenuItem key={type.value} value={type.value}>
                  <Typography variant='body1' fontWeight='bold'>
                    {type.label}
                  </Typography>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid> */}

          {/*  Poster & Thumbnail */}
          <Grid item xs={12} md={12} sx={{ borders: '1px solid gray', marginBottom: 2 }}>
            <ImageUploader
              bucketName={process.env.NEXT_PUBLIC_AWS_S3_GAMES_UPLOAD_BUCKET}
              regionName={process.env.NEXT_PUBLIC_AWS_S3_REGION}
              heading={'Upload Poster (Thumbnail) *'}
              minimizedSubHeading={'Click the chevron to view thumbnail'}
              mediaUrl={gameData.thumbnailUrl}
              setTheFormValue={setTheFormValue}
              formFieldName='thumbnailUrl'
              saveCompressedFileName={`${gameData._id}-poster-image.jpg`}
              saveThumbnailFileName={`${gameData._id}-thumbnail-image.jpg`}
            />
          </Grid>

          <Grid item xs={12} md={6} sx={{ borders: '1px solid gray', marginBottom: 2 }}>
            <ChevronToggleComponent
              minimizedSubHeading={'Click the chevron to view media'}
              heading={'Promotional Video '}
            >
              <>
                <TextField
                  name='promoVideoUrl'
                  label='Promo Video URL'
                  variant='outlined'
                  fullWidth
                  onChange={handleChange}
                  value={gameData.promoVideoUrl}
                />
                <MediaViewer showUrl={false} mediaType={'video'} mediaUrl={gameData.promoVideoUrl}></MediaViewer>
              </>
            </ChevronToggleComponent>
          </Grid>
          <Grid item xs={12} md={6}>
            <ChevronToggleComponent
              minimizedSubHeading={'Click the chevron to view Recognition settings'}
              heading={'Recognitions'}
            >
              <CertificateForm />
            </ChevronToggleComponent>
          </Grid>

          {/* Rewards Section */}
          <Grid item xs={12} md={12}>
            <Rewards sponsors={sponsorships} />
          </Grid>

          <Grid item xs={12} md={12}>
            <ChevronToggleComponent minimizedSubHeading={'Click the chevron to view media'} heading={'Rewards '}>
              <>
                <TextField
                  name='totalRewardsValue'
                  label='Total Rewards Value'
                  variant='outlined'
                  fullWidth
                  onChange={handleChange}
                  value={gameData.totalRewardsValue}
                />
                <PrizeTable />
              </>
            </ChevronToggleComponent>
          </Grid>

          <Grid xs={12} md={6} sx={{ marginLeft: '15px', marginTop: '15px' }}>
            <ChevronToggleComponent minimizedSubHeading={'Click the chevron to View Sponsors'} heading={'Sponsors '}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={12}>
                  <MultiSelect
                    label='Select Sponsors'
                    placeholder='Select Sponsors'
                    selectedValues={selectedSponsors}
                    onChange={values => {
                      // Update the form data
                      setSelectedSponsors(values)
                    }}
                    defaultAll={false} // Enable "All" behavior
                    options={sponsorships.map(sp => {
                      const formattedAmt = new Intl.NumberFormat(undefined, {
                        style: 'currency',
                        currency: 'INR'
                      }).format(sp.sponsorshipAmount)
                      return {
                        value: sp._id,
                        optionLabel: (
                          <>
                            <Grid container alignItems='center' spacing={2}>
                              <Grid item>
                                <Typography variant='body1' fontWeight='bold'>
                                  {sp.email}
                                </Typography>
                                <Typography variant='body2' fontWeight='bold' color='textSecondary'>
                                  {formattedAmt}
                                </Typography>
                              </Grid>
                            </Grid>
                          </>
                        ),
                        selectedLabel: (
                          <Typography>
                            {`${sp.email} - `}
                            <b>{formattedAmt}</b>
                          </Typography>
                        )
                      }
                    })}
                  />
                </Grid>
              </Grid>
            </ChevronToggleComponent>
          </Grid>

          <Grid xs={12} md={5} sx={{ marginLeft: '15px', marginTop: '15px' }}>
            <ChevronToggleComponent
              minimizedSubHeading={'Click the chevron to View Sponsors'}
              heading={'Remarks & Notes '}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} md={12}>
                  <TextField
                    name='remarks'
                    label='remarks'
                    variant='outlined'
                    fullWidth
                    onChange={handleChange}
                    value={gameData.remarks}
                  />
                </Grid>
                <Grid item xs={12} md={12}>
                  <TextField
                    name='notes'
                    label='notes'
                    variant='outlined'
                    fullWidth
                    onChange={handleChange}
                    value={gameData.remarksNotes}
                  />
                </Grid>
              </Grid>
            </ChevronToggleComponent>
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12} md={6}>
            <Button
              variant='contained'
              component='label'
              type='submit'
              onClick={handleSubmit}
              disabled={loading.submitting || !selectedQuiz || !gameData.title}
            >
              Create Game
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  )
}

export default CreateGame
