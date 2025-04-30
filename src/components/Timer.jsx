// components/Timer.js
import React, { useEffect, useState } from 'react'
import { Typography, Box, useTheme } from '@mui/material'

// Convert time to MM:SS format
export const formatTime = seconds => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

export const formatTimeWithUnits = seconds => {
  if (seconds < 60) {
    return `${seconds} seconds`
  }

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ${remainingSeconds} second${
      remainingSeconds !== 1 ? 's' : ''
    }`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${
    remainingMinutes !== 1 ? 's' : ''
  } ${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`
}

const Timer = ({ isActive, time = 0, setTime }) => {
  const theme = useTheme()

  useEffect(() => {
    let interval
    if (isActive) {
      interval = setInterval(() => {
        setTime(prev => prev + 1) // Increment time every second
      }, 1000)
    } else if (!isActive && time !== 0) {
      clearInterval(interval) // Clear the interval when the timer is not active
    }

    return () => clearInterval(interval) // Cleanup on component unmount
  }, [isActive, time])

  return (
    <Box
      sx={{
        backgroundColor: '#ffffff',
        borderRadius: '50%', // Circular shape for a watch face
        padding: '10px',
        boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)',
        transition: 'transform 0.3s, box-shadow 0.3s',
        position: 'relative',
        textAlign: 'center',
        width: {
          xs: '70px', // Smaller width for small screens
          sm: '100px' // Default width for larger screens
        },
        height: {
          xs: '70px', // Smaller height for small screens
          sm: '100px' // Default height for larger screens
        },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden'
      }}
    >
      {/* Background image for hourglass */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'url(https://media1.tenor.com/m/QVN5mwuTsHwAAAAC/hourglass-hearts.gif)', // Replace with your hourglass image path
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.6,
          zIndex: 0
        }}
      />
      <Typography
        variant='body2'
        sx={{
          color: 'red',
          fontWeight: 'bold',
          letterSpacing: '0.5px',
          position: 'relative',
          zIndex: 1,
          fontSize: {
            xs: '0.6rem', // Smaller font size for small screens
            sm: '0.8rem' // Default size for larger screens
          }
        }}
      >
        Timer
      </Typography>
      <Typography
        variant='h6'
        sx={{
          color: '#333',
          fontWeight: 'bold',
          fontSize: {
            xs: '1rem', // Smaller font size for small screens
            sm: '1.5rem' // Default size for larger screens
          },
          position: 'relative',
          zIndex: 1
        }}
      >
        {formatTime(time)}
      </Typography>
      {/* Add a decorative circle to indicate the timer's progress */}
      <Box
        sx={{
          position: 'absolute',
          border: `4px solid ${theme.palette.primary.main}`, // Circle border color
          borderRadius: '50%',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
          zIndex: 1,
          animation: isActive ? 'rotate 60s linear infinite' : 'none'
        }}
      />
      <style>
        {`
      @keyframes rotate {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
    `}
      </style>
    </Box>
  )
}

export default Timer
