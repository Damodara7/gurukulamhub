'use client'
import React, { useState, useEffect } from 'react'
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
  Radio,
  Grid,
  FormControl,
  Autocomplete,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import { ArrowDropDown as ArrowDropDownIcon, Close as CloseIcon } from '@mui/icons-material'
import * as RestApi from '@/utils/restApiUtil'
import CountryRegionDropdown from '@/views/pages/auth/register-multi-steps/CountryRegionDropdown'

const GroupByFilter = ({ users, onFilterChange }) => {
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
  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const [showOperationDialog, setShowOperationDialog] = useState(false)
  const [pendingFilterData, setPendingFilterData] = useState(null)
  const [matchedUsers, setMatchedUsers] = useState([])
  const [unmatchedUsers, setUnmatchedUsers] = useState([])

  const handleClick = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const OperationDialog = ({ open, onClose, onOperationSelect }) => (
    <Dialog open={open} onClose={onClose} maxWidth='xs' fullWidth>
      <DialogTitle sx={{ pb: 1 }}>Combine Filters</DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <Typography variant='body2' sx={{ mb: 2 }}>
          How would you like to combine this filter with previous ones?
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button variant='outlined' onClick={() => onOperationSelect('AND')} sx={{ flex: 1 }}>
            AND
          </Button>
          <Button variant='outlined' onClick={() => onOperationSelect('OR')} sx={{ flex: 1 }}>
            OR
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  )

  const handleGroupBySelect = type => {
    setGroupBy(type)
    setShowFilterDialog(true)
    handleClose()
  }

  const closeFilterDialog = () => {
    setShowFilterDialog(false)
    setGroupBy(null)
    setFilters({
      age: { min: '', max: '' },
      location: { country: '', state: '', city: '' },
      gender: { male: false, female: false, other: false }
    })
    setSelectedCountryObject(null)
    setSelectedRegion('')
    setSelectedCity('')
  }


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

  const applyFilterWithOperation = (newFilters, filteredUserIds, criteria, operation) => {
    let updatedFilters = []
    let combinedUserIds = []

    if (selectedFilters.length === 0) {
      // First filter - just add it without any operation
      updatedFilters = newFilters.map(f => ({
        ...f,
        userIds: filteredUserIds
      }))
      combinedUserIds = filteredUserIds
    } else {
      // Subsequent filters - combine based on selected operation
      updatedFilters = [
        ...selectedFilters,
        ...newFilters.map(f => ({
          ...f,
          userIds: filteredUserIds,
          operation // Store the operation used to combine this filter
        }))
      ]

      if (operation === 'AND') {
        // Intersection of all filter results
        combinedUserIds = updatedFilters.reduce((acc, filter) => {
          if (acc.length === 0) return filter.userIds
          return acc.filter(id => filter.userIds.includes(id))
        }, [])
      } else {
        // OR - Union of all filter results
        combinedUserIds = [...new Set(updatedFilters.flatMap(filter => filter.userIds))]
      }
    }

    setSelectedFilters(updatedFilters)

    // Update matched/unmatched users
    const matched = users.filter(user => combinedUserIds.includes(user._id))
    const unmatched = users.filter(user => !combinedUserIds.includes(user._id))
    setMatchedUsers(matched)
    setUnmatchedUsers(unmatched)

    // Reset UI
    setGroupBy(null)
    setFilters({
      age: { min: '', max: '' },
      location: { country: '', state: '', city: '' },
      gender: { male: false, female: false, other: false }
    })
    setSelectedCountryObject(null)
    setSelectedRegion('')
    setSelectedCity('')

    // Call parent with combined results
    onFilterChange(combinedUserIds, criteria)
  }

  const handleOperationSelect = operation => {
    setShowOperationDialog(false)
    if (pendingFilterData) {
      const { newFilters, filteredUserIds, criteria } = pendingFilterData
      applyFilterWithOperation(newFilters, filteredUserIds, criteria, operation)
    }
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

      users.forEach(user => {
        const userAge = user.profile?.age
        const hasAge = userAge !== undefined && userAge !== null
        const ageMatches = hasAge && userAge >= minAge && userAge <= maxAge

        if (ageMatches) {
          filteredUserIds.push(user._id)
        }
      })

      newFilters.push({
        type: 'age',
        label: `Age: ${minAge}${maxAge !== 100 ? `-${maxAge}` : '+'}`,
        value: { min: minAge, max: maxAge }
      })

      criteria.ageGroup = {
        min: minAge,
        max: maxAge
      }
    }

    if (groupBy === 'location') {
      users.forEach(user => {
        const profile = user.profile || {}
        const countryMatch =
          !filters.location.country ||
          (profile.country && profile.country.toLowerCase() === filters.location.country.toLowerCase())
        const stateMatch =
          !filters.location.state ||
          (profile.region && profile.region.toLowerCase() === filters.location.state.toLowerCase())
        const cityMatch =
          !filters.location.city ||
          (profile.locality && profile.locality.toLowerCase() === filters.location.city.toLowerCase())

        if (countryMatch && stateMatch && cityMatch) {
          filteredUserIds.push(user._id)
        }
      })

      if (filteredUserIds.length > 0) {
        const locationParts = [filters.location.country, filters.location.state, filters.location.city].filter(Boolean)
        newFilters.push({
          type: 'location',
          label: `Location: ${locationParts.join(', ')}`,
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
        users.forEach(user => {
          const userGender = user.profile?.gender?.toLowerCase()
          if (userGender && selectedGenders.includes(userGender)) {
            filteredUserIds.push(user._id)
          }
        })

        newFilters.push({
          type: 'gender',
          label: `Gender: ${selectedGenders.map(g => g.charAt(0).toUpperCase() + g.slice(1)).join(', ')}`,
          value: { ...filters.gender }
        })
        criteria.gender = selectedGenders[0]
      }
    }

    if (newFilters.length === 0) {
      closeFilterDialog() // Close dialog if no filters were applied
      return
    }

    // If we have existing filters, show operation dialog
    if (selectedFilters.length > 0) {
      setPendingFilterData({ newFilters, filteredUserIds, criteria })
      setShowOperationDialog(true)
      closeFilterDialog() // Close the filter dialog before showing operation dialog
      return
    }

    // First filter - apply directly
    applyFilterWithOperation(newFilters, filteredUserIds, criteria, 'AND')
    closeFilterDialog() // Close the filter dialog after applying
  }

  const handleDeleteFilter = index => {
    const updatedFilters = selectedFilters.filter((_, i) => i !== index)
    setSelectedFilters(updatedFilters)

    if (updatedFilters.length === 0) {
      setMatchedUsers(users)
      setUnmatchedUsers([])
      onFilterChange(
        users.map(user => user._id),
        {}
      )
      return
    }

    // Recalculate combined results based on remaining filters
    let combinedUserIds = []
    if (updatedFilters.length === 1) {
      combinedUserIds = updatedFilters[0].userIds
    } else {
      // Need to reapply all operations in sequence
      combinedUserIds = updatedFilters.reduce((acc, filter, idx) => {
        if (idx === 0) return filter.userIds
        const operation = filter.operation || 'AND' // Default to AND if not specified
        if (operation === 'AND') {
          return acc.filter(id => filter.userIds.includes(id))
        } else {
          return [...new Set([...acc, ...filter.userIds])]
        }
      }, [])
    }

    const matched = users.filter(user => combinedUserIds.includes(user._id))
    const unmatched = users.filter(user => !combinedUserIds.includes(user._id))
    setMatchedUsers(matched)
    setUnmatchedUsers(unmatched)
    onFilterChange(combinedUserIds, {})
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box>
          <Button variant='outlined' onClick={handleClick} endIcon={<ArrowDropDownIcon />} sx={{ minWidth: 120 }}>
            Group By
          </Button>
        </Box>

        {selectedFilters.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              maxWidth: '100%',
              overflow: 'auto',
              flexWrap: { xs: 'nowrap', sm: 'wrap' }
            }}
          >
            <Typography sx={{ mr: 1, flexShrink: 0 }}>Filters:</Typography>
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                alignItems: 'center',
                flexWrap: 'wrap'
              }}
            >
              {selectedFilters.map((filter, index) => (
                <Chip
                  key={index}
                  label={filter.label}
                  onDelete={() => handleDeleteFilter(index)}
                  deleteIcon={<CloseIcon />}
                  sx={{
                    maxWidth: 200,
                    textOverflow: 'ellipsis',
                    overflow: 'hidden'
                  }}
                />
              ))}
            </Box>
          </Box>
        )}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        sx={{
          '& .MuiPaper-root': {
            minWidth: 150
          }
        }}
      >
        <MenuItem onClick={() => handleGroupBySelect('age')}>Age</MenuItem>
        <MenuItem onClick={() => handleGroupBySelect('location')}>Location</MenuItem>
        <MenuItem onClick={() => handleGroupBySelect('gender')}>Gender</MenuItem>
      </Menu>

      

      {/* Filter Dialog */}
      <Dialog open={showFilterDialog} onClose={closeFilterDialog} maxWidth='sm' fullWidth>
        <DialogTitle>
          {groupBy === 'age' && 'Filter by Age'}
          {groupBy === 'location' && 'Filter by Location'}
          {groupBy === 'gender' && 'Filter by Gender'}
        </DialogTitle>
        <DialogContent>
          {groupBy === 'age' && (
            <Box sx={{ mt: 2 }}>
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
            </Box>
          )}

          {groupBy === 'location' && (
            <Box sx={{ mt: 2 }}>
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
            </Box>
          )}

          {groupBy === 'gender' && (
            <Box sx={{ mt: 2 }}>
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
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeFilterDialog}>Cancel</Button>
          <Button onClick={applyFilters}>Apply</Button>
        </DialogActions>
      </Dialog>

      <OperationDialog
        open={showOperationDialog}
        onClose={() => setShowOperationDialog(false)}
        onOperationSelect={handleOperationSelect}
      />
    </Box>
  )
}

export default GroupByFilter