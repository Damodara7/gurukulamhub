import React, { useState, useRef } from 'react'
import Cropper, { ReactCropperElement } from 'react-cropper'
import 'cropperjs/dist/cropper.css'
import { Box, Button, Stack, Typography } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'

// Utility function to convert data URL to file
const dataURLtoFile = (dataurl, filename) => {
  const arr = dataurl.split(',')
  const mime = arr[0].match(/:(.*?);/)[1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type: mime })
}

export const ReactCropperComponent = ({
  image,
  side,
  onDelete,
  setImage,
  setIsCropMode,
  setImageFile,
  onImageCrop
}) => {
  const [cropData, setCropData] = useState('#')
  const cropperRef = useRef(null)
  const [errorMessage, setErrorMessage] = useState('')

  const getCropData = () => {
    if (typeof cropperRef.current?.cropper !== 'undefined') {
      const cropper = cropperRef.current?.cropper
      console.log('cropped canva', cropper)

      // Get cropped canvas with tight cropping (no excess space)
      const croppedCanvas = cropperRef.current?.cropper.getCroppedCanvas({
        width: cropperRef.current?.cropper.getCropBoxData().width,
        height: cropperRef.current?.cropper.getCropBoxData().height,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high'
      })

      const url = croppedCanvas.toDataURL('image/jpeg', 0.9) // 90% quality
      const file = dataURLtoFile(url, `${side}_voter_id.jpg`)
      setImageFile(prev => ({ ...prev, [side]: file }))
      console.log('Cropped image URL:', url)
      console.log('Cropped image file:', file)

      setCropData(url)
      setImage(prev => ({ ...prev, [side]: url }))
      setIsCropMode(prev => ({ ...prev, [side]: false }))
      setErrorMessage('')

      // Notify parent component about the cropped image
      if (onImageCrop) {
        onImageCrop(side, url)
      }
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <Cropper
        style={{ height: 250, width: '500px' }}
        initialAspectRatio={null} // Allow free aspect ratio
        preview='.img-preview'
        src={image}
        ref={cropperRef}
        viewMode={1}
        guides={true}
        minCropBoxHeight={10}
        minCropBoxWidth={10}
        background={false}
        responsive={true}
        checkOrientation={false} // https://github.com/fengyuanchen/cropperjs/issues/671
        autoCropArea={0.8} // Start with 80% of the image cropped
        cropBoxResizable={true}
        cropBoxMovable={true}
        toggleDragModeOnDblclick={false}
      />

      {/* Error message */}
      {errorMessage && (
        <Typography color='error' variant='body2' sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}>
          {errorMessage}
        </Typography>
      )}

      {/* Button section */}
      <Stack flexDirection='row' gap='0.5rem' alignItems='center' sx={{ alignSelf: 'flex-end' }}>
        <Button variant='text' color='error' size='small' onClick={() => onDelete(side)}>
          <DeleteIcon />
        </Button>
        <Button
          component='label'
          variant='contained'
          sx={{
            color: 'white'
          }}
          size='small'
          onClick={getCropData}
        >
          Save
        </Button>
      </Stack>
    </Box>
  )
}

export default ReactCropperComponent
