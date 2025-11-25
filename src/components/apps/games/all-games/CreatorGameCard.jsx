// components/apps/games/all-games/GameCard.js
import React from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Stack,
  Typography,
  useTheme,
  Tooltip
} from '@mui/material'
import { alpha } from '@mui/material/styles'
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
    cancelled: { color: 'warning', label: 'Cancelled' },
    awaiting_sponsorship: { color: 'warning', label: 'Awaiting Sponsorship' },
    sponsored: { color: 'info', label: 'Sponsored' },
    default: { color: 'default', label: 'Unknown' }
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
        borderStyle: 'solid',
        fontSize: { xs: '0.7rem', sm: '0.75rem' },
        height: { xs: 24, sm: 28 }
      }}
    />
  )
}

const CreatorGameCard = ({
  game,
  isSuperUser = false,
  onViewGame,
  onEditGame,
  onApproveGame,
  onDeleteGame,
  onLeaderboard,
  onAdminForward
}) => {
  const { data: session } = useSession()
  const theme = useTheme()

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: theme.palette.background.paper,
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow:
            theme.palette.mode === 'dark' ? `0 8px 24px ${alpha(theme.palette.common.black, 0.4)}` : theme.shadows[6]
        }
      }}
    >
      <CardMedia
        component='img'
        image={game?.thumbnailPoster || imagePlaceholder.src}
        alt={game.title}
        sx={{
          objectFit: 'cover',
          height: { xs: 140, sm: 160, md: 180 },
          width: '100%'
        }}
        onError={e => {
          e.target.src = imagePlaceholder.src
        }}
      />

      <CardContent sx={{ flexGrow: 1, p: { xs: 1.5, sm: 2 } }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%'
          }}
        >
          <Box>
            <Stack
              direction='row'
              justifyContent='space-between'
              alignItems='flex-start'
              spacing={1}
              sx={{ mb: { xs: 1, sm: 1.5 } }}
            >
              <Typography
                variant='h6'
                fontWeight={600}
                sx={{
                  fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  lineHeight: 1.3
                }}
              >
                {game.title}
              </Typography>
              {getStatusChip(game.status)}
            </Stack>

            <Typography
              variant='body2'
              color='text.secondary'
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                mb: { xs: 1.5, sm: 2 },
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                lineHeight: 1.5
              }}
            >
              {game.description}
            </Typography>

            {/* Group Information */}
            {game?.groupId && (
              <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
                <Chip
                  label={`Restricted to group - "${game.groupId?.groupName || 'Private Group'}"`}
                  color='error'
                  variant='filled'
                  size='small'
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
                    textTransform: 'none',
                    height: { xs: 24, sm: 28 },
                    '& .MuiChip-label': {
                      px: { xs: 1, sm: 1.5 },
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: { xs: '200px', sm: 'none' }
                    }
                  }}
                />
              </Box>
            )}

            {isSuperUser && game.status === 'created' && (
              <Alert
                severity='warning'
                icon={false}
                variant='outlined'
                sx={{
                  my: { xs: 1.5, sm: 2 },
                  py: { xs: 0.5, sm: 0 },
                  display: 'block',
                  textAlign: 'center',
                  '& .MuiAlert-message': {
                    padding: { xs: '4px 0', sm: '4px 0' },
                    fontSize: { xs: '0.75rem', sm: '0.8rem' }
                  }
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    gap: { xs: 1, sm: 2 },
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <HourglassBottomIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                  <span>Waiting for admin approval</span>
                </Box>
              </Alert>
            )}
            {isSuperUser && game.status === 'approved' && (
              <Alert
                severity='success'
                icon={false}
                variant='outlined'
                sx={{
                  my: { xs: 1.5, sm: 2 },
                  py: { xs: 0.5, sm: 0 },
                  display: 'block',
                  textAlign: 'center',
                  '& .MuiAlert-message': {
                    padding: { xs: '4px 0', sm: '4px 0' },
                    fontSize: { xs: '0.75rem', sm: '0.8rem' }
                  }
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    gap: { xs: 1, sm: 2 },
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <VerifiedIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                  <span>Approved by admin!</span>
                </Box>
              </Alert>
            )}

            <Stack spacing={{ xs: 0.75, sm: 1 }} sx={{ mb: { xs: 2, sm: 3 } }}>
              {game.startTime && (
                <Stack direction='row' alignItems='center' spacing={{ xs: 0.75, sm: 1 }}>
                  <EventIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' }, color: 'action' }} />
                  <Typography
                    variant='body2'
                    sx={{
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1
                    }}
                  >
                    {format(new Date(game.startTime), 'PPpp')}
                  </Typography>
                </Stack>
              )}

              {game.duration && !game?.forwardType === 'admin' && (
                <Stack direction='row' alignItems='center' spacing={{ xs: 0.75, sm: 1 }}>
                  <AccessTimeIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' }, color: 'action' }} />
                  <Typography variant='body2' sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    {Math.floor(game.duration / 60)} minutes
                  </Typography>
                </Stack>
              )}

              <Stack direction='row' alignItems='center' spacing={{ xs: 0.75, sm: 1 }}>
                <PeopleIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' }, color: 'action' }} />
                <Typography variant='body2' sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  {game.participatedUsers?.length || 0} / {game.maxPlayers || '∞'} players
                </Typography>
              </Stack>

              <Stack direction='row' alignItems='center' spacing={{ xs: 0.75, sm: 1 }}>
                <PersonIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' }, color: 'action' }} />
                <Typography
                  variant='body2'
                  sx={{
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1
                  }}
                >
                  {game.creatorEmail}
                </Typography>
              </Stack>
            </Stack>
          </Box>

          <Stack
            direction='row'
            spacing={{ xs: 0.5, sm: 1 }}
            gap={{ xs: 0.5, sm: 1 }}
            justifyContent='center'
            sx={{
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1,
              p: { xs: 0.75, sm: 1 },
              flexWrap: 'wrap'
            }}
          >
            <IconButtonTooltip title='View Details' onClick={() => onViewGame(game._id)} color='info'>
              <VisibilityIcon />
            </IconButtonTooltip>
            {((session?.user?.roles?.includes('ADMIN') &&
              ['created', 'approved', 'cancelled', 'sponsored'].includes(game.status)) ||
              (!game.createdBy?.roles?.includes('ADMIN') &&
                game.creatorEmail === session?.user?.email &&
                ['created', 'cancelled', 'sponsored'].includes(game.status))) && (
              <IconButtonTooltip
                title={game.status === 'sponsored' ? 'Schedule Game' : 'Edit Game'}
                onClick={() => onEditGame(game._id)}
                color={game.status === 'sponsored' ? 'info' : 'warning'}
              >
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
            {game?.forwardType === 'admin' &&
              !['cancelled', 'completed'].includes(game?.status) &&
              (!game?.forwardingAdmin || game?.forwardingAdmin?.email === session?.user?.email) && (
                <IconButtonTooltip title='Admin Forward' onClick={() => onAdminForward(game)} color='warning'>
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
