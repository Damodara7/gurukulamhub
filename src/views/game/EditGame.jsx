'use client'

import React, { useState, useEffect } from 'react'
import { Box, Button, TextField, MenuItem, Select, InputLabel, FormControl, Grid, Typography } from '@mui/material'
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

// Function to get the current time + specified minutes in ISO format
const getInitialTimePlusMinutesISO = (addMinutes = 20) => {
  const now = new Date()
  now.setMinutes(now.getMinutes() + addMinutes) // Add specified minutes
  // Return the date-time in ISO format
  return now.toISOString()
}

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

function EditGame({ mode = 'edit', gameId, quizId = '' }) {
  const { data: session, update, status } = useSession()
  const [myQuizzes, setMyQuizzes] = useState([])
  const [selectedQuiz, setSelectedQuiz] = useState('')
  const [selectedRewardType, setSelectedRewardType] = useState('')
  const { uuid, regenerateUUID, getUUID } = useUUID()
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const [isoDateTime, setIsoDateTime] = useState('')
  const [dateTimeInput, setDateTimeInput] = useState(getInitialTimePlusMinutes(1))
  const [endDateTimeInput, setEndDateTimeInput] = useState(getInitialTimePlusMinutes(120))

  const [gameData, setGameData] = useState({
    _id: getUUID().substring(0, 32),
    pin: generateGamePinOfSixDigit(),
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

  // Function to convert ISO to local time
  const convertToLocalTime = isoDateTime => {
    if (isoDateTime) {
      const localDate = new Date(isoDateTime)
      return convertISODateAndAddMinutes(localDate, 0)
    }
  }

  // Function to get the current local date and time + 20 minutes
  const convertISODateAndAddMinutes = (initDate, addMinutes = 20) => {
    const now = new Date(initDate)
    now.setMinutes(now.getMinutes() + addMinutes) // Add 20 minutes

    // Get the local date and time in 'YYYY-MM-DDTHH:MM' format
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0') // Months are 0-based
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  async function getGameData() {
    setLoading(true)
    const result = await RestApi.get(`${API_URLS.v0.USERS_GAME}/${gameId}`)
    if (result?.status === 'success') {
      console.log('Games Fetched result', result)
      //toast.success('Quizzes Fetched Successfully .')
      setLoading(false)
      var gameData = result.result
      console.log('Local date...', convertToLocalTime(gameData.startDate))
      gameData.startDate = convertToLocalTime(gameData.startDate)
      gameData.endDate = convertToLocalTime(gameData.endDate)
      console.log('End Local date is', gameData.endDate)
      setGameData(gameData)
    } else {
      toast.error('Error:' + result?.result?.message)
      console.log('Error Fetching quizes:', result)
      setLoading(false)
      setGameData(null)
    }
  }

  useEffect(() => {
    getGameData()
  }, [])

  const handleChange = event => {
    setGameData({
      ...gameData,
      [event.target.name]: event.target.value
    })
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
    const result = await RestApi.put(API_URLS.v0.USERS_GAME, gameData)
    if (result?.status === 'success') {
      ///console.log('gridTemplateAreas:  Added result', result)
      toast.success('Game Updated Successfully .')
      setLoading(false)
      router.push('/mygames/view')
    } else {
      toast.error('Error:' + result.message)
      setLoading(false)
    }
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
              value={gameData._id}
              onChange={handleChange}
              fullWidth
              inputProps={{
                readOnly: 'true'
              }}
              variant='outlined'
            />
          </Grid>
          {/* Game pin */}
          <Grid item xs={12} md={6}>
            <TextField
              label='Game Pin'
              name='pin'
              value={gameData.pin}
              onChange={handleChange}
              fullWidth
              variant='outlined'
            />
          </Grid>
          {/* Quiz Selection */}
          <Grid item xs={12} md={6}>
            <TextField
              label='Quiz Id'
              name='quizId'
              value={gameData.quizId}
              onChange={handleChange}
              fullWidth
              variant='outlined'
            />
          </Grid>

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
              // disabled={true}
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
              saveFileName={gameData._id}
            ></ImageUploader>
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
              <CertificateForm></CertificateForm>
            </ChevronToggleComponent>
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
                <PrizeTable></PrizeTable>
              </>
            </ChevronToggleComponent>
          </Grid>

          <Grid xs={12} md={6} sx={{ marginLeft: '15px', marginTop: '15px' }}>
            <ChevronToggleComponent minimizedSubHeading={'Click the chevron to View Sponsors'} heading={'Sponsors '}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={12}>
                  <TextField
                    name='sponsorName'
                    label='Sponsor'
                    variant='outlined'
                    fullWidth
                    onChange={handleChange}
                    value={gameData.sponsorName}
                  />
                </Grid>
                <Grid item xs={12} md={12}>
                  <TextField
                    name='sponsorWebSite'
                    label='Sponsor website'
                    variant='outlined'
                    fullWidth
                    onChange={handleChange}
                    value={gameData.sponsorWebSite}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    name='sponsorPhone'
                    label='Sponsor Phone'
                    variant='outlined'
                    fullWidth
                    onChange={handleChange}
                    value={gameData.sponsorPhone}
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
              disabled={loading || !gameData.title}
            >
              Update Game
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  )
}

export default EditGame
