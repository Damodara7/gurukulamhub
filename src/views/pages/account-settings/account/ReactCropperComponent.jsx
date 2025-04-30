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

export const ReactCropperComponent = ({ image, side, onDelete, setImage, setIsCropMode, setImageFile }) => {
  const [cropData, setCropData] = useState('#')
  const cropperRef = useRef(null)
  const [errorMessage, setErrorMessage] = useState('')

  const getCropData = () => {
    if (typeof cropperRef.current?.cropper !== 'undefined') {
      const cropper = cropperRef.current?.cropper
      console.log('cropped canva', cropper)

      const url = cropperRef.current?.cropper.getCroppedCanvas().toDataURL()
      const file = dataURLtoFile(url, `${side}_voter_id.jpg`)
      setImageFile(prev => ({ ...prev, [side]: file }))
      console.log('Cropped image URL:', url)
      console.log('Cropped image file:', file)

      const base64Data = url.split(',')[1]
      const binaryString = window.atob(base64Data)
      const len = binaryString.length
      const byteArray = new Uint8Array(len)
      for (let i = 0; i < len; i++) {
        byteArray[i] = binaryString.charCodeAt(i)
      }
      const blob = new Blob([byteArray], { type: 'image/png' })
      const sizeInKB = blob.size / 1024

      if (sizeInKB > 100) {
        setErrorMessage('Cropped image size exceeds 100 KB. Please crop a smaller area or reduce image quality.')
        return
      }

      //   let quality = 1 // Start with high quality
      //   let sizeInKB = 0
      //   let url1

      //   do {
      //     url1 = cropper
      //       .getCroppedCanvas({
      //         width: cropper.getCanvasData().width * quality,
      //         height: cropper.getCanvasData().height * quality
      //       })
      //       .toDataURL('image/jpeg', quality)

      //     const base64Data = url1.split(',')[1]
      //     const binaryString = window.atob(base64Data)
      //     const len = binaryString.length
      //     const byteArray = new Uint8Array(len)
      //     for (let i = 0; i < len; i++) {
      //       byteArray[i] = binaryString.charCodeAt(i)
      //     }
      //     const blob = new Blob([byteArray], { type: 'image/jpeg' })
      //     sizeInKB = blob.size / 1024

      //     if (sizeInKB > 200) {
      //       quality -= 0.1 // Reduce quality by 10%
      //     }
      //   } while (sizeInKB > 200 && quality > 0)

      //   if (sizeInKB > 200) {
      //     setErrorMessage(
      //       'Cropped image size exceeds 100 KB even at the lowest quality. Please crop a smaller area or reduce image quality.'
      //     )
      //     return
      //   }

      //   const file = dataURLtoFile(url1, `${side}_voter_id.jpg`)
      //   console.log(`Cropped image file: ${file}`)

      setCropData(cropperRef.current?.cropper.getCroppedCanvas().toDataURL())
      setImage(prev => ({ ...prev, [side]: url }))
      setIsCropMode(prev => ({ ...prev, [side]: false }))
      setErrorMessage('')
    }
  }

  return (
    <Box
      sx={{
        position: 'relative',
        width: '300px',
        height: '300px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        // border: '1px solid #cacaca',
        background: 'rgba(201,186,228,0.25)',
        padding: '5px',
        borderRadius: '10px'
      }}
    >
      <Cropper
        style={{ height: 250, width: '100%', flex: 1 }}
        initialAspectRatio={1}
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
      />
      {errorMessage && (
        <Typography color='error' variant='body2'>
          {errorMessage}
        </Typography>
      )}
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
