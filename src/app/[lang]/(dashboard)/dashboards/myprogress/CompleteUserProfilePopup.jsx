'use client'

import { Alert, AlertTitle, Box, Button, Stack, styled, Typography, useMediaQuery, useTheme } from '@mui/material'
import React, { useEffect, useState } from 'react'
import classes from './CompleteUserProfilePopup.module.css'
import { useRouter } from 'next/navigation'
import CircularProgressWithValueLabel from '@/views/pages/account-settings/account/CircularProgressWithValueLabel'

function CompleteUserProfilePopup() {
  const router = useRouter()
  const [sholdDisplay, setShouldDisplay] = useState(true)
  const theme = useTheme()
  const isAboveSmallScreen = useMediaQuery('(min-width:413px)')

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldDisplay(false)
    }, 1000 * 300)

    return () => {
      clearTimeout(timer)
    }
  }, [])

  const handleClickUserProfilePopup = () => {
    router.push('/en/pages/user-profile')
    setShouldDisplay(false)
  }

  const handleCloseUserProfilePopup = () => {
    setShouldDisplay(false)
  }

  const StyledGoButton = styled(Button)(({ theme }) => ({
    backgroundColor: 'transparent',
    color: 'white',
    background: theme.palette.primary.main,
    borderColor: 'white',
    padding: '0.35rem 1rem'
  }))
  const StyledCloseButton = styled(Button)(() => ({
    backgroundColor: 'transparent',
    color: 'white',
    // '&:hover': {
    //   background: 'rgba(0,0,0,0.1)',
    // },
    borderColor: 'white',
    padding: '0.35rem 1rem'
  }))

  return (
    <Box className={classes['alert']} display='flex' alignItems='center' justifyContent='center' gap='0.5rem'>
      {sholdDisplay && (
        <Alert icon={false} severity='error' variant='filled' color='error'>
          <Stack flexDirection='row' alignItems='flex-start' gap='0.5rem'>
            <Typography variant='h6' color='rgb(255,255,255)' noWrap={isAboveSmallScreen ? true : false}>
              Complete your profile & unlock exciting features.
            </Typography>
            {/* <CircularProgressWithValueLabel
              size={30}
              thickness={4}
              value={75}
              fontSize={10}
              textcolor='rgb(255,255,255)'
            /> */}
          </Stack>
          <Stack flexDirection='row' alignItems='center' justifyContent='flex-end' gap='0.5rem'>
            <StyledCloseButton component='label' size='small' variant='text' onClick={handleCloseUserProfilePopup}>
              Close
            </StyledCloseButton>
            <StyledGoButton
              component='label'
              color='primary'
              size='small'
              variant='contained'
              onClick={handleClickUserProfilePopup}
            >
              Go
            </StyledGoButton>
          </Stack>
        </Alert>
      )}
    </Box>
  )
}

export default CompleteUserProfilePopup
