'use client'

import React from 'react'
import LandingPage from '@/views/landing-page/LandingPage'
import { Grid, Stack } from '@mui/material'
import Marquee from '../../(dashboard)/dashboards/myprogress/Marquee/Marquee'

function WelcomePage() {
  return (
    <Stack>
      {/* Top fixed marquee - add padding to main content */}
      <Marquee position='top' positionClass='top-12' />

      <Grid container spacing={6} sx={{ pt: '40px', pb: '70px' }}>
        {/* Add padding for top and bottom marquees */}
        <Grid item xs={12}>
          <LandingPage />
        </Grid>
      </Grid>
    </Stack>
  )
}

export default WelcomePage
