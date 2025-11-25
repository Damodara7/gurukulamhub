import React from 'react'
import { Grid, Card, CardContent, Typography, Box, useTheme } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { EmojiEvents } from '@mui/icons-material'

function GameStatistics({ game }) {
  const theme = useTheme()
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
          boxShadow:
            theme.palette.mode === 'dark'
              ? `0 4px 20px ${alpha(theme.palette.common.black, 0.4)}`
              : '0 4px 20px rgba(0, 0, 0, 0.08)',
          background: theme.palette.background.paper
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography
            variant='h6'
            sx={{
              mb: { xs: 2, sm: 3 },
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              color: theme.palette.text.primary,
              fontSize: { xs: '1rem', sm: '1.25rem' }
            }}
          >
            <EmojiEvents sx={{ fontSize: { xs: 20, sm: 24 }, color: theme.palette.primary.main }} />
            Game Statistics
          </Typography>
          <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
            <Grid item xs={6}>
              <Box
                sx={{
                  textAlign: 'center',
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: '12px',
                  background:
                    theme.palette.mode === 'dark'
                      ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(
                          theme.palette.secondary.main,
                          0.15
                        )} 100%)`
                      : 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background:
                      theme.palette.mode === 'dark'
                        ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(
                            theme.palette.secondary.main,
                            0.2
                          )} 100%)`
                        : 'linear-gradient(135deg, rgba(102, 126, 234, 0.12) 0%, rgba(118, 75, 162, 0.12) 100%)',
                    transform: { xs: 'none', sm: 'translateY(-2px)' }
                  }
                }}
              >
                <Typography
                  variant='h3'
                  sx={{
                    fontWeight: 800,
                    color: theme.palette.primary.main,
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
                  }}
                >
                  {game.registeredUsers.length}
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    color: theme.palette.text.secondary,
                    fontWeight: 600,
                    mt: 0.5,
                    fontSize: { xs: '0.7rem', sm: '0.875rem' }
                  }}
                >
                  Registered Users
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box
                sx={{
                  textAlign: 'center',
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: '12px',
                  background:
                    theme.palette.mode === 'dark'
                      ? `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.15)} 0%, ${alpha(
                          theme.palette.success.light,
                          0.15
                        )} 100%)`
                      : 'linear-gradient(135deg, rgba(76, 175, 80, 0.08) 0%, rgba(139, 195, 74, 0.08) 100%)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background:
                      theme.palette.mode === 'dark'
                        ? `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.2)} 0%, ${alpha(
                            theme.palette.success.light,
                            0.2
                          )} 100%)`
                        : 'linear-gradient(135deg, rgba(76, 175, 80, 0.12) 0%, rgba(139, 195, 74, 0.12) 100%)',
                    transform: { xs: 'none', sm: 'translateY(-2px)' }
                  }
                }}
              >
                <Typography
                  variant='h3'
                  sx={{
                    fontWeight: 800,
                    color: theme.palette.success.main,
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
                  }}
                >
                  {game.participatedUsers.length}
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    color: theme.palette.text.secondary,
                    fontWeight: 600,
                    mt: 0.5,
                    fontSize: { xs: '0.7rem', sm: '0.875rem' }
                  }}
                >
                  Participants
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box
                sx={{
                  textAlign: 'center',
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: '12px',
                  background:
                    theme.palette.mode === 'dark'
                      ? `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.15)} 0%, ${alpha(
                          theme.palette.warning.dark,
                          0.15
                        )} 100%)`
                      : 'linear-gradient(135deg, rgba(255, 152, 0, 0.08) 0%, rgba(251, 140, 0, 0.08) 100%)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background:
                      theme.palette.mode === 'dark'
                        ? `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.2)} 0%, ${alpha(
                            theme.palette.warning.dark,
                            0.2
                          )} 100%)`
                        : 'linear-gradient(135deg, rgba(255, 152, 0, 0.12) 0%, rgba(251, 140, 0, 0.12) 100%)',
                    transform: { xs: 'none', sm: 'translateY(-2px)' }
                  }
                }}
              >
                <Typography
                  variant='h3'
                  sx={{
                    fontWeight: 800,
                    color: theme.palette.warning.main,
                    fontSize:
                      game?.forwardType === 'admin' && game?.status !== 'completed'
                        ? { xs: '1rem', sm: '1.2rem' }
                        : { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
                  }}
                >
                  {game?.forwardType === 'admin' && game?.status !== 'completed'
                    ? 'Admin'
                    : formatDuration(game?.duration)}
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    color: theme.palette.text.secondary,
                    fontWeight: 600,
                    mt: 0.5,
                    fontSize: { xs: '0.7rem', sm: '0.875rem' }
                  }}
                >
                  Duration
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box
                sx={{
                  textAlign: 'center',
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: '12px',
                  background:
                    theme.palette.mode === 'dark'
                      ? `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.15)} 0%, ${alpha(
                          theme.palette.error.dark,
                          0.15
                        )} 100%)`
                      : 'linear-gradient(135deg, rgba(239, 83, 80, 0.08) 0%, rgba(229, 57, 53, 0.08) 100%)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background:
                      theme.palette.mode === 'dark'
                        ? `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.2)} 0%, ${alpha(
                            theme.palette.error.dark,
                            0.2
                          )} 100%)`
                        : 'linear-gradient(135deg, rgba(239, 83, 80, 0.12) 0%, rgba(229, 57, 53, 0.12) 100%)',
                    transform: { xs: 'none', sm: 'translateY(-2px)' }
                  }
                }}
              >
                <Typography
                  variant='h3'
                  sx={{
                    fontWeight: 800,
                    color: theme.palette.error.main,
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
                  }}
                >
                  {game.rewards.length}
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    color: theme.palette.text.secondary,
                    fontWeight: 600,
                    mt: 0.5,
                    fontSize: { xs: '0.7rem', sm: '0.875rem' }
                  }}
                >
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
