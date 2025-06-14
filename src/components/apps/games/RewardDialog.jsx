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

// Enhanced dummy sponsor data
// export const sponsorships = [
//   {
//     id: '1',
//     name: 'TechCorp Inc.',
//     email: 'sponsor1@example.com',
//     rewardType: 'cash',
//     amount: 1000,
//     currency: 'INR',
//     availableAmount: 1000,
//     logo: 'TC'
//   },
//   {
//     id: '2',
//     name: 'Finance Partners',
//     email: 'sponsor2@example.com',
//     rewardType: 'cash',
//     amount: 1500,
//     currency: 'USD',
//     availableAmount: 1500,
//     logo: 'FP'
//   },
//   {
//     id: '3',
//     name: 'Gadget World',
//     email: 'sponsor3@example.com',
//     rewardType: 'physicalGift',
//     nonCashItem: 'iPhone 15',
//     numberOfNonCashItems: 50,
//     availableItems: 50,
//     logo: 'GW'
//   },
//   {
//     id: '4',
//     name: 'Mobile Solutions',
//     email: 'sponsor4@example.com',
//     rewardType: 'physicalGift',
//     nonCashItem: 'iPhone 15',
//     numberOfNonCashItems: 30,
//     availableItems: 30,
//     logo: 'MS'
//   },
//   {
//     id: '5',
//     name: 'Travel Co.',
//     email: 'sponsor5@example.com',
//     rewardType: 'physicalGift',
//     nonCashItem: 'Vacation Package',
//     numberOfNonCashItems: 10,
//     availableItems: 10,
//     logo: 'TC'
//   }
// ]

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

            // const removedSponsorsMap = new Map()
            // sponsorship?.sponsored?.forEach(s => {
            //   if (s?.game === gameData?._id) {
            //     s?.rewardSponsorships?.forEach(rs => {
            //       if (!reward?.sponsors?.find(sp => (sp._id || sp.id) === (rs.rewardSponsorshipId || rs.id))) {
            //         removedSponsorsMap.set(rs.rewardSponsorshipId, rs.allocated)
            //       }
            //     })
            //   }
            // })
            // removedSponsorsMap.forEach(({ allocated }, sponsorId) => {
            //   sponsorship.sponsored.forEach(s => {
            //     if (s.game === gameData?._id) {
            //       s.rewardSponsorships.forEach(rs => {
            //         if (rs.rewardSponsorshipId === sponsorId) {
            //           rs.allocated -= allocated
            //         }
            //       })
            //     }
            //   })
            //   if (sponsorship.rewardType === 'cash') {
            //     sponsorship.availableAmount += allocated
            //   } else {
            //     sponsorship.availableItems += allocated
            //   }
            // })

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
    formData?.location?.city
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
    const originalewardSponsorships = sponsorships
      ?.find(s => s?._id === sponsorshipId)
      ?.sponsored?.find(s => s?.game === gameData?._id)?.rewardSponsorships

    console.log('formData.rewards: ', formData.rewards)

    formData.rewards?.forEach(reward => {
      const originalRewardSponsorshipsOfThisReward = originalewardSponsorships?.filter(x => x?.rewardId === reward?._id) || []
      console.log('originalRewardSponsorshipsOfThisReward: ', originalRewardSponsorshipsOfThisReward)

      const originalRewardSponsorshipIds = originalRewardSponsorshipsOfThisReward?.map(x => x.rewardSponsorshipId) || []
      const rewardSponsorshipIds = reward.sponsors?.map(x => x.sponsorshipId) || []

      const removedRewardSponsorshipIds = originalRewardSponsorshipIds.filter(x => !rewardSponsorshipIds.includes(x)) || []
      const removedRewardSponsorships = originalRewardSponsorshipsOfThisReward?.filter(x =>
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
    let rewardToSave = currentReward
    console.log('rewardToSave before any changes: ', rewardToSave)
    let updatedDisplaySponsorships = displaySponsorships
    // // STRAT:  Update displaySponsorships to reflect the removed sponsor (compare currentReward.sponsors with matching reward (in formData.rewards sponsors)
    // const prevVersionOfCurrentReward = formData.rewards.find(
    //   r => (r?._id || r?.id) === (currentReward?._id || currentReward?.id)
    // )
    // const removedSponsorsMap = new Map()
    // prevVersionOfCurrentReward.sponsors.forEach(prevSponsor => {
    //   const currentSponsor = currentReward.sponsors.find(
    //     s => (s?._id || s?.id) === (prevSponsor?._id || prevSponsor?.id)
    //   )
    //   if (!currentSponsor) {
    //     removedSponsorsMap.set(prevSponsor.sponsorshipId, {
    //       allocated: prevSponsor.allocated,
    //       rewardType: prevSponsor.rewardType
    //     })
    //   }
    // })

    // console.log('prevVersionOfCurrentReward.sponsors : ', prevVersionOfCurrentReward.sponsors)
    // console.log('currentReward.sponsors : ', currentReward.sponsors)
    // console.log('removedSponsorsMap: ', removedSponsorsMap)

    // // anyMap.forEach((value, key) => {
    // removedSponsorsMap.forEach(({ allocated, rewardType }, sponsorshipId) => {
    //   const matchedSponsorshipIndex = updatedDisplaySponsorships.findIndex(s => (s?._id || s?.id) === sponsorshipId)
    //   if (matchedSponsorshipIndex > -1) {
    //     // when you use forEach to iterate over an array and modify its elements, the original array does get updated because objects and arrays in JavaScript are passed by reference.
    //     updatedDisplaySponsorships[matchedSponsorshipIndex]?.sponsored?.forEach(s => {
    //       if (s.game === gameData?._id) {
    //         s.rewardSponsorships.forEach(rs => {
    //           if (rs.rewardSponsorshipId === sponsorId) {
    //             rs.allocated -= allocated // This modifies the original object
    //           }
    //         })
    //       }
    //     })

    //     // No need to add allocated to availableAmount/availableItems as it is already added when the reward was clicked start editing
    //     // if (rewardType === 'cash') {
    //     //   updatedDisplaySponsorships[matchedSponsorshipIndex].availableAmount += allocated
    //     // } else {
    //     //   updatedDisplaySponsorships[matchedSponsorshipIndex].availableItems += allocated
    //     // }
    //   }
    // })
    // console.log('updatedDisplaySponsorships after removing sponsors : ', updatedDisplaySponsorships)
    // // END:  Update displaySponsorships to reflect the removed sponsor (compare currentReward.sponsors with matching reward (in formData.rewards sponsors)

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
    return Math.max(0, totalNeeded - totalAllocated)
  }

  console.log('New Current Reward: ', currentReward)
  console.log('New Display Sponsorships: ', displaySponsorships)

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
                      const { key, ...otherProps } = props;
                      return (
                        <li key={option.value} {...otherProps} value={option.value}>
                          <Typography>
                            {option.label} (Available: {option.totalAvailable})
                          </Typography>
                        </li>
                      );
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
              <Paper key={sponsor?._id || sponsor?.id} sx={{ p: 2, mb: 2 }}>
                <Stack direction='row' alignItems='center' spacing={2}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>{sponsor.logo}</Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography>{sponsor.name || sponsor.email}</Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {currentReward.rewardType === 'cash'
                        ? `Available: ${sponsor.currency} ${sponsor.prevAvailableAmount}`
                        : `Available Items: ${sponsor.prevAvailableItems}`}
                    </Typography>
                  </Box>
                  <TextField
                    label={currentReward.rewardType === 'cash' ? 'Amount' : 'Items'}
                    type='number'
                    value={sponsor.allocated}
                    onChange={e => handleEditAllocation(sponsor?._id || sponsor?.id, e.target.value)}
                    inputProps={{
                      max:
                        currentReward.rewardType === 'cash' ? sponsor.prevAvailableAmount : sponsor.prevAvailableItems,
                      min: 0,
                      step: currentReward.rewardType === 'cash' ? 1 : 1
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
            disabled={getRemainingNeed() <= 0}
          >
            Add Sponsor
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
            disabled={getRemainingNeed() > 0}
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
