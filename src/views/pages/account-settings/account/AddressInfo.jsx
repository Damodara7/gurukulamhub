import React from 'react'
import { Autocomplete, Divider, Grid, InputLabel, Select, TextField, FormControl, MenuItem } from '@mui/material'
import CountryRegionDropdown from '../../auth/register-multi-steps/CountryRegionDropdown'
import AutocompletePostOffice from '../../auth/register-multi-steps/AutocompletePostOffice'
import AutocompletePincode from '../../auth/register-multi-steps/AutocompletePincode'

function AddressInfo({
  formData,
  handleFormChange,
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
  setLocalityFromDb,
  filteredTimezones
}) {
  return (
    <>
      {/* ----Address---- */}
      <Grid item xs={12} marginLeft={'0.25rem'}>
        <Divider> Address </Divider>
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

      {/* Region */}
      {selectedCountryObject?.country && (
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
      )}

      {/* PinCode */}
      {selectedCountryObject?.country === 'India' && selectedRegion && (
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
      )}

      {/* Locality - PostOffice */}
      {selectedCountryObject?.country === 'India' && selectedZipcode && (
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
      )}

      {/* Additional fields for India - Street, Colony, Village */}
      {selectedCountryObject?.country === 'India' && selectedLocality && (
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
      )}

      {selectedCountryObject?.country && selectedCountryObject?.country !== 'India' && (
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
      )}

      {selectedCountryObject?.country && selectedCountryObject?.country !== 'India' && (
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <TextField
              value={formData.locality}
              onChange={e => {
                handleFormChange('locality', e.target.value)
              }}
              fullWidth
              label='Enter Your Locality/City/Village'
            ></TextField>
          </FormControl>
        </Grid>
      )}

      {/* TimeZone */}
      {/* <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>TimeZone</InputLabel>
          <Select
            name='timezone'
            label='TimeZone'
            value={formData.timezone}
            onChange={e => handleFormChange('timezone', e.target.value)}
            MenuProps={{ PaperProps: { style: { maxHeight: 250 } } }}
          >
            {filteredTimezones &&
              filteredTimezones.length > 0 &&
              filteredTimezones.map(timezone => (
                <MenuItem key={timezone.timezoneWithGMT} value={timezone.timezoneWithGMT}>
                  {timezone.timezoneWithGMT} - {timezone.country}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      </Grid> */}
    </>
  )
}

export default AddressInfo
