import React, { useEffect, useState } from 'react'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS as ApiUrls } from '@/configs/apiConfig'
import Loading from '@/components/Loading'
import QuizzesTable from './QuizzesTable'

function AdminPublishedQuizzes() {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState({ quizzes: false })

  async function getQuizData() {
    try {
      setLoading(prev => ({ ...prev, quizzes: true }))
      const result = await RestApi.get(`${ApiUrls.v0.USERS_QUIZ}?approvalState=published&privacyFilter=PUBLIC`)
      if (result?.status === 'success') {
        console.log('Published Quizzes Fetched result', result)
        setQuizzes(result.result)
      } else {
        console.log('Error fetching published quizzes:', result.message)
        setQuizzes([])
      }
    } catch (error) {
      console.error('Error fetching published quizzes:', error)
    } finally {
      setLoading(prev => ({ ...prev, quizzes: false }))
    }
  }

  useEffect(() => {
    getQuizData()
  }, [])

  if (loading.quizzes) {
    return <Loading />
  }

  return (
    <>
      <QuizzesTable data={quizzes} refreshData={getQuizData} />
    </>
  )
}

export default AdminPublishedQuizzes
