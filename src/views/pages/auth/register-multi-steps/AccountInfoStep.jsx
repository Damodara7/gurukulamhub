import React, { useEffect, useState } from 'react'
import {
  TextField,
  Button,
  FormControl,
  RadioGroup,
  Radio,
  FormControlLabel,
  Box,
  FormLabel,
  Typography,
  CircularProgress,
  MenuItem,
  Select,
  InputLabel
} from '@mui/material'
import * as clientApi from '@/app/api/client/client.api'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS as ApiUrls } from '@/configs/apiConfig'

const AccountInfoStep = ({ handleNext, handlePrev, stepIndex, totalSteps, activeStep, email, setActiveStep }) => {
  const [accountType, setAccountType] = useState('INDIVIDUAL')
  const [institutionType, setInstitutionType] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [nickname, setNickname] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [ngoName, setNgoName] = useState('')
  const [roleInOrganization, setRoleInOrganization] = useState('')
  const [isFormValid, setIsFormValid] = useState(false)
  const [loading, setLoading] = useState(false)

  const isValidName = name => name.trim().length >= 3

  // Reset form fields when account type changes
  const resetFields = () => {
    setFirstName('')
    setLastName('')
    setNickname('')
    setBusinessName('')
    setNgoName('')
    setRoleInOrganization('')
  }

  const handleAccountTypeChange = event => {
    setAccountType(event.target.value)
    resetFields()
  }

  const handleInstitutionTypeChange = event => {
    setInstitutionType(event.target.value)
    resetFields()
  }

  // Validate form based on the selected account type
  useEffect(() => {
    let isValid = false

    if (accountType === 'INDIVIDUAL') {
      isValid = isValidName(firstName) && isValidName(lastName) && isValidName(nickname)
    } else if (accountType === 'INSTITUTIONAL') {
      if (institutionType === 'BUSINESS') {
        isValid = isValidName(businessName) && isValidName(roleInOrganization)
      } else if (institutionType === 'NGO') {
        isValid = isValidName(ngoName) && isValidName(roleInOrganization)
      }
    }

    setIsFormValid(isValid)
  }, [accountType, institutionType, firstName, lastName, nickname, businessName, ngoName, roleInOrganization])

  const handleSubmit = async event => {
    event.preventDefault()
    setLoading(true)

    let formData = {}

    if (accountType === 'INDIVIDUAL') {
      formData = { ...formData, accountType, firstname: firstName, lastname: lastName, nickname }
    } else if (accountType === 'INSTITUTIONAL') {
      formData = {
        ...formData,
        accountType: institutionType,
        organization: institutionType === 'BUSINESS' ? businessName : ngoName,
        roleInOrganization
      }
    }

    try {
      // Replace with your form submission logic
      console.log('Form Data Submitted:', formData)
      // const result = await clientApi.updateUserProfile(email, formData)
      const result = await RestApi.put(ApiUrls.v0.USERS_PROFILE, {
        email,
        ...formData
      })
      if (result?.status === 'success') {
        // toast.success(result?.message || 'Updated Name Details Successfully.')
        if (accountType === 'INDIVIDUAL') {
          setActiveStep(prev => prev + 2) // Skip name details step
        } else {
          handleNext() // Go to name details step
        }
      } else {
        console.log('Error updating account information')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleGoNext() {
    if (accountType === 'INDIVIDUAL') {
      setActiveStep(prev => prev + 2) // Skip name details step
    } else {
      handleNext() // Go to name details step
    }
  }

  return (
    <Box className='flex flex-col gap-10'>
      <Typography textAlign='center' fontSize={30} fontStyle={'italic'} color={'#6066d0'}>
        @Account Type
      </Typography>
      <Box
        component='form'
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', margin: 'auto' }}
      >
        <FormControl component='fieldset' disabled={loading}>
          <FormLabel component='legend'>Account Type</FormLabel>
          <RadioGroup
            value={accountType}
            onChange={handleAccountTypeChange}
            className='flex gap-3 flex-row items-center'
          >
            <FormControlLabel value='INDIVIDUAL' control={<Radio />} label='Individual' />
            <FormControlLabel value='INSTITUTIONAL' control={<Radio />} label='Institutional' />
          </RadioGroup>
        </FormControl>

        {accountType === 'INDIVIDUAL' && (
          <>
            <TextField
              label='First Name'
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              error={firstName && !isValidName(firstName)}
              helperText={firstName && !isValidName(firstName) ? 'Minimum 3 characters required' : ''}
              required
              disabled={loading}
            />
            <TextField
              label='Last Name'
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              error={lastName && !isValidName(lastName)}
              helperText={lastName && !isValidName(lastName) ? 'Minimum 3 characters required' : ''}
              required
              disabled={loading}
            />
            <TextField
              label='Nickname'
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              error={nickname && !isValidName(nickname)}
              helperText={nickname && !isValidName(nickname) ? 'Minimum 3 characters required' : ''}
              required
              disabled={loading}
            />
          </>
        )}

        {accountType === 'INSTITUTIONAL' && (
          <>
            <FormControl fullWidth>
              <InputLabel id='institution-type-label'>Institution Type</InputLabel>
              <Select
                labelId='institution-type-label'
                id='institution-type-select'
                label='Institution Type'
                value={institutionType}
                onChange={handleInstitutionTypeChange}
                disabled={loading}
              >
                <MenuItem value='BUSINESS'>Business</MenuItem>
                <MenuItem value='NGO'>NGO</MenuItem>
              </Select>
            </FormControl>

            {institutionType === 'BUSINESS' && (
              <>
                <TextField
                  label='Business Name'
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  error={businessName && !isValidName(businessName)}
                  helperText={businessName && !isValidName(businessName) ? 'Minimum 3 characters required' : ''}
                  required
                  disabled={loading}
                />
                <TextField
                  label='Role in Organization'
                  value={roleInOrganization}
                  onChange={e => setRoleInOrganization(e.target.value)}
                  error={roleInOrganization && !isValidName(roleInOrganization)}
                  helperText={
                    roleInOrganization && !isValidName(roleInOrganization) ? 'Minimum 3 characters required' : ''
                  }
                  required
                  disabled={loading}
                />
              </>
            )}

            {institutionType === 'NGO' && (
              <>
                <TextField
                  label='NGO Name'
                  value={ngoName}
                  onChange={e => setNgoName(e.target.value)}
                  error={ngoName && !isValidName(ngoName)}
                  helperText={ngoName && !isValidName(ngoName) ? 'Minimum 3 characters required' : ''}
                  required
                  disabled={loading}
                />
                <TextField
                  label='Role in Organization'
                  value={roleInOrganization}
                  onChange={e => setRoleInOrganization(e.target.value)}
                  error={roleInOrganization && !isValidName(roleInOrganization)}
                  helperText={
                    roleInOrganization && !isValidName(roleInOrganization) ? 'Minimum 3 characters required' : ''
                  }
                  required
                  disabled={loading}
                />
              </>
            )}
          </>
        )}

        <Button
          className='self-center'
          type='submit'
          variant='contained'
          color='primary'
          component='button'
          style={{ color: 'white' }}
          disabled={!isFormValid || loading}
        >
          {loading ? <CircularProgress size={24} /> : <b>GO!</b>}
        </Button>
        {/* <Button onClick={handleGoNext}>Next</Button> */}
      </Box>
    </Box>
  )
}

export default AccountInfoStep
