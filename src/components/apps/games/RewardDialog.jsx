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
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { toast } from 'react-toastify'

const REWARD_TYPES = [
  { label: 'Cash', value: 'cash' },
  { label: 'Physical Gift', value: 'physicalGift' }
]
const CURRENCY_OPTIONS = ['INR', 'USD', 'EUR', 'GBP']

const RewardDialog = ({
  open,
  onClose,
  reward,
  onSave,
  availablePositions,
  allPositions,
  isEditing,
  formData,
  setFormData,
  gameData = null
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

  console.log('All rewards: ', formData.rewards)

  // Calculate total required value based on reward type and number of winners
  const calculateTotalRequired = () => {
    if (currentReward.rewardType === 'cash') {
      return currentReward.rewardValuePerWinner * currentReward.numberOfWinnersForThisPosition
    }
    return currentReward.numberOfWinnersForThisPosition // For physical gifts
  }

  // Calculate total allocated from all sponsors
  const calculateTotalAllocated = () => {
    return currentReward?.sponsors?.reduce((sum, sponsor) => {
      const allocated = parseFloat(sponsor.allocated) || 0
      return sum + allocated
    }, 0)
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
        if (formData?.location?.country) {
          searchParams.push(`country=${formData?.location?.country}`)
        }
        if (formData?.location?.region) {
          searchParams.push(`region=${formData?.location?.region}`)
        }
        if (formData?.location?.city) {
          searchParams.push(`city=${formData?.location?.city}`)
        }

        const url = `${API_URLS.v0.SPONSORSHIP}?${searchParams.join('&')}`

        const res = await RestApi.get(url)

        console.log({ getSponsorshipsRes: res })

        if (res.status === 'success') {
          toast.success(res.message)

          setOriginalSponsorships(res.result)

          // Calculate initial display values (deducting any existing allocations)
          const updatedDisplay = res.result.map(sponsorship => {
            const allocated = calculateExistingAllocations(sponsorship._id, res.result)

            return {
              ...sponsorship,
              ...(sponsorship.rewardType === 'cash'
                ? {
                    availableAmount: sponsorship.availableAmount - (allocated.cash || 0)
                  }
                : {
                    availableItems: sponsorship.availableItems - (allocated.items || 0)
                  })
            }
          })
          console.log('updatedDisplay : ', updatedDisplay)

          // 2. Update displaySponsorships with availableItems = actual available + allocated of current
          if (reward) {
            const updatedDisplaySponsorshipsAvailability =
              updatedDisplay?.map(sponsorship => {
                const foundRewardSponsor = reward?.sponsors?.find(sp => sp?.sponsorshipId === sponsorship?._id)
                console.log('foundRewardSponsor 1...: ', foundRewardSponsor)

                if (!foundRewardSponsor) return sponsorship
                console.log('foundRewardSponsor 2...: ', foundRewardSponsor)

                return {
                  ...sponsorship,
                  ...(sponsorship?.rewardType === 'cash'
                    ? {
                        availableAmount: foundRewardSponsor?.availableAmount + foundRewardSponsor?.allocated
                        // prevAvailableAmount: sponsorship?.availableAmount + sponsorship?.allocated
                      } // while editing the available = (actual available + already allocated for that reward)
                    : {
                        availableItems: foundRewardSponsor?.availableItems + foundRewardSponsor?.allocated
                        // prevAvailableItems: sponsorship?.availableItems + sp?.allocated
                      })
                }
              }) || []

            console.log({ updatedDisplaySponsorshipsAvailability })
            setDisplaySponsorships(updatedDisplaySponsorshipsAvailability)
          } else {
            setDisplaySponsorships(updatedDisplay)
          }
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
    formData?.location?.country,
    formData?.location?.region,
    formData?.location?.city,
    formData?.rewards
  ])

  useEffect(() => {
    // Filter available sponsors based on reward type and selected gift (for physical gifts)
    if (currentReward.rewardType === 'physicalGift') {
      const filtered = displaySponsorships.filter(
        s =>
          s.rewardType === 'physicalGift' &&
          s.nonCashItem === currentReward.nonCashReward &&
          // Exclude sponsors already added
          !currentReward.sponsors.some(addedSponsor => addedSponsor?.sponsorshipId === (s?._id || s?.id))
      )
      console.log('filtered PHYSICALGIFT: ', filtered)
      setAvailableSponsors(filtered)
    } else {
      const filtered = displaySponsorships.filter(
        s =>
          s.rewardType === currentReward.rewardType &&
          // Exclude sponsors already added
          !currentReward.sponsors.some(addedSponsor => addedSponsor?.sponsorshipId === (s?._id || s?.id))
      )
      console.log('filtered CASH: ', filtered)
      setAvailableSponsors(filtered)
    }
  }, [
    openSponsorSelection,
    currentReward.rewardType,
    currentReward.nonCashReward,
    currentReward.sponsors,
    displaySponsorships
  ])

  useEffect(() => {
    if (reward) {
      // 1. Update reward sponsors with availableItems = actual available + allocated of current
      const updatedSponsors =
        reward?.sponsors?.map(sp => {
          return {
            ...sp,
            ...(sp?.rewardType === 'cash'
              ? {
                  // availableAmount: sp?.availableAmount + sp?.allocated,
                  prevAvailableAmount: sp?.availableAmount + sp?.allocated
                } // while editing the available = (actual available + already allocated for that reward)
              : {
                  // availableItems: sp?.availableItems + sp?.allocated,
                  prevAvailableItems: sp?.availableItems + sp?.allocated
                })
          }
        }) || []

      const rewardWithUpdatedSponsors = {
        ...reward,
        numberOfWinnersForThisPosition: 1, // Force to 1 winner per position
        sponsors: updatedSponsors
      }

      console.log({ rewardWithUpdatedSponsors })
      setCurrentReward(rewardWithUpdatedSponsors)
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

  // Helper function to calculate existing allocations
  const calculateExistingAllocations = (sponsorshipId, sponsorships) => {
    const result = { cash: 0, items: 0 }
    const originalRewardSponsorships =
      sponsorships?.find(s => s?._id === sponsorshipId)?.sponsored?.find(s => s?.game === gameData?._id)
        ?.rewardSponsorships || []

    console.log('formData.rewards: ', formData.rewards)

    // Handle removed rewards first
    const currentRewardIds = formData.rewards?.map(r => r?._id || r?.id) || []
    console.log('currentRewardIds: ', currentRewardIds)

    // Find rewards that were removed
    const removedRewardIds =
      originalRewardSponsorships?.map(rs => rs?.rewardId)?.filter(id => !currentRewardIds.includes(id)) || []
    console.log('removedRewardIds: ', removedRewardIds)

    // Add back allocations from removed rewards
    const removedRewardSponsorships =
      originalRewardSponsorships?.filter(x => removedRewardIds.includes(x?.rewardId)) || []

    console.log('removedRewardSponsorships: ', removedRewardSponsorships)

    removedRewardSponsorships.forEach(removedRewardSponsorship => {
      // Find the reward type from the original sponsorship data
      const rewardType = sponsorships?.find(s => s?._id === sponsorshipId)?.rewardType

      if (rewardType === 'cash') {
        result.cash -= parseFloat(removedRewardSponsorship?.allocated) || 0
      } else {
        result.items -= parseFloat(removedRewardSponsorship?.allocated) || 0
      }
    })
    console.log('result after removedRewardSponsorships: ', result)

    // Handle existing rewards
    formData.rewards?.forEach(reward => {
      const originalRewardSponsorshipsOfThisReward =
        originalRewardSponsorships?.filter(x => x?.rewardId === reward?._id) || []
      console.log('originalRewardSponsorshipsOfThisReward: ', originalRewardSponsorshipsOfThisReward)

      const originalRewardSponsorshipIds = originalRewardSponsorshipsOfThisReward?.map(x => x.rewardSponsorshipId) || []
      const rewardSponsorshipIds = reward.sponsors?.map(x => x.sponsorshipId) || []

      const removedRewardSponsorshipIds =
        originalRewardSponsorshipIds.filter(x => !rewardSponsorshipIds.includes(x)) || []
      const removedRewardSponsorships =
        originalRewardSponsorshipsOfThisReward?.filter(x =>
          removedRewardSponsorshipIds.includes(x.rewardSponsorshipId)
        ) || []
      console.log('removedRewardSponsorships: ', removedRewardSponsorships)
      removedRewardSponsorships?.forEach(removedRewardSponsorship => {
        if (removedRewardSponsorship.sponsorshipId === sponsorshipId) {
          if (reward.rewardType === 'cash') {
            result.cash -= parseFloat(removedRewardSponsorship?.allocated) || 0
          } else {
            result.items -= parseFloat(removedRewardSponsorship?.allocated) || 0
          }
        }
      })
      reward.sponsors?.forEach(sponsor => {
        if (sponsor.sponsorshipId === sponsorshipId) {
          const sponsoredForGame = sponsor?.sponsored?.find(s => s?.game === gameData?._id)
          if (sponsoredForGame) {
            console.log('sponsoredForGame: ', sponsoredForGame)
            const allocatedRewardSponsorship = sponsoredForGame?.rewardSponsorships?.find(
              s => s?.rewardSponsorshipId === sponsor?._id
            )
            if (allocatedRewardSponsorship) {
              console.log('allocatedRewardSponsorship: ', allocatedRewardSponsorship)
              if (sponsor.rewardDetails?.rewardType === 'cash') {
                result.cash -= parseFloat(allocatedRewardSponsorship?.allocated) || 0
              } else {
                result.items -= parseFloat(allocatedRewardSponsorship?.allocated) || 0
              }
            }
          }
          if (sponsor.rewardDetails?.rewardType === 'cash') {
            result.cash += parseFloat(sponsor?.allocated) || 0
          } else {
            result.items += parseFloat(sponsor?.allocated) || 0
          }
        }
      })
    })

    console.log('result: ', result)

    return result
  }

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

    const sponsorPayload = {
      ...sponsor, // For SponsorDialog to read values like availableItems/Amount
      id: Date.now().toString(),
      sponsorshipId: _id,
      email: sponsor.email,
      allocated: parseFloat(allocation),
      ...(sponsor.rewardType === 'cash'
        ? {
            availableAmount: sponsor.availableAmount - parseFloat(allocation),
            prevAvailableAmount: sponsor.availableAmount
          }
        : {
            availableItems: sponsor.availableItems - parseFloat(allocation),
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
      updatedReward.sponsors[sponsorIndex].allocated = parseFloat(newValue) || 0
      setCurrentReward(updatedReward)
    }
  }

  const validateReward = () => {
    // numberOfWinnersForThisPosition is always 1, so no need to validate it
    if (
      currentReward.rewardType === 'cash' &&
      (!currentReward.rewardValuePerWinner || Number(currentReward.rewardValuePerWinner) === 0)
    ) {
      setValidationError('Value per winner must be greater than 0 for cash rewards')
      return false
    }
    const totalNeeded = calculateTotalRequired()
    const totalAllocated = calculateTotalAllocated()

    // Check if any sponsor has allocated more than their available limit
    const hasOverAllocatedSponsors = currentReward.sponsors.some(sponsor => {
      const sponsorLimit =
        currentReward.rewardType === 'cash' ? sponsor.prevAvailableAmount : sponsor.prevAvailableItems
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

  const handleRemoveSponsor = sponsorId => {
    // Update currentReward by removing the sponsor
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
    console.log('rewardToSave before any changes: ', rewardToSave)
    let updatedDisplaySponsorships = displaySponsorships

    updatedDisplaySponsorships = displaySponsorships.map(sponsorship => {
      const foundSponsor = currentReward?.sponsors?.find(s => s.sponsorshipId === sponsorship._id)

      console.log('sponsorship: ', sponsorship)
      console.log('foundSponsor: ', foundSponsor)
      if (!foundSponsor) return sponsorship

      const updatedSponsorship = {
        ...sponsorship,
        ...(foundSponsor.rewardType === 'cash'
          ? {
              availableAmount: sponsorship.availableAmount - foundSponsor.allocated,
              prevAvailableAmount: sponsorship.availableAmount - foundSponsor.allocated
            }
          : {
              availableItems: sponsorship.availableItems - foundSponsor.allocated,
              prevAvailableItems: sponsorship.availableItems - foundSponsor.allocated
            })
      }

      // START:  Update sponsors in the reward to save
      const updatedRewardSponsors = rewardToSave?.sponsors?.map(s => {
        if (s.sponsorshipId === sponsorship._id) {
          return {
            ...s,
            ...(s.rewardType === 'cash'
              ? {
                  availableAmount: sponsorship.availableAmount - s.allocated,
                  prevAvailableAmount: sponsorship.availableAmount - s.allocated
                }
              : {
                  availableItems: sponsorship.availableItems - s.allocated,
                  prevAvailableItems: sponsorship.availableItems - s.allocated
                })
          }
        }
        return s
      })
      rewardToSave.sponsors = updatedRewardSponsors
      // END:  Update sponsors in the reward to save

      return updatedSponsorship
    })

    console.log('updatedDisplaySponsorships after updating sponsors : ', updatedDisplaySponsorships)
    setDisplaySponsorships(updatedDisplaySponsorships)

    console.log('rewardToSave: ', rewardToSave)
    onSave(rewardToSave, updatedDisplaySponsorships)

    onClose()
  }

  // Get remaining amount/items needed
  const getRemainingNeed = () => {
    const totalNeeded = calculateTotalRequired()
    const totalAllocated = calculateTotalAllocated()
    
    if (currentReward.rewardType === 'cash') {
      // For cash, use same tolerance as validation (0.01)
      const difference = Math.abs(totalNeeded - totalAllocated)
      return difference > 0.01 ? Math.max(0, totalNeeded - totalAllocated) : 0
    } else {
      // For physical gifts, exact match required
      return Math.max(0, totalNeeded - totalAllocated)
    }
  }

  // Check if save button should be disabled
  const isSaveDisabled = () => {
    // Check if reward value is set for cash rewards
    if (currentReward.rewardType === 'cash' && (!currentReward.rewardValuePerWinner || Number(currentReward.rewardValuePerWinner) === 0)) {
      return true
    }
    
    // Check if physical gift is selected
    if (currentReward.rewardType === 'physicalGift' && !currentReward.nonCashReward) {
      return true
    }
    
    // Check if remaining need is greater than 0
    const remaining = getRemainingNeed()
    if (remaining > 0) {
      return true
    }
    
    // Check if any sponsor has over-allocated
    const hasOverAllocatedSponsors = currentReward.sponsors.some(sponsor => {
      const sponsorLimit =
        currentReward.rewardType === 'cash' ? sponsor.prevAvailableAmount : sponsor.prevAvailableItems
      const allocated = parseFloat(sponsor.allocated) || 0
      return allocated > (sponsorLimit || 0)
    })
    
    if (hasOverAllocatedSponsors) {
      return true
    }
    
    return false
  }

  console.log('New Current Reward: ', currentReward)
  console.log('New Display Sponsorships: ', displaySponsorships)

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth='md'
        fullScreen={false}
        PaperProps={{
          sx: {
            m: { xs: 1, sm: 2 },
            maxHeight: { xs: '95vh', sm: '90vh' },
            height: { xs: '95vh', sm: 'auto' },
            width: { xs: '100%', sm: 'auto' }
          }
        }}
      >
        <DialogTitle
          sx={{
            pb: { xs: 1, sm: 2 },
            pt: { xs: 2, sm: 2 },
            px: { xs: 2, sm: 3 },
            position: 'relative',
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Typography
            variant='h6'
            sx={{
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              fontWeight: 600,
              pr: 4
            }}
          >
            {isEditing ? 'Edit Reward' : 'Create Reward'}
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: { xs: 8, sm: 12 },
              top: { xs: 12, sm: 16 },
              size: 'small'
            }}
            size='small'
          >
            <CloseIcon fontSize='small' />
          </IconButton>
        </DialogTitle>

        <DialogContent
          dividers
          sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 2, sm: 3 },
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: '8px'
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderRadius: '4px'
            }
          }}
        >
          {validationError && (
            <Alert severity='error' sx={{ mb: 2 }}>
              {validationError}
            </Alert>
          )}

          <Grid container spacing={{ xs: 2, sm: 3 }}>
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
                <Grid item xs={12} sm={8}>
                  <TextField
                    fullWidth
                    label='Value Per Winner'
                    value={currentReward.rewardValuePerWinner}
                    onChange={e => {
                      if (e.target.value.trim() === '') {
                        setCurrentReward({
                          ...currentReward,
                          rewardValuePerWinner: 0
                        })
                        return
                      }
                      if (isNaN(e.target.value)) {
                        return
                      }
                      setCurrentReward({
                        ...currentReward,
                        rewardValuePerWinner: Math.max(0, e.target.value)
                      })
                    }}
                    inputProps={{ step: '1', min: 0 }}
                    size='medium'
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Currency</InputLabel>
                    <Select
                      label='Currency'
                      value={currentReward.currency}
                      onChange={e => setCurrentReward({ ...currentReward, currency: e.target.value })}
                      size='medium'
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
                  {/* <InputLabel>Physical Gift</InputLabel> */}
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
            <Alert
              icon={false}
              color='info'
              sx={{
                p: { xs: 2, sm: 3 },
                textAlign: 'center',
                mt: { xs: 1.5, sm: 2 },
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              {currentReward.rewardType === 'cash'
                ? `Total required: ${currentReward.currency} ${calculateTotalRequired().toFixed(2)}`
                : `Total items needed: ${calculateTotalRequired()}`}
            </Alert>
          </Grid>

          <Divider sx={{ my: { xs: 2, sm: 3 } }} />

          {/* Sponsors Section */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: { xs: 1.5, sm: 0 },
              mb: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant='h6' sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                Sponsors
              </Typography>
              <Tooltip
                title={
                  currentReward.rewardType === 'cash'
                    ? `Total required: ${currentReward.currency} ${calculateTotalRequired().toFixed(2)}`
                    : `Total items needed: ${calculateTotalRequired()}`
                }
              >
                <InfoIcon
                  color='action'
                  sx={{
                    fontSize: { xs: '1rem', sm: '1.25rem' },
                    cursor: 'help'
                  }}
                />
              </Tooltip>
            </Box>
            <Chip
              sx={{
                ml: { xs: 0, sm: 'auto' },
                mt: { xs: 0.5, sm: 0 },
                width: { xs: '100%', sm: 'auto' },
                justifyContent: 'center'
              }}
              color='error'
              variant='outlined'
              label={
                <Typography variant='body2' color='error' sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  Remaining:{' '}
                  {currentReward.rewardType === 'cash'
                    ? `${currentReward.currency} ${getRemainingNeed().toFixed(2)}`
                    : `${getRemainingNeed()} items`}
                </Typography>
              }
            />
          </Box>

          {currentReward.sponsors.length === 0 ? (
            <Alert
              icon={false}
              color='warning'
              sx={{
                p: { xs: 2, sm: 3 },
                textAlign: 'center',
                mb: 2,
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              <Typography color='text.secondary' textAlign='center' sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                No sponsors added yet. Add sponsors to fulfill the reward requirements.
              </Typography>
            </Alert>
          ) : (
            currentReward?.sponsors?.map(sponsor => (
              <Paper
                key={sponsor?._id || sponsor?.id}
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  mb: { xs: 1.5, sm: 2 },
                  borderRadius: 1
                }}
              >
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  spacing={{ xs: 1.5, sm: 2 }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0, width: '100%' }}>
                    <Avatar
                      sx={{
                        bgcolor: 'primary.main',
                        width: { xs: 36, sm: 40 },
                        height: { xs: 36, sm: 40 },
                        flexShrink: 0
                      }}
                    >
                      {sponsor.logo || sponsor.fullname?.[0]?.toUpperCase() || 'S'}
                    </Avatar>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          fontWeight: 500,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {sponsor.fullname || 'Sponsor'}
                      </Typography>
                      <Typography
                        variant='caption'
                        sx={{
                          color: 'text.secondary',
                          fontSize: { xs: '0.7rem', sm: '0.75rem' },
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          display: 'block'
                        }}
                      >
                        {sponsor.email}
                      </Typography>
                      <Typography
                        variant='body2'
                        color='text.secondary'
                        sx={{
                          fontSize: { xs: '0.7rem', sm: '0.875rem' },
                          mt: 0.5
                        }}
                      >
                        {currentReward.rewardType === 'cash'
                          ? `Available: ${sponsor.currency} ${sponsor.prevAvailableAmount}`
                          : `Available Items: ${sponsor.prevAvailableItems}`}
                      </Typography>
                    </Box>
                  </Box>
                  <Stack
                    direction={{ xs: 'row', sm: 'row' }}
                    alignItems='center'
                    spacing={1}
                    sx={{
                      width: { xs: '100%', sm: 'auto' },
                      justifyContent: { xs: 'space-between', sm: 'flex-end' }
                    }}
                  >
                    <TextField
                      label={currentReward.rewardType === 'cash' ? 'Amount' : 'Items'}
                      value={sponsor.allocated}
                      onChange={e => {
                        if (e.target.value.trim() === '') {
                          handleEditAllocation(sponsor?._id || sponsor?.id, 0)
                          return
                        }
                        if (isNaN(e.target.value)) {
                          return
                        }
                        if (
                          e.target.value >
                          (currentReward.rewardType === 'cash'
                            ? sponsor.prevAvailableAmount
                            : sponsor.prevAvailableItems)
                        ) {
                          return
                        }
                        handleEditAllocation(sponsor?._id || sponsor?.id, e.target.value)
                      }}
                      sx={{
                        width: { xs: 'calc(100% - 48px)', sm: 120 },
                        minWidth: { sm: 120 }
                      }}
                      size='small'
                    />
                    <IconButton
                      onClick={() => handleRemoveSponsor(sponsor?._id || sponsor?.id)}
                      size='small'
                      sx={{
                        '&:hover': {
                          backgroundColor: 'error.light',
                          color: 'error.main'
                        }
                      }}
                    >
                      <CloseIcon fontSize='small' />
                    </IconButton>
                  </Stack>
                </Stack>
              </Paper>
            ))
          )}

          <Button
            variant='outlined'
            startIcon={<AddIcon />}
            onClick={handleAddSponsor}
            fullWidth
            
            sx={{
              mt: { xs: 1, sm: 0 },
              py: { xs: 1.5, sm: 1 }
            }}
            disabled={getRemainingNeed() <= 0 || (currentReward.rewardType === 'cash' && (!currentReward.rewardValuePerWinner || Number(currentReward.rewardValuePerWinner) === 0)) || (currentReward.rewardType === 'physicalGift' && !currentReward.nonCashReward)}
          >
            Add Sponsor
          </Button>
        </DialogContent>

        <DialogActions
          sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 1.5, sm: 2 },
            borderTop: '1px solid',
            borderColor: 'divider',
            gap: { xs: 1, sm: 2 },
            flexDirection: 'row'
          }}
        >
          <Button variant='outlined' onClick={onClose}>
            Cancel
          </Button>
          <Button
            component='label'
            style={{ color: 'white' }}
            onClick={handleSave}
            variant='contained'
            disabled={isSaveDisabled()}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sponsor Selection Dialog */}
      <SponsorDialog
        open={openSponsorSelection}
        key={openSponsorSelection}
        onClose={handleCloseSponsor}
        currentReward={currentReward}
        availableSponsors={availableSponsors}
        onSave={handleSelectSponsor}
      />
    </>
  )
}

export default RewardDialog
