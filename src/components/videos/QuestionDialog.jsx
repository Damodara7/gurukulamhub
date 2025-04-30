import React, { useEffect, useRef, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Checkbox,
  IconButton,
  Button,
  Grid,
  Box,
  Tooltip
} from '@mui/material'
import IconButtonTooltip from '@/components/IconButtonTooltip'
import { Add as AddIcon, Remove as RemoveIcon, LiveHelp as LiveHelpIcon } from '@mui/icons-material'
import ReactPlayer from 'react-player'

function QuestionDialog({
  open,
  onClose,
  handleSaveQuestion,
  currentQuestion,
  setCurrentQuestion,
  errors,
  setErrors,
  editIndex,
  videoUrl,
  questions,
  initialQuestionState
}) {
  const [currentTime, setCurrentTime] = useState(0)
  const playerRef = useRef(null)
  const [videoDuration, setVideoDuration] = useState(0)

  useEffect(() => {
    // Log the duration on load for debugging purposes
    if (videoDuration > 0) {
      console.log(`Video Duration: ${videoDuration}s`)
    }
  }, [videoDuration])

  const handleVideoReady = () => {
    const duration = playerRef.current?.getDuration() || 0
    setVideoDuration(duration)
  }

  const handleAddOption = () => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: [...prev.options, { text: '', isCorrect: false }]
    }))
  }

  const handleRemoveOption = index => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }))
  }

  const handleOptionChange = (index, value) => {
    setCurrentQuestion(prev => {
      const updatedOptions = [...prev.options]
      updatedOptions[index].text = value
      return { ...prev, options: updatedOptions }
    })
    validateOption(index, value) // Validate when option text is changed
  }

  const handleOptionCorrectChange = (index, isCorrect) => {
    setCurrentQuestion(prev => {
      const updatedOptions = prev.options.map((option, i) =>
        prev.type === 'single-choice'
          ? { ...option, isCorrect: i === index ? isCorrect : false }
          : { ...option, isCorrect: i === index ? isCorrect : option.isCorrect }
      )
      return { ...prev, options: updatedOptions }
    })
  }

  const handleInputChange = (field, value) => {
    let valueToBeSet = value

    // Sync currentTime with invocationTime
    if (field === 'invocationTime') {
      const parsedTime = parseFloat(value)
      valueToBeSet = parsedTime
      if (!isNaN(parsedTime)) {
        setCurrentTime(parsedTime)
        playerRef.current?.seekTo(parsedTime, 'seconds')
      }
    } else if (field === 'marks') {
      const parsedTime = parseFloat(value)
      valueToBeSet = parsedTime
      if (!isNaN(valueToBeSet)) {
        setCurrentQuestion(prev => ({ ...prev, marks: parsedTime }))
      }
    }
    setCurrentQuestion(prev => ({ ...prev, [field]: valueToBeSet }))
    validateField(field, value)
  }

  const validateField = (field, value) => {
    const newErrors = { ...errors }

    switch (field) {
      case 'text':
        newErrors.text = value ? '' : 'Question text is required.'
        break
      case 'explanation':
        newErrors.explanation = value ? '' : 'Explanation is required.'
        break
      case 'marks':
        newErrors.marks = value && !isNaN(value) ? '' : 'Marks should be a valid number.'
        break
      case 'invocationTime':
        newErrors.invocationTime = value && !isNaN(value) ? '' : 'Invocation time should be a valid number.'
        break
      default:
        break
    }

    setErrors(newErrors)
  }

  const validateOption = (index, value) => {
    const newErrors = { ...errors }

    // Check if all options have text
    if (value.trim() === '') {
      newErrors.options = 'All options must have text.'
    }

    // Check if at least one option is correct
    if (!currentQuestion.options.some(option => option.isCorrect)) {
      newErrors.optionsCorrect = 'At least one option must be correct.'
    } else {
      newErrors.optionsCorrect = '' // Clear the error if an option is marked correct
    }

    setErrors(newErrors)
  }

  useEffect(() => {
    if (currentQuestion) {
      setCurrentQuestion(prev => ({
        ...prev,
        invocationTime: currentTime
      }))
    }
  }, [currentTime])
  
  useEffect(() => {
    if (editIndex !== null && currentQuestion?.invocationTime) {
      const parsedTime = parseFloat(currentQuestion.invocationTime)
      if (!isNaN(parsedTime)) {
        setCurrentTime(parsedTime)
        playerRef.current?.seekTo(parsedTime, 'seconds') // Seek to the saved invocation time
      }
    }
  }, [editIndex, currentQuestion?.invocationTime])

  const questionType = currentQuestion?.type || initialQuestionState.type

  // Changing the options if question type changes
  useEffect(() => {
    if (currentQuestion && editIndex === null) {
      setCurrentQuestion(prev => ({ ...prev, options: initialQuestionState.options }))
    } else if (currentQuestion && editIndex !== null) {
      let options = initialQuestionState.options
      const selectedQuestion = questions.find((q, index) => index === editIndex)
      if (selectedQuestion && selectedQuestion.type === questionType) {
        options = selectedQuestion.options
      }
      setCurrentQuestion(prev => ({ ...prev, options: options }))
    }
  }, [questionType])

  // Render question icons on the video progress bar with time mentioned
  const renderMarkers = () => {
    const duration = videoDuration

    return questions.map((question, index) => {
      const position = (question.invocationTime / duration) * 100

      return (
        <Tooltip key={index} title={`Q${index + 1}: ${question.text} (At ${question.invocationTime}s)`} placement='top'>
          <div
            style={{
              position: 'absolute',
              left: `${position}%`,
              transform: 'translateX(-50%)',
              bottom: '5px',
              cursor: 'pointer'
            }}
            onClick={() => {
              playerRef.current?.seekTo(question.invocationTime, 'seconds') // Seek to the question time on click
              //   setCurrentQuestion(question)
              //   setEditIndex(index)
            }}
          >
            <LiveHelpIcon color='primary' sx={{ color: 'white' }} />
          </div>
        </Tooltip>
      )
    })
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle
        variant='h4'
        className='flex flex-col gap-1 text-center pbs-10 pbe-6 pli-10 sm:pbs-16 sm:pbe-6 sm:pli-16'
      >
        {editIndex !== null ? 'Edit Question' : 'New Question'}
        <Typography component='span' className='flex flex-col text-center'>
          {editIndex !== null
            ? 'Edit question as per your requirements.'
            : 'Add question to popup while video is playing.'}
        </Typography>
      </DialogTitle>
      <DialogContent className='overflow-visible pbs-0 pbe-6 pli-10 sm:pli-16'>
        <IconButtonTooltip title='Close' onClick={onClose} className='absolute block-start-4 inline-end-4'>
          <i className='ri-close-line text-textSecondary' />
        </IconButtonTooltip>

        <div style={{ position: 'relative', marginBottom: '10px' }}>
          <ReactPlayer
            ref={playerRef}
            url={videoUrl}
            controls
            width='100%'
            height='200px'
            onReady={handleVideoReady} // Fetch duration on load
            onProgress={({ playedSeconds }) => {
              setCurrentTime(Math.floor(playedSeconds))
              // setCurrentQuestion(null)
            }}
          />

          {/* Custom Track Markers */}
          <Box
            sx={{
              position: 'absolute',
              height: '5px',
              left: '11px',
              right: '11px',
              bottom: '35px',
              background: 'transparent'
            }}
          >
            {renderMarkers()}
          </Box>
        </div>

        <RadioGroup row value={currentQuestion.type} onChange={e => handleInputChange('type', e.target.value)}>
          <FormControlLabel value='single-choice' control={<Radio />} label='Single Choice' />
          <FormControlLabel value='multiple-choice' control={<Radio />} label='Multiple Choice' />
        </RadioGroup>

        <TextField
          label='Question Text'
          value={currentQuestion.text}
          onChange={e => handleInputChange('text', e.target.value)}
          fullWidth
          margin='dense'
          error={!!errors.text}
          helperText={errors.text}
        />

        {currentQuestion.options.map((option, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <TextField
              label={`Option ${index + 1}`}
              value={option.text}
              onChange={e => handleOptionChange(index, e.target.value)}
              style={{ flexGrow: 1, marginRight: '8px' }}
              margin='dense'
              error={errors.options && !option.text.trim()}
              helperText={errors.options && !option.text.trim() ? errors.options : ''}
            />
            {currentQuestion.type === 'single-choice' ? (
              <FormControlLabel
                control={
                  <Radio
                    checked={option.isCorrect}
                    onChange={e => handleOptionCorrectChange(index, e.target.checked)}
                  />
                }
                label='Correct'
              />
            ) : (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={option.isCorrect}
                    onChange={e => handleOptionCorrectChange(index, e.target.checked)}
                  />
                }
                label='Correct'
              />
            )}

            <IconButtonTooltip title='Remove' disabled={index === 0} onClick={() => handleRemoveOption(index)}>
              <RemoveIcon />
            </IconButtonTooltip>
          </div>
        ))}

        {/* Display error below the options */}
        {errors.optionsCorrect && (
          <Typography className='text-right' color='error' variant='body2' style={{ marginTop: '8px' }}>
            {errors.optionsCorrect}
          </Typography>
        )}

        <Button onClick={handleAddOption} startIcon={<AddIcon />} style={{ marginBottom: '16px' }}>
          Add Option
        </Button>

        <TextField
          label='Answer Explanation'
          value={currentQuestion.explanation}
          onChange={e => handleInputChange('explanation', e.target.value)}
          fullWidth
          margin='dense'
          error={!!errors.explanation}
          helperText={errors.explanation}
        />

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              label='Marks'
              type='number'
              value={currentQuestion.marks}
              onChange={e => handleInputChange('marks', e.target.value)}
              margin='dense'
              fullWidth
              error={!!errors.marks}
              helperText={errors.marks}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label='Invocation Time (seconds)'
              type='number'
              value={currentQuestion.invocationTime}
              onChange={e => handleInputChange('invocationTime', e.target.value)}
              margin='dense'
              fullWidth
              error={!!errors.invocationTime}
              helperText={errors.invocationTime}
            />
          </Grid>
        </Grid>

        <div className='flex justify-end items-center gap-2 mt-2'>
          <Button variant='outlined' onClick={onClose}>
            Cancel
          </Button>
          <Button
            component='label'
            sx={{ color: 'white' }}
            variant='contained'
            color='primary'
            onClick={handleSaveQuestion}
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default QuestionDialog
