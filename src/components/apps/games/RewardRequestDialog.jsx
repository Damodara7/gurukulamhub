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
import SponsorRequestDialog from './SponsorRequestDialog'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { toast } from 'react-toastify'

const REWARD_TYPES = [
  { label: 'Cash', value: 'cash' },
  { label: 'Physical Gift', value: 'physicalGift' }
]
const CURRENCY_OPTIONS = ['INR', 'USD', 'EUR', 'GBP']

const RewardRequestDialog = ({
  open,
  onClose,
  reward,
  onSave,
  availablePositions,
  allPositions,
  isEditing,
  formData,
  setFormData
}) => {
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
  const [originalSponsorships, setOriginalSponsorships] = useState([])
  const [displaySponsorships, setDisplaySponsorships] = useState([])

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
    const physicalGiftSponsors = displaySponsorships.filter(s => s.rewardType === 'physicalGift')
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
    setCurrentReward(prev => ({
      ...prev,
      sponsors: reward && reward?.rewardType === currentReward?.rewardType ? currentReward?.sponsors : []
    }))
    
    async function getSponsorships() {
      try {
        let searchParams = ['status=completed']
        if (formData.quiz) {
          searchParams.push(`quizId=${formData.quiz}`)
          searchParams.push(`sponsorType=quiz`)
        }
        if (currentReward.rewardType) {
          searchParams.push(`rewardType=${currentReward.rewardType}`)
        }

        const url = `${API_URLS.v0.SPONSORSHIP}?${searchParams.join('&')}`

        const res = await RestApi.get(url)

        console.log({ getSponsorshipsRes: res })

        if (res.status === 'success') {
          setOriginalSponsorships(res.result)
          setDisplaySponsorships(res.result)
        } else {
          toast.error(res.message)
        }
      } catch (error) {
        console.log(error)
      }
    }

    getSponsorships()
  }, [
    currentReward.rewardType,
    formData?.quiz,
    formData?.rewards
  ])

  useEffect(() => {
    // Calculate total allocations for each sponsor across all rewards in the form
    const sponsorAllocations = new Map()
    
    if (formData?.rewards) {
      formData.rewards.forEach(reward => {
        if (reward.sponsors) {
          reward.sponsors.forEach(sponsor => {
            const sponsorId = sponsor.sponsorshipId
            const currentAllocation = sponsorAllocations.get(sponsorId) || 0
            sponsorAllocations.set(sponsorId, currentAllocation + (sponsor.allocated || 0))
          })
        }
      })
    }

    // Filter available sponsors based on reward type and selected gift (for physical gifts)
    if (currentReward.rewardType === 'physicalGift') {
      const filtered = displaySponsorships.filter(
        s => {
          const totalAllocated = sponsorAllocations.get(s._id) || 0
          const availableAfterAllocation = s.availableItems - totalAllocated
          
          return s.rewardType === 'physicalGift' &&
            s.nonCashItem === currentReward.nonCashReward &&
            availableAfterAllocation > 0 &&
            // Exclude sponsors already added to this specific reward
            !currentReward.sponsors.some(addedSponsor => addedSponsor?.sponsorshipId === (s?._id || s?.id))
        }
      )
      setAvailableSponsors(filtered)
    } else {
      const filtered = displaySponsorships.filter(
        s => {
          const totalAllocated = sponsorAllocations.get(s._id) || 0
          const availableAfterAllocation = s.availableAmount - totalAllocated
          
          return s.rewardType === currentReward.rewardType &&
            availableAfterAllocation > 0 &&
            // Exclude sponsors already added to this specific reward
            !currentReward.sponsors.some(addedSponsor => addedSponsor?.sponsorshipId === (s?._id || s?.id))
        }
      )
      setAvailableSponsors(filtered)
    }
  }, [
    openSponsorSelection,
    currentReward.rewardType,
    currentReward.nonCashReward,
    currentReward.sponsors,
    displaySponsorships,
    formData?.rewards
  ])

  useEffect(() => {
    if (reward) {
      setCurrentReward({
        ...reward,
        numberOfWinnersForThisPosition: 1 // Force to 1 winner per position
      })
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

  const handleAddSponsor = () => {
    setSelectedSponsor(null)
    setAllocationAmount(0)
    setOpenSponsorSelection(true)
  }

  const handleSelectSponsor = ({ _id, ...sponsor }, allocation) => {
    if (!sponsor) return

    console.log('Selected Sponsor: ', sponsor)

    const updatedReward = { ...currentReward }
    const existingIndex = updatedReward.sponsors.findIndex(s => s?.sponsorshipId === _id)

    // Calculate real-time available amount for this sponsor
    const realTimeAvailable = getRealTimeAvailableAmount(sponsor)

    const sponsorPayload = {
      ...sponsor,
      id: Date.now().toString(),
      sponsorshipId: _id,
      email: sponsor.email,
      allocated: parseFloat(allocation),
      ...(sponsor.rewardType === 'cash'
        ? {
            availableAmount: realTimeAvailable - parseFloat(allocation),
            prevAvailableAmount: sponsor.availableAmount
          }
        : {
            availableItems: realTimeAvailable - parseFloat(allocation),
            prevAvailableItems: sponsor.availableItems
          }),
      rewardDetails: {
        rewardType: sponsor.rewardType,
        currency: sponsor.currency,
        ...(sponsor.rewardType === 'cash' && {
          rewardValue: parseFloat(allocation) || 0
        }),
        ...(sponsor.rewardType === 'physicalGift' && {
          nonCashReward: sponsor.nonCashItem,
          numberOfNonCashRewards: parseFloat(allocation) || 0,
          rewardValuePerItem: sponsor.rewardValuePerItem,
          rewardValue: parseFloat(allocation) * sponsor.rewardValuePerItem
        })
      }
    }

    if (existingIndex >= 0) {
      updatedReward.sponsors[existingIndex] = {
        ...updatedReward.sponsors[existingIndex],
        ...sponsorPayload
      }
    } else {
      updatedReward.sponsors.push(sponsorPayload)
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
    const sponsorIndex = updatedReward.sponsors.findIndex(s => (s?._id || s?.id) === sponsorId)

    if (sponsorIndex >= 0) {
      const sponsor = updatedReward.sponsors[sponsorIndex]
      const newAllocation = parseFloat(newValue) || 0
      const oldAllocation = sponsor.allocated || 0
      
      // Validate against real-time available amount
      const realTimeAvailable = getRealTimeAvailableAmount(sponsor)
      if (newAllocation > realTimeAvailable) {
        return // Don't allow over-allocation
      }
      
      // Update the sponsor's allocated amount
      updatedReward.sponsors[sponsorIndex] = {
        ...sponsor,
        allocated: newAllocation
      }
      
      setCurrentReward(updatedReward)
    }
  }

  const validateReward = () => {
    // numberOfWinnersForThisPosition is always 1, so no need to validate it
    if (currentReward.rewardType === 'cash' && (!currentReward.rewardValuePerWinner || Number(currentReward.rewardValuePerWinner) === 0)) {
      setValidationError('Value per winner must be greater than 0 for cash rewards')
      return false
    }
    if (currentReward.rewardType === 'physicalGift' && !currentReward.nonCashReward) {
      setValidationError('Physical gift description is required')
      return false
    }

    setValidationError('')
    return true
  }

  const handleRemoveSponsor = sponsorId => {
    setCurrentReward({
      ...currentReward,
      sponsors: currentReward.sponsors.filter(s => (s?._id || s?.id) !== sponsorId)
    })
  }

  const handleSave = () => {
    if (!validateReward()) return
    
    // Remove sponsors with allocated=0
    let rewardToSave = {
      ...currentReward,
      sponsors: currentReward.sponsors.filter(s => s.allocated > 0)
    }
    
    console.log('rewardToSave: ', rewardToSave)
    onSave(rewardToSave, displaySponsorships)
    onClose()
  }

  // Get remaining amount/items needed
  const getRemainingNeed = () => {
    const totalNeeded = calculateTotalRequired()
    const totalAllocated = calculateTotalAllocated()
    return Math.max(0, totalNeeded - totalAllocated)
  }

  // Calculate real-time available amount for a sponsor across all rewards
  const getRealTimeAvailableAmount = (sponsor) => {
    if (!formData?.rewards) return sponsor.prevAvailableAmount || sponsor.availableAmount

    let totalAllocated = 0
    
    // Get the sponsor ID to match against (could be _id or sponsorshipId)
    const sponsorId = sponsor._id || sponsor.sponsorshipId
    
    // Calculate total allocation for this sponsor across all rewards
    formData.rewards.forEach(reward => {
      if (reward.sponsors) {
        reward.sponsors.forEach(s => {
          if (s.sponsorshipId === sponsorId) {
            totalAllocated += s.allocated || 0
          }
        })
      }
    })

    if (sponsor.rewardType === 'cash') {
      return (sponsor.prevAvailableAmount || sponsor.availableAmount) - totalAllocated
    } else {
      return (sponsor.prevAvailableItems || sponsor.availableItems) - totalAllocated
    }
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
                  {(!isEditing ? [...allPositions] : [currentReward.position])?.map(pos => (
                    <MenuItem disabled={!isEditing && !availablePositions.includes(pos)} key={pos} value={pos}>
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
                value={1}
                InputProps={{
                  readOnly: true
                }}
                helperText='Fixed at 1 winner per position'
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
                    value={currentReward.rewardValuePerWinner}
                    onChange={e =>{
                      if(e.target.value.trim() === ''){
                        setCurrentReward({
                          ...currentReward,
                          rewardValuePerWinner: 0
                        })
                        return
                      }
                      if(isNaN(e.target.value)){
                        return
                      }
                      setCurrentReward({
                        ...currentReward,
                        rewardValuePerWinner: Math.max(0, e.target.value)
                      })
                    }}
                    inputProps={{ step: '1', min: 0 }}
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
                  <Autocomplete
                    options={getPhysicalGiftOptions()}
                    getOptionLabel={option => `${option.label} (Available: ${option.totalAvailable})`}
                    value={
                      getPhysicalGiftOptions().find(option => option.value === currentReward.nonCashReward) || null
                    }
                    onChange={(e, newValue) => {
                      setCurrentReward({
                        ...currentReward,
                        nonCashReward: newValue?.value || '',
                        sponsors: [] // Clear sponsors when gift changes
                      })
                    }}
                    renderInput={params => <TextField {...params} label='Physical Gift' />}
                    getOptionDisabled={option => option.totalAvailable === 0}
                    renderOption={(props, option) => {
                      const { key, ...otherProps } = props
                      return (
                        <li key={option.value} {...otherProps} value={option.value}>
                          <Typography>
                            {option.label} (Available: {option.totalAvailable})
                          </Typography>
                        </li>
                      )
                    }}
                  />
                </FormControl>
              </Grid>
            )}
          </Grid>

          <Grid item xs={12}>
            <Alert icon={false} color='info' sx={{ p: 3, textAlign: 'center', mt: 2 }}>
              {currentReward.rewardType === 'cash'
                ? `Total required: ${currentReward.currency} ${calculateTotalRequired().toFixed(2)}`
                : `Total items needed: ${calculateTotalRequired()}`}
            </Alert>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Sponsors Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant='h6'>Current Sponsors</Typography>
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
              color={getRemainingNeed() > 0 ? 'warning' : 'success'}
              variant='outlined'
              label={
                <Typography variant='body2' color={getRemainingNeed() > 0 ? 'warning.main' : 'success.main'}>
                  {getRemainingNeed() > 0 
                    ? `Still needs: ${currentReward.rewardType === 'cash' ? `${currentReward.currency} ${getRemainingNeed().toFixed(2)}` : `${getRemainingNeed()} items`}`
                    : 'Fully sponsored!'
                  }
                </Typography>
              }
            />
          </Box>

          {currentReward.sponsors.length === 0 ? (
            <Alert icon={false} color='info' sx={{ p: 3, textAlign: 'center', mb: 2 }}>
              <Typography color='text.secondary' textAlign='center'>
                No sponsors added yet. You can add existing sponsors or leave this empty to request new sponsorships.
              </Typography>
            </Alert>
          ) : (
            currentReward?.sponsors?.map(sponsor => (
              <Paper key={sponsor?._id || sponsor?.id} sx={{ p: 2, mb: 2 }}>
                <Stack direction='row' alignItems='center' spacing={2}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>{sponsor.logo}</Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography>{`${sponsor.fullname} (${sponsor.email})`}</Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {currentReward.rewardType === 'cash'
                        ? `Available: ${sponsor.currency} ${getRealTimeAvailableAmount(sponsor)} (Original: ${sponsor.currency} ${sponsor.prevAvailableAmount})`
                        : `Available Items: ${getRealTimeAvailableAmount(sponsor)} (Original: ${sponsor.prevAvailableItems})`}
                    </Typography>
                  </Box>
                  <TextField
                    label={currentReward.rewardType === 'cash' ? 'Amount' : 'Items'}
                    value={sponsor.allocated}
                    onChange={e =>{
                      if(e.target.value.trim() === ''){
                        handleEditAllocation(sponsor?._id || sponsor?.id, 0)
                        return
                      }
                      if(isNaN(e.target.value)){
                        return
                      }
                      const realTimeAvailable = getRealTimeAvailableAmount(sponsor)
                      if(e.target.value > realTimeAvailable){
                        return
                      }
                      handleEditAllocation(sponsor?._id || sponsor?.id, e.target.value)
                    }}
                    sx={{ width: 120 }}
                  />
                  <IconButton onClick={() => handleRemoveSponsor(sponsor?._id || sponsor?.id)}>
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
            disabled={availableSponsors.length === 0}
          >
            Add Existing Sponsor
          </Button>
        </DialogContent>

        <DialogActions className='mt-3'>
          <Button variant='outlined' onClick={onClose}>
            Cancel
          </Button>
          <Button
            component='label'
            style={{ color: 'white' }}
            onClick={handleSave}
            variant='contained'
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sponsor Selection Dialog */}
      <SponsorRequestDialog
        open={openSponsorSelection}
        key={openSponsorSelection}
        onClose={handleCloseSponsor}
        currentReward={currentReward}
        availableSponsors={availableSponsors}
        onSave={handleSelectSponsor}
        formData={formData}
      />
    </>
  )
}

export default RewardRequestDialog
