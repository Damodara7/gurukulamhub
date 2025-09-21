import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack
} from '@mui/material'
import React, { useState } from 'react'

const languageOptions = [
  'Arabic',
  'Assamese',
  'Awadhi',
  'Bengali',
  'Bhojpuri',
  'Chinese',
  'English',
  'French',
  'German',
  'Gujarati',
  'Hindi',
  'Haryanvi',
  'Kannada',
  'Konkani',
  'Magahi',
  'Malayalam',
  'Marathi',
  'Nepali',
  'Odia',
  'Portuguese',
  'Punjabi',
  'Sanskrit',
  'Sindhi',
  'Tamil',
  'Telugu',
  'Urdu'
]

const initialFormData = {
  language: '',
  canRead: false,
  canWrite: false,
  canSpeak: false
}

function NewLanguageModal({ open, onClose, email, onAddLanguageToState }) {
  const [formData, setFormData] = useState(initialFormData)
  const [isFormValid, setIsFormValid] = useState(true)
  const [isFormSubmitting, setIsFormSubmitting] = useState(false)

  function handleClose() {
    setFormData(initialFormData)
    setIsFormValid(true)
    onClose()
  }

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  function handleSubmit() {
    setIsFormSubmitting(true)
    // Validate form
    if (!formData.language.trim() || (!formData.canRead && !formData.canWrite && !formData.canSpeak)) {
      setIsFormValid(false)
      setIsFormSubmitting(false)
      return
    }

    setIsFormValid(true)

    try {
      // Add language to state instead of hitting endpoint
      const newLanguage = {
        _id: `temp_${Date.now()}`, // Temporary ID for state management
        language: formData.language,
        canRead: formData.canRead,
        canWrite: formData.canWrite,
        canSpeak: formData.canSpeak
      }

      onAddLanguageToState(newLanguage)
      console.log('Language added to state:', newLanguage)
      onClose()
    } catch (error) {
      console.error('Unexpected error:', error)
    } finally {
      setIsFormSubmitting(false)
    }
  }

  return (
    <Grid xs={12} sm={8} md={6}>
      <Dialog sx={{ width: '100%', margin: 'auto' }} open={open} onClose={handleClose}>
        <DialogTitle>Add a New Language</DialogTitle>

        <DialogContent>
          <form>
            <Grid container spacing={5}>
              {/* Language */}
              <Grid item xs={12}>
                <FormControl fullWidth required error={!isFormValid && !formData.language.trim()}>
                  <InputLabel>Language</InputLabel>
                  <Select
                    fullWidth
                    label='Language'
                    value={formData.language}
                    error={!isFormValid && !formData.language.trim()}
                    onChange={e => handleFormChange('language', e.target.value)}
                  >
                    {languageOptions.map(lang => (
                      <MenuItem key={lang} value={lang}>
                        {lang}
                      </MenuItem>
                    ))}
                  </Select>
                  {!isFormValid && formData.language.trim().length === 0 && (
                    <FormHelperText>Language is a required field!</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* Can Read */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.canRead}
                      onChange={(e, checked) => handleFormChange('canRead', checked)}
                    />
                  }
                  label='Can Read'
                />
              </Grid>

              {/* Can Write */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.canWrite}
                      onChange={(e, checked) => handleFormChange('canWrite', checked)}
                    />
                  }
                  label='Can Write'
                />
              </Grid>

              {/* Can Speak */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.canSpeak}
                      onChange={(e, checked) => handleFormChange('canSpeak', checked)}
                    />
                  }
                  label='Can Speak'
                />
              </Grid>
            </Grid>
          </form>

          {!isFormValid &&
            formData.language.trim() &&
            !formData.canRead &&
            !formData.canWrite &&
            !formData.canSpeak && (
              <FormControl error>
                <FormHelperText>Please select at least one language skill: read, write, or speak.</FormHelperText>
              </FormControl>
            )}
        </DialogContent>

        <DialogActions>
          <Grid item xs={12} mt={4}>
            <Stack direction='row' spacing={2} justifyContent='center'>
              <Button variant='outlined' onClick={handleClose} disabled={isFormSubmitting}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                component='label'
                variant='contained'
                color='primary'
                style={{ color: 'white' }}
                disabled={isFormSubmitting}
              >
                {isFormSubmitting ? 'Saving...' : 'Save language'}
              </Button>
            </Stack>
          </Grid>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default NewLanguageModal
