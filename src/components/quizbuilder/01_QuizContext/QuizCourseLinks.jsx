import { useState } from 'react'
import {
  Box,
  Grid,
  TextField,
  IconButton,
  Button,
  FormControl,
  Typography,
  Divider,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'

// react-icons Imports
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import IconButtonTooltip from '@/components/IconButtonTooltip'

const QuizCourseLinks = ({ courseLinks = [], setTheFormValue }) => {
  // Handle adding a new course link row
  const handleAddRow = () => {
    setTheFormValue('courseLinks', [...courseLinks, { id: courseLinks.length + 1, mediaType: 'video', link: '' }])
  }

  // Handle removing a course link row
  const handleRemoveRow = index => {
    const updatedLinks = courseLinks.filter((_, i) => i !== index)
    setTheFormValue('courseLinks', updatedLinks)
  }

  // Handle input changes
  const handleInputChange = (index, event) => {
    const { name, value } = event.target
    const updatedLinks = [...courseLinks]
    updatedLinks[index][name] = value
    setTheFormValue('courseLinks', updatedLinks)
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
        Course Links:
      </Typography>

      {courseLinks.map((link, index) => (
        <Box
          key={index}
          display='flex'
          alignItems='center'
          flexWrap='wrap'
          gap={3}
          mb={index === courseLinks.length ? 0 : 3} // Add margin-bottom for spacing between rows
        >
          {/* Media Type Select */}
          {/* <Box flex='1 1 20%' minWidth='150px'>
            <FormControl fullWidth>
              <InputLabel>Media Type</InputLabel>
              <Select
                name='mediaType'
                value={link.mediaType}
                onChange={e => handleInputChange(index, e)}
                label='Media Type'
              >
                <MenuItem value='video'>Video</MenuItem>
                <MenuItem value='text'>Text</MenuItem>
              </Select>
            </FormControl>
          </Box> */}

          {/* Link Input */}
          <Box flex='1 1 70%' minWidth='240px'>
            <TextField
              label={`Link ${index + 1}`}
              name='link'
              value={link.link}
              placeholder='https://www.youtube.com/shorts/Aak8yjC_nT0'
              onChange={e => handleInputChange(index, e)}
              variant='outlined'
              fullWidth
              required
            />
          </Box>

          {/* Remove Button */}
          {
            <Box display='flex' justifyContent='center' flex='0 1 40px'>
              <IconButtonTooltip title='Remove' color='secondary' onClick={() => handleRemoveRow(index)}>
                <RemoveIcon />
              </IconButtonTooltip>
            </Box>
          }
        </Box>
      ))}

      {/* Add Button */}
      <Box display='flex' justifyContent='flex-end'>
        <IconButtonTooltip title='Add' color='primary' onClick={handleAddRow}>
          <AddIcon />
        </IconButtonTooltip>
      </Box>
    </Box>
  )
}

export default QuizCourseLinks
