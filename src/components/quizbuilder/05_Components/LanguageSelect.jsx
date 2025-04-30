import React, { useEffect, useState } from 'react'
import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import languagesData from './languages.en.json'

const LanguageSelect = ({
  onSelectLanguage = () => {}, // Callback when a language is selected
  setTheFormValue, // Function to update form values
  defaultLanguage = null, // Initial selected language
  fieldName, // Field name for form integration
  removeLanguages = [], // Array of languages to exclude
  ...restProps // Spread other props to Autocomplete
}) => {
  const [language, setLanguage] = useState(defaultLanguage)

  useEffect(() => {
    if (defaultLanguage && defaultLanguage !== language) {
      handleChange(defaultLanguage)
    }
  }, []) // Only runs when defaultLanguage changes

  const handleChange = newValue => {
    console.log('selected language', newValue)
    setLanguage(newValue) // Update local state
    onSelectLanguage(newValue) // Trigger callback
    if (setTheFormValue && fieldName) {
      setTheFormValue(fieldName, newValue) // Update form value
    }
  }

  // Filter out languages listed in removeLanguages
  const filteredLanguages = languagesData.filter(
    language => !removeLanguages.some(removedLang => removedLang.code === language.code)
  )

  return (
    <Autocomplete
      {...restProps}
      sx={{ minWidth: 120 }}
      disableClearable // Prevent clearing the value
      options={filteredLanguages} // Filtered list of languages
      getOptionLabel={option => `${option.name} (${option.code})`} // Display language name and code
      isOptionEqualToValue={(option, value) => option.code === value?.code} // Equality check
      value={language} // Controlled value
      onChange={(event, newValue) => handleChange(newValue)} // Handle change
      renderInput={params => (
        <TextField {...params} InputLabelProps={{ shrink: true }} label='Language' variant='outlined' />
      )}
    />
  )
}

export default LanguageSelect
