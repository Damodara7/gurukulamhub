import React from 'react'
import { auth } from '@/libs/auth'
import { redirect } from 'next/navigation'
import LandingPage from '@/views/landing-page/LandingPage'
import { Grid, Stack } from '@mui/material'
import DonateButton from '@/components/DonateButton'
import Marquee from '../dashboards/myprogress/Marquee/Marquee'


async function HomePage({ searchParams }) {
  const session = await auth()

  if (searchParams.redirectTo) {
    // Validate the redirectTo URL to prevent open redirect vulnerabilities
    const safeRedirects = ['/public-games/join','/home'] // Add your safe URLs
    if (safeRedirects.includes(searchParams.redirectTo)) {
      redirect(searchParams.redirectTo)
    }
  }
  // If user is not authenticated and no redirect, maybe redirect to welcome
  if (!session?.user) {
    redirect('/welcome')
  }

  return (
    <Stack>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <DonateButton />
          <Marquee />
        </Grid>
        <Grid item xs={12}>
          <LandingPage />
        </Grid>
      </Grid>
    </Stack>
  )
}

export default HomePage
