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

const GameCard = ({ game }) => {
  const { data: session } = useSession()
  const router = useRouter()

  const handleView = () => {
    // Add your logic for the view action

    router.push(`/public-games/${game._id}`)
  }

  const handleRegister = () => {
    // Add your logic for the register action
    console.log('hello')
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
      <CardMedia
        component='img'
        src={game?.thumbnailPoster}
        height={'140px'}
        alt={game.title}
      />
      <CardContent sx={{ flex: 1 }}>
        <Typography variant='h6' noWrap>
          {game.title}
        </Typography>
        <Typography variant='body2' color='text.secondary' noWrap>
          {game.info}
        </Typography>

        {/* Game Info */}
        <Stack spacing={1} mb={3}>
          <Stack direction='row' alignItems='center' spacing={1}>
            <EventIcon fontSize='small' color='action' />
            <Typography variant='body2'>{format(new Date(game.startTime), 'PPpp')}</Typography>
          </Stack>

          {/* <Stack direction='row' alignItems='center' spacing={1}>
            <AccessTimeIcon fontSize='small' color='action' />
            <Typography variant='body2'>{Math.floor(game.duration / 60)} minutes</Typography>
          </Stack> */}

          {/* <Stack direction='row' alignItems='center' spacing={1}>
            <PeopleIcon fontSize='small' color='action' />
            <Typography variant='body2'>
              {game.registeredUsers?.length || 0} / {game.maxPlayers || '∞'} players
            </Typography>
          </Stack> */}

          <Stack direction='row' alignItems='center' spacing={1}>
            <LocationOnIcon fontSize='small' color='action' />
            <Typography variant='body2' textTransform='capitalize'>
              {game?.location?.city || game.location?.region || game.location?.country || 'Any where'}
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
            <Typography variant='body2'>Reg Closes on {format(new Date(game?.registrationEndTime), 'Pp')}</Typography>
          </Stack>
        </Stack>

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
