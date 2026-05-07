// MUI Imports
// Component Imports
/********** Standard imports.*********************/
import React, { useEffect, useState, useRef } from 'react'
import Grid from '@mui/material/Grid'
import { TextField, Button, FormControl, RadioGroup, Radio, FormControlLabel } from '@mui/material'
import CenterBox from '@components/CenterBox'
import Typography from '@mui/material/Typography'
import * as RestApi from '@/utils/restApiUtil'
import * as clientApi from '@/app/api/client/client.api'
import { API_URLS as ApiUrls } from '@/configs/apiConfig'
import { Box } from '@mui/material'
import { toast } from 'react-toastify'
import CircularProgress from '@mui/material/CircularProgress'
/********************************************/
import DirectionalIcon from '@components/DirectionalIcon'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { handleLoginAfterRegister } from '../../../../actions'
import MapAddressPicker from '@/components/google-maps/MapAddressPicker'

// Utils imports
import { getLocalizedUrl } from '@/utils/i18n'

const AddressInfoStep = ({
  handleNext,
  handlePrev,
  stepIndex,
  totalSteps,
  activeStep,
  firstName,
  setFirstName,
  gamePin = null,
  email,
  dataFromEmailStep
}) => {
  const searchParams = useSearchParams()
  const { lang: locale } = useParams()
  const router = useRouter()
  const [street, setStreet] = useState('')
  const [colony, setColony] = useState('')
  const [village, setVillage] = useState('')
  // Picked location from Google Map (search/click/drag). Stored alongside text fields.
  // Shape: { address, lat, lng, street, colony, village, region, country, countryCode, zipcode }
  const [pickedLocation, setPickedLocation] = useState(null)

  const [isButtonEnabled, setIsButtonEnabled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validateName = name => {
    return /^[A-Za-z]+$/.test(name) && name.length >= 3
  }

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.permissions.query({ name: 'geolocation' }).then(function (result) {
        console.log(result)
      })
    } else {
      console.log('Geolocation is not supported by this browser.')
    }
  }, [])

  const goToLogin = async () => {
    // Redirect to login page
    try {
      // await signOut();
      router.push(gamePin ? `/auth/login?gamePin=${gamePin}` : '/auth/login')
    } catch (error) {
      console.log('Error while Navigate to home', error)
    }
  }

  const handleStreetNameChange = e => {
    const value = e.target.value
    setStreet(value)
    if (!validateName(value)) {
      setErrors(prevErrors => ({
        ...prevErrors,
        firstName: 'Minimum 3 alphabetic characters are required'
      }))
    } else {
      setErrors(prevErrors => ({
        ...prevErrors,
        firstName: ''
      }))
    }
    setIsButtonEnabled(validateName(colony) && validateName(street))
  }

  const handleColonyNameChange = e => {
    const value = e.target.value
    setColony(value)
    if (!validateName(value)) {
      setErrors(prevErrors => ({
        ...prevErrors,
        lastName: 'Minimum 3 alphabetic characters are required'
      }))
    } else {
      setErrors(prevErrors => ({
        ...prevErrors,
        lastName: ''
      }))
    }
    setIsButtonEnabled(validateName(colony) && validateName(street))
  }

  const handleVillageNameChange = e => {
    const value = e.target.value
    setVillage(value)
    if (!validateName(value)) {
      setErrors(prevErrors => ({
        ...prevErrors,
        lastName: 'Minimum 3 alphabetic characters are required'
      }))
    } else {
      setErrors(prevErrors => ({
        ...prevErrors,
        lastName: ''
      }))
    }
    setIsButtonEnabled(validateName(colony) && validateName(village) && validateName(colony))
  }

  // Triggered when the user picks a location from the map (search / click / drag / current location).
  // We prefill the text fields from reverse-geocoded components when available so the existing
  // validation passes naturally; the formatted address + coordinates are persisted on save.
  const handleLocationChange = location => {
    if (!location) {
      setPickedLocation(null)
      return
    }
    setPickedLocation(location)

    if (location.street && validateName(location.street.replace(/[^A-Za-z]/g, ''))) {
      const sanitized = location.street.replace(/[^A-Za-z]/g, '')
      if (sanitized.length >= 3) setStreet(sanitized)
    }
    if (location.colony && validateName(location.colony.replace(/[^A-Za-z]/g, ''))) {
      const sanitized = location.colony.replace(/[^A-Za-z]/g, '')
      if (sanitized.length >= 3) setColony(sanitized)
    }
    if (location.village && validateName(location.village.replace(/[^A-Za-z]/g, ''))) {
      const sanitized = location.village.replace(/[^A-Za-z]/g, '')
      if (sanitized.length >= 3) setVillage(sanitized)
    }
    setErrors({})
  }

  const handleSaveName = () => {
    // Add verification logic here
    updateAddressDetails()
  }

  async function handleSkip() {
    setLoading(true)

    const redirectURL = searchParams.get('redirectTo') ?? `/home`
    console.log('RedirectURL: ', redirectURL)
    console.log('locale: ', locale)
    const localizedRedirectUrl = getLocalizedUrl(redirectURL, locale)
    console.log('localizedRedirectUrl: ', localizedRedirectUrl)

    try {
      await handleLoginAfterRegister(email, dataFromEmailStep?.password)
      router.push(gamePin ? `/game/join?gamePin=${gamePin}` : localizedRedirectUrl)
    } catch (error) {
      console.log('Error while handling login after register', error)
    } finally {
      setLoading(false)
    }
  }

  const updateAddressDetails = async () => {
    setLoading(true)
    try {
      // Build payload. Include map-derived fields only when a location was picked.
      // `coordinates` follows MongoDB 2d-index convention: [longitude, latitude].
      const payload = {
        email,
        street,
        colony,
        village
      }

      if (pickedLocation && typeof pickedLocation.lat === 'number' && typeof pickedLocation.lng === 'number') {
        payload.address = pickedLocation.address || ''
        payload.coordinates = [pickedLocation.lng, pickedLocation.lat]

        // Opportunistically persist any region/country/zip the picker resolved.
        if (pickedLocation.country) payload.country = pickedLocation.country
        if (pickedLocation.countryCode) payload.countryCode = pickedLocation.countryCode
        if (pickedLocation.region) payload.region = pickedLocation.region
        if (pickedLocation.zipcode) payload.zipcode = pickedLocation.zipcode
      }

      const result = await RestApi.put(ApiUrls.v0.USERS_PROFILE, payload)
      if (result?.status === 'success') {
        // toast.success('Updated Address Details Successfully.')
        // handleNext()
        // goToLogin()
        handleSkip()
      } else {
        console.error(result?.message)
        toast.error(result?.message || 'Updating address details failed, Please retry')
      }
    } catch (error) {
      console.error('Error occurred while updating address details', error)
      toast.error('Error occurred while updating address details, Please retry')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Grid container spacing={5}>
        <Grid item xs={12}>
          <div style={{ margin: 'auto', display: 'flex', justifyContent: 'center' }}>
            <Typography fontSize={30} fontStyle={'italic'} color={'#6066d0'}>
              @Address
            </Typography>
          </div>
        </Grid>
        <Grid item xs={12}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <Typography fontSize={16} color={'blueviolet'}>
              {`"To get specific Quizzes, Events & News in your area."`}
            </Typography>
          </div>
        </Grid>

        <Grid item xs={12}>
          <MapAddressPicker value={pickedLocation} onChange={handleLocationChange} height={300} />
          {pickedLocation?.address ? (
            <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 1 }}>
              <strong>Selected:</strong> {pickedLocation.address}
            </Typography>
          ) : null}
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label='Street Name'
            fullWidth
            variant='outlined'
            value={street}
            onChange={handleStreetNameChange}
            error={errors.street ? true : false}
            helperText={errors.street}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label='Colony Name'
            fullWidth
            variant='outlined'
            value={colony}
            onChange={handleColonyNameChange}
            error={errors.colony ? true : false}
            helperText={errors.colony}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label='Village/City Name'
            fullWidth
            maxLength={30}
            maxWidth={30}
            variant='outlined'
            value={village}
            onChange={handleVillageNameChange}
            error={errors.village ? true : false}
            helperText={errors.village}
          />
        </Grid>

        <Grid item xs={12}>
          {loading ? (
            <CenterBox>
              <CircularProgress />{' '}
            </CenterBox>
          ) : (
            <CenterBox>
              <Button
                variant='contained'
                color={'primary'}
                component='button'
                onClick={handleSaveName}
                disabled={(() => {
                  if (loading) return true
                  if (errors.street || errors.village || errors.colony) return true
                  // If user picked a location on the map, allow proceeding even when
                  // some text fields are still empty (we have address + coordinates).
                  if (pickedLocation?.lat && pickedLocation?.lng) return false
                  return street?.length < 3 || colony?.length < 3 || village?.length < 3
                })()}
              >
                <span style={{ color: '#ffff', fontStyle: 'italic', letterSpacing: '1px' }}>
                  <b>GO!</b>
                </span>
              </Button>
            </CenterBox>
          )}
        </Grid>

        {/* <Grid item xs={12} className='flex justify-end'>
          <Button
            disabled={activeStep === 0}
            variant='outlined'
            color='secondary'
            onClick={handlePrev}
            startIcon={<DirectionalIcon ltrIconClass='ri-arrow-left-line' rtlIconClass='ri-arrow-right-line' />}
          >
            Previous
          </Button>
          <Link href={gamePin ? `/auth/login?gamePin=${gamePin}` : '/auth/login'}>
            <Button
              variant='contained'
              onClick={handleSkip}
              disabled={loading}
              endIcon={<DirectionalIcon ltrIconClass='ri-arrow-right-line' rtlIconClass='ri-arrow-left-line' />}
            >
              Skip
            </Button>
          </Link>
        </Grid> */}
      </Grid>
    </>
  )
}

export default AddressInfoStep
