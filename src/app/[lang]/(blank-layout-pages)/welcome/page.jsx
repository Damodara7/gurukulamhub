'use client'

import React from 'react'
import LandingPage from '@/views/landing-page/LandingPage'
import { Grid, Stack } from '@mui/material'
import Marquee from '../../(dashboard)/dashboards/myprogress/Marquee/Marquee'

function HomePage() {
  return (
    <Stack>
      <Grid container spacing={6}>
        <Grid item xs={12} >
          <Marquee/>
        </Grid>
        <Grid item xs={12} >
          <LandingPage />
        </Grid>
      </Grid>
    </Stack>
  )
}

export default HomePage
