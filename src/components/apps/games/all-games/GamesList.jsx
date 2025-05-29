import React, { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Container,
  Grid,
  Stack,
  Typography,
  useTheme
} from '@mui/material'
import { format } from 'date-fns'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import PeopleIcon from '@mui/icons-material/People'
import PersonIcon from '@mui/icons-material/Person'
import EventIcon from '@mui/icons-material/Event'
import ConfirmationDialog from '@/components/dialogs/confirmation-dialog';
import imagePlaceholder from '/public/images/misc/image-placeholder.png'
import { HourglassBottom as HourglassBottomIcon, Verified as VerifiedIcon } from '@mui/icons-material'
import { useSession } from 'next-auth/react'

const GameList = ({ games, onApprove, onViewGame, onDeleteGame, onEditGame, isSuperUser = false }) => {
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false) // Manage confirmation dialog
  const [gameToDelete, setGameToDelete] = useState(null) // Track the game to delete
  console.log('GameList games: ', games)
  const theme = useTheme()
  const { data: session } = useSession()

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

  const handleDeleteConfirmation = (game) => {
    setGameToDelete(game)
    setConfirmationDialogOpen(true)
  }

  return (
    <>
      <Container maxWidth='xl' sx={{ py: 4 }}>
        <Typography variant='h4' component='h1' gutterBottom sx={{ fontWeight: 700 }}>
          All Games
        </Typography>

        {games.length === 0 ? (
          <Box textAlign='center' py={6}>
            <Typography variant='body1' color='text.secondary'>
              No games found
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {games.map(game => (
              <Grid item key={game._id} xs={12} sm={6} md={4} lg={3}>
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
                      e.target.src = imagePlaceholder.src // Your fallback image
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

                        {/* Add approval notice for SuperUsers */}
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

                        {/* {game.tags?.length > 0 && (
                    <Stack direction='row' flexWrap='wrap' gap={1} mb={2}>
                      {game.tags.map(tag => (
                        <Chip key={tag} label={tag} size='small' color='secondary' variant='outlined' />
                      ))}
                    </Stack>
                  )} */}

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

                      <Stack direction='row' spacing={1} justifyContent='center'>
                        <Button variant='outlined' color='info' size='small' onClick={() => onViewGame(game._id)}>
                          Details
                        </Button>
                        {
                          // If the creator & logged in person is admin, and status is cancelled - can edit
                          // If the creator & logged in person is not admin(means superUser), and ifb status is created/cancelled - can edit
                          ((game.createdBy?.roles?.includes('ADMIN') &&
                            game.creatorEmail === session?.user?.email &&
                            ['cancelled'].includes(game.status)) ||
                            (!game.createdBy?.roles?.includes('ADMIN') &&
                              game.creatorEmail === session?.user?.email &&
                              ['created', 'cancelled'].includes(game.status))) && (
                            <Button
                              variant='outlined'
                              color='primary'
                              size='small'
                              onClick={() => onEditGame(game._id)}
                            >
                              Edit
                            </Button>
                          )
                        }
                        {!isSuperUser && game?.status === 'created' && (
                          <Button variant='outlined' color='success' size='small' onClick={() => onApprove(game._id)}>
                            Approve
                          </Button>
                        )}

                        { !['live', 'completed', 'lobby'].includes(game?.status) && ((isSuperUser  &&
                          game?.createdBy?.email === session?.user?.email &&
                          !game?.createdBy?.roles?.includes('ADMIN')) ||
                          (session?.user?.roles?.includes('ADMIN')
                            ))  && (
                          <Button
                            variant='outlined'
                            color='error'
                            size='small'
                            onClick={() => handleDeleteConfirmation(game)}
                          >
                            Delete
                          </Button>
                        )}
                      </Stack>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
      <ConfirmationDialog
        open={confirmationDialogOpen}
        setOpen={setConfirmationDialogOpen}
        type='delete-game' // Customize based on your context
        onConfirm={() => {
          onDeleteGame(gameToDelete?._id)
          setGameToDelete(null) // Reset after confirmation
        }}
      />
    </>
  )
}
export default GameList
