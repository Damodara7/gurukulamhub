import React, { useState } from 'react'
import { 
  Box, 
  Button, 
  Typography, 
  Grid, 
  Card, 
  CardActionArea, 
  CardContent,
  useTheme,
  alpha,
  Stack
} from '@mui/material'
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import ShortTextIcon from '@mui/icons-material/ShortText'
import ToggleOnIcon from '@mui/icons-material/ToggleOn'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import CancelIcon from '@mui/icons-material/Cancel'

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
  const theme = useTheme()

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      {/* Header */}
      <Stack spacing={1} sx={{ mb: 4, textAlign: 'center' }}>
        <Typography
          variant='h5'
          fontWeight={700}
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Select Question Type
        </Typography>
        <Typography variant='body2' color='text.secondary' sx={{ maxWidth: '500px', mx: 'auto' }}>
          Choose the template that best fits your question style
        </Typography>
      </Stack>

      {/* Template Grid */}
      <Grid container spacing={3} justifyContent='center' sx={{ mb: 4 }}>
        {TEMPLATE_TYPES.map(type => (
          <Grid item xs={12} sm={6} md={3} key={type.key}>
            <Card
              variant='outlined'
              sx={{
                border: '1px solid',
                borderColor: selectedTemplate === type.key ? theme.palette.primary.main : '#e8eaed',
                borderRadius: 2,
                bgcolor: selectedTemplate === type.key 
                  ? alpha(theme.palette.primary.main, 0.08)
                  : 'white',
                boxShadow: selectedTemplate === type.key 
                  ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`
                  : '0 2px 8px rgba(0,0,0,0.04)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  transform: 'translateY(-4px)',
                  boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.2)}`
                }
              }}
              onClick={() => setSelectedTemplate(type.key)}
            >
              <CardActionArea>
                <CardContent sx={{ py: 4, px: 2, textAlign: 'center' }}>
                  <Box
                    sx={{
                      color: selectedTemplate === type.key ? theme.palette.primary.main : 'text.secondary',
                      transition: 'color 0.3s ease',
                      mb: 1.5
                    }}
                  >
                    {type.icon}
                  </Box>
                  <Typography
                    variant='subtitle1'
                    sx={{
                      fontWeight: 600,
                      color: selectedTemplate === type.key ? theme.palette.primary.main : 'text.secondary',
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

      {/* Selected Confirmation */}
      {selectedTemplate && (
        <Box
          sx={{
            mb: 4,
            p: 2,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.success.main, 0.1),
            border: '1px solid',
            borderColor: alpha(theme.palette.success.main, 0.3),
            textAlign: 'center'
          }}
        >
          <Typography variant='body1' sx={{ fontWeight: 600, color: theme.palette.success.main }}>
            ✓ Selected: {TEMPLATE_TYPES.find(t => t.key === selectedTemplate)?.label}
          </Typography>
        </Box>
      )}

      {/* Action Buttons */}
      <Stack direction='row' spacing={2} justifyContent='center'>
        <Button
          onClick={onCancel}
          variant='outlined'
          color='error'
          startIcon={<CancelIcon />}
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '1rem'
          }}
        >
          Cancel
        </Button>
        <Button
          disabled={!selectedTemplate}
          onClick={() => onCreateQuestion(selectedTemplate)}
          variant='contained'
          component='label'
          startIcon={<AddCircleOutlineIcon />}
          size='large'
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '1rem',
            color: 'white',
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`
            },
            '&:disabled': {
              bgcolor: alpha(theme.palette.grey[400], 0.5),
              color: 'white',
              boxShadow: 'none'
            }
          }}
        >
          Create Question
        </Button>
      </Stack>
    </Box>
  )
}

export default SelectTemplateType
