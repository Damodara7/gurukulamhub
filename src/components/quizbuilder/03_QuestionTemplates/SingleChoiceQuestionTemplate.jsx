import React, { useEffect, useState } from 'react'

import {
  FormControlLabel,
  Radio,
  Button,
  Switch,
  IconButton,
  Typography,
  TextField,
  Grid,
  Box,
  Card,
  CardContent,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import SaveIcon from '@mui/icons-material/Save'
import RemoveIcon from '@mui/icons-material/Remove'
import DeleteIcon from '@mui/icons-material/Delete'
import TextFieldsIcon from '@mui/icons-material/TextFields'
import ImageIcon from '@mui/icons-material/Image'

import DeleteConfirmationDialog from '@/components/dialogs/DeleteConfirmationDialog'
import IconButtonTooltip from '@/components/IconButtonTooltip'

import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

import VideoAd from '@views/apps/advertisements/VideoAd/VideoAd'
import ImagePopup from '@/components/ImagePopup'
import { filterInput, excludeQuesstionChars } from '@/utils/regexUtil'

const SingleChoiceQuestionTemplate = ({
  id: questionUUID,
  data,
  mode = 'primary',
  primaryQuestion = null,
  saveQuestion,
  deleteQuestion,
  validationErrors = [],
  isAdmin=false
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

  const [addHint, setAddHint] = useState( innerData?.addHint || false)
  const [status, setStatus] = useState(innerData?.status || 'draft')
  const [hint, setHint] = useState(innerData?.hint || '')
  const [hintMarks, setHintMarks] = useState(-1 * innerData?.hintMarks || '')
  const [marks, setMarks] = useState(innerData?.marks || '')
  const [timerSeconds, setTimerSeconds] = useState(innerData?.timerSeconds || '')
  const [skippable, setSkippable] = useState(innerData?.skippable || false) // by default non-skippable
  const [options, setOptions] = useState(
    innerData?.options
      ? innerData.options
      : mode === 'primary'
        ? [
            { id: '1', text: '', correct: true, image: '', file: null, mediaType: 'text' },
            { id: '2', text: '', correct: false, image: '', file: null, mediaType: 'text' }
          ]
        : primaryQuestion?.data?.options || [
            { id: '1', text: '', correct: true, image: '', file: null, mediaType: 'text' },
            { id: '2', text: '', correct: false, image: '', file: null, mediaType: 'text' }
          ]
  ) // Initial options

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
        question: question,
        addHint: addHint,
        hint: hint,
        hintMarks: parseFloat(hintMarks),
        marks: +marks,
        timerSeconds: +timerSeconds,
        skippable: skippable,
        language: language,
        status: status,
        options: options
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
        question: question,
        addHint: addHint, // Include addHint in the request data
        hint: hint,
        hintMarks: +hintMarks || +primaryQuestion?.data?.hintMarks,
        marks: +marks || +primaryQuestion?.data?.marks,
        timerSeconds: +timerSeconds || +primaryQuestion?.data?.timerSeconds,
        skippable: skippable || primaryQuestion?.data?.skippable,
        language: language,
        status: status,
        options: options
      }
    }

    const jsonData = JSON.stringify(secondaryQuestionData, null, 2)
    console.log(jsonData)
    return jsonData // or you can save it to a file or send it to a server
  }

  const addOption = () => {
    setOptions([
      ...options,
      {
        id: `option-${options.length + 1}`,
        text: `option-${options.length + 1}`,
        correct: false,
        image: '',
        mediaType: 'text'
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

    if (key === 'correct' && value) {
      updatedOptions.forEach((option, i) => {
        if (i !== index) {
          option.correct = false // Unselect other options if a new correct option is selected
        }
      })
    }

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

  const hasExactlyOneCorrectOption = options?.filter(op => op.correct).length === 1 || false

  return (
    <>
      {/* <Card key={id}> */}
      {/* <CardContent> */}
      <Grid container spacing={2} alignItems='center'>
        <Grid item xs={12} md={6} sx={{ marginBottom: '4px' }}>
          <TextField disabled label='Question Id' variant='outlined' fullWidth value={id} />
        </Grid>
        <Grid item xs={12} md={6} sx={{ marginBottom: '4px' }}>
          <TextField disabled label='Language ' variant='outlined' fullWidth value={language} />
        </Grid>

        {/* Question */}
        <Grid item xs={12} sx={{ marginBottom: '4px' }}>
          <Box sx={{ border: '1px dashed gray', borderRadius: '8px', p: 2 }}>
            <Grid container spacing={2} alignItems='flex-start'>
              {/* Media Type Toggle */}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Question Type</InputLabel>
                  <Select
                    label='Question Type'
                    value={question.mediaType}
                    onChange={e => toggleQuestionMediaType(e.target.value)}
                  >
                    <MenuItem value='text'>Text</MenuItem>
                    <MenuItem value='image'>Image</MenuItem>
                    <MenuItem value='text-image'>Text & Image</MenuItem>
                    <MenuItem value='video'>Video</MenuItem>
                    <MenuItem value='text-video'>Text & Video</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Question Text Input */}
              {(question.mediaType === 'text' ||
                question.mediaType === 'text-image' ||
                question.mediaType === 'text-video') && (
                <Grid item xs={12}>
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
                  />
                </Grid>
              )}

              {/* Image Input and Preview */}
              {(question.mediaType === 'image' || question.mediaType === 'text-image') && (
                <Grid item xs={12}>
                  <Box display='flex' alignItems='center' gap={2} style={{ width: '100%' }}>
                    {/* Image Input */}
                    <TextField
                      type='file'
                      fullWidth
                      disabled={loading.save || loading.delete}
                      label='Question Image'
                      InputLabelProps={{ shrink: true }}
                      error={hasErrors && !question.image && getErrorMessage('question.image')}
                      helperText={!question.image && getErrorMessage('question.image')}
                      onChange={e => handleQuestionMediaUpload(e.target.files[0], 'image')}
                      inputProps={{
                        accept: 'image/*' // Accept images only
                      }}
                      // InputProps={{
                      //   inputComponent: () => (
                      //     <input
                      //       type='file'
                      //       accept='image/*'
                      //       onChange={e => handleQuestionMediaUpload(e.target.files[0], 'image')}
                      //       style={{
                      //         cursor: 'pointer',
                      //         width: '100%',
                      //         height: '100%',
                      //         padding: '16px',
                      //         border: 'none',
                      //         backgroundColor: 'transparent'
                      //       }}
                      //     />
                      //   )
                      // }}
                      variant='outlined'
                      style={{ flex: 1 }}
                    />

                    {/* Image Preview */}
                    {question.image && (
                      <Box
                        component='img'
                        src={question.image}
                        alt='Uploaded Preview'
                        style={{
                          width: 60,
                          height: 60,
                          objectFit: 'cover',
                          borderRadius: '4px',
                          border: '1px solid #ccc'
                        }}
                      />
                    )}
                  </Box>
                </Grid>
              )}

              {/* Video URL Input */}
              {(question.mediaType === 'video' || question.mediaType === 'text-video') && (
                <Grid item xs={12}>
                  <TextField
                    label='Video URL'
                    variant='outlined'
                    fullWidth
                    value={question.video}
                    onChange={e => handleQuestionChange('video', e.target.value)}
                    placeholder='Enter YouTube video URL'
                    error={hasErrors && !question.video && getErrorMessage('question.video')}
                    helperText={!question.video && getErrorMessage('question.video')}
                  />
                  {question.video && (
                    <Box className='flex flex-col mt-2 gap-1 items-center'>
                      <Box className='flex flex-col gap-1 items-center'>
                        <VideoAd url={question.video || ''} showPause autoPlay={false} />
                        <ImagePopup imageUrl={question.video || ''} mediaType={'video'} />
                      </Box>
                    </Box>
                  )}
                </Grid>
              )}
            </Grid>
          </Box>
        </Grid>

        {/* Options */}
        <>
          <Grid item xs={12}>
            <Typography mb={2} variant='h6'>
              Options:
            </Typography>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId='options'>
                {provided => (
                  <div
                    style={{ display: 'flex', flexDirection: 'column', gap: '1rem', margin: '8px' }}
                    {...provided.droppableProps}
                    {...provided.dragHandleProps}
                    ref={provided.innerRef}
                  >
                    {options.map((option, index) => (
                      <Draggable key={option.id} draggableId={option.id} index={index}>
                        {provided =>
                          mode === 'primary' ? (
                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                              <Box display='flex' alignItems='center' gap={2}>
                                <Box {...provided.dragHandleProps} style={{ cursor: 'grab', marginRight: '8px' }}>
                                  <DragIndicatorIcon />
                                </Box>
                                {/* <TextField
                                  fullWidth
                                  label={`Option ${index + 1}`}
                                  value={option.text}
                                  onChange={e => handleOptionChange(index, 'text', e.target.value)}
                                  onBlur={e => handleOptionChange(index, 'text', e.target.value)}
                                  variant='outlined'
                                  style={{ marginRight: '8px' }}
                                /> */}
                                {option.mediaType === 'image' ? (
                                  <Box display='flex' alignItems='center' gap={2} style={{ width: '100%' }}>
                                    <TextField
                                      fullWidth
                                      type='file'
                                      inputProps={{
                                        accept: 'image/*' // Accept images only
                                      }}
                                      onChange={e => handleOptionMediaUpload(index, e.target.files[0], 'image')}
                                      disabled={loading.save || loading.delete}
                                      label={`Option ${index + 1}`}
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
                                              title='Text'
                                              disabled={loading.save || loading.delete}
                                              onClick={() => toggleOptionMediaType(index, 'text')}
                                              edge='end'
                                            >
                                              <TextFieldsIcon color='primary' />
                                            </IconButtonTooltip>
                                          </InputAdornment>
                                        )
                                        // inputComponent: () => (
                                        //   <input
                                        //     type='file'
                                        //     accept='image/*'
                                        //     onChange={e => handleOptionMediaUpload(index, e.target.files[0], 'image')}
                                        //     style={{
                                        //       cursor: 'pointer',
                                        //       width: '100%',
                                        //       height: '100%',
                                        //       padding: '16px',
                                        //       border: 'none',
                                        //       backgroundColor: 'transparent'
                                        //     }}
                                        //   />
                                        // )
                                      }}
                                      variant='outlined'
                                      style={{ flex: 1 }}
                                    />
                                    {/* Image Preview */}
                                    {option.image && (
                                      <Box
                                        component='img'
                                        src={option.image}
                                        alt={`Option ${index + 1}`}
                                        style={{
                                          width: 60,
                                          height: 60,
                                          objectFit: 'cover',
                                          borderRadius: '4px',
                                          border: '1px solid #ccc'
                                        }}
                                      />
                                    )}
                                  </Box>
                                ) : option.mediaType === 'text' ? (
                                  <TextField
                                    fullWidth
                                    disabled={loading.save || loading.delete}
                                    label={`Option ${index + 1}`}
                                    value={option.text}
                                    onChange={e => handleOptionChange(index, 'text', e.target.value)}
                                    onBlur={e => handleOptionChange(index, 'text', e.target.value)}
                                    variant='outlined'
                                    style={{ flex: 1 }}
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
                                    InputProps={{
                                      endAdornment: (
                                        <InputAdornment position='end'>
                                          <IconButtonTooltip
                                            title='Image'
                                            disabled={loading.save || loading.delete}
                                            onClick={() => toggleOptionMediaType(index, 'image')}
                                            edge='end'
                                          >
                                            <ImageIcon color='primary' />
                                          </IconButtonTooltip>
                                        </InputAdornment>
                                      )
                                    }}
                                  />
                                ) : (
                                  // Future media types such as video or audio
                                  <TextField
                                    fullWidth
                                    disabled={loading.save || loading.delete}
                                    label={`Option ${index + 1} (${option.mediaType})`}
                                    InputProps={{
                                      endAdornment: (
                                        <InputAdornment position='end'>
                                          <IconButtonTooltip
                                            title='Text'
                                            disabled={loading.save || loading.delete}
                                            onClick={() => toggleOptionMediaType(index, 'text')}
                                            edge='end'
                                          >
                                            <TextFieldsIcon color='primary' />
                                          </IconButtonTooltip>
                                        </InputAdornment>
                                      )
                                    }}
                                    variant='outlined'
                                    style={{ flex: 1 }}
                                  />
                                )}
                                <FormControlLabel
                                  disabled={loading.save || loading.delete}
                                  control={
                                    <Radio
                                      checked={option.correct}
                                      onChange={e => handleOptionChange(index, 'correct', e.target.checked)}
                                    />
                                  }
                                  label={<Typography variant='body2'>Correct</Typography>}
                                />
                                {index > 1 && (
                                  <IconButtonTooltip
                                    title='Remove'
                                    disabled={loading.save || loading.delete}
                                    aria-label='remove option'
                                    onClick={() => removeOption(index)}
                                    style={{ marginLeft: '8px' }}
                                  >
                                    <RemoveIcon />
                                  </IconButtonTooltip>
                                )}
                              </Box>
                            </div>
                          ) : (
                            <div ref={provided.innerRef}>
                              <Box display='flex' alignItems='center' gap={2}>
                                {/* <TextField
                                  fullWidth
                                  label={`Option ${index + 1}`}
                                  value={option.text}
                                  onChange={e => handleOptionChange(index, 'text', e.target.value)}
                                  onBlur={e => handleOptionChange(index, 'text', e.target.value)}
                                  variant='outlined'
                                  style={{ marginRight: '8px' }}
                                /> */}
                                {option.mediaType === 'image' ? (
                                  <Box display='flex' alignItems='center' gap={2} style={{ width: '100%' }}>
                                    <TextField
                                      fullWidth
                                      type='file'
                                      onChange={e => handleOptionMediaUpload(index, e.target.files[0], 'image')}
                                      disabled={loading.save || loading.delete}
                                      label={`Option ${index + 1}`}
                                      InputLabelProps={{ shrink: true }}
                                      inputProps={{
                                        accept: 'image/*' // Accept images only
                                      }}
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
                                              title='Text'
                                              onClick={() => toggleOptionMediaType(index, 'text')}
                                              edge='end'
                                            >
                                              <TextFieldsIcon color='primary' />
                                            </IconButtonTooltip>
                                          </InputAdornment>
                                        )
                                        // inputComponent: () => (
                                        //   <input
                                        //     type='file'
                                        //     accept='image/*'
                                        //     onChange={e => handleOptionMediaUpload(index, e.target.files[0], 'image')}
                                        //     style={{
                                        //       cursor: 'pointer',
                                        //       width: '100%',
                                        //       height: '100%',
                                        //       padding: '16px',
                                        //       border: 'none',
                                        //       backgroundColor: 'transparent'
                                        //     }}
                                        //   />
                                        // )
                                      }}
                                      variant='outlined'
                                      style={{ flex: 1 }}
                                    />
                                    {/* Image Preview */}
                                    {option.image && (
                                      <Box
                                        component='img'
                                        src={option.image}
                                        alt={`Option ${index + 1}`}
                                        style={{
                                          width: 60,
                                          height: 60,
                                          objectFit: 'cover',
                                          borderRadius: '4px',
                                          border: '1px solid #ccc'
                                        }}
                                      />
                                    )}
                                  </Box>
                                ) : option.mediaType === 'text' ? (
                                  <TextField
                                    fullWidth
                                    disabled={loading.save || loading.delete}
                                    label={`Option ${index + 1}`}
                                    value={option.text}
                                    onChange={e => handleOptionChange(index, 'text', e.target.value)}
                                    onBlur={e => handleOptionChange(index, 'text', e.target.value)}
                                    variant='outlined'
                                    style={{ flex: 1 }}
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
                                    InputProps={{
                                      endAdornment: (
                                        <InputAdornment position='end'>
                                          <IconButtonTooltip
                                            title='Image'
                                            onClick={() => toggleOptionMediaType(index, 'image')}
                                            edge='end'
                                          >
                                            <ImageIcon color='primary' />
                                          </IconButtonTooltip>
                                        </InputAdornment>
                                      )
                                    }}
                                  />
                                ) : (
                                  // Future media types such as video or audio
                                  <TextField
                                    fullWidth
                                    disabled={loading.save || loading.delete}
                                    label={`Option ${index + 1} (${option.mediaType})`}
                                    InputProps={{
                                      endAdornment: (
                                        <InputAdornment position='end'>
                                          <IconButtonTooltip
                                            title='Text'
                                            onClick={() => toggleOptionMediaType(index, 'text')}
                                            edge='end'
                                          >
                                            <TextFieldsIcon color='primary' />
                                          </IconButtonTooltip>
                                        </InputAdornment>
                                      )
                                    }}
                                    variant='outlined'
                                    style={{ flex: 1 }}
                                  />
                                )}
                                <FormControlLabel
                                  disabled={loading.save || loading.delete}
                                  control={
                                    <Radio
                                      checked={option.correct}
                                      disabled
                                      onChange={e => handleOptionChange(index, 'correct', e.target.checked)}
                                    />
                                  }
                                  label={<Typography variant='body2'>Correct</Typography>}
                                />
                              </Box>
                            </div>
                          )
                        }
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            {hasErrors && !hasExactlyOneCorrectOption && getErrorMessage('options') && (
              <Typography className='text-center' variant='body1' color='error'>
                {getErrorMessage('options')}
              </Typography>
            )}
          </Grid>
          {mode === 'primary' && (
            <Grid item xs={12} className='flex justify-end'>
              <Button
                disabled={loading.save || loading.delete}
                variant='text'
                size='small'
                color='primary'
                startIcon={<AddIcon />}
                onClick={addOption}
              >
                Add Option
              </Button>
            </Grid>
          )}
        </>
      </Grid>

      {/* Hint, Marks, Hint Marks, Skippable, Time in Seconds */}
      <Grid container spacing={2} mt={2} alignItems='start'>
        <Grid item xs={12} className='flex justify-start'>
          <FormControlLabel control={<Checkbox checked={addHint} onChange={handleAddHintChange} />} label='Add Hint' />
        </Grid>
        {addHint && (
          <Grid item xs={12} sx={{ marginBottom: '4px' }}>
            <TextField
              disabled={loading.save || loading.delete}
              label='Hint'
              variant='outlined'
              fullWidth
              value={hint}
              onChange={handleHintChange}
              error={addHint && hasErrors && !hint.trim() && getErrorMessage('hint')}
              helperText={addHint && !hint.trim() && getErrorMessage('hint')}
            />
          </Grid>
        )}
        {mode === 'primary' ? (
          <>
            <Grid item xs={6} md={addHint ? 4 : 6}>
              <TextField
                disabled={loading.save || loading.delete}
                label='Marks'
                type='number'
                InputProps={{ inputProps: { min: 0.25 } }}
                variant='outlined'
                fullWidth
                value={marks}
                onChange={handleMarksChange}
                error={hasErrors && !marks && getErrorMessage('marks')}
                helperText={!marks && getErrorMessage('marks')}
              />
            </Grid>
            {addHint && (
              <Grid item xs={6} md={4}>
                <TextField
                  disabled={loading.save || loading.delete}
                  label='Hint Marks'
                  variant='outlined'
                  fullWidth
                  type='number'
                  InputProps={{
                    inputProps: {
                      max: marks || 0,
                      min: 0,
                      step: 0.25
                    }
                  }}
                  value={hintMarks}
                  onChange={handleHintMarksChange}
                  error={
                    (addHint && hasErrors && !hintMarks && marks && getErrorMessage('hintMarks')) || // Only validate if marks exists
                    (addHint && marks && hintMarks >= marks) // Only compare if marks exists
                  }
                  helperText={
                    (addHint && !hintMarks && marks && getErrorMessage('hintMarks')) || // Only show error if marks exists
                    (addHint && marks && hintMarks >= marks && 'Hint marks cannot exceed question marks')
                  }
                />
              </Grid>
            )}
            <Grid item xs={6} md={addHint ? 4 : 6}>
              <TextField
                disabled={loading.save || loading.delete}
                label='Timer Seconds'
                variant='outlined'
                type='number'
                InputProps={{ inputProps: { min: 10 } }}
                fullWidth
                value={timerSeconds}
                onChange={handleTimerChange}
                error={hasErrors && !timerSeconds && getErrorMessage('timerSeconds')}
                helperText={!timerSeconds && getErrorMessage('timerSeconds')}
              />
            </Grid>
            <Grid item xs={12} textAlign='center' mb={3}>
              <FormControlLabel
                disabled={loading.save || loading.delete}
                control={<Switch value={skippable} onChange={e => setSkippable(e.target.checked)} />}
                label='Skippable'
              />
            </Grid>
          </>
        ) : (
          ''
        )}
      </Grid>

      {/* Actions */}
      <Grid container spacing={2} alignItems='center'>
        <Grid item xs={6}>
          <Button
            startIcon={<SaveIcon />}
            fullWidth
            variant='outlined'
            component='label'
            color='primary'
            // style={{ color: 'white' }}
            aria-label='add option'
            onClick={onSaveQuestion}
            disabled={loading.save || loading.delete}
          >
            {loading.save ? 'Saving...' : 'Save Q'}
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button
            startIcon={<DeleteIcon />}
            fullWidth
            variant='outlined'
            component='label'
            color='error'
            // style={{ color: 'white' }}
            aria-label='delete option'
            onClick={handleDeleteClick}
            disabled={loading.save || loading.delete}
          >
            {loading.delete ? 'Deleting...' : 'Delete Q'}
          </Button>
        </Grid>
      </Grid>

      <DeleteConfirmationDialog
        open={openDeleteDialog}
        handleClose={handleCloseDialog}
        handleConfirm={onDeleteQuestion}
        title='Delete Question?'
        description='Are you sure you want to delete this question? This action cannot be undone.'
      />
      {/* </CardContent> */}
      {/* </Card> */}
    </>
  )
}

export default SingleChoiceQuestionTemplate
