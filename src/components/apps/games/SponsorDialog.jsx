import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  TextField,
  Divider,
  Button,
  Typography,
  Stack,
  Avatar,
  Box,
  Alert
} from '@mui/material'

const SponsorDialog = ({ open, onClose, currentReward, availableSponsors, onSave }) => {
  const [selectedSponsor, setSelectedSponsor] = useState(null)
  const [allocationAmount, setAllocationAmount] = useState(0)

  const getRemainingNeed = () => {
    const totalNeeded =
      currentReward.rewardType === 'cash'
        ? currentReward.rewardValuePerWinner * currentReward.numberOfWinnersForThisPosition
        : currentReward.numberOfWinnersForThisPosition

    const totalAllocated = currentReward.sponsors.reduce((sum, sponsor) => sum + (sponsor.allocated || 0), 0)
    return Math.max(0, totalNeeded - totalAllocated)
  }

  // Calculate the maximum allocatable amount for the selected sponsor
  const getMaxAllocation = () => {
    if (!selectedSponsor) return 0

    const remainingNeed = getRemainingNeed()
    const sponsorLimit =
      currentReward.rewardType === 'cash' ? selectedSponsor.availableAmount : selectedSponsor.availableItems

    return Math.min(remainingNeed, sponsorLimit)
  }

  const handleAddSponsor = () => {
    if (!selectedSponsor) return
    onSave(selectedSponsor, allocationAmount)
    handleCloseSponsor()
  }

  // When dialog opens or when selected sponsor changes, update allocation amount
  useEffect(() => {
    if (open && selectedSponsor) {
      const maxAllocation = getMaxAllocation()
      setAllocationAmount(maxAllocation)
    }
  }, [open, selectedSponsor])

  function handleCloseSponsor() {
    setSelectedSponsor(null)
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleCloseSponsor} fullWidth maxWidth='sm'>
      <DialogTitle>Select Sponsor</DialogTitle>
      <DialogContent>
        <Autocomplete
          options={availableSponsors}
          getOptionLabel={option => `${option.fullname} (${option.email})`}
          value={selectedSponsor}
          onChange={(e, newValue) => {
            setSelectedSponsor(newValue)
          }}
          sx={{ mt: 1 }}
          // Add this prop to disable already added sponsors
          getOptionDisabled={option =>
            currentReward.sponsors.some(s => s._id === option._id) ||
            (option.rewardType === 'cash' ? option.availableAmount === 0 : option.availableItems === 0)
          }
          renderInput={params => <TextField {...params} label='Search Sponsors' />}
          renderOption={(props, option) => (
            <li {...props}>
              <Stack direction='row' alignItems='center' spacing={2}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>{option.logo}</Avatar>
                <Box>
                  <Typography>{option.fullname}</Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {option.email}
                    {option.rewardType === 'cash'
                      ? ` | Available: ${option.currency} ${option.availableAmount}`
                      : ` | Available Items: ${option.availableItems}`}
                  </Typography>
                  {/* Add disabled status indicator */}
                  {currentReward.sponsors.some(s => s._id === option._id) && (
                    <Typography variant='body2' color='error'>
                      Already added
                    </Typography>
                  )}
                </Box>
              </Stack>
            </li>
          )}
        />

        {selectedSponsor && (
          <>
            <Alert icon={false} color='info' sx={{ my: 2 }}>
              <Typography variant='body2' color='text.secondary'>
                {currentReward.rewardType === 'cash'
                  ? `Available: ${selectedSponsor.currency} ${selectedSponsor.availableAmount}`
                  : `Available Items: ${selectedSponsor.availableItems}`}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Remaining need:{' '}
                {currentReward.rewardType === 'cash'
                  ? `${currentReward.currency} ${getRemainingNeed().toFixed(2)}`
                  : `${getRemainingNeed()} item${getRemainingNeed() > 1 ? 's' : ''}`}
              </Typography>
            </Alert>

            <TextField
              fullWidth
              label={currentReward.rewardType === 'cash' ? 'Amount to Allocate' : 'Items to Allocate'}
              value={allocationAmount}
              onChange={e => {
                if(e.target.value.trim() === ''){
                  setAllocationAmount(0)
                  return
                }
                if(isNaN(e.target.value)){
                  return
                }
                const maxAllocation = getMaxAllocation()
                const newValue = Math.min(maxAllocation, Math.max(0, e.target.value))
                setAllocationAmount(newValue)
              }}
              sx={{ mt: 3 }}
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button variant='outlined' onClick={onClose}>
          Cancel
        </Button>
        <Button
          component='label'
          sx={{ color: 'white' }}
          onClick={handleAddSponsor}
          variant='contained'
          disabled={!selectedSponsor || allocationAmount <= 0}
        >
          Add Sponsor
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SponsorDialog
