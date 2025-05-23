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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
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

import RewardDialog from '../RewardDialog'
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

// Initial form data
const initialFormData = {
  title: '',
  pin: Math.floor(100000 + Math.random() * 900000).toString(),
  description: '',
  quiz: '',
  startTime: null,
  duration: 600, // 10 minutes in seconds
  promotionalVideoUrl: '',
  thumbnailPoster: '',
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

// Main Game Form component
const GameForm = ({ onSubmit, quizzes, onCancel, data = null }) => {
  const [formData, setFormData] = useState(initialFormData)
  const [availablePositions, setAvailablePositions] = useState(POSITION_OPTIONS)
  const [selectedCountryObject, setSelectedCountryObject] = useState(null)
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [cityOptions, setCityOptions] = useState([])
  const fileInputRef = useRef(null)

  // Loading state
  const [loading, setLoading] = useState({
    fetchCities: false,
    submitting: false
  })

  // Reward Dialog states
  const [openRewardDialog, setOpenRewardDialog] = useState(false)
  const [editingReward, setEditingReward] = useState(null)

  // If Edit Game?
  useEffect(() => {
    console.log({ data })
    setFormData({
      ...data,
      quiz: data?.quiz?._id || null,
      startTime: data?.startTime ? new Date(data.startTime) : null,
      registrationEndTime: data.registrationEndTime ? new Date(data.registrationEndTime) : null
    })
    setSelectedCountryObject(
      data?.location?.country
        ? { country: data?.location?.country, countryCode: getCountryByName(data?.location?.country)?.countryCode }
        : null
    )
    setSelectedRegion(data?.location?.region || '')
    setSelectedCity(data?.location?.city || '')
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
    setFormData(prev => ({
      ...prev,
      [name]: date
    }))
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

  const handleSaveReward = reward => {
    setFormData(prev => {
      if (editingReward) {
        // Update existing reward
        return {
          ...prev,
          rewards: prev.rewards.map(r => (r.id === reward.id ? reward : r))
        }
      } else {
        // Add new reward
        return {
          ...prev,
          rewards: [...prev.rewards, reward]
        }
      }
    })
  }

  const handleRemoveReward = rewardId => {
    setFormData(prev => ({
      ...prev,
      rewards: prev.rewards.filter(r => r.id !== rewardId)
    }))
  }
  // ********* Reward Related Functions - END ***********

  const handleSubmit = async () => {
    console.log('Hello')
    await onSubmit({
      ...formData,
      location: { country: selectedCountryObject?.country, region: selectedRegion, city: selectedCity }
    })
  }

  // Image upload
  const handleImageUpload = async e => {
    const file = e.target.files[0]
    if (!file) return

    // Resize image if over 2MB
    if (file.size > 2 * 1024 * 1024) {
      try {
        const compressedFile = await compressImage(file)
        setFormData(prev => ({ ...prev, thumbnailPoster: compressedFile }))
      } catch (error) {
        console.error('Compression error:', error)
      }
    } else {
      const reader = new FileReader()
      reader.onload = event => {
        setFormData(prev => ({
          ...prev,
          thumbnailPoster: event.target.result
        }))
      }
      reader.readAsDataURL(file)
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

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant='h5' gutterBottom>
          Game Details
        </Typography>
      </Grid>

      {/* Basic Information */}
      <Grid item xs={12} md={6}>
        <TextField fullWidth label='Game Title' name='title' value={formData.title} onChange={handleChange} required />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label='6-digit PIN'
          name='pin'
          value={formData.pin}
          onChange={handleChange}
          required
          inputProps={{ maxLength: 6, pattern: '\\d{6}' }}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label='Description'
          name='description'
          value={formData.description}
          onChange={handleChange}
          multiline
          rows={3}
        />
      </Grid>

      <Grid item xs={12}>
        <FormControl fullWidth>
          <InputLabel>Quiz</InputLabel>
          <Select name='quiz' value={formData.quiz} label='Quiz' onChange={handleChange} required>
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
        </FormControl>
      </Grid>

      {/* Start Date & Time */}
      <Grid item xs={12} md={6}>
        <DateTimePicker
          sx={{ width: '100%' }}
          label='Start Time'
          value={formData.startTime ? dayjs(formData.startTime) : null}
          onChange={newValue => handleDateChange('startTime', newValue ? newValue.toDate() : null)}
          renderInput={params => (
            <TextField
              {...params}
              required
              InputLabelProps={{
                shrink: true
              }}
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label='Duration (seconds)'
          name='duration'
          type='number'
          value={formData.duration}
          onChange={handleChange}
          required
          inputProps={{ min: 60 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <AccessTimeIcon />
              </InputAdornment>
            )
          }}
        />
      </Grid>

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
            sx={{ width: '100%' }}
            label='Registration End Time'
            value={formData.registrationEndTime ? dayjs(formData.registrationEndTime) : null}
            onChange={newValue => handleDateChange('registrationEndTime', newValue ? newValue.toDate() : null)}
            renderInput={params => (
              <TextField
                {...params}
                fullWidth
                required
                InputLabelProps={{
                  shrink: true
                }}
              />
            )}
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
            inputProps={{ min: 1 }}
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
              setSelectedCountry={() => {}}
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
                  type='url'
                  placeholder='https://youtube.com/watch?v=...'
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
                  accept='image/*'
                  style={{ display: 'none' }}
                />
                {formData.thumbnailPoster ? (
                  <Box sx={{ position: 'relative', mb: 2 }}>
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
                        boxShadow: 1
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
                          setFormData(prev => ({
                            ...prev,
                            thumbnailPoster: ''
                          }))
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
                      borderColor: 'divider',
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
                  type='url'
                  sx={{ mt: 2 }}
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
            value.map((option, index) => <Chip variant='outlined' label={option} {...getTagProps({ index })} />)
          }
          renderInput={params => <TextField {...params} label='Tags' placeholder='Add tags' />}
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

        {formData.rewards.length === 0 ? (
          <Typography variant='body2' color='text.secondary' sx={{ mt: 2 }}>
            No rewards added yet
          </Typography>
        ) : (
          <Box sx={{ mt: 2 }}>
            {formData.rewards.map(reward => {
              // Calculate total cash reward if reward type is cash
              const totalCashReward =
                reward.rewardType === 'cash' ? reward.rewardValuePerWinner * reward.numberOfWinnersForThisPosition : 0

              return (
                <Card key={reward.id} variant='outlined' sx={{ mb: 2 }}>
                  <CardContent>
                    <Stack direction='row' justifyContent='space-between' alignItems='center' mb={2}>
                      <Typography variant='h6'>Position {reward.position} Reward</Typography>
                      <Stack direction='row'>
                        <IconButton onClick={() => handleEditReward(reward)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleRemoveReward(reward.id)}>
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
                      Sponsor Contributions ({reward.sponsors.length})
                    </Typography>

                    {reward.sponsors.length > 0 && (
                      <Grid container spacing={2}>
                        {reward.sponsors.map(sponsor => (
                          <Grid item xs={12} sm={6} key={sponsor.id}>
                            <Paper variant='outlined' sx={{ p: 2 }}>
                              <Typography variant='body2'>{sponsor.email}</Typography>
                              <Typography variant='body2' color='text.secondary'>
                                {reward.rewardType === 'cash'
                                  ? `Contributed: ${sponsor.currency} ${sponsor.allocated.toFixed(2)}`
                                  : `Provided: ${sponsor.allocated} items`}
                              </Typography>
                              <Typography variant='caption' color='text.secondary'>
                                {reward.rewardType === 'cash'
                                  ? `Remaining balance: ${sponsor.currency} ${(
                                      sponsor.availableAmount - sponsor.allocated
                                    ).toFixed(2)}`
                                  : `Remaining stock: ${sponsor.availableItems - sponsor.allocated}`}
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
          onClose={() => setOpenRewardDialog(false)}
          reward={editingReward}
          onSave={handleSaveReward}
          availablePositions={availablePositions}
          isEditing={!!editingReward}
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
