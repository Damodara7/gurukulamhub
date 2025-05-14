'use client'

import { Button, Card, CardContent, CardMedia, Typography, Box, Stack, Chip, Grid , Tooltip } from '@mui/material'

import { useRouter } from 'next/navigation'
import EventIcon from '@mui/icons-material/Event'
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import CustomChipWithIcon from './CustomChipWithIcon';
import { size } from '@floating-ui/react'
const GameCard = ({ game }) => {
  const router = useRouter()

  const handleView = () => {
    // Add your logic for the view action
    router.push(`/public-games/${game._id}`)
  }

  const handleRegister = () => {
    // Add your logic for the register action
    router.push(`/public-games/${game._id}/register`)
  }

  const handleJoin = () => {
    console.log('inside the handle join');
  }


  return (
    <Card sx={{ maxWidth: 400, margin: 2, display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component='img'
        height='180'
        image={game.thumbnailPoster}
        alt={game.title}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ flex: 1 }}>
        <Typography variant='h6' noWrap>
          {game.title}
        </Typography>
        <Typography variant='body2' color='text.secondary' noWrap>
          {game.info}
        </Typography>

        {/* Info Grid */}
        <Grid container spacing={1}>
          {/* Start Time */}
          <Grid item xs={12} sm={6} sx={{ mt: 1 }}>
            <CustomChipWithIcon 
              icon={<EventIcon color='primary' />}
              label={`${new Date(game.startTime).toLocaleDateString()} ${new Date(game.startTime).toLocaleTimeString(
                [],
                { hour: '2-digit', minute: '2-digit' }
              )}`}
              title={new Date(game.startTime).toLocaleString()}
              color='primary'
            />
          </Grid>

          {/* Registration End Time */}
          <Grid item xs={12} sm={6} sx={{ mt: 1 }}>
            <CustomChipWithIcon
              icon={<HourglassBottomIcon sx={{ color: 'error.main' }} />}
              label={`${new Date(game.registrationEndTime).toLocaleDateString()} ${new Date(
                game.registrationEndTime
              ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
              title={new Date(game.registrationEndTime).toLocaleString()}
              color='secondary'
            />
          </Grid>

          {/* Location */}
          <Grid item xs={12} sm={6} sx={{ mt: 1 }}>
            <CustomChipWithIcon
              icon={<LocationOnIcon sx={{ color: 'success.main' }} />}
              label={`${game.location.city}, ${game.location.region}, ${game.location.country}`}
              title={`${game.location.city}, ${game.location.region}, ${game.location.country}`}
            />
          </Grid>

          {/* Reward */}
          <Grid item xs={12} sm={6} sx={{ mt: 1 }}>
            <CustomChipWithIcon
              icon={<EmojiEventsIcon sx={{ color: '#FFD700' }} />}
              label={`₹${game.totalRewardValue}`}
              title={`₹${game.totalRewardValue}`}
              color='success'
            />
          </Grid>
        </Grid>

        {/* Buttons */}
        <Stack direction='row' spacing={2} mt={2}>
          <Button variant='contained' color='primary' onClick={handleView}>
            View
          </Button>
          <Button variant='contained' color='primary' onClick={handleRegister}>
            Register
          </Button>
          <Button variant='contained' color='primary' onClick={handleJoin}>
            Join
          </Button>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default GameCard
