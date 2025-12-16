import React from 'react'
import { auth } from '@/libs/auth'
import { redirect } from 'next/navigation'
import LandingPage from '@/views/landing-page/LandingPage'
import { Box, Grid, Stack } from '@mui/material'
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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Top fixed marquee - add padding to main content */}
      <DonateButton />
      <Marquee position='top' positionClass='top-[4.4rem]' />
      <Box sx={{ flex:1, my: 15, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        <LandingPage isAuthenticated={true} />
      </Box>
    </Box>
  )
}

export default HomePage
