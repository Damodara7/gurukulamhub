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
    <Box className='flex flex-col items-center' sx={{ width: '100%', p: 2 }}>
      <Typography
        variant='h5'
        align='center'
        sx={{
          fontWeight: 700,
          color: '#667eea',
          mb: 1
        }}
      >
        ✏️ Select Question Type
      </Typography>
      <Typography variant='body2' align='center' color='text.secondary' sx={{ mb: 3, maxWidth: '500px' }}>
        Choose the template that best fits your question style
      </Typography>
      <Grid container spacing={2.5} justifyContent='center' sx={{ mb: 3, mt: 0 }}>
        {TEMPLATE_TYPES.map(type => (
          <Grid item xs={12} sm={6} md={3} key={type.key}>
            <Card
              variant='outlined'
              sx={{
                border: '2px solid',
                borderColor: selectedTemplate === type.key ? '#667eea' : '#d0d0d0',
                borderRadius: '12px',
                backgroundColor: selectedTemplate === type.key ? 'rgba(102, 126, 234, 0.08)' : 'white',
                boxShadow: selectedTemplate === type.key ? '0 6px 20px rgba(102, 126, 234, 0.25)' : 'none',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: '#667eea',
                  backgroundColor: 'rgba(102, 126, 234, 0.05)',
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.2)'
                }
              }}
              onClick={() => setSelectedTemplate(type.key)}
            >
              <CardActionArea>
                <CardContent className='flex flex-col items-center justify-center' sx={{ py: 3 }}>
                  <Box
                    sx={{
                      color: selectedTemplate === type.key ? '#667eea' : '#999',
                      transition: 'color 0.3s ease'
                    }}
                  >
                    {type.icon}
                  </Box>
                  <Typography
                    variant='subtitle1'
                    sx={{
                      mt: 1.5,
                      fontWeight: 600,
                      color: selectedTemplate === type.key ? '#667eea' : 'text.secondary',
                      transition: 'color 0.3s ease'
                    }}
                  >
                    {type.label}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
      {selectedTemplate && (
        <Box
          sx={{
            my: 3,
            px: 3,
            py: 1.5,
            borderRadius: '8px',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            border: '1px solid #667eea'
          }}
        >
          <Typography variant='body1' sx={{ fontWeight: 600, color: '#667eea' }}>
            ✓ Selected: {TEMPLATE_TYPES.find(t => t.key === selectedTemplate)?.label}
          </Typography>
        </Box>
      )}
      <Box className='w-full flex gap-3 items-center justify-center mt-4'>
        <Button
          onClick={onCancel}
          variant='outlined'
          sx={{
            borderRadius: '8px',
            px: 3,
            py: 1.5,
            borderWidth: '2px',
            borderColor: '#ef4444',
            color: '#ef4444',
            fontWeight: 600,
            '&:hover': {
              borderWidth: '2px',
              backgroundColor: 'rgba(239, 68, 68, 0.05)'
            }
          }}
        >
          Cancel
        </Button>
        <Button
          disabled={!selectedTemplate}
          onClick={() => onCreateQuestion(selectedTemplate)}
          variant='contained'
          sx={{
            borderRadius: '8px',
            px: 4,
            py: 1.5,
            backgroundColor: '#667eea !important',
            color: 'white !important',
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '1rem',
            '&:hover': {
              backgroundColor: '#5563d1 !important',
              color: 'white !important'
            },
            '&:disabled': {
              backgroundColor: '#cccccc !important',
              color: 'white !important'
            }
          }}
        >
          ➕ Create Question
        </Button>
      </Box>
    </Box>
  )
}

export default SelectTemplateType
