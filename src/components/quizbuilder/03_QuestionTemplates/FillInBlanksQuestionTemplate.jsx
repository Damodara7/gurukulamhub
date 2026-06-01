import React, { useState } from 'react'
import {
  Box,
  TextField,
  Button,
  Typography,
  InputBase,
  IconButton,
  Grid,
  Card,
  CardContent,
  FormControlLabel,
  Switch,
  Checkbox,
  useTheme,
  alpha,
  Divider,
  Stack,
  Chip,
  InputAdornment
} from '@mui/material'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle'
import SaveIcon from '@mui/icons-material/Save'
import DeleteIcon from '@mui/icons-material/Delete'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import TimerIcon from '@mui/icons-material/Timer'
import QuestionMarkIcon from '@mui/icons-material/QuestionMark'
import TextFieldsIcon from '@mui/icons-material/TextFields'
import SpaceBarIcon from '@mui/icons-material/SpaceBar'

import DeleteConfirmationDialog from '@/components/dialogs/DeleteConfirmationDialog'
import { toast } from 'react-toastify'
import IconButtonTooltip from '@/components/IconButtonTooltip'
import { blankRegex, textRegex, filterInput, excludeBlankChars, excludesTextChars } from '@/utils/regexUtil'
import QuestionWeightageField from '@/components/quizbuilder/QuestionWeightageField'

const FillInBlanksQuestionTemplate = ({
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
  const [id, setId] = useState(questionUUID)
  const [language, setLanguage] = useState(data?.language)
  const [status, setStatus] = useState(innerData?.status || 'draft')
  const [hint, setHint] = useState(innerData?.hint || '')
  const [hintMarks, setHintMarks] = useState(-1 * innerData?.hintMarks || '')
  const [marks, setMarks] = useState(innerData?.marks || '')
  const [weightage, setWeightage] = useState(Number(innerData?.weightage) || 1)
  const [timerSeconds, setTimerSeconds] = useState(innerData?.timerSeconds || '')
  const [skippable, setSkippable] = useState(innerData?.skippable || false) // by default non-skippable
  const [addHint, setAddHint] = useState(innerData?.addHint || false)
  const [questionParts, setQuestionParts] = useState(
    innerData?.question || [{ id: 'part-1', type: 'text', content: '' }]
  )

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [loading, setLoading] = useState({ save: false, delete: false })

  const onDeleteQuestion = async () => {
    setLoading(prev => ({ ...prev, delete: true }))
    setOpenDeleteDialog(false)
    try {
      await deleteQuestion(data._id) // Assuming deleteQuestion is an async function
    } catch (error) {
      console.error('Error deleting question', error)
    } finally {
      setLoading(prev => ({ ...prev, delete: false }))
    }
  }

  const handleDeleteClick = () => {
    setOpenDeleteDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDeleteDialog(false)
  }

  console.log('Mode is :', mode, data?.language)

  const createPrimaryQuestionRequest = () => {
    const primaryQuestionData = {
      _id: data._id,
      id: id,
      templateId: data.templateId,
      data: {
        language: language,
        question: questionParts,
        addHint: addHint,
        hint: hint,
        hintMarks: parseFloat(hintMarks),
        marks: +marks,
        weightage: Number(weightage) || 1,
        timerSeconds: +timerSeconds,
        skippable: skippable,
        language: language,
        status: status
      }
    }

    // const jsonData = JSON.stringify(primaryQuestionData, null, 2)
    console.log(primaryQuestionData)
    return primaryQuestionData // or you can save it to a file or send it to a server
  }

  const createSecondaryQuestionRequest = () => {
    const secondaryQuestionData = {
      _id: data._id,
      id: id,
      data: {
        language: language,
        question: questionParts,
        addHint: addHint,
        hint: hint,
        hintMarks: +hintMarks || +primaryQuestion?.data?.hintMarks,
        marks: +marks || +primaryQuestion?.data?.marks,
        weightage: Number(weightage) || Number(primaryQuestion?.data?.weightage) || 1,
        timerSeconds: +timerSeconds || +primaryQuestion?.data?.timerSeconds,
        skippable: skippable || primaryQuestion?.data?.skippable,
        language: language,
        status: status
      }
    }

    const jsonData = JSON.stringify(secondaryQuestionData, null, 2)
    console.log(jsonData)
    return jsonData // or you can save it to a file or send it to a server
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

  const onSaveQuestion = async () => {
    setLoading(prev => ({ ...prev, save: true }))

    // if (questionParts.length === 0) {
    //   toast.error('Please add at least one text part and one blank.')
    //   setLoading(prev => ({ ...prev, save: false }))
    //   return
    // }

    // // Check if any part has empty content
    // const hasEmptyParts = questionParts.some(part => part.content.trim() === '')
    // if (hasEmptyParts) {
    //   toast.error('Please fill in all parts before saving.')
    //   setLoading(prev => ({ ...prev, save: false }))
    //   return
    // }

    // // Check if at least one blank part is added
    // const hasBlankPart = questionParts.some(part => part.type === 'blank')
    // if (!hasBlankPart) {
    //   toast.error('Please add at least one blank.')
    //   setLoading(prev => ({ ...prev, save: false }))
    //   return
    // }

    console.log({
      questionParts
    })

    const saveQuestionObj = mode === 'primary' ? createPrimaryQuestionRequest() : createSecondaryQuestionRequest()

    try {
      await saveQuestion(saveQuestionObj) // Assuming saveQuestion is an async function
    } catch (error) {
      console.error('Error saving question', error)
    } finally {
      setLoading(prev => ({ ...prev, save: false }))
    }
  }

  // Add a new blank
  const handleAddBlank = () => {
    const newBlankId = `part-${questionParts.length + 1}`
    setQuestionParts([...questionParts, { id: newBlankId, type: 'blank', content: '' }])
  }

  // Add a new text part
  const handleAddText = () => {
    const newTextId = `part-${questionParts.length + 1}`
    setQuestionParts([...questionParts, { id: newTextId, type: 'text', content: '' }])
  }

  // Remove a part
  const handleRemovePart = id => {
    setQuestionParts(questionParts.filter(part => part.id !== id))
  }

  // Update content of a part
  const handlePartChange = (id, type, value) => {
    let filterValue = value
    if (type === 'blank') {
      filterValue = filterInput(value, excludeBlankChars)
    } else if (type === 'text') {
      filterValue = filterInput(value, excludesTextChars)
    }
    // alphanumeric characters and spaces
    setQuestionParts(questionParts.map(part => (part.id === id ? { ...part, content: filterValue } : part)))
  }

  // Check if the last part is a text input
  const isLastPartText = questionParts[questionParts.length - 1]?.type === 'text'

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

  const hasAtleastOneBlank = questionParts.filter(p => p.type === 'blank').length >= 1 || false
  const hasAtleastOneText = questionParts.filter(p => p.type === 'text').length >= 1 || false
  const theme = useTheme()
  const blankCount = questionParts.filter(p => p.type === 'blank').length
  const textCount = questionParts.filter(p => p.type === 'text').length

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
              Fill in the Blanks Question
            </Typography>
            <Typography variant='caption' sx={{ color: 'text.secondary' }}>
              Language: {language}
            </Typography>
          </Box>
          {hasErrors && <Chip label='Has Errors' color='error' size='small' sx={{ height: 28, fontWeight: 600 }} />}
        </Stack>

        <Grid container spacing={3}>
          {/* Question Builder Section */}
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
                {/* Section Header */}
                <Stack direction='row' alignItems='center' justifyContent='space-between' flexWrap='wrap' gap={2}>
                  <Stack direction='row' alignItems='center' spacing={1.5}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.15),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <TextFieldsIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                    </Box>
                    <Typography variant='subtitle1' fontWeight={700} sx={{ color: theme.palette.text.primary }}>
                      Build Your Question
                    </Typography>
                  </Stack>

                  <Stack direction='row' spacing={1}>
                    <Chip
                      label={`${textCount} text${textCount !== 1 ? 's' : ''}`}
                      size='small'
                      sx={{
                        bgcolor: alpha(theme.palette.info.main, 0.1),
                        color: 'info.main',
                        fontWeight: 600,
                        border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`
                      }}
                    />
                    <Chip
                      label={`${blankCount} blank${blankCount !== 1 ? 's' : ''}`}
                      size='small'
                      sx={{
                        bgcolor: alpha(theme.palette.warning.main, 0.1),
                        color: 'warning.main',
                        fontWeight: 600,
                        border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`
                      }}
                    />
                  </Stack>
                </Stack>

                <Stack spacing={2}>
                  {questionParts.map((part, index) => (
                    <Box
                      key={part.id}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: theme.palette.background.paper,
                        border: '2px solid',
                        borderColor:
                          part.type === 'blank'
                            ? alpha(theme.palette.warning.main, 0.3)
                            : alpha(theme.palette.info.main, 0.3),
                        boxShadow:
                          theme.palette.mode === 'dark' ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.05)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          boxShadow:
                            theme.palette.mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.1)',
                          borderColor: part.type === 'blank' ? theme.palette.warning.main : theme.palette.info.main
                        }
                      }}
                    >
                      <Stack direction='row' alignItems='center' spacing={1.5}>
                        {/* Part Type Indicator */}
                        <Chip
                          label={index + 1}
                          size='small'
                          sx={{
                            minWidth: 32,
                            height: 24,
                            fontWeight: 700,
                            bgcolor:
                              part.type === 'blank'
                                ? alpha(theme.palette.warning.main, 0.15)
                                : alpha(theme.palette.info.main, 0.15),
                            color: part.type === 'blank' ? 'warning.main' : 'info.main'
                          }}
                        />

                        <Box sx={{ flex: 1 }}>
                          {part.type === 'text' ? (
                            <TextField
                              fullWidth
                              variant='outlined'
                              label={`Text Part ${questionParts.filter((p, i) => i <= index && p.type === 'text').length}`}
                              placeholder='Enter text portion of the question'
                              value={part.content}
                              error={
                                hasErrors && !part.content.trim() && getErrorMessage(`question.${part.id}.content`)
                              }
                              helperText={
                                !part.content.trim() && <span>{getErrorMessage(`question.${part.id}.content`)}</span>
                              }
                              onChange={e => handlePartChange(part.id, part.type, e.target.value)}
                              multiline
                              rows={2}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  bgcolor: alpha(theme.palette.info.main, 0.03),
                                  '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: theme.palette.info.main
                                  }
                                }
                              }}
                            />
                          ) : (
                            <TextField
                              fullWidth
                              variant='outlined'
                              label={`Blank ${questionParts.filter((p, i) => i <= index && p.type === 'blank').length}`}
                              placeholder='Enter the correct answer for this blank'
                              value={part.content}
                              error={
                                hasErrors && !part.content.trim() && getErrorMessage(`question.${part.id}.content`)
                              }
                              helperText={
                                !part.content.trim()
                                  ? getErrorMessage(`question.${part.id}.content`)
                                  : 'Players will fill this blank'
                              }
                              onChange={e => handlePartChange(part.id, part.type, e.target.value)}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  bgcolor: alpha(theme.palette.warning.main, 0.03),
                                  borderColor: theme.palette.warning.main,
                                  '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: theme.palette.warning.main,
                                    borderWidth: 2
                                  },
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: theme.palette.warning.main,
                                    boxShadow: `0 0 0 3px ${alpha(theme.palette.warning.main, 0.15)}`
                                  }
                                },
                                '& .MuiInputBase-input': {
                                  fontWeight: 600,
                                  color: theme.palette.warning.dark
                                }
                              }}
                            />
                          )}
                        </Box>

                        <IconButton
                          size='small'
                          onClick={() => handleRemovePart(part.id)}
                          sx={{
                            color: 'error.main',
                            '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) }
                          }}
                        >
                          <RemoveCircleIcon fontSize='small' />
                        </IconButton>
                      </Stack>
                    </Box>
                  ))}
                  {/* Validation Errors */}
                  {hasErrors && (
                    <Stack spacing={1}>
                      {!hasAtleastOneBlank && getErrorMessage(`question.blank`) && (
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.error.main, 0.1),
                            border: '1px solid',
                            borderColor: alpha(theme.palette.error.main, 0.3)
                          }}
                        >
                          <Typography variant='body2' color='error' fontWeight={600}>
                            {getErrorMessage(`question.blank`)}
                          </Typography>
                        </Box>
                      )}
                      {!hasAtleastOneText && getErrorMessage(`question.text`) && (
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.error.main, 0.1),
                            border: '1px solid',
                            borderColor: alpha(theme.palette.error.main, 0.3)
                          }}
                        >
                          <Typography variant='body2' color='error' fontWeight={600}>
                            {getErrorMessage(`question.text`)}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  )}

                  {/* Add Part Buttons */}
                  <Divider />

                  <Stack direction='row' spacing={2}>
                    <Button
                      fullWidth
                      variant='outlined'
                      color='info'
                      startIcon={<AddCircleIcon />}
                      onClick={handleAddText}
                      disabled={isLastPartText}
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        borderStyle: 'dashed',
                        borderWidth: 2,
                        fontWeight: 600,
                        '&:hover': {
                          borderStyle: 'solid',
                          bgcolor: alpha(theme.palette.info.main, 0.05)
                        },
                        '&:disabled': {
                          borderStyle: 'dashed'
                        }
                      }}
                    >
                      Add Text Part
                    </Button>

                    <Button
                      fullWidth
                      variant='outlined'
                      color='warning'
                      startIcon={<AddCircleIcon />}
                      onClick={handleAddBlank}
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        borderStyle: 'dashed',
                        borderWidth: 2,
                        fontWeight: 600,
                        '&:hover': {
                          borderStyle: 'solid',
                          bgcolor: alpha(theme.palette.warning.main, 0.05)
                        }
                      }}
                    >
                      Add Blank
                    </Button>
                  </Stack>
                </Stack>
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
                  boxShadow:
                    theme.palette.mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.1)',
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

export default FillInBlanksQuestionTemplate
