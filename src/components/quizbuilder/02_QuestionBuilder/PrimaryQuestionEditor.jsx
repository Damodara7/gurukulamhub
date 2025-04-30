import React, { useState, useEffect } from 'react'
import { FormControl, Typography, TextField, Button, Grid, Box } from '@mui/material'
import useUUID from '../../../app/hooks/useUUID'
import useUser from '@/utils/useUser' // Replace with your hook path
import AddIcon from '@mui/icons-material/Add'
import QuestionTemplatesToolBar from './QuestionTemplatesToolBar'

import * as RestApi from '@/utils/restApiUtil'
import { API_URLS as ApiUrls } from '@/configs/apiConfig'
import { toast } from 'react-toastify'
import { useSession } from 'next-auth/react'

const PrimaryQuestionEditor = ({ data, setShowAddQuestion, setInvalidateQuestions }) => {
  const {data: session} = useSession()
  const { uuid, regenerateUUID, getUUID } = useUUID()
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [primaryQuestionId, setPrimaryQuestionId] = useState() //PQ_001
  const [primaryLanguage, setPrimaryLanguage] = useState(data?.language)
  const [submitting, setSubmitting] = useState(false)

  var pID = 'PQ_' + primaryLanguage.name.toUpperCase() + '_' + getUUID()
  const user = session?.user

  const createPrimaryQuestion = async () => {
    if (!primaryLanguage) {
      // toast.error('Select a primary language.')
      return
    } else if (!selectedTemplate) {
      // toast.error('Select template for question')
      return
    }
    setPrimaryQuestionId(pID)
    setSubmitting(true)
    await callCreateQuestionApi()
    setSubmitting(false)
  }

  const createQuestionDefaultValues = {
    id: '',
    quizId: '',
    language: {},
    templateId: '',
    createdBy: ''
  }

  const callCreateQuestionApi = async () => {
    var reqObj = createQuestionDefaultValues
    reqObj.id = pID
    reqObj.quizId = data.quiz._id
    reqObj.language = data.language.code + '|' + data.language.name
    reqObj.templateId = selectedTemplate
    reqObj.createdBy = user.email
    reqObj.isPrimary = true

    console.log('ReqObj for creating primary Question', reqObj)

    const result = await RestApi.post(`${ApiUrls.v0.USERS_QUIZ_QUESTION}`, reqObj)
    if (result?.status === 'success') {
      console.log('Question Added result', result)
      // toast.success('Question Added Successfully .')
      setInvalidateQuestions(prev => !prev)
      setShowAddQuestion(false)
    } else {
      // toast.error('Error:' + result.message)
    }
  }

  return (
    <div style={{}}>
      <Typography variant='body1'>
        Create a primary language question, you can then create multiple secondary language questions.
      </Typography>
      <br />

      <Grid container spacing={4} alignItems='center'>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <TextField
              label='Primary Language'
              variant='outlined'
              fullWidth
              disabled
              value={data?.language.code + '|' + data.language.name}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField label='Primary Question Id (Auto generated)' variant='outlined' fullWidth disabled value={pID} />
        </Grid>

        <Grid item xs={12}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'start', sm: 'center' }
            }}
          >
            <Typography>Select Question Template:</Typography>
            <QuestionTemplatesToolBar
              selectedTemplate={selectedTemplate}
              setSelectedTemplate={setSelectedTemplate}
              direction='row'
              disabled={submitting}
            />
          </Box>
        </Grid>
        {selectedTemplate && (
          <>
            <Grid item xs={12} className='flex flex-col'>
              <Typography>
                Selected Template :{' '}
                {selectedTemplate ? (
                  <Typography variant='span' color='primary'>
                    {selectedTemplate}
                  </Typography>
                ) : (
                  ''
                )}
              </Typography>
              <Button
                variant='contained'
                aria-label='add option'
                component='label'
                style={{ color: 'white', alignSelf: 'flex-end' }}
                startIcon={<AddIcon />}
                onClick={createPrimaryQuestion}
                disabled={submitting} // Disable the button during submission
              >
                {submitting ? 'Creating...' : 'Create Primary Question'}
              </Button>
            </Grid>
          </>
        )}
      </Grid>
    </div>
  )
}

export default PrimaryQuestionEditor
