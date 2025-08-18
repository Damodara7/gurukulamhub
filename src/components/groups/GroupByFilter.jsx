'use client'
import React, { useState, useEffect, useRef } from 'react'
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

// Add CSS for spinner animation
const spinnerStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`

const GroupByFilter = ({ users, onFilterChange, initialCriteria = null }) => {
  const didInitFromPropsRef = useRef(false)
  const [anchorEl, setAnchorEl] = useState(null)
  const [groupBy, setGroupBy] = useState(null)
  const [filters, setFilters] = useState({
    age: { min: '', max: '' },
    location: { country: '', state: '', city: '' },
    gender: { male: false, female: false, other: false }
  })
  const [ageError, setAgeError] = useState(null)
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
  const [combinedCriteria, setCombinedCriteria] = useState({
    ageGroup: null,
    location: null,
    gender: null
  })

  const handleClick = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  // Initialize with existing filters if in edit mode (once)
  useEffect(() => {
    if (didInitFromPropsRef.current) return
    if (!initialCriteria) return
    if (!Array.isArray(users) || users.length === 0) return

    const filters = []
    let userIds = users.map(user => user._id)

    if (initialCriteria.ageGroup) {
      const idsForAge = users
        .filter(u => {
          const age = u?.profile?.age
          return age != null && age >= initialCriteria.ageGroup.min && age <= initialCriteria.ageGroup.max
        })
        .map(u => u._id)
      filters.push({
        type: 'age',
        label: `Age: ${initialCriteria.ageGroup.min}-${initialCriteria.ageGroup.max}`,
        value: initialCriteria.ageGroup,
        userIds: idsForAge
      })
      userIds = userIds.filter(id => idsForAge.includes(id))
    }

    if (initialCriteria.location) {
      const loc = initialCriteria.location
      const parts = [loc.country, loc.region, loc.city].filter(Boolean)
      const idsForLoc = users
        .filter(u => {
          const p = u?.profile || {}
          return (
            (!loc.country || p.country?.toLowerCase() === loc.country?.toLowerCase()) &&
            (!loc.region || p.region?.toLowerCase() === loc.region?.toLowerCase()) &&
            (!loc.city || p.locality?.toLowerCase() === loc.city?.toLowerCase())
          )
        })
        .map(u => u._id)
      filters.push({
        type: 'location',
        label: `Location: ${parts.join(', ')}`,
        value: loc,
        userIds: idsForLoc
      })
      userIds = userIds.filter(id => idsForLoc.includes(id))
    }

    if (initialCriteria.gender) {
      const genders = Array.isArray(initialCriteria.gender) ? initialCriteria.gender : [initialCriteria.gender]
      const idsForGender = users
        .filter(u => {
          const gender = u?.profile?.gender?.toLowerCase()
          return Boolean(gender) && genders.includes(gender)
        })
        .map(u => u._id)
      filters.push({
        type: 'gender',
        label: `Gender: ${genders.map(g => g.charAt(0).toUpperCase() + g.slice(1)).join(', ')}`,
        value: genders.reduce((acc, g) => ({ ...acc, [g]: true }), {}),
        userIds: idsForGender
      })
      userIds = userIds.filter(id => idsForGender.includes(id))
    }

    setSelectedFilters(filters)
    setMatchedUsers(users.filter(u => userIds.includes(u._id)))
    setUnmatchedUsers(users.filter(u => !userIds.includes(u._id)))
    setCombinedCriteria(initialCriteria)

    didInitFromPropsRef.current = true
  }, [initialCriteria, users])

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
    setAgeError(null) // Clear age error when closing dialog
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

    // Derive a cumulative criteria object from all selected filters
    const nextCombinedCriteria = {
      ageGroup: null,
      location: null,
      gender: null
    }

    updatedFilters.forEach(filter => {
      if (filter.type === 'age' && filter.value) {
        nextCombinedCriteria.ageGroup = { min: filter.value.min, max: filter.value.max }
      }
      if (filter.type === 'location' && filter.value) {
        nextCombinedCriteria.location = {
          country: filter.value.country || '',
          region: filter.value.state || '',
          city: filter.value.city || ''
        }
      }
      if (filter.type === 'gender' && filter.value) {
        const selected = Object.entries(filter.value)
          .filter(([, isOn]) => Boolean(isOn))
          .map(([key]) => key)
        // Persist a single gender if exactly one selected; otherwise leave null
        nextCombinedCriteria.gender = selected.length > 0 ? selected : null
      }
    })

    setCombinedCriteria(nextCombinedCriteria)

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

    // Call parent with combined results and cumulative criteria
    onFilterChange(combinedUserIds, nextCombinedCriteria)
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

      // Enhanced age validation
      if (minAge < 0 || maxAge < 0) {
        setAgeError('Age values cannot be negative')
        return
      }

      if (minAge > 120 || maxAge > 120) {
        setAgeError('Age values cannot exceed 120 years')
        return
      }

      // Validate that min age is less than max age
      if (minAge >= maxAge) {
        setAgeError('Minimum age must be less than maximum age')
        return // Don't proceed with filter application
      }

      // Check if age range is reasonable
      if (maxAge - minAge < 1) {
        setAgeError('Age range must be at least 1 year')
        return
      }

      setAgeError(null) // Clear any previous error

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

      // Always record the selected location filter as a chip, even if no users match
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
        // Send all selected genders (array)
        criteria.gender = selectedGenders
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
      const resetCriteria = { ageGroup: null, location: null, gender: null }
      setCombinedCriteria(resetCriteria)
      onFilterChange(
        users.map(user => user._id),
        resetCriteria
      )
      return
    }

    // Recalculate combined results based on remaining filters
    let combinedUserIds = []
    if (updatedFilters.length === 1) {
      combinedUserIds = updatedFilters[0].userIds || []
    } else {
      // Need to reapply all operations in sequence, guard against missing userIds
      combinedUserIds = updatedFilters.reduce((acc, filter, idx) => {
        const currentIds = Array.isArray(filter.userIds) ? filter.userIds : []
        if (idx === 0) return currentIds
        const operation = filter.operation || 'AND' // Default to AND if not specified
        if (operation === 'AND') {
          return acc.filter(id => currentIds.includes(id))
        } else {
          return [...new Set([...acc, ...currentIds])]
        }
      }, [])
    }

    const matched = users.filter(user => combinedUserIds.includes(user._id))
    const unmatched = users.filter(user => !combinedUserIds.includes(user._id))
    setMatchedUsers(matched)
    setUnmatchedUsers(unmatched)

    // Recompute cumulative criteria from remaining filters
    const nextCombinedCriteria = {
      ageGroup: null,
      location: null,
      gender: null
    }
    updatedFilters.forEach(filter => {
      if (filter.type === 'age' && filter.value) {
        nextCombinedCriteria.ageGroup = { min: filter.value.min, max: filter.value.max }
      }
      if (filter.type === 'location' && filter.value) {
        nextCombinedCriteria.location = {
          country: filter.value.country || '',
          region: filter.value.state || '',
          city: filter.value.city || ''
        }
      }
      if (filter.type === 'gender' && filter.value) {
        const selected = Object.entries(filter.value)
          .filter(([, isOn]) => Boolean(isOn))
          .map(([key]) => key)
        // Keep as array if any selected, else null
        nextCombinedCriteria.gender = selected.length > 0 ? selected : null
      }
    })
    setCombinedCriteria(nextCombinedCriteria)
    onFilterChange(combinedUserIds, nextCombinedCriteria)
  }

  return (
    <Box sx={{ width: '100%' }}>
      <style>{spinnerStyles}</style>
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
      <Dialog
        open={showFilterDialog}
        onClose={closeFilterDialog}
        maxWidth='md'
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
          }
        }}
      >
        <DialogTitle
          sx={{
            pb: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper'
          }}
        >
          <Typography variant='h6' component='div' sx={{ fontWeight: 600 }}>
            {groupBy === 'age' && 'Filter by Age Range'}
            {groupBy === 'location' && 'Filter by Location'}
            {groupBy === 'gender' && 'Filter by Gender'}
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
            {groupBy === 'age' && 'Select the age range to filter users'}
            {groupBy === 'location' && 'Choose country, region, and city to filter users'}
            {groupBy === 'gender' && 'Select gender(s) to filter users'}
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ pt: 3, pb: 2 }}>
          {groupBy === 'age' && (
            <Box sx={{ mt: 1 }}>
              <Typography variant='subtitle2' sx={{ mb: 2, fontWeight: 500 }}>
                Age Range
              </Typography>
              <Grid container spacing={3} alignItems='center'>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label='Minimum Age'
                    type='number'
                    value={filters.age.min}
                    onChange={e => {
                      handleFilterChange('age', 'min', e.target.value)
                      setAgeError(null)
                    }}
                    fullWidth
                    error={!!ageError}
                    helperText={ageError || 'Enter minimum age (0-120)'}
                    InputProps={{
                      startAdornment: (
                        <Typography variant='body2' sx={{ mr: 1, color: 'text.secondary' }}>
                          From:
                        </Typography>
                      )
                    }}
                    inputProps={{
                      min: 0,
                      max: 120
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label='Maximum Age'
                    type='number'
                    value={filters.age.max}
                    onChange={e => {
                      handleFilterChange('age', 'max', e.target.value)
                      setAgeError(null)
                    }}
                    fullWidth
                    error={!!ageError}
                    helperText={ageError || 'Enter maximum age (0-120)'}
                    InputProps={{
                      startAdornment: (
                        <Typography variant='body2' sx={{ mr: 1, color: 'text.secondary' }}>
                          To:
                        </Typography>
                      )
                    }}
                    inputProps={{
                      min: 0,
                      max: 120
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {groupBy === 'location' && (
            <Box sx={{ mt: 1 }}>
              <Typography variant='subtitle2' sx={{ mb: 3, fontWeight: 500 }}>
                Location Details
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant='body2' sx={{ mb: 1, fontWeight: 500, color: 'text.secondary' }}>
                    Country
                  </Typography>
                  <CountryRegionDropdown
                    defaultCountryCode=''
                    selectedCountryObject={selectedCountryObject}
                    setSelectedCountryObject={handleCountryChange}
                  />
                </Grid>

                {selectedCountryObject?.country && (
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant='body2' sx={{ mb: 1, fontWeight: 500, color: 'text.secondary' }}>
                      Region/State
                    </Typography>
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
                            placeholder='Select region'
                            inputProps={{
                              ...params.inputProps,
                              autoComplete: 'region'
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2
                              }
                            }}
                          />
                        )}
                        value={selectedRegion}
                        noOptionsText='No regions available'
                      />
                    </FormControl>
                  </Grid>
                )}

                {selectedRegion && (
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant='body2' sx={{ mb: 1, fontWeight: 500, color: 'text.secondary' }}>
                      City
                    </Typography>
                    {loading.fetchCities ? (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          p: 2,
                          bgcolor: 'action.hover',
                          borderRadius: 2,
                          border: '1px dashed',
                          borderColor: 'divider'
                        }}
                      >
                        <div
                          className='spinner'
                          style={{
                            width: '20px',
                            height: '20px',
                            border: '2px solid #e3e3e3',
                            borderTop: '2px solid #1976d2',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                          }}
                        ></div>
                        <Typography variant='body2' color='text.secondary'>
                          Loading cities...
                        </Typography>
                      </Box>
                    ) : (
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
                              placeholder='Select city'
                              inputProps={{
                                ...params.inputProps,
                                autoComplete: 'city'
                              }}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2
                                }
                              }}
                            />
                          )}
                          value={selectedCity}
                          noOptionsText='No cities available'
                        />
                      </FormControl>
                    )}
                  </Grid>
                )}
              </Grid>
            </Box>
          )}

          {groupBy === 'gender' && (
            <Box sx={{ mt: 1 }}>
              <Typography variant='subtitle2' sx={{ mb: 3, fontWeight: 500 }}>
                Gender Selection
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                Select one or more genders to filter users
              </Typography>
              <Grid container spacing={2}>
                {[
                  { key: 'male', label: 'Male', icon: '👨' },
                  { key: 'female', label: 'Female', icon: '👩' },
                  { key: 'other', label: 'Other', icon: '👤' }
                ].map(gender => (
                  <Grid item xs={12} sm={4} key={gender.key}>
                    <Box
                      sx={{
                        p: 2,
                        border: '2px solid',
                        borderColor: filters.gender[gender.key] ? 'primary.main' : 'divider',
                        borderRadius: 2,
                        bgcolor: filters.gender[gender.key] ? 'primary.light' : 'background.paper',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: filters.gender[gender.key] ? 'primary.light' : 'action.hover'
                        }
                      }}
                      onClick={() => handleFilterChange('gender', gender.key, !filters.gender[gender.key])}
                    >
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={filters.gender[gender.key]}
                            onChange={e => handleFilterChange('gender', gender.key, e.target.checked)}
                            sx={{ mr: 1 }}
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant='h6'>{gender.icon}</Typography>
                            <Typography variant='body1' sx={{ fontWeight: 500 }}>
                              {gender.label}
                            </Typography>
                          </Box>
                        }
                        sx={{ m: 0, width: '100%' }}
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={closeFilterDialog} variant='outlined' sx={{ borderRadius: 2, px: 3 }}>
            Cancel
          </Button>
          <Button
            onClick={applyFilters}
            variant='contained'
            sx={{ borderRadius: 2, px: 3 }}
            disabled={
              (groupBy === 'age' && !filters.age.min && !filters.age.max) ||
              (groupBy === 'location' && !filters.location.country) ||
              (groupBy === 'gender' && !Object.values(filters.gender).some(Boolean))
            }
          >
            Apply Filters
          </Button>
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
