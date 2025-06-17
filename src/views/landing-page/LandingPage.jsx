import React from 'react'
import LandingPageQuizData from './LandingPageQuizData'
import LandingPageGameData from './LandingPageGamedata'
import { Stack , Box } from '@mui/material'

function LandingPage() {
  return (
    <Box sx={{ mt: 10 }}>
      <LandingPageQuizData />
      <LandingPageGameData />
    </Box>
  )
}

export default LandingPage