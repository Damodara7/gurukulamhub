import React, { useState } from 'react'
import TemplateToolbar from './TemplateToolbar'
import { Box, Button, Typography } from '@mui/material'

function SelectTemplateType({ onCancel, onCreateQuestion }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null)

  function onSelect(template) {
    setSelectedTemplate(template)
  }

  return (
    <Box className='flex flex-col'>
      <Typography variant='h6' align='center' gutterBottom>
        Select Template Type for the Question
      </Typography>
      <Box className='mb-4'>
        <TemplateToolbar direction='row' onSelect={onSelect} selectedTemplate={selectedTemplate} />
      </Box>
      {selectedTemplate && (
        <Typography variant='body1' sx={{ mb: 4 }}>
          Selected Template: <Typography component='span' color='primary'>{selectedTemplate}</Typography>
        </Typography>
      )}
      <Box className='w-full flex gap-3 items-center'>
        <Button onClick={onCancel} color='error' variant='outlined'>
          Cancel
        </Button>
        <Button
          disabled={!selectedTemplate}
          onClick={() => onCreateQuestion(selectedTemplate)}
          color='primary'
          component='label'
          variant='contained'
          sx={{ color: 'white' }}
        >
          Create Question
        </Button>
      </Box>
    </Box>
  )
}

export default SelectTemplateType
