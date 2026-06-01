import React, { useState } from 'react'

import {
  FormControlLabel,
  Checkbox,
  Button,
  IconButton,
  Typography,
  TextField,
  Grid,
  Box,
  Card,
  CardContent,
  Switch,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  alpha,
  Divider,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import SaveIcon from '@mui/icons-material/Save'
import RemoveIcon from '@mui/icons-material/Remove'
import DeleteIcon from '@mui/icons-material/Delete'
import TextFieldsIcon from '@mui/icons-material/TextFields'
import ImageIcon from '@mui/icons-material/Image'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import TimerIcon from '@mui/icons-material/Timer'
import QuestionMarkIcon from '@mui/icons-material/QuestionMark'
import PlayCircleIcon from '@mui/icons-material/PlayCircle'
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary'

import DeleteConfirmationDialog from '@/components/dialogs/DeleteConfirmationDialog'
import IconButtonTooltip from '@/components/IconButtonTooltip'

import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

import VideoAd from '@views/apps/advertisements/VideoAd/VideoAd'
import ImagePopup from '@/components/ImagePopup'
import QuestionWeightageField from '@/components/quizbuilder/QuestionWeightageField'
import ReactPlayer from 'react-player'
import { filterInput, excludeQuesstionChars } from '@/utils/regexUtil'

const MultipleChoiceQuestionTemplate = ({
  id: questionUUID,
  data,
  mode = 'primary',
  primaryQuestion = null,
  saveQuestion,
  deleteQuestion,
  validationErrors = [],
  isAdmin = false
}) => {
  const innerData = data?.data
  console.log('inner data  ', innerData)
  const [id, setId] = useState(questionUUID)
  const [language, setLanguage] = useState(data?.language)
  const [question, setQuestion] = useState(
    innerData?.question || {
      text: data?.text || '',
      image: data?.image || '', // Base64 or URL of the image
      video: data?.video || '', // URL of the video
      mediaType: data?.mediaType || 'text' // 'text', 'image', 'text-image', 'video', 'text-video'
    }
  )
  const [addHint, setAddHint] = useState(innerData?.addHint || false)
  const [status, setStatus] = useState(innerData?.status || 'draft')
  const [hint, setHint] = useState(innerData?.hint || '')
  const [hintMarks, setHintMarks] = useState(-1 * innerData?.hintMarks || '')
  const [marks, setMarks] = useState(innerData?.marks || '')
  const [weightage, setWeightage] = useState(Number(innerData?.weightage) || 1)
  const [timerSeconds, setTimerSeconds] = useState(innerData?.timerSeconds || '')
  const [skippable, setSkippable] = useState(innerData?.skippable || false)
  const [options, setOptions] = useState(
    innerData?.options
      ? innerData.options
      : mode === 'primary'
        ? [
            { id: '1', text: '', correct: false, image: '', file: null, mediaType: 'text' },
            { id: '2', text: '', correct: false, image: '', file: null, mediaType: 'text' }
          ]
        : primaryQuestion?.data?.options || [
            { id: '1', text: '', correct: false, image: '', mediaType: 'text' },
            { id: '2', text: '', correct: false, image: '', mediaType: 'text' }
          ]
  )

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false)
  const [videoPreviewOpen, setVideoPreviewOpen] = useState(false)
  const [optionImagePreviewOpen, setOptionImagePreviewOpen] = useState({})
  const [optionsMediaType, setOptionsMediaType] = useState(
    options.length > 0 && options[0]?.mediaType ? options[0].mediaType : 'text'
  )
  const [loading, setLoading] = useState({ save: false, delete: false })

  const onDeleteQuestion = async () => {
    setLoading(prev => ({ ...prev, delete: true }))
    try {
      await deleteQuestion(data._id) // Assuming deleteQuestion is an async function
    } catch (error) {
      console.error('Error deleting question', error)
    } finally {
      setLoading(prev => ({ ...prev, delete: false }))
      setOpenDeleteDialog(false)
    }
  }

  const handleDeleteClick = () => {
    setOpenDeleteDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDeleteDialog(false)
  }

  const createPrimaryQuestionRequest = () => {
    const primaryQuestionData = {
      _id: data._id,
      id: id,
      templateId: data.templateId,
      data: {
        language: language,
        question: question,
        addHint: addHint,
        hint: hint,
        hintMarks: parseFloat(hintMarks),
        marks: +marks,
        weightage: Number(weightage) || 1,
        timerSeconds: +timerSeconds,
        skippable: skippable,
        language: language,
        status: status,
        options: options
      }
    }

    // const jsonData = JSON.stringify(primaryQuestionData, null, 2)
    console.log(primaryQuestionData)
    return primaryQuestionData
  }

  const createSecondaryQuestionRequest = () => {
    const secondaryQuestionData = {
      _id: data._id,
      id: id,
      data: {
        language: language,
        question: question,
        addHint: addHint,
        hint: hint,
        hintMarks: parseFloat(hintMarks) || +primaryQuestion?.data?.hintMarks,
        marks: +marks || +primaryQuestion?.data?.marks,
        weightage: Number(weightage) || Number(primaryQuestion?.data?.weightage) || 1,
        timerSeconds: +timerSeconds || +primaryQuestion?.data?.timerSeconds,
        skippable: skippable || primaryQuestion?.data?.skippable,
        language: language,
        status: status,
        options: options
      }
    }

    const jsonData = JSON.stringify(secondaryQuestionData, null, 2)
    console.log(jsonData)
    return jsonData
  }

  const addOption = () => {
    setOptions([
      ...options,
      {
        id: `option-${options.length + 1}`,
        text: `option-${options.length + 1}`,
        correct: false,
        image: '',
        mediaType: optionsMediaType
      }
    ])
  }

  const removeOption = index => {
    const updatedOptions = [...options]
    updatedOptions.splice(index, 1)
    setOptions(updatedOptions)
  }

  const handleOptionChange = (index, key, value) => {
    const updatedOptions = [...options]
    updatedOptions[index][key] = value
    setOptions(updatedOptions)
  }

  const handleQuestionChange = (key, value) => {
    let filterValue = value

    if (key === 'text') {
      filterValue = filterInput(value, excludeQuesstionChars) // Allow only alphanumeric characters and some punctuation
    }

    setQuestion(prev => ({ ...prev, [key]: filterValue }))
  }

  const handleQuestionMediaUpload = (file, key) => {
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setQuestion(prev => ({
          ...prev,
          [key]: reader.result // Base64 content or file URL
        }))
      }
      reader.readAsDataURL(file) // Read file for preview
    }
  }

  const toggleQuestionMediaType = newType => {
    if (newType === 'text') {
      setQuestion(prev => ({ ...prev, mediaType: newType, image: '', video: '' }))
    } else if (newType === 'image') {
      setQuestion(prev => ({ ...prev, mediaType: newType, text: '', video: '' }))
    } else if (newType === 'video') {
      setQuestion(prev => ({ ...prev, mediaType: newType, image: '', text: '' }))
    } else if (newType === 'text-image') {
      setQuestion(prev => ({ ...prev, mediaType: newType, video: '' }))
    } else if (newType === 'text-video') {
      setQuestion(prev => ({ ...prev, mediaType: newType, image: '' }))
    } else {
      setQuestion(prev => ({ ...prev, mediaType: newType }))
    }
  }

  const handleMarksChange = event => {
    setMarks(event.target.value)
  }

  const handleHintChange = event => {
    setHint(event.target.value)
  }

  const handleHintMarksChange = event => {
    setHintMarks(event.target.value)
  }

  const handleTimerChange = event => {
    setTimerSeconds(event.target.value)
  }

  const handleDragEnd = result => {
    if (!result.destination) return
    const items = Array.from(options)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)
    setOptions(items)
  }

  const onSaveQuestion = async () => {
    setLoading(prev => ({ ...prev, save: true }))

    const saveQuestionObj = mode === 'primary' ? createPrimaryQuestionRequest() : createSecondaryQuestionRequest()

    try {
      await saveQuestion(saveQuestionObj) // Assuming saveQuestion is an async function
    } catch (error) {
      console.error('Error saving question', error)
    } finally {
      setLoading(prev => ({ ...prev, save: false }))
    }
  }

  const handleOptionMediaUpload = (index, file, type) => {
    const updatedOptions = [...options]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        updatedOptions[index][type] = reader.result // Update image preview
        updatedOptions[index].file = file // Store the file object
        setOptions(updatedOptions)
      }
      reader.readAsDataURL(file)
    }
  }

  const toggleOptionMediaType = (index, newType) => {
    const updatedOptions = [...options]
    updatedOptions[index].mediaType = newType // Update media type dynamically
    setOptions(updatedOptions)
  }

  const toggleAllOptionsMediaType = newType => {
    setOptionsMediaType(newType)
    const updatedOptions = options.map(option => ({
      ...option,
      mediaType: newType,
      // Clear image if switching away from image types
      image: newType === 'text' ? '' : option.image
    }))
    setOptions(updatedOptions)
  }

  const getQuestionErrors = questionId => {
    return validationErrors.filter(error => error.questionId === questionId)
  }

  const questionValidationErrors = getQuestionErrors(data._id)
  const hasErrors = questionValidationErrors.length > 0

  const getErrorMessage = field => {
    const fieldErrorObj = questionValidationErrors?.find(each => each.field === field)
    if (fieldErrorObj) {
      return fieldErrorObj?.message || ''
    }
    return ''
  }

  const handleAddHintChange = e => {
    const isChecked = e.target.checked
    setAddHint(isChecked)
    if (!isChecked) {
      // When unchecking, reset to empty/zero
      setHint('')
      setHintMarks(0)
    }
  }

  const hasAtleastOneCorrectOption = options?.filter(op => op.correct).length >= 1 || false
  const theme = useTheme()

  // Helper function to extract video information from URL
  const getVideoInfo = url => {
    if (!url) return { isYouTube: false, videoId: null, videoName: null }
    
    try {
      // Check for YouTube URLs
      const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
      const match = url.match(youtubeRegex)
      
      if (match && match[1]) {
        return {
          isYouTube: true,
          videoId: match[1],
          videoName: `YouTube Video (${match[1]})`
        }
      }
      
      // For other video URLs, extract domain or use URL as name
      try {
        const urlObj = new URL(url)
        return {
          isYouTube: false,
          videoId: null,
          videoName: urlObj.hostname || 'Video'
        }
      } catch {
        return {
          isYouTube: false,
          videoId: null,
          videoName: 'Video'
        }
      }
    } catch {
      return {
        isYouTube: false,
        videoId: null,
        videoName: 'Video'
      }
    }
  }

  const videoInfo = getVideoInfo(question.video)

  return (
    <>
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 3,
          border: '1px solid',
          borderColor: hasErrors
            ? alpha(theme.palette.error.main, 0.3)
            : alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.12 : 0.08),
          boxShadow: hasErrors
            ? `0 0 0 3px ${alpha(theme.palette.error.main, 0.1)}`
            : theme.palette.mode === 'dark'
              ? '0 2px 8px rgba(0,0,0,0.3)'
              : '0 2px 8px rgba(0,0,0,0.05)',
          p: { xs: 2, md: 3 },
          transition: 'all 0.3s ease'
        }}
      >
        {/* Header Section */}
        <Stack
          direction='row'
          spacing={2}
          sx={{
            mb: 3,
            pb: 2,
            borderBottom: '1px solid',
            borderColor: alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.12 : 0.08)
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <QuestionMarkIcon sx={{ fontSize: 24, color: 'primary.main' }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant='h6' fontWeight={700} sx={{ color: theme.palette.text.primary }}>
              Multi Answer Question
            </Typography>
            <Typography variant='caption' sx={{ color: 'text.secondary' }}>
              Language: {language}
            </Typography>
          </Box>
          {hasErrors && <Chip label='Has Errors' color='error' size='small' sx={{ height: 28, fontWeight: 600 }} />}
        </Stack>

        <Grid container spacing={3}>
          {/* Question Section */}
          <Grid item xs={12}>
            <Box
              sx={{
                border: '2px solid',
                borderColor: alpha(theme.palette.primary.main, 0.2),
                borderRadius: 3,
                p: 2.5,
                bgcolor: alpha(theme.palette.primary.main, 0.02),
                '&:hover': {
                  borderColor: alpha(theme.palette.primary.main, 0.4),
                  boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.08)}`
                },
                transition: 'all 0.3s ease'
              }}
            >
              <Stack spacing={2.5}>
                {/* Media Type Toggle */}
                <FormControl fullWidth>
                  <InputLabel>Question Type</InputLabel>
                  <Select
                    label='Question Type'
                    value={question.mediaType}
                    onChange={e => toggleQuestionMediaType(e.target.value)}
                    sx={{
                      bgcolor: theme.palette.background.paper,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha(theme.palette.primary.main, 0.3)
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.main
                      }
                    }}
                  >
                    <MenuItem value='text'>📝 Text Only</MenuItem>
                    <MenuItem value='image'>🖼️ Image Only</MenuItem>
                    <MenuItem value='text-image'>📝🖼️ Text & Image</MenuItem>
                    <MenuItem value='video'>🎥 Video Only</MenuItem>
                    <MenuItem value='text-video'>📝🎥 Text & Video</MenuItem>
                  </Select>
                </FormControl>

                {/* Question Text Input */}
                {(question.mediaType === 'text' ||
                  question.mediaType === 'text-image' ||
                  question.mediaType === 'text-video') && (
                  <TextField
                    label='Question Text'
                    variant='outlined'
                    fullWidth
                    multiline
                    minRows={3}
                    value={question.text}
                    error={hasErrors && !question.text.trim() && getErrorMessage('question.text')}
                    helperText={!question.text.trim() && <span>{getErrorMessage('question.text')}</span>}
                    onChange={e => handleQuestionChange('text', e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: theme.palette.background.paper,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main
                        }
                      }
                    }}
                  />
                )}

                {/* Image Input and Preview */}
                {(question.mediaType === 'image' || question.mediaType === 'text-image') && (
                  <Stack spacing={2}>
                    {question.image && (
                      <>
                        <Box
                          sx={{
                            position: 'relative',
                            width: '100%',
                            height: 200,
                            borderRadius: 2,
                            overflow: 'hidden',
                            border: '2px solid',
                            borderColor: alpha(theme.palette.primary.main, 0.2),
                            bgcolor: theme.palette.background.paper,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              borderColor: theme.palette.primary.main,
                              boxShadow:
                                theme.palette.mode === 'dark'
                                  ? '0 8px 24px rgba(0,0,0,0.4)'
                                  : '0 8px 24px rgba(0,0,0,0.15)',
                              transform: 'translateY(-2px)',
                              '& .enlarge-overlay': {
                                opacity: 1
                              },
                              '& .clear-button': {
                                opacity: 1
                              }
                            }
                          }}
                        >
                          <Box
                            onClick={() => setImagePreviewOpen(true)}
                            sx={{
                              width: '100%',
                              height: '100%',
                              cursor: 'pointer',
                              position: 'relative'
                            }}
                          >
                            <Box
                              component='img'
                              src={question.image}
                              alt='Uploaded Preview'
                              sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                display: 'block'
                              }}
                            />
                            <Box
                              className='enlarge-overlay'
                              sx={{
                                position: 'absolute',
                                inset: 0,
                                bgcolor: alpha(theme.palette.common.black, 0.4),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: 0,
                                transition: 'opacity 0.3s ease',
                                backdropFilter: 'blur(2px)'
                              }}
                            >
                              <Typography
                                variant='body2'
                                sx={{
                                  color: theme.palette.common.white,
                                  fontWeight: 600,
                                  bgcolor: alpha(theme.palette.common.black, 0.6),
                                  px: 2,
                                  py: 1,
                                  borderRadius: 1
                                }}
                              >
                                Click to view full size
                              </Typography>
                            </Box>
                          </Box>
                          <IconButton
                            className='clear-button'
                            onClick={e => {
                              e.stopPropagation()
                              handleQuestionChange('image', '')
                            }}
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              bgcolor: 'white',
                              opacity: 0.9,
                              zIndex: 10,
                              transition: 'all 0.3s ease',
                              boxShadow: theme.palette.mode === 'dark' 
                                ? '0 2px 8px rgba(0,0,0,0.5)' 
                                : '0 2px 8px rgba(0,0,0,0.2)',
                              '&:hover': {
                                bgcolor: 'white !important',
                                opacity: 1,
                                transform: 'scale(1.1)'
                              }
                            }}
                            size='small'
                            title='Remove image'
                          >
                            <DeleteIcon fontSize='small' color='error' />
                          </IconButton>
                        </Box>
                        <Dialog
                          open={imagePreviewOpen}
                          onClose={() => setImagePreviewOpen(false)}
                          maxWidth='lg'
                          fullWidth
                        >
                          <DialogTitle>Image Preview</DialogTitle>
                          <DialogContent>
                            <Box
                              component='img'
                              src={question.image}
                              alt='Full Size Preview'
                              sx={{
                                width: '100%',
                                height: 'auto',
                                maxHeight: '70vh',
                                objectFit: 'contain',
                                display: 'block'
                              }}
                            />
                          </DialogContent>
                          <DialogActions>
                            <Button onClick={() => setImagePreviewOpen(false)}>Close</Button>
                          </DialogActions>
                        </Dialog>
                      </>
                    )}
                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                      <Button
                        variant='outlined'
                        component='label'
                        startIcon={<ImageIcon />}
                        disabled={loading.save || loading.delete}
                        sx={{
                          flexShrink: 0,
                          borderColor: hasErrors && !question.image ? theme.palette.error.main : undefined,
                          '&:hover': {
                            borderColor: hasErrors && !question.image ? theme.palette.error.main : theme.palette.primary.main
                          }
                        }}
                      >
                        {question.image ? 'Change Image' : 'Upload Image'}
                        <input
                          type='file'
                          hidden
                          accept='image/*'
                          onChange={e => handleQuestionMediaUpload(e.target.files[0], 'image')}
                        />
                      </Button>
                      {hasErrors && !question.image && (
                        <Typography variant='caption' color='error' sx={{ width: '100%', textAlign: 'center' }}>
                          {getErrorMessage('question.image')}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                )}

                {/* Video URL Input */}
                {(question.mediaType === 'video' || question.mediaType === 'text-video') && (
                  <>
                    <TextField
                      label='Video URL'
                      variant='outlined'
                      fullWidth
                      value={question.video}
                      onChange={e => handleQuestionChange('video', e.target.value)}
                      placeholder='Enter YouTube video URL'
                      error={hasErrors && !question.video && getErrorMessage('question.video')}
                      helperText={!question.video && getErrorMessage('question.video')}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: 'white',
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.primary.main
                          }
                        }
                      }}
                    />
                    {question.video && (
                      <>
                        <Box
                          sx={{
                            mt: 2,
                            position: 'relative',
                            p: 2.5,
                            bgcolor: theme.palette.background.paper,
                            borderRadius: 2,
                            border: '2px solid',
                            borderColor: alpha(theme.palette.primary.main, 0.2),
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            '&:hover': {
                              borderColor: theme.palette.primary.main,
                              boxShadow:
                                theme.palette.mode === 'dark'
                                  ? '0 8px 24px rgba(0,0,0,0.4)'
                                  : '0 8px 24px rgba(0,0,0,0.15)',
                              transform: 'translateY(-2px)',
                              bgcolor: alpha(theme.palette.primary.main, 0.02),
                              '& .clear-video-button': {
                                opacity: 1
                              }
                            }
                          }}
                        >
                          <Box
                            onClick={() => setVideoPreviewOpen(true)}
                            sx={{
                              flex: 1,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                              minWidth: 0
                            }}
                          >
                            <Box
                              sx={{
                                width: 56,
                                height: 56,
                                borderRadius: 2,
                                bgcolor: alpha(theme.palette.error.main, 0.1),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}
                            >
                              {videoInfo.isYouTube ? (
                                <PlayCircleIcon sx={{ fontSize: 32, color: 'error.main' }} />
                              ) : (
                                <VideoLibraryIcon sx={{ fontSize: 32, color: 'error.main' }} />
                              )}
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography
                                variant='subtitle1'
                                fontWeight={600}
                                sx={{
                                  color: theme.palette.text.primary,
                                  mb: 0.5,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {videoInfo.videoName}
                              </Typography>
                              <Typography
                                variant='caption'
                                sx={{
                                  color: theme.palette.text.secondary,
                                  display: 'block',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {videoInfo.isYouTube ? 'YouTube Video' : 'Video URL'}
                              </Typography>
                              <Typography
                                variant='caption'
                                sx={{
                                  color: theme.palette.primary.main,
                                  fontWeight: 500,
                                  mt: 0.5,
                                  display: 'block'
                                }}
                              >
                                Click to preview
                              </Typography>
                            </Box>
                          </Box>
                          <IconButton
                            className='clear-video-button'
                            onClick={e => {
                              e.stopPropagation()
                              handleQuestionChange('video', '')
                            }}
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              bgcolor: 'white',
                              opacity: 0.9,
                              zIndex: 10,
                              transition: 'all 0.3s ease',
                              boxShadow: theme.palette.mode === 'dark' 
                                ? '0 2px 8px rgba(0,0,0,0.5)' 
                                : '0 2px 8px rgba(0,0,0,0.2)',
                              '&:hover': {
                                bgcolor: 'white !important',
                                opacity: 1,
                                transform: 'scale(1.1)'
                              }
                            }}
                            size='small'
                            title='Remove video'
                          >
                            <DeleteIcon fontSize='small' color='error' />
                          </IconButton>
                        </Box>
                        <Dialog
                          open={videoPreviewOpen}
                          onClose={() => setVideoPreviewOpen(false)}
                          maxWidth='lg'
                          fullWidth
                          PaperProps={{
                            sx: {
                              borderRadius: 3,
                              bgcolor: theme.palette.background.paper
                            }
                          }}
                        >
                          <DialogTitle sx={{ pb: 1 }}>
                            <Stack direction='row' alignItems='center' spacing={1.5}>
                              {videoInfo.isYouTube ? (
                                <PlayCircleIcon sx={{ fontSize: 24, color: 'error.main' }} />
                              ) : (
                                <VideoLibraryIcon sx={{ fontSize: 24, color: 'error.main' }} />
                              )}
                              <Typography variant='h6' fontWeight={600}>
                                {videoInfo.videoName}
                              </Typography>
                            </Stack>
                          </DialogTitle>
                          <DialogContent sx={{ p: 0, position: 'relative' }}>
                            <Box
                              sx={{
                                width: '100%',
                                position: 'relative',
                                bgcolor: theme.palette.mode === 'dark' ? '#000' : '#000',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minHeight: { xs: 300, sm: 400, md: 500 },
                                '& .react-player': {
                                  borderRadius: 0
                                }
                              }}
                            >
                              <ReactPlayer
                                url={question.video || ''}
                                playing={true}
                                controls={true}
                                width='100%'
                                height='100%'
                                style={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0
                                }}
                                config={{
                                  youtube: {
                                    playerVars: {
                                      autoplay: 1,
                                      modestbranding: 1,
                                      rel: 0
                                    }
                                  }
                                }}
                                onError={e => {
                                  console.error('Video error occurred:', e)
                                }}
                              />
                            </Box>
                          </DialogContent>
                          <DialogActions>
                            <Button onClick={() => setVideoPreviewOpen(false)}>Close</Button>
                          </DialogActions>
                        </Dialog>
                      </>
                    )}
                  </>
                )}
              </Stack>
            </Box>
          </Grid>

          {/* Options Section */}
          <Grid item xs={12}>
            <Box
              sx={{
                border: '2px solid',
                borderColor: alpha(theme.palette.secondary.main, 0.2),
                borderRadius: 3,
                p: 2.5,
                bgcolor: alpha(theme.palette.secondary.main, 0.02)
              }}
            >
              <Stack spacing={2} sx={{ mb: 2.5 }}>
                <Stack direction='row' alignItems='center' spacing={1.5}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.secondary.main, 0.15),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <TextFieldsIcon sx={{ fontSize: 20, color: 'secondary.main' }} />
                  </Box>
                  <Typography variant='subtitle1' fontWeight={700} sx={{ color: theme.palette.text.primary }}>
                    Answer Options
                  </Typography>
                  <Chip
                    label={`${options.length} options`}
                    size='small'
                    sx={{
                      bgcolor: alpha(theme.palette.secondary.main, 0.1),
                      color: 'secondary.main',
                      fontWeight: 600
                    }}
                  />
                </Stack>
                {mode === 'primary' && (
                  <FormControl fullWidth size='small'>
                    <InputLabel>Options Type</InputLabel>
                    <Select
                      label='Options Type'
                      value={optionsMediaType}
                      onChange={e => toggleAllOptionsMediaType(e.target.value)}
                      sx={{
                        bgcolor: theme.palette.background.paper,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: alpha(theme.palette.secondary.main, 0.3)
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.secondary.main
                        }
                      }}
                    >
                      <MenuItem value='text'>📝 Text Only</MenuItem>
                      <MenuItem value='image'>🖼️ Image Only</MenuItem>
                      <MenuItem value='text-image'>📝🖼️ Text & Image</MenuItem>
                    </Select>
                  </FormControl>
                )}
              </Stack>

              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId='options'>
                  {provided => (
                    <Stack spacing={2} {...provided.droppableProps} ref={provided.innerRef}>
                      {options.map((option, index) => (
                        <Draggable key={option.id} draggableId={option.id} index={index}>
                          {(provided, snapshot) =>
                            mode === 'primary' ? (
                              <Box
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                sx={{
                                  p: 2,
                                  borderRadius: 2,
                                  bgcolor: theme.palette.background.paper,
                                  border: '2px solid',
                                  borderColor: option.correct
                                    ? alpha(theme.palette.success.main, 0.3)
                                    : alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.12 : 0.08),
                                  boxShadow: snapshot.isDragging
                                    ? theme.palette.mode === 'dark'
                                      ? '0 8px 24px rgba(0,0,0,0.5)'
                                      : '0 8px 24px rgba(0,0,0,0.15)'
                                    : theme.palette.mode === 'dark'
                                      ? '0 2px 8px rgba(0,0,0,0.3)'
                                      : '0 2px 8px rgba(0,0,0,0.05)',
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    boxShadow:
                                      theme.palette.mode === 'dark'
                                        ? '0 4px 12px rgba(0,0,0,0.4)'
                                        : '0 4px 12px rgba(0,0,0,0.1)',
                                    borderColor: option.correct
                                      ? theme.palette.success.main
                                      : theme.palette.primary.main
                                  }
                                }}
                              >
                                <Stack direction='row' alignItems='center' spacing={1.5}>
                                  <Box
                                    {...provided.dragHandleProps}
                                    sx={{
                                      cursor: 'grab',
                                      color: 'text.secondary',
                                      '&:active': { cursor: 'grabbing' }
                                    }}
                                  >
                                    <DragIndicatorIcon />
                                  </Box>
                                  <Chip
                                    label={index + 1}
                                    size='small'
                                    sx={{
                                      minWidth: 32,
                                      height: 24,
                                      fontWeight: 700,
                                      bgcolor: option.correct
                                        ? alpha(theme.palette.success.main, 0.15)
                                        : alpha(theme.palette.grey[500], 0.1),
                                      color: option.correct ? 'success.main' : 'text.secondary'
                                    }}
                                  />
                                  <Box sx={{ flex: 1 }}>
                                    <Stack spacing={1.5}>
                                      {/* Option Text Input */}
                                      {(optionsMediaType === 'text' || optionsMediaType === 'text-image') && (
                                        <TextField
                                          fullWidth
                                          size='small'
                                          label={`Option ${index + 1} text`}
                                          disabled={loading.save || loading.delete}
                                          value={option.text}
                                          onChange={e => handleOptionChange(index, 'text', e.target.value)}
                                          onBlur={e => handleOptionChange(index, 'text', e.target.value)}
                                          error={
                                            hasErrors &&
                                            !option.text.trim() &&
                                            (getErrorMessage(`options.${option.id}.text`) ||
                                              getErrorMessage(`options.${option.id}`))
                                          }
                                          helperText={
                                            !option.text.trim() &&
                                            (getErrorMessage(`options.${option.id}.text`) ||
                                              getErrorMessage(`options.${option.id}`))
                                          }
                                          sx={{
                                            '& .MuiOutlinedInput-root': {
                                              bgcolor: alpha(theme.palette.background.paper, 0.5),
                                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: theme.palette.primary.main
                                              }
                                            }
                                          }}
                                        />
                                      )}

                                      {/* Option Image Upload and Preview */}
                                      {(optionsMediaType === 'image' || optionsMediaType === 'text-image') && (
                                        <Stack spacing={1}>
                                          {option.image && (
                                            <>
                                              <Box
                                                sx={{
                                                  position: 'relative',
                                                  width: '100%',
                                                  height: 120,
                                                  borderRadius: 2,
                                                  overflow: 'hidden',
                                                  border: '2px solid',
                                                  borderColor: alpha(theme.palette.primary.main, 0.2),
                                                  bgcolor: theme.palette.background.paper,
                                                  transition: 'all 0.3s ease',
                                                  '&:hover': {
                                                    borderColor: theme.palette.primary.main,
                                                    boxShadow:
                                                      theme.palette.mode === 'dark'
                                                        ? '0 6px 20px rgba(0,0,0,0.4)'
                                                        : '0 6px 20px rgba(0,0,0,0.12)',
                                                    transform: 'translateY(-2px)',
                                                    '& .enlarge-overlay': {
                                                      opacity: 1
                                                    },
                                                    '& .clear-button': {
                                                      opacity: 1
                                                    }
                                                  }
                                                }}
                                              >
                                                <Box
                                                  onClick={() => setOptionImagePreviewOpen({ ...optionImagePreviewOpen, [index]: true })}
                                                  sx={{
                                                    width: '100%',
                                                    height: '100%',
                                                    cursor: 'pointer',
                                                    position: 'relative'
                                                  }}
                                                >
                                                  <Box
                                                    component='img'
                                                    src={option.image}
                                                    alt={`Option ${index + 1}`}
                                                    sx={{
                                                      width: '100%',
                                                      height: '100%',
                                                      objectFit: 'contain',
                                                      display: 'block'
                                                    }}
                                                  />
                                                  <Box
                                                    className='enlarge-overlay'
                                                    sx={{
                                                      position: 'absolute',
                                                      inset: 0,
                                                      bgcolor: alpha(theme.palette.common.black, 0.4),
                                                      display: 'flex',
                                                      alignItems: 'center',
                                                      justifyContent: 'center',
                                                      opacity: 0,
                                                      transition: 'opacity 0.3s ease',
                                                      backdropFilter: 'blur(2px)'
                                                    }}
                                                  >
                                                    <Typography
                                                      variant='caption'
                                                      sx={{
                                                        color: theme.palette.common.white,
                                                        fontWeight: 600,
                                                        bgcolor: alpha(theme.palette.common.black, 0.6),
                                                        px: 1.5,
                                                        py: 0.5,
                                                        borderRadius: 1
                                                      }}
                                                    >
                                                      Click to view full size
                                                    </Typography>
                                                  </Box>
                                                </Box>
                                                <IconButton
                                                  className='clear-button'
                                                  onClick={e => {
                                                    e.stopPropagation()
                                                    handleOptionChange(index, 'image', '')
                                                  }}
                                                  sx={{
                                                    position: 'absolute',
                                                    top: 4,
                                                    right: 4,
                                                    bgcolor: 'white',
                                                    opacity: 0.9,
                                                    zIndex: 10,
                                                    transition: 'all 0.3s ease',
                                                    boxShadow: theme.palette.mode === 'dark' 
                                                      ? '0 2px 6px rgba(0,0,0,0.5)' 
                                                      : '0 2px 6px rgba(0,0,0,0.2)',
                                                    '&:hover': {
                                                      bgcolor: 'white !important',
                                                      opacity: 1,
                                                      transform: 'scale(1.1)'
                                                    }
                                                  }}
                                                  size='small'
                                                  title='Remove image'
                                                >
                                                  <DeleteIcon fontSize='small' color='error' />
                                                </IconButton>
                                              </Box>
                                              <Dialog
                                                open={optionImagePreviewOpen[index] || false}
                                                onClose={() => setOptionImagePreviewOpen({ ...optionImagePreviewOpen, [index]: false })}
                                                maxWidth='md'
                                                fullWidth
                                              >
                                                <DialogTitle>Option {index + 1} Image Preview</DialogTitle>
                                                <DialogContent>
                                                  <Box
                                                    component='img'
                                                    src={option.image}
                                                    alt={`Option ${index + 1} Full Size`}
                                                    sx={{
                                                      width: '100%',
                                                      height: 'auto',
                                                      maxHeight: '70vh',
                                                      objectFit: 'contain',
                                                      display: 'block'
                                                    }}
                                                  />
                                                </DialogContent>
                                                <DialogActions>
                                                  <Button onClick={() => setOptionImagePreviewOpen({ ...optionImagePreviewOpen, [index]: false })}>Close</Button>
                                                </DialogActions>
                                              </Dialog>
                                            </>
                                          )}
                                          <Button
                                            variant='outlined'
                                            component='label'
                                            startIcon={<ImageIcon />}
                                            disabled={loading.save || loading.delete}
                                            size='small'
                                            sx={{
                                              borderColor: hasErrors && !option.image && (optionsMediaType === 'image' || optionsMediaType === 'text-image') 
                                                ? theme.palette.error.main 
                                                : undefined,
                                              '&:hover': {
                                                borderColor: hasErrors && !option.image && (optionsMediaType === 'image' || optionsMediaType === 'text-image')
                                                  ? theme.palette.error.main
                                                  : theme.palette.primary.main
                                              }
                                            }}
                                          >
                                            {option.image ? 'Change Image' : 'Upload Image'}
                                            <input
                                              type='file'
                                              hidden
                                              accept='image/*'
                                              onChange={e => handleOptionMediaUpload(index, e.target.files[0], 'image')}
                                            />
                                          </Button>
                                          {hasErrors && !option.image && (optionsMediaType === 'image' || optionsMediaType === 'text-image') && (
                                            <Typography variant='caption' color='error' sx={{ fontSize: '0.7rem' }}>
                                              {getErrorMessage(`options.${option.id}.image`) || getErrorMessage(`options.${option.id}`)}
                                            </Typography>
                                          )}
                                        </Stack>
                                      )}
                                    </Stack>
                                  </Box>
                                  <Stack direction='row' alignItems='center' spacing={1}>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          disabled={loading.save || loading.delete}
                                          checked={option.correct}
                                          onChange={e => handleOptionChange(index, 'correct', e.target.checked)}
                                          sx={{
                                            color: alpha(theme.palette.success.main, 0.5),
                                            '&.Mui-checked': { color: 'success.main' }
                                          }}
                                        />
                                      }
                                      label={
                                        <Typography
                                          variant='body2'
                                          fontWeight={600}
                                          sx={{ color: option.correct ? 'success.main' : 'text.secondary' }}
                                        >
                                          Correct
                                        </Typography>
                                      }
                                    />
                                    {index > 1 && (
                                      <IconButton
                                        size='small'
                                        disabled={loading.save || loading.delete}
                                        onClick={() => removeOption(index)}
                                        sx={{
                                          color: 'error.main',
                                          '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) }
                                        }}
                                      >
                                        <RemoveIcon fontSize='small' />
                                      </IconButton>
                                    )}
                                  </Stack>
                                </Stack>
                              </Box>
                            ) : (
                              <Box
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                sx={{
                                  p: 2,
                                  borderRadius: 2,
                                  bgcolor: theme.palette.background.paper,
                                  border: '2px solid',
                                  borderColor: option.correct
                                    ? alpha(theme.palette.success.main, 0.3)
                                    : alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.12 : 0.08),
                                  boxShadow:
                                    theme.palette.mode === 'dark'
                                      ? '0 2px 8px rgba(0,0,0,0.3)'
                                      : '0 2px 8px rgba(0,0,0,0.05)',
                                  '&:hover': {
                                    boxShadow:
                                      theme.palette.mode === 'dark'
                                        ? '0 4px 12px rgba(0,0,0,0.4)'
                                        : '0 4px 12px rgba(0,0,0,0.1)'
                                  }
                                }}
                              >
                                <Stack direction='row' alignItems='center' spacing={1.5}>
                                  <Chip
                                    label={index + 1}
                                    size='small'
                                    sx={{
                                      minWidth: 32,
                                      height: 24,
                                      fontWeight: 700,
                                      bgcolor: option.correct
                                        ? alpha(theme.palette.success.main, 0.15)
                                        : alpha(theme.palette.grey[500], 0.1),
                                      color: option.correct ? 'success.main' : 'text.secondary'
                                    }}
                                  />
                                  <Box sx={{ flex: 1 }}>
                                    <Stack spacing={1.5}>
                                      {/* Option Text Input */}
                                      {(optionsMediaType === 'text' || optionsMediaType === 'text-image') && (
                                        <TextField
                                          fullWidth
                                          size='small'
                                          label={`Option ${index + 1} text`}
                                          value={option.text}
                                          disabled={loading.save || loading.delete}
                                          onChange={e => handleOptionChange(index, 'text', e.target.value)}
                                          onBlur={e => handleOptionChange(index, 'text', e.target.value)}
                                          error={
                                            hasErrors &&
                                            !option.text.trim() &&
                                            (getErrorMessage(`options.${option.id}.text`) ||
                                              getErrorMessage(`options.${option.id}`))
                                          }
                                          helperText={
                                            !option.text.trim() &&
                                            (getErrorMessage(`options.${option.id}.text`) ||
                                              getErrorMessage(`options.${option.id}`))
                                          }
                                          sx={{
                                            '& .MuiOutlinedInput-root': {
                                              bgcolor: alpha(theme.palette.background.paper, 0.5)
                                            }
                                          }}
                                        />
                                      )}

                                      {/* Option Image Upload and Preview */}
                                      {(optionsMediaType === 'image' || optionsMediaType === 'text-image') && (
                                        <Stack spacing={1}>
                                          {option.image && (
                                            <>
                                              <Box
                                                sx={{
                                                  position: 'relative',
                                                  width: '100%',
                                                  height: 120,
                                                  borderRadius: 2,
                                                  overflow: 'hidden',
                                                  border: '2px solid',
                                                  borderColor: alpha(theme.palette.primary.main, 0.2),
                                                  bgcolor: theme.palette.background.paper,
                                                  transition: 'all 0.3s ease',
                                                  '&:hover': {
                                                    borderColor: theme.palette.primary.main,
                                                    boxShadow:
                                                      theme.palette.mode === 'dark'
                                                        ? '0 6px 20px rgba(0,0,0,0.4)'
                                                        : '0 6px 20px rgba(0,0,0,0.12)',
                                                    transform: 'translateY(-2px)',
                                                    '& .enlarge-overlay': {
                                                      opacity: 1
                                                    },
                                                    '& .clear-button': {
                                                      opacity: 1
                                                    }
                                                  }
                                                }}
                                              >
                                                <Box
                                                  onClick={() => setOptionImagePreviewOpen({ ...optionImagePreviewOpen, [index]: true })}
                                                  sx={{
                                                    width: '100%',
                                                    height: '100%',
                                                    cursor: 'pointer',
                                                    position: 'relative'
                                                  }}
                                                >
                                                  <Box
                                                    component='img'
                                                    src={option.image}
                                                    alt={`Option ${index + 1}`}
                                                    sx={{
                                                      width: '100%',
                                                      height: '100%',
                                                      objectFit: 'contain',
                                                      display: 'block'
                                                    }}
                                                  />
                                                  <Box
                                                    className='enlarge-overlay'
                                                    sx={{
                                                      position: 'absolute',
                                                      inset: 0,
                                                      bgcolor: alpha(theme.palette.common.black, 0.4),
                                                      display: 'flex',
                                                      alignItems: 'center',
                                                      justifyContent: 'center',
                                                      opacity: 0,
                                                      transition: 'opacity 0.3s ease',
                                                      backdropFilter: 'blur(2px)'
                                                    }}
                                                  >
                                                    <Typography
                                                      variant='caption'
                                                      sx={{
                                                        color: theme.palette.common.white,
                                                        fontWeight: 600,
                                                        bgcolor: alpha(theme.palette.common.black, 0.6),
                                                        px: 1.5,
                                                        py: 0.5,
                                                        borderRadius: 1
                                                      }}
                                                    >
                                                      Click to view full size
                                                    </Typography>
                                                  </Box>
                                                </Box>
                                                <IconButton
                                                  className='clear-button'
                                                  onClick={e => {
                                                    e.stopPropagation()
                                                    handleOptionChange(index, 'image', '')
                                                  }}
                                                  sx={{
                                                    position: 'absolute',
                                                    top: 4,
                                                    right: 4,
                                                    bgcolor: 'white',
                                                    opacity: 0.9,
                                                    zIndex: 10,
                                                    transition: 'all 0.3s ease',
                                                    boxShadow: theme.palette.mode === 'dark' 
                                                      ? '0 2px 6px rgba(0,0,0,0.5)' 
                                                      : '0 2px 6px rgba(0,0,0,0.2)',
                                                    '&:hover': {
                                                      bgcolor: 'white !important',
                                                      opacity: 1,
                                                      transform: 'scale(1.1)'
                                                    }
                                                  }}
                                                  size='small'
                                                  title='Remove image'
                                                >
                                                  <DeleteIcon fontSize='small' color='error' />
                                                </IconButton>
                                              </Box>
                                              <Dialog
                                                open={optionImagePreviewOpen[index] || false}
                                                onClose={() => setOptionImagePreviewOpen({ ...optionImagePreviewOpen, [index]: false })}
                                                maxWidth='md'
                                                fullWidth
                                              >
                                                <DialogTitle>Option {index + 1} Image Preview</DialogTitle>
                                                <DialogContent>
                                                  <Box
                                                    component='img'
                                                    src={option.image}
                                                    alt={`Option ${index + 1} Full Size`}
                                                    sx={{
                                                      width: '100%',
                                                      height: 'auto',
                                                      maxHeight: '70vh',
                                                      objectFit: 'contain',
                                                      display: 'block'
                                                    }}
                                                  />
                                                </DialogContent>
                                                <DialogActions>
                                                  <Button onClick={() => setOptionImagePreviewOpen({ ...optionImagePreviewOpen, [index]: false })}>Close</Button>
                                                </DialogActions>
                                              </Dialog>
                                            </>
                                          )}
                                          <Button
                                            variant='outlined'
                                            component='label'
                                            startIcon={<ImageIcon />}
                                            disabled={loading.save || loading.delete}
                                            size='small'
                                            sx={{
                                              borderColor: hasErrors && !option.image && (optionsMediaType === 'image' || optionsMediaType === 'text-image') 
                                                ? theme.palette.error.main 
                                                : undefined,
                                              '&:hover': {
                                                borderColor: hasErrors && !option.image && (optionsMediaType === 'image' || optionsMediaType === 'text-image')
                                                  ? theme.palette.error.main
                                                  : theme.palette.primary.main
                                              }
                                            }}
                                          >
                                            {option.image ? 'Change Image' : 'Upload Image'}
                                            <input
                                              type='file'
                                              hidden
                                              accept='image/*'
                                              onChange={e => handleOptionMediaUpload(index, e.target.files[0], 'image')}
                                            />
                                          </Button>
                                          {hasErrors && !option.image && (optionsMediaType === 'image' || optionsMediaType === 'text-image') && (
                                            <Typography variant='caption' color='error' sx={{ fontSize: '0.7rem' }}>
                                              {getErrorMessage(`options.${option.id}.image`) || getErrorMessage(`options.${option.id}`)}
                                            </Typography>
                                          )}
                                        </Stack>
                                      )}
                                    </Stack>
                                  </Box>
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        disabled
                                        checked={option.correct}
                                        sx={{
                                          color: alpha(theme.palette.success.main, 0.5),
                                          '&.Mui-checked': { color: 'success.main' }
                                        }}
                                      />
                                    }
                                    label={
                                      <Typography
                                        variant='body2'
                                        fontWeight={600}
                                        sx={{ color: option.correct ? 'success.main' : 'text.secondary' }}
                                      >
                                        Correct
                                      </Typography>
                                    }
                                  />
                                </Stack>
                              </Box>
                            )
                          }
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </Stack>
                  )}
                </Droppable>
              </DragDropContext>

              {hasErrors && !hasAtleastOneCorrectOption && getErrorMessage('options') && (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.error.main, 0.1),
                    border: '1px solid',
                    borderColor: alpha(theme.palette.error.main, 0.3)
                  }}
                >
                  <Typography variant='body2' color='error' fontWeight={600} sx={{ textAlign: 'center' }}>
                    {getErrorMessage('options')}
                  </Typography>
                </Box>
              )}

              {mode === 'primary' && (
                <Button
                  fullWidth
                  disabled={loading.save || loading.delete}
                  variant='outlined'
                  color='secondary'
                  startIcon={<AddIcon />}
                  onClick={addOption}
                  sx={{
                    mt: 2,
                    py: 1.5,
                    borderRadius: 2,
                    borderStyle: 'dashed',
                    borderWidth: 2,
                    fontWeight: 600,
                    '&:hover': {
                      borderStyle: 'solid',
                      bgcolor: alpha(theme.palette.secondary.main, 0.05)
                    }
                  }}
                >
                  Add Another Option
                </Button>
              )}
            </Box>
          </Grid>

          {/* Configuration Section */}
          <Grid item xs={12}>
            <Box
              sx={{
                border: '2px solid',
                borderColor: alpha(theme.palette.info.main, 0.2),
                borderRadius: 3,
                p: 2.5,
                bgcolor: alpha(theme.palette.info.main, 0.02)
              }}
            >
              <Stack spacing={2.5}>
                {/* Hint Toggle */}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={addHint}
                      onChange={handleAddHintChange}
                      sx={{
                        '&.Mui-checked': { color: 'info.main' }
                      }}
                    />
                  }
                  label={
                    <Stack direction='row' alignItems='center' spacing={1}>
                      <HelpOutlineIcon sx={{ fontSize: 20, color: 'info.main' }} />
                      <Typography variant='body2' fontWeight={600}>
                        Add Hint for this question
                      </Typography>
                    </Stack>
                  }
                />

                {/* Hint Input */}
                {addHint && (
                  <TextField
                    disabled={loading.save || loading.delete}
                    label='Hint Text'
                    variant='outlined'
                    fullWidth
                    multiline
                    rows={2}
                    value={hint}
                    onChange={handleHintChange}
                    error={addHint && hasErrors && !hint.trim() && getErrorMessage('hint')}
                    helperText={addHint && !hint.trim() && getErrorMessage('hint')}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: theme.palette.background.paper,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.info.main
                        }
                      }
                    }}
                  />
                )}

                {mode === 'primary' && (
                  <>
                    <Divider sx={{ my: 1 }} />

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={addHint ? 3 : 4}>
                        <TextField
                          disabled={loading.save || loading.delete}
                          label='Marks'
                          type='number'
                          InputProps={{
                            inputProps: { min: 0.25, step: 0.25 },
                            startAdornment: (
                              <InputAdornment position='start'>
                                <EmojiEventsIcon sx={{ fontSize: 20, color: 'success.main' }} />
                              </InputAdornment>
                            )
                          }}
                          fullWidth
                          value={marks}
                          onChange={handleMarksChange}
                          error={hasErrors && !marks && getErrorMessage('marks')}
                          helperText={!marks && getErrorMessage('marks')}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              bgcolor: theme.palette.background.paper,
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: theme.palette.success.main
                              }
                            }
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={addHint ? 3 : 4}>
                        <QuestionWeightageField
                          disabled={loading.save || loading.delete}
                          value={weightage}
                          onChange={setWeightage}
                          error={hasErrors && !!getErrorMessage('weightage')}
                          helperText={getErrorMessage('weightage') || 'Sum of this value across all questions = quiz points'}
                        />
                      </Grid>

                      {addHint && (
                        <Grid item xs={12} sm={3}>
                          <TextField
                            disabled={loading.save || loading.delete}
                            label='Hint Deduction'
                            type='number'
                            InputProps={{
                              inputProps: {
                                max: marks || 0,
                                min: 0,
                                step: 0.25
                              }
                            }}
                            fullWidth
                            value={hintMarks}
                            onChange={handleHintMarksChange}
                            error={
                              (addHint && hasErrors && !hintMarks && marks && getErrorMessage('hintMarks')) ||
                              (addHint && marks && hintMarks >= marks)
                            }
                            helperText={
                              (addHint && !hintMarks && marks && getErrorMessage('hintMarks')) ||
                              (addHint && marks && hintMarks >= marks && 'Cannot exceed question marks')
                            }
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                bgcolor: theme.palette.background.paper,
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: theme.palette.warning.main
                                }
                              }
                            }}
                          />
                        </Grid>
                      )}

                      <Grid item xs={12} sm={addHint ? 3 : 4}>
                        <TextField
                          disabled={loading.save || loading.delete}
                          label='Time Limit (seconds)'
                          type='number'
                          InputProps={{
                            inputProps: { min: 10 },
                            startAdornment: (
                              <InputAdornment position='start'>
                                <TimerIcon sx={{ fontSize: 20, color: 'error.main' }} />
                              </InputAdornment>
                            )
                          }}
                          fullWidth
                          value={timerSeconds}
                          onChange={handleTimerChange}
                          error={hasErrors && !timerSeconds && getErrorMessage('timerSeconds')}
                          helperText={!timerSeconds && getErrorMessage('timerSeconds')}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              bgcolor: theme.palette.background.paper,
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: theme.palette.error.main
                              }
                            }
                          }}
                        />
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 1 }} />

                    <FormControlLabel
                      disabled={loading.save || loading.delete}
                      control={
                        <Switch checked={skippable} onChange={e => setSkippable(e.target.checked)} color='primary' />
                      }
                      label={
                        <Typography variant='body2' fontWeight={600}>
                          Allow players to skip this question
                        </Typography>
                      }
                    />
                  </>
                )}
              </Stack>
            </Box>
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Stack direction='row' spacing={2} sx={{ pt: 2 }}>
              <Button
                fullWidth
                variant='contained'
                color='primary'
                size='large'
                component='label'
                startIcon={loading.save ? null : <SaveIcon />}
                onClick={onSaveQuestion}
                disabled={loading.save || loading.delete}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  color: 'white',
                  fontWeight: 700,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {loading.save ? 'Saving Question...' : 'Save Question'}
              </Button>

              <Button
                variant='outlined'
                color='error'
                size='large'
                startIcon={loading.delete ? null : <DeleteIcon />}
                onClick={handleDeleteClick}
                disabled={loading.save || loading.delete}
                sx={{
                  py: 1.5,
                  minWidth: 160,
                  borderRadius: 2,
                  fontWeight: 700,
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                    bgcolor: alpha(theme.palette.error.main, 0.05)
                  }
                }}
              >
                {loading.delete ? 'Deleting...' : 'Delete'}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Box>

      <DeleteConfirmationDialog
        open={openDeleteDialog}
        handleClose={handleCloseDialog}
        handleConfirm={onDeleteQuestion}
        title='Delete Question?'
        description='Are you sure you want to delete this question? This action cannot be undone.'
      />
    </>
  )
}

export default MultipleChoiceQuestionTemplate
