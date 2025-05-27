import {
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
import imagePlaceholder from '/public/images/misc/image-placeholder.png'

const GameList = ({ games, onApprove, onViewGame, onEditGame }) => {
  const theme = useTheme()

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

  return (
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

                  <Stack direction='row' spacing={1} justifyContent='center'>
                    <Button variant='outlined' color='info' size='small' onClick={() => onViewGame(game._id)}>
                      Details
                    </Button>
                    {['created', 'approved'].includes(game.status) &&
                      (game?.registrationEndTime ? new Date() < new Date(game?.registrationEndTime) : true) && (
                        <Button variant='outlined' color='primary' size='small' onClick={() => onEditGame(game._id)}>
                          Edit
                        </Button>
                      )}
                    {game.status === 'created' && (
                      <Button variant='outlined' color='success' size='small' onClick={() => onApprove(game._id)}>
                        Approve
                      </Button>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  )
}

export default GameList
