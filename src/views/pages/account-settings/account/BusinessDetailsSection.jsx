import React from 'react'
import { Grid, Divider, TextField, FormControl, Box, Typography, Link, Stack, IconButton } from '@mui/material'
import { MuiFileInput } from 'mui-file-input'
import { RiCloseFill } from 'react-icons/ri'
import { IoMdAttach } from 'react-icons/io'
import DeleteIcon from '@mui/icons-material/Delete'

const BusinessDetailsSection = ({
  formData,
  handleFormChange,
  organizationRegistrationDocument,
  organizationGSTDocument,
  organizationPANDocument,
  existingOrganizationRegistrationFile,
  existingOrganizationGSTFile,
  existingOrganizationPANFile,
  profileFileViewUrlBuilder,
  onDeleteOrganizationRegistrationFile,
  onDeleteOrganizationGSTFile,
  onDeleteOrganizationPANFile,
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
                label={formData.accountType === 'NGO' ? 'Organization Registration Document' : 'Business Registration Document'}
                name='organizationRegistrationDocument'
                placeholder={
                  formData.accountType === 'NGO'
                    ? 'Upload Organization Registration Document'
                    : 'Upload Business Registration Document'
                }
                value={organizationRegistrationDocument}
                onChange={handleOrganizationRegistrationDocumentChange}
                fullWidth
                clearIconButtonProps={{
                  title: 'Remove',
                  children: <RiCloseFill />
                }}
                InputProps={{
                  inputProps: {
                    accept: '.pdf,.doc,.docx,.jpg,.jpeg,.png'
                  },
                  startAdornment: <IoMdAttach />
                }}
              />
            </FormControl>
            {!organizationRegistrationDocument && existingOrganizationRegistrationFile?.url && (
              <Box sx={{ mt: 1 }}>
                <Typography variant='caption' color='text.secondary'>
                  Existing file: {existingOrganizationRegistrationFile.fileName || 'Registration document'}
                </Typography>
                <Stack direction='row' spacing={1.5} sx={{ mt: 0.5 }}>
                  <Link
                    href={profileFileViewUrlBuilder?.('organizationRegistration') || existingOrganizationRegistrationFile.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    underline='hover'
                  >
                    View
                  </Link>
                  <Link
                    href={profileFileViewUrlBuilder?.('organizationRegistration') || existingOrganizationRegistrationFile.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    underline='hover'
                    download={existingOrganizationRegistrationFile.fileName || 'registration-document'}
                  >
                    Download
                  </Link>
                  <IconButton
                    size='small'
                    color='error'
                    onClick={onDeleteOrganizationRegistrationFile}
                    sx={{ p: 0.25 }}
                    title='Delete registration document'
                  >
                    <DeleteIcon fontSize='small' />
                  </IconButton>
                </Stack>
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
                label='GST Document'
                name='organizationGSTDocument'
                placeholder='Upload GST Document'
                value={organizationGSTDocument}
                onChange={handleOrganizationGSTDocumentChange}
                fullWidth
                clearIconButtonProps={{
                  title: 'Remove',
                  children: <RiCloseFill />
                }}
                InputProps={{
                  inputProps: {
                    accept: '.pdf,.doc,.docx,.jpg,.jpeg,.png'
                  },
                  startAdornment: <IoMdAttach />
                }}
              />
            </FormControl>
            {!organizationGSTDocument && existingOrganizationGSTFile?.url && (
              <Box sx={{ mt: 1 }}>
                <Typography variant='caption' color='text.secondary'>
                  Existing file: {existingOrganizationGSTFile.fileName || 'GST document'}
                </Typography>
                <Stack direction='row' spacing={1.5} sx={{ mt: 0.5 }}>
                  <Link
                    href={profileFileViewUrlBuilder?.('organizationGST') || existingOrganizationGSTFile.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    underline='hover'
                  >
                    View
                  </Link>
                  <Link
                    href={profileFileViewUrlBuilder?.('organizationGST') || existingOrganizationGSTFile.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    underline='hover'
                    download={existingOrganizationGSTFile.fileName || 'gst-document'}
                  >
                    Download
                  </Link>
                  <IconButton
                    size='small'
                    color='error'
                    onClick={onDeleteOrganizationGSTFile}
                    sx={{ p: 0.25 }}
                    title='Delete GST document'
                  >
                    <DeleteIcon fontSize='small' />
                  </IconButton>
                </Stack>
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
                label='PAN Document'
                name='organizationPANDocument'
                placeholder='Upload PAN Document'
                value={organizationPANDocument}
                onChange={handleOrganizationPANDocumentChange}
                fullWidth
                clearIconButtonProps={{
                  title: 'Remove',
                  children: <RiCloseFill />
                }}
                InputProps={{
                  inputProps: {
                    accept: '.pdf,.doc,.docx,.jpg,.jpeg,.png'
                  },
                  startAdornment: <IoMdAttach />
                }}
              />
            </FormControl>
            {!organizationPANDocument && existingOrganizationPANFile?.url && (
              <Box sx={{ mt: 1 }}>
                <Typography variant='caption' color='text.secondary'>
                  Existing file: {existingOrganizationPANFile.fileName || 'PAN document'}
                </Typography>
                <Stack direction='row' spacing={1.5} sx={{ mt: 0.5 }}>
                  <Link
                    href={profileFileViewUrlBuilder?.('organizationPAN') || existingOrganizationPANFile.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    underline='hover'
                  >
                    View
                  </Link>
                  <Link
                    href={profileFileViewUrlBuilder?.('organizationPAN') || existingOrganizationPANFile.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    underline='hover'
                    download={existingOrganizationPANFile.fileName || 'pan-document'}
                  >
                    Download
                  </Link>
                  <IconButton
                    size='small'
                    color='error'
                    onClick={onDeleteOrganizationPANFile}
                    sx={{ p: 0.25 }}
                    title='Delete PAN document'
                  >
                    <DeleteIcon fontSize='small' />
                  </IconButton>
                </Stack>
              </Box>
            )}
          </Grid>
        </>
      )}
    </>
  )
}

export default BusinessDetailsSection
