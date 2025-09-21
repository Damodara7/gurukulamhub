import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogContentText,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Stack,
  Box,
  Typography
} from '@mui/material'
import React, { useState, useEffect } from 'react'
import { Edit as EditIcon } from '@mui/icons-material'

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

function NewAssociatedOrganization({
  open,
  onClose,
  email,
  onAddOrganizationToState,
  onUpdateOrganizationInState,
  editingAssociatedOrganization = null
}) {
  const [formData, setFormData] = useState(initialFormData)
  const [isFormValid, setIsFormValid] = useState(true)
  const [isFormSubmitting, setIsFormSubmitting] = useState(false)

  // Populate form data when editing
  useEffect(() => {
    if (editingAssociatedOrganization) {
      setFormData({
        organization: editingAssociatedOrganization.organization || '',
        organizationType: editingAssociatedOrganization.organizationType || '',
        websiteUrl: editingAssociatedOrganization.websiteUrl || ''
      })
    } else {
      setFormData(initialFormData)
    }
  }, [editingAssociatedOrganization])

  function handleClose() {
    setFormData(initialFormData)
    setIsFormValid(true)
    onClose()
  }

  const handleFormChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
  }
  function handleSubmit() {
    // Validate form
    setIsFormSubmitting(true)

    if (!formData.organization || !formData.websiteUrl) {
      setIsFormValid(false)
      setIsFormSubmitting(false)
      return
    }

    setIsFormValid(true)

    try {
      if (editingAssociatedOrganization) {
        // Update existing associated organization in state
        const updatedOrganization = {
          _id: editingAssociatedOrganization._id,
          organization: formData.organization,
          organizationType: formData.organizationType,
          websiteUrl: formData.websiteUrl
        }
        onUpdateOrganizationInState(updatedOrganization)
      } else {
        // Add new associated organization to state
        const newOrganization = {
          _id: `temp_${Date.now()}`, // Temporary ID for state management
          organization: formData.organization,
          organizationType: formData.organizationType,
          websiteUrl: formData.websiteUrl
        }
        onAddOrganizationToState(newOrganization)
      }

      console.log('Associated organization added to state successfully')
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
        <DialogTitle>
          {editingAssociatedOrganization ? 'Edit Associated Organization' : 'Add Associated Organization'}
        </DialogTitle>

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
                {isFormSubmitting
                  ? 'Saving...'
                  : editingAssociatedOrganization
                    ? 'Update organization'
                    : 'Save organization'}
              </Button>
            </Stack>
          </Grid>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

// Associated Organization View Modal Component
export function AssociatedOrganizationViewModal({ open, onClose, organization, onEdit }) {
  function handleEdit() {
    onEdit(organization)
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>Associated Organization Details</DialogTitle>
      <DialogContent>
        {organization && (
          <Box sx={{ pt: 1 }}>
            <DialogContentText>
              <Box sx={{ mb: 2 }}>
                <Typography variant='h6' sx={{ fontWeight: 'bold', mb: 1 }}>
                  Organization Name
                </Typography>
                <Typography variant='body1'>{organization.organization}</Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant='h6' sx={{ fontWeight: 'bold', mb: 1 }}>
                  Organization Type
                </Typography>
                <Typography variant='body1'>{organization.organizationType}</Typography>
              </Box>

              {organization.websiteUrl && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant='h6' sx={{ fontWeight: 'bold', mb: 1 }}>
                    Website URL
                  </Typography>
                  <Typography variant='body1'>
                    <a
                      href={organization.websiteUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      style={{ color: 'inherit', textDecoration: 'underline' }}
                    >
                      {organization.websiteUrl}
                    </a>
                  </Typography>
                </Box>
              )}
            </DialogContentText>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant='outlined'>
          Close
        </Button>
        <Button
          onClick={handleEdit}
          variant='contained'
          color='primary'
          component='label'
          sx={{
            color: 'white'
          }}
          startIcon={<EditIcon />}
        >
          Edit
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default NewAssociatedOrganization
