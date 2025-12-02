import React, { useState } from 'react'

import {
  Button,
  IconButton,
  Typography,
  TextField,
  Grid,
  Box,
  Card,
  CardContent,
  Radio,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Checkbox,
  useTheme,
  alpha,
  Divider,
  Stack,
  Chip
} from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import DeleteIcon from '@mui/icons-material/Delete'
import TextFieldsIcon from '@mui/icons-material/TextFields'
import ImageIcon from '@mui/icons-material/Image'
import InputAdornment from '@mui/material/InputAdornment'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import TimerIcon from '@mui/icons-material/Timer'
import QuestionMarkIcon from '@mui/icons-material/QuestionMark'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import { filterInput, excludeQuesstionChars } from '@/utils/regexUtil'

import VideoAd from '@views/apps/advertisements/VideoAd/VideoAd'
import ImagePopup from '@/components/ImagePopup'
import IconButtonTooltip from '@/components/IconButtonTooltip'
import DeleteConfirmationDialog from '@/components/dialogs/DeleteConfirmationDialog'

const TrueFalseQuestionTemplate = ({
  id: questionUUID,
  data,
  mode = 'primary',
  saveQuestion,
  deleteQuestion,
  primaryQuestion = null,
  validationErrors = [],
  isAdmin = false
}) => {
  const innerData = data?.data
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
  const [timerSeconds, setTimerSeconds] = useState(innerData?.timerSeconds || '')
  const [skippable, setSkippable] = useState(innerData?.skippable || false) // default non-skippable
  const [correctOption, setCorrectOption] = useState(
    innerData?.correctOption
      ? innerData.correctOption
      : mode === 'primary'
        ? 'true'
        : primaryQuestion?.data?.correctOption || 'true'
  ) // Default is true for True/False question
  const [options, setOptions] = useState(
    innerData?.options
      ? innerData.options
      : mode === 'primary'
        ? [
            { id: 'true', text: 'True', correct: true, image: '', file: null, mediaType: 'text' },
            { id: 'false', text: 'False', correct: false, image: '', file: null, mediaType: 'text' }
          ]
        : primaryQuestion?.data?.options || [
            { id: 'true', text: 'True', correct: true, image: '', mediaType: 'text' },
            { id: 'false', text: 'False', correct: false, image: '', mediaType: 'text' }
          ]
  )

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
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

  const createQuestionRequest = () => {
    const questionData = {
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
        timerSeconds: +timerSeconds,
        skippable: skippable,
        status: status,
        // correctOption: correctOption,
        options: options
      }
    }

    // const jsonData = JSON.stringify(questionData, null, 2)
    console.log(questionData)
    return questionData
  }

  const onSaveQuestion = async () => {
    setLoading(prev => ({ ...prev, save: true }))

    const saveQuestionObj = createQuestionRequest()

    try {
      await saveQuestion(saveQuestionObj) // Assuming saveQuestion is an async function
    } catch (error) {
      console.error('Error saving question', error)
    } finally {
      setLoading(prev => ({ ...prev, save: false }))
    }
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

  // const handleOptionChange = event => {
  //   setCorrectOption(event.target.value)
  // }
  const handleOptionChange = (index, key, value) => {
    const updatedOptions = [...options]

    updatedOptions[index][key] = value

    if (key === 'correct' && value) {
      updatedOptions.forEach((option, i) => {
        if (i !== index) {
          option.correct = false // Unselect the other option when one is selected as correct
        }
      })
    }

    setOptions(updatedOptions)
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

  const toggleOptionMediaType = (index, newType) => {
    const updatedOptions = [...options]
    updatedOptions[index].mediaType = newType // Update media type dynamically
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
      return fieldErrorObj.message
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

  const hasExactlyOneCorrectOption = options?.filter(op => op.correct).length === 1 || false
  const theme = useTheme()

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
              True/False Question
            </Typography>
            <Typography variant='caption' sx={{ color: 'text.secondary' }}>
              ID: {id} • Language: {language}
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
                  <Box display='flex' alignItems='center' gap={2}>
                    <TextField
                      type='file'
                      fullWidth
                      disabled={loading.save || loading.delete}
                      label='Question Image'
                      InputLabelProps={{ shrink: true }}
                      error={hasErrors && !question.image && getErrorMessage('question.image')}
                      helperText={!question.image && getErrorMessage('question.image')}
                      onChange={e => handleQuestionMediaUpload(e.target.files[0], 'image')}
                      inputProps={{ accept: 'image/*' }}
                      variant='outlined'
                      sx={{
                        flex: 1,
                        '& .MuiOutlinedInput-root': {
                          bgcolor: 'white',
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.primary.main
                          }
                        }
                      }}
                    />
                    {question.image && (
                      <Box
                        component='img'
                        src={question.image}
                        alt='Uploaded Preview'
                        sx={{
                          width: 80,
                          height: 80,
                          objectFit: 'cover',
                          borderRadius: 2,
                          border: '2px solid',
                          borderColor: 'divider',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                      />
                    )}
                  </Box>
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
                      <Box
                        sx={{
                          mt: 2,
                          p: 2,
                          bgcolor: theme.palette.background.paper,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.12 : 0.08)
                        }}
                      >
                        <VideoAd url={question.video || ''} showPause autoPlay={false} />
                        <Box sx={{ mt: 1, textAlign: 'center' }}>
                          <ImagePopup imageUrl={question.video || ''} mediaType={'video'} />
                        </Box>
                      </Box>
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
              <Stack direction='row' alignItems='center' spacing={1.5} sx={{ mb: 2.5 }}>
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
                  <CheckCircleIcon sx={{ fontSize: 20, color: 'secondary.main' }} />
                </Box>
                <Typography variant='subtitle1' fontWeight={700} sx={{ color: theme.palette.text.primary }}>
                  True/False Options
                </Typography>
                <Chip
                  label='2 options'
                  size='small'
                  sx={{
                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                    color: 'secondary.main',
                    fontWeight: 600
                  }}
                />
              </Stack>

              <Stack spacing={2}>
                {options.map((option, index) => (
                  <Box
                    key={option.id}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: theme.palette.background.paper,
                      border: '2px solid',
                      borderColor: option.correct
                        ? alpha(theme.palette.success.main, 0.3)
                        : alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.12 : 0.08),
                      boxShadow:
                        theme.palette.mode === 'dark' ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.05)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        boxShadow:
                          theme.palette.mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.1)',
                        borderColor: option.correct ? theme.palette.success.main : theme.palette.primary.main
                      }
                    }}
                  >
                    <Stack direction='row' alignItems='center' spacing={1.5}>
                      {option.id === 'true' ? (
                        <CheckCircleIcon
                          sx={{ fontSize: 28, color: option.correct ? 'success.main' : 'text.secondary' }}
                        />
                      ) : (
                        <CancelIcon sx={{ fontSize: 28, color: option.correct ? 'success.main' : 'text.secondary' }} />
                      )}

                      <Box sx={{ flex: 1 }}>
                        {option.mediaType === 'image' ? (
                          <Stack direction='row' alignItems='center' spacing={1.5}>
                            <TextField
                              disabled={loading.save || loading.delete}
                              fullWidth
                              type='file'
                              inputProps={{ accept: 'image/*' }}
                              onChange={e => handleOptionMediaUpload(index, e.target.files[0], 'image')}
                              label={option.text}
                              InputLabelProps={{ shrink: true }}
                              error={
                                hasErrors &&
                                !option.image &&
                                (getErrorMessage(`options.${option.id}.image`) ||
                                  getErrorMessage(`options.${option.id}`))
                              }
                              helperText={
                                !option.image &&
                                (getErrorMessage(`options.${option.id}.image`) ||
                                  getErrorMessage(`options.${option.id}`))
                              }
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment position='end'>
                                    <IconButtonTooltip
                                      title='Switch to Text'
                                      disabled={loading.save || loading.delete}
                                      onClick={() => toggleOptionMediaType(index, 'text')}
                                    >
                                      <TextFieldsIcon color='primary' />
                                    </IconButtonTooltip>
                                  </InputAdornment>
                                )
                              }}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  bgcolor: alpha(theme.palette.background.paper, 0.5),
                                  '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: theme.palette.primary.main
                                  }
                                }
                              }}
                            />
                            {option.image && (
                              <Box
                                component='img'
                                src={option.image}
                                alt={option.text}
                                sx={{
                                  width: 60,
                                  height: 60,
                                  objectFit: 'cover',
                                  borderRadius: 1.5,
                                  border: '2px solid',
                                  borderColor: alpha(
                                    theme.palette.divider,
                                    theme.palette.mode === 'dark' ? 0.12 : 0.08
                                  ),
                                  boxShadow:
                                    theme.palette.mode === 'dark'
                                      ? '0 2px 8px rgba(0,0,0,0.4)'
                                      : '0 2px 8px rgba(0,0,0,0.1)'
                                }}
                              />
                            )}
                          </Stack>
                        ) : option.mediaType === 'text' ? (
                          <TextField
                            fullWidth
                            disabled={loading.save || loading.delete}
                            label={option.text}
                            value={option.text}
                            onChange={e => handleOptionChange(index, 'text', e.target.value)}
                            onBlur={e => handleOptionChange(index, 'text', e.target.value)}
                            error={
                              hasErrors &&
                              !option.text.trim() &&
                              (getErrorMessage(`options.${option.id}.text`) || getErrorMessage(`options.${option.id}`))
                            }
                            helperText={
                              !option.text.trim() &&
                              (getErrorMessage(`options.${option.id}.text`) || getErrorMessage(`options.${option.id}`))
                            }
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position='end'>
                                  <IconButtonTooltip
                                    title='Switch to Image'
                                    disabled={loading.save || loading.delete}
                                    onClick={() => toggleOptionMediaType(index, 'image')}
                                  >
                                    <ImageIcon color='primary' />
                                  </IconButtonTooltip>
                                </InputAdornment>
                              )
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                bgcolor: alpha(theme.palette.background.paper, 0.5),
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: theme.palette.primary.main
                                }
                              }
                            }}
                          />
                        ) : (
                          <TextField
                            disabled={loading.save || loading.delete}
                            fullWidth
                            label={`${option.text} (${option.mediaType})`}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position='end'>
                                  <IconButtonTooltip
                                    title='Switch to Text'
                                    disabled={loading.save || loading.delete}
                                    onClick={() => toggleOptionMediaType(index, 'text')}
                                  >
                                    <TextFieldsIcon color='primary' />
                                  </IconButtonTooltip>
                                </InputAdornment>
                              )
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                bgcolor: alpha(theme.palette.background.paper, 0.5)
                              }
                            }}
                          />
                        )}
                      </Box>

                      <FormControlLabel
                        disabled={loading.save || loading.delete}
                        control={
                          <Radio
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
                    </Stack>
                  </Box>
                ))}

                {hasErrors && !hasExactlyOneCorrectOption && getErrorMessage('options') && (
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
              </Stack>
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
                      <Grid item xs={12} sm={addHint ? 4 : 6}>
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

                      {addHint && (
                        <Grid item xs={12} sm={4}>
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

                      <Grid item xs={12} sm={addHint ? 4 : 6}>
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

export default TrueFalseQuestionTemplate
