// import React, { useEffect, useState } from 'react'
// import { Box, Button, Card, CardContent, CardMedia, Grid, Typography } from '@mui/material'
// import imageCompression from 'browser-image-compression'
// import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

// import MediaViewer from '@/components/media-viewer/MediaViewer'
// import ChevronToggleComponent from '@/components/media-viewer/ChevronToggleComponent'

// // AWS S3 Configuration
// const s3 = new S3Client({
//   region: process.env.NEXT_PUBLIC_AWS_S3_REGION, // e.g., 'us-east-1'
//   credentials: {
//     accessKeyId: process.env.NEXT_PUBLIC_AWS_S3_ACCESS_KEY_ID,
//     secretAccessKey: process.env.NEXT_PUBLIC_AWS_S3_ACCESS_KEY_SECRET
//   }
// })

// const ImageUploader = ({
//   bucketName,
//   regionName,
//   quizId,
//   minimizedSubHeading,
//   heading,
//   mediaUrl,
//   saveCompressedFileName,
//   saveThumbnailFileName,
//   formFieldName,
//   setTheFormValue
// }) => {
//   const [shouldRefetch, setShouldRefetch] = useState(false)
//   const [originalImage, setOriginalImage] = useState(null)
//   const [compressedImageBlob, setCompressedImageBlob] = useState(null)
//   const [originalSize, setOriginalSize] = useState(0)
//   const [compressedSize, setCompressedSize] = useState(0)
//   const [thumbnailImageBlob, setThumbnailImageBlob] = useState(null)
//   const [thumbnailSize, setThumbnailSize] = useState(0)
//   const [isUploaded, setIsUploaded] = useState(false)

//   useEffect(() => {
//     const thumbnailUrl = getS3ImageUploadUrl(bucketName, regionName, saveThumbnailFileName)
//     setTheFormValue(formFieldName, thumbnailUrl)
//   }, [shouldRefetch])

//   useEffect(()=>{
//     if(isUploaded)
//   },[])

//   // Function to generate thumbnail
//   const generateThumbnail = imageFile => {
//     const img = new Image()
//     const canvas = document.createElement('canvas')
//     const ctx = canvas.getContext('2d')

//     const maxWidth = 350 // Thumbnail width
//     const maxHeight = 350 // Thumbnail height

//     // Load the image file to the Image object
//     img.src = URL.createObjectURL(imageFile)

//     img.onload = () => {
//       const width = img.width
//       const height = img.height

//       // Calculate aspect ratio and adjust dimensions
//       let newWidth = width
//       let newHeight = height

//       if (width > height) {
//         if (width > maxWidth) {
//           newWidth = maxWidth
//           newHeight = (height * maxWidth) / width
//         }
//       } else {
//         if (height > maxHeight) {
//           newHeight = maxHeight
//           newWidth = (width * maxHeight) / height
//         }
//       }

//       // Set the canvas dimensions to the thumbnail size
//       canvas.width = newWidth
//       canvas.height = newHeight

//       // Draw the image onto the canvas with the new dimensions
//       ctx.drawImage(img, 0, 0, newWidth, newHeight)

//       // Convert canvas to Blob and create thumbnail URL
//       canvas.toBlob(
//         blob => {
//           setThumbnailImageBlob(blob)
//           setThumbnailSize((blob.size / 1024).toFixed(2)) // Thumbnail size in KB
//         },
//         'image/jpeg',
//         1.9
//       ) // Adjust quality here (0.7 for good compression)
//     }
//   }

//   const handleUpload = async () => {
//     if (compressedImageBlob) {
//       // Upload compressed image
//       await uploadToS3(compressedImageBlob, saveCompressedFileName, 'image/jpeg')
//     }

//     if (thumbnailImageBlob) {
//       // Upload thumbnail image
//       var thumbnail = await uploadToS3(thumbnailImageBlob, saveThumbnailFileName, 'image/jpeg')
//       setTheFormValue(formFieldName, thumbnail)
//       setShouldRefetch(prev => !prev)
//     }
//   }

//   function getRandomNumber() {
//     return Math.random() * 3949339393
//   }

//   function getS3ImageUploadUrl(bucketName, regionName, fileName) {
//     return 'https://' + bucketName + '.s3.' + regionName + '.amazonaws.com/' + fileName + '?rsc_' + getRandomNumber()
//   }

//   const uploadToS3 = async (file, fileName, fileType) => {
//     //blob to file:
//     const tempFile = new File([file], fileName, { type: fileType || file.type })
//     //file to bufferFile:
//     const bufferFile = Buffer.from(await tempFile.arrayBuffer())
//     try {
//       const uploadParams = {
//         Bucket: bucketName,
//         Key: fileName,
//         Body: bufferFile,
//         ContentType: fileType
//       }

//       const command = new PutObjectCommand(uploadParams)
//       const response = await s3.send(command)
//       setIsUploaded(true)
//       console.log('Upload successful:', response)
//       setCompressedImageBlob(null)
//       setThumbnailImageBlob(null)
//       setOriginalImage(null)
//       return getS3ImageUploadUrl(bucketName, regionName, fileName)
//     } catch (error) {
//       console.error('Error uploading to S3:', error)
//     }
//   }

//   const handleCompress = async event => {
//     const imageFile = event.target.files[0]

//     if (!imageFile) return

//     // Display the original image and its size
//     setOriginalImage(URL.createObjectURL(imageFile))
//     setOriginalSize((imageFile.size / 1024).toFixed(2)) // size in KB

//     // Compression options
//     const options = {
//       maxSizeMB: 1, // Max size in MB (1MB in this case)
//       maxWidthOrHeight: 1920, // Maximum width or height
//       useWebWorker: true // Use multi-threading for faster compression
//     }

//     try {
//       const compressedFile = await imageCompression(imageFile, options)
//       setCompressedImageBlob(compressedFile)

//       // // Check if compressedFile is a Blob or File
//       // if (compressedFile instanceof Blob) {
//       //   const compressedFileURL = URL.createObjectURL(compressedFile);

//       //   // Set compressed image and its size
//       //   setCompressedImageBlob(compressedFileURL);
//       setCompressedSize((compressedFile.size / 1024).toFixed(2)) // size in KB
//       // } else {
//       //   console.error('Compression did not return a Blob or File');
//       // }

//       // Generate thumbnail from the image
//       generateThumbnail(imageFile)
//     } catch (error) {
//       console.error('Error compressing the image:', error)
//     }
//   }
//   return (
//     <ChevronToggleComponent
//       minimizedSubHeading={minimizedSubHeading ? minimizedSubHeading : 'Click the chevron to view media'}
//       heading={heading ? heading : 'Your Media'}
//     >
//       <MediaViewer mediaType='image' mediaUrl={mediaUrl}></MediaViewer>
//       <Grid xs={12} md={12} sm={12}>
//         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center', spacing: 1 }}>
//           {/* File Upload Button */}
//           <Button variant='contained' component='label' sx={{ marginTop: 2, color: 'white' }}>
//             Upload New Image
//             <input hidden accept='image/*' type='file' onChange={handleCompress} />
//           </Button>
//           <Box
//             sx={{
//               width: '100%',
//               overflowX: 'auto',
//               whiteSpace: 'nowrap',
//               py: 2,
//               // '&::-webkit-scrollbar': {
//               //   height: '8px'
//               // },
//               // '&::-webkit-scrollbar-thumb': {
//               //   backgroundColor: 'rgba(0,0,0,0.2)',
//               //   borderRadius: '4px'
//               // },
//               // '&::-webkit-scrollbar-track': {
//               //   backgroundColor: 'rgba(0,0,0,0.1)'
//               // }
//             }}
//           >
//             <Box
//               sx={{
//                 display: 'inline-flex',
//                 gap: 2,
//                 px: 2,
//                 minWidth: '100%'
//               }}
//             >
//               {originalImage && (
//                 <Card
//                   sx={{
//                     width: 300,
//                     flexShrink: 0,
//                     display: 'inline-block'
//                   }}
//                 >
//                   <CardMedia
//                     component='img'
//                     image={originalImage}
//                     alt='Original Image'
//                     sx={{ height: 200, objectFit: 'contain' }}
//                   />
//                   <CardContent>
//                     <Typography gutterBottom variant='h6'>
//                       Original Image
//                     </Typography>
//                     <Typography variant='body2' color='text.secondary'>
//                       Size: {originalSize} KB
//                     </Typography>
//                   </CardContent>
//                 </Card>
//               )}

//               {compressedImageBlob && (
//                 <Card
//                   sx={{
//                     width: 300,
//                     flexShrink: 0,
//                     display: 'inline-block'
//                   }}
//                 >
//                   <CardMedia
//                     component='img'
//                     image={URL.createObjectURL(compressedImageBlob)}
//                     alt='Compressed Image'
//                     sx={{ height: 200, objectFit: 'contain' }}
//                   />
//                   <CardContent>
//                     <Typography gutterBottom variant='h6'>
//                       Poster Image (Compressed)
//                     </Typography>
//                     <Typography variant='body2' color='text.secondary'>
//                       Size: {compressedSize} KB
//                     </Typography>
//                   </CardContent>
//                 </Card>
//               )}

//               {thumbnailImageBlob && (
//                 <Card
//                   sx={{
//                     width: 200,
//                     flexShrink: 0,
//                     display: 'inline-block'
//                   }}
//                 >
//                   <CardMedia
//                     component='img'
//                     image={URL.createObjectURL(thumbnailImageBlob)}
//                     alt='Thumbnail Image'
//                     sx={{ height: 150, objectFit: 'contain' }}
//                   />
//                   <CardContent>
//                     <Typography gutterBottom variant='h6'>
//                       Thumbnail
//                     </Typography>
//                     <Typography variant='body2' color='text.secondary'>
//                       Size: {thumbnailSize} KB
//                     </Typography>
//                   </CardContent>
//                 </Card>
//               )}
//             </Box>
//           </Box>
//           {originalImage && (
//             <Button variant='contained' component='label' style={{ color: 'white' }} onClick={handleUpload}>
//               Save Images
//             </Button>
//           )}
//         </Box>
//       </Grid>
//     </ChevronToggleComponent>
//   )
// }

// export default ImageUploader

import React, { useEffect, useState } from 'react'
import { Box, Button, Card, CardContent, CardMedia, Grid, Typography } from '@mui/material'
import imageCompression from 'browser-image-compression'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

import MediaViewer from '@/components/media-viewer/MediaViewer'
import ChevronToggleComponent from '@/components/media-viewer/ChevronToggleComponent'

// AWS S3 Configuration
const s3 = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_S3_REGION, // e.g., 'us-east-1'
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_S3_ACCESS_KEY_SECRET
  }
})

const ImageUploader = ({
  bucketName,
  regionName,
  quizId,
  readonly = false,
  minimizedSubHeading,
  heading,
  mediaUrl,
  saveCompressedFileName,
  saveThumbnailFileName,
  formFieldName,
  setTheFormValue
}) => {
  const [shouldRefetch, setShouldRefetch] = useState(false)
  const [originalImage, setOriginalImage] = useState(null)
  const [compressedImageBlob, setCompressedImageBlob] = useState(null)
  const [originalSize, setOriginalSize] = useState(0)
  const [compressedSize, setCompressedSize] = useState(0)
  const [thumbnailImageBlob, setThumbnailImageBlob] = useState(null)
  const [thumbnailSize, setThumbnailSize] = useState(0)
  const [isUploaded, setIsUploaded] = useState(false)
  const [hasNewImage, setHasNewImage] = useState(false)

  useEffect(() => {
    // Initialize with existing media URL if available
    if (mediaUrl) {
      setIsUploaded(true)
    }
  }, [mediaUrl])

  useEffect(() => {
    if (isUploaded) {
      const thumbnailUrl = getS3ImageUploadUrl(bucketName, regionName, saveThumbnailFileName)
      setTheFormValue(formFieldName, thumbnailUrl)
    }
  }, [shouldRefetch, isUploaded])

  const handleCompress = async event => {
    const imageFile = event.target.files[0]
    if (!imageFile) return

    // Reset upload state when new image is selected
    setIsUploaded(false)
    setHasNewImage(true)

    // Display the original image and its size
    setOriginalImage(URL.createObjectURL(imageFile))
    setOriginalSize((imageFile.size / 1024).toFixed(2))

    // Compression options
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true
    }

    try {
      const compressedFile = await imageCompression(imageFile, options)
      setCompressedImageBlob(compressedFile)
      setCompressedSize((compressedFile.size / 1024).toFixed(2))
      generateThumbnail(imageFile)
    } catch (error) {
      console.error('Error compressing the image:', error)
    }
  }

  const handleUpload = async () => {
    if (!compressedImageBlob || !thumbnailImageBlob) return

    try {
      // Upload compressed image
      await uploadToS3(compressedImageBlob, saveCompressedFileName, 'image/jpeg')

      // Upload thumbnail image
      const thumbnailUrl = await uploadToS3(thumbnailImageBlob, saveThumbnailFileName, 'image/jpeg')

      setTheFormValue(formFieldName, thumbnailUrl)
      setShouldRefetch(prev => !prev)
      setIsUploaded(true)
      setHasNewImage(false)
    } catch (error) {
      console.error('Error uploading images:', error)
    }
  }

  // ... (keep all other existing functions like generateThumbnail, getRandomNumber, getS3ImageUploadUrl, uploadToS3)

  // Function to generate thumbnail
  const generateThumbnail = imageFile => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    const maxWidth = 350 // Thumbnail width
    const maxHeight = 350 // Thumbnail height

    // Load the image file to the Image object
    img.src = URL.createObjectURL(imageFile)

    img.onload = () => {
      const width = img.width
      const height = img.height

      // Calculate aspect ratio and adjust dimensions
      let newWidth = width
      let newHeight = height

      if (width > height) {
        if (width > maxWidth) {
          newWidth = maxWidth
          newHeight = (height * maxWidth) / width
        }
      } else {
        if (height > maxHeight) {
          newHeight = maxHeight
          newWidth = (width * maxHeight) / height
        }
      }

      // Set the canvas dimensions to the thumbnail size
      canvas.width = newWidth
      canvas.height = newHeight

      // Draw the image onto the canvas with the new dimensions
      ctx.drawImage(img, 0, 0, newWidth, newHeight)

      // Convert canvas to Blob and create thumbnail URL
      canvas.toBlob(
        blob => {
          setThumbnailImageBlob(blob)
          setThumbnailSize((blob.size / 1024).toFixed(2)) // Thumbnail size in KB
        },
        'image/jpeg',
        1.9
      ) // Adjust quality here (0.7 for good compression)
    }
  }

  function getRandomNumber() {
    return Math.random() * 3949339393
  }

  function getS3ImageUploadUrl(bucketName, regionName, fileName) {
    return 'https://' + bucketName + '.s3.' + regionName + '.amazonaws.com/' + fileName + '?rsc_' + getRandomNumber()
  }

  const uploadToS3 = async (file, fileName, fileType) => {
    //blob to file:
    const tempFile = new File([file], fileName, { type: fileType || file.type })
    //file to bufferFile:
    const bufferFile = Buffer.from(await tempFile.arrayBuffer())
    try {
      const uploadParams = {
        Bucket: bucketName,
        Key: fileName,
        Body: bufferFile,
        ContentType: fileType
      }

      const command = new PutObjectCommand(uploadParams)
      const response = await s3.send(command)
      setIsUploaded(true)
      console.log('Upload successful:', response)
      setCompressedImageBlob(null)
      setThumbnailImageBlob(null)
      setOriginalImage(null)
      return getS3ImageUploadUrl(bucketName, regionName, fileName)
    } catch (error) {
      console.error('Error uploading to S3:', error)
    }
  }

  return (
    <ChevronToggleComponent
      minimizedSubHeading={minimizedSubHeading ? minimizedSubHeading : 'Click the chevron to view media'}
      heading={heading ? heading : 'Your Media'}
    >
      <Grid xs={12} md={12} sm={12}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center', spacing: 1 }}>
          {/* File Upload Button */}

          {!readonly && (
            <Button variant='contained' component='label' sx={{ marginTop: 2, color: 'white' }}>
              Upload New Image
              <input hidden accept='image/*' type='file' onChange={handleCompress} />
            </Button>
          )}
          {/* Horizontal scrollable image cards */}
          <Box sx={{ width: '100%', overflowX: 'auto', whiteSpace: 'nowrap', py: 2 }}>
            <Box sx={{ display: 'inline-flex', gap: 2, px: 2, minWidth: '100%' }}>
              {originalImage && (
                <Card sx={{ width: 300, flexShrink: 0, display: 'inline-block' }}>
                  <CardMedia
                    component='img'
                    image={originalImage}
                    alt='Original Image'
                    sx={{ height: 200, objectFit: 'contain' }}
                  />
                  <CardContent>
                    <Typography gutterBottom variant='h6'>
                      Original Image
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Size: {originalSize} KB
                    </Typography>
                  </CardContent>
                </Card>
              )}

              {compressedImageBlob && (
                <Card sx={{ width: 300, flexShrink: 0, display: 'inline-block' }}>
                  <CardMedia
                    component='img'
                    image={URL.createObjectURL(compressedImageBlob)}
                    alt='Compressed Image'
                    sx={{ height: 200, objectFit: 'contain' }}
                  />
                  <CardContent>
                    <Typography gutterBottom variant='h6'>
                      Poster Image
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Size: {compressedSize} KB
                    </Typography>
                  </CardContent>
                </Card>
              )}

              {thumbnailImageBlob && (
                <Card sx={{ width: 200, flexShrink: 0, display: 'inline-block' }}>
                  <CardMedia
                    component='img'
                    image={URL.createObjectURL(thumbnailImageBlob)}
                    alt='Thumbnail Image'
                    sx={{ height: 150, objectFit: 'contain' }}
                  />
                  <CardContent>
                    <Typography gutterBottom variant='h6'>
                      Thumbnail
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Size: {thumbnailSize} KB
                    </Typography>
                  </CardContent>
                </Card>
              )}
              {!originalImage && !compressedImageBlob && !thumbnailImageBlob && (
                <div className='w-full text-center'>
                  <Typography variant='h6' color='text.secondary'>
                    No Image Uploaded
                  </Typography>
                </div>
              )}
            </Box>
          </Box>

          {!readonly && originalImage && (
            <Button
              variant='contained'
              sx={{ color: 'white' }}
              onClick={handleUpload}
              component='label'
              disabled={isUploaded && !hasNewImage}
            >
              {isUploaded && !hasNewImage ? 'Image Saved' : 'Save Image'}
            </Button>
          )}
        </Box>
      </Grid>
    </ChevronToggleComponent>
  )
}

export default ImageUploader
