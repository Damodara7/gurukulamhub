import React, { useState } from 'react'
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material'

const GenericSelectFilter = ({ label, size = 'medium', options, defaultValue, onChange }) => {
  const [selectedValue, setSelectedValue] = useState(defaultValue)

  const handleChange = event => {
    const value = event.target.value
    setSelectedValue(value)
    if (onChange) {
      onChange(value) // Call the passed onChange handler if provided
    }
  }

  return (
    <FormControl fullWidth>
      <InputLabel id={`${label}-label`}>{label}</InputLabel>
      <Select labelId={`${label}-label`} value={selectedValue} onChange={handleChange} label={label} size={size}>
        {options.map(option => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

export default GenericSelectFilter
