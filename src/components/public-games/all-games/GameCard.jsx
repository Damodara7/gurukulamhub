'use client'

import {
  Button,
  Card,
  useTheme,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Stack,
  Chip,
  Grid,
  Tooltip
} from '@mui/material'
import { useRouter } from 'next/navigation'
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { toast } from 'react-toastify'
import { useSession } from 'next-auth/react'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import EventIcon from '@mui/icons-material/Event'
import { format } from 'date-fns'
import imagePlaceholder from '/public/images/misc/image-placeholder.png'
import { useEffect, useState } from 'react'
import {
  EventAvailable as EventAvailableIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  LiveTv as LiveTvIcon
} from '@mui/icons-material'

const GameCard = ({ game }) => {
  const { data: session } = useSession()
  const router = useRouter()
  const theme = useTheme()
  const [timeRemaining, setTimeRemaining] = useState(null)

  // Status-based UI logic
  const isRegistrationOpen =
    game.requireRegistration && game.registrationEndTime ? new Date(game.registrationEndTime) > new Date() : true
  const isGameUpcoming = ['approved', 'lobby'].includes(game.status)
  const isGameLive = game.status === 'live'
  const isGameEnded = ['completed', 'cancelled'].includes(game.status)
  const isGameStarted = new Date(game?.startTime) < new Date()
  const isUserRegistered = !!game?.registeredUsers?.find(u => u.email === session?.user?.email) || false
  const isRegistrationRequired = game?.requireRegistration

  // Get game status for display in info stack
  const getGameStatusInfo = () => {
    if (game.status === 'cancelled') {
      return { text: 'Game Cancelled', icon: <CancelIcon fontSize='small' />, color: 'warning.main' }
    }

    if (game.status === 'completed') {
      return { text: 'Game Ended', icon: <CheckCircleIcon fontSize='small' />, color: 'success.main' }
    }

    if (game.status === 'live') {
      return { text: 'Live Now', icon: <LiveTvIcon fontSize='small' />, color: 'error.main' }
    }

    if (game.status === 'lobby') {
      const minutes = timeRemaining?.minutes
      const seconds = timeRemaining?.seconds
      return {
        text: timeRemaining ? `Join now - Starts in ${timeRemaining.minutes > 0 ? minutes + 'm ' : ''}${seconds}s`: 'Join now - Starting soon',
        icon: <AccessTimeIcon fontSize='small' />,
        color: 'info.main'
      }
    }

    // For created/approved status
    return {
      text: 'Upcoming Game - Join before 10m',
      icon: <EventAvailableIcon fontSize='small' />,
      color: 'primary.main'
    }
  }

  function getUserGameStatus() {
    // Convert to string for consistent comparison
    const userEmail = session?.user?.email

    // 1. Handle cancelled games (always shown)
    if (game.status === 'cancelled') {
      return { status: 'Cancelled', color: 'warning' }
    }

    // 2. Check user participation status
    const participation = game?.participatedUsers?.find(p => p.email === userEmail)

    if (participation) {
      return participation.completed
        ? { status: 'Completed', color: 'success' }
        : { status: 'In Progress', color: 'info' }
    }

    // 3. Check user registration status
    const isRegistered = game?.registeredUsers?.some(r => r.email === userEmail)

    if (isRegistered) {
      return game.status === 'completed'
        ? { status: 'Missed', color: 'error' }
        : { status: 'Registered', color: 'primary' }
    }

    return { status: '', color: 'default' }
  }

  const getUserStatusChip = () => {
    const { status, color } = getUserGameStatus()
    if (!status) return null

    return (
      <Chip
        label={status}
        color={color}
        size='small'
        variant='outlined'
        sx={{
          fontWeight: 500,
          borderWidth: 1.5,
          borderStyle: 'solid'
        }}
      />
    )
  }

  // Countdown timer effect for lobby status
  useEffect(() => {
    if (game.status === 'lobby' && game.startTime) {
      const startTime = new Date(game.startTime).getTime()
      let interval // Declare interval variable here

      const updateTimer = () => {
        const now = new Date().getTime()
        const distance = startTime - now

        if (distance > 0) {
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
          const seconds = Math.floor((distance % (1000 * 60)) / 1000)
          setTimeRemaining({ minutes, seconds })
        } else {
          setTimeRemaining(null)
          // clearInterval(interval)
        }
      }

      // Initial update
      updateTimer()

      // Update every second
      interval = setInterval(updateTimer, 1000)
      return () => clearInterval(interval)
    }
  }, [game.status, game.startTime])

  const handleView = () => {
    router.push(`/public-games/${game._id}`)
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

  const gameStatusInfo = getGameStatusInfo()

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[6]
        }
      }}
    >
      <CardMedia
        component='img'
        height='180'
        image={game?.thumbnailPoster || imagePlaceholder.src}
        alt={game.title}
        sx={{ objectFit: 'cover' }}
        onError={e => {
          // e.target.onerror = null // prevents looping
          e.target.src = imagePlaceholder.src // fallback image
        }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
          }}
        >
          <Stack direction='row' justifyContent='space-between' alignItems='center'>
            <Typography variant='h6' noWrap>
              {game.title || 'Not Specified'}
            </Typography>
            {getUserStatusChip()}
          </Stack>

          <Typography variant='body2' color='text.secondary' noWrap>
            {game.info || 'No description available'}
          </Typography>

          {/* Game Info */}
          <Box sx={{ flex: 1, my: 2, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
            <Stack spacing={1}>
              {/* Game Status Info - Added at the top */}
              <Stack direction='row' alignItems='flex-start' spacing={1}>
                <Box sx={{ color: gameStatusInfo.color }}>{gameStatusInfo.icon}</Box>
                <Typography variant='body2' sx={{ color: gameStatusInfo.color, fontWeight: 500 }}>
                  {gameStatusInfo.text}
                </Typography>
              </Stack>
              <Stack direction='row' alignItems='center' spacing={1}>
                <EventIcon fontSize='small' color='action' />
                <Typography variant='body2'>
                  {format(new Date(game.startTime), 'PPpp') || 'time is not Specified'}
                </Typography>
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
              <Stack direction='row' alignItems='flex-start' spacing={1}>
                <HourglassBottomIcon fontSize='small' color='action' />
                <Typography variant='body2'>
                  {isRegistrationRequired && isRegistrationOpen && !isGameEnded
                    ? `Reg closes on ${format(new Date(game?.registrationEndTime), 'Pp')}`
                    : 'No registartion required'}
                </Typography>
              </Stack>
            </Stack>
          </Box>
          {/* Buttons - Conditionally Rendered */}
          <Stack direction='row' justifyContent='center' spacing={2}>
            <Button variant='outlined' color='info' size='small' onClick={handleView}>
              View
            </Button>

            {/* {((isUserRegistered && !game?.participatedUsers?.find(p => p.email === session?.user?.email)?.completed) &&
              (isGameUpcoming && isRegistrationOpen && !isGameEnded) ||
              isGameLive) && (
              <Button
                disabled={isUserRegistered && !game.status === 'lobby'}
                variant='outlined'
                color='primary'
                size='small'
                onClick={handleJoin}
              >
                {!isRegistrationRequired || isUserRegistered
                  ? 'JOIN'
                  : !isUserRegistered && isRegistrationOpen && !isGameStarted
                    ? 'Register'
                    : 'Registration Ended'}
              </Button>
            )} */}

            {
              // Show join button if:
              // 1. User is registered but hasn't completed the game AND
              //    (game is upcoming with open registration OR game is live)
              // OR
              // 2. User is not registered AND registration is open AND game hasn't started
              ((isUserRegistered &&
                !game?.participatedUsers?.find(p => p.email === session?.user?.email)?.completed &&
                (isGameUpcoming || isGameLive)) ||
                (!isUserRegistered && isRegistrationOpen && !isGameStarted && !isGameEnded)) && (
                <Button
                  disabled={
                    isUserRegistered &&
                    game.status !== 'lobby' && !isGameLive &&
                    !game?.participatedUsers?.find(p => p.email === session?.user?.email)?.completed
                  }
                  variant='outlined'
                  color='primary'
                  size='small'
                  onClick={handleJoin}
                >
                  {isUserRegistered ? 'JOIN' : 'Register'}
                </Button>
              )
            }

            {isGameEnded && !['completed', 'cancelled'].includes(game.status) && (
              <Button variant='outlined' color='secondary' size='small' disabled>
                {game.status === 'completed' ? 'Completed' : 'Cancelled'}
              </Button>
            )}
          </Stack>
        </Box>
      </CardContent>
    </Card>
  )
}

export default GameCard;
