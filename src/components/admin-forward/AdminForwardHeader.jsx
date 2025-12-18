import React, { useEffect, useMemo, useState } from 'react'
import { Card, Box, Avatar, Typography, Chip, Paper, keyframes, LinearProgress, Alert, useTheme } from '@mui/material'
import { Schedule, People, AccessTime } from '@mui/icons-material'
import imagePlaceholder from '/public/images/misc/image-placeholder.png'

const blink = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
`
const statusColors = {
  created: 'default',
  approved: 'success',
  lobby: 'info',
  live: 'error',
  completed: 'primary',
  cancelled: 'error'
}
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`

function AdminForwardHeader({ game }) {
  const theme = useTheme()
  const [countdownColor, setCountdownColor] = useState('primary.main')
  const [timeRemaining, setTimeRemaining] = useState('')

  // Calculate time remaining until game starts
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date()
      const startTime = new Date(game?.startTime)
      //   const startTime = new Date(new Date('2025-05-15T11:02:00Z') + 2* 60 * 1000)
      const diffInSeconds = Math.floor((startTime - now) / 1000)

      if (diffInSeconds <= 0) {
        setTimeRemaining('Game is Starting Now')
        setCountdownColor('success.main')
        // setShouldRedirect(true)
        return
      }
      // Change color based on time remaining
      if (diffInSeconds <= 30) {
        setCountdownColor('error.main')
      } else if (diffInSeconds <= 60) {
        setCountdownColor('warning.main')
      } else {
        setCountdownColor('primary.main')
      }

      const hours = Math.floor(diffInSeconds / 3600)
      const minutes = Math.floor((diffInSeconds % 3600) / 60)
      const seconds = diffInSeconds % 60

      setTimeRemaining(`${hours > 0 ? `${hours}h ` : ''}${minutes}m ${seconds}s`)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [game.startTime])

  const gamestatus = game?.status === 'completed' || game?.status === 'live' || game?.status === 'cancelled'

  return (
    <Card sx={{ mb: 3, overflow: 'visible' }}>
      <Box
        sx={{ display: 'flex', p: { xs: 2, sm: 3 }, flexDirection: { xs: 'column', md: 'row' }, overflow: 'visible' }}
      >
        <Avatar
          variant='rounded'
          src={game?.thumbnailPoster || imagePlaceholder?.src}
          sx={{
            width: { xs: 100, sm: 120, md: 150 },
            height: { xs: 100, sm: 120, md: 150 },
            mr: { xs: 0, md: 3 },
            mb: { xs: 2, md: 0 },
            borderRadius: 2,
            alignSelf: { xs: 'center', md: 'flex-start' }
          }}
          onError={e => (e.target.src = imagePlaceholder?.src)}
        />
        <Box sx={{ flexGrow: 1, minWidth: 0, overflow: 'visible' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mb: 2,
              gap: 2,
              flexWrap: 'wrap'
            }}
          >
            <Typography
              variant='h4'
              component='h1'
              sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }, wordBreak: 'break-word' }}
            >
              {game.title}
            </Typography>
            <Chip
              label={game.status.toUpperCase()}
              color={statusColors[game.status]}
              variant='outlined'
              size='medium'
              sx={{ flexShrink: 0 }}
            />
          </Box>
          <Typography variant='body1' color='text.secondary' sx={{ mb: 2 }}>
            {game.description}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Chip
              icon={<Schedule />}
              label={`Start Time: ${new Date(game.startTime).toLocaleString()}`}
              variant='outlined'
            />
          </Box>
          {!gamestatus && (
            <Box
              sx={{
                mt: 2,
                mb: 1,
                width: '100%',
                position: 'relative',
                overflow: 'visible'
              }}
            >
              <Alert
                severity={
                  countdownColor === 'error.main' ? 'error' : countdownColor === 'warning.main' ? 'warning' : 'info'
                }
                icon={false}
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  alignItems: 'center',
                  animation: `${blink} 1s infinite`,
                  overflow: 'visible',
                  '& .MuiAlert-message': {
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexWrap: { xs: 'wrap', sm: 'nowrap' },
                    gap: { xs: 1, sm: 1.5 },
                    overflow: 'visible'
                  }
                }}
              >
                <Box
                  component='span'
                  sx={{
                    animation: `${pulse} 1s infinite`,
                    display: 'inline-flex',
                    flexShrink: 0
                  }}
                >
                  <AccessTime fontSize='small' />
                </Box>
                <Typography
                  variant='body2'
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: '0.75rem', sm: '0.85rem' },
                    color:
                      countdownColor === 'error.main'
                        ? theme.palette.error.dark
                        : countdownColor === 'warning.main'
                          ? theme.palette.warning.dark
                          : theme.palette.info.dark,
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  The game will start automatically in:
                </Typography>
                <Box
                  component='span'
                  sx={{
                    px: { xs: 1.25, sm: 1.5 },
                    py: { xs: 0.5, sm: 0.75 },
                    bgcolor: 'background.default',
                    borderRadius: 1,
                    minWidth: { xs: '100px', sm: '120px' },
                    textAlign: 'center',
                    fontWeight: 700,
                    fontSize: { xs: '0.85rem', sm: '0.95rem' },
                    fontFamily: 'monospace',
                    letterSpacing: '0.05em',
                    color:
                      countdownColor === 'error.main'
                        ? theme.palette.error.dark
                        : countdownColor === 'warning.main'
                          ? theme.palette.warning.dark
                          : theme.palette.info.dark,
                    flexShrink: 0,
                    overflow: 'visible',
                    whiteSpace: 'nowrap',
                    display: 'inline-block'
                  }}
                >
                  {timeRemaining || game?.status}
                </Box>
              </Alert>
            </Box>
          )}
        </Box>
      </Box>
    </Card>
  )
}

export default AdminForwardHeader
