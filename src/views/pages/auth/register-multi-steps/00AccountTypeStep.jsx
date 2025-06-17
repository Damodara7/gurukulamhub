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
  InputLabel,
  Stack
} from '@mui/material'
import * as clientApi from '@/app/api/client/client.api'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import Link from 'next/link'
import DirectionalIcon from '@components/DirectionalIcon'
import { useSearchParams } from 'next/navigation'
import Loading from '@/components/Loading'
import themeConfig from '@/configs/themeConfig'

const AccountTypeStep = ({
  handleNext,
  handlePrev,
  stepIndex,
  totalSteps,
  activeStep,
  email,
  setActiveStep,
  onSubmitAccountTypeStep,
  gamePin = null,
  intialSearchParams={}
}) => {
  const [accountType, setAccountType] = useState('INDIVIDUAL')
  const [institutionType, setInstitutionType] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [ngoName, setNgoName] = useState('')
  const [roleInOrganization, setRoleInOrganization] = useState('')
  const [isFormValid, setIsFormValid] = useState(false)
  const [loading, setLoading] = useState({ validateReferralToken: false, submit: false })
  const [isReferralValid, setIsReferralValid] = useState(true) // Default to valid
  const [referrer, setReferrer] = useState(null)

  const searchParams = useSearchParams()

  const allSearchParams = {
    ...Object.fromEntries(searchParams.entries()),
    ...intialSearchParams
  }

  const ref = searchParams.get('ref')

  const isValidName = name => name.trim().length >= 3

  // Reset form fields when account type changes
  const resetFields = () => {
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

  useEffect(() => {
    const validateReferralToken = async () => {
      setLoading(prev => ({ ...prev, validateReferralToken: true }))
      if (!ref) {
        setLoading(prev => ({ ...prev, validateReferralToken: false }))
        return
      }
      try {
        // const result = await clientApi.getUserByReferralToken(ref)
        const result = await RestApi.get(`${API_URLS.v0.USER}?referralToken=${ref}`)
        setIsReferralValid(result?.status === 'success')
        setReferrer(result?.result)
      } catch (error) {
        console.error('Error validating referral token:', error)
        setIsReferralValid(false)
        setReferrer(null)
      } finally {
        setLoading(prev => ({ ...prev, validateReferralToken: false }))
      }
    }

    validateReferralToken()
  }, [ref])

  // Validate form based on the selected account type
  useEffect(() => {
    let isValid = false

    if (accountType === 'INSTITUTIONAL') {
      if (institutionType === 'BUSINESS') {
        isValid = isValidName(businessName) && isValidName(roleInOrganization)
      } else if (institutionType === 'NGO') {
        isValid = isValidName(ngoName) && isValidName(roleInOrganization)
      }
    } else {
      isValid = true
    }

    setIsFormValid(isValid)
  }, [accountType, institutionType, businessName, ngoName, roleInOrganization])

  const handleSubmit = async event => {
    event.preventDefault()
    setLoading(prev => ({ ...prev, submit: true }))

    let formData = {}

    if (accountType === 'INDIVIDUAL') {
      formData = { ...formData, accountType }
    } else if (accountType === 'INSTITUTIONAL') {
      formData = {
        ...formData,
        accountType: institutionType,
        organization: institutionType === 'BUSINESS' ? businessName : ngoName,
        roleInOrganization
      }
    }

    onSubmitAccountTypeStep(formData)
    setLoading(prev => ({ ...prev, submit: false }))
  }

  if (loading.validateReferralToken) {
    return <Loading />
  }

  if (!isReferralValid) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' padding={4}>
        <Stack
          spacing={3}
          alignItems='center'
          sx={{
            textAlign: 'center',
            maxWidth: 400,
            padding: 4,
            borderRadius: 2,
            boxShadow: 4,
            bgcolor: 'background.paper'
          }}
        >
          <Typography variant='h4' color='error' fontWeight='bold'>
            Invalid Referral Token
          </Typography>
          <Typography variant='body1' color='textSecondary'>
            The referral token you provided is invalid. Please check your link or register without a referral.
          </Typography>
          {/* <Link href='/auth/register' passHref> */}
          <Button
            component='a'
            href='/auth/register'
            variant='contained'
            color='primary'
            style={{ color: 'white' }}
            sx={{ mt: 2 }}
          >
            Back to Register
          </Button>
          {/* </Link> */}
        </Stack>
      </Box>
    )
  }

  return (
    <Box className='flex flex-col gap-10 items-center text-center w-full'>
      <Box>
        {isReferralValid && referrer && (
          <Box mb={6}>
            <Typography variant='h4'>Welcome to {themeConfig.templateName}! You have been referred by </Typography>
            <Typography variant='h4' style={{ color: '#6066d0' }}>
              {referrer.firstname} {referrer.lastname}
            </Typography>
            <Typography variant='body1'>
              {themeConfig.templateName} is a Quiz application designed to earn Rewards & Prizes while learning &
              spreading Indian Knowledge Systems
            </Typography>
          </Box>
        )}
        <Typography textAlign='center' fontSize={30} fontStyle={'italic'} color={'#6066d0'}>
          @Account Type
        </Typography>
      </Box>
      <Box
        component='form'
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, width: '100%', margin: 'auto' }}
      >
        <FormControl component='fieldset' disabled={loading.submit}>
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
                disabled={loading.submit}
              >
                <MenuItem value='BUSINESS'>Business</MenuItem>
                <MenuItem value='NGO'>NGO</MenuItem>
              </Select>
            </FormControl>

            {institutionType === 'BUSINESS' && (
              <>
                <TextField
                  fullWidth
                  label='Business Name'
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  error={businessName && !isValidName(businessName)}
                  helperText={businessName && !isValidName(businessName) ? 'Minimum 3 characters required' : ''}
                  required
                  disabled={loading.submit}
                />
                <TextField
                  fullWidth
                  label='Role in Organization'
                  value={roleInOrganization}
                  onChange={e => setRoleInOrganization(e.target.value)}
                  error={roleInOrganization && !isValidName(roleInOrganization)}
                  helperText={
                    roleInOrganization && !isValidName(roleInOrganization) ? 'Minimum 3 characters required' : ''
                  }
                  required
                  disabled={loading.submit}
                />
              </>
            )}

            {institutionType === 'NGO' && (
              <>
                <TextField
                  fullWidth
                  label='NGO Name'
                  value={ngoName}
                  onChange={e => setNgoName(e.target.value)}
                  error={ngoName && !isValidName(ngoName)}
                  helperText={ngoName && !isValidName(ngoName) ? 'Minimum 3 characters required' : ''}
                  required
                  disabled={loading.submit}
                />
                <TextField
                  fullWidth
                  label='Role in Organization'
                  value={roleInOrganization}
                  onChange={e => setRoleInOrganization(e.target.value)}
                  error={roleInOrganization && !isValidName(roleInOrganization)}
                  helperText={
                    roleInOrganization && !isValidName(roleInOrganization) ? 'Minimum 3 characters required' : ''
                  }
                  required
                  disabled={loading.submit}
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
          disabled={!isFormValid || loading.submit}
        >
          {loading.submit ? <CircularProgress size={24} /> : <b>GO!</b>}
        </Button>
      </Box>

      <Box className='flex justify-between w-full'>
        <Link href='/'>
          <Button
            // disabled={activeStep === 0}
            color='primary'
            variant='text'
            startIcon={<DirectionalIcon ltrIconClass='ri-arrow-left-line' />}
          >
            Back to Home
          </Button>
        </Link>
        <Link
          href={
            Object.keys(allSearchParams).length > 0
              ? `/auth/login?${new URLSearchParams(allSearchParams).toString()}`
              : '/auth/login'
          }
        >
          <Button color='primary' variant='text' endIcon={<DirectionalIcon className='ri-arrow-right-line' />}>
            Go to Login
          </Button>
        </Link>
        {/* <Button
            variant='contained'
            onClick={handleNext}
            endIcon={<DirectionalIcon ltrIconClass='ri-arrow-right-line' rtlIconClass='ri-arrow-left-line' />}
          >
            Next
          </Button> */}
      </Box>
    </Box>
  )
}

export default AccountTypeStep
