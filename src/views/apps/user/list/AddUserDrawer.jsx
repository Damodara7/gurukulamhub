// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { Checkbox, Chip, ListItemText } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'

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

// Vars
const initialData = {
  firstname: '',
  lastname: '',
  email: '',
  confirmEmail: '',
  country: '',
  phone: '',
  roles: ['USER']
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

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      // const response = await UserServerActions.addNewUser(formData)
      const response = await RestApi.post(`${API_URLS.v0.USER}`, { ...formData })
      if (response.status === 'success') {
        console.log('User added successfully:', response.result)
        toast.success(response.message || 'User added successfully.')
        setFormData(initialData)
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
      roles: ['USER']
    })
  }

  const handleRoleChange = event => {
    const { value } = event.target
    setFormData(prev => ({ ...prev, roles: typeof value === 'string' ? value.split(',') : value }))
  }

  const handleDeleteChip = chipToDelete => {
    setFormData(prev => ({ ...prev, roles: prev.roles.filter(role => role !== chipToDelete) }))
  }

  // function getPhoneNumberWithoutCountryCode(value, country) {
  //   let contactWithoutCountryCode = value
  //   if (country == 91) {
  //     contactWithoutCountryCode = value.substring(2, value.length)
  //   }
  //   setFormData(prev => ({ ...prev, phone: contactWithoutCountryCode }))
  // }

  const validatePhone = (value, country) => {
    const indianRegex = new RegExp('^[6-9][0-9]{9}$')
    if (country == 91) {
      let contactWithoutCountryCode = value.substring(2, value.length)
      var result = indianRegex.test(contactWithoutCountryCode)
      setPhoneValid(result)
    }
  }

  const handlePhoneInputChange = (value, country) => {
    // Update phone number
    setPhoneInput(value)
    // setCountryDialCode(country.dialCode)
    validatePhone(value, country.dialCode)

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
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleReset}
      ModalProps={{ keepMounted: true }}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: 'min(420px, 92vw)', sm: 440 },
          maxWidth: 520,
          mr: { xs: 2, sm: 0 },
          borderTopLeftRadius: { xs: 24, sm: 28 },
          borderBottomLeftRadius: { xs: 24, sm: 28 },
          boxShadow: '0 18px 44px rgba(15,15,45,0.18)',
          borderLeft: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      <Box
        component='form'
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}
      >
        <Box
          sx={{
            px: { xs: 3, sm: 4 },
            py: { xs: 2.5, sm: 3 },
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant='h6' sx={{ fontWeight: 600 }}>
              Add New User
            </Typography>
            <Typography variant='body2' sx={{ color: theme.palette.text.secondary, mt: 0.5 }}>
              Provide account details and assign default roles.
            </Typography>
          </Box>
          <IconButtonTooltip title='Close' onClick={handleReset}>
            <i className='ri-close-line text-lg' />
          </IconButtonTooltip>
        </Box>
        <Box
          sx={{
            px: { xs: 3, sm: 4 },
            py: { xs: 3, sm: 4 },
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 3
          }}
        >
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField
              label='First Name'
              fullWidth
              placeholder='John'
              value={formData.firstname}
              onChange={e => setFormData({ ...formData, firstname: e.target.value })}
            />
            <TextField
              label='Last Name'
              fullWidth
              placeholder='Doe'
              value={formData.lastname}
              onChange={e => setFormData({ ...formData, lastname: e.target.value })}
            />
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label='Email'
              fullWidth
              type='email'
              placeholder='johndoe@gmail.com'
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
            <TextField
              label='Confirm Email'
              fullWidth
              type='email'
              placeholder='Confirm your email'
              value={formData.confirmEmail}
              disabled={!formData.email.trim()}
              onPaste={e => e.preventDefault()}
              onChange={e => {
                setFormData({ ...formData, confirmEmail: e.target.value })
              }}
              color={
                formData.confirmEmail.trim() === ''
                  ? 'primary'
                  : formData.confirmEmail === formData.email
                    ? 'success'
                    : 'error'
              }
              helperText={
                formData.email.trim() && formData.confirmEmail.trim()
                  ? formData.confirmEmail === formData.email
                    ? 'Email matched'
                    : 'Email does not match'
                  : ''
              }
              error={formData.email.trim() && formData.confirmEmail.trim() && formData.confirmEmail !== formData.email}
              FormHelperTextProps={{
                sx: {
                  color:
                    formData.email.trim() && formData.confirmEmail.trim() && formData.confirmEmail !== formData.email
                      ? theme.palette.error.main
                      : theme.palette.success.main
                }
              }}
            />
          </Box>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}
          >
            <Typography variant='subtitle2' sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
              Location Details
            </Typography>
            <CountryRegionDropdown
              selectedCountryObject={selectedCountryObject}
              setSelectedCountryObject={setSelectedCountryObject}
              selectedCountry={selectedCountry}
              setSelectedCountry={setSelectedCountry}
              selectedRegion={selectedRegion}
              setSelectedRegion={setSelectedRegion}
            />
          </Box>
          <FormControl fullWidth>
            <Typography variant='subtitle2' sx={{ fontWeight: 600, color: theme.palette.text.primary, mb: 1 }}>
              Phone Number
            </Typography>
            <PhoneInput
              countryCodeEditable={false}
              id='phone-input'
              inputStyle={{ width: '100%', height: '3rem' }}
              enableSearch={true}
              country={selectedCountryObject?.countryCode?.toLowerCase()}
              value={phoneInput}
              onChange={handlePhoneInputChange}
            />
          </FormControl>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              p: 2,
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.divider, 0.4)}`
            }}
          >
            <Typography variant='subtitle2' sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
              Assign Roles
            </Typography>
            <Typography variant='body2' sx={{ color: theme.palette.text.secondary }}>
              Select the permissions profiles this user should inherit.
            </Typography>
            <FormControl fullWidth margin='normal'>
              <InputLabel id='roles-multi-select-label'>Select Roles</InputLabel>
              <Select
                label='Select Roles'
                labelId='roles-multi-select-label'
                multiple
                name='roles'
                value={formData.roles}
                onChange={handleRoleChange}
                renderValue={selected => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selected.map(value => (
                      <Chip
                        key={value}
                        clickable
                        deleteIcon={
                          <i
                            className='ri-close-circle-fill'
                            onMouseDown={event => event.stopPropagation()} // Prevent closing Select when clicking icon
                          />
                        }
                        size='small'
                        label={value}
                        onDelete={() => handleDeleteChip(value)}
                      />
                    ))}
                  </Box>
                )}
              >
                {rolesData.map(role => (
                  <MenuItem key={role._id} value={role.name}>
                    <Checkbox checked={formData.roles.includes(role.name)} />
                    <ListItemText primary={role.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
        </Box>
        <Box
          sx={{
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
            backgroundColor: alpha(theme.palette.primary.main, 0.06),
            px: { xs: 3, sm: 4 },
            py: { xs: 2.5, sm: 3 },
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            justifyContent: { xs: 'center', sm: 'flex-end' }
          }}
        >
          <Button variant='outlined' color='secondary' onClick={handleReset}>
            Cancel
          </Button>
          <Button
            variant='contained'
            type='submit'
            disabled={
              !(formData.email.trim() && formData.confirmEmail.trim() && formData.confirmEmail === formData.email)
            }
            sx={{ minWidth: 140, color: '#fff' }}
          >
            Submit
          </Button>
        </Box>
      </Box>
    </Drawer>
  )
}

export default AddUserDrawer
