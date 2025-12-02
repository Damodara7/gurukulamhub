import React from 'react'
import { TextField, FormControl, InputLabel, Select, MenuItem, Typography, FormControlLabel, RadioGroup, Radio, alpha, useTheme } from '@mui/material'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

const OrganizationFields = ({ formData, handleChange, errors }) => {
  const theme = useTheme()
  const isDarkMode = theme.palette.mode === 'dark'

  const textFieldSx = {
    mb: { xs: 2.5, sm: 3 },
    '& .MuiOutlinedInput-root': {
      backgroundColor: isDarkMode ? alpha(theme.palette.background.default, 0.6) : undefined,
      fontSize: { xs: '0.9rem', sm: '1rem' },
      ...(isDarkMode && {
        '& fieldset': {
          borderColor: alpha(theme.palette.divider, 0.3)
        },
        '&:hover fieldset': {
          borderColor: alpha(theme.palette.primary.main, 0.5)
        },
        '&.Mui-focused fieldset': {
          borderColor: theme.palette.primary.main
        }
      })
    },
    '& .MuiInputBase-input': {
      color: isDarkMode ? theme.palette.text.primary : undefined
    },
    '& .MuiInputLabel-root': {
      color: isDarkMode ? alpha(theme.palette.text.secondary, 0.8) : undefined,
      fontSize: { xs: '0.9rem', sm: '1rem' }
    },
    '& .MuiFormHelperText-root': {
      color: isDarkMode ? alpha(theme.palette.text.secondary, 0.8) : undefined,
      fontSize: { xs: '0.75rem', sm: '0.875rem' }
    }
  }

  return (
    <>
      <TextField
        fullWidth
        sx={textFieldSx}
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
        sx={textFieldSx}
        label='Website'
        name='website'
        value={formData.website}
        onChange={handleChange}
        error={!!errors.website}
        helperText={errors.website}
        required
      />
      <FormControl
        fullWidth
        sx={{
          mb: { xs: 2.5, sm: 3 },
          '& .MuiOutlinedInput-root': {
            backgroundColor: isDarkMode ? alpha(theme.palette.background.default, 0.6) : undefined,
            fontSize: { xs: '0.9rem', sm: '1rem' },
            ...(isDarkMode && {
              '& fieldset': {
                borderColor: alpha(theme.palette.divider, 0.3)
              },
              '&:hover fieldset': {
                borderColor: alpha(theme.palette.primary.main, 0.5)
              },
              '&.Mui-focused fieldset': {
                borderColor: theme.palette.primary.main
              }
            })
          },
          '& .MuiInputBase-input': {
            color: isDarkMode ? theme.palette.text.primary : undefined
          },
          '& .MuiInputLabel-root': {
            color: isDarkMode ? alpha(theme.palette.text.secondary, 0.8) : undefined,
            fontSize: { xs: '0.9rem', sm: '1rem' }
          }
        }}
        error={!!errors.orgType}
        required
      >
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
          <Typography
            color='error'
            variant='caption'
            sx={{
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              mt: 0.5,
              display: 'block'
            }}
          >
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
  const theme = useTheme()
  const isDarkMode = theme.palette.mode === 'dark'

  const textFieldSx = {
    mb: { xs: 2.5, sm: 3 },
    '& .MuiOutlinedInput-root': {
      backgroundColor: isDarkMode ? alpha(theme.palette.background.default, 0.6) : undefined,
      fontSize: { xs: '0.9rem', sm: '1rem' },
      ...(isDarkMode && {
        '& fieldset': {
          borderColor: alpha(theme.palette.divider, 0.3)
        },
        '&:hover fieldset': {
          borderColor: alpha(theme.palette.primary.main, 0.5)
        },
        '&.Mui-focused fieldset': {
          borderColor: theme.palette.primary.main
        }
      })
    },
    '& .MuiInputBase-input': {
      color: isDarkMode ? theme.palette.text.primary : undefined
    },
    '& .MuiInputLabel-root': {
      color: isDarkMode ? alpha(theme.palette.text.secondary, 0.8) : undefined,
      fontSize: { xs: '0.9rem', sm: '1rem' }
    },
    '& .MuiFormHelperText-root': {
      color: isDarkMode ? alpha(theme.palette.text.secondary, 0.8) : undefined,
      fontSize: { xs: '0.75rem', sm: '0.875rem' }
    }
  }

  return (
    <>
      <Typography
        variant='h6'
        gutterBottom
        sx={{
          mt: { xs: 1.5, sm: 2 },
          fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }
        }}
      >
        Sponsorship Type
      </Typography>
      <RadioGroup
        style={{ display: 'block' }}
        value={sponsorerType}
        onChange={e => setSponsorerType(e.target.value)}
        sx={{
          mb: { xs: 1.5, sm: 2 },
          '& .MuiFormControlLabel-label': {
            fontSize: { xs: '0.9rem', sm: '1rem' },
            color: isDarkMode ? theme.palette.text.primary : undefined
          },
          '& .MuiRadio-root': {
            color: isDarkMode ? alpha(theme.palette.text.secondary, 0.7) : undefined
          }
        }}
      >
        <FormControlLabel value='individual' control={<Radio />} label='Sponsor as an Individual' />
        <FormControlLabel value='organization' control={<Radio />} label='Sponsor as an Organization' />
      </RadioGroup>

      <TextField
        fullWidth
        sx={textFieldSx}
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
        sx={textFieldSx}
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

      <FormControl
        fullWidth
        sx={{
          mb: { xs: 2.5, sm: 3 }
        }}
        error={!!errors.mobileNumber}
      >
        <Typography
          variant='body2'
          sx={{
            mb: 1,
            color: errors.mobileNumber ? 'error.main' : 'text.secondary',
            fontSize: { xs: '0.88rem', sm: '0.9rem', md: '0.95rem' }
          }}
        >
          Mobile Number *
        </Typography>
        <PhoneInput
          countryCodeEditable={false}
          id='phone-input'
          inputStyle={{
            width: '100%',
            height: isDarkMode ? '3.5rem' : '3.5rem',
            fontSize: '1rem',
            borderColor: errors.mobileNumber
              ? theme.palette.error.main
              : isDarkMode
                ? alpha(theme.palette.divider, 0.3)
                : undefined,
            backgroundColor: isDarkMode ? alpha(theme.palette.background.default, 0.6) : undefined,
            color: isDarkMode ? theme.palette.text.primary : undefined,
            borderRadius: '4px'
          }}
          buttonStyle={{
            backgroundColor: isDarkMode ? alpha(theme.palette.background.default, 0.8) : undefined,
            borderColor: isDarkMode ? alpha(theme.palette.divider, 0.3) : undefined
          }}
          dropdownStyle={{
            backgroundColor: isDarkMode ? theme.palette.background.paper : undefined,
            color: isDarkMode ? theme.palette.text.primary : undefined
          }}
          enableSearch={true}
          country={selectedCountryObject?.countryCode?.toLowerCase() || 'in'}
          value={phoneInput}
          onChange={handlePhoneInputChange}
        />
        {errors.mobileNumber && (
          <Typography
            color='error'
            variant='caption'
            sx={{
              mt: 0.5,
              display: 'block',
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }}
          >
            {errors.mobileNumber
              ? `${errors.mobileNumber}`
              : countryDialCode === '91'
                ? '(10-digit Indian mobile number)'
                : ''}
          </Typography>
        )}
      </FormControl>
    </>
  )
}
