import React, { useState, useEffect } from 'react'
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
  Close as CloseIcon,
  Edit as EditIcon,
  DateRange as DateRangeIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material'

import RewardDialog from '../RewardDialog'

// Reward position options
const POSITION_OPTIONS = [1, 2, 3, 4, 5]

// Initial form data
const initialFormData = {
  title: '',
  pin: Math.floor(100000 + Math.random() * 900000).toString(),
  description: '',
  quiz: '',
  startTime: new Date(),
  duration: 600, // 10 minutes in seconds
  promotionalVideoUrl: '',
  thumbnailPoster: '',
  requireRegistration: false,
  registrationEndTime: new Date(),
  maxPlayers: 100,
  tags: [],
  location: {
    country: '',
    region: '',
    city: ''
  },
  rewards: []
}

// Main Game Form component
const GameForm = ({ onSubmit, quizzes, onCancel }) => {
  const [formData, setFormData] = useState(initialFormData)
  const [availablePositions, setAvailablePositions] = useState(POSITION_OPTIONS)

  // Reward Dialog states
  const [openRewardDialog, setOpenRewardDialog] = useState(false)
  const [editingReward, setEditingReward] = useState(null)

  // Update available positions when rewards change
  useEffect(() => {
    const usedPositions = formData.rewards.map(r => r.position)
    setAvailablePositions(POSITION_OPTIONS.filter(pos => !usedPositions.includes(pos)))
  }, [formData.rewards])

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
    await onSubmit(formData)
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

      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Quiz</InputLabel>
          <Select name='quiz' value={formData.quiz} label='Quiz' onChange={handleChange} required>
            {quizzes.map(quiz => (
              <MenuItem key={quiz._id} value={quiz._id}>
                {quiz.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Date & Time */}
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label='Start Time'
          type='datetime-local'
          value={formData.startTime.toISOString().slice(0, 16)}
          onChange={e => handleDateChange('startTime', new Date(e.target.value))}
          InputLabelProps={{
            shrink: true
          }}
          required
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
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Checkbox checked={formData.requireRegistration} onChange={handleChange} name='requireRegistration' />
          }
          label='Require Registration'
        />
      </Grid>

      {formData.requireRegistration && (
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label='Registration End Time'
            type='datetime-local'
            value={formData.registrationEndTime.toISOString().slice(0, 16)}
            onChange={e => handleDateChange('registrationEndTime', new Date(e.target.value))}
            InputLabelProps={{
              shrink: true
            }}
            required
          />
        </Grid>
      )}

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label='Max Players'
          name='maxPlayers'
          type='number'
          value={formData.maxPlayers}
          onChange={handleChange}
          inputProps={{ min: 1 }}
        />
      </Grid>

      {/* Location */}
      <Grid item xs={12}>
        <Typography variant='subtitle1' gutterBottom>
          Location (Optional)
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label='Country'
              name='location.country'
              value={formData.location.country}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label='Region/State'
              name='location.region'
              value={formData.location.region}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label='City'
              name='location.city'
              value={formData.location.city}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
      </Grid>

      {/* Media */}
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label='Promotional Video URL'
          name='promotionalVideoUrl'
          value={formData.promotionalVideoUrl}
          onChange={handleChange}
          type='url'
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label='Thumbnail Poster URL'
          name='thumbnailPoster'
          value={formData.thumbnailPoster}
          onChange={handleChange}
          type='url'
        />
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
            // component='label'
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
