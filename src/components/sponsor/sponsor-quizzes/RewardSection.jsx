import React from 'react'
import { TextField, Grid, Typography, InputLabel, FormControl, Select, MenuItem } from '@mui/material'

const RewardFields = ({ rewardType, formData, handleChange, errors }) => {
  if (rewardType === 'cash') {
    return (
      <TextField
        fullWidth
        sx={{ mb: 3 }}
        label='Sponsorship Amount (INR)'
        type='text'
        name='sponsorshipAmount'
        value={formData.sponsorshipAmount}
        onChange={e => {
          const value = e.target.value.replace(/[^0-9.]/g, '').replace(/^0+(\d)/, '$1')
          handleChange({ target: { name: e.target.name, value } })
        }}
        error={!!errors.sponsorshipAmount}
        helperText={errors.sponsorshipAmount}
      />
    )
  }

  if (rewardType === 'physicalGift') {
    return (
      <>
        <TextField
          fullWidth
          sx={{ mb: 3 }}
          label='Item Name'
          name='nonCashItem'
          value={formData.nonCashItem}
          onChange={handleChange}
          error={!!errors.nonCashItem}
          helperText={errors.nonCashItem}
        />
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label='Quantity'
              type='number'
              name='numberOfNonCashItems'
              value={formData.numberOfNonCashItems}
              onChange={handleChange}
              error={!!errors.numberOfNonCashItems}
              helperText={errors.numberOfNonCashItems}
              InputProps={{ inputProps: { min: 1 } }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label='Estimated value per item (INR)'
              type='number'
              name='rewardValuePerItem'
              value={formData.rewardValuePerItem}
              onChange={handleChange}
              error={!!errors.rewardValue}
              helperText={errors.rewardValue}
              InputProps={{ inputProps: { min: 0 } }}
            />
          </Grid>
        </Grid>
        <TextField
          fullWidth
          sx={{ mt: 3 }}
          label='Additional details about the gift'
          name='rewardDescription'
          value={formData.rewardDescription}
          onChange={handleChange}
          multiline
          rows={2}
        />
      </>
    )
  }

  return null
}

export default function RewardSection({ rewardTypeOptions, rewardType, formData, handleChange, errors, setErrors, setRewardType }) {
  return (
    <>
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
      </FormControl>

      <RewardFields rewardType={rewardType} formData={formData} handleChange={handleChange} errors={errors} />
    </>
  )
}
