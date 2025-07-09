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

function AdminForwardHeader({ game  }) {
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
    <Card sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', p: 3 }}>
        <Avatar
          variant='rounded'
          src={game?.thumbnailPoster || imagePlaceholder?.src}
          sx={{
            width: 150,
            height: 150,
            mr: 3,
            borderRadius: 2
          }}
          onError={e => (e.target.src = imagePlaceholder?.src)}
        />
        <Box sx={{ flexGrow: 1 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mb: 2,
              gap: 2
            }}
          >
            <Typography variant='h4' component='h1'>
              {game.title}
            </Typography>
            <Chip
              label={game.status.toUpperCase()}
              color={statusColors[game.status]}
              variant='outlined'
              size='medium'
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
            <Alert
              severity={
                countdownColor === 'error.main' ? 'error' : countdownColor === 'warning.main' ? 'warning' : 'info'
              }
              icon={false}
              sx={{
                mt: 3,
                mb: 2,
                p: 1,
                alignItems: 'center',
                animation: `${blink} 1s infinite`,
                '& .MuiAlert-message': {
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center'
                }
              }}
            >
              <Typography
                variant='h6'
                sx={{
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  color:
                    countdownColor === 'error.main'
                      ? theme.palette.error.dark
                      : countdownColor === 'warning.main'
                        ? theme.palette.warning.dark
                        : theme.palette.info.dark
                }}
              >
                <Box
                  component='span'
                  sx={{
                    animation: `${pulse} 1s infinite`,
                    display: 'inline-flex'
                  }}
                >
                  <AccessTime fontSize='medium' />
                </Box>
                The game will start automatically in:
                <Box
                  component='span'
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    bgcolor: 'background.default',
                    borderRadius: 1,
                    minWidth: '120px',
                    textAlign: 'center'
                  }}
                >
                  {timeRemaining || game?.status}
                </Box>
              </Typography>
            </Alert>
          )}
        </Box>
      </Box>
    </Card>
  )
}

export default AdminForwardHeader
