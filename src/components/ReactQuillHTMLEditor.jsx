'use client'
import React, { forwardRef, useImperativeHandle, useState } from 'react'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'
import { Box, Button, Typography, alpha, useTheme, Stack } from '@mui/material'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

const quillModules = {
  toolbar: {
    container: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ font: [] }, { size: [] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ script: 'sub' }, { script: 'super' }],
      ['blockquote', 'code-block'],
      [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
      [{ indent: '-1' }, { indent: '+1' }],
      [{ direction: 'rtl' }, { align: [] }],
      ['link', 'image', 'formula'],
      ['clean']
    ]
  }
}

const quillFormats = [
  'header',
  'font',
  'size',
  'bold',
  'italic',
  'underline',
  'strike',
  'color',
  'background',
  'script',
  'blockquote',
  'code-block',
  'list',
  'bullet',
  'check',
  'indent',
  'direction',
  'align',
  'link',
  'image',
  'formula'
]

const ReactQuillHTMLEditor = forwardRef(
  ({ value = '', onChange = () => {}, label = 'Content', required = false }, ref) => {
    const theme = useTheme()
    const isDarkMode = theme.palette.mode === 'dark'
    const [content, setContent] = useState(value)
    const [errorMessage, setErrorMessage] = useState('') // State for error message

    const handleEditorChange = newContent => {
      setContent(newContent)
      onChange(newContent)

      // Validate content on typing only if required
      if (required) {
        if (isContentEmpty(newContent)) {
          setErrorMessage('Content cannot be empty.')
        } else {
          setErrorMessage('')
        }
      }
    }

    const isContentEmpty = contentVal => {
      // Strip all HTML tags and check for meaningful content
      const plainText = contentVal.replace(/<[^>]*>/g, '').trim()
      const hasMedia = /<(img|video|iframe|audio|embed)[^>]*>/.test(contentVal) // Check for media tags
      return plainText === '' && !hasMedia
    }

    function handleSave() {
      // Validate only if required
      if (required && isContentEmpty(content)) {
        setErrorMessage('Content cannot be empty.')
        return false // Prevent proceeding in the parent component
      }
      console.log('Validated content:', content)
      return true // Allow proceeding in the parent component
    }

    useImperativeHandle(ref, () => ({
      onSubmit: handleSave
    }))

    return (
      <Box sx={{ width: '100%' }}>
        <Stack spacing={1}>
          {/* Label for the editor */}
          <Typography
            variant='subtitle1'
            fontWeight={600}
            sx={{
              color: 'text.primary',
              fontSize: { xs: '0.9375rem', sm: '1rem' }
            }}
          >
            {label}
            {required && (
              <Typography component='span' color='error' sx={{ ml: 0.5 }}>
                *
              </Typography>
            )}
          </Typography>
          <Box
            sx={{
              width: '100%',
              // Container styling
              '& .ql-container': {
                borderRadius: { xs: '0 0 8px 8px', sm: '0 0 12px 12px' },
                fontSize: { xs: '0.9375rem', sm: '1rem' },
                bgcolor: `${isDarkMode ? alpha(theme.palette.background.default, 0.5) : 'white'} !important`,
                borderColor: `${isDarkMode ? alpha(theme.palette.divider, 0.3) : '#ccc'} !important`,
                color: `${theme.palette.text.primary} !important`
              },
              // Editor area styling
              '& .ql-editor': {
                minHeight: { xs: 200, sm: 250 },
                fontSize: { xs: '0.9375rem', sm: '1rem' },
                lineHeight: 1.6,
                color: `${theme.palette.text.primary} !important`,
                bgcolor: `${isDarkMode ? alpha(theme.palette.background.default, 0.5) : 'white'} !important`
              },
              // Placeholder styling
              '& .ql-editor.ql-blank::before': {
                color: `${isDarkMode ? alpha(theme.palette.text.secondary, 0.7) : alpha(theme.palette.text.disabled, 0.7)} !important`,
                fontStyle: 'italic',
                opacity: '1 !important'
              },
              // Toolbar styling
              '& .ql-toolbar': {
                borderRadius: { xs: '8px 8px 0 0', sm: '12px 12px 0 0' },
                bgcolor: `${isDarkMode ? alpha(theme.palette.background.paper, 0.8) : '#f3f3f3'} !important`,
                borderColor: `${isDarkMode ? alpha(theme.palette.divider, 0.3) : '#ccc'} !important`
              },
              // Toolbar button borders
              '& .ql-toolbar button': {
                color: `${isDarkMode ? theme.palette.text.primary : '#444'} !important`,
                '&:hover': {
                  bgcolor: `${isDarkMode ? alpha(theme.palette.primary.main, 0.12) : alpha(theme.palette.primary.light, 0.1)} !important`
                }
              },
              // All stroke icons (Bold, Italic, Underline, etc.)
              '& .ql-stroke': {
                stroke: `${isDarkMode ? alpha(theme.palette.text.primary, 0.9) : '#444'} !important`,
                strokeWidth: isDarkMode ? '1.5 !important' : '1'
              },
              // All fill icons
              '& .ql-fill': {
                fill: `${isDarkMode ? alpha(theme.palette.text.primary, 0.9) : '#444'} !important`
              },
              // Even stroke (for specific icons)
              '& .ql-even': {
                fill: `${isDarkMode ? alpha(theme.palette.text.primary, 0.9) : '#444'} !important`
              },
              // Picker labels (dropdowns)
              '& .ql-picker-label': {
                color: `${isDarkMode ? theme.palette.text.primary : '#444'} !important`,
                borderColor: isDarkMode ? alpha(theme.palette.divider, 0.3) : 'transparent'
              },
              // Picker label SVG
              '& .ql-picker-label svg': {
                '& .ql-stroke': {
                  stroke: `${isDarkMode ? alpha(theme.palette.text.primary, 0.9) : '#444'} !important`
                }
              },
              // Dropdown options background
              '& .ql-picker-options': {
                bgcolor: isDarkMode ? theme.palette.background.paper : 'white',
                borderColor: isDarkMode ? alpha(theme.palette.divider, 0.3) : '#ccc',
                boxShadow: isDarkMode
                  ? `0 4px 12px ${alpha(theme.palette.common.black, 0.4)}`
                  : '0 2px 8px rgba(0,0,0,0.1)'
              },
              // Dropdown items
              '& .ql-picker-item': {
                color: isDarkMode ? theme.palette.text.primary : '#444',
                '&:hover': {
                  bgcolor: isDarkMode ? alpha(theme.palette.primary.main, 0.12) : alpha(theme.palette.primary.light, 0.1)
                }
              },
              // Hover state for toolbar buttons
              '& .ql-toolbar button:hover .ql-stroke': {
                stroke: `${theme.palette.primary.main} !important`,
                strokeWidth: '1.8 !important'
              },
              '& .ql-toolbar button:hover .ql-fill': {
                fill: `${theme.palette.primary.main} !important`
              },
              '& .ql-toolbar button:hover .ql-even': {
                fill: `${theme.palette.primary.main} !important`
              },
              // Focus state
              '& .ql-toolbar button:focus .ql-stroke': {
                stroke: `${theme.palette.primary.main} !important`
              },
              '& .ql-toolbar button:focus .ql-fill': {
                fill: `${theme.palette.primary.main} !important`
              },
              // Active/selected state
              '& .ql-toolbar button.ql-active': {
                bgcolor: `${isDarkMode ? alpha(theme.palette.primary.main, 0.2) : alpha(theme.palette.primary.light, 0.15)} !important`
              },
              '& .ql-toolbar button.ql-active .ql-stroke': {
                stroke: `${theme.palette.primary.main} !important`,
                strokeWidth: '1.8 !important'
              },
              '& .ql-toolbar button.ql-active .ql-fill': {
                fill: `${theme.palette.primary.main} !important`
              },
              '& .ql-toolbar button.ql-active .ql-even': {
                fill: `${theme.palette.primary.main} !important`
              },
              // Expanded picker styling
              '& .ql-picker.ql-expanded .ql-picker-label': {
                borderColor: `${isDarkMode ? theme.palette.primary.main : theme.palette.primary.light} !important`,
                color: `${theme.palette.primary.main} !important`
              },
              '& .ql-picker.ql-expanded .ql-picker-label .ql-stroke': {
                stroke: `${theme.palette.primary.main} !important`
              },
              // Selected picker item
              '& .ql-picker-item.ql-selected': {
                color: `${theme.palette.primary.main} !important`,
                bgcolor: `${isDarkMode ? alpha(theme.palette.primary.main, 0.15) : alpha(theme.palette.primary.light, 0.1)} !important`
              },
              // Tooltip/picker arrow in label
              '& .ql-picker-label .ql-stroke': {
                stroke: `${isDarkMode ? alpha(theme.palette.text.primary, 0.9) : '#444'} !important`
              },
              // Color picker specific
              '& .ql-color-picker .ql-picker-label svg': {
                '& .ql-stroke': {
                  stroke: `${isDarkMode ? alpha(theme.palette.text.primary, 0.9) : '#444'} !important`
                }
              },
              // Background color picker
              '& .ql-background .ql-picker-label svg': {
                '& .ql-stroke': {
                  stroke: `${isDarkMode ? alpha(theme.palette.text.primary, 0.9) : '#444'} !important`
                }
              }
            }}
          >
            <ReactQuill
              quillRef
              value={content}
              placeholder='Enter your content...'
              onChange={handleEditorChange}
              modules={quillModules}
              formats={quillFormats}
              theme='snow'
            />
          </Box>
          {errorMessage && (
            <Typography
              variant='body2'
              color='error'
              sx={{
                fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                fontWeight: 500
              }}
            >
              {errorMessage}
            </Typography>
          )}
        </Stack>
      </Box>
    )
  }
)

export default ReactQuillHTMLEditor

{
  /* Preview Section */
}
{
  /* <div className='m-10 w-full border-t border-gray-300 pt-5'>
  <h2 className='text-lg font-bold mb-3'>Content Preview:</h2>
  <ReactQuill
    value={content}
    readOnly={true}
    theme='snow' // Same theme as the editor
    modules={{ toolbar: false }} // Disable the toolbar
    className='custom-quill-readOnly' // in globals.css
  />
</div> */
}

// TODO: upload image/videos to S3 to reduce the size of content
// import React, { forwardRef, useImperativeHandle, useState } from 'react';
// import ReactQuill from 'react-quill';
// import Typography from '@mui/material/Typography';
// import AWS from 'aws-sdk'; // Ensure you have aws-sdk installed
// import 'react-quill/dist/quill.snow.css';

// const ReactQuillHTMLEditor = forwardRef(
//   ({ value = '', onChange = () => {}, label = 'Content', required = false }, ref) => {
//     const [content, setContent] = useState(value);
//     const [errorMessage, setErrorMessage] = useState('');

//     // AWS S3 Configuration
//     const s3 = new AWS.S3({
//       accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
//       secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
//       region: process.env.NEXT_PUBLIC_AWS_REGION,
//     });

//     const bucketName = process.env.NEXT_PUBLIC_AWS_BUCKET_NAME;

//     const quillFormats = [
//       'header',
//       'font',
//       'size',
//       'bold',
//       'italic',
//       'underline',
//       'strike',
//       'color',
//       'background',
//       'script',
//       'blockquote',
//       'code-block',
//       'list',
//       'bullet',
//       'check',
//       'indent',
//       'direction',
//       'align',
//       'link',
//       'image',
//       'video',
//       'formula',
//     ];

//     const quillModules = {
//       toolbar: [
//         [{ header: [1, 2, 3, 4, 5, 6, false] }],
//         [{ font: [] }, { size: [] }],
//         ['bold', 'italic', 'underline', 'strike'],
//         [{ color: [] }, { background: [] }],
//         [{ script: 'sub' }, { script: 'super' }],
//         ['blockquote', 'code-block'],
//         [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
//         [{ indent: '-1' }, { indent: '+1' }],
//         [{ direction: 'rtl' }, { align: [] }],
//         ['link', 'image', 'video', 'formula'],
//         ['clean'],
//       ],
//     };

//     const handleEditorChange = (newContent) => {
//       setContent(newContent);
//       onChange(newContent);

//       if (required) {
//         if (isContentEmpty(newContent)) {
//           setErrorMessage('Content cannot be empty.');
//         } else {
//           setErrorMessage('');
//         }
//       }
//     };

//     const isContentEmpty = (contentVal) => {
//       const plainText = contentVal.replace(/<[^>]*>/g, '').trim();
//       const hasMedia = /<(img|video|iframe|audio|embed)[^>]*>/.test(contentVal);
//       return plainText === '' && !hasMedia;
//     };

//     const uploadImageToS3 = async (base64String, imageName) => {
//       const buffer = Buffer.from(base64String.split(',')[1], 'base64');
//       const params = {
//         Bucket: bucketName,
//         Key: `uploads/${imageName}`, // Change path as needed
//         Body: buffer,
//         ContentType: 'image/jpeg', // Adjust based on your images
//         ACL: 'public-read',
//       };

//       const { Location } = await s3.upload(params).promise();
//       return Location; // Return the public URL of the uploaded image
//     };

//     const processImages = async (htmlContent) => {
//       const parser = new DOMParser();
//       const parsedDoc = parser.parseFromString(htmlContent, 'text/html');
//       const images = parsedDoc.querySelectorAll('img');

//       for (const img of images) {
//         const src = img.src;

//         if (src.startsWith('data:image/')) {
//           // If the image is a Base64 string, upload it to S3
//           const fileName = `image-${Date.now()}.jpg`; // Generate a unique name
//           const s3Url = await uploadImageToS3(src, fileName);
//           img.src = s3Url; // Replace the Base64 string with the S3 URL
//         }
//       }

//       return parsedDoc.body.innerHTML;
//     };

//     const handleSave = async () => {
//       if (required && isContentEmpty(content)) {
//         setErrorMessage('Content cannot be empty.');
//         return false;
//       }

//       try {
//         // Process images and replace Base64 with S3 URLs
//         const updatedContent = await processImages(content);
//         console.log('Final Content:', updatedContent);

//         // You can pass updatedContent to your API or parent component
//         return true;
//       } catch (error) {
//         console.error('Error while saving content:', error);
//         return false;
//       }
//     };

//     useImperativeHandle(ref, () => ({
//       onSubmit: handleSave,
//     }));

//     return (
//       <main style={{ width: '100%' }}>
//         <div className="flex flex-col items-center">
//           <Typography variant="h6" sx={{ mb: 1, width: '100%', textAlign: 'left' }}>
//             {label}
//           </Typography>
//           <ReactQuill
//             value={content}
//             placeholder="Enter your content..."
//             onChange={handleEditorChange}
//             modules={quillModules}
//             formats={quillFormats}
//             theme="snow"
//           />
//           {errorMessage && (
//             <Typography variant="body2" color="error" sx={{ mt: 1, textAlign: 'left', width: '100%' }}>
//               {errorMessage}
//             </Typography>
//           )}
//         </div>
//       </main>
//     );
//   }
// );

// export default ReactQuillHTMLEditor;
