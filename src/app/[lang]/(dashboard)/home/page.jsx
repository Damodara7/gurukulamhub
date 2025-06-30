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
      {/* Top fixed marquee - add padding to main content */}
      <DonateButton />
      <Marquee position='top' positionClass='top-[4.4rem]' />
      <Grid container spacing={6} sx={{ pt: '60px', pb: '70px' }}>
        {/* Add padding for  top and bottom marquees */}
        <Grid item xs={12}>
          <LandingPage />
        </Grid>
      </Grid>
    </Stack>
  )
}

export default HomePage
