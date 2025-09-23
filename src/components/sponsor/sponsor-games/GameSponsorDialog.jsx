import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert,
  Box,
  Divider,
  CircularProgress
} from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'

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

const GameSponsorDialog = ({ 
  open, 
  onClose, 
  game, 
  reward, 
  maxAmount 
}) => {
  const router = useRouter()
  const { data: session } = useSession()
  
  // Calculate sponsorship details
  const totalNeeded = reward.rewardType === 'cash' 
    ? reward.rewardValuePerWinner * reward.numberOfWinnersForThisPosition
    : reward.numberOfWinnersForThisPosition
  
  const alreadySponsored = reward.sponsors?.reduce((sum, sponsor) => 
    sum + (sponsor.allocated || sponsor.rewardDetails?.allocated || 0), 0
  ) || 0
  
  const requiredAmount = totalNeeded - alreadySponsored
  
  const [sponsorerType, setSponsorerType] = useState('individual')
  const [rewardType, setRewardType] = useState(reward.rewardType)
  const [formData, setFormData] = useState({ 
    ...initialFormData, 
    email: session?.user?.email || '',
    sponsorshipAmount: '',
    numberOfNonCashItems: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      const initialData = { 
        ...initialFormData, 
        email: session?.user?.email || '',
        sponsorshipAmount: '',
        numberOfNonCashItems: ''
      }
      
      setFormData(initialData)
      setErrors({})
      setSponsorerType('individual')
      setRewardType(reward.rewardType)
    }
  }, [open, session?.user?.email, reward.rewardType])

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
      (isNaN(formData.sponsorshipAmount) || parseFloat(formData.sponsorshipAmount) <= 0)
    ) {
      newErrors.sponsorshipAmount = 'Amount must be greater than 0'
    } else if (
      rewardType === REWARD_TYPES.CASH &&
      parseFloat(formData.sponsorshipAmount) > requiredAmount
    ) {
      newErrors.sponsorshipAmount = `Amount cannot exceed remaining need of ${requiredAmount}`
    }

    if (rewardType === REWARD_TYPES.PHYSICAL_GIFT) {
      if (!formData.nonCashItem) newErrors.nonCashItem = 'Item description is required'
      if (!formData.numberOfNonCashItems) {
        newErrors.numberOfNonCashItems = 'Quantity is required'
      } else if (isNaN(formData.numberOfNonCashItems) || parseInt(formData.numberOfNonCashItems) <= 0) {
        newErrors.numberOfNonCashItems = 'Quantity must be greater than 0'
      } else if (parseInt(formData.numberOfNonCashItems) > requiredAmount) {
        newErrors.numberOfNonCashItems = `Quantity cannot exceed remaining need of ${requiredAmount}`
      }
      if (!formData.rewardValuePerItem) newErrors.rewardValuePerItem = 'Estimated value is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setLoading(true)
    try {
      const payload = {
        accountHolderEmail: session?.user?.email,
        email: formData?.email || session?.user?.email,
        fullname: formData?.fullname,
        sponsorType: 'game',
        sponsorerType,
        mobileNumber: formData.mobileNumber,
        rewardType,
        currency: 'INR',
        gameId: game._id,
        rewardId: reward._id || reward.position,
        ...(sponsorerType === 'organization' && {
          orgName: formData?.orgName,
          website: formData?.website,
          orgType: formData?.orgType
        }),
        ...(rewardType === REWARD_TYPES.CASH && {
          sponsorshipAmount: Number(formData.sponsorshipAmount),
          availableAmount: Number(formData.sponsorshipAmount),
          sponsorshipStatus: 'created',
          sponsorshipExpiresAt: new Date(Date.now() + 2 * 60 * 1000) // 2 minutes
        }),
        ...(rewardType === REWARD_TYPES.PHYSICAL_GIFT && {
          nonCashItem: formData.nonCashItem,
          numberOfNonCashItems: Number(formData.numberOfNonCashItems),
          availableItems: Number(formData.numberOfNonCashItems),
          rewardValuePerItem: Number(formData.rewardValuePerItem),
          rewardValue: Number(formData.rewardValuePerItem) * Number(formData?.numberOfNonCashItems),
          rewardDescription: formData.rewardDescription,
          nonCashSponsorshipStatus: 'completed'
        })
      }

      console.log('Game sponsorship payload:', payload)

      const res = await RestApi.post(API_URLS.v0.GAME_SPONSORSHIP, payload)
      if (res.status === 'success') {
        // Only redirect to payment for cash rewards
        if (rewardType === REWARD_TYPES.CASH) {
          router.push(`/sponsor/game/${res.result._id}/payment`)
        } else {
          // Handle successful physical gift submission
          toast.success('Game sponsorship is successful!')
          onClose()
          // Refresh the page or update the game data
          window.location.reload()
        }
      }
    } catch (error) {
      console.error('Game sponsorship submission error:', error)
      toast.error('Failed to submit game sponsorship. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Sponsor Game Reward</Typography>
          <Button onClick={onClose} size="small">
            <CloseIcon />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Game & Reward Info */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Game: {game.title}
          </Typography>
          <Typography variant="body2" gutterBottom>
            Reward: Position {reward.position} - {reward.rewardType === 'cash' 
              ? `${reward.currency} ${reward.rewardValuePerWinner} per winner`
              : reward.nonCashReward
            }
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              Sponsorship Summary:
            </Typography>
            <Typography variant="body2">
              • Total needed: {reward.rewardType === 'cash' 
                ? `${reward.currency} ${totalNeeded}` 
                : `${totalNeeded} items`
              }
            </Typography>
            <Typography variant="body2">
              • Already sponsored: {reward.rewardType === 'cash' 
                ? `${reward.currency} ${alreadySponsored}` 
                : `${alreadySponsored} items`
              }
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              • You can sponsor any amount up to: {reward.rewardType === 'cash' 
                ? `${reward.currency} ${requiredAmount}` 
                : `${requiredAmount} items`
              }
            </Typography>
          </Box>
        </Alert>

        <Grid container spacing={3}>
          {/* Sponsor Type */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Sponsor Type</InputLabel>
              <Select
                value={sponsorerType}
                onChange={(e) => setSponsorerType(e.target.value)}
                label="Sponsor Type"
              >
                <MenuItem value="individual">Individual</MenuItem>
                <MenuItem value="organization">Organization</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Basic Info */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Full Name"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              error={!!errors.fullname}
              helperText={errors.fullname}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Mobile Number"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              error={!!errors.mobileNumber}
              helperText={errors.mobileNumber}
              required
            />
          </Grid>

          {/* Organization Fields */}
          {sponsorerType === 'organization' && (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Organization Name"
                  name="orgName"
                  value={formData.orgName}
                  onChange={handleChange}
                  error={!!errors.orgName}
                  helperText={errors.orgName}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  error={!!errors.website}
                  helperText={errors.website}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!!errors.orgType}>
                  <InputLabel>Organization Type</InputLabel>
                  <Select
                    name="orgType"
                    value={formData.orgType}
                    onChange={handleChange}
                    label="Organization Type"
                  >
                    <MenuItem value="corporate">Corporate</MenuItem>
                    <MenuItem value="ngo">NGO</MenuItem>
                    <MenuItem value="educational">Educational Institution</MenuItem>
                    <MenuItem value="government">Government</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </>
          )}

          <Divider sx={{ width: '100%', my: 2 }} />

          {/* Reward Type Display */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Reward Type"
              value={rewardTypeOptions.find(option => option.value === rewardType)?.label || rewardType}
              disabled
              helperText="This reward type is fixed and cannot be changed"
            />
          </Grid>

          {/* Cash Reward Fields */}
          {rewardType === REWARD_TYPES.CASH && (
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Sponsorship Amount (INR)"
                name="sponsorshipAmount"
                type="number"
                value={formData.sponsorshipAmount}
                onChange={handleChange}
                error={!!errors.sponsorshipAmount}
                helperText={errors.sponsorshipAmount || `Maximum: ${requiredAmount} (remaining need)`}
                inputProps={{ min: 1, max: requiredAmount }}
                required
              />
            </Grid>
          )}

          {/* Physical Gift Fields */}
          {rewardType === REWARD_TYPES.PHYSICAL_GIFT && (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Item Description"
                  name="nonCashItem"
                  value={formData.nonCashItem}
                  onChange={handleChange}
                  error={!!errors.nonCashItem}
                  helperText={errors.nonCashItem}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Quantity"
                  name="numberOfNonCashItems"
                  type="number"
                  value={formData.numberOfNonCashItems}
                  onChange={handleChange}
                  error={!!errors.numberOfNonCashItems}
                  helperText={errors.numberOfNonCashItems || `Maximum: ${requiredAmount} (remaining need)`}
                  inputProps={{ min: 1, max: requiredAmount }}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Estimated Value per Item (INR)"
                  name="rewardValuePerItem"
                  type="number"
                  value={formData.rewardValuePerItem}
                  onChange={handleChange}
                  error={!!errors.rewardValuePerItem}
                  helperText={errors.rewardValuePerItem}
                  inputProps={{ min: 1 }}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Reward Description"
                  name="rewardDescription"
                  value={formData.rewardDescription}
                  onChange={handleChange}
                  multiline
                  rows={3}
                />
              </Grid>
            </>
          )}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, mt: 2 }}>
        <Button onClick={onClose} disabled={loading} variant='outlined'>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          component='label'
          sx={{ color: 'white' }}
        >
          {loading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Processing...
            </>
          ) : (
            'Submit Sponsorship'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default GameSponsorDialog
