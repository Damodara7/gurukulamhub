import React, { useMemo } from 'react'
import { Autocomplete, Grid, TextField, FormControl, Typography } from '@mui/material'
import CountryRegionDropdown from '../../auth/register-multi-steps/CountryRegionDropdown'
import AutocompletePostOffice from '../../auth/register-multi-steps/AutocompletePostOffice'
import AutocompletePincode from '../../auth/register-multi-steps/AutocompletePincode'
import MapAddressPicker from '@/components/google-maps/MapAddressPicker'
import { getIanaTimezonesForCountry } from '@/utils/locationTimezones'

function AddressInfo({
  formData,
  handleFormChange,
  handleMapAddressChange = () => {},
  setSelectedRegion,
  setCountryCode,
  handleChangeCountry,
  selectedCountryObject,
  selectedCountry,
  setSelectedCountry,
  setSelectedCountryObject,
  selectedRegion,
  postOffices,
  fetchPostOffices,
  fetchPinCodesForState,
  loadingPincodesOrPostOffices,
  selectedZipcode,
  setSelectedZipcode,
  pinCodes,
  setSelectedLocality,
  selectedLocality,
  setZipcodeFromDb,
  setLocalityFromDb
}) {
  const isIndia = selectedCountryObject?.country === 'India'

  const timezoneOptions = useMemo(
    () => getIanaTimezonesForCountry(selectedCountryObject?.countryCode),
    [selectedCountryObject?.countryCode]
  )

  const hasLegacyLocationDetail = !!(
    selectedRegion ||
    formData.pincode ||
    formData.postoffice ||
    formData.zipcode ||
    formData.locality
  )
  const showRegionStep =
    !!selectedCountryObject?.country && (!!formData.timezone || hasLegacyLocationDetail)

  const clearLocationDependents = () => {
    setSelectedRegion('')
    setSelectedZipcode('')
    setSelectedLocality('')
    setZipcodeFromDb('')
    setLocalityFromDb('')
    handleFormChange('region', '')
    handleFormChange('pincode', '')
    handleFormChange('postoffice', '')
    handleFormChange('zipcode', '')
    handleFormChange('locality', '')
  }

  const mapPickerValue = useMemo(() => {
    if (Array.isArray(formData.coordinates) && formData.coordinates.length >= 2) {
      return {
        lat: formData.coordinates[1],
        lng: formData.coordinates[0],
        address: formData.address || ''
      }
    }
    if (formData.address) {
      return { address: formData.address }
    }
    return null
  }, [formData.coordinates, formData.address])

  return (
    <>
      <Grid item xs={12}>
        <MapAddressPicker value={mapPickerValue} onChange={handleMapAddressChange} height={300} />
        {formData.address ? (
          <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 1 }}>
            <strong>Selected on map:</strong> {formData.address}
          </Typography>
        ) : null}
      </Grid>

      {/* Country */}
      <Grid item xs={12} sm={6}>
        <CountryRegionDropdown
          selectedCountryObject={selectedCountryObject}
          setSelectedCountryObject={setSelectedCountryObject}
          selectedCountry={selectedCountry}
          setSelectedCountry={setSelectedCountry}
          setCountryCode={setCountryCode}
          onCountryChange={handleChangeCountry}
        />
      </Grid>

      {selectedCountryObject?.country ? (
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <Autocomplete
              autoHighlight
              options={timezoneOptions}
              value={formData.timezone || null}
              onChange={(e, newValue) => {
                handleFormChange('timezone', newValue || '')
                clearLocationDependents()
              }}
              getOptionLabel={option => option || ''}
              renderInput={params => (
                <TextField
                  {...params}
                  label='Timezone (IANA)'
                  helperText='Used for games and events in your local time.'
                  inputProps={{ ...params.inputProps, autoComplete: 'off' }}
                />
              )}
              noOptionsText='No timezones for this country'
            />
          </FormControl>
        </Grid>
      ) : null}

      {/* Region */}
      {showRegionStep ? (
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <Autocomplete
              autoHighlight
              onChange={(e, newValue) => {
                setSelectedRegion(newValue)
                handleFormChange('region', newValue)
                // Clear dependent fields when region changes
                setSelectedZipcode('')
                setSelectedLocality('')
                // Clear both pincode/postoffice and zipcode/locality fields
                handleFormChange('pincode', '')
                handleFormChange('postoffice', '')
                handleFormChange('zipcode', '')
                handleFormChange('locality', '')
                // Clear database values to prevent them from being reloaded
                setZipcodeFromDb('')
                setLocalityFromDb('')
                // Fetch pincodes for the selected state
                if (newValue) {
                  fetchPinCodesForState(newValue)
                }
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
                    autoComplete: 'autocomplete-region-select'
                  }}
                />
              )}
              value={selectedRegion}
            />
          </FormControl>
        </Grid>
      ) : null}

      {/* PinCode */}
      {isIndia && selectedRegion ? (
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <AutocompletePincode
              fetchPostOffices={fetchPostOffices}
              loading={loadingPincodesOrPostOffices}
              pinCodes={pinCodes}
              selectedZipcode={selectedZipcode}
              setSelectedZipcode={value => {
                setSelectedZipcode(value)
                // The useEffect in AccountDetails will handle formData.pincode
              }}
            />
          </FormControl>
        </Grid>
      ) : null}

      {/* Locality - PostOffice */}
      {isIndia && selectedZipcode ? (
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <AutocompletePostOffice
              postOffices={postOffices}
              loading={loadingPincodesOrPostOffices}
              selectedLocality={selectedLocality}
              setSelectedLocality={value => {
                setSelectedLocality(value)
                // The useEffect in AccountDetails will handle formData.postoffice
              }}
            />
          </FormControl>
        </Grid>
      ) : null}

      {/* Additional fields for India - Street, Colony, Village */}
      {isIndia && selectedLocality ? (
        <>
          {/* Street */}
          <Grid item xs={12} sm={6}>
            <TextField
              name='street'
              fullWidth
              label='Street'
              value={formData.street}
              placeholder='Street'
              onChange={e => handleFormChange('street', e.target.value)}
            />
          </Grid>

          {/* Colony */}
          <Grid item xs={12} sm={6}>
            <TextField
              name='colony'
              fullWidth
              label='Colony'
              value={formData.colony}
              placeholder='Colony'
              onChange={e => handleFormChange('colony', e.target.value)}
            />
          </Grid>

          {/* Village */}
          <Grid item xs={12} sm={6}>
            <TextField
              name='village'
              fullWidth
              label='Village'
              value={formData.village}
              placeholder='Village'
              onChange={e => handleFormChange('village', e.target.value)}
            />
          </Grid>
        </>
      ) : null}

      {!isIndia && showRegionStep && selectedRegion ? (
        <>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <TextField
                value={formData.zipcode}
                fullWidth
                label='Enter Your Zip Code'
                onChange={e => {
                  handleFormChange('zipcode', e.target.value)
                }}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <TextField
                value={formData.locality}
                onChange={e => {
                  handleFormChange('locality', e.target.value)
                }}
                fullWidth
                label='Enter Your Locality/City/Village'
              />
            </FormControl>
          </Grid>
        </>
      ) : null}
    </>
  )
}

export default AddressInfo
