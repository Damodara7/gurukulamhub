import { useState } from 'react'
import { Box, Grid, TextField, IconButton, Button, FormControl, Typography, Divider } from '@mui/material'

// react-icons Imports
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import { RiAddFill, RiCloseFill } from 'react-icons/ri'
import { IoMdAttach } from 'react-icons/io'
import IconButtonTooltip from '@/components/IconButtonTooltip'
import useUUID from '@/app/hooks/useUUID'

// Mui-file-input Imports
import { MuiFileInput } from 'mui-file-input'

const QuizDocuments = ({ documents = [], setTheFormValue }) => {
  //   const [documents, setDocuments] = useState([{ id: 0, description: '', document: null }])
  console.log('quiz documents:', documents)
  const { uuid, regenerateUUID, getUUID } = useUUID()

  // Handle adding a new document row
  const handleAddRow = () => {
    setTheFormValue('documents', [...documents, { id: getUUID(), description: '', document: null }])
  }

  // Handle removing a document row by ID
  const handleRemoveRow = id => {
    const updatedDocuments = documents.filter(doc => doc.id !== id) // Filter out the document with the matching id
    setTheFormValue('documents', updatedDocuments)
  }

  // Handle input changes by ID
  const handleInputChange = (id, event) => {
    const { name, value, files } = event.target

    const updatedDocuments = documents.map(doc =>
      doc.id === id
        ? {
            ...doc,
            [name]: name === 'document' ? files[0] : value // Update only the matching document's field
          }
        : doc
    )

    setTheFormValue('documents', updatedDocuments)
  }

  // Handle file input changes by ID and field name
  const handleFileInputChangeByFieldName = (id, name, file) => {
    const updatedDocuments = documents.map(doc =>
      doc.id === id
        ? {
            ...doc,
            [name]: file // Update the file field for the matching document
          }
        : doc
    )

    setTheFormValue('documents', updatedDocuments)
  }

  return (
    <Box
      sx={{
        border: '1px solid #ccc',
        borderRadius: '5px',
        width: '100%',
        p: 2
      }}
    >
      <Typography variant='h6' className='mb-2'>
        Related Documents:{' '}
      </Typography>
      {documents.map((document, index) => (
        <Box
          key={index}
          display='flex'
          alignItems='center'
          flexWrap='wrap'
          sx={{ border: { xs: '1px solid #ccc', sm: 'none' }, padding: { xs: '5px', sm: '0' } }}
          gap={3}
          mb={index === documents.length ? 0 : 3} // Add margin-bottom for spacing between rows
        >
          <Box
            flex={'1 1 45%'} // Adjust width flexibly
            minWidth='250px' // To prevent from getting too small on narrow screens
          >
            <TextField
              label={`Document Description ${index + 1}`}
              name='description'
              value={document.description}
              onChange={e => handleInputChange(document.id, e)}
              variant='outlined'
              fullWidth
              required
            />
          </Box>

          <Box flex='1 1 45%' minWidth='250px'>
            <FormControl fullWidth>
              <MuiFileInput
                label={'Upload Doc.'}
                name='document'
                value={document.document}
                onChange={e => handleFileInputChangeByFieldName(document.id, 'document', e)}
                fullWidth
                clearIconButtonProps={{
                  title: 'Remove',
                  children: <RiCloseFill />
                }}
                placeholder='Upload document (pdf/doc/image)'
                InputProps={{
                  inputProps: {
                    accept: '.pdf,.doc,.docx,.jpeg,.png,.jpg'
                    // 'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                  },
                  startAdornment: <IoMdAttach />
                }}
              />
            </FormControl>
          </Box>

          {
            <Box display='flex' justifyContent='center' flex='0 1 40px'>
              <IconButtonTooltip title='Remove' color='secondary' onClick={() => handleRemoveRow(document.id)}>
                <RemoveIcon />
              </IconButtonTooltip>
            </Box>
          }
        </Box>
      ))}

      <Box display='flex' justifyContent='flex-end'>
        <IconButtonTooltip title='Add' color='primary' onClick={handleAddRow}>
          <AddIcon />
        </IconButtonTooltip>
      </Box>
    </Box>
  )
}

export default QuizDocuments
