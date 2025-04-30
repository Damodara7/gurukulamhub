import React, { useEffect, useState } from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import { Grid, TextField } from '@mui/material'
import { CountryRegionData } from '../../../../data/regions'
import Box from '@mui/material/Box'

const CountryRegionDropdown = ({
  setSelectedCountry,
  selectedCountryObject,
  setSelectedCountryObject,
  onCountryChange,
  error=false
}) => {
  const [countriesWithRegions, setCountriesWithRegions] = useState([])

  // Function to remove tilde and suffix from a region string
  const removeSuffix = region => region.split('~')[0].toUpperCase()

  // Parse the CountryRegionData into a structured format
  const parseCountryRegionData = () =>
    CountryRegionData.map(([country, countryCode, regions]) => ({
      country,
      countryCode,
      regions: regions.split('|').map(removeSuffix)
    }))

  // Initialize countries with parsed data
  useEffect(() => {
    const parsedData = parseCountryRegionData()
    setCountriesWithRegions(parsedData)

    // Set default selection to India
    const indiaObject = parsedData.find(item => item.countryCode === 'IN')
    if (indiaObject) {
      setSelectedCountry(indiaObject.country)
      setSelectedCountryObject(indiaObject)
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
