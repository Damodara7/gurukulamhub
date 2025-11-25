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
import IconButtonTooltip from '@/components/IconButtonTooltip'
import { alpha } from '@mui/material/styles'
import {
  ArrowDropDown as ArrowDropDownIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Cake as CakeIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon
} from '@mui/icons-material'
import * as RestApi from '@/utils/restApiUtil'
import CountryRegionDropdown from '@/views/pages/auth/register-multi-steps/CountryRegionDropdown'

// Add CSS for spinner animation
const spinnerStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`

const AudienceByFilter = ({
  users,
  onFilterChange,
  initialCriteria = {
    ageGroup: null,
    location: null,
    gender: null
  },
  initialCanonicalFilters = []
}) => {
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
  const [combinedCriteria, setCombinedCriteria] = useState(initialCriteria)
  const [editingFilter, setEditingFilter] = useState(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const filterSequenceRef = useRef(0)

  const canonicalFilterHandlers = {
    age: (user, criteria) => {
      const age = user.profile?.age
      if (typeof age !== 'number') return false
      const { min, max } = criteria || {}
      const meetsMin = min === undefined || age >= min
      const meetsMax = max === undefined || age <= max
      return meetsMin && meetsMax
    },
    location: (user, criteria) => {
      const userCountry = user.profile?.country
      const userRegion = user.profile?.region
      const userLocality = user.profile?.locality

      const matchesCountry =
        !criteria?.country ||
        (typeof userCountry === 'string' && userCountry.trim().toLowerCase() === criteria.country.toLowerCase())
      const matchesRegion =
        !criteria?.region ||
        (typeof userRegion === 'string' && userRegion.trim().toLowerCase() === criteria.region.toLowerCase())
      const matchesCity =
        !criteria?.city ||
        (typeof userLocality === 'string' && userLocality.trim().toLowerCase() === criteria.city.toLowerCase())

      return matchesCountry && matchesRegion && matchesCity
    },
    gender: (user, criteria) => {
      const gender = user.profile?.gender
      if (typeof gender !== 'string') return false
      const selected = Array.isArray(criteria?.values) ? criteria.values : []
      return selected.includes(gender.trim().toLowerCase())
    }
  }

  const dedupeUsersById = userList => {
    const map = new Map()
    userList.forEach(user => {
      const id = user._id?.toString()
      if (id && !map.has(id)) {
        map.set(id, user)
      }
    })
    return Array.from(map.values())
  }

  const applyCanonicalFilters = (usersPool, filters = []) => {
    if (!Array.isArray(filters) || filters.length === 0) {
      return usersPool
    }

    const normalized = filters
      .map((filter, index) => ({
        type: filter.type,
        criteria: filter.criteria || {},
        operator: index === 0 ? null : filter.operator || null
      }))
      .filter(Boolean)

    if (normalized.length === 0) {
      return usersPool
    }

    let currentUsers = []

    normalized.forEach((filter, index) => {
      const handler = canonicalFilterHandlers[filter.type]
      if (!handler) {
        return
      }

      const matched = usersPool.filter(user => handler(user, filter.criteria))

      if (index === 0) {
        currentUsers = matched
        return
      }

      const operation = (filter.operator || 'AND').toUpperCase()

      if (operation === 'OR') {
        currentUsers = dedupeUsersById([...currentUsers, ...matched])
      } else {
        const matchedIds = new Set(matched.map(user => user._id?.toString()))
        currentUsers = currentUsers.filter(user => matchedIds.has(user._id?.toString()))
      }
    })

    return dedupeUsersById(currentUsers)
  }

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
    setEditingFilter({ ...filter, index })
    setIsEditMode(true)

    // Set the groupBy to the filter type
    setGroupBy(filter.type)

    // Populate the filters state with existing values
    if (filter.type === 'age') {
      setFilters(prev => ({
        ...prev,
        age: { min: filter.value.min.toString(), max: filter.value.max.toString() }
      }))
    } else if (filter.type === 'location') {
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
      // Convert gender filter value to the format expected by the filter dialog
      let genderFilter = { male: false, female: false, other: false }

      if (filter.value.values && Array.isArray(filter.value.values)) {
        // New format with values array
        filter.value.values.forEach(gender => {
          if (gender === 'male') genderFilter.male = true
          if (gender === 'female') genderFilter.female = true
          if (gender === 'other') genderFilter.other = true
        })
      } else {
        // Old format with boolean properties
        genderFilter = { ...filter.value }
      }

      setFilters(prev => ({
        ...prev,
        gender: genderFilter
      }))
    }

    setShowFilterDialog(true)
  }

  const normalizeCanonicalFilters = canonical =>
    Array.isArray(canonical)
      ? canonical.map((filter, index) => ({
          type: filter.type,
          criteria: filter.criteria || {},
          operator: index === 0 ? null : filter.operator || null
        }))
      : []

  useEffect(() => {
    const canonicalSource = normalizeCanonicalFilters(initialCanonicalFilters)
    if (canonicalSource.length > 0) {
      setCombinedCriteria(buildCombinedCriteria(canonicalSource))
    } else {
      setCombinedCriteria(initialCriteria)
    }
  }, [initialCriteria, initialCanonicalFilters])

  const buildCanonicalFromCriteria = criteria => {
    const canonical = []

    if (criteria?.ageGroup && (criteria.ageGroup.min !== undefined || criteria.ageGroup.max !== undefined)) {
      canonical.push({
        type: 'age',
        criteria: {
          min: criteria.ageGroup.min,
          max: criteria.ageGroup.max
        },
        operator: criteria.ageGroup.operation || null
      })
    }

    if (criteria?.location && (criteria.location.country || criteria.location.region || criteria.location.city)) {
      canonical.push({
        type: 'location',
        criteria: {
          country: criteria.location.country,
          region: criteria.location.region,
          city: criteria.location.city
        },
        operator: criteria.location.operation || null
      })
    }

    if (criteria?.gender) {
      const genderValues = Array.isArray(criteria.gender?.values)
        ? criteria.gender.values
        : Array.isArray(criteria.gender)
          ? criteria.gender
          : []

      if (genderValues.length > 0) {
        canonical.push({
          type: 'gender',
          criteria: { values: genderValues },
          operator: criteria.gender.operation || null
        })
      }
    }

    return canonical
  }

  const hydrateFilterFromCanonical = (canonicalFilter, sequence) => {
    const handler = canonicalFilterHandlers[canonicalFilter.type]
    const matchedUserIds = handler
      ? users.filter(user => handler(user, canonicalFilter.criteria)).map(user => user._id)
      : users.map(user => user._id)

    switch (canonicalFilter.type) {
      case 'age': {
        const min = canonicalFilter.criteria?.min ?? ''
        const max = canonicalFilter.criteria?.max ?? ''
        return {
          type: 'age',
          label: `Age: ${min}${max !== '' ? `-${max}` : '+'}`,
          value: {
            min,
            max
          },
          userIds: matchedUserIds,
          sequence,
          operation: canonicalFilter.operator || null
        }
      }
      case 'location': {
        const country = canonicalFilter.criteria?.country || ''
        const region = canonicalFilter.criteria?.region || ''
        const city = canonicalFilter.criteria?.city || ''
        const parts = [country, region, city].filter(Boolean)
        return {
          type: 'location',
          label: `Location: ${parts.join(', ')}`,
          value: {
            country,
            state: region,
            city
          },
          userIds: matchedUserIds,
          sequence,
          operation: canonicalFilter.operator || null
        }
      }
      case 'gender': {
        const values = Array.isArray(canonicalFilter.criteria?.values) ? canonicalFilter.criteria.values : []
        return {
          type: 'gender',
          label: `Gender: ${values.map(g => String(g).charAt(0).toUpperCase() + String(g).slice(1)).join(', ')}`,
          value: { values },
          userIds: matchedUserIds,
          sequence,
          operation: canonicalFilter.operator || null
        }
      }
      default:
        return null
    }
  }

  // Initialize with existing filters if in edit mode (once)
  useEffect(() => {
    if (didInitFromPropsRef.current) return
    if (!Array.isArray(users) || users.length === 0) return

    const canonicalFromProps = normalizeCanonicalFilters(initialCanonicalFilters)
    const canonical = canonicalFromProps.length > 0 ? canonicalFromProps : buildCanonicalFromCriteria(combinedCriteria)

    if (!canonical || canonical.length === 0) {
      setMatchedUsers(users)
      didInitFromPropsRef.current = true
      return
    }

    const hydratedFilters = canonical.map((filter, index) => hydrateFilterFromCanonical(filter, index)).filter(Boolean)

    const matchedCanonicalUsers = applyCanonicalFilters(users, canonical)

    setSelectedFilters(hydratedFilters)
    setMatchedUsers(matchedCanonicalUsers)
    setCombinedCriteria(buildCombinedCriteria(canonical))
    filterSequenceRef.current = canonical.length

    didInitFromPropsRef.current = true
  }, [combinedCriteria, initialCanonicalFilters, users])

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
        <Button
          onClick={onClose}
          sx={{
            color: theme.palette.mode === 'dark' ? 'white' : 'inherit',
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.1) : 'inherit'
            }
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
      // these is the code for the country regions by using the api below i am doing the different approach
      //     try{
      //     // This would need to be implemented based on your API structure
      //     // For now, we'll use a placeholder
      //     const result = await RestApi.get(`/api/countries/${countryCode}/regions`)
      //     if (result?.status === 'success') {
      //       return result.result || []
      //     }
      //   } catch (error) {
      //     console.error('Error fetching country regions:', error)
      //   }
      //   return []
      // }

      // Import the regions data dynamically to avoid circular dependencies
      const { CountryRegionData } = await import('@/data/regions')

      // Find the country in the data
      const countryData = CountryRegionData.find(
        country =>
          country[1] === countryCode || // Match by country code
          country[0].toLowerCase() === countryCode.toLowerCase() // Match by country name
      )

      if (countryData && countryData[2]) {
        // Parse the regions string format: "Region1~Code1|Region2~Code2|..."
        const regionsString = countryData[2]
        const regions = regionsString.split('|').map(region => {
          const [name] = region.split('~') // Get the region name before the ~
          return name
        })
        return regions
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

  const normalizeFilters = filters =>
    filters.map((filter, index) => {
      const { order, ...rest } = filter
      return {
        ...rest,
        sequence: filter.sequence ?? index,
        operation: index === 0 ? null : filter.operation || null
      }
    })

  const toCanonicalCriteria = filter => {
    switch (filter.type) {
      case 'age':
        return {
          min: filter.value?.min ?? undefined,
          max: filter.value?.max ?? undefined
        }
      case 'location':
        return {
          country: filter.value?.country || '',
          region: filter.value?.state || filter.value?.region || '',
          city: filter.value?.city || ''
        }
      case 'gender': {
        let selected = []

        if (Array.isArray(filter.value?.values)) {
          selected = filter.value.values
        } else if (Array.isArray(filter.value)) {
          selected = filter.value
        } else {
          selected = Object.entries(filter.value || {})
            .filter(([, isOn]) => Boolean(isOn))
            .map(([key]) => key)
        }

        return {
          values: selected
        }
      }
      default:
        return filter.value || {}
    }
  }

  const buildCombinedCriteria = canonicalFilters => {
    const criteria = {
      ageGroup: null,
      location: null,
      gender: null
    }

    canonicalFilters.forEach(filter => {
      if (filter.type === 'age') {
        criteria.ageGroup = {
          ...filter.criteria,
          operation: filter.operator || null
        }
      }

      if (filter.type === 'location') {
        criteria.location = {
          country: filter.criteria?.country || '',
          region: filter.criteria?.region || '',
          city: filter.criteria?.city || '',
          operation: filter.operator || null
        }
      }

      if (filter.type === 'gender') {
        const values = Array.isArray(filter.criteria?.values) ? filter.criteria.values : []
        if (values.length > 0) {
          criteria.gender = {
            values,
            operation: filter.operator || null
          }
        }
      }
    })

    return criteria
  }

  // Helper function to generate dynamic operation data per filter type
  const generateOrderAndOperations = filters => {
    const normalizedFilters = normalizeFilters(filters)
    const operations = {
      ageOperation: null,
      locationOperation: null,
      genderOperation: null
    }

    normalizedFilters.forEach(filter => {
      if (filter.type === 'age') {
        operations.ageOperation = filter.operation || null
      } else if (filter.type === 'location') {
        operations.locationOperation = filter.operation || null
      } else if (filter.type === 'gender') {
        operations.genderOperation = filter.operation || null
      }
    })

    return operations
  }

  const recalculateFiltersState = rawFilters => {
    if (!Array.isArray(rawFilters) || rawFilters.length === 0) {
      setSelectedFilters([])
      setMatchedUsers(users)
      filterSequenceRef.current = 0

      const resetCriteria = {
        ageGroup: null,
        location: null,
        gender: null
      }

      setCombinedCriteria(resetCriteria)
      onFilterChange(
        users.map(user => user._id),
        resetCriteria,
        {
          ageOperation: null,
          locationOperation: null,
          genderOperation: null,
          canonicalFilters: []
        }
      )

      return
    }

    const normalizedFilters = normalizeFilters(rawFilters)
    const sortedNormalized = [...normalizedFilters].sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0))
    const canonicalFilters = []
    sortedNormalized.forEach((filter, index) => {
      canonicalFilters.push({
        type: filter.type,
        criteria: toCanonicalCriteria(filter),
        operator: index === 0 ? null : filter.operation || null
      })
    })

    const matchedUsersCanonical = applyCanonicalFilters(users, canonicalFilters)
    const combinedUserIds = matchedUsersCanonical.map(user => user._id)
    const operations = generateOrderAndOperations(sortedNormalized)
    const nextCriteria = buildCombinedCriteria(canonicalFilters)

    setSelectedFilters(sortedNormalized)
    filterSequenceRef.current = sortedNormalized.length
    setMatchedUsers(matchedUsersCanonical)
    setCombinedCriteria(nextCriteria)
    onFilterChange(combinedUserIds, nextCriteria, {
      ...operations,
      canonicalFilters
    })
  }

  const applyFilterWithOperation = (newFilters, filteredUserIds, operation) => {
    let updatedFilters = []

    if (selectedFilters.length === 0) {
      updatedFilters = newFilters.map(f => ({
        ...f,
        sequence: f.sequence ?? filterSequenceRef.current++,
        userIds: filteredUserIds,
        operation: null
      }))
    } else {
      updatedFilters = [
        ...selectedFilters,
        ...newFilters.map(f => ({
          ...f,
          sequence: f.sequence ?? filterSequenceRef.current++,
          userIds: filteredUserIds,
          operation: operation || null
        }))
      ]
    }

    recalculateFiltersState(updatedFilters)

    resetFilterForm()
  }

  const resetFilterForm = () => {
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

  const handleOperationSelect = operation => {
    setShowOperationDialog(false)
    if (pendingFilterData) {
      const { newFilters, filteredUserIds } = pendingFilterData
      applyFilterWithOperation(newFilters, filteredUserIds, operation)
    }
  }

  const buildFilterForGroup = () => {
    if (groupBy === 'age') {
      if (!filters.age.min && !filters.age.max) {
        return null
      }

      const minAge = parseInt(filters.age.min) || 0
      const maxAge = parseInt(filters.age.max) || 100

      if (minAge < 0 || maxAge < 0) {
        setAgeError('Age values cannot be negative')
        return 'error'
      }

      if (minAge > 120 || maxAge > 120) {
        setAgeError('Age values cannot exceed 120 years')
        return 'error'
      }

      if (minAge >= maxAge) {
        setAgeError('Minimum age must be less than maximum age')
        return 'error'
      }

      if (maxAge - minAge < 1) {
        setAgeError('Age range must be at least 1 year')
        return 'error'
      }

      setAgeError(null)

      const filteredUserIds = users
        .filter(user => {
          const userAge = user.profile?.age
          return typeof userAge === 'number' && userAge >= minAge && userAge <= maxAge
        })
        .map(user => user._id)

      const sequence = editingFilter?.sequence ?? filterSequenceRef.current++

      return {
        filter: {
          type: 'age',
          label: `Age: ${minAge}${maxAge !== 100 ? `-${maxAge}` : '+'}`,
          value: { min: minAge, max: maxAge },
          sequence
        },
        canonical: {
          type: 'age',
          criteria: { min: minAge, max: maxAge },
          operator: null
        },
        filteredUserIds
      }
    }

    if (groupBy === 'location') {
      const filteredUserIds = users
        .filter(user => {
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

          return countryMatch && stateMatch && cityMatch
        })
        .map(user => user._id)

      const locationParts = [filters.location.country, filters.location.state, filters.location.city].filter(Boolean)

      const sequence = editingFilter?.sequence ?? filterSequenceRef.current++

      return {
        filter: {
          type: 'location',
          label: `Location: ${locationParts.join(', ')}`,
          value: { ...filters.location },
          sequence
        },
        canonical: {
          type: 'location',
          criteria: {
            country: filters.location.country,
            region: filters.location.state,
            city: filters.location.city
          },
          operator: null
        },
        filteredUserIds
      }
    }

    if (groupBy === 'gender') {
      const selectedGenders = []
      if (filters.gender.male) selectedGenders.push('male')
      if (filters.gender.female) selectedGenders.push('female')
      if (filters.gender.other) selectedGenders.push('other')

      if (selectedGenders.length === 0) {
        return null
      }

      const filteredUserIds = users
        .filter(user => {
          const userGender = user.profile?.gender?.toLowerCase()
          return userGender && selectedGenders.includes(userGender)
        })
        .map(user => user._id)

      const sequence = editingFilter?.sequence ?? filterSequenceRef.current++

      return {
        filter: {
          type: 'gender',
          label: `Gender: ${selectedGenders
            .map(g => String(g).charAt(0).toUpperCase() + String(g).slice(1))
            .join(', ')}`,
          value: { values: selectedGenders },
          sequence
        },
        canonical: {
          type: 'gender',
          criteria: { values: selectedGenders },
          operator: null
        },
        filteredUserIds
      }
    }

    return null
  }

  const applyFilters = () => {
    const filterResult = buildFilterForGroup()

    if (filterResult === 'error') {
      return
    }

    if (!filterResult) {
      closeFilterDialog()
      return
    }

    const { filter, canonical, filteredUserIds } = filterResult

    const newFilters = [{ ...filter }]
    const canonicalFilters = [{ ...canonical }]

    // Handle editing existing filter
    if (isEditMode && editingFilter) {
      const updatedSelectedFilters = [...selectedFilters]
      const editedFilterIndex = editingFilter.index
      const originalFilter = selectedFilters[editedFilterIndex] || {}

      updatedSelectedFilters[editedFilterIndex] = {
        ...newFilters[0],
        operation: originalFilter.operation || null,
        sequence: originalFilter.sequence,
        userIds: filteredUserIds
      }

      recalculateFiltersState(updatedSelectedFilters)
      closeFilterDialog()
      return
    }

    // If we have existing filters, show operation dialog
    if (selectedFilters.length > 0) {
      setPendingFilterData({ newFilters, filteredUserIds })
      setShowOperationDialog(true)
      closeFilterDialog() // Close the filter dialog before showing operation dialog
      return
    }

    // First filter - apply directly (no operation needed)
    applyFilterWithOperation(newFilters, filteredUserIds, null)
    closeFilterDialog() // Close the filter dialog after applying
  }

  const handleDeleteFilter = index => {
    console.log('🗑️ Deleting filter at index:', index)
    console.log('📋 Current filters:', selectedFilters)

    const updatedFilters = selectedFilters.filter((_, i) => i !== index)
    recalculateFiltersState(updatedFilters)
  }

  // Helper function to apply a single filter to users (returns user objects)
  const applySingleFilterToUsers = (users, filter) => {
    return users.filter(user => {
      const userAge = user.profile?.age
      const userGender = user.profile?.gender
      const userCountry = user.profile?.country
      const userRegion = user.profile?.region
      const userLocality = user.profile?.locality

      switch (filter.type) {
        case 'age':
          const ageGroup = filter.value
          return userAge && userAge >= ageGroup.min && userAge <= ageGroup.max

        case 'location':
          const location = filter.value
          return (
            (!location.country || (userCountry && userCountry.toLowerCase() === location.country.toLowerCase())) &&
            (!location.state || (userRegion && userRegion.toLowerCase() === location.state.toLowerCase())) &&
            (!location.city || (userLocality && userLocality.toLowerCase() === location.city.toLowerCase()))
          )

        case 'gender':
          // Handle both old format {male: true, female: false} and new format {values: ['male'], operation: null}
          let selectedGenders = []
          if (filter.value.values && Array.isArray(filter.value.values)) {
            // New format with values array
            selectedGenders = filter.value.values
          } else {
            // Old format with boolean properties
            selectedGenders = Object.entries(filter.value)
              .filter(([, isOn]) => Boolean(isOn))
              .map(([key]) => key)
          }
          return userGender && selectedGenders.includes(userGender.toLowerCase())

        default:
          return false
      }
    })
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

                // Determine color and icon based on filter type
                const getFilterStyle = () => {
                  if (filter.type === 'age') {
                    return {
                      background: alpha(theme.palette.primary.main, 0.12),
                      borderColor: alpha(theme.palette.primary.main, 0.2),
                      textColor: theme.palette.primary.main,
                      icon: <CakeIcon sx={{ fontSize: 16, color: theme.palette.primary.main, mr: 0.5 }} />
                    }
                  } else if (filter.type === 'gender') {
                    return {
                      background: alpha(theme.palette.grey[400], 0.15),
                      borderColor: alpha(theme.palette.grey[400], 0.2),
                      textColor: theme.palette.grey[600],
                      icon: <PersonIcon sx={{ fontSize: 16, color: theme.palette.grey[600], mr: 0.5 }} />
                    }
                  } else if (filter.type === 'location') {
                    return {
                      background: alpha(theme.palette.grey[500], 0.12),
                      borderColor: alpha(theme.palette.grey[500], 0.25),
                      textColor: theme.palette.grey[700],
                      icon: <LocationIcon sx={{ fontSize: 16, color: theme.palette.grey[700], mr: 0.5 }} />
                    }
                  }
                  return {
                    background: theme.palette.grey[200],
                    borderColor: theme.palette.grey[400],
                    textColor: theme.palette.grey[700],
                    icon: null
                  }
                }

                const filterStyle = getFilterStyle()

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
                        {filterStyle.icon}
                        <Typography
                          variant='body2'
                          sx={{
                            flex: 1,
                            minWidth: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            color: filterStyle.textColor,
                            fontWeight: 600
                          }}
                        >
                          {filter.label}
                        </Typography>
                        <Tooltip title='edit' arrow>
                          <EditIcon
                            sx={{ fontSize: 16, opacity: 0.9, flexShrink: 0, ml: 4, color: filterStyle.textColor }}
                          />
                        </Tooltip>
                      </Box>
                    }
                    onDelete={() => handleDeleteFilter(actualIndex)}
                    deleteIcon={
                      <Tooltip title='remove' arrow>
                        <CloseIcon sx={{ color: filterStyle.textColor }} />
                      </Tooltip>
                    }
                    onClick={() => handleEditFilter(filter, actualIndex)}
                    sx={{
                      maxWidth: 250,
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      height: 'auto',
                      background: filterStyle.background,
                      border: `1px solid ${filterStyle.borderColor}`,
                      boxShadow: `0 1px 3px ${alpha(theme.palette.primary.main, 0.08)}`,
                      '&:hover': {
                        background: filterStyle.background,
                        boxShadow: `0 1px 3px ${alpha(theme.palette.primary.main, 0.08)}`
                      },
                      '& .MuiChip-deleteIcon': {
                        visibility: 'visible',
                        marginRight: '4px',
                        marginLeft: '0px',
                        color: filterStyle.textColor,
                        opacity: 0.9,
                        '&:hover': {
                          backgroundColor: 'transparent',
                          color: filterStyle.textColor,
                          opacity: 1
                        }
                      },
                      '& .MuiChip-label': {
                        paddingRight: '0px',
                        paddingLeft: '10px',
                        height: 'auto',
                        minHeight: '35px',
                        display: 'flex',
                        alignItems: 'center',
                        color: filterStyle.textColor
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
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
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
                              color: filters.gender[gender.key] ? 'white' : 'inherit'
                            }}
                          >
                            {gender.icon}
                          </Typography>
                          <Typography
                            variant='body1'
                            sx={{
                              fontWeight: 500,
                              color: filters.gender[gender.key] ? 'white' : 'inherit'
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
              color: theme.palette.mode === 'dark' ? 'white' : 'inherit',
              borderColor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.3) : 'inherit',
              '&:hover': {
                borderColor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.5) : 'inherit',
                backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.1) : 'inherit'
              }
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
export default AudienceByFilter
