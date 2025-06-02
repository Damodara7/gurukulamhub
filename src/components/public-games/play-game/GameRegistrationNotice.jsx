import React from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Divider,
  Button,
  Stack,
  Avatar,
  LinearProgress,
  Grid,
  useTheme
} from '@mui/material'
import {
  LocationOn,
  PlayCircle,
  SportsEsports,
  Schedule,
  People,
  School,
  YouTube,
  AccessTime,
  Videocam
} from '@mui/icons-material'
import ChevronToggleComponent from '@/components/media-viewer/ChevronToggleComponent'
import Language from '@mui/icons-material/Language'
import CancelIcon from '@mui/icons-material/Cancel'
import ReactPlayer from 'react-player'
import { useRouter } from 'next/navigation'
const GameRegistrationNotice = ({ game }) => {
  // Function to format date and time
  const theme = useTheme()
  const router = useRouter()
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
  const durationText = `${durationHours > 0 ? `${durationHours}h` : ''}${
    durationMinutes > 0 ? ' ' + durationMinutes + 'm' : ''
  }`

  // Determine location text

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

          <Box display='flex' gap={6} flexWrap='wrap' mt={2} alignItems='center' justifyContent='center'>
            <Chip icon={<Schedule />} label={`Duration: ${durationText}`} color='info' variant='outlined' />

            {game.location && (
              <Chip
                icon={<LocationOn />}
                label={
                  [game?.location?.city, game?.location?.region, game?.location?.country]
                    .filter(Boolean) // removes undefined/null/empty values
                    .join(' , ') || 'Anywhere'
                }
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

      <Grid container spacing={3}>
        {/* First Column (Details Card) */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1 }}>
              {/* Quiz Details */}
              <Stack spacing={3}>
                <Typography variant='body1'>
                  Explore the course links and documents below to learn more about the game.
                </Typography>
              </Stack>

              {/* Course Links */}
              <Box mt={3}>
                <ChevronToggleComponent
                  heading={'Course Links:'}
                  minimizedSubHeading={'Click the chevron to view course links'}
                >
                  {game?.quiz?.courseLinks?.length > 0 ? (
                    <Box className='flex flex-col gap-4'>
                      {game?.quiz?.courseLinks?.map((link, index) => (
                        <Box key={index} className='flex flex-col gap-1 items-start'>
                          <Box className='flex flex-col gap-1 items-center'>
                            <VideoAd url={link?.link || ''} showPause autoPlay={false} />
                            <ImagePopup imageUrl={link?.link || ''} mediaType={link.mediaType} />
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography color='error'>No course links exist.</Typography>
                  )}
                </ChevronToggleComponent>
              </Box>

              {/* Documents */}
              <Box mt={3}>
                <ChevronToggleComponent
                  heading={'Documents:'}
                  minimizedSubHeading={'Click the chevron to view documents'}
                >
                  {game?.quiz?.documents?.length > 0 ? (
                    game?.quiz?.documents?.map((document, index) => (
                      <Box key={index} display='flex' alignItems='center' gap={2} mb={1}>
                        <Typography variant='body2'>{`Document ${index + 1}: ${document?.description}`}</Typography>
                        <Link href={document?.document || ''} target='_blank' rel='noopener noreferrer'>
                          <Typography color='primary'>View Document</Typography>
                        </Link>
                      </Box>
                    ))
                  ) : (
                    <Typography color='error'>No documents exist.</Typography>
                  )}
                </ChevronToggleComponent>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Second Column (Video Card) */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, p: 3, height: '100%', minHeight: '300px' }}>
            <Stack spacing={3} height='100%'>
              <Typography variant='h6' sx={{ mb: 2 }}>
                <Videocam sx={{ mr: 1, verticalAlign: 'middle' }} />
                Promotional Video
              </Typography>
              {game.promotionalVideoUrl && (
                <Box sx={{ height: '100%', borderRadius: 2, overflow: 'hidden' }}>
                  <ReactPlayer url={game.promotionalVideoUrl} width='100%' height='100%' controls playing={false} />
                </Box>
              )}
            </Stack>
          </Card>
        </Grid>
      </Grid>

      <Box
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          mt: 4 // Adds margin above the button
        }}
      >
        <Button
          variant='outlined'
          color='primary'
          onClick={() => router.push('/public-games')}
          sx={{
            width: { xs: '100%', sm: 'auto' }, // Full width on mobile, auto on larger screens
            maxWidth: '345px',
            fontWeight: 'bold',
            py: 1.5,
            px: 4,
            fontSize: '1rem',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 2
            },
            transition: 'all 0.2s ease'
          }}
        >
          Back to All Games
        </Button>
      </Box>
    </Box>
  )
}

export default GameRegistrationNotice
