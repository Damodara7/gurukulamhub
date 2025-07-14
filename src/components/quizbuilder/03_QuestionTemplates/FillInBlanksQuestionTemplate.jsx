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
  Checkbox
} from '@mui/material'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle'
import SaveIcon from '@mui/icons-material/Save'
import DeleteIcon from '@mui/icons-material/Delete'

import DeleteConfirmationDialog from '@/components/dialogs/DeleteConfirmationDialog'
import { toast } from 'react-toastify'
import IconButtonTooltip from '@/components/IconButtonTooltip'
import { blankRegex, textRegex, filterInput, excludeBlankChars, excludesTextChars } from '@/utils/regexUtil'

const FillInBlanksQuestionTemplate = ({
  id: questionUUID,
  data,
  mode = 'primary',
  primaryQuestion = null,
  saveQuestion,
  deleteQuestion,
  validationErrors = []
}) => {
  const innerData = data?.data
  const [id, setId] = useState(questionUUID)
  const [language, setLanguage] = useState(data?.language)
  const [status, setStatus] = useState(innerData?.status || 'draft')
  const [hint, setHint] = useState(innerData?.hint || '')
  const [hintMarks, setHintMarks] = useState(innerData?.hintMarks || '')
  const [marks, setMarks] = useState(innerData?.marks || '')
  const [timerSeconds, setTimerSeconds] = useState(innerData?.timerSeconds || '')
  const [skippable, setSkippable] = useState(innerData?.skippable || false) // by default non-skippable
  const [addHint, setAddHint] = useState(false)
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
        hintMarks: -parseInt(hintMarks),
        marks: +marks,
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
      filterValue = filterInput(value , excludeBlankChars)
    } else if (type === 'text') {
      filterValue = filterInput(value , excludesTextChars)
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

  const hasAtleastOneBlank = questionParts.filter(p => p.type === 'blank').length >= 1 || false
  const hasAtleastOneText = questionParts.filter(p => p.type === 'text').length >= 1 || false

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
        <Grid item xs={12}>
          <Typography variant='h4' gutterBottom>
            Create Fill-in-the-Blanks Question
          </Typography>

          <Box
            sx={{
              display: 'flex',
              //   flexWrap: "wrap",
              flexDirection: 'column',
              gap: 2,
              mb: 3,
              border: '1px dashed gray',
              borderRadius: '8px',
              p: 2
            }}
          >
            {questionParts.map(part => (
              <Box
                key={part.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  backgroundColor: '#f9f9f9',
                  p: 1,
                  borderRadius: '4px'
                }}
              >
                {part.type === 'text' ? (
                  <TextField
                    fullWidth
                    variant='outlined'
                    placeholder='Enter text'
                    value={part.content}
                    error={hasErrors && !part.content.trim() && getErrorMessage(`question.${part.id}.content`)}
                    helperText={!part.content.trim() && <span>{getErrorMessage(`question.${part.id}.content`)}</span>}
                    onChange={e => handlePartChange(part.id, part.type, e.target.value)}
                  />
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <InputBase
                      placeholder='Blank'
                      fullWidth
                      value={part.content}
                      onChange={e => handlePartChange(part.id, part.type, e.target.value)}
                      sx={{
                        borderBottom:
                          hasErrors && !part.content.trim() && getErrorMessage(`question.${part.id}.content`)
                            ? '2px solid red'
                            : '2px solid gray',
                        flex: 1,
                        p: 0.5
                      }}
                    />
                    {hasErrors && !part.content.trim() && (
                      <Typography color='error' variant='body2' sx={{ mt: 0.5 }}>
                        {getErrorMessage(`question.${part.id}.content`)}
                      </Typography>
                    )}
                  </Box>
                )}
                <IconButtonTooltip title='Remove' color='error' onClick={() => handleRemovePart(part.id)}>
                  <RemoveCircleIcon />
                </IconButtonTooltip>
              </Box>
            ))}
            {hasErrors && (
              <>
                {!hasAtleastOneBlank && getErrorMessage(`question.blank`) && (
                  <Typography color='error' variant='body2' sx={{ mt: 0.5, ml: 1 }}>
                    {getErrorMessage(`question.blank`)}
                  </Typography>
                )}
                {!hasAtleastOneText && getErrorMessage(`question.text`) && (
                  <Typography color='error' variant='body2' sx={{ mt: 0.5, ml: 1 }}>
                    {getErrorMessage(`question.text`)}
                  </Typography>
                )}
              </>
            )}
            <Box className='flex justify-end gap-2'>
              <Button
                variant='text'
                color='primary'
                size='small'
                component='label'
                // style={{ color: 'white' }}
                startIcon={<AddCircleIcon />}
                onClick={handleAddText}
                disabled={isLastPartText} // Disable Add Text button
              >
                Add Text
              </Button>
              <Button
                variant='text'
                size='small'
                component='label'
                // style={{ color: 'white' }}
                color='primary'
                startIcon={<AddCircleIcon />}
                onClick={handleAddBlank}
              >
                Add Blank
              </Button>
            </Box>
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
      <Grid container spacing={2} mt={2} alignItems='center'>
        <Grid item xs={12} className='flex items-center gap-3 mt-3'>
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

export default FillInBlanksQuestionTemplate
