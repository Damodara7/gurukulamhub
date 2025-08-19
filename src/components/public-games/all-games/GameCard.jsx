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
  Tooltip,
  IconButton,
  Alert,
  AlertTitle
} from '@mui/material'
import { useRouter } from 'next/navigation'
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { toast } from 'react-toastify'
import { useSession } from 'next-auth/react'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import EventIcon from '@mui/icons-material/Event'
import { format } from 'date-fns'
import imagePlaceholder from '/public/images/misc/image-placeholder.png'
import { useEffect, useState } from 'react'
import ShareGamePopup from './ShareGamePopup'
import {
  EventAvailable as EventAvailableIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  LiveTv as LiveTvIcon,
  Share as ShareIcon
} from '@mui/icons-material'

const GameCard = ({ game, currentUserGroupIds = [] }) => {
  const { data: session } = useSession()
  const router = useRouter()
  const theme = useTheme()
  const [timeRemaining, setTimeRemaining] = useState(null)
  const [copied, setCopied] = useState(false)
  const [sharePopupOpen, setSharePopupOpen] = useState(false)

  // Group restriction logic
  const groupObj = game?.groupId && (game.groupId._id ? game.groupId : null)
  const groupIdStr = game?.groupId ? (game.groupId._id || game.groupId).toString() : null
  const isGroupRestricted = Boolean(groupIdStr)
  const isUserMemberOfGroup = !isGroupRestricted
    ? true
    : (currentUserGroupIds || []).map(g => (g?._id ? g._id.toString() : g.toString())).includes(groupIdStr)
  const showRestriction = isGroupRestricted && !isUserMemberOfGroup

  // Build compact filters text safely
  const filtersParts = []
  if (groupObj?.ageGroup?.min != null && groupObj?.ageGroup?.max != null) {
    filtersParts.push(`Age ${groupObj.ageGroup.min}-${groupObj.ageGroup.max}`)
  }
  if (groupObj?.gender) {
    const gendersArray = Array.isArray(groupObj.gender)
      ? groupObj.gender
      : typeof groupObj.gender === 'string'
      ? [groupObj.gender]
      : []
    if (gendersArray.length > 0) filtersParts.push(`Gender: ${gendersArray.join(', ')}`)
  }
  if (groupObj?.location) {
    const loc = groupObj.location || {}
    const locParts = [loc.city, loc.region, loc.country].filter(Boolean)
    if (locParts.length > 0) filtersParts.push(`Location: ${locParts.join(', ')}`)
  }

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
      return {
        text: `Game Cancelled${game?.cancellationReason ? ` (${game?.cancellationReason})` : ''}`,
        icon: <CancelIcon fontSize='small' />,
        color: 'warning.main'
      }
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
        text: timeRemaining
          ? `Join now - Starts in ${timeRemaining.minutes > 0 ? minutes + 'm ' : ''}${seconds}s`
          : 'Join now - Starting soon',
        icon: <AccessTimeIcon fontSize='small' />,
        color: 'info.main'
      }
    }

    // For created/approved status
    return {
      text: `Upcoming Game${isUserRegistered ? ' - Join before 10m' : ''}`,
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
        toast.success('You Registered the Game Successfully!')
        router.push(`/public-games/${game._id}/play`)
      } else {
        toast.error(res.message)
      }
    } catch (e) {
      toast.error(e.message)
    }
  }

  // Handle copy with temporary feedback
  const handleCopy = () => {
    navigator.clipboard.writeText(game.pin)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500) // Reset after 1.5 seconds
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
        height='150'
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
              <Tooltip title='Share game'>
                <IconButton
                  size='small'
                  onClick={() => setSharePopupOpen(true)}
                  sx={{
                    mx: 2,
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  <ShareIcon fontSize='small' />
                </IconButton>
              </Tooltip>
            </Typography>
            {getUserStatusChip()}
          </Stack>

          <Typography variant='body2' color='text.secondary' noWrap>
            {game.description || 'No description available'}
          </Typography>

          {/* Game Info */}
          <Box sx={{ flex: 1, my: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
            <Stack spacing={1}>
              {/* Game Status Info - Added at the top */}
              {!showRestriction && (
                <Stack direction='row' alignItems='flex-start' spacing={1}>
                  <Box sx={{ color: gameStatusInfo.color }}>{gameStatusInfo.icon}</Box>
                  <Typography variant='body2' sx={{ color: gameStatusInfo.color, fontWeight: 500 }}>
                    {gameStatusInfo.text}
                  </Typography>
                </Stack>
              )}
              {showRestriction && (
                <Alert
                  severity='error'
                  variant='outlined'
                  sx={{ my: 1, py: 0.75, px: 1, '& .MuiAlert-message': { width: '100%', py: 0, my: 0 } }}
                >
                  <AlertTitle sx={{ fontWeight: 700, fontSize: '0.85rem', mb: 0 }}>Restricted to group</AlertTitle>
                  <Typography variant='caption' sx={{ display: 'block' }}>
                    {`You're not allowed to play this game.`}
                  </Typography>
                </Alert>
              )}

              <Stack direction='row' alignItems='center' spacing={1}>
                <Typography variant='body2'> Quiz on : {game?.quiz?.title}</Typography>
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
                  {(() => {
                    if (!game?.rewards?.length) return 'Not mentioned'

                    const firstReward = [...game.rewards].sort((a, b) => a.position - b.position)[0]
                    const sponsor = firstReward?.sponsors?.[0]
                    const rewardType = sponsor?.rewardDetails?.rewardType

                    if (rewardType === 'cash') {
                      return new Intl.NumberFormat(undefined, {
                        style: 'currency',
                        currency: sponsor?.rewardDetails?.currency || 'INR'
                      }).format(firstReward.rewardValuePerWinner)
                    }

                    if (rewardType === 'physicalGift') {
                      return sponsor?.rewardDetails?.nonCashReward
                    }

                    return 'Custom Reward'
                  })()}
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
          {/* Game Pin Display */}
          {game.pin && (
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Stack
                direction='row'
                spacing={1}
                alignItems='center'
                justifyContent='center'
                sx={{
                  bgcolor: 'background.paper',
                  py: 0.5,
                  px: 1,
                  borderRadius: 1,
                  display: 'inline-flex',
                  border: `1px solid ${theme.palette.divider}`
                }}
              >
                <Typography variant='body2' sx={{ fontWeight: 500 }}>
                  Game PIN: {game.pin}
                </Typography>
                <Tooltip title={copied ? 'Copied!' : 'Copy PIN'} placement='top'>
                  <IconButton
                    size='small'
                    onClick={handleCopy}
                    sx={{
                      p: 0.5,
                      '&:hover': {
                        bgcolor: 'action.hover'
                      }
                    }}
                  >
                    <ContentCopyIcon fontSize='small' />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Box>
          )}

          {/* Buttons - Conditionally Rendered */}
          <Stack direction='row' justifyContent='center' spacing={2}>
            <Button variant='outlined' color='info' size='small' onClick={handleView}>
              View
            </Button>

            {((!game?.participatedUsers?.find(p => p.email === session?.user?.email)?.completed &&
              (isGameUpcoming || isGameLive)) ||
              (!isUserRegistered && isRegistrationOpen && !isGameStarted && !isGameEnded)) && (
              <Button
                disabled={
                  showRestriction ||
                  (game.status !== 'lobby' &&
                    game.status !== 'approved' &&
                    !isGameLive &&
                    !game?.participatedUsers?.find(p => p.email === session?.user?.email)?.completed)
                }
                sx={{ cursor: showRestriction ? 'not-allowed' : 'pointer' }}
                variant='outlined'
                color='primary'
                size='small'
                onClick={handleJoin}
              >
                {isUserRegistered ? 'JOIN' : 'Register'}
              </Button>
            )}

            {isGameEnded && !['completed', 'cancelled'].includes(game.status) && (
              <Button variant='outlined' color='secondary' size='small' disabled>
                {game.status === 'completed' ? 'Completed' : 'Cancelled'}
              </Button>
            )}
          </Stack>
        </Box>
      </CardContent>
      <ShareGamePopup open={sharePopupOpen} onClose={() => setSharePopupOpen(false)} game={game} />
    </Card>
  )
}

export default GameCard
