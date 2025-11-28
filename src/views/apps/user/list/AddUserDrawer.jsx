// React Imports
import { useEffect, useState } from 'react'

// MUI Imports

import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Checkbox,
  Chip,
  ListItemText,
  Box,
  Stack
} from '@mui/material'
import { useTheme, alpha } from '@mui/material/styles'

// Api utils
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import * as clientApi from '@/app/api/client/client.api'
import CountryRegionDropdown from '@/views/pages/auth/register-multi-steps/CountryRegionDropdown'

// Country region data
import { CountryRegionData } from '../../../../data/regions'

// react-phone-input-2 Imports
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

import * as UserServerActions from '@/actions/user'
import { toast } from 'react-toastify'
import IconButtonTooltip from '@/components/IconButtonTooltip'
import { ROLES_LOOKUP } from '@/configs/roles-lookup'

const USER_ROLE = ROLES_LOOKUP.USER

// Vars
const initialData = {
  firstname: '',
  lastname: '',
  email: '',
  confirmEmail: '',
  country: '',
  phone: '',
  roles: [USER_ROLE]
}

const AddUserDrawer = ({ open, handleClose, refreshUsers }) => {
  const theme = useTheme()
  // States
  const [formData, setFormData] = useState(initialData)
  const [rolesData, setRolesData] = useState([])
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedCountryObject, setSelectedCountryObject] = useState(null)
  const [selectedRegion, setSelectedRegion] = useState('')
  const [phoneInput, setPhoneInput] = useState('')
  const [phoneValid, setPhoneValid] = useState(false)
  const [countryDialCode, setCountryDialCode] = useState('')

  // Email validation states
  const [emailError, setEmailError] = useState('')
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const [emailExists, setEmailExists] = useState(false)

  // Form validation errors
  const [formErrors, setFormErrors] = useState({})

  // Helper function to ensure USER role is always included
  const ensureUserRole = roles => {
    const rolesArray = Array.isArray(roles) ? roles : []
    if (!rolesArray.includes(USER_ROLE)) {
      return [USER_ROLE, ...rolesArray]
    }
    return rolesArray
  }

  const getRolesData = async () => {
    console.log('Fetching Roles Data now...')
    // const result = await clientApi.getAllRoles() // Change this to the correct endpoint for roles
    const result = await RestApi.get(`${API_URLS.v0.ROLE}`)
    if (result?.status === 'success') {
      console.log('Roles Fetched result', result)
      setRolesData(result?.result || []) // Store the fetched roles data
      // dispatch(roleSliceActions.refreshRoles(result?.result || []))
    } else {
      console.log('Error:' + result?.message)
      console.log('Error Fetching roles:', result)
    }
  }

  useEffect(() => {
    getRolesData() // Call the updated function to fetch roles data
  }, [])

  useEffect(() => {
    setFormData(prev => ({ ...prev, country: selectedCountry }))
  }, [selectedCountry])

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      phone: phoneInput.startsWith(countryDialCode) ? phoneInput.slice(countryDialCode.length) : phoneInput
    }))
  }, [phoneInput, countryDialCode])

  // Email validation function
  const validateEmailFormat = email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Check if email exists
  const checkEmailExists = async email => {
    if (!email || !validateEmailFormat(email)) {
      setEmailError('')
      setEmailExists(false)
      setIsCheckingEmail(false)
      return false
    }

    setIsCheckingEmail(true)
    try {
      const result = await RestApi.get(`${API_URLS.v0.USER}/${encodeURIComponent(email)}`)
      if (result?.status === 'success' && result?.result) {
        setEmailError('This email is already registered')
        setEmailExists(true)
        setIsCheckingEmail(false)
        return true
      } else if (result?.status === 'error') {
        // User not found - email is available
        setEmailError('')
        setEmailExists(false)
        setIsCheckingEmail(false)
        return false
      } else {
        // Unknown response - don't block
        setEmailError('')
        setEmailExists(false)
        setIsCheckingEmail(false)
        return false
      }
    } catch (error) {
      // If error, assume email doesn't exist (don't block user)
      // This handles network errors, 404s, etc.
      setEmailError('')
      setEmailExists(false)
      setIsCheckingEmail(false)
      return false
    }
  }

  // Handle email change with debounce
  useEffect(() => {
    const email = formData.email.trim()

    if (!email) {
      setEmailError('')
      setEmailExists(false)
      return
    }

    // Validate email format
    if (!validateEmailFormat(email)) {
      setEmailError('Please enter a valid email address')
      setEmailExists(true)
      return
    }

    // Clear any existing error for format
    setEmailError('')
    setEmailExists(false)

    // Debounce email existence check
    const timer = setTimeout(() => {
      checkEmailExists(email)
    }, 500) // Wait 500ms after user stops typing

    return () => {
      clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.email])

  const validateForm = () => {
    const errors = {}

    if (!formData.firstname.trim()) {
      errors.firstname = 'First name is required'
    }

    if (!formData.lastname.trim()) {
      errors.lastname = 'Last name is required'
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!validateEmailFormat(formData.email)) {
      errors.email = 'Please enter a valid email address'
    } else if (emailExists || emailError) {
      errors.email = emailError || 'This email is already registered'
    }

    if (!formData.confirmEmail.trim()) {
      errors.confirmEmail = 'Please confirm your email'
    } else if (formData.confirmEmail !== formData.email) {
      errors.confirmEmail = 'Emails do not match'
    }

    if (!phoneInput || phoneInput.length <= countryDialCode.length) {
      errors.phone = 'Mobile number is required'
    } else if (!phoneValid && countryDialCode === '91') {
      errors.phone = 'Please enter a valid 10-digit Indian mobile number'
    } else if (!phoneValid) {
      errors.phone = 'Please enter a valid mobile number'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async () => {
    // Ensure USER role is always included
    const finalRoles = ensureUserRole(formData.roles)

    if (!validateForm()) {
      return
    }

    // Double check email doesn't exist before submitting
    if (emailExists || emailError) {
      toast.error('Please use a different email address')
      return
    }

    try {
      const response = await RestApi.post(`${API_URLS.v0.USER}`, {
        ...formData,
        roles: finalRoles
      })
      if (response.status === 'success') {
        console.log('User added successfully:', response.result)
        toast.success(response.message || 'User added successfully.')
        setFormData(initialData)
        setEmailError('')
        setEmailExists(false)
        setFormErrors({})
        handleClose()
        await refreshUsers()
      } else {
        console.error('Error adding user:', response.message)
        toast.error(response.message || 'Error adding user!')
      }
    } catch (error) {
      console.error('Error adding user:', error)
      toast.error(error.message || 'An unexpected error occurred while adding user.')
    }
  }

  const handleReset = () => {
    handleClose()
    setFormData({
      firstname: '',
      lastname: '',
      email: '',
      confirmEmail: '',
      country: '',
      phone: '',
      roles: [USER_ROLE]
    })
    setEmailError('')
    setEmailExists(false)
    setFormErrors({})
  }

  const handleRoleChange = event => {
    const { value } = event.target
    const newRoles = typeof value === 'string' ? value.split(',') : value
    // Ensure USER role is always included
    setFormData(prev => ({ ...prev, roles: ensureUserRole(newRoles) }))
  }

  const handleDeleteChip = chipToDelete => {
    // Prevent deletion of USER role
    if (chipToDelete === USER_ROLE) {
      return
    }
    setFormData(prev => {
      const filtered = prev.roles.filter(role => role !== chipToDelete)
      // Ensure USER role is still present
      return { ...prev, roles: ensureUserRole(filtered) }
    })
  }

  // function getPhoneNumberWithoutCountryCode(value, country) {
  //   let contactWithoutCountryCode = value
  //   if (country == 91) {
  //     contactWithoutCountryCode = value.substring(2, value.length)
  //   }
  //   setFormData(prev => ({ ...prev, phone: contactWithoutCountryCode }))
  // }

  const validatePhone = (value, dialCode) => {
    if (!value || value.length <= dialCode.length) {
      setPhoneValid(false)
      return false
    }

    const indianRegex = new RegExp('^[6-9][0-9]{9}$')
    if (dialCode === '91') {
      // For Indian numbers, validate 10-digit format starting with 6-9
      let contactWithoutCountryCode = value.substring(2, value.length)
      const result = indianRegex.test(contactWithoutCountryCode)
      setPhoneValid(result)
      return result
    } else {
      // For other countries, just check if number exists (more than dial code)
      const result = value.length > dialCode.length
      setPhoneValid(result)
      return result
    }
  }

  const handlePhoneInputChange = (value, country) => {
    // Update phone number
    setPhoneInput(value)
    // setCountryDialCode(country.dialCode)
    validatePhone(value, country.dialCode)

    // Clear phone error when user starts typing
    if (formErrors.phone) {
      setFormErrors(prev => ({ ...prev, phone: '' }))
    }

    // Check if the dial code or country code has changed
    console.log(country.dialCode, countryDialCode)
    if (country.dialCode !== countryDialCode) {
      // Update country dial code
      setCountryDialCode(country.dialCode)

      // Map country code to country name
      const countryObj = CountryRegionData.find(data => data[1]?.toLowerCase() === country.countryCode?.toLowerCase())

      if (countryObj) {
        // console.log('Mapped Country Object:', countryObj)
        setSelectedCountryObject({ country: countryObj[0], countryCode: countryObj[1] })
        setSelectedCountry(countryObj[0])
      } else {
        console.warn('Country not found in CountryRegionData:', country.countryCode)
      }
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleReset}
      maxWidth='md'
      fullWidth
      scroll='paper'
      PaperProps={{
        sx: {
          borderRadius: { xs: 3, sm: 4 },
          mx: { xs: 2.5, sm: 0 },
          my: { xs: 4, sm: 6 },
          maxHeight: { xs: '72dvh', sm: '82dvh' },
          width: '100%',
          backgroundColor: theme.palette.background.paper,
          boxShadow:
            theme.palette.mode === 'dark'
              ? `0 18px 44px ${alpha(theme.palette.common.black, 0.5)}`
              : '0 18px 44px rgba(15,15,45,0.18)',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`
        }
      }}
    >
      <DialogTitle
        sx={{
          px: { xs: 3, sm: 4.5 },
          py: { xs: 2.75, sm: 3.25 },
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
          backgroundColor: theme.palette.background.paper
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2
          }}
        >
          <Box sx={{ width: 40 }} />
          <Typography
            variant='h6'
            sx={{
              fontWeight: 600,
              fontSize: { xs: '1.25rem', sm: '1.35rem' },
              letterSpacing: '-0.01em',
              color: theme.palette.text.primary,
              textAlign: 'center',
              flex: 1
            }}
          >
            Add New User
          </Typography>
          <IconButtonTooltip
            title='Close'
            onClick={handleReset}
            sx={{
              color: theme.palette.text.secondary,
              '&:hover i': { color: theme.palette.text.primary }
            }}
          >
            <i className='ri-close-line text-xl' />
          </IconButtonTooltip>
        </Box>
        <Typography
          variant='body2'
          sx={{
            mt: 1.5,
            color: theme.palette.text.secondary,
            textAlign: 'center',
            fontSize: { xs: '0.92rem', sm: '0.95rem' }
          }}
        >
          Fill in the user details to create a new account.
        </Typography>
      </DialogTitle>
      <DialogContent
        sx={{
          px: { xs: 3, sm: 4.5 },
          py: { xs: 3, sm: 4 },
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5
        }}
      >
        <TextField
          label='First Name'
          fullWidth
          required
          sx={{ mt: 2 }}
          placeholder='John'
          value={formData.firstname}
          onChange={e => {
            setFormData({ ...formData, firstname: e.target.value })
            if (formErrors.firstname) {
              setFormErrors(prev => ({ ...prev, firstname: '' }))
            }
          }}
          error={!!formErrors.firstname}
          helperText={formErrors.firstname}
        />
        <TextField
          label='Last Name'
          fullWidth
          required
          placeholder='Doe'
          value={formData.lastname}
          onChange={e => {
            setFormData({ ...formData, lastname: e.target.value })
            if (formErrors.lastname) {
              setFormErrors(prev => ({ ...prev, lastname: '' }))
            }
          }}
          error={!!formErrors.lastname}
          helperText={formErrors.lastname}
        />
        <TextField
          label='Email'
          fullWidth
          required
          type='email'
          placeholder='johndoe@gmail.com'
          value={formData.email}
          onChange={e => {
            setFormData({ ...formData, email: e.target.value, confirmEmail: '' })
            if (formErrors.email) {
              setFormErrors(prev => ({ ...prev, email: '' }))
            }
          }}
          error={!!formErrors.email || !!emailError || emailExists}
          helperText={formErrors.email || emailError || (isCheckingEmail ? 'Checking email...' : '')}
          InputProps={{
            endAdornment: isCheckingEmail ? (
              <Typography variant='caption' sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                Checking...
              </Typography>
            ) : null
          }}
        />
        <TextField
          label='Confirm Email'
          fullWidth
          required
          type='email'
          placeholder='Confirm your email'
          value={formData.confirmEmail}
          disabled={!formData.email.trim() || !!emailError || emailExists || !validateEmailFormat(formData.email)}
          onPaste={e => e.preventDefault()}
          onChange={e => {
            setFormData({ ...formData, confirmEmail: e.target.value })
            if (formErrors.confirmEmail) {
              setFormErrors(prev => ({ ...prev, confirmEmail: '' }))
            }
          }}
          color={
            // Check if confirmEmail is empty, or email and confirmEmail match or don't match
            formData.confirmEmail.trim() === ''
              ? '' // If confirmEmail is empty, set the color to 'info'
              : formData.confirmEmail === formData.email
                ? 'success' // If both are non-empty and match, set the color to 'success'
                : 'error' // If both are non-empty but don't match, set the color to 'error'
          }
          // Check if email and confirm email match
          helperText={
            formErrors.confirmEmail ||
            (formData.email.trim() && formData.confirmEmail.trim()
              ? formData.confirmEmail === formData.email
                ? 'Email matched'
                : 'Email does not match'
              : '')
          }
          error={
            !!formErrors.confirmEmail ||
            (formData.email.trim() && formData.confirmEmail.trim() && formData.confirmEmail !== formData.email)
          } // Display error if emails don't match
        />
        <CountryRegionDropdown
          selectedCountryObject={selectedCountryObject}
          setSelectedCountryObject={setSelectedCountryObject}
          selectedCountry={selectedCountry}
          setSelectedCountry={setSelectedCountry}
          selectedRegion={selectedRegion}
          setSelectedRegion={setSelectedRegion}
        />
        <FormControl fullWidth error={!!formErrors.phone}>
          <Typography sx={{ mb: 1, color: formErrors.phone ? 'error.main' : 'text.secondary' }}>
            Phone No: <span style={{ color: 'red' }}>*</span>
          </Typography>
          <PhoneInput
            countryCodeEditable={false}
            id='phone-input'
            inputStyle={{
              width: '100%',
              height: '3rem',
              borderColor: formErrors.phone ? '#d32f2f' : undefined
            }}
            enableSearch={true}
            country={selectedCountryObject?.countryCode?.toLowerCase()}
            value={phoneInput}
            onChange={handlePhoneInputChange}
          />
          {formErrors.phone && (
            <Typography variant='caption' color='error' sx={{ mt: 0.5, display: 'block' }}>
              {formErrors.phone}
            </Typography>
          )}
        </FormControl>
        <FormControl fullWidth margin='normal' style={{ minWidth: '270px' }}>
          <InputLabel id='roles-multi-select-label'>Select Roles</InputLabel>
          <Select
            label='Select Roles'
            labelId='roles-multi-select-label'
            multiple
            name='roles'
            value={formData.roles}
            onChange={handleRoleChange}
            renderValue={selected => (
              <div className='flex flex-wrap gap-2'>
                {selected.map(value => (
                  <Chip
                    key={value}
                    clickable={value !== USER_ROLE}
                    deleteIcon={
                      value === USER_ROLE ? null : (
                        <i
                          className='ri-close-circle-fill'
                          onMouseDown={event => event.stopPropagation()} // Prevent closing Select when clicking icon
                        />
                      )
                    }
                    size='small'
                    label={value} // Assuming value is the label; adjust if needed
                    onDelete={value === USER_ROLE ? undefined : () => handleDeleteChip(value)} // Prevent deletion of USER role
                    sx={{
                      ...(value === USER_ROLE && {
                        opacity: 0.7,
                        cursor: 'not-allowed'
                      })
                    }}
                  />
                ))}
              </div>
            )}
          >
            {rolesData.map(role => (
              <MenuItem
                key={role._id}
                value={role.name}
                disabled={role.name === USER_ROLE} // Disable USER role checkbox (it's always selected)
              >
                <Checkbox
                  checked={formData.roles.includes(role.name)}
                  disabled={role.name === USER_ROLE} // USER role is always checked and disabled
                />
                <ListItemText
                  primary={role.name}
                  secondary={role.name === USER_ROLE ? 'Required for all users' : undefined}
                />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions
        sx={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: { xs: 'center', sm: 'flex-end' },
          alignItems: 'center',
          px: { xs: 3, sm: 4.5 },
          py: { xs: 2.5, sm: 3 },
          mt: { xs: 2, sm: 2 },
          gap: { xs: 1.5, sm: 2 },
          backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.12 : 0.06),
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
          '& > .MuiButton-root': {
            minWidth: 120,
            justifyContent: 'center'
          }
        }}
      >
        <Button
          onClick={handleReset}
          variant='outlined'
          sx={{
            color: theme.palette.mode === 'dark' ? '#ffffff' : undefined,
            borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : undefined,
            '&:hover': {
              borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : undefined,
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : undefined
            }
          }}
        >
          Cancel
        </Button>
        <Button
          component='label'
          color='primary'
          style={{ color: 'white' }}
          variant='contained'
          onClick={handleSubmit}
          disabled={
            !formData.firstname.trim() ||
            !formData.lastname.trim() ||
            !formData.email.trim() ||
            !formData.confirmEmail.trim() ||
            formData.confirmEmail !== formData.email ||
            !phoneInput ||
            phoneInput.length <= countryDialCode.length ||
            !phoneValid ||
            !!emailError ||
            emailExists ||
            isCheckingEmail
          }
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddUserDrawer
