import React, { useEffect, useState } from 'react'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS as ApiUrls } from '@/configs/apiConfig'
import Loading from '@/components/Loading'
import QuizzesTable from './QuizzesTable'

function AdminApprovedQuizzes() {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState({ quizzes: false })

  async function getQuizData() {
    // toast.success('Fetching My Quiz Data now...')
    try {
      setLoading(prev => ({ ...prev, quizzes: true }))
      const result = await RestApi.get(`${ApiUrls.v0.USERS_QUIZ}?approvalState=approved&privacyFilter=PUBLIC`)
      if (result?.status === 'success') {
        console.log('Approved Quizzes Fetched result', result)
        // toast.success('Quizzes Fetched Successfully .')
        setQuizzes(result.result)
      } else {
        // toast.error('Error:' + result?.result?.message)
        console.log('Error approved Fetching quizes:', result.message)
        setQuizzes([])
      }
    } catch (error) {
      console.error('Error fetching approved quizzes:', error)
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
      <QuizzesTable data={quizzes}  refreshData={getQuizData} />
    </>
  )
}

export default AdminApprovedQuizzes
