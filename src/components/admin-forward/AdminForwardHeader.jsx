import React, { useEffect, useMemo, useState } from 'react'
import { Card, Box, Avatar, Typography, Chip, Paper, LinearProgress, Alert, useTheme } from '@mui/material'
import { Schedule, People, AccessTime } from '@mui/icons-material'
import imagePlaceholder from '/public/images/misc/image-placeholder.png'

const statusColors = {
  created: 'default',
  approved: 'success',
  lobby: 'info',
  live: 'error',
  completed: 'primary',
  cancelled: 'error'
}

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
        if (game?.status === 'lobby' && game?.forwardType === 'admin') {
          setTimeRemaining('Waiting for admin to start')
          setCountdownColor('warning.main')
        } else {
          setTimeRemaining('Game is Starting Now')
          setCountdownColor('success.main')
        }
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
            <Box sx={{ mt: 2, mb: 1, width: '100%' }}>
              <Alert
                severity={
                  countdownColor === 'error.main' ? 'error' : countdownColor === 'warning.main' ? 'warning' : 'info'
                }
                icon={false}
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  '& .MuiAlert-message': { width: '100%' }
                }}
              >
                {game?.forwardType === 'admin' &&
                game?.status === 'lobby' &&
                timeRemaining === 'Waiting for admin to start' ? (
                  <Typography variant='body2' fontWeight={600} textAlign='center'>
                    Scheduled time reached — use the Start Game panel below when you are ready.
                  </Typography>
                ) : (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1.5
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTime fontSize='small' />
                      <Typography variant='body2' fontWeight={600}>
                        {game?.forwardType === 'admin' && game?.status === 'lobby'
                          ? 'Lobby — scheduled start in:'
                          : 'The game will start automatically in:'}
                      </Typography>
                    </Box>
                    <Typography
                      variant='body2'
                      fontWeight={700}
                      fontFamily='monospace'
                      sx={{
                        px: 1.5,
                        py: 0.5,
                        bgcolor: 'background.default',
                        borderRadius: 1
                      }}
                    >
                      {timeRemaining || game?.status}
                    </Typography>
                  </Box>
                )}
              </Alert>
            </Box>
          )}
        </Box>
      </Box>
    </Card>
  )
}

export default AdminForwardHeader
