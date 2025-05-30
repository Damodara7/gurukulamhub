import React from 'react'
import { Box, Typography, Card, CardContent, Chip, Divider, Button, Stack, Avatar , LinearProgress } from '@mui/material'
import { LocationOn, Schedule, People, School, YouTube , AccessTime } from '@mui/icons-material'

const GameRegistrationNotice = ({ game }) => {
  // Function to format date and time
  const formatTime = dateString => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      year: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  // Calculate duration in hours and minutes
  const durationHours = Math.floor(game.duration / 60)
  const durationMinutes = game.duration % 60
  const durationText = `${durationHours > 0 ? `${durationHours}h` : ''}${durationMinutes > 0 ? ' '+durationMinutes+'m': ''}`

  return (
    <Box display='flex' flexDirection='column' alignItems='center' bgcolor='#f5f5f5' px={2} py={4} gap={4}>
      <Card sx={{ maxWidth: 500, p: 3, textAlign: 'center' }}>
        <CardContent>
          <Typography variant='h5' gutterBottom>
            🎉🎉 You are registered! 🎉🎉
          </Typography>

          <Typography
            variant='h4'
            sx={{
              color: 'primary.main', // Use theme color or replace with a hex
              fontWeight: 700, // Bold weight
              letterSpacing: 1, // Slight spacing between letters
              mb: 1, // Bottom margin
              textTransform: 'capitalize' // Optional: Capitalizes each word
            }}
          >
            {game.quiz.title}
          </Typography>

          <Typography variant='body1' sx={{ mt: 2 }}>
            You have registered the game on <strong>{game.quiz.syllabus}</strong>!
          </Typography>
          <Typography variant='h6' color='primary' sx={{ mt: 1 }}>
            {game.name}
          </Typography>

          <Box display='flex' gap={6} flexWrap='wrap' mt={2}>
            <Chip icon={<Schedule />} label={`Duration: ${durationText}`} color='info' variant='outlined' />
            {game.location && (
              <Chip
                icon={<LocationOn />}
                label={`${game.location.city}, ${game.location.region}`}
                color='success'
                variant='outlined'
              />
            )}
          </Box>

          <Typography variant='body1' sx={{ mt: 2 }}>
            The game will start at:
          </Typography>
          <Typography variant='h6' sx={{ mt: 1 }} color='primary'>
            {formatTime(game.startTime)}
          </Typography>

          <Typography variant='body2' color='error' sx={{ mt: 3 }}>
            Please be ready and join at least 10 minutes before the start time.
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ maxWidth: 800, width: '100%', borderRadius: 3, boxShadow: 3 }}>
        <Box
          sx={{
            height: 200,
            backgroundImage: `url(${game.quiz.thumbnail})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              p: 2,
              background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)'
            }}
          >
            <Typography variant='h4' color='white' fontWeight='bold'>
              {game.quiz.title}
            </Typography>
            <Typography variant='subtitle1' color='rgba(255,255,255,0.9)'>
              {game.title}
            </Typography>
          </Box>
        </Box>

        <CardContent sx={{ p: 4 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant='h6' gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <School sx={{ mr: 1 }} /> Quiz Details
            </Typography>
            <Typography variant='body1' paragraph>
              {game.quiz.details || 'Test your knowledge in this challenging quiz!'}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Language: {game.quiz.language.name}
            </Typography>
          </Box>

          {game.promotionalVideoUrl && (
            <Box sx={{ mb: 3 }}>
              <Button
                variant='contained'
                color='error'
                startIcon={<YouTube />}
                href={game.promotionalVideoUrl}
                target='_blank'
                sx={{ mb: 1 }}
              >
                Watch Promo Video
              </Button>
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Box>
              <Typography variant='subtitle2'>Organized by:</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Avatar sx={{ width: 32, height: 32, mr: 1 }}>{game.createdBy.email.charAt(0).toUpperCase()}</Avatar>
                <Typography>{game.createdBy.email}</Typography>
              </Box>
            </Box>

            <Box sx={{ textAlign: 'right' }}>
              <Typography variant='subtitle2'>Players Registered:</Typography>
              <Typography variant='h6' color='primary'>
                {game.registeredUsers.length}/{game.maxPlayers}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant='body2' color='text.secondary'>
              Don't forget to join 10 minutes before start time!
            </Typography>
            <Button
              variant='contained'
              color='primary'
              size='large'
              sx={{ mt: 2, px: 4 }}
              onClick={() => window.location.reload()} // Or navigate to game page
            >
              View Game Dashboard
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default GameRegistrationNotice
