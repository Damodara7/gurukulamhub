import React from 'react'
import { Autocomplete, Divider, Grid, InputLabel, Select, TextField, FormControl, MenuItem } from '@mui/material'
import CountryRegionDropdown from '../../auth/register-multi-steps/CountryRegionDropdown'
import AutocompletePostOffice from '../../auth/register-multi-steps/AutocompletePostOffice'
import AutocompletePincode from '../../auth/register-multi-steps/AutocompletePincode'

const timezoneOptions = [
  { value: 'gmt-12', label: '(GMT-12:00) International Date Line West' },
  { value: 'gmt-11', label: '(GMT-11:00) Midway Island, Samoa' },
  { value: 'gmt-10', label: '(GMT-10:00) Hawaii' },
  { value: 'gmt-09', label: '(GMT-09:00) Alaska' },
  { value: 'gmt-08', label: '(GMT-08:00) Pacific Time (US & Canada)' },
  { value: 'gmt-08-baja', label: '(GMT-08:00) Tijuana, Baja California' },
  { value: 'gmt-07', label: '(GMT-07:00) Chihuahua, La Paz, Mazatlan' },
  { value: 'gmt-07-mt', label: '(GMT-07:00) Mountain Time (US & Canada)' },
  { value: 'gmt-06', label: '(GMT-06:00) Central America' },
  { value: 'gmt-06-ct', label: '(GMT-06:00) Central Time (US & Canada)' },
  { value: 'gmt-06-mc', label: '(GMT-06:00) Guadalajara, Mexico City, Monterrey' },
  { value: 'gmt-06-sk', label: '(GMT-06:00) Saskatchewan' },
  { value: 'gmt-05', label: '(GMT-05:00) Bogota, Lima, Quito, Rio Branco' },
  { value: 'gmt-05-et', label: '(GMT-05:00) Eastern Time (US & Canada)' },
  { value: 'gmt-05-ind', label: '(GMT-05:00) Indiana (East)' },
  { value: 'gmt-04', label: '(GMT-04:00) Atlantic Time (Canada)' },
  { value: 'gmt-04-clp', label: '(GMT-04:00) Caracas, La Paz' }
]

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
  loadingPincodesOrPostOffices,
  selectedZipcode,
  setSelectedZipcode,
  pinCodes,
  setSelectedLocality,
  selectedLocality
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
              onChange={(e, newValue) => setSelectedRegion(newValue)}
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

      {/* Locality - PostOffice */}
      {selectedCountryObject?.country === 'India' && selectedZipcode && (
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <AutocompletePostOffice
              postOffices={postOffices}
              loading={loadingPincodesOrPostOffices}
              selectedLocality={selectedLocality}
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
            ></TextField>
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
            ></TextField>
          </FormControl>
        </Grid>
      )}

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

      {/* TimeZone */}
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>TimeZone</InputLabel>
          <Select
            name='timezone'
            label='TimeZone'
            value={formData.timezone}
            onChange={e => handleFormChange('timezone', e.target.value)}
            MenuProps={{ PaperProps: { style: { maxHeight: 250 } } }}
          >
            {timezoneOptions.map(each => (
              <MenuItem key={each.value} value={each.value}>
                {each.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </>
  )
}

export default AddressInfo
