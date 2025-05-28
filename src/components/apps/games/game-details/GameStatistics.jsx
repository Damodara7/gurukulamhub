import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box
} from '@mui/material';
import { EmojiEvents } from '@mui/icons-material';

function GameStatistics({game}) {

  function formatDuration(seconds) {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    // Case: all are 0
    if (hrs === 0 && mins === 0 && secs === 0) return '0s'

    // Build result based on available values
    const parts = []

    if (hrs > 0 && mins === 0 && secs === 0) {
      return `${hrs}h` // Only hours
    }

    if (hrs === 0 && mins > 0 && secs === 0) {
      return `${mins}m` // Only minutes
    }

    if (hrs === 0 && mins === 0 && secs > 0) {
      return `${secs}s` // Only seconds
    }

    if (secs === 0 && (hrs > 0 || mins > 0)) {
      if (hrs > 0) parts.push(`${hrs}h`)
      if (mins > 0) parts.push(`${mins}m`)
      return parts.join(' ')
    }

    if (mins === 0 && (hrs > 0 || secs > 0)) {
      if (hrs > 0) parts.push(`${hrs}h`)
      if (secs > 0) parts.push(`${secs}s`)
      return parts.join(' ')
    }

    if (hrs === 0 && (mins > 0 || secs > 0)) {
      if (mins > 0) parts.push(`${mins}m`)
      if (secs > 0) parts.push(`${secs}s`)
      return parts.join(' ')
    }

    // General case: all are present
    if (hrs > 0) parts.push(`${hrs}h`)
    if (mins > 0) parts.push(`${mins}m`)
    if (secs > 0) parts.push(`${secs}s`)

    return parts.join(' ')
  }
  
  
  return (
    <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant='h6' sx={{ mb: 2 }}>
                <EmojiEvents sx={{ mr: 1, verticalAlign: 'middle' }} />
                Game Statistics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant='h4'>{game.registeredUsers.length}</Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Registered Users
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant='h4'>{game.participatedUsers.length}</Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Participants
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant='h4'>{formatDuration(game.duration)}</Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Duration
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant='h4'>{game.rewards.length}</Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Reward Tiers
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
  )
}

export default GameStatistics