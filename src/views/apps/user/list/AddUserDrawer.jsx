// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'

// Api utils
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import * as clientApi from '@/app/api/client/client.api'
import { Checkbox, Chip, ListItemText } from '@mui/material'
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
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <div className='flex items-center justify-between pli-5 plb-[15px]'>
        <Typography variant='h5'>Add New User</Typography>
        <IconButtonTooltip title='Close' onClick={handleReset}>
          <i className='ri-close-line' />
        </IconButtonTooltip>
      </div>
      <Divider />
      <div className='p-5'>
        <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
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
              // Check if confirmEmail is empty, or email and confirmEmail match or don't match
              formData.confirmEmail.trim() === ''
                ? '' // If confirmEmail is empty, set the color to 'info'
                : formData.confirmEmail === formData.email
                  ? 'success' // If both are non-empty and match, set the color to 'success'
                  : 'error' // If both are non-empty but don't match, set the color to 'error'
            }
            // Check if email and confirm email match
            helperText={
              formData.email.trim() && formData.confirmEmail.trim()
                ? formData.confirmEmail === formData.email
                  ? 'Email matched'
                  : 'Email does not match'
                : ''
            }
            error={formData.email.trim() && formData.confirmEmail.trim() && formData.confirmEmail !== formData.email} // Display error if emails don't match
            FormHelperTextProps={{
              style: {
                color:
                  formData.email.trim() && formData.confirmEmail.trim() && formData.confirmEmail !== formData.email
                    ? 'red'
                    : 'green'
              }
            }}
          />
          <CountryRegionDropdown
            selectedCountryObject={selectedCountryObject}
            setSelectedCountryObject={setSelectedCountryObject}
            selectedCountry={selectedCountry}
            setSelectedCountry={setSelectedCountry}
            selectedRegion={selectedRegion}
            setSelectedRegion={setSelectedRegion}
          />
          <FormControl fullWidth>
            <Typography>Phone No:</Typography>
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
                      clickable
                      deleteIcon={
                        <i
                          className='ri-close-circle-fill'
                          onMouseDown={event => event.stopPropagation()} // Prevent closing Select when clicking icon
                        />
                      }
                      size='small'
                      label={value} // Assuming value is the label; adjust if needed
                      onDelete={() => handleDeleteChip(value)} // Call delete handler
                    />
                  ))}
                </div>
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
          <div className='flex items-center gap-4'>
            <Button
              variant='contained'
              type='submit'
              disabled={
                !(formData.email.trim() && formData.confirmEmail.trim() && formData.confirmEmail === formData.email)
              }
            >
              Submit
            </Button>
            <Button variant='outlined' color='error' type='reset' onClick={() => handleReset()}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  )
}

export default AddUserDrawer
