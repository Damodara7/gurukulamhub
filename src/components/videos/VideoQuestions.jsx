import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import {
  Button,
  Card,
  CardContent,
  IconButton,
  Radio,
  RadioGroup,
  TextField,
  Typography,
  FormControlLabel,
  Checkbox,
  Grid,
  Tooltip,
  Box,
  InputAdornment
} from '@mui/material'
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  QuestionMark as QuestionMarkIcon,
  LiveHelp as LiveHelpIcon
} from '@mui/icons-material'
import ReactPlayer from 'react-player'
import { toast } from 'react-toastify'
import { minValue } from 'valibot'
import IconButtonTooltip from '../IconButtonTooltip'

const InsertedVideoQuestions = forwardRef(
  (
    {
      questions = [],
      onSetQuestions = () => {},
      videoUrl = '',
      currentQuestion,
      setCurrentQuestion,
      currentTime,
      setCurrentTime,
      playerRef,
      videoDuration,
      isQuestionFormOpen,
      editIndex,
      setEditIndex
    },
    ref
  ) => {
    const [errors, setErrors] = useState({}) // Validation errors state

    const initialQuestionState = {
      type: 'single-choice',
      text: '',
      options: [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false }
      ],
      explanation: '',
      marks: 1,
      conceptStartTime: 0,
      invocationTime: 1,
      invocationAtEnd: false
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
      }else if(field === 'conceptStartTime'){
        const parsedTime = parseFloat(value)
        valueToBeSet = parsedTime
      }
      setCurrentQuestion(prev => ({ ...prev, [field]: valueToBeSet }))
      validateField(field, valueToBeSet)
    }

    const handleSetCurrentTime = field => {
      handleInputChange(field, currentTime)
    }

    const handleMakeAsEndQuestion = () => {
      handleInputChange('invocationTime', videoDuration)
      handleInputChange('invocationAtEnd', true)
    }

    // useEffect(() => {
    //   if (currentQuestion?.invocationTime) {
    //     const parsedTime = parseFloat(currentQuestion.invocationTime)
    //     if (!isNaN(parsedTime)) {
    //       setCurrentTime(parsedTime)
    //       playerRef.current?.seekTo(currentQuestion.invocationTime, 'seconds')
    //     }
    //   }
    // }, [currentQuestion?.invocationTime])

    useEffect(() => {
      // For new questions only
      if (currentQuestion && editIndex === null) {
        // While Adding new Question
        setCurrentQuestion(prev => ({
          ...prev,
          invocationTime: currentTime,
          invocationAtEnd: currentTime === videoDuration ? true : false
        }))
      } else if (currentQuestion && editIndex !== null) {
        // While Editing Question
        setCurrentQuestion(prev => ({
          ...prev,
          // invocationTime: currentTime,
          invocationAtEnd: currentTime === videoDuration ? true : false
        }))
      }
    }, [currentTime])

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
          let invocationTimeMsg = ''
          if (!value || isNaN(value)) {
            invocationTimeMsg = 'Invocation time should be a valid number.'
          } else if (value < 0) {
            invocationTimeMsg = 'Invocation time cannot be negative.'
          } else if (value > videoDuration) {
            invocationTimeMsg = 'Invocation time should be less than video length.'
          }
          newErrors.invocationTime = invocationTimeMsg
          if(currentQuestion.conceptStartTime && currentQuestion.conceptStartTime >= value){
            newErrors.conceptStartTime = 'Concept start time should be less than invocation time.'
          }else{
            newErrors.conceptStartTime = '' // Clear the error if concept start time is valid or not provided.
          }
          break
        case 'conceptStartTime':
          let conceptStartTimeMsg = ''
          if ((!value && value !==0 ) || isNaN(value)) {
            conceptStartTimeMsg = 'Concept start time should be a valid number.'
          } else if (value < 0) {
            conceptStartTimeMsg = 'Concept start time cannot be negative.'
          } else if (currentQuestion?.invocationTime && value >= currentQuestion?.invocationTime) {
            conceptStartTimeMsg = 'Concept start time should be less than invocation time.'
          } else if (value > videoDuration - 2) {
            conceptStartTimeMsg = 'Concept start time should be less than video length.'
          }
          newErrors.conceptStartTime = conceptStartTimeMsg
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

    const validateForm = () => {
      const newErrors = {}

      // General form validation
      if (!currentQuestion.text) {
        newErrors.text = 'Question text is required.'
      }
      if (currentQuestion.options.some(option => !option.text)) {
        newErrors.options = 'Option should not be empty.'
      }
      if (!currentQuestion.options.some(option => option.isCorrect)) {
        newErrors.optionsCorrect = 'At least one option must be correct.'
      }
      if (!currentQuestion.explanation) {
        newErrors.explanation = 'Explanation is required.'
      }
      if (!currentQuestion.marks || isNaN(+currentQuestion.marks)) {
        newErrors.marks = 'Marks should be a valid number.'
      }
      if (!currentQuestion.invocationTime.toString().trim() === '' || isNaN(+currentQuestion.invocationTime)) {
        newErrors.invocationTime = 'Invocation time should be a valid number.'
      } else if (currentQuestion.invocationTime <= 0) {
        newErrors.invocationTime = 'Invocation time must be greater than 0.'
      } else if (currentQuestion.conceptStartTime < 0) {
        newErrors.conceptStartTime = 'Concept start time cannot be negative.'
      } else if (currentQuestion.conceptStartTime > videoDuration - 2) {
        newErrors.conceptStartTime = 'Concept start time should be less than video length.'
      } else if (currentQuestion.conceptStartTime >= currentQuestion.invocationTime) {
        newErrors.conceptStartTime = 'Concept start time should be less than invocation time.'
      }

      setErrors(newErrors)

      console.log({ newErrors })

      // Return true if no errors, false if there are errors
      return Object.keys(newErrors).length === 0
    }

    const handleSaveQuestion = () => {
      if (validateForm()) {
        if (currentQuestion) {
          let updatedCurrentQuestion = {
            ...currentQuestion,
            marks: parseFloat(currentQuestion.marks),
            invocationTime: parseFloat(currentQuestion.invocationTime)
          }
          if (editIndex !== null) {
            updatedCurrentQuestion = { ...updatedCurrentQuestion, updatedAt: new Date() }
            // just send value
            onSetQuestions(questions.map((q, i) => (i === editIndex ? updatedCurrentQuestion : q)))
          } else {
            updatedCurrentQuestion = { ...updatedCurrentQuestion, createdAt: new Date() }
            onSetQuestions([...questions, updatedCurrentQuestion])
          }
          setCurrentQuestion(null)
          setEditIndex(null)
        }
      }
    }

    const handleEditQuestion = index => {
      const currentEditingQuestion = { ...questions[index] }
      setCurrentQuestion(currentEditingQuestion)
      setCurrentTime(currentEditingQuestion.invocationTime)
      playerRef.current?.seekTo(currentEditingQuestion.invocationTime, 'seconds')
      setEditIndex(index)
    }

    const handleRemoveQuestion = index => {
      onSetQuestions(questions.filter((_, i) => i !== index))
    }

    const handleCancelQuestion = () => {
      setCurrentQuestion(null)
      setErrors({})
    }

    // Prevent duplicate invocation times
    const handleStartAddQuestion = () => {
      // if (questions.some(q => +q.invocationTime === currentTime)) {
      //   toast.error('A question is already set for this time. Please choose another.')
      //   return
      // }

      setCurrentQuestion({
        ...initialQuestionState,
        invocationTime: currentTime
      })
      setErrors({})
      setEditIndex(null)
    }

    // Expose the function to the parent using useImperativeHandle
    useImperativeHandle(ref, () => ({
      executeStartAddQuestion: handleStartAddQuestion
    }))

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

    return (
      <div>
        <Typography my={2} variant='h5'>
          In-video Questions : <span style={{ fontWeight: '400', fontSize: '15px' }}>(Optional)</span>
        </Typography>

        {currentQuestion && isQuestionFormOpen && (
          <div
            style={{
              border: '2px solid #1976d2',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '15px',
              position: 'relative'
            }}
          >
            <IconButtonTooltip title='Close' onClick={handleCancelQuestion} className='absolute block-start-4 inline-end-4'>
              <i className='ri-close-line text-textSecondary' />
            </IconButtonTooltip>
            {/* Title indicating if editing */}
            <Typography variant='h5' style={{ marginBottom: '20px', textAlign: 'center' }}>
              {editIndex !== null ? 'Edit Question' : 'New Question'}
            </Typography>
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
              required
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
                  required
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

            <Grid container spacing={2}>
              <Grid item xs={3}>
                <TextField
                  label='Marks'
                  type='number'
                  value={currentQuestion.marks}
                  onChange={e => handleInputChange('marks', e.target.value)}
                  margin='dense'
                  required
                  fullWidth
                  error={!!errors.marks}
                  helperText={errors.marks}
                />
              </Grid>
              <Grid item xs={9}>
                <TextField
                  label='Answer Explanation'
                  value={currentQuestion.explanation}
                  onChange={e => handleInputChange('explanation', e.target.value)}
                  fullWidth
                  margin='dense'
                  required
                  error={!!errors.explanation}
                  helperText={errors.explanation}
                />
              </Grid>
            </Grid>

            <TextField
              label='Invocation Time (seconds)'
              type='number'
              value={currentQuestion.invocationTime}
              onChange={e => handleInputChange('invocationTime', e.target.value)}
              margin='dense'
              required
              fullWidth
              error={!!errors.invocationTime}
              helperText={errors.invocationTime}
              InputProps={{
                // For editing questions only
                endAdornment: editIndex !== null && (
                  <>
                    {currentTime !== currentQuestion.invocationTime && (
                      <InputAdornment position='end'>
                        <Button
                          variant='contained'
                          color='primary'
                          component='label'
                          sx={{ color: '#ffffff !important' }}
                          size='small'
                          onClick={() => handleSetCurrentTime('invocationTime')}
                        >
                          Set Current Time({currentTime}s)
                        </Button>
                      </InputAdornment>
                    )}
                    {!currentQuestion.invocationAtEnd && currentTime !== videoDuration && (
                      <InputAdornment position='end'>
                        <Button
                          variant='contained'
                          color='primary'
                          component='label'
                          sx={{ color: '#ffffff !important' }}
                          size='small'
                          onClick={() => handleMakeAsEndQuestion()}
                        >
                          Change to End Question
                        </Button>
                      </InputAdornment>
                    )}
                  </>
                )
              }}
            />

            <TextField
              label='Question Concept Start Time (seconds)'
              // placeholder='If not specified'
              type='number'
              required
              value={currentQuestion.conceptStartTime}
              onChange={e => handleInputChange('conceptStartTime', e.target.value)}
              margin='dense'
              fullWidth
              error={!!errors.conceptStartTime}
              helperText={errors.conceptStartTime}
              InputLabelProps={{ shrink: true }}
              inputProps={{
                min: 0,
                max: videoDuration - 2
              }}
              InputProps={{
                // For editing questions only
                endAdornment: currentTime !== currentQuestion.conceptStartTime && editIndex !== null && (
                  <InputAdornment position='end'>
                    <Button
                      variant='contained'
                      color='primary'
                      component='label'
                      sx={{ color: '#ffffff !important' }}
                      size='small'
                      onClick={() => handleSetCurrentTime('conceptStartTime')}
                    >
                      Set Current Time({currentTime}s)
                    </Button>
                  </InputAdornment>
                )
              }}
            />

            <div className='flex justify-end items-center gap-2 mt-2'>
              <Button variant='outlined' onClick={handleCancelQuestion}>
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
          </div>
        )}

        {questions.length === 0 ? (
          <div style={{ padding: '16px', textAlign: 'center', border: '1px solid #ddd', borderRadius: '4px' }}>
            <Typography variant='body1' color='textSecondary'>
              No questions added yet.
            </Typography>
          </div>
        ) : (
          <div
            style={{
              maxHeight: '250px', // Set a height limit for visibility
              overflowY: 'auto', // Enable vertical scrolling
              paddingRight: '8px' // Prevent scrollbar from covering content
            }}
          >
            {questions.map((question, index) => (
              <Card
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                  // padding: '8px',
                  border: currentQuestion && index === editIndex ? '2px solid #1976d2' : '1px solid #ddd',
                  // cursor: currentQuestion ? 'not-allowed' : 'pointer', // Disable cursor if currentQuestion exists
                  pointerEvents: currentQuestion ? 'none' : 'auto' // Disable interactions if currentQuestion exists
                }}
                // onClick={() => handleEditQuestion(index)}
              >
                <CardContent>
                  <Typography color='primary' variant='subtitle1'>{`Q${index + 1}: ${question.text}`}</Typography>
                  <Typography variant='body2' color='textSecondary'>
                    <span style={{ fontWeight: 'bold' }}>Type: </span>
                    {question.type}
                  </Typography>

                  <Typography variant='body2' color='textSecondary'>
                    <span style={{ fontWeight: 'bold' }}>Invocation Time: </span>At {question.invocationTime} sec
                  </Typography>
                </CardContent>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <IconButtonTooltip title='Edit'
                    onClick={() => handleEditQuestion(index)}
                    color='primary'
                    disabled={isQuestionFormOpen} // Disable the button if currentQuestion exists
                  >
                    <EditIcon />
                  </IconButtonTooltip>
                  <IconButtonTooltip title='Remove'
                    onClick={() => handleRemoveQuestion(index)}
                    color='error'
                    disabled={isQuestionFormOpen} // Disable the button if currentQuestion exists
                  >
                    <DeleteIcon />
                  </IconButtonTooltip>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  }
)
const EndVideoQuestions = forwardRef(
  (
    {
      questions = [],
      onSetQuestions = () => {},
      videoUrl = '',
      currentQuestion,
      setCurrentQuestion,
      currentTime,
      setCurrentTime,
      videoDuration,
      isQuestionFormOpen,
      editIndex,
      setEditIndex
    },
    ref
  ) => {
    const [errors, setErrors] = useState({}) // Validation errors state

    const initialQuestionState = {
      type: 'single-choice',
      text: '',
      options: [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false }
      ],
      explanation: '',
      marks: 1,
      conceptStartTime: 0,
      invocationTime: '',
      invocationAtEnd: true
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
        }
      } else if (field === 'marks') {
        const parsedTime = parseFloat(value)
        valueToBeSet = parsedTime
      }else if(field === 'conceptStartTime'){
        const parsedTime = parseFloat(value)
        valueToBeSet = parsedTime
      }
      setCurrentQuestion(prev => ({ ...prev, [field]: valueToBeSet }))
      validateField(field, valueToBeSet)
    }

    const handleSetCurrentTime = field => {
      handleInputChange(field, currentTime)
    }

    const handleMakeAsInsertedQuestion = () => {
      handleInputChange('invocationTime', currentTime)
      handleInputChange('invocationAtEnd', false)
    }

    // useEffect(() => {
    //   if (currentQuestion?.invocationTime) {
    //     const parsedTime = parseFloat(currentQuestion.invocationTime)
    //     if (!isNaN(parsedTime)) {
    //       setCurrentTime(parsedTime)
    //     }
    //   }
    // }, [currentQuestion?.invocationTime])

    // useEffect(() => {
    //   if (currentQuestion && editIndex === null) {
    //     setCurrentQuestion(prev => ({
    //       ...prev,
    //       invocationTime: currentTime
    //     }))
    //   }
    // }, [currentTime])

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
          let invocationTimeMsg = ''
          if (!value || isNaN(value)) {
            invocationTimeMsg = 'Invocation time should be a valid number.'
          } else if (value < 0) {
            invocationTimeMsg = 'Invocation time cannot be negative.'
          } else if (value > videoDuration) {
            invocationTimeMsg = 'Invocation time should be less than video length.'
          }
          newErrors.invocationTime = invocationTimeMsg
          if(currentQuestion.conceptStartTime && currentQuestion.conceptStartTime >= value){
            newErrors.conceptStartTime = 'Concept start time should be less than invocation time.'
          }else{
            newErrors.conceptStartTime = '' // Clear the error if concept start time is valid or not provided.
          }
          break
        case 'conceptStartTime':
          let conceptStartTimeMsg = ''
          if ((!value && value !==0 ) || isNaN(value)) {
            conceptStartTimeMsg = 'Concept start time should be a valid number.'
          } else if (value < 0) {
            conceptStartTimeMsg = 'Concept start time cannot be negative.'
          } else if (currentQuestion?.invocationTime && value >= currentQuestion?.invocationTime) {
            conceptStartTimeMsg = 'Concept start time should be less than invocation time.'
          } else if (value > videoDuration - 2) {
            conceptStartTimeMsg = 'Concept start time should be less than video length.'
          }
          newErrors.conceptStartTime = conceptStartTimeMsg
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

    const validateForm = () => {
      const newErrors = {}

      // General form validation
      if (!currentQuestion.text) {
        newErrors.text = 'Question text is required.'
      }
      if (currentQuestion.options.some(option => !option.text)) {
        newErrors.options = 'Option should not be empty.'
      }
      if (!currentQuestion.options.some(option => option.isCorrect)) {
        newErrors.optionsCorrect = 'At least one option must be correct.'
      }
      if (!currentQuestion.explanation) {
        newErrors.explanation = 'Explanation is required.'
      }
      if (!currentQuestion.marks || isNaN(+currentQuestion.marks)) {
        newErrors.marks = 'Marks should be a valid number.'
      }
      if (!currentQuestion.invocationTime.toString().trim() === '' || isNaN(+currentQuestion.invocationTime)) {
        newErrors.invocationTime = 'Invocation time should be a valid number.'
      } else if (currentQuestion.invocationTime <= 0) {
        newErrors.invocationTime = 'Invocation time must be greater than 0.'
      } else if (currentQuestion.conceptStartTime < 0) {
        newErrors.conceptStartTime = 'Concept start time cannot be negative.'
      } else if (currentQuestion.conceptStartTime > videoDuration - 2) {
        newErrors.conceptStartTime = 'Concept start time should be less than video length.'
      } else if (currentQuestion.conceptStartTime >= currentQuestion.invocationTime) {
        newErrors.conceptStartTime = 'Concept start time should be less than invocation time.'
      }

      setErrors(newErrors)

      console.log({ newErrors })

      // Return true if no errors, false if there are errors
      return Object.keys(newErrors).length === 0
    }

    const handleSaveQuestion = () => {
      if (validateForm()) {
        if (currentQuestion) {
          let updatedCurrentQuestion = {
            ...currentQuestion,
            marks: parseFloat(currentQuestion.marks),
            invocationTime: parseFloat(currentQuestion.invocationTime)
          }
          if (editIndex !== null) {
            updatedCurrentQuestion = { ...updatedCurrentQuestion, updatedAt: new Date() }
            // just send value
            onSetQuestions(questions.map((q, i) => (i === editIndex ? updatedCurrentQuestion : q)))
          } else {
            updatedCurrentQuestion = { ...updatedCurrentQuestion, createdAt: new Date() }
            onSetQuestions([...questions, updatedCurrentQuestion])
          }
          setCurrentQuestion(null)
          setEditIndex(null)
        }
      }
    }

    const handleEditQuestion = index => {
      setCurrentQuestion({ ...questions[index] })
      setEditIndex(index)
    }

    const handleRemoveQuestion = index => {
      onSetQuestions(questions.filter((_, i) => i !== index))
    }

    const handleCancelQuestion = () => {
      setCurrentQuestion(null)
      setErrors({})
    }

    // Prevent duplicate invocation times
    const handleStartAddQuestion = () => {
      // if (questions.some(q => +q.invocationTime === currentTime)) {
      //   toast.error('A question is already set for this time. Please choose another.')
      //   return
      // }
      const endTime = videoDuration

      setCurrentQuestion({
        ...initialQuestionState,
        invocationTime: endTime
      })
      setErrors({})
      setEditIndex(null)
    }

    // Expose the function to the parent using useImperativeHandle
    useImperativeHandle(ref, () => ({
      executeStartAddQuestion: handleStartAddQuestion
    }))

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

    return (
      <div>
        <Typography my={2} variant='h5'>
          End-of-video Questions : <span style={{ fontWeight: '400', fontSize: '15px' }}>(Optional)</span>
        </Typography>

        {currentQuestion && isQuestionFormOpen && (
          <div
            style={{
              border: '2px solid #1976d2',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '15px',
              position: 'relative'
            }}
          >
            <IconButtonTooltip title='Cancel' onClick={handleCancelQuestion} className='absolute block-start-4 inline-end-4'>
              <i className='ri-close-line text-textSecondary' />
            </IconButtonTooltip>
            {/* Title indicating if editing */}
            <Typography variant='h5' style={{ marginBottom: '20px', textAlign: 'center' }}>
              {editIndex !== null ? 'Edit Question' : 'New Question'}
            </Typography>
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
              required
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
                  required
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

            <Grid container spacing={2}>
              <Grid item xs={3}>
                <TextField
                  label='Marks'
                  type='number'
                  value={currentQuestion.marks}
                  onChange={e => handleInputChange('marks', e.target.value)}
                  margin='dense'
                  required
                  fullWidth
                  error={!!errors.marks}
                  helperText={errors.marks}
                />
              </Grid>
              <Grid item xs={9}>
                <TextField
                  label='Answer Explanation'
                  value={currentQuestion.explanation}
                  onChange={e => handleInputChange('explanation', e.target.value)}
                  fullWidth
                  margin='dense'
                  required
                  error={!!errors.explanation}
                  helperText={errors.explanation}
                />
              </Grid>
            </Grid>

            <TextField
              label='Invocation Time (seconds)'
              type='number'
              required
              value={currentQuestion.invocationTime}
              onChange={e => handleInputChange('invocationTime', e.target.value)}
              margin='dense'
              fullWidth
              error={!!errors.invocationTime}
              helperText={errors.invocationTime}
              InputProps={{
                readOnly: true,
                // For editing questions only
                endAdornment: currentTime !== currentQuestion.invocationTime && editIndex !== null && (
                  <InputAdornment position='end'>
                    <Button
                      variant='contained'
                      color='primary'
                      component='label'
                      sx={{ color: '#ffffff !important' }}
                      size='small'
                      onClick={() => handleMakeAsInsertedQuestion()}
                    >
                      Change to In-video Question at({currentTime}s)
                    </Button>
                  </InputAdornment>
                )
              }}
            />

            <TextField
              label='Question Concept Start Time (seconds)'
              // placeholder='If not specified'
              type='number'
              required
              value={currentQuestion.conceptStartTime}
              onChange={e => handleInputChange('conceptStartTime', e.target.value)}
              margin='dense'
              fullWidth
              error={!!errors.conceptStartTime}
              helperText={errors.conceptStartTime}
              InputLabelProps={{ shrink: true }}
              inputProps={{
                min: 0,
                max: videoDuration - 2
              }}
              InputProps={{
                // For editing questions only
                endAdornment: currentTime !== currentQuestion.conceptStartTime && editIndex !== null && (
                  <InputAdornment position='end'>
                    <Button
                      variant='contained'
                      color='primary'
                      component='label'
                      sx={{ color: '#ffffff !important' }}
                      size='small'
                      onClick={() => handleSetCurrentTime('conceptStartTime')}
                    >
                      Set Current Time({currentTime}s)
                    </Button>
                  </InputAdornment>
                )
              }}
            />

            <div className='flex justify-end items-center gap-2 mt-2'>
              <Button variant='outlined' onClick={handleCancelQuestion}>
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
          </div>
        )}

        {questions.length === 0 ? (
          <div style={{ padding: '16px', textAlign: 'center', border: '1px solid #ddd', borderRadius: '4px' }}>
            <Typography variant='body1' color='textSecondary'>
              No questions added yet.
            </Typography>
          </div>
        ) : (
          <div
            style={{
              maxHeight: '250px', // Set a height limit for visibility
              overflowY: 'auto', // Enable vertical scrolling
              paddingRight: '8px' // Prevent scrollbar from covering content
            }}
          >
            {questions.map((question, index) => (
              <Card
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                  // padding: '8px',
                  border: currentQuestion && index === editIndex ? '2px solid #1976d2' : '1px solid #ddd',
                  // cursor: currentQuestion ? 'not-allowed' : 'pointer', // Disable cursor if currentQuestion exists
                  pointerEvents: currentQuestion ? 'none' : 'auto' // Disable interactions if currentQuestion exists
                }}
                // onClick={() => handleEditQuestion(index)}
              >
                <CardContent>
                  <Typography color='primary' variant='subtitle1'>{`Q${index + 1}: ${question.text}`}</Typography>
                  <Typography variant='body2' color='textSecondary'>
                    <span style={{ fontWeight: 'bold' }}>Type: </span>
                    {question.type}
                  </Typography>

                  <Typography variant='body2' color='textSecondary'>
                    <span style={{ fontWeight: 'bold' }}>Invocation Time: </span>End of the video
                  </Typography>
                </CardContent>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <IconButtonTooltip title='Edit'
                    onClick={() => handleEditQuestion(index)}
                    color='primary'
                    disabled={isQuestionFormOpen} // Disable the button if currentQuestion exists
                  >
                    <EditIcon />
                  </IconButtonTooltip>
                  <IconButtonTooltip title='Remove'
                    onClick={() => handleRemoveQuestion(index)}
                    color='error'
                    disabled={isQuestionFormOpen} // Disable the button if currentQuestion exists
                  >
                    <DeleteIcon />
                  </IconButtonTooltip>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  }
)

const VideoQuestions = ({
  questions = [],
  onSetQuestions = () => {},
  videoUrl = '',
  setIsQuestionFormOpen = () => {},
  videoDuration = 0,
  setVideoDuration = () => {}
}) => {
  const [currentInsertedQuestion, setCurrentInsertedQuestion] = useState(null)
  const [currentEndQuestion, setCurrentEndQuestion] = useState(null)
  const [insertedQuestionEditIndex, setInsertedQuestionEditIndex] = useState(null)
  const [endQuestionEditIndex, setEndQuestionEditIndex] = useState(null)

  const [currentTime, setCurrentTime] = useState(0)
  const playerRef = useRef(null)

  const insertedQuestionsRef = useRef(null)
  const endQuestionsRef = useRef(null)

  const insertedQuestions = questions.filter((q, index) => !q.invocationAtEnd)
  const endQuestions = questions.filter((q, index) => q.invocationAtEnd)

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

  const onSetQuestionsByInsertedQuestions = modifiedInsertedQuestions => {
    onSetQuestions([...endQuestions, ...modifiedInsertedQuestions])
  }
  const onSetQuestionsByEndQuestions = modifiedEndQuestions => {
    onSetQuestions([...insertedQuestions, ...modifiedEndQuestions])
  }

  // Render question icons on the video progress bar with time mentioned
  const renderMarkers = () => {
    const duration = videoDuration

    // Sort questions based on their createdAt time to maintain the order
    const sortedQuestions = [...insertedQuestions].sort((a, b) => a.createdAt - b.createdAt)

    return sortedQuestions.map((question, index) => {
      const position = (question.invocationTime / duration) * 100
      const overlapOffset = sortedQuestions.filter(q => q.invocationTime === question.invocationTime).indexOf(question) // Determine if there are overlapping questions at the same invocation time
      const diagonalOffset = overlapOffset * 20 // Adjust the offset for diagonal positioning

      return (
        <Tooltip key={index} title={`Q${index + 1}: ${question.text} (At ${question.invocationTime}s)`} placement='top'>
          <div
            style={{
              position: 'absolute',
              left: `${position}%`,
              // transform: 'translateX(-50%)',
              bottom: `${8 + diagonalOffset}px`, // Adjust the vertical positioning for overlapping markers
              cursor: 'pointer',
              zIndex: 0
            }}
          >
            <LiveHelpIcon
              color='primary'
              sx={{ color: 'white' }}
              onClick={() => {
                playerRef.current?.seekTo(question.invocationTime, 'seconds') // Seek to the question time on click
                setCurrentInsertedQuestion(question)
                setCurrentEndQuestion(null) // Clear currentEndQuestion
                setInsertedQuestionEditIndex(index)
                setEndQuestionEditIndex(null) // Clear endQuestionEditIndex
              }}
            />
          </div>
        </Tooltip>
      )
    })
  }

  const handleStartAddInsertedQuestionClick = () => {
    if (insertedQuestionsRef.current) {
      insertedQuestionsRef.current.executeStartAddQuestion() // Call the childe function
    }
  }

  const handleStartAddEndQuestionClick = () => {
    if (endQuestionsRef.current) {
      endQuestionsRef.current.executeStartAddQuestion() // Call the childe function
    }
  }

  const isQuestionFormOpen = currentInsertedQuestion || currentEndQuestion

  useEffect(() => {
    setIsQuestionFormOpen(isQuestionFormOpen)
  }, [isQuestionFormOpen])

  return (
    <div>
      <div style={{ position: 'relative', marginBottom: '10px' }}>
        <ReactPlayer
          ref={playerRef}
          url={videoUrl}
          controls
          width='100%'
          height='250px'
          onReady={handleVideoReady} // Fetch duration on load
          onProgress={({ playedSeconds }) => {
            setCurrentTime(Math.floor(playedSeconds))
          }}
        />

        {/* Custom Track Markers */}
        <Box
          sx={{
            position: 'absolute',
            height: '5px',
            left: '11px',
            right: '11px',
            bottom: '35px'
            // background: 'white'
          }}
        >
          {renderMarkers()}
        </Box>
      </div>
      <Grid container spacing={4}>
        <Grid item sm={12} md={6}>
          <Button
            variant='contained'
            color='primary'
            component='label'
            fullWidth
            onClick={handleStartAddInsertedQuestionClick}
            sx={{ color: 'white' }}
            disabled={!!isQuestionFormOpen}
          >
            Insert Question
          </Button>
        </Grid>
        <Grid item sm={12} md={6}>
          <Button
            variant='contained'
            color='primary'
            component='label'
            fullWidth
            onClick={handleStartAddEndQuestionClick}
            sx={{ color: 'white' }}
            disabled={!!isQuestionFormOpen}
          >
            Add Question At Video End
          </Button>
        </Grid>
      </Grid>
      <InsertedVideoQuestions
        questions={insertedQuestions}
        onSetQuestions={onSetQuestionsByInsertedQuestions}
        videoUrl={videoUrl}
        currentQuestion={currentInsertedQuestion}
        setCurrentQuestion={setCurrentInsertedQuestion}
        currentTime={currentTime}
        setCurrentTime={setCurrentTime}
        videoDuration={videoDuration}
        playerRef={playerRef}
        editIndex={insertedQuestionEditIndex}
        setEditIndex={setInsertedQuestionEditIndex}
        isQuestionFormOpen={isQuestionFormOpen}
        ref={insertedQuestionsRef}
      />
      <EndVideoQuestions
        questions={endQuestions}
        onSetQuestions={onSetQuestionsByEndQuestions}
        videoUrl={videoUrl}
        currentQuestion={currentEndQuestion}
        setCurrentQuestion={setCurrentEndQuestion}
        currentTime={currentTime}
        setCurrentTime={setCurrentTime}
        videoDuration={videoDuration}
        editIndex={endQuestionEditIndex}
        setEditIndex={setEndQuestionEditIndex}
        isQuestionFormOpen={isQuestionFormOpen}
        ref={endQuestionsRef}
      />
    </div>
  )
}

export default VideoQuestions
