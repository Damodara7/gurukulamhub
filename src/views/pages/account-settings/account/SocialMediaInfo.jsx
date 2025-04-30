import React from 'react'
import { Divider, Grid, TextField } from '@mui/material'

function SocialMediaInfo({ formData, handleFormChange, isUrlsValid }) {
  return (
    <>
      {/* ----Socaial Media Profiles---- */}
      <Grid item xs={12} marginLeft={'0.25rem'}>
        <Divider> Social Media Profiles </Divider>
      </Grid>
      {/* Linkedin */}
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          name='linkedInUrl'
          label='Linkedin'
          value={formData.linkedInUrl}
          // error={!isFormValid && formData.linkedInUrl && !isUrlsValid.linkedInUrl}
          error={formData.linkedInUrl && !isUrlsValid.linkedInUrl}
          helperText={formData.linkedInUrl && !isUrlsValid.linkedInUrl ? 'Invalid Url' : ''}
          placeholder='Ex: https://www.linkedin.com/in/your-profile'
          onChange={e => handleFormChange('linkedInUrl', e.target.value)}
        />
      </Grid>

      {/* Facebook */}
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          name='facebookUrl'
          label='Facebook'
          value={formData.facebookUrl}
          placeholder='Ex: https://www.facebook.com/your-profile'
          // error={!isFormValid && formData.facebookUrl && !isUrlsValid.facebookUrl}
          error={formData.facebookUrl && !isUrlsValid.facebookUrl}
          helperText={formData.facebookUrl && !isUrlsValid.facebookUrl ? 'Invalid Url' : ''}
          onChange={e => handleFormChange('facebookUrl', e.target.value)}
        />
      </Grid>

      {/* Instagram */}
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          name='instagramUrl'
          label='Instagram'
          value={formData.instagramUrl}
          placeholder='Ex: https://www.instagram.com/your-profile'
          // error={!isFormValid && formData.instagramUrl && !isUrlsValid.instagramUrl}
          error={formData.instagramUrl && !isUrlsValid.instagramUrl}
          helperText={formData.instagramUrl && !isUrlsValid.instagramUrl ? 'Invalid Url' : ''}
          onChange={e => handleFormChange('instagramUrl', e.target.value)}
        />
      </Grid>
    </>
  )
}

export default SocialMediaInfo
