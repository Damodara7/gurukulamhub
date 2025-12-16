import React from 'react'
import QuizListPage from '@/views/apps/quiz/QuizListPage'
import { Box } from '@mui/material'

function page() {
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <QuizListPage/>
    </Box>
  )
}

export default page
