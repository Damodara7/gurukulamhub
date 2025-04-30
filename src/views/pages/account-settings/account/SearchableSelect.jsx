'use client'

import { Autocomplete, TextField } from '@mui/material'
import { useState } from 'react'

const SearchableSelect = ({ options, value, onChange, label, name }) => {
  const [inputValue, setInputValue] = useState('')

  return (
    <Autocomplete
      fullWidth
      value={value}
      onChange={(event, newValue) => {
        onChange(newValue)
      }}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue)
      }}
      options={options}
      renderInput={params => <TextField fullWidth {...params} name={name} label={label} />}
    />
  )
}

export default SearchableSelect
