'use client'
import React, { useState , useEffect } from 'react'
import {
  Button,
  Menu,
  MenuItem,
  Box,
  Typography,
  TextField,
  Chip,
  Stack,
  Divider,
  FormControlLabel,
  Checkbox,
  Grid,
  FormControl,
  Autocomplete
} from '@mui/material'
import { ArrowDropDown as ArrowDropDownIcon, Close as CloseIcon } from '@mui/icons-material'
import * as RestApi from '@/utils/restApiUtil'
import CountryRegionDropdown from '@/views/pages/auth/register-multi-steps/CountryRegionDropdown'
const GroupByFilter = ( { users , onFilterChange}) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const [groupBy, setGroupBy] = useState(null)
  const [filters, setFilters] = useState({
    age: { min: '', max: '' },
    location: { country: '', state: '', city: '' },
    gender: { male: false, female: false, other: false }
  })
  const [selectedFilters, setSelectedFilters] = useState([])
  const [selectedCountryObject, setSelectedCountryObject] = useState(null)
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [cityOptions, setCityOptions] = useState([])
  const [loading, setLoading] = useState({
    fetchCities: false
  })

  const handleClick = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleGroupBySelect = type => {
    setGroupBy(type)
    handleClose()
  }

  // Location data fetching
  const getCitiesData = async (region = '') => {
    setLoading(prev => ({ ...prev, fetchCities: true }))
    try {
      const result = await RestApi.get(`/api/cities?state=${region}`)
      if (result?.status === 'success') {
        setCityOptions(result?.result?.map(each => each.city))
      }
    } catch (error) {
      console.error('Error fetching cities:', error)
    } finally {
      setLoading(prev => ({ ...prev, fetchCities: false }))
    }
  }

  const handleCountryChange = countryObject => {
    setSelectedCountryObject(countryObject)
    setSelectedRegion('')
    setSelectedCity('')
    setFilters(prev => ({
      ...prev,
      location: {
        ...prev.location,
        country: countryObject?.country || '',
        state: '',
        city: ''
      }
    }))
  }

  const handleRegionChange = newValue => {
    setSelectedRegion(newValue)
    setSelectedCity('')
    setFilters(prev => ({
      ...prev,
      location: {
        ...prev.location,
        state: newValue,
        city: ''
      }
    }))
    getCitiesData(newValue)
  }

  const handleCityChange = newValue => {
    setSelectedCity(newValue)
    setFilters(prev => ({
      ...prev,
      location: {
        ...prev.location,
        city: newValue
      }
    }))
  }

  useEffect(() => {
    getCitiesData()
  }, [])

  const handleFilterChange = (type, field, value) => {
    setFilters(prev => ({
      ...prev,
      [type]: { ...prev[type], [field]: value }
    }))
  }

  const applyFilters = () => {
    const newFilters = []
    let filteredUserIds = []
    let criteria = {
      ageGroup: null,
      location: null,
      gender: null
    }

    if (groupBy === 'age' && (filters.age.min || filters.age.max)) {
      const minAge = parseInt(filters.age.min) || 0
      const maxAge = parseInt(filters.age.max) || 100

      filteredUserIds = users
        .filter(user => {
          const userAge = user.profile?.age || 0
          return userAge >= minAge && userAge <= maxAge
        })
        .map(user => user._id)

      newFilters.push({
        type: 'age',
        label: `Age: ${minAge} - ${maxAge}`,
        value: { min: minAge, max: maxAge }
      })

      criteria.ageGroup = {
        min: minAge,
        max: maxAge
      }
    }

    if (groupBy === 'location') {
      // Use the location filters from the state
      filteredUserIds = users
        .filter(user => {
          const profile = user.profile || {}
          return (
            (!filters.location.country || profile.country?.toLowerCase() === filters.location.country.toLowerCase()) &&
            (!filters.location.state || profile.region?.toLowerCase() === filters.location.state.toLowerCase()) &&
            (!filters.location.city || profile.locality?.toLowerCase() === filters.location.city.toLowerCase())
          )
        })
        .map(user => user._id)

      if (filteredUserIds.length > 0) {
        newFilters.push({
          type: 'location',
          label: `Location: ${[filters.location.country, filters.location.state, filters.location.city]
            .filter(Boolean)
            .join(', ')}`,
          value: { ...filters.location }
        })
        criteria.location = {
          country: filters.location.country,
          region: filters.location.state,
          city: filters.location.city
        }
      }
    }

    if (groupBy === 'gender') {
      const selectedGenders = []
      if (filters.gender.male) selectedGenders.push('male')
      if (filters.gender.female) selectedGenders.push('female')
      if (filters.gender.other) selectedGenders.push('other')

      if (selectedGenders.length > 0) {
        filteredUserIds = users
          .filter(user => selectedGenders.includes(user.profile?.gender?.toLowerCase()))
          .map(user => user._id)

        newFilters.push({
          type: 'gender',
          label: `Gender: ${selectedGenders.map(g => g.charAt(0).toUpperCase() + g.slice(1)).join(', ')}`,
          value: { ...filters.gender }
        })
        criteria.gender = selectedGenders[0]
      }
    }

    setSelectedFilters(newFilters)
    setGroupBy(null)

    // Call the parent component's filter handler with both filtered user IDs and criteria
    if (filteredUserIds.length > 0) {
      onFilterChange(filteredUserIds, criteria)
    } else {
      // If no filters applied, return all users
      onFilterChange(
        users.map(user => user._id),
        {}
      )
    }
  }

  const handleDeleteFilter = index => {
    setSelectedFilters(prev => prev.filter((_, i) => i !== index))
    // When removing a filter, show all users again
    onFilterChange(users.map(user => user._id))
  }

  return (
    <Box>
      <Stack direction='row' spacing={2} alignItems='center'>
        <Button
          variant='outlined'
          onClick={handleClick}
          endIcon={<ArrowDropDownIcon />}
          sx={{ minWidth: 150, fontSize: 20 }}
        >
          Group By
        </Button>

        {selectedFilters.map((filter, index) => (
          <Chip
            key={index}
            label={filter.label}
            onDelete={() => handleDeleteFilter(index)}
            deleteIcon={<CloseIcon />}
          />
        ))}
      </Stack>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        sx={{
          minWidth: 150, // Set minimum width for the entire menu
          '& .MuiPaper-root': {
            // Target the Paper component inside Menu
            minWidth: 150,
            maxWidth: 150
          }
        }}
      >
        <MenuItem onClick={() => handleGroupBySelect('age')}>Age</MenuItem>
        <MenuItem onClick={() => handleGroupBySelect('location')}>Location</MenuItem>
        <MenuItem onClick={() => handleGroupBySelect('gender')}>Gender</MenuItem>
      </Menu>

      {/* Age Filter Dialog */}
      {groupBy === 'age' && (
        <Box sx={{ mt: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
          <Typography variant='h6' gutterBottom>
            Group By Age
          </Typography>
          <Stack direction='row' spacing={2} sx={{ mb: 2 }}>
            <TextField
              label='Min Age'
              type='number'
              value={filters.age.min}
              onChange={e => handleFilterChange('age', 'min', e.target.value)}
              sx={{ width: 120 }}
            />
            <TextField
              label='Max Age'
              type='number'
              value={filters.age.max}
              onChange={e => handleFilterChange('age', 'max', e.target.value)}
              sx={{ width: 120 }}
            />
          </Stack>
          <Button variant='contained' onClick={applyFilters}>
            Apply
          </Button>
        </Box>
      )}

      {/* Location Filter Dialog */}
      {groupBy === 'location' && (
        <Box sx={{ mt: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
          <Typography variant='h6' gutterBottom>
            Group By Location
          </Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6} md={4}>
              <CountryRegionDropdown
                defaultCountryCode=''
                selectedCountryObject={selectedCountryObject}
                setSelectedCountryObject={handleCountryChange}
              />
            </Grid>

            {selectedCountryObject?.country && (
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <Autocomplete
                    autoHighlight
                    onChange={(e, newValue) => handleRegionChange(newValue)}
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
                          autoComplete: 'region'
                        }}
                      />
                    )}
                    value={selectedRegion}
                  />
                </FormControl>
              </Grid>
            )}

            {selectedRegion && (
              <Grid item xs={12} sm={6} md={4}>
                {loading.fetchCities && <div>Loading cities...</div>}
                {!loading.fetchCities && (
                  <FormControl fullWidth>
                    <Autocomplete
                      autoHighlight
                      onChange={(e, newValue) => handleCityChange(newValue)}
                      id='autocomplete-city-select'
                      options={cityOptions || []}
                      getOptionLabel={option => option || ''}
                      renderInput={params => (
                        <TextField
                          {...params}
                          key={params.id}
                          label='Choose a City'
                          inputProps={{
                            ...params.inputProps,
                            autoComplete: 'city'
                          }}
                        />
                      )}
                      value={selectedCity}
                    />
                  </FormControl>
                )}
              </Grid>
            )}
          </Grid>
          <Button variant='contained' onClick={applyFilters}>
            Apply
          </Button>
        </Box>
      )}

      {/* Gender Filter Dialog */}
      {groupBy === 'gender' && (
        <Box sx={{ mt: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
          <Typography variant='h6' gutterBottom>
            Group By Gender
          </Typography>
          <Stack spacing={1} sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.gender.male}
                  onChange={e => handleFilterChange('gender', 'male', e.target.checked)}
                />
              }
              label='Male'
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.gender.female}
                  onChange={e => handleFilterChange('gender', 'female', e.target.checked)}
                />
              }
              label='Female'
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.gender.other}
                  onChange={e => handleFilterChange('gender', 'other', e.target.checked)}
                />
              }
              label='Other'
            />
          </Stack>
          <Button variant='contained' onClick={applyFilters}>
            Apply
          </Button>
        </Box>
      )}
    </Box>
  )
}

export default GroupByFilter
