'use client'

import React, { useState } from 'react'
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
  Button,
  Divider,
  Dialog,
  DialogContent,
  Grid
} from '@mui/material'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'

// List of games needing sponsorship
const gamesList = [
  'Traditional Indian Archery Championship',
  'Mallakhamb Competition',
  'Kabaddi Premier League',
  'Yoga Sports Festival',
  'Kho-Kho Nationals',
  'Gatka Martial Arts Expo'
]

// Reward types
const REWARD_TYPES = {
  CASH: 'cash',
  PHYSICAL_GIFT: 'physicalGift',
  OTHER: 'other'
}

const rewardTypeOptions = [
  { value: 'cash', label: 'Cash' },
  { value: 'physicalGift', label: 'Physical Gift' },
  // { value: 'other', label: 'Other' }
]

const SponsorGames = () => {
  const router = useRouter()
  const { data: session } = useSession()

  // State management
  const [selectedGame, setSelectedGame] = useState('')
  const [sponsorerType, setSponsorerType] = useState('individual')
  const [rewardType, setRewardType] = useState('cash')
  const [formData, setFormData] = useState({
    sponsorshipAmount: '',
    orgName: '',
    website: '',
    orgType: '',
    mobileNumber: '', // Changed from contactPerson to mobileNumber
    rewardValue: '',
    rewardDescription: '',
    otherDetails: ''
  })
  const [errors, setErrors] = useState({})

  const handleChange = e => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' })
    }
  }

  const validateMobileNumber = number => {
    const regex = /^[6-9]\d{9}$/ // Indian mobile number validation
    return regex.test(number)
  }

  const validateForm = () => {
    const newErrors = {}
    if (!selectedGame) newErrors.selectedGame = 'Please select a game'

    if (rewardType === REWARD_TYPES.CASH && !formData.sponsorshipAmount) {
      newErrors.sponsorshipAmount = 'Amount is required'
    } else if (
      rewardType === REWARD_TYPES.CASH &&
      (isNaN(formData.sponsorshipAmount) || formData.sponsorshipAmount <= 0)
    ) {
      newErrors.sponsorshipAmount = 'Please enter a valid amount'
    }

    if ([REWARD_TYPES.PHYSICAL_GIFT, REWARD_TYPES.OTHER].includes(rewardType)) {
      if (!formData.rewardValue) newErrors.rewardValue = 'Value is required'
      if (!formData.rewardDescription) newErrors.rewardDescription = 'Description is required'
      if (rewardType === 'other' && !formData.otherDetails) {
        newErrors.otherDetails = 'Details are required'
      }
    }

    if (sponsorerType === 'organization') {
      if (!formData.orgName) newErrors.orgName = 'Organization name is required'
      if (!formData.website) newErrors.website = 'Website is required'
      if (!formData.orgType) newErrors.orgType = 'Organization type is required'
      if (!formData.mobileNumber) {
        newErrors.mobileNumber = 'Mobile number is required'
      } else if (!validateMobileNumber(formData.mobileNumber)) {
        newErrors.mobileNumber = 'Please enter a valid 10-digit Indian mobile number'
      }
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (validateForm()) {
      const submissionData = {
        email: session?.user?.email,
        games: [selectedGame],
        sponsorType: 'game',
        sponsorerType,
        ...(sponsorerType === 'organization' && {
          orgName: formData.orgName,
          website: formData.website,
          orgType: formData.orgType,
          mobileNumber: formData.mobileNumber
        }),
        rewardType,
        ...(rewardType === REWARD_TYPES.CASH && { sponsorshipAmount: formData.sponsorshipAmount }),
        ...([REWARD_TYPES.PHYSICAL_GIFT, REWARD_TYPES.OTHER].includes(rewardType) && {
          rewardValue: formData.rewardValue,
          rewardDescription: formData.rewardDescription,
          ...(rewardType === REWARD_TYPES.OTHER && { otherRewardDetails: formData.otherDetails })
        })
      }
      console.log('Form submitted:', submissionData)
      try {
        const res = await RestApi.post(API_URLS.v0.SPONSORSHIP, submissionData)
        console.log(res)
        if (res.status === 'success') {
          router.push(`/sponsor/${res.result._id}/payment`)
          setSelectedGame('')
          setSponsorerType('individual')
          setFormData({
            sponsorshipAmount: '',
            orgName: '',
            website: '',
            orgType: '',
            mobileNumber: ''
          })
          toast.success(res.message)
        }
      } catch (error) {
        toast.error(error.message)
      }
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
            type='text' // Changed to text input
            name='sponsorshipAmount'
            value={formData.sponsorshipAmount}
            onChange={e => {
              // Only allow numbers and decimal point
              const value = e.target.value.replace(/[^0-9.]/g, '').replace(/^0+(\d)/, '$1') // Remove leading zeros;
              handleChange({ target: { name: e.target.name, value } })
            }}
            error={!!errors.sponsorshipAmount}
            helperText={errors.sponsorshipAmount}
            InputProps={{ inputProps: { min: 0 } }}
          />
        )
      case REWARD_TYPES.PHYSICAL_GIFT:
        return (
          <>
            <TextField
              fullWidth
              sx={{ mb: 3 }}
              label='Gift Value (INR)'
              type='number'
              name='rewardValue'
              value={formData.rewardValue}
              onChange={handleChange}
              error={!!errors.rewardValue}
              helperText={errors.rewardValue}
              InputProps={{ inputProps: { min: 0 } }}
            />
            <TextField
              fullWidth
              sx={{ mb: 3 }}
              label='Gift Description'
              name='rewardDescription'
              value={formData.rewardDescription}
              onChange={handleChange}
              error={!!errors.rewardDescription}
              helperText={errors.rewardDescription}
            />
          </>
        )
      case REWARD_TYPES.OTHER:
        return (
          <>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                sx={{ mb: 3 }}
                label='Reward Value (INR)'
                type='number'
                name='rewardValue'
                value={formData.rewardValue}
                onChange={handleChange}
                error={!!errors.rewardValue}
                helperText={errors.rewardValue}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                sx={{ mb: 3 }}
                label='Reward Description'
                name='rewardDescription'
                value={formData.rewardDescription}
                onChange={handleChange}
                error={!!errors.rewardDescription}
                helperText={errors.rewardDescription}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                sx={{ mb: 3 }}
                label='Other Details'
                name='otherDetails'
                value={formData.otherDetails}
                onChange={handleChange}
                error={!!errors.otherDetails}
                helperText={errors.otherDetails}
                multiline
                rows={3}
              />
            </Grid>
          </>
        )
      default:
        return null
    }
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant='h4' gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        Sponsor Traditional Indian Games
      </Typography>
      <Typography variant='body1' paragraph>
        {`By sponsoring these games, you're helping preserve and promote India's rich cultural heritage in sports. These
        traditional games represent centuries of wisdom, physical prowess, and community bonding that form the backbone
        of Indian knowledge systems. Your support will help:`}
      </Typography>
      <ul>
        <li>Preserve ancient sporting traditions for future generations</li>
        <li>Provide platforms for rural athletes to showcase their skills</li>
        <li>Revive indigenous sports knowledge systems</li>
        <li>Promote physical fitness through traditional methods</li>
      </ul>
      <Divider sx={{ my: 3 }} />

      <form>
        {/* Game Selection */}
        <FormControl fullWidth sx={{ mb: 3 }} error={!!errors.selectedGame}>
          <InputLabel id='game-select-label'>Select a Game to Sponsor</InputLabel>
          <Select
            labelId='game-select-label'
            value={selectedGame}
            label='Select a Game to Sponsor'
            onChange={e => {
              setSelectedGame(e.target.value)
              if (errors.selectedGame) setErrors({ ...errors, selectedGame: '' })
            }}
          >
            {gamesList.map(game => (
              <MenuItem key={game} value={game}>
                {game}
              </MenuItem>
            ))}
          </Select>
          {errors.selectedGame && (
            <Typography color='error' variant='caption'>
              {errors.selectedGame}
            </Typography>
          )}
        </FormControl>

        {/* Sponsor Type Selection */}
        <Typography variant='h6' gutterBottom sx={{ mt: 2 }}>
          Sponsorship Type
        </Typography>
        <RadioGroup value={sponsorerType} onChange={e => setSponsorerType(e.target.value)} sx={{ mb: 3 }}>
          <FormControlLabel value='individual' control={<Radio />} label='Sponsor as an Individual' />
          <FormControlLabel value='organization' control={<Radio />} label='Sponsor as an Organization' />
        </RadioGroup>

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
        >
          Submit Sponsorship
        </Button>
      </form>

      <Typography variant='body2' sx={{ mt: 4, fontStyle: 'italic' }}>
        Note: All sponsors will be acknowledged in event materials and will receive detailed impact reports about how
        their contribution helped promote traditional Indian sports.
      </Typography>

      {/* {openPayment && sponsorship && (
        <Dialog open={openPayment} onClose={handleClose}>
          <DialogContent>
            <Payment sponsorship={sponsorship} />
          </DialogContent>
        </Dialog>
      )} */}
    </Box>
  )
}

export default SponsorGames
