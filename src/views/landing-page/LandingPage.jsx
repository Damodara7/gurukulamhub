'use client'
import React from 'react'
import { alpha, Box } from '@mui/material'
import Hero from './sections/Hero'
import ValueProposition from './sections/ValueProposition'
import LandingPageQuizData from './LandingPageQuizData'
import LandingPageGameData from './LandingPageGamedata'
import HowItWorks from './sections/HowItWorks'
import SocialProof from './sections/SocialProof'
import FinalCTA from './sections/FinalCTA'

function LandingPage({ isAuthenticated = false }) {
  return (
    <Box
      sx={{
        bgcolor: 'background.default',
      }}
    >
        <Hero isAuthenticated={isAuthenticated} />
        {!isAuthenticated && <ValueProposition />}
        <LandingPageQuizData isAuthenticated={isAuthenticated} />
        <LandingPageGameData isAuthenticated={isAuthenticated} />
        {!isAuthenticated && <HowItWorks />}
        {!isAuthenticated && <SocialProof />}
        <FinalCTA isAuthenticated={isAuthenticated} />
    </Box>
  )
}

export default LandingPage
