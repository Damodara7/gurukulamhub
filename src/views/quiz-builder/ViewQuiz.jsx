//   const primaryQuestionData = {
//     _id: data._id,
//     id: id,
// templateId: 'single-choice',
//     data: {
//       language: language,
//       question: question,
//       hint: hint,
//       hintMarks: hintMarks,
//       marks: marks,
//       timerSeconds: timerSeconds,
//       skippable: skippable,
//       language: language,
//       status: status,
//       options: options
//     }
//   }

'use client'

import React, { useEffect, useState } from 'react'
import { API_URLS } from '@/configs/apiConfig'
import * as RestApi from '@/utils/restApiUtil'
import { AlertTitle, Button, Chip, useMediaQuery, useTheme } from '@mui/material'
import { Alert, Stack, Grid, Card, Typography, CardContent, CardHeader, Divider, Box } from '@mui/material'
import Loading from '@/components/Loading'
import GoBackButton from '@/components/GoBackButton'
import QuizDetails from '@/components/quiz-builder-1/QuizDetails'
import { useRouter } from 'next/navigation'

// Mui icons
import EditIcon from '@mui/icons-material/Edit'

import {
  SingleChoiceTemplate,
  MultipleChoiceTemplate,
  TrueOrFalseTemplate,
  FillInTheBlanksTemplate,
  DummySingleChoiceTemplate,
  DummyMultipleChoiceTemplate,
  DummyTrueOrFalseTemplate,
  DummyFillInTheBlanksTemplate
} from '@/components/quizbuilder/Templates'

function ViewQuiz({ quiz, isAdmin=false }) {
  const router = useRouter()
  const [isMinimizedBool, setIsMinimizedBool] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [quizData, setQuizData] = useState(null)
  const [primaryQuestions, setPrimaryQuestions] = useState([])
  const [secQuestions, setSecQuestions] = useState([])
  const [selectedPrimaryQuestion, setSelectedPrimaryQuestion] = useState(null)
  const [secQuestionsLoading, setSecQuestionsLoading] = useState(false)

  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'))

  useEffect(() => {
    async function getQuizData() {
      setIsLoading(true)
      console.log('Fetching Selected Quiz Data now...')
      const result = await RestApi.get(`${API_URLS.v0.USERS_QUIZ}/${quiz._id}`)
      if (result?.status === 'success') {
        console.log('Quizzes Fetched result', result)
        setQuizData(result?.result)
        await fetchPrimaryQuestions(quiz._id) // Fetch primary questions after getting quiz data
      } else {
        // toast.error('Error:' + result?.message)
        console.log('Error:' + result?.message)
      }
      setIsLoading(false)
    }

    getQuizData()
  }, [quiz._id])

  const fetchPrimaryQuestions = async quizId => {
    console.log('Fetching primary questions...')
    const result = await RestApi.get(`${API_URLS.v0.USERS_QUIZ_QUESTION}?quizId=${quiz._id}&isPrimary=true`)
    if (result.status === 'success') {
      console.log(`result: primary questions of quiz= ${quizId}...`, result)
      setPrimaryQuestions(result?.result || [])
    } else {
      console.log('Error Fetching primary questions:', result)
      setPrimaryQuestions([])
      // toast.error('Error Fetching primary questions:' + result?.message)
    }
  }

  useEffect(() => {
    if (selectedPrimaryQuestion) {
      fetchSecondaryQuestions(selectedPrimaryQuestion?._id)
    }
  }, [selectedPrimaryQuestion])

  const fetchSecondaryQuestions = async questionId => {
    setSecQuestionsLoading(true)
    console.log('Fetching secondary questions...')
    const result = await RestApi.get(
      `${API_URLS.v0.USERS_QUIZ_QUESTION}?quizId=${quiz?._id}&primaryQuestionId=${questionId}`
    )
    if (result.status === 'success') {
      setSecQuestions(result?.result || [])
    }
    setSecQuestionsLoading(false)
  }

  function handleEditQuizDetails() {
    router.push(`/${isAdmin ? 'management/quizzes' : 'myquizzes'}/edit/${quiz._id}`)
  }
  function handleEditQuizQuestions() {
    router.push(`/${isAdmin ? 'management/quizzes' : 'myquizzes'}/builder/${quiz._id}`)
  }

  if (isLoading) {
    return <Loading />
  }

  console.log('Primary questions:', primaryQuestions)

  const renderDummyTemplate = (question, title, questionNumber) => {
    switch (question.templateId) {
      case 'single-choice':
        return <DummySingleChoiceTemplate question={question} title={title} questionNumber={questionNumber} />
      case 'multiple-choice':
        return <DummyMultipleChoiceTemplate question={question} title={title} questionNumber={questionNumber} />
      case 'true-or-false':
        return <DummyTrueOrFalseTemplate question={question} title={title} questionNumber={questionNumber} />
      case 'fill-in-blank':
        return <DummyFillInTheBlanksTemplate question={question} title={title} questionNumber={questionNumber} />
      default:
        return <Typography>No Template Found</Typography>
    }
  }

  const renderRealTemplate = question => {
    switch (question.templateId) {
      case 'single-choice':
        return <SingleChoiceTemplate question={question} />
      case 'multiple-choice':
        return <MultipleChoiceTemplate question={question} />
      case 'true-or-false':
        return <TrueOrFalseTemplate question={question} />
      case 'fill-in-blank':
        return <FillInTheBlanksTemplate question={question} />
      default:
        return <Typography>No Template Found</Typography>
    }
  }

  console.log('Secondary questions:', secQuestions)

  return (
    <>
    <Stack gap={2}>
      <GoBackButton />
      {quiz.approvalState === 'draft' && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mb: 1 }}>
          <Button
            variant='outlined'
            size='small'
            color='primary'
            startIcon={<EditIcon />}
            onClick={handleEditQuizDetails} // Add your onClick function
          >
            Edit Details
          </Button>
          <Button
            variant='outlined'
            size='small'
            color='primary'
            startIcon={<EditIcon />}
            onClick={handleEditQuizQuestions} // Add your onClick function
          >
            Edit Questions
          </Button>
        </Box>
      )}
      <QuizDetails quiz={quizData} />
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <Alert sx={{ mx: 'auto', mb: 2 }} icon={false} severity='info'>
            Primary Lang({quiz?.language?.name}) Questions 👇
          </Alert>
          {/* Apply conditional scrolling here */}
          <Box
            sx={{
              overflowY: isSmallScreen ? 'hidden' : 'auto',
              overflowX: isSmallScreen ? 'auto' : 'hidden',
              whiteSpace: isSmallScreen ? 'nowrap' : 'normal',
              maxHeight: isMinimizedBool ? '81vh' : '70vh',
              height: isSmallScreen ? '140px' : 'auto'
            }}
          >
            {primaryQuestions?.map((question, index) => (
              <Card
                key={question._id}
                sx={{
                  m: 1,
                  mb: isSmallScreen ? 0 : 2,
                  mr: isSmallScreen ? 2 : 0,
                  padding: '0px',
                  display: 'inline-block',
                  cursor: 'pointer',
                  width: isSmallScreen ? '200px' : '96%',
                  height: isSmallScreen ? '96%' : 'auto',
                  border: selectedPrimaryQuestion?._id === question._id ? '3px solid' : '1px solid',
                  borderColor: selectedPrimaryQuestion?._id === question._id ? 'primary.main' : 'divider', // Enhanced border when selected
                  boxShadow: selectedPrimaryQuestion?._id === question._id ? '0px 4px 20px rgba(0, 0, 0, 0.1)' : 'none', // Shadow for depth when selected
                  transition: 'box-shadow 0.3s ease, border-color 0.3s ease', // Smooth transition for the effect
                  transform: selectedPrimaryQuestion?._id === question._id ? 'scale(1.02)' : 'none' // Slightly larger when selected
                }}
                onClick={() => setSelectedPrimaryQuestion(question)}
              >
                {renderDummyTemplate(
                  question,
                  `${index + 1}. ${question?.data?.question || '* Question is not completed!'}`,
                  index + 1
                )}
              </Card>
            ))}
          </Box>
        </Grid>

        {selectedPrimaryQuestion ? (
          <Grid item xs={12} md={9}>
            <Stack spacing={2}>
              <Card>
                <Chip
                  color='primary'
                  szie='small'
                  style={{ color: 'white', float: 'right', margin: '4px 8px 4px 4px' }}
                  label={`${selectedPrimaryQuestion?.language?.split('|')[1]}`}
                />
                {renderRealTemplate(selectedPrimaryQuestion)}
              </Card>
              <Alert sx={{ mx: 'auto', mb: 2, padding: '4px 8px' }} icon={false} severity='info'>
                Secondary Language Questions 👇
              </Alert>
              {!secQuestionsLoading && (
                <Box
                  sx={{
                    maxHeight: isMinimizedBool ? '59vh' : '40vh',
                    overflowY: 'auto',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    padding: 1
                  }}
                >
                  {secQuestions.length > 0 ? (
                    secQuestions.map(secQuestion => (
                      <Box key={secQuestion._id} sx={{ mb: 2 }}>
                        <Card>
                          <Chip
                            color='primary'
                            szie='small'
                            style={{ color: 'white', float: 'right', margin: '4px 8px 4px 4px' }}
                            label={`${secQuestion?.language?.split('|')[1]}`}
                          />
                          {renderRealTemplate(secQuestion)}
                          {/* Show dummy UI for secondary questions */}
                        </Card>
                      </Box>
                    ))
                  ) : (
                    <Typography variant='body2' color='error' sx={{ fontWeight: 500, textAlign: 'center' }}>
                      No secondary language questions exist for this question.
                    </Typography>
                  )}
                </Box>
              )}

              {secQuestionsLoading && <Loading />}
            </Stack>
          </Grid>
        ) : (
          <Grid item xs={12} md={9}>
            <Alert severity='info' variant='standard' style={{ padding: '4px 8px' }}>
              Select a primary question to view secondary questions.
            </Alert>
          </Grid>
        )}
      </Grid>
    </Stack>
    </>
  )
}

export default ViewQuiz
