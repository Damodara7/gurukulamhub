

import React, { useState, useEffect } from 'react'
import { Grid, Card, CardMedia, CardContent, Typography, Box, ButtonBase, Button } from '@mui/material'
import { red } from '@mui/material/colors'
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import { styled, keyframes } from '@mui/system'
// Countdown Timer Component
const CountdownTimer = ({ startTime }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(startTime))

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(startTime))
    }, 1000)
    return () => clearInterval(timer)
  }, [startTime])

  // Destructure time data
  const { hours, minutes, seconds, hasStarted } = timeLeft;

  function calculateTimeLeft(startTime) {
    const difference = new Date(startTime) - new Date()
    let timeLeft = {}

    if (difference > 0) {
      timeLeft = {
        hours: Math.floor(difference / (1000 * 60 * 60)),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        hasStarted: false
      }
    } else {
      // Time elapsed since the game started
      const elapsed = Math.abs(difference);
      timeLeft = {
        hours: Math.floor(elapsed / (1000 * 60 * 60)),
        minutes: Math.floor((elapsed / 1000 / 60) % 60),
        seconds: Math.floor((elapsed / 1000) % 60),
        hasStarted: true
      };
      //console.log("Elapsed time....",elapsed)
    }
  
  return timeLeft
}

return timeLeft.hours || timeLeft.minutes || timeLeft.seconds ? (
  <Typography
    variant='body2'
    color='textSecondary'
    sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '0.8rem', md: '1rem' } }} // Responsive font size
  >
    <AccessTimeIcon fontSize='small' />
    {`${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`}
  </Typography>
) : (
  <Typography variant='body2' color='error' sx={{ fontSize: { xs: '0.8rem', md: '1rem' } }}>
    {/* Live Now! */}
  </Typography>
)
  }

export default CountdownTimer;
