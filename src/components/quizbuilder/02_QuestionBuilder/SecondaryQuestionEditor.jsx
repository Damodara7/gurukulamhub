import React, { useState, useEffect } from 'react'
import {
  FormControl,
  Container,
  Radio,
  Switch,
  RadioGroup,
  IconButton,
  Typography,
  TextField,
  Box,
  Button,
  InputLabel,
  Grid,
  Select,
  MenuItem,
  Card,
  CardContent
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import QuestionTemplatesToolBar from './QuestionTemplatesToolBar'
import LanguageSelect from '../05_Components/LanguageSelect'
import LanguageDropDown from '../05_Components/LanguageDropDown'
import DynamicQuestionTemplate from './DynamicQuestionTemplate'
import useUUID from '@/app/hooks/useUUID'
import { useSession } from 'next-auth/react'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS as ApiUrls } from '@/configs/apiConfig'
import { toast } from 'react-toastify'

const SecondaryQuestionEditor = ({
  data,
  show = 'true',
  onAddNew,
  primaryQuestion,
  setInvalidatePrimaryQuestions = () => {}
}) => {
  console.log('Quiz data in SecondaryQuestionEditor :', data)
  const { uuid, regenerateUUID, getUUID } = useUUID()
  const { data: session } = useSession()
  const [secondaryLanguage, setSelectedLanguage] = useState(null)

  let sID = ''
  if (secondaryLanguage) {
    sID = 'SQ_' + secondaryLanguage.name.toUpperCase() + '_' + getUUID()
  } else {
    sID = ''
  }
  const [secQuestions, setSecQuestions] = useState([])
  const [invalidateQuestions, setInvalidateQuestions] = useState(false)
  const [showAddSecQuestion, setShowAddSecQuestion] = useState(false)
  const [selectedSecondaryQuestion, setSelectedSecondaryQuestion] = useState(null)
  const primaryQuestionId = primaryQuestion._id

  useEffect(() => {
    setSelectedSecondaryQuestion(null)
    setShowAddSecQuestion(null)
  }, [primaryQuestionId])

  useEffect(() => {
    // Fetch questions from database
    console.log('Fetching sec questions...')

    const fetchQuestions = async () => {
      const result = await RestApi.get(
        `${ApiUrls.v0.USERS_QUIZ_QUESTION}?quizId=${data?.quiz?._id}&primaryQuestionId=${primaryQuestionId}`
      )
      console.log(`result: sec questions of primary question= ${primaryQuestionId}...`, result)
      if (result.status === 'success') {
        if (Object.keys(result.result).length === 0 && result.result.constructor === Object) {
          console.log('IF')
          setSecQuestions([])
        } else {
          console.log('ELSE')
          setSecQuestions(result.result)
        }
      }
    }

    if (primaryQuestionId) {
      fetchQuestions()
    }
  }, [invalidateQuestions, primaryQuestionId])

  useEffect(() => {
    setSelectedSecondaryQuestion(null)
  }, [invalidateQuestions])

  const saveQuestion = async questionRequest => {
    console.log('Saving sec question:', questionRequest)
    const result = await RestApi.put(ApiUrls.v0.USERS_QUIZ_QUESTION, questionRequest)
    if (result?.status === 'success') {
      console.log('Sec Question Added result', result)
      setSelectedSecondaryQuestion(null)
      setInvalidatePrimaryQuestions(prev => !prev)
      setInvalidateQuestions(prev => !prev)
      // toast.success('Sec Question Added Successfully .')
    } else {
      // toast.error('Error:' + result?.message)
    }
  }

  const createSecondaryQuestion = async () => {
    if (!secondaryLanguage) {
      // toast.error('Select a secondary language')
      return
    }
    await callCreateQuestionApi()
  }

  const createQuestionDefaultValues = {
    id: '',
    quizId: '',
    primaryQuestionId: '',
    language: '',
    templateId: '',
    createdBy: ''
  }

  const callCreateQuestionApi = async () => {
    var reqObj = createQuestionDefaultValues
    reqObj.id = sID
    reqObj.quizId = data?.quiz?._id
    reqObj.templateId = data?.selectedQuestion?.templateId
    reqObj.primaryQuestionId = primaryQuestionId
    reqObj.language = secondaryLanguage.code + '|' + secondaryLanguage.name
    reqObj.createdBy = session?.user?.email
    reqObj.isPrimary = false

    const result = await RestApi.post(`${ApiUrls.v0.USERS_QUIZ_QUESTION}`, reqObj)
    if (result?.status === 'success') {
      console.log('Question Added result', result)
      // toast.success('Question Added Successfully .')
      setInvalidateQuestions(prev => !prev)
      setShowAddSecQuestion(false)
    } else {
      // toast.error('Error:' + result.message)
    }
  }

  async function deleteQuestion(id) {
    const result = await RestApi.del(`${ApiUrls.v0.USERS_QUIZ_QUESTION}?id=${id}`)
    if (result?.status === 'success') {
      console.log('Question deleted result', result)
      setInvalidateQuestions(prev => !prev)
      setSelectedSecondaryQuestion(null)
      // toast.success('Question deleted Successfully.')
    } else {
      // toast.error('Error:' + result?.message)
    }
  }

  if (!show) return ''

  function handleOnChangeSecondaryLanguage(val) {
    setSelectedLanguage(val)
  }

  const handleQuestionClick = question => {
    setSelectedSecondaryQuestion(question)
    setSelectedLanguage(null)
    setShowAddSecQuestion(false)
    console.log('Clicking the question', question)
  }

  function handleAddNewQuestion() {
    setShowAddSecQuestion(true)
    setSelectedLanguage(null)
    setSelectedSecondaryQuestion(null)
  }

  // existing secondary languages of selected primary question
  const secondaryLanguages =
    secQuestions?.map(question => {
      const languageCode = question?.language.split('|')[0]
      const languageName = question?.language.split('|')[1]
      return {
        code: languageCode,
        name: languageName
      }
    }) || []

  const quizLanguages = [data?.quiz?.language, ...secondaryLanguages]

  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <Typography variant='body1'>Secondary Language Questions </Typography>

        {/* Secondary language question cards */}
        <LanguageDropDown
          selectedSecondaryQuestion={selectedSecondaryQuestion}
          handleQuestionClick={handleQuestionClick}
          primaryQuestion={primaryQuestion}
          onAddNew={handleAddNewQuestion}
          secQuestions={secQuestions}
        />
      </Grid>

      {showAddSecQuestion && (
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    {/* <InputLabel id='language-select-label'> Language</InputLabel> */}
                    <LanguageSelect
                      removeLanguages={quizLanguages}
                      onSelectLanguage={handleOnChangeSecondaryLanguage}
                    />
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label=' Question Id'
                    variant='outlined'
                    fullWidth
                    value={sID}
                    disabled
                    //value={parentType}
                    //onChange={handleQuestionChange}
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  style={{ display: 'flex', justifyContent: 'flex-end', flexDirection: 'row', gap: 8 }}
                >
                  <Button
                    variant='contained'
                    component='label'
                    style={{ color: 'white' }}
                    aria-label='add option'
                    startIcon={<AddIcon />}
                    onClick={() => createSecondaryQuestion()}
                  >
                    Create Secondary Question
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      )}

      {!showAddSecQuestion && selectedSecondaryQuestion && (
        <Grid item xs={12}>
          {/* Question form based on question template */}
          {/* Use selectedQuestion data to populate the form */}
          {/* <div style={{ positions: "absolute", borders: "1px solid black" }}>
            <QuestionTemplatesToolBar></QuestionTemplatesToolBar>
          </div> */}
          <Typography variant='body1' textAlign='center'>
            Secondary Language Question{' '}
          </Typography>
          <DynamicQuestionTemplate
            key={selectedSecondaryQuestion._id}
            id={selectedSecondaryQuestion.id}
            mode='secondary'
            saveQuestion={saveQuestion}
            templateId={primaryQuestion.templateId}
            primaryQuestion={primaryQuestion}
            data={selectedSecondaryQuestion}
            deleteQuestion={deleteQuestion}
          />
        </Grid>
      )}
    </Grid>
  )
}

export default SecondaryQuestionEditor
