// components/apps/games/all-games/GameCard.js
import React from 'react'
import { Alert, Box, Button, Card, CardContent, CardMedia, Chip, Stack, Typography, useTheme } from '@mui/material'
import { format } from 'date-fns'
import { 
  AccessTime as AccessTimeIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  Event as EventIcon,
  HourglassBottom as HourglassBottomIcon,
  Verified as VerifiedIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Send as SendIcon,
  Leaderboard as LeaderboardIcon,
  Delete as DeleteIcon
} from '@mui/icons-material'
import SettingsIcon from '@mui/icons-material/Settings'
import { useSession } from 'next-auth/react'
import imagePlaceholder from '/public/images/misc/image-placeholder.png'
import IconButtonTooltip from '@/components/IconButtonTooltip'

const getStatusChip = status => {
  const statusConfig = {
    created: { color: 'default', label: 'Created' },
    approved: { color: 'info', label: 'Approved' },
    lobby: { color: 'primary', label: 'Lobby' },
    live: { color: 'error', label: 'Live' },
    completed: { color: 'success', label: 'Completed' },
    cancelled: { color: 'warning', label: 'Cancelled' }
  }

  const config = statusConfig[status] || statusConfig.default
  return (
    <Chip
      label={config.label}
      color={config.color}
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

const CreatorGameCard = ({ game, isSuperUser = false, onViewGame, onEditGame, onApproveGame, onDeleteGame, onLeaderboard , onAdminForward}) => {
  const { data: session } = useSession()
  const theme = useTheme()

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
          e.target.src = imagePlaceholder.src
        }}
      />

      <CardContent sx={{ flexGrow: 1 }}>
        <Box className='flex flex-col justify-between' style={{ height: '100%' }}>
          <Box>
            <Stack direction='row' justifyContent='space-between' alignItems='flex-start' mb={0}>
              <Typography variant='h6' fontWeight={600}>
                {game.title}
              </Typography>
              {getStatusChip(game.status)}
            </Stack>

            <Typography
              variant='body2'
              color='text.secondary'
              mb={2}
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {game.description}
            </Typography>

            {isSuperUser && game.status === 'created' && (
              <Alert
                severity='warning'
                icon={false}
                style={{ textAlign: 'center' }}
                variant='outlined'
                sx={{
                  my: 2,
                  py: 0,
                  display: 'block',
                  '& .MuiAlert-message': {
                    padding: '4px 0',
                    fontSize: '0.8rem'
                  }
                }}
              >
                <Box className='flex gap-2 items-center justify-center'>
                  <HourglassBottomIcon fontSize='small' />
                  <span>Waiting for admin approval</span>
                </Box>
              </Alert>
            )}
            {isSuperUser && game.status === 'approved' && (
              <Alert
                severity='success'
                icon={false}
                style={{ textAlign: 'center' }}
                variant='outlined'
                sx={{
                  my: 2,
                  py: 0,
                  display: 'block',
                  '& .MuiAlert-message': {
                    padding: '4px 0',
                    fontSize: '0.8rem'
                  }
                }}
              >
                <Box className='flex gap-2 items-center justify-center'>
                  <VerifiedIcon fontSize='small' />
                  <span>Approved by admin!</span>
                </Box>
              </Alert>
            )}

            <Stack spacing={1} mb={3}>
              <Stack direction='row' alignItems='center' spacing={1}>
                <EventIcon fontSize='small' color='action' />
                <Typography variant='body2'>{format(new Date(game.startTime), 'PPpp')}</Typography>
              </Stack>

              <Stack direction='row' alignItems='center' spacing={1}>
                <AccessTimeIcon fontSize='small' color='action' />
                <Typography variant='body2'>{Math.floor(game.duration / 60)} minutes</Typography>
              </Stack>

              <Stack direction='row' alignItems='center' spacing={1}>
                <PeopleIcon fontSize='small' color='action' />
                <Typography variant='body2'>
                  {game.participatedUsers?.length || 0} / {game.maxPlayers || '∞'} players
                </Typography>
              </Stack>

              <Stack direction='row' alignItems='center' spacing={1}>
                <PersonIcon fontSize='small' color='action' />
                <Typography variant='body2' noWrap>
                  {game.creatorEmail}
                </Typography>
              </Stack>
            </Stack>
          </Box>

          <Stack
            direction='row'
            spacing={1}
            gap={1}
            justifyContent='center'
            className='border border-gray-200 rounded-md p-1'
          >
            <IconButtonTooltip title='View Details' onClick={() => onViewGame(game._id)} color='info'>
              <VisibilityIcon />
            </IconButtonTooltip>
            {((session?.user?.roles?.includes('ADMIN') && ['created', 'approved', 'cancelled'].includes(game.status)) ||
              (!game.createdBy?.roles?.includes('ADMIN') &&
                game.creatorEmail === session?.user?.email &&
                ['created', 'cancelled'].includes(game.status))) && (
              <IconButtonTooltip title='Edit Game' onClick={() => onEditGame(game._id)} color='warning'>
                <EditIcon />
              </IconButtonTooltip>
            )}
            {!isSuperUser && game?.status === 'created' && (
              <IconButtonTooltip title='Approve Game' onClick={() => onApproveGame(game._id)} color='success'>
                <SendIcon />
              </IconButtonTooltip>
            )}
            {['live', 'completed'].includes(game?.status) && (
              <IconButtonTooltip title='View Leaderboard' onClick={() => onLeaderboard(game._id)} color='primary'>
                <LeaderboardIcon />
              </IconButtonTooltip>
            )}
            {!['live', 'lobby'].includes(game?.status) &&
              ((isSuperUser &&
                game?.createdBy?.email === session?.user?.email &&
                !game?.createdBy?.roles?.includes('ADMIN')) ||
                session?.user?.roles?.includes('ADMIN')) && (
                <IconButtonTooltip title='Delete Game' onClick={() => onDeleteGame(game)} color='error'>
                  <DeleteIcon />
                </IconButtonTooltip>
              )}
            {session?.user?.roles?.includes('ADMIN') && (
              <IconButtonTooltip title='Admin Forward' onClick={() => onAdminForward(game._id)} color='warning'>
                <SettingsIcon />
              </IconButtonTooltip>
            )}
          </Stack>
        </Box>
      </CardContent>
    </Card>
  )
}

export default CreatorGameCard
