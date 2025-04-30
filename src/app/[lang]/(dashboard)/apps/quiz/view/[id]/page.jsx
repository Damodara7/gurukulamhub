import React from 'react'
import AdminViewQuiz from '@/views/apps/quiz/AdminViewQuiz'

function page({ params }) {
  return <AdminViewQuiz quizId={params.id} />
}

export default page
