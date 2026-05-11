// 'use client'
// MUI Imports
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  FormControl,
  FormControlLabel,
  Switch,
  Button,
  TextField,
  Typography,
  Box,
  Stack
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { addVideo, updateVideo } from '../../actions/videos'
import ContextTreeSearch from '../quizbuilder/01_QuizContext/ContextTreeSearch'
import VideoQuestions from './VideoQuestions'
import VideoPortions from './VideoPortions'
import IconButtonTooltip from '../IconButtonTooltip'

const gradientBackground = (theme, strength = 0.08) =>
  `linear-gradient(155deg, ${alpha(theme.palette.primary.light, strength)} 0%, ${alpha(
    theme.palette.secondary.light,
    strength - 0.02
  )} 100%)`

const VideoForm = ({
  mode,
  formData,
  errors,
  renderErrorMessage,
  handleSetFormValue,
  handleOpenPopup,
  handleClosePopup,
  onSetQuestions,
  onSetRecommendedSegments,
  videoDuration,
  setVideoDuration,
  isGenericPopupOpen,
  isAcademicPopupOpen,
  isQuestionFormOpen,
  setIsQuestionFormOpen,
  handleSubmit,
  handleClose,
  submitLabel
}) => {
  const theme = useTheme()
  const cardStyles = {
    borderRadius: 3,
    backgroundColor: theme.palette.background.paper,
    boxShadow:
      theme.palette.mode === 'dark'
        ? `0 14px 30px ${alpha(theme.palette.common.black, 0.3)}`
        : '0 14px 30px rgba(15,15,45,0.08)',
    border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
    p: { xs: 2.25, sm: 3 },
    width: '100%'
  }

  return (
    <>
      <DialogContent
        sx={{
          px: { xs: 3, sm: 4.5 },
          py: { xs: 3, sm: 4 },
          overflowY: 'auto',
          background: gradientBackground(theme)
        }}
      >
        <Stack spacing={3}>
          <Stack spacing={2.25} sx={cardStyles}>
            <Stack spacing={2}>
              <Stack spacing={0.75}>
                <TextField
                  label='Video Name'
                  value={formData.name}
                  onChange={e => handleSetFormValue('name', e.target.value)}
                  fullWidth
                />
                {renderErrorMessage(errors?.name)}
              </Stack>
              <Stack spacing={0.75}>
                <TextField
                  label='YouTube Video URL'
                  value={formData.url}
                  onChange={e => handleSetFormValue('url', e.target.value)}
                  fullWidth
                />
                <Typography variant='body2' color='text.secondary'>
                  Only YouTube links are supported for now.
                </Typography>
                {renderErrorMessage(errors?.url)}
              </Stack>
            </Stack>
            <Stack spacing={0.75}>
              <TextField
                label='Description'
                value={formData.description}
                onChange={e => handleSetFormValue('description', e.target.value)}
                fullWidth
                multiline
                minRows={3}
              />
              {renderErrorMessage(errors?.description)}
            </Stack>
            <Stack spacing={0.75}>
              <TextField
                label='Context IDs'
                value={formData.genericContextIds.join(', ')}
                onClick={() => handleOpenPopup('GENERIC')}
                fullWidth
                InputProps={{ readOnly: true }}
                helperText='Tap to choose the contexts for this video.'
              />
              {renderErrorMessage(errors?.genericContextIds)}
            </Stack>
          </Stack>

          {formData.url && (
            <Stack spacing={2} sx={{ width: '100%', mb: -1 }}>
              <Typography variant='subtitle1' sx={{ fontWeight: 700, px: { xs: 0.5, sm: 1 } }}>
                Engagement Enhancers
              </Typography>
              <Stack spacing={2}>
                <Stack spacing={1.5} sx={cardStyles}>
                  <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
                    Recommended Segments
                  </Typography>
                  <VideoPortions
                    videoUrl={formData.url}
                    videoDuration={videoDuration}
                    recommendedSegments={formData.recommendedSegments}
                    onSetRecommendedSegments={onSetRecommendedSegments}
                  />
                </Stack>
                <Stack spacing={1.5} sx={cardStyles}>
                  <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
                    Interactive Questions
                  </Typography>
                  <VideoQuestions
                    questions={formData.questions.sort((a, b) => a.invocationTime - b.invocationTime)}
                    onSetQuestions={onSetQuestions}
                    setIsQuestionFormOpen={setIsQuestionFormOpen}
                    isEdit={mode === 'edit'}
                    videoUrl={formData.url}
                    videoDuration={videoDuration}
                    setVideoDuration={setVideoDuration}
                  />
                </Stack>
              </Stack>
            </Stack>
          )}

          <Stack spacing={1.5} sx={cardStyles}>
            <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
              Availability
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Toggle whether this video is visible to learners.
            </Typography>
            <FormControl>
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
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: { xs: 'center', sm: 'flex-end' },
          alignItems: 'center',
          px: { xs: 3, sm: 4.5 },
          py: { xs: 2.5, sm: 3 },
          mt: { xs: 2, sm: 2 },
          gap: { xs: 1.5, sm: 2 },
          backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.12 : 0.06),
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
          '& > .MuiButton-root': {
            minWidth: 120,
            justifyContent: 'center'
          }
        }}
      >
        <Button
          onClick={handleClose}
          disabled={isQuestionFormOpen}
          variant='outlined'
          sx={{
            color: theme.palette.mode === 'dark' ? '#ffffff' : undefined,
            borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : undefined,
            '&:hover': {
              borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : undefined,
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : undefined
            }
          }}
        >
          Cancel
        </Button>
        <Button
          component='label'
          variant='contained'
          sx={{ color: 'white' }}
          onClick={handleSubmit}
          disabled={isQuestionFormOpen}
        >
          {submitLabel}
        </Button>
      </DialogActions>

      <Dialog fullWidth maxWidth='sm' open={isGenericPopupOpen} onClose={() => handleClosePopup('GENERIC')}>
        <IconButtonTooltip
          title='Close'
          onClick={() => handleClosePopup('GENERIC')}
          className='absolute block-start-4 inline-end-4'
        >
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

      <Dialog fullWidth maxWidth='sm' open={isAcademicPopupOpen} onClose={() => handleClosePopup('ACADEMIC')}>
        <IconButtonTooltip
          title='Close'
          onClick={() => handleClosePopup('ACADEMIC')}
          className='absolute block-start-4 inline-end-4'
        >
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
    </>
  )
}

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

  const isYouTubeUrl = url => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/
    return youtubeRegex.test(url)
  }

  const validateField = (field, value) => {
    let error = ''
    if (field === 'name' && value.trim() === '') error = 'Name is required.'
    if (field === 'url') {
      if (value.trim() === '') {
        error = 'Video URL is required.'
      } else if (!isYouTubeUrl(value)) {
        error = 'Above entered link is not supported please enter a valid YouTube video link.'
      }
    }
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
    <VideoForm
      mode='add'
      formData={formData}
      errors={errors}
      renderErrorMessage={renderErrorMessage}
      handleSetFormValue={handleSetFormValue}
      handleOpenPopup={handleOpenPopup}
      handleClosePopup={handleClosePopup}
      onSetQuestions={onSetQuestions}
      onSetRecommendedSegments={onSetRecommendedSegments}
      videoDuration={videoDuration}
      setVideoDuration={setVideoDuration}
      isGenericPopupOpen={isGenericPopupOpen}
      isAcademicPopupOpen={isAcademicPopupOpen}
      isQuestionFormOpen={isQuestionFormOpen}
      setIsQuestionFormOpen={setIsQuestionFormOpen}
      handleSubmit={handleAddRow}
      handleClose={handleClose}
      submitLabel='Submit'
    />
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

  const isYouTubeUrl = url => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/
    return youtubeRegex.test(url)
  }

  const validateField = (field, value) => {
    let error = ''
    if (field === 'name' && value.trim() === '') error = 'Name is required.'
    if (field === 'url') {
      if (value.trim() === '') {
        error = 'Video URL is required.'
      } else if (!isYouTubeUrl(value)) {
        error = 'Only YouTube URLs are supported. Please enter a valid YouTube video link.'
      }
    }
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
    <VideoForm
      mode='edit'
      formData={formData}
      errors={errors}
      renderErrorMessage={renderErrorMessage}
      handleSetFormValue={handleSetFormValue}
      handleOpenPopup={handleOpenPopup}
      handleClosePopup={handleClosePopup}
      onSetQuestions={onSetQuestions}
      onSetRecommendedSegments={onSetRecommendedSegments}
      videoDuration={videoDuration}
      setVideoDuration={setVideoDuration}
      isGenericPopupOpen={isGenericPopupOpen}
      isAcademicPopupOpen={isAcademicPopupOpen}
      isQuestionFormOpen={isQuestionFormOpen}
      setIsQuestionFormOpen={setIsQuestionFormOpen}
      handleSubmit={handleUpdateRow}
      handleClose={handleClose}
      submitLabel='Update'
    />
  )
}

// Main Video Dialog Component
const VideoDialog = ({ open, onClose, data, onSuccess }) => {
  const { data: session } = useSession()
  const theme = useTheme()

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
    <Dialog
      fullWidth
      maxWidth='lg'
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: { xs: 3, sm: 4 },
          mx: { xs: 2, sm: 0 },
          my: { xs: 3, sm: 5 },
          border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
          backgroundColor: theme.palette.background.paper,
          boxShadow:
            theme.palette.mode === 'dark'
              ? `0 22px 60px ${alpha(theme.palette.common.black, 0.5)}`
              : '0 22px 60px rgba(15,15,45,0.2)'
        }
      }}
    >
      <DialogTitle
        sx={{
          px: { xs: 3, sm: 4 },
          py: { xs: 2.5, sm: 3 },
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
          backgroundColor: theme.palette.background.paper
        }}
      >
        <Stack direction='row' alignItems='center' justifyContent='space-between' spacing={2}>
          <Stack direction='row' alignItems='center' spacing={2}>
            <Box>
              <Typography variant='h6' sx={{ fontWeight: 700 }}>
                {data ? 'Edit YouTube Video' : 'Add New YouTube Video'}
              </Typography>
            </Box>
          </Stack>
          <IconButtonTooltip
            title='Close'
            onClick={onClose}
            sx={{
              color: theme.palette.text.secondary,
              '&:hover i': { color: theme.palette.text.primary }
            }}
          >
            <i className='ri-close-line text-xl' />
          </IconButtonTooltip>
        </Stack>
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
