import React from 'react'
import { Grid, Divider, TextField, FormControl, InputLabel, Select, MenuItem, Box, Typography } from '@mui/material'
import { MuiFileInput } from 'mui-file-input'
import { RiCloseFill } from 'react-icons/ri'
import { IoMdAttach } from 'react-icons/io'

const BusinessDetailsSection = ({
  formData,
  handleFormChange,
  organizationRegistrationDocument,
  organizationGSTDocument,
  organizationPANDocument,
  handleOrganizationRegistrationDocumentChange,
  handleOrganizationGSTDocumentChange,
  handleOrganizationPANDocumentChange,
  uploadOrganizationRegistrationDocToS3,
  uploadOrganizationGSTDocToS3,
  uploadOrganizationPANDocToS3,
  deleteFileFromS3Handler
}) => {
  return (
    <>
      {/* ----Business Details---- */}
      {(formData.accountType === 'BUSINESS' || formData.accountType === 'NGO') && (
        <>
          <Grid item xs={12} marginLeft={'0.25rem'}>
            <Divider>{formData.accountType === 'NGO' ? 'Organization Details' : 'Business Details'}</Divider>
          </Grid>

          {/* Organization */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name='organization'
              label='Your Organization'
              value={formData.organization}
              placeholder='ThemeSelection'
              onChange={e => handleFormChange('organization', e.target.value)}
            />
          </Grid>

          {/* Website Url */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={formData.accountType === 'NGO' ? 'Organization Website Url' : 'Business Website Url'}
              name='websiteUrl'
              value={formData.websiteUrl}
              placeholder='Ex: https://www.triesoltech.com'
              onChange={e => handleFormChange('websiteUrl', e.target.value)}
            />
          </Grid>

          {/* Registration No. */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={formData.accountType === 'NGO' ? 'Organization Registration No.' : 'Business Registration No.'}
              name='organizationRegistrationNumber'
              value={formData.organizationRegistrationNumber}
              onChange={e => handleFormChange('organizationRegistrationNumber', e.target.value)}
            />
          </Grid>

          {/* Registration Document */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <MuiFileInput
                placeholder={
                  formData.accountType === 'NGO'
                    ? 'Upload Organization Registration Document'
                    : 'Upload Business Registration Document'
                }
                value={organizationRegistrationDocument}
                onChange={handleOrganizationRegistrationDocumentChange}
                hideSizeText
                InputProps={{
                  inputProps: {
                    accept: '.pdf,.doc,.docx,.jpg,.jpeg,.png'
                  }
                }}
                getInputText={value => (value ? value.name : '')}
                startAdornment={<IoMdAttach />}
                endAdornment={
                  organizationRegistrationDocument && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant='body2' color='text.secondary'>
                        {organizationRegistrationDocument.name}
                      </Typography>
                      <RiCloseFill
                        onClick={() => {
                          handleOrganizationRegistrationDocumentChange(null)
                          if (formData.organizationRegistrationDocument) {
                            deleteFileFromS3Handler(formData.organizationRegistrationDocument)
                          }
                        }}
                        style={{ cursor: 'pointer', color: 'red' }}
                      />
                    </Box>
                  )
                }
              />
            </FormControl>
            {organizationRegistrationDocument && (
              <Box sx={{ mt: 1 }}>
                <button
                  type='button'
                  onClick={uploadOrganizationRegistrationDocToS3}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#1976d2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Upload Registration Document
                </button>
              </Box>
            )}
          </Grid>

          {/* GST Number */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='GST Number'
              name='organizationGSTNumber'
              value={formData.organizationGSTNumber}
              onChange={e => handleFormChange('organizationGSTNumber', e.target.value)}
            />
          </Grid>

          {/* GST Document */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <MuiFileInput
                placeholder='Upload GST Document'
                value={organizationGSTDocument}
                onChange={handleOrganizationGSTDocumentChange}
                hideSizeText
                InputProps={{
                  inputProps: {
                    accept: '.pdf,.doc,.docx,.jpg,.jpeg,.png'
                  }
                }}
                getInputText={value => (value ? value.name : '')}
                startAdornment={<IoMdAttach />}
                endAdornment={
                  organizationGSTDocument && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant='body2' color='text.secondary'>
                        {organizationGSTDocument.name}
                      </Typography>
                      <RiCloseFill
                        onClick={() => {
                          handleOrganizationGSTDocumentChange(null)
                          if (formData.organizationGSTDocument) {
                            deleteFileFromS3Handler(formData.organizationGSTDocument)
                          }
                        }}
                        style={{ cursor: 'pointer', color: 'red' }}
                      />
                    </Box>
                  )
                }
              />
            </FormControl>
            {organizationGSTDocument && (
              <Box sx={{ mt: 1 }}>
                <button
                  type='button'
                  onClick={uploadOrganizationGSTDocToS3}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#1976d2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Upload GST Document
                </button>
              </Box>
            )}
          </Grid>

          {/* PAN Number */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='PAN Number'
              name='organizationPANNumber'
              value={formData.organizationPANNumber}
              onChange={e => handleFormChange('organizationPANNumber', e.target.value)}
            />
          </Grid>

          {/* PAN Document */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <MuiFileInput
                placeholder='Upload PAN Document'
                value={organizationPANDocument}
                onChange={handleOrganizationPANDocumentChange}
                hideSizeText
                InputProps={{
                  inputProps: {
                    accept: '.pdf,.doc,.docx,.jpg,.jpeg,.png'
                  }
                }}
                getInputText={value => (value ? value.name : '')}
                startAdornment={<IoMdAttach />}
                endAdornment={
                  organizationPANDocument && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant='body2' color='text.secondary'>
                        {organizationPANDocument.name}
                      </Typography>
                      <RiCloseFill
                        onClick={() => {
                          handleOrganizationPANDocumentChange(null)
                          if (formData.organizationPANDocument) {
                            deleteFileFromS3Handler(formData.organizationPANDocument)
                          }
                        }}
                        style={{ cursor: 'pointer', color: 'red' }}
                      />
                    </Box>
                  )
                }
              />
            </FormControl>
            {organizationPANDocument && (
              <Box sx={{ mt: 1 }}>
                <button
                  type='button'
                  onClick={uploadOrganizationPANDocToS3}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#1976d2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Upload PAN Document
                </button>
              </Box>
            )}
          </Grid>
        </>
      )}
    </>
  )
}

export default BusinessDetailsSection
