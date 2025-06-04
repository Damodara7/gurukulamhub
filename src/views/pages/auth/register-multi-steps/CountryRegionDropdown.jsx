import React, { useEffect, useState } from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import { Grid, TextField } from '@mui/material'
import { CountryRegionData } from '../../../../data/regions'
import Box from '@mui/material/Box'
import { parsedCountryRegionData } from '@/utils/countryRegionUtil'

const CountryRegionDropdown = ({
  setSelectedCountry = () => {},
  selectedCountryObject,
  setSelectedCountryObject = () => {},
  onCountryChange = () => {},
  defaultCountryCode = 'IN',
  error = false
}) => {
  const [countriesWithRegions, setCountriesWithRegions] = useState([])

  // Initialize countries with parsed data
  useEffect(() => {
    const parsedData = parsedCountryRegionData
    setCountriesWithRegions(parsedData)

    // Set default selection to India
    if (defaultCountryCode) {
      const indiaObject = parsedData.find(item => item.countryCode === defaultCountryCode)
      if (indiaObject) {
        setSelectedCountry(indiaObject.country)
        setSelectedCountryObject(indiaObject)
      }
    }
  }, [])

  // Handle country change
  const handleCountryChange = (event, newValue) => {
    console.log({ selectedCountry: newValue })
    setSelectedCountry(newValue?.country || '')
    setSelectedCountryObject(newValue || null)
    onCountryChange(newValue)
  }

  return (
    <Autocomplete
      autoHighlight
      onChange={handleCountryChange}
      id='autocomplete-country-select'
      options={countriesWithRegions}
      getOptionLabel={option => option.country || ''}
      renderOption={(props, option) => (
        <Box component='li' {...props} key={option.countryCode}>
          <img
            alt=''
            width='20'
            loading='lazy'
            src={`https://flagcdn.com/w20/${option.countryCode.toLowerCase()}.png`}
            srcSet={`https://flagcdn.com/w40/${option.countryCode.toLowerCase()}.png 2x`}
          />
          {option.country} ({option.countryCode})
        </Box>
      )}
      renderInput={params => (
        <TextField
          {...params}
          label='Choose a country'
          error={error}
          helperText={error && !selectedCountryObject ? 'Please select country' : ''}
          inputProps={{
            ...params.inputProps,
            autoComplete: 'country' // Disable autocomplete
          }}
        />
      )}
      value={selectedCountryObject || null}
    />
  )
}

export default CountryRegionDropdown
