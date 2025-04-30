'use client'
// MUI Imports
import Grid from '@mui/material/Grid'

// Components Imports

import FloatingBar from '@/components/FloatingBar/FloatingBar'
import ActionCardGrid from './ActionCardGrid'
import ActionCardGrid2 from './ActionCardGrid2'
import FullscreenAd from '@/views/apps/advertisements/FullscreenAd/FullscreenAd'

import CenterBox from '@/components/CenterBox'
import AdvertisementScroller from './AdvertisementScroller/AdvertisementScroller'
import Marquee from './Marquee/Marquee'
import CompleteUserProfilePopup from './CompleteUserProfilePopup'
import { Box, Stack } from '@mui/material'
import DonateButton from '@components/DonateButton'
import HomeDashboardPage from '@views/home/HomeDashboardPage'
import FreshLoginPopup from '@/components/alert-popups/FreshLoginPopup'

const DashboardMyProgress = () => {
  return (
    <Stack>
      {/* <CompleteUserProfilePopup /> */}
      <FreshLoginPopup open={true} onClose />
      <Grid container spacing={6}>
        <Grid item xs={12} md={8} className='self-end'>
          <DonateButton />
          <Marquee></Marquee>
        </Grid>
        <Grid item xs={12} mx='auto' mb={8} md={8} className='self-end'>
          {/* <ActionCardGrid2></ActionCardGrid2> */}
          <HomeDashboardPage />
        </Grid>
      </Grid>
    </Stack>
  )
}

export default DashboardMyProgress
