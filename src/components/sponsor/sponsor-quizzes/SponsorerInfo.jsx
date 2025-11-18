import React from 'react'
import { TextField, FormControl, InputLabel, Select, MenuItem, Typography, FormControlLabel, RadioGroup, Radio } from '@mui/material'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

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
        required
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
        required
      />
      <FormControl fullWidth sx={{ mb: 3 }} error={!!errors.orgType} required>
        <InputLabel id='org-type-label'>Organization Type</InputLabel>
        <Select
          labelId='org-type-label'
          label='Organization Type'
          name='orgType'
          value={formData.orgType}
          onChange={handleChange}
          required
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

export default function SponsorerInfo({
  sponsorerType,
  setSponsorerType,
  formData,
  handleChange,
  errors,
  phoneInput,
  countryDialCode,
  selectedCountryObject,
  handlePhoneInputChange
}) {
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
        required
      />

      <TextField
        fullWidth
        sx={{ mb: 3 }}
        label={sponsorerType === 'individual' ? 'Your Email' : 'Business Email'}
        name='email'
        type='email'
        required
        value={formData.email}
        onChange={handleChange}
        error={!!errors.email}
        helperText={errors.email}
      />

      {sponsorerType === 'organization' && (
        <OrganizationFields formData={formData} handleChange={handleChange} errors={errors} />
      )}

      <FormControl fullWidth sx={{ mb: 3 }} error={!!errors.mobileNumber}>
        <Typography variant='body2' sx={{ mb: 1, color: errors.mobileNumber ? 'error.main' : 'text.secondary' }}>
          Mobile Number *
        </Typography>
        <PhoneInput
          countryCodeEditable={false}
          id='phone-input'
          inputStyle={{
            width: '100%',
            height: '3.5rem',
            fontSize: '1rem',
            borderColor: errors.mobileNumber ? '#d32f2f' : undefined
          }}
          enableSearch={true}
          country={selectedCountryObject?.countryCode?.toLowerCase() || 'in'}
          value={phoneInput}
          onChange={handlePhoneInputChange}
        />
        {errors.mobileNumber && (
          <Typography color='error' variant='caption' sx={{ mt: 0.5, display: 'block' }}>
            {errors.mobileNumber ? `${errors.mobileNumber}` : countryDialCode === '91' ? '(10-digit Indian mobile number)' : ''}
          </Typography>
        )}
      </FormControl>
    </>
  )
}
