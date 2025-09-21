import React from 'react'
import { Box, Button, Divider, Grid, Stack, styled, TextField } from '@mui/material'
// react-icons Imports
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DeleteIcon from '@mui/icons-material/Delete'
import CropIcon from '@mui/icons-material/Crop'
import ReactCropperComponent from '@views/pages/account-settings/account/ReactCropperComponent'

function VoterIdInfo({
  voterIdPhotos,
  handleVoterIdPhotoDelete,
  handleVoterIdPhotosInputChange,
  setVoterIdPhotoFiles,
  setVoterIdPhotos,
  setIsCropMode,
  isCropMode,
  isEpicValid,
  formData,
  handleFormChange,
  handleVoterIdImageCrop
}) {
  const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1
  })

  return (
    <>
      <Grid item xs={12} marginLeft={'0.25rem'}>
        <Divider> Voter Id </Divider>
      </Grid>

      {/* Voter Id Front-Side */}
      <Grid
        item
        xs={12}
        sm={6}
        md={6}
        display='flex'
        flexDirection='column'
        justifyContent='flex-start'
        alignItems='center'
        sx={{ padding: { xs: '8px', sm: '16px' } }}
      >
        {voterIdPhotos.front ? (
          !isCropMode.front ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
              <Box
                sx={{
                  width: '100%',
                  maxWidth: { xs: '100%', sm: '400px', md: '500px' },
                  height: { xs: '200px', sm: '220px', md: '250px' },
                  // background: 'rgba(201,186,228,0.25)',
                  padding: '5px',
                  borderRadius: '10px',
                  margin: '0 auto'
                }}
              >
                <img
                  src={voterIdPhotos.front}
                  alt='Voter ID Front'
                  style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '2px' }}
                />
              </Box>
              <Stack flexDirection='row' gap='0.5rem' alignItems='center' sx={{ alignSelf: 'center' }}>
                <Button variant='text' color='error' size='small' onClick={() => handleVoterIdPhotoDelete('front')}>
                  <DeleteIcon />
                </Button>
                <Button
                  component='label'
                  variant='contained'
                  sx={{
                    color: 'white'
                  }}
                  size='small'
                  onClick={() => setIsCropMode(prev => ({ ...prev, front: true }))}
                  startIcon={<CropIcon />}
                >
                  Crop
                </Button>
              </Stack>
            </Box>
          ) : (
            <ReactCropperComponent
              image={voterIdPhotos.front}
              onImageChange={handleVoterIdPhotosInputChange}
              side={'front'}
              setImageFile={setVoterIdPhotoFiles}
              setImage={setVoterIdPhotos}
              setIsCropMode={setIsCropMode}
              onDelete={handleVoterIdPhotoDelete}
              onImageCrop={handleVoterIdImageCrop}
            />
          )
        ) : (
          <Button
            component='label'
            variant='outlined'
            sx={{
              width: '100%',
              maxWidth: { xs: '100%', sm: '400px', md: '500px' },
              height: '50px',
              color: 'primary',
              margin: '0 auto'
            }}
            startIcon={<CloudUploadIcon />}
          >
            Upload Voter Id Front-Side
            <VisuallyHiddenInput
              type='file'
              accept='image/png, image/jpeg'
              onChange={e => handleVoterIdPhotosInputChange(e, 'front')}
            />
          </Button>
        )}
      </Grid>

      {/* Voter Id Back-Side */}
      <Grid
        item
        xs={12}
        sm={6}
        md={6}
        display='flex'
        flexDirection='column'
        justifyContent='flex-start'
        alignItems='center'
        sx={{ padding: { xs: '8px', sm: '16px' } }}
      >
        {voterIdPhotos.back ? (
          !isCropMode.back ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
              <Box
                sx={{
                  width: '100%',
                  maxWidth: { xs: '100%', sm: '400px', md: '500px' },
                  height: { xs: '200px', sm: '220px', md: '250px' },
                  // background: 'rgba(201,186,228,0.25)',
                  padding: '5px',
                  borderRadius: '10px',
                  position: 'relative',
                  overflow: 'hidden',
                  margin: '0 auto'
                }}
              >
                <img
                  src={voterIdPhotos.back}
                  alt='Voter ID Back'
                  style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '5px' }}
                />
              </Box>
              <Stack flexDirection='row' gap='0.5rem' alignItems='center' sx={{ alignSelf: 'center' }}>
                <Button variant='text' color='error' size='small' onClick={() => handleVoterIdPhotoDelete('back')}>
                  <DeleteIcon />
                </Button>
                <Button
                  component='label'
                  variant='contained'
                  sx={{
                    color: 'white'
                  }}
                  size='small'
                  startIcon={<CropIcon />}
                  onClick={() => setIsCropMode(prev => ({ ...prev, back: true }))}
                >
                  Crop
                </Button>
              </Stack>
            </Box>
          ) : (
            <ReactCropperComponent
              image={voterIdPhotos.back}
              onImageChange={handleVoterIdPhotosInputChange}
              side={'back'}
              setImageFile={setVoterIdPhotoFiles}
              setImage={setVoterIdPhotos}
              setIsCropMode={setIsCropMode}
              onDelete={handleVoterIdPhotoDelete}
              onImageCrop={handleVoterIdImageCrop}
            />
          )
        ) : (
          <Button
            component='label'
            variant='outlined'
            sx={{
              width: '100%',
              maxWidth: { xs: '100%', sm: '400px', md: '500px' },
              height: '50px',
              color: 'primary',
              margin: '0 auto'
            }}
            startIcon={<CloudUploadIcon />}
          >
            Upload Voter Id Back-Side
            <VisuallyHiddenInput
              type='file'
              accept='image/png, image/jpeg'
              onChange={e => handleVoterIdPhotosInputChange(e, 'back')}
            />
          </Button>
        )}
      </Grid>
      {/* Voter Id EPIC Input */}
      <Grid item xs={12} sm={6} md={6} sx={{ padding: { xs: '8px', sm: '16px' } }}>
        <TextField
          name='voterId'
          fullWidth
          label='Voter Id (EPIC)'
          value={formData.voterId?.epicNumber || ''}
          placeholder='ABC1234567'
          onChange={e => {
            const value = e.target.value
            // Limit input to 10 characters
            if (value.length <= 10) {
              // Update local form data immediately for UI responsiveness
              handleFormChange('voterId', value)
            }
          }}
          error={!isEpicValid} // Set error state based on EPIC validation
          helperText={!isEpicValid ? 'EPIC must be exactly 10 characters (letters and numbers)' : ''}
        />
      </Grid>
    </>
  )
}

export default VoterIdInfo
