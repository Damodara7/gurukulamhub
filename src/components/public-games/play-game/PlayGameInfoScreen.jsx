import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Container,
  Divider,
  Grid,
  Stack,
  Typography,
  useTheme,
  keyframes,
  Alert
} from '@mui/material'
import { AccessTime, People, Person, LocationOn, PlayCircle, SportsEsports, ListAlt } from '@mui/icons-material'
import ReactPlayer from 'react-player'
import { format, formatDistanceToNow } from 'date-fns'

const blink = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
`

const GamePlayInfoScreen = ({ game, setShouldStartGame }) => {
  const theme = useTheme()
  const [timeRemaining, setTimeRemaining] = useState('')
  const [isVideoReady, setIsVideoReady] = useState(false)
  const [countdownColor, setCountdownColor] = useState('primary.main')

  // Calculate time remaining until game starts
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date()
      const startTime = new Date(game.startTime)
    //   const startTime = new Date(new Date('2025-05-15T11:02:00Z') + 2* 60 * 1000)
      const diffInSeconds = Math.floor((startTime - now) / 1000)

      if (diffInSeconds <= 0) {
        setTimeRemaining('Game is starting now!')
        setCountdownColor('success.main')
        setShouldStartGame(true)
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
  }, [game.startTime, setShouldStartGame])

  const getStatusChip = () => {
    const statusConfig = {
      created: { color: 'warning', label: 'Pending', icon: <AccessTime /> },
      live: { color: 'success', label: 'Live', icon: <PlayCircle /> },
      completed: { color: 'default', label: 'Ended', icon: <SportsEsports /> }
    }

    const config = statusConfig[game.status] || statusConfig.default
    return (
      <Chip
        icon={config.icon}
        label={config.label}
        color={config.color}
        variant='outlined'
        sx={{
          fontWeight: 600,
          borderWidth: 1.5,
          px: 1,
          '& .MuiChip-icon': {
            color: theme.palette[config.color].main
          }
        }}
      />
    )
  }

  const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      {/* Blinking Countdown Banner */}
      <Alert
        severity={countdownColor === 'error.main' ? 'error' : countdownColor === 'warning.main' ? 'warning' : 'info'}
        icon={false}
        sx={{
          mb: 3,
          p:1,
          alignItems: 'center',
          animation: `${blink} 1.5s infinite`,
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
              animation: `${pulse} 2s infinite`,
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
            {timeRemaining}
          </Box>
        </Typography>
      </Alert>

      <Grid container spacing={4}>
        {/* Left Column - Game Media */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 2, overflow: 'hidden' }}>
            {game.promotionalVideoUrl ? (
              <Box sx={{ position: 'relative', pt: '56.25%' }}>
                <ReactPlayer
                  url={game.promotionalVideoUrl}
                  width='100%'
                  height='100%'
                  style={{ position: 'absolute', top: 0, left: 0 }}
                  controls
                  onReady={() => setIsVideoReady(true)}
                  playing={false}
                />
              </Box>
            ) : (
              <CardMedia
                component='img'
                height='400'
                image={game.thumbnailPoster}
                alt={game.title}
                sx={{ objectFit: 'cover' }}
              />
            )}
          </Card>

          {/* Game Description */}
          <Card sx={{ mt: 3, p: 3 }}>
            <Typography variant='h6' gutterBottom fontWeight={600}>
              About This Game
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              {game.description}
            </Typography>

            {game.tags?.length > 0 && (
              <Stack direction='row' flexWrap='wrap' gap={1} mt={2}>
                {game.tags.map(tag => (
                  <Chip key={tag} label={tag} size='small' color='primary' variant='outlined' />
                ))}
              </Stack>
            )}
          </Card>

          {/* Game Instructions */}
          <Card sx={{ mt: 3, borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={3}>
                {/* Title */}
                <Typography variant='h6' sx={{ fontWeight: 600 }}>
                  Game Instructions
                </Typography>

                <Divider />

                {/* Instructions List */}
                <Box component='ul' sx={{ pl: 5, mb: 1 }}>
                  {[
                    'The game will start automatically when the countdown reaches zero.',
                    'All players must be ready when the game begins.',
                    'Questions will appear one after another with limited time to answer.',
                    'Answer quickly and accurately to score maximum points.',
                    `The game PIN is ${game.pin} - share it with friends to join.`,
                    'Winners will be announced immediately after the game ends.'
                  ].map((instruction, index) => (
                    <Typography
                      key={index}
                      component='li'
                      variant='body2'
                      sx={{ fontSize: '0.85rem', lineHeight: 1.8 }}
                    >
                      {instruction}
                    </Typography>
                  ))}
                </Box>

                {/* Pro Tip */}
                <Box sx={{ p: 2, borderRadius: 1, backgroundColor: 'grey.100' }}>
                  <Typography variant='body2' sx={{ fontStyle: 'italic' }}>
                    Pro Tip: Stay focused and avoid refreshing the page once the game starts.
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Game Info */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 20, borderRadius: 2 }}>
            <CardContent>
              <Stack spacing={3}>
                {/* Game Title and Status */}
                <Box>
                  <Typography variant='h5' fontWeight={700} gutterBottom>
                    {game.title}
                  </Typography>
                  <Stack direction='row' alignItems='center' spacing={1}>
                    {getStatusChip()}
                    <Typography variant='body2' color='text.secondary'>
                      PIN: {game.pin}
                    </Typography>
                  </Stack>
                </Box>

                <Divider />

                {/* Game Duration */}
                <Stack spacing={1}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Game Duration
                  </Typography>
                  <Stack direction='row' alignItems='center' spacing={1}>
                    <AccessTime color='primary' />
                    <Typography variant='body1'>{Math.floor(game.duration / 60)} minutes</Typography>
                  </Stack>
                  <Typography variant='caption' color='text.secondary'>
                    Starting at {format(new Date(game.startTime), 'h:mm a')}
                  </Typography>
                </Stack>

                <Divider />

                {/* Players Information */}
                <Stack spacing={1}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Players
                  </Typography>
                  <Stack direction='row' alignItems='center' spacing={1}>
                    <People color='primary' />
                    <Typography variant='body1'>{game.registeredUsers?.length || 0} players ready</Typography>
                  </Stack>
                  {game.maxPlayers && (
                    <Typography variant='caption' color='text.secondary'>
                      Max players: {game.maxPlayers}
                    </Typography>
                  )}
                </Stack>

                <Divider />

                {/* Location */}
                {game.location && (
                  <Stack spacing={1}>
                    <Typography variant='subtitle2' color='text.secondary'>
                      Location
                    </Typography>
                    <Stack direction='row' alignItems='center' spacing={1}>
                      <LocationOn color='primary' />
                      <Typography variant='body1'>
                        {[game.location.city, game.location.region, game.location.country].filter(Boolean).join(', ')}
                      </Typography>
                    </Stack>
                  </Stack>
                )}

                <Divider />

                {/* Creator Info */}
                <Stack spacing={1}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Created By
                  </Typography>
                  <Stack direction='row' alignItems='center' spacing={1}>
                    <Person color='primary' />
                    <Typography variant='body1'>{game.creatorEmail}</Typography>
                  </Stack>
                  <Typography variant='caption' color='text.secondary'>
                    Created {formatDistanceToNow(new Date(game.createdAt))} ago
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}

export default GamePlayInfoScreen
