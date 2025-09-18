import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField
} from '@mui/material'
import React, { useState } from 'react'

import * as RestApi from '@/utils/restApiUtil'
import * as clientApi from '@/app/api/client/client.api'
import { API_URLS } from '@/configs/apiConfig'

import { DemoContainer } from '@mui/x-date-pickers/internals/demo'
import { LocalizationProvider } from '@mui/x-date-pickers-pro/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers-pro/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers'
import dayjs from 'dayjs'
import { toast } from 'react-toastify'

const initialFormData = {
  organization: '',
  organizationType: '',
  websiteUrl: ''
}

const associatedOrganizationTypeOptions = [
  { value: 'NGO', label: 'NGO' },
  { value: 'Trust', label: 'Trust' },
  { value: 'Private Company', label: 'Private Company' },
  { value: 'Government Agency', label: 'Government Agency' },
  { value: 'Non-Profit', label: 'Non-Profit' },
  { value: 'Educational Institution', label: 'Educational Institution' },
  { value: 'Community Group', label: 'Community Group' },
  { value: 'Others', label: 'Others' }
]

function NewAssociatedOrganization({ open, onClose, email, onRefetchUserProfileData }) {
  const [formData, setFormData] = useState(initialFormData)
  const [isFormValid, setIsFormValid] = useState(true)
  const [isFormSubmitting, setIsFormSubmitting] = useState(false)

  function handleClose() {
    setFormData(initialFormData)
    setIsFormValid(true)
    onClose()
  }

  const handleFormChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
  }
  async function handleSubmit() {
    // Validate form
    setIsFormSubmitting(true)

    if (!formData.organization || !formData.websiteUrl) {
      setIsFormValid(false)
      setIsFormSubmitting(false)
      return
    }

    setIsFormValid(true)

    try {
      // Make API request to add new Associated Organization details
      const response = await RestApi.post(`${API_URLS.v0.USERS_PROFILE}/associated-organizations`, {
        email,
        organization: formData
      })
      // const response = await clientApi.addAssociatedOrganization(email, formData)

      if (response.status === 'success') {
        // Optionally update local state or refetch data
        console.log('Associated Organization details added successfully:', response.result)
        toast.success('Associated Organization details added successfully.')
        onClose()
        onRefetchUserProfileData()
      } else {
        toast.error('Error: ' + response.message)
        console.error('Error adding associated organization details:', response)
      }
    } catch (error) {
      toast.error('An unexpected error occurred.')
      console.error('Unexpected error:', error)
    } finally {
      setIsFormSubmitting(false)
    }
  }

  return (
    <Grid xs={12} sm={8} md={6}>
      <Dialog sx={{ width: '100%', margin: 'auto' }} open={open} onClose={handleClose}>
        <DialogTitle>Add Associated Organization</DialogTitle>

        <DialogContent>
          <form>
            <Grid container spacing={5}>
              {/* Organization */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Organization'
                  required
                  value={formData.organization}
                  placeholder='Ex: Triesoltech'
                  onChange={e => handleFormChange('organization', e.target.value)}
                  error={!isFormValid && !formData.organization}
                  helperText={!isFormValid && !formData.organization ? 'Organization is a required field!' : ''}
                />
              </Grid>

              {/* Organization Type */}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Organization Type</InputLabel>
                  <Select
                    value={formData.organizationType}
                    onChange={e => handleFormChange('organizationType', e.target.value)}
                    label='Organization Type'
                  >
                    {associatedOrganizationTypeOptions.map((each, index) => (
                      <MenuItem key={each.label} value={each.value}>
                        {each.value}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Website Url */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Organization Website Url'
                  name='websiteUrl'
                  required
                  value={formData.websiteUrl}
                  placeholder='Ex: https://www.triesoltech.com'
                  onChange={e => handleFormChange('websiteUrl', e.target.value)}
                  error={!isFormValid && !formData.websiteUrl}
                  helperText={
                    !isFormValid && !formData.websiteUrl ? 'Organization Website Url is a required field!' : ''
                  }
                />
              </Grid>
            </Grid>
          </form>
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

export default NewAssociatedOrganization
