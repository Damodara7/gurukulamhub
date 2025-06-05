import React from 'react'
import { TextField, FormControl, InputLabel, Select, MenuItem, Typography, FormControlLabel, RadioGroup, Radio } from '@mui/material'

const OrganizationFields = ({ formData, handleChange, errors }) => {
  return (
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
    </>
  )
}

export default function SponsorerInfo({sponsorerType,setSponsorerType, formData, handleChange, errors}) {
  return (
    <>
      <Typography variant='h6' gutterBottom sx={{ mt: 2 }}>
        Sponsorship Type
      </Typography>
      <RadioGroup
        style={{ display: 'block' }}
        value={sponsorerType}
        onChange={e => setSponsorerType(e.target.value)}
        sx={{ mb: 2 }}
      >
        <FormControlLabel value='individual' control={<Radio />} label='Sponsor as an Individual' />
        <FormControlLabel value='organization' control={<Radio />} label='Sponsor as an Organization' />
      </RadioGroup>

      <TextField
        fullWidth
        sx={{ mb: 3 }}
        label={sponsorerType === 'individual' ? 'Your Full Name' : 'Contact Person Name'}
        name='fullname'
        value={formData.fullname}
        onChange={handleChange}
        error={!!errors.fullname}
        helperText={errors.fullname}
      />

      {sponsorerType === 'organization' && (
        <OrganizationFields formData={formData} handleChange={handleChange} errors={errors} />
      )}

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
  )
}
