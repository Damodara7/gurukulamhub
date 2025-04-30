// React Imports
import { useEffect, useState } from 'react'

// Components Imports
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Input } from '@mui/material'

import { toast } from 'react-toastify'

const ImageDisplay = ({ dataUrl }) => {
  return <img src={dataUrl} width='150px' height='150px' alt='Uploaded Image' />
}

const ImageUploader = ({ setTheFormValue, fieldName }) => {
  const [imageUrl, setImageUrl] = useState(null)

  function handleImageUpload(event) {
    const file = event.target.files[0]

    const reader = new FileReader()
    reader.readAsDataURL(file)

    reader.onloadend = () => {
      const base64String = reader.result

      // Calculate approximate size of the image based on the base64 string
      const base64Length = base64String.length - (base64String.indexOf(',') + 1)
      const padding =
        base64String.charAt(base64String.length - 2) === '='
          ? 2
          : base64String.charAt(base64String.length - 1) === '='
            ? 1
            : 0
      const fileSizeInBytes = base64Length * 0.75 - padding

      if (fileSizeInBytes < 300 * 1024) {
        // 300KB in bytes
        // Image size is less than 300KB, proceed with using data URL
        console.log('Image size is less than 300KB, using data URL:', base64String)
        // Use the base64String as the image source
        setImageUrl(base64String)
        setTheFormValue(fieldName, base64String)
      } else {
        // Image size is greater than 300KB, handle accordingly
        // toast.error("Error: Image size is greater than 300KB, use compressed image");
        console.log('Image size is greater than 300KB, handle compression')
        setImageUrl(null)
        // Upload the file using a different method or compress it before converting
      }
    }
  }

  return (
    <div>
      <Input type='file' onChange={handleImageUpload} />
      {imageUrl && <ImageDisplay dataUrl={imageUrl} />}
    </div>
  )
}

export default ImageUploader
