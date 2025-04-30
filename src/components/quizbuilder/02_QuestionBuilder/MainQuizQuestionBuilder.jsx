'use client'
import React, { useState, useEffect } from 'react'
import {
  Fab,
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Alert,
  AlertTitle
} from '@mui/material'
import PrimaryQuestionEditor from './PrimaryQuestionEditor'
import '../quizbuilder.css'
import SecondaryQuestionEditor from './SecondaryQuestionEditor'
import QuizQuestions from './QuizQuestions'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS as ApiUrls } from '@/configs/apiConfig'
import DynamicQuestionTemplate from './DynamicQuestionTemplate'

const questionData = [
  {
    id: 'q1',
    language: 'english',
    templateId: 'single-choice',
    data: {
      questionText: 'What is the capital of France?',
      options: [
        { id: '1', text: 'Parsi', correct: false },
        { id: '2', text: 'Paris', correct: false }
      ],
      correctAnswer: 0,
      secondaryQuestions: [
        {
          languageId: 'telugu',
          questionText: 'What is the capital of India?',
          options: [
            { id: 'opt_1', text: 'Delhi', correct: true },
            { id: 'opt_2', text: 'Mumbai', correct: false }
          ]
        },
        {
          languageId: 'tamil',
          questionText: 'What is the capital of India?',
          options: [
            { id: 'opt_1', text: 'Delhi', correct: true },
            { id: 'opt_2', text: 'Mumbai', correct: false }
          ]
        }
      ]
    }
  }
]

const MainQuizQuestionBuilder = ({ data }) => {
  console.log('Selected Quiz data in MainQuizQuestionBuilder: ', data)
  const [questions, setQuestions] = useState([])
  const [invalidateQuestions, setInvalidateQuestions] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState(null)
  const [showAddQuestion, setShowAddQuestion] = useState(false)

  const quizAndQuestionData = {
    quiz: { ...data },
    language: data?.language,
    quizId: data?.id,
    _id: data?._id,
    questions: questions,
    selectedQuestion: selectedQuestion
  }

  const templateData = {
    templateId: 'single-choice-radio',
    data: {
      /* some data */
      options: [
        { id: '1', text: 'Option 1', correct: false },
        { id: '2', text: 'Option 1', correct: false }
      ]
    }
  }

  useEffect(() => {
    setSelectedQuestion(null)
    setShowAddQuestion(false)
  }, [data])

  useEffect(() => {
    // Fetch questions from database
    console.log('Fetching questions...')

    const fetchQuestions = async () => {
      const result = await RestApi.get(
        `${ApiUrls.v0.USERS_QUIZ_QUESTION}?quizId=${quizAndQuestionData?.quiz?._id}&isPrimary=true`
      )
      console.log(`result: questions of quiz= ${quizAndQuestionData?.id}...`, result)
      if (result.status === 'success') {
        if (Object.keys(result.result).length === 0 && result.result.constructor === Object) {
          console.log('IF')
          setQuestions([])
        } else {
          console.log('ELSE')
          setQuestions(result.result)
        }
      }
    }

    if (data) {
      fetchQuestions()
    }
  }, [invalidateQuestions, data])

  useEffect(() => {
    setSelectedQuestion(null)
  }, [invalidateQuestions])

  const saveQuestion = async questionRequest => {
    console.log('Saving question:', questionRequest)
    const result = await RestApi.put(ApiUrls.v0.USERS_QUIZ_QUESTION, questionRequest)
    if (result?.status === 'success') {
      console.log('Question Added result', result)
      setInvalidateQuestions(prev => !prev)
      // toast.success('Question Added Successfully .')
    } else {
      // toast.error('Error:' + result?.message)
    }
  }

  async function deleteQuestion(id) {
    const result = await RestApi.del(`${ApiUrls.v0.USERS_QUIZ_QUESTION}?id=${id}`)
    if (result?.status === 'success') {
      console.log('Question deleted result', result)
      setInvalidateQuestions(prev => !prev)
      // toast.success('Question deleted Successfully.')
    } else {
      // toast.error('Error:' + result?.message)
    }
  }

  if (!data) {
    return (
      // <Card>
      <Alert severity='error'>
        <AlertTitle>No quiz is selected.</AlertTitle>
        <Typography>Please select a quiz to start building questions.</Typography>
      </Alert>
      // </Card>
    )
  }

  if (!data) {
    return (
      // <Card>
      <Alert severity='error'>
        <AlertTitle>No quiz is selected.</AlertTitle>
        <Typography>Please select a quiz to start building questions.</Typography>
      </Alert>
      // </Card>
    )
  }

  return (
    <Card key={data.id}>
      <CardHeader title='Primary Language Questions' />
      <CardContent>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <QuizQuestions
              questions={questions}
              selectedQuestion={selectedQuestion}
              setQuestions={setQuestions}
              setSelectedQuestion={setSelectedQuestion}
              setShowAddQuestion={setShowAddQuestion}
              showAddQuestion={showAddQuestion}
            />
          </Grid>
          {showAddQuestion && (
            <Grid item xs={12}>
              <PrimaryQuestionEditor
                setInvalidateQuestions={setInvalidateQuestions}
                data={quizAndQuestionData}
                setShowAddQuestion={setShowAddQuestion}
              />
            </Grid>
          )}
          {!showAddQuestion && selectedQuestion && (
            <Grid item xs={12}>
              <Typography textAlign='center' variant='body1'>
                Primary Language Question{' '}
              </Typography>
              <DynamicQuestionTemplate
                key={selectedQuestion._id}
                id={selectedQuestion.id}
                templateId={selectedQuestion.templateId}
                data={selectedQuestion}
                saveQuestion={saveQuestion}
                deleteQuestion={deleteQuestion}
              />
            </Grid>
          )}
          {!showAddQuestion && selectedQuestion && (
            <>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={12}>
                <SecondaryQuestionEditor
                  setInvalidatePrimaryQuestions={setInvalidateQuestions}
                  data={quizAndQuestionData}
                  primaryQuestion={selectedQuestion}
                />
              </Grid>
            </>
          )}
        </Grid>
      </CardContent>
    </Card>
  )
}

export default MainQuizQuestionBuilder
