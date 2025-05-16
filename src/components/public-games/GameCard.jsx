'use client'

import { Button, Card, CardContent, CardMedia, Typography, Box, Stack, Chip, Grid, Tooltip } from '@mui/material'

import { useRouter } from 'next/navigation'
import EventIcon from '@mui/icons-material/Event'
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import CustomChipWithIcon from './CustomChipWithIcon'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { toast } from 'react-toastify'
import { useSession } from 'next-auth/react'

const GameCard = ({ game }) => {
  const { data: session } = useSession()
  const router = useRouter()

  const handleView = () => {
    // Add your logic for the view action
    router.push(`/public-games/${game._id}`)
  }

  const handleRegister = () => {
    // Add your logic for the register action
    router.push(`/public-games/${game._id}/register`)
  }

  const handleJoin = async () => {
    console.log('inside the handle join')
    try {
      const res = await RestApi.post(`${API_URLS.v0.USERS_GAME}/${game._id}/join`, {
        user: { id: session.user.id, email: session.user.email }
      })
      if (res.status === 'success') {
        toast.success('You joined the game successfully!')
        router.push(`/public-games/${game._id}/play`)
      } else {
        console.log(res.message)
        toast.error(res.message)
      }
    } catch (e) {
      console.log(e.message)
      toast.error(e.message)
    }
  }

  return (
    <Card sx={{ maxWidth: 400, margin: 2, display: 'flex', flexDirection: 'column' }}>
      <CardMedia component='img' height='180' src={game.thumbnailPoster} alt={game.title} sx={{ objectFit: 'cover' }} />
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
              icon={<EventIcon />}
              label={`${new Date(game.startTime).toLocaleDateString()} ${new Date(game.startTime).toLocaleTimeString(
                [],
                { hour: '2-digit', minute: '2-digit' }
              )}`}
              title={new Date(game.startTime).toLocaleString()}
              color='primary'
              iconSx={{ color: '#1976d2' }} // blue icon
              chipSx={{ backgroundColor: 'rgba(25, 118, 210, 0.1)' }} // light blue background
            />
          </Grid>

          {/* Registration End Time */}
          <Grid item xs={12} sm={6} sx={{ mt: 1 }}>
            <CustomChipWithIcon
              icon={<HourglassBottomIcon />}
              label={`${new Date(game.registrationEndTime).toLocaleDateString()} ${new Date(
                game.registrationEndTime
              ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
              title={new Date(game.registrationEndTime).toLocaleString()}
              iconSx={{ color: '#ff5252' }}
              chipSx={{ backgroundColor: 'rgba(244, 67, 54, 0.15)' }}
            />
          </Grid>

          {/* Location */}
          <Grid item xs={12} sm={6} sx={{ mt: 1 }}>
            <CustomChipWithIcon
              icon={<LocationOnIcon sx={{ color: 'success.main' }} />}
              label={(() => {
                if (game.location?.city) {
                  return game.location.city
                }
                if (game.location?.region) {
                  return game.location.region
                }
                return game.location?.country || 'Location not specified'
              })()}
              title={(() => {
                if (game.location?.city) {
                  return `${game.location.city}${game.location.region ? `, ${game.location.region}` : ''}${
                    game.location.country ? `, ${game.location.country}` : ''
                  }`
                }
                if (game.location?.region) {
                  return `${game.location.region}${game.location.country ? `, ${game.location.country}` : ''}`
                }
                return game.location?.country || 'Location not specified'
              })()}
              iconSx={{ color: '#4caf50' }}
              chipSx={{ backgroundColor: 'rgba(76, 175, 80, 0.1)' }}
            />
          </Grid>

          {/* Reward */}
          <Grid item xs={12} sm={6} sx={{ mt: 1 }}>
            <CustomChipWithIcon
              icon={<EmojiEventsIcon sx={{ color: '#FFD700' }} />}
              label={`₹${game.totalRewardValue}`}
              title={`₹${game.totalRewardValue}`}
              iconSx={{ color: '#FFD700' }} // gold icon
              chipSx={{ backgroundColor: 'rgba(255, 215, 0, 0.15)' }} // light gold background
            />
          </Grid>
        </Grid>

        {/* Buttons */}
        <Stack direction='row' spacing={2} mt={2}>
          <Button variant='outlined' color='info' onClick={handleView}>
            View
          </Button>
          <Button variant='outlined' color='success' onClick={handleRegister}>
            Register
          </Button>
          <Button variant='outlined' color='primary' onClick={handleJoin}>
            Join
          </Button>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default GameCard
