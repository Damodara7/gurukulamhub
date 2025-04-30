'use client'

import React from 'react'
import { styled } from '@mui/system'
import { Button, keyframes } from '@mui/material'
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism'
import Link from 'next/link'

function DonateButton(props) {
  const pulseAnimation = keyframes`
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(0.95);
    }
    100% {
      transform: scale(1);
    }
    `
  // Styled button with custom styles
  const StyledDonateButton = styled(Button)(({ theme }) => ({
    // background: 'linear-gradient(45deg, #FF5733 30%, #FFBD59 90%)',
    // borderRadius: 10,
    position: 'fixed',
    [theme.breakpoints.down('sm')]: {
      bottom: 80
    },
    [theme.breakpoints.up('sm')]: {
      bottom: 80
    },
    right: 0,
    zIndex: 1002,
    color: 'white',
    padding: '12px 24px',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    transition: 'background 0.3s ease, box-shadow 0.3s ease',
    animation: `${pulseAnimation} 1s infinite`,
    '&:hover': {
      // background: 'linear-gradient(45deg, #FF5733 50%, #FFBD59 100%)',
      boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)'
    },
    '&:active': {
      // background: 'linear-gradient(45deg, #FF5733 50%, #FFBD59 100%)',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
    }
  }))
  return (
    <Link href='/donation'>
      <StyledDonateButton
        {...props}
        component='label'
        color='primary'
        variant='contained'
        startIcon={<VolunteerActivismIcon fontSize='large' />}
      >
        Donate
      </StyledDonateButton>
    </Link>
  )
}

export default DonateButton
