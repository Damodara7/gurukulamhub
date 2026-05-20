// MUI Imports
/********** Standard imports.*********************/
import React, { useEffect, useMemo, useState } from 'react'
import Grid from '@mui/material/Grid'
import { TextField, Button, FormControl, Autocomplete } from '@mui/material'
import CenterBox from '@components/CenterBox'
import Typography from '@mui/material/Typography'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS as ApiUrls } from '@/configs/apiConfig'
import CircularProgress from '@mui/material/CircularProgress'
/********************************************/
import AutocompletePostOffice from './AutocompletePostOffice'
import AutocompletePincode from './AutocompletePincode'
import CountryRegionDropdown from './CountryRegionDropdown'
import { getIanaTimezonesForCountry } from '@/utils/locationTimezones'

const StepCountryZipInfo = ({ handleNext, email }) => {
  const [loading, setLoading] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedCountryObject, setSelectedCountryObject] = useState(null)
  const [countryCode, setCountryCode] = useState('')
  const [selectedTimezone, setSelectedTimezone] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedZipcode, setSelectedZipcode] = useState('')
  const [selectedLocality, setSelectedLocality] = useState('')

  const [postOffices, setPostOffices] = useState([])
  const [loadingPincodesOrPostOffices, setLoadingPincodesOrPostOffices] = useState(false)
  const [pinCodes, setPinCodes] = useState([])

  const isIndia = selectedCountryObject?.country === 'India'

  const timezoneOptions = useMemo(
    () => getIanaTimezonesForCountry(selectedCountryObject?.countryCode),
    [selectedCountryObject?.countryCode]
  )

  useEffect(() => {
    if (timezoneOptions.length === 1 && !selectedTimezone) {
      setSelectedTimezone(timezoneOptions[0])
    }
  }, [timezoneOptions, selectedTimezone])

  const resetLocationDependents = () => {
    setSelectedRegion('')
    setSelectedZipcode('')
    setSelectedLocality('')
    setPinCodes([])
    setPostOffices([])
  }

  const updateCountryDetails = async () => {
    setLoading(true)
    try {
      const payload = {
        email,
        country: selectedCountry,
        countryCode,
        region: selectedRegion,
        timezone: selectedTimezone
      }

      if (isIndia) {
        payload.pincode = selectedZipcode
        payload.postoffice = selectedLocality
        payload.zipcode = ''
        payload.locality = ''
      } else {
        payload.zipcode = selectedZipcode
        payload.locality = selectedLocality
        payload.pincode = ''
        payload.postoffice = ''
      }

      const result = await RestApi.put(ApiUrls.v0.USERS_PROFILE, payload)

      if (result?.status === 'success') {
        handleNext()
      }
    } catch (error) {
      console.error('Error updating country details:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPinCodesForState = async selectedStateName => {
    if (!selectedStateName) {
      setPinCodes([])
      setPostOffices([])
      return
    }
    setLoadingPincodesOrPostOffices(true)
    try {
      const response = await fetch(`/api/pincodes/${encodeURIComponent(selectedStateName)}`)
      const data = await response.json()
      setPinCodes(data?.pinCodes || [])
    } catch (e) {
      console.error('Error fetching pincodes:', e)
    } finally {
      setLoadingPincodesOrPostOffices(false)
    }
  }

  const fetchPostOffices = async pin => {
    if (!pin) {
      setPostOffices([])
      return
    }
    setLoadingPincodesOrPostOffices(true)
    try {
      const response = await fetch(`/api/localities/${encodeURIComponent(pin)}`)
      const data = await response.json()
      setPostOffices(data?.localities || [])
    } catch (error) {
      console.error('Error fetching post offices:', error)
    } finally {
      setLoadingPincodesOrPostOffices(false)
    }
  }

  function handleChangeCountry(countryValue) {
    setCountryCode(countryValue?.countryCode || '')
    setSelectedTimezone('')
    resetLocationDependents()
  }

  const canSubmit =
    selectedCountry &&
    selectedTimezone &&
    selectedRegion &&
    selectedZipcode &&
    selectedLocality

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <div style={{ margin: 'auto', display: 'flex', justifyContent: 'center' }}>
            <Typography fontSize={30} fontStyle={'italic'} color={'#6066d0'}>
              @Country
            </Typography>
          </div>
        </Grid>
        <Grid item xs={12}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <Typography fontSize={16} color={'blueviolet'}>
              {`"To get localized Quizzes, Events & News."`}
            </Typography>
          </div>
        </Grid>

        <Grid item xs={12} sm={6}>
          <CountryRegionDropdown
            setSelectedCountry={setSelectedCountry}
            selectedCountryObject={selectedCountryObject}
            setSelectedCountryObject={setSelectedCountryObject}
            onCountryChange={handleChangeCountry}
          />
        </Grid>

        {selectedCountryObject?.country ? (
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <Autocomplete
                autoHighlight
                options={timezoneOptions}
                value={selectedTimezone || null}
                onChange={(e, newValue) => {
                  setSelectedTimezone(newValue || '')
                  resetLocationDependents()
                }}
                getOptionLabel={option => option || ''}
                renderInput={params => (
                  <TextField
                    {...params}
                    label='Timezone (IANA)'
                    helperText='Pick your local timezone for quizzes and games in your area.'
                    inputProps={{ ...params.inputProps, autoComplete: 'off' }}
                  />
                )}
                noOptionsText='No timezones for this country'
              />
            </FormControl>
          </Grid>
        ) : null}

        {selectedCountryObject?.country && selectedTimezone ? (
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <Autocomplete
                autoHighlight
                onChange={(e, newValue) => {
                  setSelectedRegion(newValue || '')
                  setPinCodes([])
                  setPostOffices([])
                  setSelectedLocality('')
                  setSelectedZipcode('')
                  if (newValue) fetchPinCodesForState(newValue)
                }}
                id='autocomplete-region-select'
                options={selectedCountryObject?.regions || []}
                getOptionLabel={option => option || ''}
                renderInput={params => (
                  <TextField
                    {...params}
                    key={params.id}
                    label='Choose a region'
                    inputProps={{
                      ...params.inputProps,
                      autoComplete: 'new-password'
                    }}
                  />
                )}
                value={selectedRegion || null}
              />
            </FormControl>
          </Grid>
        ) : null}

        {isIndia && selectedRegion ? (
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <AutocompletePincode
                fetchPostOffices={fetchPostOffices}
                loading={loadingPincodesOrPostOffices}
                pinCodes={pinCodes}
                selectedZipcode={selectedZipcode}
                setSelectedZipcode={val => {
                  setSelectedZipcode(val || '')
                  setSelectedLocality('')
                }}
              />
            </FormControl>
          </Grid>
        ) : null}

        {isIndia && selectedZipcode ? (
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <AutocompletePostOffice
                postOffices={postOffices}
                selectedLocality={selectedLocality}
                loading={loadingPincodesOrPostOffices}
                setSelectedLocality={setSelectedLocality}
              />
            </FormControl>
          </Grid>
        ) : null}

        {!isIndia && selectedCountryObject?.country && selectedTimezone && selectedRegion ? (
          <>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <TextField
                  value={selectedZipcode}
                  fullWidth
                  label='Enter Your Zip Code'
                  onChange={e => setSelectedZipcode(e.target.value)}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <TextField
                  value={selectedLocality}
                  onChange={e => setSelectedLocality(e.target.value)}
                  fullWidth
                  label='Enter Your Locality/City/Village'
                />
              </FormControl>
            </Grid>
          </>
        ) : null}

        <Grid item xs={12}>
          {loading ? (
            <CenterBox>
              <CircularProgress />
            </CenterBox>
          ) : (
            <CenterBox>
              <Button
                variant='contained'
                color='primary'
                component='button'
                disabled={!canSubmit}
                onClick={updateCountryDetails}
              >
                <span style={{ color: '#ffff', fontStyle: 'italic', letterSpacing: '1px' }}>
                  <b>GO!</b>
                </span>
              </Button>
            </CenterBox>
          )}
        </Grid>
      </Grid>
    </>
  )
}

export default StepCountryZipInfo
