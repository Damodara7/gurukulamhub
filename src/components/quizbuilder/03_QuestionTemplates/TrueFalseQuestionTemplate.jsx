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
  Checkbox
} from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import DeleteIcon from '@mui/icons-material/Delete'
import TextFieldsIcon from '@mui/icons-material/TextFields'
import ImageIcon from '@mui/icons-material/Image'
import InputAdornment from '@mui/material/InputAdornment'
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
  validationErrors = []
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
  const [addHint , setAddHint] =useState(false)
  const [status, setStatus] = useState(innerData?.status || 'draft')
  const [hint, setHint] = useState(innerData?.hint || '')
  const [hintMarks, setHintMarks] = useState(innerData?.hintMarks)
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
        hintMarks: -parseInt(hintMarks),
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
    let filterValue = value;
    if(key === 'text') {
      filterValue = filterInput(value, excludeQuesstionChars)// Allow only alphanumeric characters and some punctuation
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
        <Grid item xs={12}>
          <Typography variant='h6'>Options:</Typography>
          <Box display='flex' flexDirection='column' gap={2} mt={2}>
            {options.map((option, index) => (
              <Box key={option.id} display='flex' alignItems='center' marginBottom={2} style={{ width: '100%' }}>
                {option.mediaType === 'image' ? (
                  <Box display='flex' alignItems='center' gap={2} style={{ width: '100%' }}>
                    <TextField
                      disabled={loading.save || loading.delete}
                      fullWidth
                      type='file'
                      inputProps={{
                        accept: 'image/*' // Accept images only
                      }}
                      onChange={e => handleOptionMediaUpload(index, e.target.files[0], 'image')}
                      label={`Option ${index + 1}`}
                      InputLabelProps={{ shrink: true }}
                      error={
                        hasErrors &&
                        !option.image &&
                        (getErrorMessage(`options.${option.id}.image`) || getErrorMessage(`options.${option.id}`))
                      }
                      helperText={
                        !option.image &&
                        (getErrorMessage(`options.${option.id}.image`) || getErrorMessage(`options.${option.id}`))
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
                        //     onChange={e => handleMediaUpload(index, e.target.files[0], 'image')}
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
                    error={
                      hasErrors &&
                      !option.text.trim() &&
                      (getErrorMessage(`options.${option.id}.text`) || getErrorMessage(`options.${option.id}`))
                    }
                    helperText={
                      !option.text.trim() &&
                      (getErrorMessage(`options.${option.id}.text`) || getErrorMessage(`options.${option.id}`))
                    }
                    style={{ flex: 1 }}
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
                    disabled={loading.save || loading.delete}
                    fullWidth
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

                {/* Correct option radio button */}
                <FormControlLabel
                  disabled={loading.save || loading.delete}
                  control={
                    <Radio
                      checked={option.correct}
                      onChange={e => handleOptionChange(index, 'correct', e.target.checked)}
                    />
                  }
                  label={<Typography variant='body2'>Correct</Typography>}
                  style={{ marginLeft: '8px' }}
                />
              </Box>
            ))}
            {hasErrors && !hasExactlyOneCorrectOption && getErrorMessage('options') && (
              <Typography className='text-center' variant='body1' color='error'>
                {getErrorMessage('options')}
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* Hint, Marks, Hint Marks, Skippable, Time in Seconds */}
      <Grid container spacing={2} mt={2} alignItems='start'>
        <Grid item xs={12} className='flex justify-start'>
          <FormControlLabel
            control={<Checkbox checked={addHint} onChange={e => setAddHint(e.target.checked)} />}
            label='Add Hint'
          />
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
                  error={(addHint && hasErrors && !hintMarks && getErrorMessage('hintMarks')) || hintMarks >= marks}
                  helperText={
                    (addHint && !hintMarks && getErrorMessage('hintMarks')) ||
                    (hintMarks >= marks && 'Hint marks cannot exceed question marks')
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
            disabled={loading.save || loading.delete}
            startIcon={<SaveIcon />}
            fullWidth
            variant='outlined'
            color='primary'
            onClick={onSaveQuestion}
          >
            {loading.save ? 'Saving...' : 'Save Q'}
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button
            disabled={loading.save || loading.delete}
            startIcon={<DeleteIcon />}
            fullWidth
            variant='outlined'
            color='error'
            onClick={handleDeleteClick}
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

export default TrueFalseQuestionTemplate
