// MUI Imports
/********** Standard imports.*********************/
import React, { useEffect, useState } from 'react'
import Grid from '@mui/material/Grid'
import { TextField, Button, FormControl, RadioGroup, Radio, FormControlLabel, Link, Autocomplete } from '@mui/material'
import CenterBox from '@components/CenterBox'
import Typography from '@mui/material/Typography'
import * as RestApi from '@/utils/restApiUtil'
import * as clientApi from '@/app/api/client/client.api'
import { API_URLS as ApiUrls } from '@/configs/apiConfig'
import { toast } from 'react-toastify'
import CircularProgress from '@mui/material/CircularProgress'
/********************************************/
import AutocompletePostOffice from './AutocompletePostOffice'
import AutocompletePincode from './AutocompletePincode'
import 'react-phone-input-2/lib/style.css'
// Component Imports
import DirectionalIcon from '@components/DirectionalIcon'
import CountryRegionDropdown from './CountryRegionDropdown'

const StepCountryZipInfo = ({ handleNext, handlePrev, stepIndex, totalSteps, activeStep, email }) => {
  // const [selectedPincode, setSelectedPincode] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedCountryObject, setSelectedCountryObject] = useState(null)
  const [countryCode, setCountryCode] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedZipcode, setSelectedZipcode] = useState('')
  const [selectedLocality, setSelectedLocality] = useState('')

  const [postOffices, setPostOffices] = useState([])
  const [loadingPincodesOrPostOffices, setLoadingPincodesOrPostOffices] = useState(false)
  const [pinCodes, setPinCodes] = useState([])

  //https://api.postalpincode.in/pincode/500091

  const updateCountryDetails = async () => {
    setLoading(true)
    try {
      const result = await RestApi.put(ApiUrls.v0.USERS_PROFILE, {
        email,
        country: selectedCountry,
        countryCode,
        region: selectedRegion,
        zipcode: selectedZipcode,
        locality: selectedLocality
      })
      // const result = await clientApi.updateUserProfile(email, {
      //   country: selectedCountry,
      //   region: selectedRegion,
      //   zipcode: selectedZipcode,
      //   locality: selectedLocality
      // })

      if (result?.status == 'success') {
        // toast.success('Updated Country Details Successfully.')
        handleNext()
      } else {
        // toast.error(result?.message || 'Failed to update country details.')
      }
    } catch (error) {
      // toast.error('Error occurred while updating country details, Please retry')
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
    console.log('Selected selectedStateName:', selectedStateName)
    setLoadingPincodesOrPostOffices(true)
    try {
      const response = await fetch(`/api/pincodes/${selectedStateName}`)

      const data = await response.json()
      console.log('pinCodes data...', data)
      setPinCodes(data?.pinCodes || [])
    } catch (e) {
      setLoadingPincodesOrPostOffices(false)
    } finally {
      setLoadingPincodesOrPostOffices(false)
    }
  }

  const fetchPostOffices = async selectedZipcode => {
    if (!selectedZipcode) {
      setPostOffices([])
      return
    }
    console.log('Selected selectedZipcode:', selectedZipcode?.Pincode)
    setLoadingPincodesOrPostOffices(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/localities/${selectedZipcode}`)

      const data = await response.json()
      console.log('pincode data...', data)

      setPostOffices(data?.localities || []) // Assuming data is an array of post office objects
    } catch (error) {
      console.error('Error fetching post offices:', error)
    } finally {
      setLoadingPincodesOrPostOffices(false)
    }
  }

  function handleChangeCountry(countryValue) {
    setSelectedRegion('') // Reset region when country changes
    setCountryCode(countryValue?.countryCode || '')
  }

  return (
    <>
      <Grid container spacing={2}>
        {/* <Typography>Enter your Country details</Typography> */}
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
          {/* <AutocompleteCountry ></AutocompleteCountry> */}
          {/* <RegionDropdown></RegionDropdown> */}
          <CountryRegionDropdown
            setSelectedCountry={setSelectedCountry}
            selectedCountryObject={selectedCountryObject}
            setSelectedCountryObject={setSelectedCountryObject}
            onCountryChange={handleChangeCountry}
          />
        </Grid>

        {selectedCountryObject?.country && (
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <Autocomplete
                autoHighlight
                onChange={(e, newValue) => {
                  setSelectedRegion(newValue)
                  setPinCodes([])
                  setPostOffices([])
                  setSelectedLocality('')
                  setSelectedZipcode('')
                  fetchPinCodesForState(newValue)
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
                value={selectedRegion}
              />
            </FormControl>
          </Grid>
        )}

        {selectedCountryObject?.country === 'India' && (
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <AutocompletePincode
                fetchPostOffices={fetchPostOffices}
                loading={loadingPincodesOrPostOffices}
                pinCodes={pinCodes}
                selectedZipcode={selectedZipcode}
                setSelectedZipcode={setSelectedZipcode}
              />
            </FormControl>
          </Grid>
        )}
        {selectedCountryObject?.country === 'India' && (
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
        )}
        {selectedCountryObject?.country !== 'India' && (
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <TextField
                value={selectedZipcode}
                fullWidth
                label='Enter Your Zip Code'
                onChange={e => {
                  setSelectedZipcode(e.target.value)
                }}
              />
            </FormControl>
          </Grid>
        )}
        {selectedCountryObject?.country !== 'India' && (
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <TextField
                value={selectedLocality}
                onChange={e => {
                  setSelectedLocality(e.target.value)
                }}
                fullWidth
                label='Enter Your Locality/City/Village'
              />
            </FormControl>
          </Grid>
        )}
        <Grid item xs={12}>
          {loading ? (
            <CenterBox>
              <CircularProgress />
            </CenterBox>
          ) : (
            <CenterBox>
              <Button
                variant='contained'
                color={'primary'}
                component='button'
                disabled={!(selectedCountry && selectedRegion && selectedZipcode && selectedLocality)}
                onClick={updateCountryDetails}
                //disabled={errors.firstName || errors.lastName || lastName.length < 1 || firstName.length < 1}
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
          <Button
            variant='contained'
            onClick={handleNext}
            endIcon={<DirectionalIcon ltrIconClass='ri-arrow-right-line' rtlIconClass='ri-arrow-left-line' />}
          >
            Skip
          </Button>
        </Grid> */}
      </Grid>
    </>
  )
}

export default StepCountryZipInfo
