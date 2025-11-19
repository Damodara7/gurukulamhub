'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Typography,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  Stack,
  IconButton
} from '@mui/material'
import { useTheme, alpha } from '@mui/material/styles'
import IconButtonTooltip from '@/components/IconButtonTooltip'
import CloseIcon from '@mui/icons-material/Close'
import LanguageSelect from '@/components/quizbuilder/05_Components/LanguageSelect'
import { v4 as uuidv4 } from 'uuid'
import { toast } from 'react-toastify'
import TagInput from '@/components/TagInput'
import { useSession } from 'next-auth/react'

const ContextForm = ({
  onSubmit,
  contextType,
  isRoot = true,
  parentContextId = '',
  parentContextObjectId = '',
  initialData = null, // New prop to accept initial data for editing
  showForm, // New prop to control dialog visibility
  onCancel // New prop to handle closing the dialog
}) => {
  console.log('Data to context form: ', initialData)
  const { data: session } = useSession()
  const theme = useTheme()

  const [formData, setFormData] = useState({
    id: initialData?.id || '', // Set existing ID if available
    title: initialData?.title || '',
    description: initialData?.description || '',
    createdBy: initialData?.createdBy || session?.user?.email,
    language: initialData?.language || { code: 'en', name: 'English' },
    contextType: initialData?.contextType || contextType,
    tags: initialData?.tags || [],
    status: initialData?.status || 'active',
    parentContextId: isRoot ? null : parentContextId,
    parentContextObjectId: isRoot ? null : parentContextObjectId,
    isRoot: isRoot
  })

  useEffect(() => {
    if (initialData) {
      setFormData(prevState => ({
        ...prevState,
        ...initialData
      }))
    }
  }, [initialData])

  const handleInputChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSetTheFormValue = (fieldName, value) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }))
  }

  const handleGenerateId = () => {
    if (formData.title) {
      const generatedId = formData.title.replace(/\s+/g, '_').toUpperCase() + `_${uuidv4().slice(0, 8)}`
      setFormData(prev => ({ ...prev, id: generatedId }))
    } else {
      toast.error('Please enter a title before generating an ID.')
    }
  }

  const handleSubmit = () => {
    if (onSubmit) onSubmit(formData)
  }

  console.log({ formData })

  return (
    <Dialog
      open={showForm}
      onClose={onCancel}
      maxWidth='sm'
      fullWidth
      scroll='paper'
      PaperProps={{
        sx: {
          borderRadius: { xs: 3, sm: 3 },
          background: '#ffffff',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          mx: { xs: 2.5, sm: 0 },
          my: { xs: 4, sm: 6 },
          maxHeight: { xs: '78dvh', sm: '92dvh' }
        }
      }}
    >
      <DialogTitle
        sx={{
          px: { xs: 3, sm: 4 },
          py: { xs: 2.5, sm: 3 },
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          backgroundColor: '#ffffff'
        }}
      >
        <Stack direction='row' spacing={2} alignItems='center' justifyContent='space-between'>
          <Typography
            variant='h6'
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              letterSpacing: '-0.01em'
            }}
          >
            {`${initialData?.action === 'EDIT' ? 'Update' : 'Create'} Context`}
          </Typography>
          <IconButtonTooltip
            title='Close'
            onClick={onCancel}
            sx={{
              color: theme.palette.text.secondary,
              '&:hover i': { color: theme.palette.text.primary }
            }}
          >
            <i className='ri-close-line text-xl' />
          </IconButtonTooltip>
        </Stack>
      </DialogTitle>
      <DialogContent
        sx={{
          px: { xs: 3, sm: 4 },
          py: { xs: 3, sm: 4 },
          overflowY: 'auto',
          background: `linear-gradient(155deg, ${alpha(theme.palette.primary.light, 0.08)} 0%, ${alpha(
            theme.palette.secondary.light,
            0.06
          )} 100%)`
        }}
      >
        <Stack
          spacing={2.5}
          sx={{
            borderRadius: 3,
            backgroundColor: '#ffffff',
            boxShadow: '0 12px 30px rgba(15,15,45,0.06)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            p: { xs: 2.5, sm: 3 }
          }}
        >
          <TextField fullWidth label='Title' name='title' value={formData.title} onChange={handleInputChange} />
          <TextField
            fullWidth
            label='Context ID'
            name='id'
            value={formData.id}
            onChange={handleInputChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  {initialData?.action !== 'EDIT' && (
                    <Button variant='text' color='primary' onClick={handleGenerateId} disabled={!formData.title}>
                      Generate
                    </Button>
                  )}
                </InputAdornment>
              ),
              readOnly: initialData?.action === 'EDIT'
            }}
          />
          <TextField
            fullWidth
            label='Description'
            name='description'
            value={formData.description}
            onChange={handleInputChange}
            multiline
            minRows={3}
          />

          {formData.parentContextId && (
            <TextField
              fullWidth
              label='Parent Context ID'
              name='parentContextId'
              value={formData.parentContextId}
              InputProps={{
                readOnly: true
              }}
            />
          )}

          <TagInput setFormValue={handleSetTheFormValue} value={formData.tags} />
        </Stack>
      </DialogContent>
      <DialogActions
        sx={{
          px: { xs: 3, sm: 4 },
          py: { xs: 2, sm: 2.5 },
          backgroundColor: alpha(theme.palette.primary.main, 0.04),
          display: 'flex',
          gap: { xs: 1.5, sm: 2 },
          flexWrap: 'wrap',
          justifyContent: { xs: 'center', sm: 'flex-end' },
          alignItems: 'center',
          mt: { xs: 2, sm: 2 },
          '& > .MuiButton-root': {
            minWidth: 120,
            justifyContent: 'center'
          }
        }}
      >
        <Button variant='outlined' onClick={onCancel}>
          Cancel
        </Button>
        <Button variant='contained' color='primary' component='label' sx={{ color: 'white' }} onClick={handleSubmit}>
          {initialData?.action === 'EDIT' ? 'Update' : 'Submit'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ContextForm
