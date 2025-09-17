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
  Select
} from '@mui/material'
import React, { useState } from 'react'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import * as clientApi from '@/app/api/client/client.api'
import { toast } from 'react-toastify'

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

function NewLanguageModal({ open, onClose, email, onRefetchUserProfileData }) {
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

  async function handleSubmit() {
    setIsFormSubmitting(true)
    // Validate form
    if (!formData.language.trim() || (!formData.canRead && !formData.canWrite && !formData.canSpeak)) {
      setIsFormValid(false)
      setIsFormSubmitting(false)
      return
    }

    setIsFormValid(true)

    try {
      // Make API request to add new language details
      const response = await RestApi.post(`${API_URLS.v0.USERS_PROFILE}/languages`, {
        email,
        language: { ...formData }
      })
      // const response = await clientApi.addLanguage(email, formData)

      if (response.status === 'success') {
        // Optionally update local state or refetch data
        console.log('Language details added successfully:', response.result)
        // toast.success('Language details added successfully.')
        onClose()
        onRefetchUserProfileData()
      } else {
        // toast.error('Error: ' + response.message)
        console.error('Error adding language details:', response.message)
      }
    } catch (error) {
      // toast.error('An unexpected error occurred.')
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
          <Grid container xs={12}>
            {/* Actions */}
            <Grid item xs={12} className='flex gap-4 flex-wrap'>
              <Button disabled={isFormSubmitting} variant='contained' type='submit' onClick={handleSubmit}>
                Save
              </Button>
              <Button variant='outlined' type='reset' color='secondary' onClick={handleClose}>
                Close
              </Button>
            </Grid>
          </Grid>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default NewLanguageModal
