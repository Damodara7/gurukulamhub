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
  InputAdornment
} from '@mui/material'
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
    <Dialog open={showForm} onClose={onCancel} maxWidth='sm' fullWidth>
      <DialogTitle>{`${initialData?.action === 'EDIT' ? 'Edit' : 'Create'}${
        formData.isRoot ? ' Root' : ''
      } Context`}</DialogTitle>
      <DialogContent className='pt-2'>
        {/* <LanguageSelect
          defaultLanguage={formData.language}
          fieldName='language'
          setTheFormValue={handleSetTheFormValue}
        /> */}
        <TextField
          fullWidth
          label='Title'
          name='title'
          value={formData.title}
          onChange={handleInputChange}
          margin='normal'
        />
        <TextField
          fullWidth
          label='Context ID'
          name='id'
          value={formData.id}
          onChange={handleInputChange}
          margin='normal'
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
          margin='normal'
        />

        {/* Conditional Rendering of parentContextId Field */}
        {formData.parentContextId && (
          <TextField
            fullWidth
            label='Parent Context ID'
            name='parentContextId'
            value={formData.parentContextId}
            margin='normal'
            InputProps={{
              readOnly: true // Make it readonly for non-root contexts
            }}
          />
        )}

        {/* <TextField
          fullWidth
          label='Context Type'
          name='contextType'
          value={formData.contextType}
          margin='normal'
          InputProps={{
            readOnly: true // Make it readonly for non-root contexts
          }}
        /> */}

        <TagInput setFormValue={handleSetTheFormValue} value={formData.tags} />
      </DialogContent>
      <DialogActions>
        <Button variant='outlined' color='error' onClick={onCancel}>
          Cancel
        </Button>
        <Button variant='contained' color='primary' component='label' style={{ color: 'white' }} onClick={handleSubmit}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ContextForm
