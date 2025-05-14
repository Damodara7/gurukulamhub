import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Divider,
  Button,
  Paper,
  Alert,
  Autocomplete,
  Typography,
  IconButton,
  Stack,
  Box,
  Tooltip,
  Avatar,
  Chip
} from '@mui/material'
import { Add as AddIcon, Close as CloseIcon, Edit as EditIcon, Info as InfoIcon } from '@mui/icons-material'
import SponsorDialog from './SponsorDialog'

const REWARD_TYPES = [
  { label: 'Cash', value: 'cash' },
  { label: 'Physical Gift', value: 'physicalGift' }
]
const CURRENCY_OPTIONS = ['INR', 'USD', 'EUR', 'GBP']

// Enhanced dummy sponsor data
const dummySponsors = [
  {
    id: '1',
    name: 'TechCorp Inc.',
    email: 'sponsor1@example.com',
    rewardType: 'cash',
    amount: 1000,
    currency: 'INR',
    availableAmount: 1000,
    logo: 'TC'
  },
  {
    id: '2',
    name: 'Finance Partners',
    email: 'sponsor2@example.com',
    rewardType: 'cash',
    amount: 1500,
    currency: 'USD',
    availableAmount: 1500,
    logo: 'FP'
  },
  {
    id: '3',
    name: 'Gadget World',
    email: 'sponsor3@example.com',
    rewardType: 'physicalGift',
    nonCashItem: 'iPhone 15',
    numberOfNonCashItems: 50,
    availableItems: 50,
    logo: 'GW'
  },
  {
    id: '4',
    name: 'Mobile Solutions',
    email: 'sponsor4@example.com',
    rewardType: 'physicalGift',
    nonCashItem: 'iPhone 15',
    numberOfNonCashItems: 30,
    availableItems: 30,
    logo: 'MS'
  },
  {
    id: '5',
    name: 'Travel Co.',
    email: 'sponsor5@example.com',
    rewardType: 'physicalGift',
    nonCashItem: 'Vacation Package',
    numberOfNonCashItems: 10,
    availableItems: 10,
    logo: 'TC'
  }
]

const RewardDialog = ({ open, onClose, reward, onSave, availablePositions, isEditing }) => {
  const [currentReward, setCurrentReward] = useState({
    id: '',
    position: '',
    numberOfWinnersForThisPosition: 1,
    rewardType: 'cash',
    rewardValuePerWinner: 0,
    currency: 'INR',
    nonCashReward: '',
    sponsors: []
  })
  const [openSponsorSelection, setOpenSponsorSelection] = useState(false)
  const [selectedSponsor, setSelectedSponsor] = useState(null)
  const [validationError, setValidationError] = useState('')
  const [availableSponsors, setAvailableSponsors] = useState([])
  const [allocationAmount, setAllocationAmount] = useState(0)

  // Calculate total required value based on reward type and number of winners
  const calculateTotalRequired = () => {
    if (currentReward.rewardType === 'cash') {
      return currentReward.rewardValuePerWinner * currentReward.numberOfWinnersForThisPosition
    }
    return currentReward.numberOfWinnersForThisPosition // For physical gifts
  }

  // Calculate total allocated from all sponsors
  const calculateTotalAllocated = () => {
    return currentReward.sponsors.reduce((sum, sponsor) => sum + (sponsor.allocated || 0), 0)
  }

  // Get physical gift options with aggregated availability
  const getPhysicalGiftOptions = () => {
    const physicalGiftSponsors = dummySponsors.filter(s => s.rewardType === 'physicalGift')
    const itemsMap = new Map()

    physicalGiftSponsors.forEach(sponsor => {
      const itemName = sponsor.nonCashItem
      const available = sponsor.availableItems
      if (itemsMap.has(itemName)) {
        itemsMap.set(itemName, itemsMap.get(itemName) + available)
      } else {
        itemsMap.set(itemName, available)
      }
    })

    return Array.from(itemsMap.entries()).map(([item, totalAvailable]) => ({
      label: item,
      value: item,
      totalAvailable
    }))
  }

  useEffect(() => {
    if (reward) {
      setCurrentReward(JSON.parse(JSON.stringify(reward)))
    } else {
      setCurrentReward({
        id: Date.now().toString(),
        position: availablePositions[0] || '',
        numberOfWinnersForThisPosition: 1,
        rewardType: 'cash',
        rewardValuePerWinner: 0,
        currency: 'INR',
        nonCashReward: '',
        sponsors: []
      })
    }
  }, [reward, open, availablePositions])

  useEffect(() => {
    // Filter available sponsors based on reward type and selected gift (for physical gifts)
    if (currentReward.rewardType === 'physicalGift') {
      const filtered = dummySponsors.filter(
        s =>
          s.rewardType === 'physicalGift' &&
          s.nonCashItem === currentReward.nonCashReward &&
          // Exclude sponsors already added
          !currentReward.sponsors.some(addedSponsor => addedSponsor.id === s.id)
      )
      setAvailableSponsors(filtered)
    } else {
      const filtered = dummySponsors.filter(
        s =>
          s.rewardType === currentReward.rewardType &&
          // Exclude sponsors already added
          !currentReward.sponsors.some(addedSponsor => addedSponsor.id === s.id)
      )
      setAvailableSponsors(filtered)
    }
  }, [currentReward.rewardType, currentReward.nonCashReward, currentReward.sponsors])

  const handleAddSponsor = () => {
    setSelectedSponsor(null)
    setAllocationAmount(0)
    setOpenSponsorSelection(true)
  }

  const handleSelectSponsor = (sponsor, allocation) => {
    if (!sponsor) return

    const updatedReward = { ...currentReward }
    const existingIndex = updatedReward.sponsors.findIndex(s => s.id === sponsor.id)

    if (existingIndex >= 0) {
      updatedReward.sponsors[existingIndex].allocated = parseFloat(allocation) || 0
    } else {
      updatedReward.sponsors.push({
        ...sponsor,
        allocated: parseFloat(allocation) || 0
      })
    }

    setCurrentReward(updatedReward)
    handleCloseSponsor()
  }

  const handleCloseSponsor = () => {
    setSelectedSponsor(null)
    setAllocationAmount(0)
    setOpenSponsorSelection(false)
  }

  const handleEditAllocation = (sponsorId, newValue) => {
    const updatedReward = { ...currentReward }
    const sponsorIndex = updatedReward.sponsors.findIndex(s => s.id === sponsorId)

    if (sponsorIndex >= 0) {
      updatedReward.sponsors[sponsorIndex].allocated = parseFloat(newValue) || 0
      setCurrentReward(updatedReward)
    }
  }

  const validateReward = () => {
    const totalNeeded = calculateTotalRequired()
    const totalAllocated = calculateTotalAllocated()

    // Check if any sponsor has allocated more than their available limit
    const hasOverAllocatedSponsors = currentReward.sponsors.some(sponsor => {
      const sponsorLimit = currentReward.rewardType === 'cash' ? sponsor.availableAmount : sponsor.availableItems
      return sponsor.allocated > sponsorLimit
    })

    if (hasOverAllocatedSponsors) {
      setValidationError('One or more sponsors have allocated more than their available limit')
      return false
    }

    // Cash rewards require exact amount matching
    if (currentReward.rewardType === 'cash') {
      if (Math.abs(totalAllocated - totalNeeded) > 0.01) {
        setValidationError(
          `Total allocated (${totalAllocated.toFixed(2)}) must exactly match required amount (${totalNeeded.toFixed(
            2
          )})`
        )
        return false
      }
    }
    // Physical gifts require one item per winner
    else if (currentReward.rewardType === 'physicalGift') {
      if (+totalAllocated !== +totalNeeded) {
        setValidationError(
          `Total items allocated (${totalAllocated}) must be equal to number of winners (${totalNeeded})`
        )
        return false
      }
    }

    setValidationError('')
    return true
  }

  const handleSave = () => {
    if (!validateReward()) return
    onSave(currentReward)
    onClose()
  }

  // Get remaining amount/items needed
  const getRemainingNeed = () => {
    const totalNeeded = calculateTotalRequired()
    const totalAllocated = calculateTotalAllocated()
    return Math.max(0, totalNeeded - totalAllocated)
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth='md'>
        <DialogTitle>
          {isEditing ? 'Edit Reward' : 'Create Reward'}
          <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {validationError && (
            <Alert severity='error' sx={{ mb: 2 }}>
              {validationError}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Reward Configuration Fields */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Position</InputLabel>
                <Select
                  label='Position'
                  value={currentReward.position}
                  onChange={e => setCurrentReward({ ...currentReward, position: e.target.value })}
                >
                  {availablePositions.map(pos => (
                    <MenuItem key={pos} value={pos}>
                      {pos}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Number of Winners'
                type='number'
                value={currentReward.numberOfWinnersForThisPosition}
                onChange={e =>
                  setCurrentReward({
                    ...currentReward,
                    numberOfWinnersForThisPosition: Math.max(1, e.target.value)
                  })
                }
                inputProps={{ min: 1 }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Reward Type</InputLabel>
                <Select
                  label='Reward Type'
                  value={currentReward.rewardType}
                  onChange={e => {
                    setCurrentReward({
                      ...currentReward,
                      rewardType: e.target.value,
                      sponsors: [] // Clear sponsors when type changes
                    })
                  }}
                >
                  {REWARD_TYPES.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {currentReward.rewardType === 'cash' ? (
              <>
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    label='Value Per Winner'
                    type='number'
                    value={currentReward.rewardValuePerWinner}
                    onChange={e =>
                      setCurrentReward({
                        ...currentReward,
                        rewardValuePerWinner: Math.max(0, e.target.value)
                      })
                    }
                    inputProps={{ step: '0.01', min: 0 }}
                  />
                </Grid>
                <Grid item xs={4}>
                  <FormControl fullWidth>
                    <InputLabel>Currency</InputLabel>
                    <Select
                      label='Currency'
                      value={currentReward.currency}
                      onChange={e => setCurrentReward({ ...currentReward, currency: e.target.value })}
                    >
                      {CURRENCY_OPTIONS.map(curr => (
                        <MenuItem key={curr} value={curr}>
                          {curr}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </>
            ) : (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Physical Gift</InputLabel>
                  <Select
                    label='Physical Gift'
                    value={currentReward.nonCashReward}
                    onChange={e => {
                      setCurrentReward({
                        ...currentReward,
                        nonCashReward: e.target.value,
                        sponsors: [] // Clear sponsors when gift changes
                      })
                    }}
                  >
                    {getPhysicalGiftOptions().map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label} (Available: {option.totalAvailable})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>

          <Grid item xs={12}>
            <Alert icon={false} color='info' sx={{p: 3, textAlign: 'center', mt: 2 }}>
              {currentReward.rewardType === 'cash'
                ? `Total required: ${currentReward.currency} ${calculateTotalRequired().toFixed(2)}`
                : `Total items needed: ${calculateTotalRequired()}`}
            </Alert>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Sponsors Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant='h6'>Sponsors</Typography>
            <Tooltip
              title={
                currentReward.rewardType === 'cash'
                  ? `Total required: ${currentReward.currency} ${calculateTotalRequired().toFixed(2)}`
                  : `Total items needed: ${calculateTotalRequired()}`
              }
            >
              <InfoIcon color='action' sx={{ ml: 1 }} />
            </Tooltip>
            <Chip
              sx={{ ml: 'auto' }}
              color='error'
              variant='outlined'
              label={
                <Typography variant='body2' color='error'>
                  Remaining:{' '}
                  {currentReward.rewardType === 'cash'
                    ? `${currentReward.currency} ${getRemainingNeed().toFixed(2)}`
                    : `${getRemainingNeed()} items`}
                </Typography>
              }
            />
          </Box>

          {currentReward.sponsors.length === 0 ? (
            <Alert icon={false} color='warning' sx={{ p: 3, textAlign: 'center', mb: 2 }}>
              <Typography color='text.secondary' textAlign='center'>
                No sponsors added yet. Add sponsors to fulfill the reward requirements.
              </Typography>
            </Alert>
          ) : (
            currentReward.sponsors.map(sponsor => (
              <Paper key={sponsor.id} sx={{ p: 2, mb: 2 }}>
                <Stack direction='row' alignItems='center' spacing={2}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>{sponsor.logo}</Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography>{sponsor.name || sponsor.email}</Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {currentReward.rewardType === 'cash'
                        ? `Available: ${sponsor.currency} ${sponsor.availableAmount}`
                        : `Available Items: ${sponsor.availableItems}`}
                    </Typography>
                  </Box>
                  <TextField
                    label={currentReward.rewardType === 'cash' ? 'Amount' : 'Items'}
                    type='number'
                    value={sponsor.allocated}
                    onChange={e => handleEditAllocation(sponsor.id, e.target.value)}
                    inputProps={{
                      max: currentReward.rewardType === 'cash' ? sponsor.availableAmount : sponsor.availableItems,
                      min: 0,
                      step: currentReward.rewardType === 'cash' ? 0.01 : 1
                    }}
                    sx={{ width: 120 }}
                  />
                  <IconButton
                    onClick={() =>
                      setCurrentReward({
                        ...currentReward,
                        sponsors: currentReward.sponsors.filter(s => s.id !== sponsor.id)
                      })
                    }
                  >
                    <CloseIcon />
                  </IconButton>
                </Stack>
              </Paper>
            ))
          )}

          <Button
            variant='outlined'
            startIcon={<AddIcon />}
            onClick={handleAddSponsor}
            fullWidth
            disabled={getRemainingNeed() <= 0}
          >
            Add Sponsor
          </Button>
        </DialogContent>

        <DialogActions className='mt-3'>
          <Button variant='outlined' onClick={onClose}>Cancel</Button>
          <Button component='label' style={{color: 'white'}} onClick={handleSave} variant='contained' disabled={getRemainingNeed() > 0}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sponsor Selection Dialog */}
      <SponsorDialog
        open={openSponsorSelection}
        onClose={handleCloseSponsor}
        currentReward={currentReward}
        availableSponsors={availableSponsors}
        onSave={handleSelectSponsor}
      />
    </>
  )
}

export default RewardDialog
