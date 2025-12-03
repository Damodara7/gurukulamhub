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
  DialogActions,
  IconButton,
  Tooltip,
  useTheme
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import IconButtonTooltip from '@/components/IconButtonTooltip'
import { ArrowDropDown as ArrowDropDownIcon, Close as CloseIcon, Edit as EditIcon } from '@mui/icons-material'
import * as RestApi from '@/utils/restApiUtil'
import CountryRegionDropdown from '@/views/pages/auth/register-multi-steps/CountryRegionDropdown'

// Add CSS for spinner animation
const spinnerStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`

const GroupByFilter = ({ users, onFilterChange, initialFilters = [] }) => {
  const theme = useTheme()
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
  const [editingFilter, setEditingFilter] = useState(null)
  const [isEditMode, setIsEditMode] = useState(false)

  const handleClick = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  // Check if a filter type is already applied
  const isFilterTypeApplied = filterType => {
    return selectedFilters.some(filter => filter.type === filterType)
  }

  // Get the applied filter of a specific type
  const getAppliedFilter = filterType => {
    return selectedFilters.find(filter => filter.type === filterType)
  }

  // Handle edit filter click
  const handleEditFilter = (filter, index) => {
    console.log('handleEditFilter called with:', filter, index)
    setEditingFilter({ ...filter, index })
    setIsEditMode(true)

    // Set the groupBy to the filter type
    setGroupBy(filter.type)

    // Populate the filters state with existing values
    if (filter.type === 'age') {
      console.log('Setting age filters:', filter.value)
      setFilters(prev => ({
        ...prev,
        age: { min: filter.value.min.toString(), max: filter.value.max.toString() }
      }))
    } else if (filter.type === 'location') {
      console.log('Setting location filters:', filter.value)
      setFilters(prev => ({
        ...prev,
        location: {
          country: filter.value.country || '',
          state: filter.value.state || filter.value.region || '',
          city: filter.value.city || ''
        }
      }))
      // Set the country object and region for location editing
      if (filter.value.country) {
        // Create a basic country object for editing
        setSelectedCountryObject({
          country: filter.value.country,
          regions: [] // We'll need to fetch this if needed
        })
        setSelectedRegion(filter.value.state || filter.value.region || '')
        setSelectedCity(filter.value.city || '')
        if (filter.value.state || filter.value.region) {
          getCitiesData(filter.value.state || filter.value.region)
        }
        // Fetch country regions for the dropdown
        getCountryRegions(filter.value.country).then(regions => {
          setSelectedCountryObject(prev => ({ ...prev, regions }))
        })
      }
    } else if (filter.type === 'gender') {
      console.log('Setting gender filters:', filter.value)
      setFilters(prev => ({
        ...prev,
        gender: filter.value
      }))
    }

    setShowFilterDialog(true)
  }

  // Initialize with existing filters if in edit mode (once)
  useEffect(() => {
    if (didInitFromPropsRef.current) return
    if (!initialFilters || initialFilters.length === 0) return
    if (!Array.isArray(users) || users.length === 0) return

    const filters = []
    let userIds = users.map(user => user._id)

    initialFilters.forEach((filter, index) => {
      let currentFilterIds = []
      let label = ''
      let value = null

      if (filter.type === 'age') {
        const { min, max } = filter.criteria
        currentFilterIds = users
          .filter(u => {
            const age = u?.profile?.age
            return age != null && age >= min && age <= max
          })
          .map(u => u._id)
        label = `Age: ${min}-${max}`
        value = { min, max }
      } else if (filter.type === 'location') {
        const { country, region, city } = filter.criteria
        const parts = [country, region, city].filter(Boolean)
        currentFilterIds = users
          .filter(u => {
            const p = u?.profile || {}
            return (
              (!country || p.country?.toLowerCase() === country?.toLowerCase()) &&
              (!region || p.region?.toLowerCase() === region?.toLowerCase()) &&
              (!city || p.locality?.toLowerCase() === city?.toLowerCase())
            )
          })
          .map(u => u._id)
        label = `Location: ${parts.join(', ')}`
        value = { country: country || '', state: region || '', city: city || '' }
      } else if (filter.type === 'gender') {
        const genders = Array.isArray(filter.criteria) ? filter.criteria : [filter.criteria]
        currentFilterIds = users
          .filter(u => {
            const gender = u?.profile?.gender?.toLowerCase()
            return Boolean(gender) && genders.includes(gender)
          })
          .map(u => u._id)
        label = `Gender: ${genders.map(g => g.charAt(0).toUpperCase() + g.slice(1)).join(', ')}`
        value = genders.reduce((acc, g) => ({ ...acc, [g]: true }), {})
      }

      filters.push({
        type: filter.type,
        label,
        value,
        userIds: currentFilterIds,
        operation: filter.operator || null
      })

      // Apply operator
      if (index === 0) {
        userIds = currentFilterIds
      } else {
        const operator = filter.operator || 'AND'
        if (operator === 'AND') {
          userIds = userIds.filter(id => currentFilterIds.includes(id))
        } else if (operator === 'OR') {
          userIds = [...new Set([...userIds, ...currentFilterIds])]
        } else if (operator === 'NOT') {
          userIds = userIds.filter(id => !currentFilterIds.includes(id))
        }
      }
    })

    setSelectedFilters(filters)
    setMatchedUsers(users.filter(u => userIds.includes(u._id)))
    setUnmatchedUsers(users.filter(u => !userIds.includes(u._id)))

    didInitFromPropsRef.current = true
  }, [initialFilters, users])

  const OperationDialog = ({ open, onClose, onOperationSelect }) => (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='md'
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow:
            theme.palette.mode === 'dark'
              ? `0 8px 32px ${alpha(theme.palette.common.black, 0.5)}`
              : '0 8px 32px rgba(0,0,0,0.12)'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>Combine Filters</DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <Typography variant='body2' sx={{ mb: 2 }}>
          How would you like to combine this filter with previous ones?
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button variant='outlined' onClick={() => onOperationSelect('AND')} sx={{ flex: 1 }}>
              AND
            </Button>
            <Button variant='outlined' onClick={() => onOperationSelect('OR')} sx={{ flex: 1 }}>
              OR
            </Button>
            <Button variant='outlined' color='error' onClick={() => onOperationSelect('NOT')} sx={{ flex: 1 }}>
              NOT
            </Button>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          sx={{
            color: theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.text.primary
          }}
        >
          Cancel
        </Button>
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
    setIsEditMode(false)
    setEditingFilter(null)
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

  const getCountryRegions = async countryCode => {
    try {
      // This would need to be implemented based on your API structure
      // For now, we'll use a placeholder
      const result = await RestApi.get(`/api/countries/${countryCode}/regions`)
      if (result?.status === 'success') {
        return result.result || []
      }
    } catch (error) {
      console.error('Error fetching country regions:', error)
    }
    return []
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

      // Apply operations in sequence
      combinedUserIds = updatedFilters.reduce((acc, filter, index) => {
        const currentIds = Array.isArray(filter.userIds) ? filter.userIds : []

        if (index === 0) {
          // First filter - start with its user IDs
          return currentIds
        }

        const operation = filter.operation || 'AND'

        if (operation === 'AND') {
          // Intersection: Keep only users in both sets
          return acc.filter(id => currentIds.includes(id))
        } else if (operation === 'OR') {
          // Union: Combine users from both sets
          return [...new Set([...acc, ...currentIds])]
        } else if (operation === 'NOT') {
          // Exclusion: Remove users that match this filter
          const excludeIds = new Set(currentIds)
          return acc.filter(id => !excludeIds.has(id))
        }

        // Default to AND if operation is unknown
        return acc.filter(id => currentIds.includes(id))
      }, [])
    }

    setSelectedFilters(updatedFilters)

    // Build filters array for backend in new format
    const backendFilters = updatedFilters.map((filter, index) => {
      let criteria = {}

      if (filter.type === 'age' && filter.value) {
        criteria = { min: filter.value.min, max: filter.value.max }
      } else if (filter.type === 'location' && filter.value) {
        criteria = {
          country: filter.value.country || '',
          region: filter.value.state || filter.value.region || '',
          city: filter.value.city || ''
        }
      } else if (filter.type === 'gender' && filter.value) {
        const selected = Object.entries(filter.value)
          .filter(([, isOn]) => Boolean(isOn))
          .map(([key]) => key)
        criteria = selected
      }

      return {
        type: filter.type,
        criteria: criteria,
        ...(index > 0 && filter.operation ? { operator: filter.operation } : {})
      }
    })

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

    // Call parent with combined results and filters in new format
    onFilterChange(combinedUserIds, backendFilters)
  }

  const handleOperationSelect = operation => {
    setShowOperationDialog(false)
    if (pendingFilterData) {
      const { newFilters, filteredUserIds, criteria } = pendingFilterData
      applyFilterWithOperation(newFilters, filteredUserIds, criteria, operation)
    }
  }

  const applyFilters = () => {
    console.log('applyFilters called, isEditMode:', isEditMode, 'editingFilter:', editingFilter)
    console.log('Current filters state:', filters)

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

      console.log('Processing age filter:', { minAge, maxAge })

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

      console.log('Age filter matched users:', filteredUserIds.length)

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
      console.log('Processing location filter:', filters.location)

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

      console.log('Location filter matched users:', filteredUserIds.length)

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
      console.log('Processing gender filter:', filters.gender)

      const selectedGenders = []
      if (filters.gender.male) selectedGenders.push('male')
      if (filters.gender.female) selectedGenders.push('female')
      if (filters.gender.other) selectedGenders.push('other')

      console.log('Selected genders:', selectedGenders)

      if (selectedGenders.length > 0) {
        users.forEach(user => {
          const userGender = user.profile?.gender?.toLowerCase()
          if (userGender && selectedGenders.includes(userGender)) {
            filteredUserIds.push(user._id)
          }
        })

        console.log('Gender filter matched users:', filteredUserIds.length)

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
      console.log('No filters to apply, closing dialog')
      closeFilterDialog() // Close dialog if no filters were applied
      return
    }

    console.log('Final newFilters:', newFilters)
    console.log('Final filteredUserIds:', filteredUserIds)
    console.log('Final criteria:', criteria)

    // Handle editing existing filter
    if (isEditMode && editingFilter) {
      console.log('Editing filter:', editingFilter)
      console.log('New filter values:', newFilters)

      // Remove the old filter and add the new one, preserving the operation
      const originalFilter = selectedFilters[editingFilter.index] || {}
      const updatedFilters = selectedFilters.filter((_, i) => i !== editingFilter.index)
      const updatedSelectedFilters = [
        ...updatedFilters,
        ...newFilters.map(f => ({
          ...f,
          operation: originalFilter.operation || null // Preserve the operation
        }))
      ]

      // Recalculate combined results by reapplying all filters to users
      let combinedUserIds = []

      // Apply each filter to get the filtered user IDs
      updatedSelectedFilters.forEach(filter => {
        let filterUserIds = []

        if (filter.type === 'age' && filter.value) {
          console.log('Applying age filter:', filter.value)
          users.forEach(user => {
            const userAge = user.profile?.age
            const hasAge = userAge !== undefined && userAge !== null
            const ageMatches = hasAge && userAge >= filter.value.min && userAge <= filter.value.max
            if (ageMatches) {
              filterUserIds.push(user._id)
            }
          })
          console.log('Age filter matched users:', filterUserIds.length)
        } else if (filter.type === 'location' && filter.value) {
          console.log('Applying location filter:', filter.value)
          users.forEach(user => {
            const profile = user.profile || {}
            const countryMatch =
              !filter.value.country ||
              (profile.country && profile.country.toLowerCase() === filter.value.country.toLowerCase())
            const stateMatch =
              !filter.value.state ||
              (profile.region && profile.region.toLowerCase() === filter.value.state.toLowerCase())
            const cityMatch =
              !filter.value.city ||
              (profile.locality && profile.locality.toLowerCase() === filter.value.city.toLowerCase())

            if (countryMatch && stateMatch && cityMatch) {
              filterUserIds.push(user._id)
            }
          })
          console.log('Location filter matched users:', filterUserIds.length)
        } else if (filter.type === 'gender' && filter.value) {
          console.log('Applying gender filter:', filter.value)
          const selectedGenders = Object.entries(filter.value)
            .filter(([, isOn]) => Boolean(isOn))
            .map(([key]) => key)

          users.forEach(user => {
            const userGender = user.profile?.gender?.toLowerCase()
            if (userGender && selectedGenders.includes(userGender)) {
              filterUserIds.push(user._id)
            }
          })
          console.log('Gender filter matched users:', filterUserIds.length)
        }

        // Update the filter with the calculated user IDs
        filter.userIds = filterUserIds
      })

      // Apply operations in sequence
      combinedUserIds = updatedSelectedFilters.reduce((acc, filter, index) => {
        const currentIds = Array.isArray(filter.userIds) ? filter.userIds : []

        if (index === 0) {
          // First filter - start with its user IDs
          return currentIds
        }

        const operation = filter.operation || 'AND'

        if (operation === 'AND') {
          // Intersection: Keep only users in both sets
          return acc.filter(id => currentIds.includes(id))
        } else if (operation === 'OR') {
          // Union: Combine users from both sets
          return [...new Set([...acc, ...currentIds])]
        } else if (operation === 'NOT') {
          // Exclusion: Remove users that match this filter
          const excludeIds = new Set(currentIds)
          return acc.filter(id => !excludeIds.has(id))
        }

        // Default to AND if operation is unknown
        return acc.filter(id => currentIds.includes(id))
      }, [])

      console.log('Final combined user IDs:', combinedUserIds.length)

      setSelectedFilters(updatedSelectedFilters)

      // Update matched/unmatched users
      const matched = users.filter(user => combinedUserIds.includes(user._id))
      const unmatched = users.filter(user => !combinedUserIds.includes(user._id))
      setMatchedUsers(matched)
      setUnmatchedUsers(unmatched)

      // Build filters array for backend in new format
      const backendFilters = updatedSelectedFilters.map((filter, index) => {
        let criteria = {}

        if (filter.type === 'age' && filter.value) {
          criteria = { min: filter.value.min, max: filter.value.max }
        } else if (filter.type === 'location' && filter.value) {
          criteria = {
            country: filter.value.country || '',
            region: filter.value.state || filter.value.region || '',
            city: filter.value.city || ''
          }
        } else if (filter.type === 'gender' && filter.value) {
          const selected = Object.entries(filter.value)
            .filter(([, isOn]) => Boolean(isOn))
            .map(([key]) => key)
          criteria = selected
        }

        return {
          type: filter.type,
          criteria: criteria,
          ...(index > 0 && filter.operation ? { operator: filter.operation } : {})
        }
      })

      onFilterChange(combinedUserIds, backendFilters)
      closeFilterDialog()
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
        [] // Empty filters array
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
        } else if (operation === 'OR') {
          return [...new Set([...acc, ...currentIds])]
        } else if (operation === 'NOT') {
          // Exclusion: Remove users that match this filter
          const excludeIds = new Set(currentIds)
          return acc.filter(id => !excludeIds.has(id))
        }
        // Default to AND if operation is unknown
        return acc.filter(id => currentIds.includes(id))
      }, [])
    }

    const matched = users.filter(user => combinedUserIds.includes(user._id))
    const unmatched = users.filter(user => !combinedUserIds.includes(user._id))
    setMatchedUsers(matched)
    setUnmatchedUsers(unmatched)

    // Build filters array for backend in new format
    const backendFilters = updatedFilters.map((filter, index) => {
      let criteria = {}

      if (filter.type === 'age' && filter.value) {
        criteria = { min: filter.value.min, max: filter.value.max }
      } else if (filter.type === 'location' && filter.value) {
        criteria = {
          country: filter.value.country || '',
          region: filter.value.state || filter.value.region || '',
          city: filter.value.city || ''
        }
      } else if (filter.type === 'gender' && filter.value) {
        const selected = Object.entries(filter.value)
          .filter(([, isOn]) => Boolean(isOn))
          .map(([key]) => key)
        criteria = selected
      }

      return {
        type: filter.type,
        criteria: criteria,
        ...(index > 0 && filter.operation ? { operator: filter.operation } : {})
      }
    })

    onFilterChange(combinedUserIds, backendFilters)
  }

  return (
    <Box sx={{ width: '100%' }}>
      <style>{spinnerStyles}</style>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box>
          <Button
            variant='outlined'
            onClick={handleClick}
            endIcon={<ArrowDropDownIcon />}
            sx={{
              width: { xs: '100%', sm: 'auto' },
              ...(selectedFilters.length > 0 && {
                borderColor: 'primary.main',
                color: 'primary.main',
                fontWeight: 500
              })
            }}
          >
            Group By {selectedFilters.length > 0 && `(${selectedFilters.length})`}
          </Button>
        </Box>

        {selectedFilters.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              maxWidth: '100%',
              overflow: 'visible',
              flexWrap: 'wrap'
            }}
          >
            <Typography sx={{ mr: 1, flexShrink: 0 }}>Filters:</Typography>
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                alignItems: 'center',
                flexWrap: 'wrap'
              }}
            >
              {selectedFilters.map((filter, displayIndex) => {
                const actualIndex = displayIndex

                return (
                  <Chip
                    key={`${filter.type}-${displayIndex}`}
                    label={
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          mr: 1,
                          minWidth: 0,
                          flex: 1
                        }}
                      >
                        {filter.operation && displayIndex > 0 && (
                          <Typography
                            variant='caption'
                            sx={{
                              fontWeight: 700,
                              mr: 0.5,
                              color:
                                theme.palette.mode === 'dark'
                                  ? theme.palette.text.secondary
                                  : theme.palette.text.primary
                            }}
                          >
                            {filter.operation}:
                          </Typography>
                        )}
                        <Typography
                          variant='body2'
                          sx={{
                            flex: 1,
                            minWidth: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            color:
                              theme.palette.mode === 'dark' ? theme.palette.text.secondary : theme.palette.text.primary
                          }}
                        >
                          {filter.label}
                        </Typography>
                        <Tooltip title='edit' arrow>
                          <EditIcon
                            sx={{
                              fontSize: 16,
                              opacity: 0.7,
                              flexShrink: 0,
                              ml: 4,
                              color:
                                theme.palette.mode === 'dark'
                                  ? theme.palette.text.secondary
                                  : theme.palette.text.primary
                            }}
                          />
                        </Tooltip>
                      </Box>
                    }
                    onDelete={() => handleDeleteFilter(actualIndex)}
                    deleteIcon={
                      <Tooltip title='remove' arrow>
                        <CloseIcon
                          sx={{
                            color:
                              theme.palette.mode === 'dark' ? theme.palette.text.secondary : theme.palette.text.primary
                          }}
                        />
                      </Tooltip>
                    }
                    onClick={() => handleEditFilter(filter, actualIndex)}
                    sx={{
                      maxWidth: 250,
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      height: 'auto',
                      '& .MuiChip-deleteIcon': {
                        visibility: 'visible',
                        marginRight: '4px',
                        marginLeft: '0px',
                        color:
                          theme.palette.mode === 'dark' ? theme.palette.text.secondary : theme.palette.text.primary,
                        '&:hover': {
                          backgroundColor: 'transparent',
                          color: theme.palette.mode === 'dark' ? theme.palette.text.primary : theme.palette.text.primary
                        }
                      },
                      '& .MuiChip-label': {
                        paddingRight: '0px',
                        paddingLeft: '10px',
                        height: 'auto',
                        minHeight: '35px',
                        display: 'flex',
                        alignItems: 'center',
                        color: theme.palette.mode === 'dark' ? theme.palette.text.secondary : theme.palette.text.primary
                      }
                    }}
                  />
                )
              })}
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
        <MenuItem
          onClick={() => handleGroupBySelect('age')}
          disabled={isFilterTypeApplied('age')}
          sx={{
            '&.Mui-disabled': {
              opacity: 0.5,
              fontStyle: 'italic'
            }
          }}
        >
          Age {isFilterTypeApplied('age') && '(Already Applied)'}
        </MenuItem>
        <MenuItem
          onClick={() => handleGroupBySelect('location')}
          disabled={isFilterTypeApplied('location')}
          sx={{
            '&.Mui-disabled': {
              opacity: 0.5,
              fontStyle: 'italic'
            }
          }}
        >
          Location {isFilterTypeApplied('location') && '(Already Applied)'}
        </MenuItem>
        <MenuItem
          onClick={() => handleGroupBySelect('gender')}
          disabled={isFilterTypeApplied('gender')}
          sx={{
            '&.Mui-disabled': {
              opacity: 0.5,
              fontStyle: 'italic'
            }
          }}
        >
          Gender {isFilterTypeApplied('gender') && '(Already Applied)'}
        </MenuItem>
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
            boxShadow:
              theme.palette.mode === 'dark'
                ? `0 8px 32px ${alpha(theme.palette.common.black, 0.5)}`
                : '0 8px 32px rgba(0,0,0,0.12)'
          }
        }}
      >
        <DialogTitle
          sx={{
            pb: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant='h6' component='div' sx={{ fontWeight: 600 }}>
              {isEditMode ? 'Edit ' : 'Filter by '}
              {groupBy === 'age' && 'Age Range'}
              {groupBy === 'location' && 'Location'}
              {groupBy === 'gender' && 'Gender'}
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
              {isEditMode ? 'Update the ' : 'Select the '}
              {groupBy === 'age' && 'age range to filter users'}
              {groupBy === 'location' && 'country, region, and city to filter users'}
              {groupBy === 'gender' && 'gender(s) to filter users'}
            </Typography>
          </Box>
          <IconButtonTooltip
            title='Close'
            onClick={closeFilterDialog}
            sx={{
              color: theme => theme.palette.text.secondary,
              '&:hover i': { color: theme => theme.palette.text.primary }
            }}
          >
            <i className='ri-close-line text-xl' />
          </IconButtonTooltip>
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
                          bgcolor:
                            theme.palette.mode === 'dark'
                              ? alpha(theme.palette.action.hover, 0.5)
                              : theme.palette.action.hover,
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
                            border: `2px solid ${
                              theme.palette.mode === 'dark' ? alpha(theme.palette.divider, 0.5) : '#e3e3e3'
                            }`,
                            borderTop: `2px solid ${theme.palette.primary.main}`,
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
                    <FormControlLabel
                      fullWidth
                      control={
                        <Checkbox
                          checked={filters.gender[gender.key]}
                          onChange={e => handleFilterChange('gender', gender.key, e.target.checked)}
                          sx={{ mr: 1 }}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography
                            variant='h6'
                            sx={{
                              color: filters.gender[gender.key]
                                ? theme.palette.mode === 'dark'
                                  ? theme.palette.common.white
                                  : theme.palette.common.white
                                : 'inherit'
                            }}
                          >
                            {gender.icon}
                          </Typography>
                          <Typography
                            variant='body1'
                            sx={{
                              fontWeight: 500,
                              color: filters.gender[gender.key]
                                ? theme.palette.mode === 'dark'
                                  ? theme.palette.common.white
                                  : theme.palette.common.white
                                : 'inherit'
                            }}
                          >
                            {gender.label}
                          </Typography>
                        </Box>
                      }
                      sx={{
                        m: 0,
                        width: '100%',
                        border: '2px solid',
                        borderColor: filters.gender[gender.key] ? 'primary.main' : 'divider',
                        borderRadius: 2,
                        bgcolor: filters.gender[gender.key] ? 'primary.main' : 'background.paper',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: filters.gender[gender.key] ? 'primary.main' : 'action.hover'
                        }
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={closeFilterDialog}
            variant='outlined'
            sx={{
              color: theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.text.primary
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={applyFilters}
            component='label'
            variant='contained'
            color='primary'
            style={{ color: 'white' }}
            disabled={
              (groupBy === 'age' && !filters.age.min && !filters.age.max) ||
              (groupBy === 'location' && !filters.location.country) ||
              (groupBy === 'gender' && !Object.values(filters.gender).some(Boolean))
            }
          >
            {isEditMode ? 'Update' : 'Submit'}
          </Button>
          {/* <Button
            onClick={handleSubmit}
            component='label'
            variant='contained'
            color='primary'
            style={{ color: 'white' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Group'}
          </Button> */}
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
