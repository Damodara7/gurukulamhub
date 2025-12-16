import React from 'react'
import { Box } from '@mui/material'
import AdminViewQuiz from '@/views/apps/quiz/AdminViewQuiz'

function page({ params }) {
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
      <AdminViewQuiz quizId={params.id} />
    </Box>
  )
}

export default page
