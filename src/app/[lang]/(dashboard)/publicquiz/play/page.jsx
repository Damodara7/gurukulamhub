import React from 'react'
import PlayQuiz from '@/views/quiz/PlayQuiz'
import { Box } from '@mui/material'
// import PlayQuiz from '@/views/publicquiz/PlayQuiz'

function page() {
  return <Box sx={{height: '100%', display: 'flex', flexDirection: 'column'}}>
    <PlayQuiz />
  </Box>
}

export default page
