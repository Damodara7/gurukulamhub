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
  isEpicVerifyClicked,
  isEpicValid,
  isEpicVerified,
  formData,
  handleFormChange,
  handleVerifyEpic,
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
        display='flex'
        flexDirection='column'
        justifyContent='flex-start'
        alignItems='flex-start'
      >
        {voterIdPhotos.front ? (
          !isCropMode.front ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Box
                sx={{
                  width: '500px',
                  height: '250px',
                  // background: 'rgba(201,186,228,0.25)',
                  padding: '5px',
                  borderRadius: '10px'
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
              height: '50px',
              color: 'primary'
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
        display='flex'
        flexDirection='column'
        justifyContent='flex-start'
        alignItems='flex-start'
      >
        {voterIdPhotos.back ? (
          !isCropMode.back ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Box
                sx={{
                  width: '500px',
                  height: '250px',
                  // background: 'rgba(201,186,228,0.25)',
                  padding: '5px',
                  borderRadius: '10px',
                  position: 'relative',
                  overflow: 'hidden'
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
            sx={{ width: '100%', height: '50px', color: 'primary' }}
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
      <Grid item xs={12} sm={6}>
        <Grid container alignItems={'center'} justifyContent='center' spacing={2}>
          <Grid item xs={12} sm={9}>
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
                  handleFormChange('voterId', value)
                }
              }}
              error={!isEpicValid} // Set error state based on EPIC validation
              helperText={!isEpicValid ? 'EPIC must be exactly 10 characters (letters and numbers)' : ''}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button
              variant='contained'
              style={{ color: 'white' }}
              component='label'
              size='small'
              color={
                isEpicVerifyClicked && isEpicVerified
                  ? 'success'
                  : isEpicVerifyClicked && !isEpicVerified
                    ? 'error'
                    : 'primary'
              }
              onClick={handleVerifyEpic}
              disabled={!formData.voterId?.epicNumber || !isEpicValid || isEpicVerifyClicked} // Disable button if no voter ID or invalid format
            >
              {isEpicVerifyClicked && isEpicVerified
                ? 'Verified'
                : isEpicVerifyClicked && !isEpicVerified
                  ? 'Invalid'
                  : 'Verify'}
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}

export default VoterIdInfo
