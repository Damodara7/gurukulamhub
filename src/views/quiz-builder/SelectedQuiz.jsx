'use client'

import React, { useEffect, useState } from 'react'
import { API_URLS } from '@/configs/apiConfig'
import * as RestApi from '@/utils/restApiUtil'
import MainQuizQuestionBuilder from '@/components/quizbuilder/02_QuestionBuilder/MainQuizQuestionBuilder'
import QuizDetails from '@/components/quiz-builder-1/QuizDetails'
import { Alert, AlertTitle, Stack } from '@mui/material'
import LoadingDialog from '@/components/LoadingDialog'

function SelectedQuiz({ quiz }) {
  const [isLoading, setIsLoading] = useState(false)
  const [quizData, setQuizData] = useState(null)

  useEffect(() => {
    async function getQuizData() {
      setIsLoading(true)
      console.log('Fetching Selected Quiz Data now...')
      const result = await RestApi.get(`${API_URLS.v0.USERS_QUIZ}/${quiz._id}`)
      if (result?.status === 'success') {
        console.log('Quizzes Fetched result', result)
        setQuizData(result?.result)
      } else {
        // toast.error('Error:' + result?.message)
        console.log('Error:' + result?.message)
        console.log('Error Fetching quizes:', result)
      }
      setIsLoading(false)
    }

    getQuizData()
  }, [])

  if (isLoading) {
    return <LoadingDialog />
  }

  return (
    <Stack gap={2}>
      <QuizDetails quiz={quiz} />
      <MainQuizQuestionBuilder data={quiz} />
    </Stack>
  )
}

export default SelectedQuiz
