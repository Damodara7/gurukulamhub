import React from 'react'
import { FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText, Chip, FormHelperText } from '@mui/material'

export default function MultiSelect({
  options = [],
  selectedValues = [],
  onChange = () => {},
  label = 'Select Options',
  placeholder = 'No options selected',
  defaultAll = false, // New prop to control "All" behavior
  error='',
}) {
  // Handle "All" logic internally
  const handleChange = event => {
    const { value } = event.target
    const newValue = typeof value === 'string' ? value.split(',') : value

    let updatedValues

    if (defaultAll) {
      if (newValue.length === 0) {
        updatedValues = [] // all
      }
      // If "All" is selected
      else if (newValue.includes('all')) {
        if (newValue[newValue.length - 1] === 'all') {
          // Deselect all other quizzes and set quizzes to "all"
          updatedValues = [] // all
        } else {
          // If quizzes are selected, set quizzes to the selected IDs
          updatedValues = newValue.filter(each => each !== 'all')
        }
      } else {
        updatedValues = newValue
      }
    } else {
      // If "All" behavior is not enabled, use the selected values as-is
      updatedValues = newValue
    }

    // Call the parent onChange with the updated values
    onChange(updatedValues)
  }

  const handleDeleteChip = (chipToDelete, event) => {
    event.stopPropagation() // Prevent opening the dropdown when deleting the chip
    const newValues = selectedValues.filter(val => val !== chipToDelete)
    onChange(newValues)
  }

  return (
    <FormControl fullWidth margin='normal' error={error}>
      <InputLabel id='multi-select-label'>{label}</InputLabel>
      <Select
        labelId='multi-select-label'
        label={label}
        placeholder={placeholder}
        multiple
        value={
          defaultAll
            ? selectedValues.length === 0 || (selectedValues.length === 1 && selectedValues[0] === 'all')
              ? ['all']
              : selectedValues
            : selectedValues
        }
        onChange={handleChange}
        renderValue={selected =>
          selected.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {() => {
                console.log('selected', selected)
              }}
              {selected.map(val => {
                const selectedOption = options.find(option => option.value === val)
                return (
                  <Chip
                    key={val}
                    clickable
                    deleteIcon={
                      <i
                        className='ri-close-circle-fill'
                        onMouseDown={event => event.stopPropagation()} // Prevent closing Select when clicking icon
                      />
                    }
                    label={selectedOption?.selectedLabel || selectedOption?.label || val}
                    onDelete={event => handleDeleteChip(val, event)} // Pass event to stop propagation
                    size='small'
                    style={{ margin: '4px 0' }}
                  />
                )
              })}
            </div>
          ) : (
            <em>{placeholder}</em>
          )
        }
      >
        {defaultAll && (
          <MenuItem value={'all'}>
            <Checkbox checked={selectedValues.length === 0} />
            <ListItemText primary={'All'} />
          </MenuItem>
        )}
        {options.map(option => (
          <MenuItem key={option.value} value={option.value}>
            <Checkbox checked={selectedValues.includes(option.value)} />
            <ListItemText primary={option?.optionLabel || option?.label} />
          </MenuItem>
        ))}
      </Select>
      {error && <FormHelperText error>{error}</FormHelperText>}
    </FormControl>
  )
}
