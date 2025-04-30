'use client'

import { Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'

function Timer({ sponsorshipExpiresAt, remainingTime, setRemainingTime }) {

  // Calculate remaining time
  useEffect(() => {
    const calculateRemainingTime = () => {
      const expiresAt = new Date(sponsorshipExpiresAt).getTime()
      const now = new Date().getTime()
      const timeLeft = Math.max(0, expiresAt - now) // Ensure timeLeft is not negative
      setRemainingTime(timeLeft)
    }

    // Update remaining time every second
    // The interval ensures that the remainingTime is updated in real-time.
    const interval = setInterval(calculateRemainingTime, 1000)

    // The initial call to calculateRemainingTime ensures that the remainingTime state is set immediately, avoiding a delay of up to 1 second.
    calculateRemainingTime() // Initial calculation

    return () => clearInterval(interval) // Cleanup interval on unmount
  }, [sponsorshipExpiresAt])

  // Format remaining time
  const formatTime = time => {
    if (time < 60000) {
      // Less than 60 seconds
      return `${Math.floor(time / 1000)} seconds`
    } else {
      // More than 60 seconds
      const minutes = Math.floor(time / 60000)
      const seconds = Math.floor((time % 60000) / 1000)
      return `${minutes} minutes ${seconds} seconds`
    }
  }

  return (
    <Typography variant='body1' gutterBottom>
      Time Remaining: {formatTime(remainingTime)}
    </Typography>
  )
}

export default Timer
