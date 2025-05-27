'use client'

import { Button, Card, CardContent, CardMedia, Typography, Box, Stack, Chip, Grid, Tooltip } from '@mui/material'
import { useRouter } from 'next/navigation'
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import CustomChipWithIcon from './CustomChipWithIcon'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { toast } from 'react-toastify'
import { useSession } from 'next-auth/react'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import PeopleIcon from '@mui/icons-material/People'
import PersonIcon from '@mui/icons-material/Person'
import EventIcon from '@mui/icons-material/Event'
import { format } from 'date-fns'
import gameThumbnailImage from '/public/images/games/game_thumbnail.png'
import { useEffect, useState } from 'react'

const GameCard = ({ game }) => {
  const { data: session } = useSession()
  const router = useRouter()
  const [timeRemaining, setTimeRemaining] = useState(null)

  // Countdown timer effect for lobby status
  useEffect(() => {
    if (game.status === 'lobby' && game.startTime) {
      const startTime = new Date(game.startTime).getTime()

      const updateTimer = () => {
        const now = new Date().getTime()
        const distance = startTime - now

        if (distance > 0) {
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
          const seconds = Math.floor((distance % (1000 * 60)) / 1000)
          setTimeRemaining({ minutes, seconds })
        } else {
          setTimeRemaining(null)
          clearInterval(interval)
        }
      }

      // Initial update
      updateTimer()

      // Update every second
      const interval = setInterval(updateTimer, 1000)
      return () => clearInterval(interval)
    }
  }, [game.status, game.startTime])

  const handleView = () => {
    router.push(`/public-games/${game._id}`)
  }

  const handleRegister = () => {
    router.push(`/public-games/${game._id}/register`)
  }

  const handleJoin = async () => {
    try {
      const res = await RestApi.post(`${API_URLS.v0.USERS_GAME}/${game._id}/join`, {
        user: { id: session.user.id, email: session.user.email }
      })
      if (res.status === 'success') {
        toast.success('You joined the game successfully!')
        router.push(`/public-games/${game._id}/play`)
      } else {
        toast.error(res.message)
      }
    } catch (e) {
      toast.error(e.message)
    }
  }

  // Status-based UI logic
  const isRegistrationOpen = new Date(game.registrationEndTime) > new Date()
  const isGameUpcoming = ['approved', 'lobby'].includes(game.status)
  const isGameLive = game.status === 'live'
  const isGameEnded = ['completed', 'cancelled'].includes(game.status)

  // Chip label configuration
  const getStatusLabel = () => {
    switch (game.status) {
      case 'approved':
        return 'Not Started Yet'
      case 'lobby':
        return timeRemaining
          ? `Starts in ${timeRemaining.minutes}m ${timeRemaining.seconds.toString().padStart(2, '0')}s`
          : 'Starting soon'
      case 'live':
        return 'Live'
      case 'completed':
        return 'Completed'
      case 'cancelled':
        return 'Cancelled'
      default:
        return game.status.toUpperCase()
    }
  }

  return (
    <Card sx={{ maxWidth: 400, margin: 2, display: 'flex', flexDirection: 'column' }}>
      <CardMedia component='img' src={game?.thumbnailPoster} height={'140px'} alt={game.title} />
      <CardContent sx={{ flex: 1 }}>
        <Stack direction='row' justifyContent='space-between' alignItems='center'>
          <Typography variant='h6' noWrap>
            {game.title}
          </Typography>
          <Chip
            label={getStatusLabel()}
            color={
              game.status === 'live'
                ? 'error'
                : ['completed', 'cancelled'].includes(game.status)
                  ? 'default'
                  : 'primary'
            }
            size='small'
            variant='outlined'
          />
        </Stack>

        <Typography variant='body2' color='text.secondary' noWrap>
          {game.info}
        </Typography>

        {/* Game Info */}
        <Stack spacing={1} mb={3}>
          <Stack direction='row' alignItems='center' spacing={1}>
            <EventIcon fontSize='small' color='action' />
            <Typography variant='body2'>{format(new Date(game.startTime), 'PPpp')}</Typography>
          </Stack>

          <Stack direction='row' alignItems='center' spacing={1}>
            <LocationOnIcon fontSize='small' color='action' />
            <Typography variant='body2' textTransform='capitalize'>
              {game?.location?.city || game.location?.region || game.location?.country || 'Anywhere'}
            </Typography>
          </Stack>

          <Stack direction='row' alignItems='flex-start' spacing={1}>
            <EmojiEventsIcon fontSize='small' color='action' />
            <Typography variant='body2'>
              {game?.totalRewardValue
                ? new Intl.NumberFormat(undefined, { style: 'currency', currency: 'INR' }).format(
                    game?.totalRewardValue
                  )
                : 'Not mentioned'}
            </Typography>
          </Stack>

          {isRegistrationOpen && !isGameEnded && (
            <Stack direction='row' alignItems='flex-start' spacing={1}>
              <HourglassBottomIcon fontSize='small' color='action' />
              <Typography variant='body2'>Reg closes on {format(new Date(game?.registrationEndTime), 'Pp')}</Typography>
            </Stack>
          )}
        </Stack>

        {/* Buttons - Conditionally Rendered */}
        <Stack direction='row' justifyContent='center' spacing={2} mt={2}>
          <Button variant='outlined' color='info' onClick={handleView}>
            View
          </Button>

          {/* {isGameUpcoming && isRegistrationOpen && (
            <Button variant='outlined' color='success' onClick={handleRegister}>
              Register
            </Button>
          )} */}

          {((isGameUpcoming && isRegistrationOpen) || isGameLive) && (
            <Button variant='outlined' color='primary' onClick={handleJoin}>
              Join
            </Button>
          )}

          {isGameEnded && (
            <Button variant='outlined' color='secondary' disabled>
              {game.status === 'completed' ? 'Completed' : 'Cancelled'}
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}

export default GameCard
