import React, { useState } from 'react'
import { Box, Button, Typography, Grid, Card, CardActionArea, CardContent } from '@mui/material'
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import ShortTextIcon from '@mui/icons-material/ShortText'
import ToggleOnIcon from '@mui/icons-material/ToggleOn'

const TEMPLATE_TYPES = [
  {
    key: 'single-choice',
    label: 'Single Choice',
    icon: <RadioButtonCheckedIcon fontSize='large' color='primary' />
  },
  {
    key: 'multiple-choice',
    label: 'Multiple Choice',
    icon: <CheckBoxIcon fontSize='large' color='primary' />
  },
  {
    key: 'fill-in-blank',
    label: 'Fill in the Blank',
    icon: <ShortTextIcon fontSize='large' color='primary' />
  },
  {
    key: 'true-or-false',
    label: 'True or False',
    icon: <ToggleOnIcon fontSize='large' color='primary' />
  }
]

function SelectTemplateType({ onCancel, onCreateQuestion }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null)

  return (
    <Box className='flex flex-col items-center' sx={{ width: '100%' }}>
      <Typography variant='h6' align='center' gutterBottom>
        Select Template Type for the Question
      </Typography>
      <Grid container spacing={3} justifyContent='center' sx={{ mb: 4, mt: 1 }}>
        {TEMPLATE_TYPES.map((type) => (
          <Grid item xs={12} sm={6} md={3} key={type.key}>
            <Card
              variant={selectedTemplate === type.key ? 'elevation' : 'outlined'}
              sx={{
                border: '3px solid',
                borderColor: selectedTemplate === type.key ? 'primary.main' : 'transparent',
                boxShadow: selectedTemplate === type.key ? 6 : 1,
                transition: 'box-shadow 0.2s, border-color 0.2s',
                cursor: 'pointer',
                backgroundColor: selectedTemplate === type.key ? 'primary.50' : 'background.paper',
              }}
              onClick={() => setSelectedTemplate(type.key)}
            >
              <CardActionArea>
                <CardContent className='flex flex-col items-center justify-center' sx={{ py: 4 }}>
                  {type.icon}
                  <Typography variant='subtitle1' sx={{ mt: 1, fontWeight: 500 }}>
                    {type.label}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
      {selectedTemplate && (
        <Typography variant='body1' sx={{ my: 5, mt: 6 }}>
          Selected Template: <Typography component='span' color='primary'>{TEMPLATE_TYPES.find(t => t.key === selectedTemplate)?.label}</Typography>
        </Typography>
      )}
      <Box className='w-full flex gap-3 items-center justify-center mt-4'>
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
