'use client'
import React, { useState } from 'react'
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
  Checkbox
} from '@mui/material'
import { ArrowDropDown as ArrowDropDownIcon, Close as CloseIcon } from '@mui/icons-material'

const GroupByFilter = () => {
  const [anchorEl, setAnchorEl] = useState(null)
  const [groupBy, setGroupBy] = useState(null)
  const [filters, setFilters] = useState({
    age: { min: '', max: '' },
    location: { country: '', state: '', city: '' },
    gender: { male: false, female: false, other: false }
  })
  const [selectedFilters, setSelectedFilters] = useState([])

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

  const handleFilterChange = (type, field, value) => {
    setFilters(prev => ({
      ...prev,
      [type]: { ...prev[type], [field]: value }
    }))
  }

  const applyFilters = () => {
    const newFilters = []

    if (groupBy === 'age' && (filters.age.min || filters.age.max)) {
      newFilters.push({
        type: 'age',
        label: `Age: ${filters.age.min || '0'} - ${filters.age.max || '100'}`,
        value: { min: filters.age.min, max: filters.age.max }
      })
    }

    if (groupBy === 'location' && (filters.location.country || filters.location.state || filters.location.city)) {
      newFilters.push({
        type: 'location',
        label: `Location: ${[filters.location.country, filters.location.state, filters.location.city]
          .filter(Boolean)
          .join(', ')}`,
        value: { ...filters.location }
      })
    }

    if (groupBy === 'gender') {
      const selectedGenders = []
      if (filters.gender.male) selectedGenders.push('Male')
      if (filters.gender.female) selectedGenders.push('Female')
      if (filters.gender.other) selectedGenders.push('Other')

      if (selectedGenders.length > 0) {
        newFilters.push({
          type: 'gender',
          label: `Gender: ${selectedGenders.join(', ')}`,
          value: { ...filters.gender }
        })
      }
    }

    setSelectedFilters(newFilters)
    setGroupBy(null)
  }

  const handleDeleteFilter = index => {
    setSelectedFilters(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <Box>
      <Stack direction='row' spacing={2} alignItems='center'>
        <Button variant='outlined' onClick={handleClick} endIcon={<ArrowDropDownIcon />} sx={{ minWidth: 120 }}>
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

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
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
          <Stack spacing={2} sx={{ mb: 2 }}>
            <TextField
              label='Country'
              value={filters.location.country}
              onChange={e => handleFilterChange('location', 'country', e.target.value)}
            />
            <TextField
              label='State'
              value={filters.location.state}
              onChange={e => handleFilterChange('location', 'state', e.target.value)}
            />
            <TextField
              label='City'
              value={filters.location.city}
              onChange={e => handleFilterChange('location', 'city', e.target.value)}
            />
          </Stack>
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
