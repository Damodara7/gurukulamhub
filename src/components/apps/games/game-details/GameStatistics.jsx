import React from 'react'
import { Grid, Card, CardContent, Typography, Box } from '@mui/material'
import { EmojiEvents } from '@mui/icons-material'

function GameStatistics({ game }) {
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
      <Card 
        sx={{
          height: '100%',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          background: 'rgba(255, 255, 255, 0.98)'
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography 
            variant='h6' 
            sx={{ 
              mb: 3,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              color: '#1a1a1a'
            }}
          >
            <EmojiEvents sx={{ color: '#667eea' }} />
            Game Statistics
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <Box 
                sx={{ 
                  textAlign: 'center',
                  p: 2,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.12) 0%, rgba(118, 75, 162, 0.12) 100%)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <Typography variant='h3' sx={{ fontWeight: 800, color: '#667eea' }}>
                  {game.registeredUsers.length}
                </Typography>
                <Typography variant='body2' sx={{ color: '#666', fontWeight: 600, mt: 0.5 }}>
                  Registered Users
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box 
                sx={{ 
                  textAlign: 'center',
                  p: 2,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.08) 0%, rgba(139, 195, 74, 0.08) 100%)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.12) 0%, rgba(139, 195, 74, 0.12) 100%)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <Typography variant='h3' sx={{ fontWeight: 800, color: '#4caf50' }}>
                  {game.participatedUsers.length}
                </Typography>
                <Typography variant='body2' sx={{ color: '#666', fontWeight: 600, mt: 0.5 }}>
                  Participants
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box 
                sx={{ 
                  textAlign: 'center',
                  p: 2,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.08) 0%, rgba(251, 140, 0, 0.08) 100%)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.12) 0%, rgba(251, 140, 0, 0.12) 100%)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <Typography variant='h3' sx={{ fontWeight: 800, color: '#ff9800', fontSize: game?.forwardType === 'admin' && game?.status !== 'completed' ? '1.2rem' : '2rem' }}>
                  {game?.forwardType === 'admin' && game?.status !== 'completed'
                    ? 'Admin'
                    : formatDuration(game?.duration)}
                </Typography>
                <Typography variant='body2' sx={{ color: '#666', fontWeight: 600, mt: 0.5 }}>
                  Duration
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box 
                sx={{ 
                  textAlign: 'center',
                  p: 2,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(239, 83, 80, 0.08) 0%, rgba(229, 57, 53, 0.08) 100%)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(239, 83, 80, 0.12) 0%, rgba(229, 57, 53, 0.12) 100%)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <Typography variant='h3' sx={{ fontWeight: 800, color: '#ef5350' }}>
                  {game.rewards.length}
                </Typography>
                <Typography variant='body2' sx={{ color: '#666', fontWeight: 600, mt: 0.5 }}>
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
