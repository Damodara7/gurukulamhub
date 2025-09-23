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
  Radio,
  CircularProgress
} from '@mui/material'
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  VideocamOff as VideocamOffIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material'

import RewardRequestDialog from './RewardRequestDialog'
import ReactPlayer from 'react-player'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import Loading from '@/components/Loading'
import { gmttimezones } from '@/data/gmttimezones'
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
  'gameMode',
  'duration',
  'limitPlayers',
  'maxPlayers',
  'promotionalVideoUrl',
  'thumbnailPoster',
  'tags',
  'rewards',
  'forwardType'
]

// Main Game Request Sponsorship Form component
const GameRequestSponsorshipForm = ({ onSubmit, quizzes, onCancel, data = null }) => {
  // Initial form data
  const initialFormData = {
    title: '',
    pin: Math.floor(100000 + Math.random() * 900000).toString(),
    description: '',
    quiz: '',
    duration: null,
    promotionalVideoUrl: '',
    thumbnailPoster: '',
    forwardType: 'auto',
    gameMode: 'live',
    limitPlayers: false,
    maxPlayers: 100000,
    tags: [],
    audienceId: null,
    rewards: []
  }
  
  const [formData, setFormData] = useState(initialFormData)
  const [availablePositions, setAvailablePositions] = useState(POSITION_OPTIONS)
  const [errors, setErrors] = useState({})
  const [touches, setTouches] = useState({})
  const fileInputRef = useRef(null)
  const [showErrorSnackbar, setShowErrorSnackbar] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [showScheduleFields, setShowScheduleFields] = useState(false)

  // Loading state
  const [loading, setLoading] = useState({
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
    duration: useRef(),
    maxPlayers: useRef(),
    promotionalVideoUrl: useRef(),
    thumbnailPoster: useRef(),
    tags: useRef(),
    forwardType: useRef(),
    gameMode: useRef()
  }

  // If Edit Game?
  useEffect(() => {
    if (data) {
      console.log({ data })
      setFormData({
        ...initialFormData,
        ...data,
        quiz: data?.quiz?._id || null,
        duration: data?.duration ? Math.floor(data.duration / 60) : '',
        gameMode: data?.gameMode || 'live',
        audienceId: data?.audienceId || null
      })
    }
  }, [data])

  useEffect(() => {
    const usedPositions = formData?.rewards?.map(r => r.position)
    setAvailablePositions(POSITION_OPTIONS.filter(pos => !usedPositions.includes(pos)))
  }, [formData?.rewards])

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setTouches(prev => ({ ...prev, [name]: true }))
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

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
            sponsorship: updatedDisplaySponsorships?.find(s => (s?._id || s?.id) === prevSponsor?.sponsorshipId)
          })
        }
      })

      console.log('removedSponsorsMap in handleSaveReward in GameRequestSponsorshipForm : ', removedSponsorsMap)

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
    setFormData(prev => ({
      ...prev,
      rewards: prev.rewards.filter(r => (r?._id || r?.id) !== rewardId)
    }))
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

      if (firstErrorField && fieldRefs[firstErrorField] && fieldRefs[firstErrorField].current) {
        fieldRefs[firstErrorField].current.scrollIntoView({ behavior: 'smooth', block: 'center' })
        if (typeof fieldRefs[firstErrorField].current.focus === 'function') {
          fieldRefs[firstErrorField].current.focus()
        }
      }
      return
    }

    // Check if all rewards have sufficient sponsorships
    const needsSponsorship = formData.rewards.some(reward => {
      const totalNeeded = reward.rewardType === 'cash' 
        ? reward.rewardValuePerWinner * reward.numberOfWinnersForThisPosition
        : reward.numberOfWinnersForThisPosition
      
      const totalAllocated = reward.sponsors?.reduce((sum, sponsor) => sum + (sponsor.allocated || 0), 0) || 0
      
      return totalAllocated < totalNeeded
    })

    if (!needsSponsorship) {
      // All rewards are fully sponsored, show schedule fields
      setShowScheduleFields(true)
      return
    }

    // Submit as awaiting sponsorship - send raw formData like GameForm does
    console.log('submission data: ', formData)
    await onSubmit(formData)
  }

  // Image upload
  const handleImageUpload = async e => {
    const file = e.target.files[0]
    if (!file) return

    let updatingFormData = { ...formData }

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
    <Grid container spacing={4}>
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
          <FormHelperText>{errors.quiz || 'Select a quiz'}</FormHelperText>
        </FormControl>
      </Grid>

      {/* Audience Selection */}
      {/* <Grid item xs={12}>
        <GroupAutocomplete
          value={formData.audienceId}
          onChange={audienceId => {
            setFormData(prev => ({ ...prev, audienceId }))
          }}
          label='Target Audience (Optional)'
          placeholder='Search for a audience to restrict game access...'
        />
      </Grid> */}

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

      {/* Forward Type Selection - only if live */}
      {formData.gameMode === 'live' && (
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
      )}

      {/* Duration (only if self-paced) */}
      {formData.gameMode === 'self-paced' && (
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
      )}

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
            {/* Video Section */}
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

            {/* Image Upload Section */}
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
                  <Box
                    sx={{
                      position: 'relative',
                      mb: 2,
                      height: '200px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#f5f5f5'
                    }}
                  >
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
                        zIndex: 2,
                        transform: 'translateY(-1px)'
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
                          setTouches(prev => ({ ...prev, thumbnailPoster: true }))
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
                const totalNeeded = reward.rewardType === 'cash' 
                  ? reward.rewardValuePerWinner * reward.numberOfWinnersForThisPosition
                  : reward.numberOfWinnersForThisPosition
                
                const totalAllocated = reward.sponsors?.reduce((sum, sponsor) => sum + (sponsor.allocated || 0), 0) || 0
                const remainingNeed = totalNeeded - totalAllocated

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
                                Total needed: {reward.currency} {totalNeeded.toFixed(2)} (
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
                        <Typography variant='body2' color={remainingNeed > 0 ? 'error.main' : 'success.main'}>
                          {remainingNeed > 0 
                            ? `Still needs: ${reward.rewardType === 'cash' ? `${reward.currency} ${remainingNeed.toFixed(2)}` : `${remainingNeed} items`}`
                            : 'Fully sponsored!'
                          }
                        </Typography>
                      </Stack>

                      {reward?.sponsors?.length > 0 && (
                        <>
                          <Typography variant='subtitle1' gutterBottom>
                            Current Sponsors ({reward?.sponsors?.length})
                          </Typography>
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
                                </Paper>
                              </Grid>
                            ))}
                          </Grid>
                        </>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
          </Box>
        )}
        
        {/* Reward Dialog */}
        <RewardRequestDialog
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
            Save Game & Request Sponsorship
          </Button>
        </Stack>
      </Grid>
    </Grid>
  )
}

export default GameRequestSponsorshipForm
