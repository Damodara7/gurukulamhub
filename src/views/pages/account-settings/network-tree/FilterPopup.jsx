import React, { useState } from 'react'
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Chip,
  Box,
  useMediaQuery,
  Grid,
  useTheme,
  alpha
} from '@mui/material'
import { toast } from 'react-toastify'

const FilterPopup = ({ open, onClose, onFilterSet, defaultFilterType = 'age', filterEditingData = null }) => {
  const theme = useTheme()
  const isDarkMode = theme.palette.mode === 'dark'
  const [filterType, setFilterType] = useState(defaultFilterType)
  const [ageInput, setAgeInput] = useState(
    defaultFilterType === 'age' && filterEditingData
      ? { min: filterEditingData.min.toString(), max: filterEditingData.max.toString() }
      : { min: '', max: '' }
  )
  const [gender, setGender] = useState(defaultFilterType === 'gender' && filterEditingData ? [filterEditingData] : [])

  const isSmallScreen = useMediaQuery(theme => theme.breakpoints.down('sm'))

  const handleFilterSet = () => {
    if (filterType === 'age') {
      if (
        !ageInput.max ||
        !ageInput.min ||
        ageInput.min.includes('e') ||
        ageInput.max.includes('e') ||
        +ageInput.min > +ageInput.max ||
        +ageInput.min < 6 ||
        +ageInput.max > 120
      ) {
        // toast.error('Invalid age input.')
        return
      }
    } else if (filterType === 'gender') {
      if (!gender.length > 0) {
        // toast.error('Select at least one gender.')
        return
      }
    }
    let numberAgeInput = { min: +ageInput.min, max: +ageInput.max }
    if (filterEditingData) {
    }
    onFilterSet({ filterType, ageInput: numberAgeInput, gender })
    onClose()
  }

  //   const handleFilterSet = () => {
  //     if (filterType === 'age') {
  //       // Validate the age input
  //       if (
  //         !ageInput.max ||
  //         !ageInput.min ||
  //         ageInput.min.includes('e') ||
  //         ageInput.max.includes('e') ||
  //         +ageInput.min > +ageInput.max ||
  //         +ageInput.min < 6 ||
  //         +ageInput.max > 120
  //       ) {
  //         // toast.error('Invalid age input.')
  //         return
  //       }

  //       const numberAgeInput = { min: +ageInput.min, max: +ageInput.max }

  //       // Handle updating existing filter or adding new filter
  //       if (filterEditingData) {
  //         // Update the existing filter
  //         onFilterSet({
  //           filterType,
  //           ageInput: numberAgeInput,
  //           gender: []
  //         })
  //       } else {
  //         // Add a new filter
  //         onFilterSet({
  //           filterType,
  //           ageInput: numberAgeInput,
  //           gender: []
  //         })
  //       }
  //     } else if (filterType === 'gender') {
  //       if (!gender.length > 0) {
  //         // toast.error('Select at least one gender.')
  //         return
  //       }

  //       // Handle updating existing filter or adding new filter
  //       if (filterEditingData) {
  //         onFilterSet({
  //           filterType,
  //           ageInput: {},
  //           gender
  //         })
  //       } else {
  //         onFilterSet({
  //           filterType,
  //           ageInput: {},
  //           gender
  //         })
  //       }
  //     }
  //     onClose() // Close the popup
  //   }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '90%', sm: '70%', md: '50%' },
          margin: 'auto',
          bgcolor: isDarkMode ? alpha(theme.palette.background.paper, 0.95) : 'white',
          borderRadius: { xs: 2, sm: 3 }
        }
      }}
    >
      <DialogTitle
        sx={{
          fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' },
          color: isDarkMode ? theme.palette.common.white : 'text.primary',
          fontWeight: 700,
          pb: { xs: 1.5, sm: 2 }
        }}
      >
        Filter By
      </DialogTitle>
      <DialogContent>
        <FormControl fullWidth margin='normal'>
          <InputLabel id='filter-type-label'>Filter By</InputLabel>
          <Select
            labelId='filter-type-label'
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            label='Filter By'
            disabled={filterEditingData}
          >
            <MenuItem value='age'>Age</MenuItem>
            <MenuItem value='gender'>Gender</MenuItem>
          </Select>
        </FormControl>

        {filterType === 'age' && (
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label='Min'
                variant='outlined'
                type='number'
                fullWidth
                margin='normal'
                value={ageInput.min}
                onChange={e => setAgeInput(prev => ({ ...prev, min: e.target.value }))}
                InputProps={{ min: 6, max: ageInput.max || 120 }}
                InputLabelProps={{
                  shrink: true
                }}
                placeholder='Enter min age'
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label='Max'
                variant='outlined'
                fullWidth
                type='number'
                margin='normal'
                value={ageInput.max}
                onChange={e => setAgeInput(prev => ({ ...prev, max: e.target.value }))}
                InputProps={{ min: ageInput.min || 6, max: 120 }}
                InputLabelProps={{
                  shrink: true
                }}
                placeholder='Enter max age'
              />
            </Grid>
          </Grid>
        )}

        {filterType === 'gender' && (
          <FormControl fullWidth margin='normal'>
            <InputLabel id='gender-label'>Gender</InputLabel>
            <Select
              labelId='gender-label'
              label='Gender'
              multiple
              fullWidth
              value={gender}
              onChange={e => setGender(e.target.value)}
              renderValue={selected => selected.join(', ')}
              placeholder='Select a gender'
            >
              <MenuItem value='male'>Male</MenuItem>
              <MenuItem value='female'>Female</MenuItem>
              <MenuItem value='transgender'>Transgender</MenuItem>
            </Select>
          </FormControl>
        )}
      </DialogContent>
      <DialogActions
        sx={{
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 1.5 },
          px: { xs: 2, sm: 3 },
          pb: { xs: 2, sm: 3 }
        }}
      >
        <Button
          onClick={handleFilterSet}
          color='primary'
          variant='contained'
          fullWidth={isSmallScreen}
          sx={{
            py: { xs: 1.25, sm: 1.5 },
            fontSize: { xs: '0.9rem', sm: '1rem' },
            borderRadius: { xs: 1.5, sm: 2 },
            color: 'white',
            boxShadow: isDarkMode ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}` : undefined,
            '&:hover': {
              boxShadow: isDarkMode ? `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}` : undefined
            }
          }}
        >
          Set Filter
        </Button>
        <Button
          onClick={onClose}
          color='secondary'
          variant='outlined'
          fullWidth={isSmallScreen}
          sx={{
            py: { xs: 1.25, sm: 1.5 },
            fontSize: { xs: '0.9rem', sm: '1rem' },
            borderRadius: { xs: 1.5, sm: 2 },
            ...(isDarkMode && {
              borderColor: alpha(theme.palette.divider, 0.3),
              color: theme.palette.common.white,
              '&:hover': {
                borderColor: alpha(theme.palette.secondary.main, 0.5),
                backgroundColor: alpha(theme.palette.secondary.main, 0.08)
              }
            })
          }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default FilterPopup
