// 'use client'
// MUI Imports
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  IconButton,
  FormControl,
  FormControlLabel,
  Switch,
  Button,
  TextField,
  Typography,
  Box
} from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { useSession } from 'next-auth/react'
import { addVideo, updateVideo } from '../../actions/videos'
import ContextTreeSearch from '../quizbuilder/01_QuizContext/ContextTreeSearch'
import VideoQuestions from './VideoQuestions'
import MediaPreviewPopup from './MediaPreviewPopup'
import VideoPortions from './VideoPortions'
import IconButtonTooltip from '../IconButtonTooltip'

// AddContent Component
const AddContent = ({ handleClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: '',
    genericContextIds: [],
    academicContextIds: [],
    createdBy: '', // Optional: Set this based on the logged-in user
    isActive: true,
    questions: [], // Initialize as empty or populate based on requirements
    recommendedSegments: []
  })

  const [isGenericPopupOpen, setIsGenericPopupOpen] = useState(false)
  const [isAcademicPopupOpen, setIsAcademicPopupOpen] = useState(false)
  const [isQuestionFormOpen, setIsQuestionFormOpen] = useState(false)
  const [videoDuration, setVideoDuration] = useState(0)

  const [errors, setErrors] = useState({})

  const validateField = (field, value) => {
    let error = ''
    if (field === 'name' && value.trim() === '') error = 'Name is required.'
    if (field === 'url' && value.trim() === '') error = 'Video URL is required.'
    if (field === 'description' && value.trim() === '') error = 'Description is required.'
    if (field === 'genericContextIds' && (!Array.isArray(value) || value.length === 0)) error = 'Context is required.'
    return error
  }

  const handleSetFormValue = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    const error = validateField(field, value)
    setErrors(prev => ({ ...prev, [field]: error }))
  }

  const validateForm = () => {
    const newErrors = {}
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field])
      if (error) newErrors[field] = error
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddRow = async () => {
    if (!validateForm()) return
    await onCreate({
      ...formData,
      name: formData.name,
      contextIds: [...formData.genericContextIds, ...formData.academicContextIds]
    })
    handleClose()
  }

  const handleOpenPopup = contextType => {
    if (contextType === 'GENERIC') {
      setIsGenericPopupOpen(true)
    } else if (contextType === 'ACADEMIC') {
      setIsAcademicPopupOpen(true)
    }
  }

  const handleClosePopup = contextType => {
    if (contextType === 'GENERIC') {
      setIsGenericPopupOpen(false)
    } else if (contextType === 'ACADEMIC') {
      setIsAcademicPopupOpen(false)
    }
  }

  function onSetQuestions(questions) {
    console.log({ questions })
    setFormData(prev => ({ ...prev, questions }))
  }

  function onSetRecommendedSegments(segments) {
    console.log({ segments })
    setFormData(prev => ({ ...prev, recommendedSegments: segments }))
  }

  const renderErrorMessage = error => {
    if (error) {
      return (
        <Typography variant='body2' color='error' sx={{ mb: 1, textAlign: 'left', width: '100%' }}>
          {error}
        </Typography>
      )
    } else {
      return null
    }
  }

  return (
    <DialogContent className='overflow-visible pbs-0 pbe-6 pli-10 sm:pli-16'>
      <IconButtonTooltip title='Close' onClick={handleClose} className='absolute block-start-4 inline-end-4'>
        <i className='ri-close-line text-textSecondary' />
      </IconButtonTooltip>
      {/* Name */}
      <TextField
        label='Name'
        value={formData.name}
        onChange={e => handleSetFormValue('name', e.target.value)}
        fullWidth
        margin='dense'
      />
      {renderErrorMessage(errors?.name)}
      {/* URL */}
      <TextField
        label='Video URL'
        value={formData.url}
        onChange={e => handleSetFormValue('url', e.target.value)}
        fullWidth
        margin='dense'
      />
      {renderErrorMessage(errors?.url)}
      {/* {formData.url && (
        <MediaPreviewPopup
          width='100%'
          height='150px'
          url={formData.url}
          mediaType='video'
          row={false}
          controls={true}
        />
      )} */}
      {/* Description */}
      <TextField
        label='Description'
        value={formData.description}
        onChange={e => handleSetFormValue('description', e.target.value)}
        fullWidth
        margin='dense'
      />
      {renderErrorMessage(errors?.description)}
      {/* Generic Context IDs */}
      <TextField
        label='Generic Context IDs'
        value={formData.genericContextIds.join(', ')}
        onClick={() => handleOpenPopup('GENERIC')}
        fullWidth
        margin='dense'
        InputProps={{ readOnly: true }}
      />
      {renderErrorMessage(errors?.genericContextIds)}
      {/* Academic Context IDs */}
      {/* <TextField
        label='Academic Context IDs'
        value={formData.academicContextIds.join(', ')}
        onClick={() => handleOpenPopup('ACADEMIC')}
        fullWidth
        margin='dense'
        InputProps={{ readOnly: true }}
      /> */}

      {/* Questions */}
      {formData.url && (
        <VideoQuestions
          questions={formData.questions.sort((a, b) => a.invocationTime - b.invocationTime)}
          onSetQuestions={onSetQuestions}
          setIsQuestionFormOpen={setIsQuestionFormOpen}
          isEdit={false}
          videoUrl={formData.url}
          videoDuration={videoDuration}
          setVideoDuration={setVideoDuration}
        />
      )}

      {/* Recommended Video Portions */}
      {formData.url && (
        <VideoPortions
          videoUrl={formData.url}
          videoDuration={videoDuration}
          recommendedSegments={formData.recommendedSegments}
          onSetRecommendedSegments={onSetRecommendedSegments}
        />
      )}

      {/* Status */}
      <FormControl margin='dense'>
        <FormControlLabel
          control={
            <Switch
              checked={formData.isActive}
              onChange={e => handleSetFormValue('isActive', e.target.checked)}
              name='statusSwitch'
              color='primary'
            />
          }
          label={formData.isActive ? 'Active' : 'Inactive'}
        />
      </FormControl>
      {/* Actions */}
      <DialogActions className='gap-2 justify-center'>
        <Button onClick={handleClose} disabled={isQuestionFormOpen} variant='outlined' color='primary'>
          Cancel
        </Button>
        <Button
          component='label'
          variant='contained'
          style={{ color: 'white' }}
          onClick={handleAddRow}
          disabled={isQuestionFormOpen}
        >
          Add
        </Button>
      </DialogActions>

      {/* Generic Context Popup */}
      <Dialog fullWidth maxWidth='sm' open={isGenericPopupOpen} onClose={() => handleClosePopup('GENERIC')}>
        <IconButtonTooltip title='Close' onClick={() => handleClosePopup('GENERIC')} className='absolute block-start-4 inline-end-4'>
          <i className='ri-close-line text-textSecondary' />
        </IconButtonTooltip>
        <DialogContent>
          <ContextTreeSearch
            setTheFormValue={(field, value) => handleSetFormValue(field, value)}
            data={formData}
            contextType='GENERIC'
          />
        </DialogContent>
      </Dialog>

      {/* Academic Context Popup */}
      <Dialog fullWidth maxWidth='sm' open={isAcademicPopupOpen} onClose={() => handleClosePopup('ACADEMIC')}>
        <IconButtonTooltip title='Close' onClick={() => handleClosePopup('ACADEMIC')} className='absolute block-start-4 inline-end-4'>
          <i className='ri-close-line text-textSecondary' />
        </IconButtonTooltip>
        <DialogContent>
          <ContextTreeSearch
            setTheFormValue={(field, value) => handleSetFormValue(field, value)}
            data={formData}
            contextType='ACADEMIC'
          />
        </DialogContent>
      </Dialog>
    </DialogContent>
  )
}

const EditContent = ({ handleClose, data, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: data?.name || '',
    url: data?.url || '',
    description: data?.description || '',
    genericContextIds: data?.genericContextIds || [],
    academicContextIds: data?.academicContextIds || [],
    createdBy: data?.createdBy || '',
    isActive: data?.isActive || false,
    questions: data?.questions || [],
    recommendedSegments: data?.recommendedSegments?.map(clip => ({ ...clip, id: clip._id })) || []
  })

  const [isGenericPopupOpen, setIsGenericPopupOpen] = useState(false)
  const [isAcademicPopupOpen, setIsAcademicPopupOpen] = useState(false)
  const [isQuestionFormOpen, setIsQuestionFormOpen] = useState(false)
  const [videoDuration, setVideoDuration] = useState(0)

  const [errors, setErrors] = useState({})

  const validateField = (field, value) => {
    let error = ''
    if (field === 'name' && value.trim() === '') error = 'Name is required.'
    if (field === 'url' && value.trim() === '') error = 'Video URL is required.'
    if (field === 'description' && value.trim() === '') error = 'Description is required.'
    if (field === 'genericContextIds' && (!Array.isArray(value) || value.length === 0)) error = 'Context is required.'
    return error
  }

  const handleSetFormValue = (field, value) => {
    // Check if the URL is changing
    if (field === 'url' && value !== formData.url) {
      // If URL is changing, reset questions to an empty array
      setFormData(prev => ({
        ...prev,
        [field]: value,
        questions: value === data.url ? data.questions : [] // Reset questions if URL changes
      }))
    } else {
      // Otherwise, update the formData normally
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
    const error = validateField(field, value)
    setErrors(prev => ({ ...prev, [field]: error }))
  }

  const validateForm = () => {
    const newErrors = {}
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field])
      if (error) newErrors[field] = error
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleUpdateRow = async () => {
    if (!validateForm()) return
    await onUpdate({
      _id: data._id,
      ...formData,
      name: formData.name,
      contextIds: [...formData.genericContextIds, ...formData.academicContextIds]
    })
    handleClose()
  }

  const handleOpenPopup = contextType => {
    if (contextType === 'GENERIC') {
      setIsGenericPopupOpen(true)
    } else if (contextType === 'ACADEMIC') {
      setIsAcademicPopupOpen(true)
    }
  }

  const handleClosePopup = contextType => {
    if (contextType === 'GENERIC') {
      setIsGenericPopupOpen(false)
    } else if (contextType === 'ACADEMIC') {
      setIsAcademicPopupOpen(false)
    }
  }

  function onSetQuestions(questions) {
    console.log({ questions })
    setFormData(prev => ({ ...prev, questions }))
  }

  function onSetRecommendedSegments(segments) {
    console.log({ segments })
    setFormData(prev => ({ ...prev, recommendedSegments: segments }))
  }

  const renderErrorMessage = error => {
    if (error) {
      return (
        <Typography variant='body2' color='error' sx={{ mb: 1, textAlign: 'left', width: '100%' }}>
          {error}
        </Typography>
      )
    } else {
      return null
    }
  }

  return (
    <DialogContent className='overflow-visible pbs-0 pbe-6 pli-10 sm:pli-16'>
      <IconButtonTooltip title='Close' onClick={handleClose} className='absolute block-start-4 inline-end-4'>
        <i className='ri-close-line text-textSecondary' />
      </IconButtonTooltip>
      {/* Name */}
      <TextField
        label='Name'
        value={formData.name}
        onChange={e => handleSetFormValue('name', e.target.value)}
        fullWidth
        margin='dense'
      />
      {renderErrorMessage(errors?.name)}
      {/* URL */}
      <TextField
        label='Video URL'
        value={formData.url}
        onChange={e => handleSetFormValue('url', e.target.value)}
        fullWidth
        margin='dense'
      />
      {renderErrorMessage(errors?.url)}
      {/* {formData.url && (
        <MediaPreviewPopup
          width='100%'
          height='150px'
          url={formData.url}
          mediaType='video'
          row={false}
          controls={true}
        />
      )} */}
      {/* Description */}
      <TextField
        label='Description'
        value={formData.description}
        onChange={e => handleSetFormValue('description', e.target.value)}
        fullWidth
        margin='dense'
      />
      {renderErrorMessage(errors?.description)}
      {/* Generic Context IDs */}
      <TextField
        label='Generic Context IDs'
        value={formData.genericContextIds.join(', ')}
        onClick={() => handleOpenPopup('GENERIC')}
        fullWidth
        margin='dense'
        InputProps={{ readOnly: true }}
      />
      {renderErrorMessage(errors?.genericContextIds)}
      {/* Academic Context IDs */}
      {/* <TextField
        label='Academic Context IDs'
        value={formData.academicContextIds.join(', ')}
        onClick={() => handleOpenPopup('ACADEMIC')}
        fullWidth
        margin='dense'
        InputProps={{ readOnly: true }}
      /> */}

      {/* Questions */}
      {formData.url && (
        <div className='mt-3'>
          <VideoQuestions
            questions={formData.questions.sort((a, b) => a.invocationTime - b.invocationTime)}
            onSetQuestions={onSetQuestions}
            isEdit={true}
            videoUrl={formData.url}
            setIsQuestionFormOpen={setIsQuestionFormOpen}
            videoDuration={videoDuration}
            setVideoDuration={setVideoDuration}
          />
        </div>
      )}

      {/* Recommended Video Portions */}
      {formData.url && (
        <VideoPortions
          videoUrl={formData.url}
          videoDuration={videoDuration}
          recommendedSegments={formData.recommendedSegments}
          onSetRecommendedSegments={onSetRecommendedSegments}
        />
      )}

      {/* Created By */}
      {/* <TextField
        label='Created By'
        value={formData.createdBy}
        InputProps={{ readOnly: true }}
        fullWidth
        margin='dense'
      /> */}
      {/* Status */}
      <FormControl margin='dense'>
        <FormControlLabel
          control={
            <Switch
              checked={formData.isActive}
              onChange={e => handleSetFormValue('isActive', e.target.checked)}
              name='statusSwitch'
              color='primary'
            />
          }
          label={formData.isActive ? 'Active' : 'Inactive'}
        />
      </FormControl>
      {/* Actions */}
      <DialogActions className='gap-2 justify-center'>
        <Button onClick={handleClose} disabled={isQuestionFormOpen} variant='outlined' color='primary'>
          Cancel
        </Button>
        <Button
          onClick={handleUpdateRow}
          disabled={isQuestionFormOpen}
          component='label'
          variant='contained'
          style={{ color: 'white' }}
        >
          Update
        </Button>
      </DialogActions>

      {/* Generic Context Popup */}
      <Dialog fullWidth maxWidth='sm' open={isGenericPopupOpen} onClose={() => handleClosePopup('GENERIC')}>
        <IconButtonTooltip title='Close' onClick={() => handleClosePopup('GENERIC')} className='absolute block-start-4 inline-end-4'>
          <i className='ri-close-line text-textSecondary' />
        </IconButtonTooltip>
        <DialogContent>
          <ContextTreeSearch
            setTheFormValue={(field, value) => handleSetFormValue(field, value)}
            data={formData}
            contextType='GENERIC'
          />
        </DialogContent>
      </Dialog>

      {/* Academic Context Popup */}
      <Dialog fullWidth maxWidth='sm' open={isAcademicPopupOpen} onClose={() => handleClosePopup('ACADEMIC')}>
        <IconButtonTooltip title='Close' onClick={() => handleClosePopup('ACADEMIC')} className='absolute block-start-4 inline-end-4'>
          <i className='ri-close-line text-textSecondary' />
        </IconButtonTooltip>
        <DialogContent>
          <ContextTreeSearch
            setTheFormValue={(field, value) => handleSetFormValue(field, value)}
            data={formData}
            contextType='ACADEMIC'
          />
        </DialogContent>
      </Dialog>
    </DialogContent>
  )
}

// Main Video Dialog Component
const VideoDialog = ({ open, onClose, data, onSuccess }) => {
  const { data: session } = useSession()

  const handleCreateNewRow = async newRow => {
    try {
      const result = await addVideo({
        data: { ...newRow, createdBy: session?.user?.email }
      })

      if (result?.status === 'success') {
        console.log('Row created successfully:', result)
        await onSuccess() // Call the success handler
      } else {
        console.error('Error creating Row:', result?.message)
        // Optionally, show a user-friendly error message here
      }
    } catch (error) {
      console.error('An error occurred while creating the Row:', error)
      // Handle the error (e.g., show a notification)
    }
  }

  const handleUpdateRow = async updatingRow => {
    try {
      const result = await updateVideo({
        id: updatingRow._id,
        data: {
          ...updatingRow,
          updatedBy: session?.user?.email
        }
      })

      if (result?.status === 'success') {
        console.log('Row updated successfully:', result)
        await onSuccess() // Call the success handler
      } else {
        console.error('Error updating Row:', result?.message)
        // Optionally, show a user-friendly error message here
      }
    } catch (error) {
      // Handle the error (e.g., show a notification)
    }
  }

  return (
    <Dialog fullWidth maxWidth='lg' open={open} onClose={onClose}>
      <DialogTitle
        variant='h4'
        className='flex flex-col gap-2 text-center pbs-10 pbe-6 pli-10 sm:pbs-16 sm:pbe-6 sm:pli-16'
      >
        {data ? 'Edit Video' : 'Add New Video'}
        <Typography component='span' className='flex flex-col text-center'>
          {data
            ? 'Modify the video and update questions as needed.'
            : 'Enhance your video by adding questions for better engagement.'}
        </Typography>
      </DialogTitle>
      {data ? (
        <EditContent handleClose={onClose} data={data} onUpdate={handleUpdateRow} />
      ) : (
        <AddContent handleClose={onClose} onCreate={handleCreateNewRow} />
      )}
    </Dialog>
  )
}

export default VideoDialog
