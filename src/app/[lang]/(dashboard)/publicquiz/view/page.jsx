import React from 'react'
import ViewPublicQuizzes from '@/views/publicquiz/ViewPublicQuizzes'
import { Box } from '@mui/material'

export default function ViewPublicQuizzesPage() {
  return <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    <ViewPublicQuizzes />
  </Box>
}
