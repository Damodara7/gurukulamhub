import React from 'react'
import { Box, Card, CardContent, CardMedia, Typography, Button, Grid, ButtonBase, IconButton, Fab } from '@mui/material'
import { CheckCircle as ScheduledIcon, Error as UnscheduledIcon } from '@mui/icons-material'
import { styled } from '@mui/system'
import CountdownTimer from './CountDownTimer'
import EditIcon from '@mui/icons-material/Edit';
import { useRouter } from 'next/navigation';
import NotificationsIcon from '@mui/icons-material/Notifications';
import StartIcon from '@mui/icons-material/Start';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const games = [
  // Replace with your games data
  {
    id: 1,
    title: 'Game 1',
    details: 'Details of Game 1',
    image: 'https://via.placeholder.com/150',
    startDate:"2024-09-24T14:09",
    startTime:"2024-09-24T16:09"
  },
  {
    id: 2,
    title: 'Game 2',
    details: 'Details of Game 2',
    image: 'https://via.placeholder.com/150',
    startTime: null
  },
  {
    id: 1,
    title: 'Game 1',
    details: 'Details of Game 1',
    image: 'https://via.placeholder.com/150',
    startTime: new Date().toISOString()
  },
  {
    id: 1,
    title: 'Game 1',
    details: 'Details of Game 1',
    image: 'https://via.placeholder.com/150',
    startTime: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Game 2',
    details: 'Details of Game 2 uuwreiueyrwfdfjshdgfytuewuyjhgefjhfdweyryetryagdhasfgdafsgedrqytdyagdahsdfagsreytyaf',
    image: 'https://via.placeholder.com/150',
    startTime: null
  }
]


// Custom CardBanner styled component
const CardBanner = styled(Box)(({ theme, status }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  borderRadius: '0px',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  backgroundColor: status === 'scheduled' ? 'rgba(0, 128, 0, 0.85)' : 'rgba(255, 0, 0, 0.85)',
  padding: '5px 10px',
  fontSize: '6px',
  fontWeight: 500,
  color: '#fff',
  boxShadow: `0 0 15px ${status === 'scheduled' ? 'rgba(0, 128, 0, 0.7)' : 'rgba(255, 0, 0, 0.7)'}`,
  transformOrigin: 'top left',
  height: 'auto',
  zIndex: 1,
  '&:hover': {
    boxShadow: `0 0 20px ${status === 'scheduled' ? 'rgba(0, 128, 0, 1)' : 'rgba(255, 0, 0, 1)'}`
  }
}))

// Styled Card component for archived games
const ActiveGameCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'scale(1.025)',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)'
  }
}))

function ActiveGames({ activeGames }) {
  const router = useRouter();

  const handleStartGame = gameId => {
    // Implement the logic to start the game
    console.log(`Starting game with ID: ${gameId}`)
  }

  const handleEditGame = gameId => {
    // Implement the logic to start the game
    console.log(`Editing game with ID: ${gameId}`)
    router.push("/mygames/edit/"+gameId);
  }

  const handleViewGame = gameId => {
    // Implement the logic to start the game
    console.log(`Starting game with ID: ${gameId}`)
    router.push("/mygames/view/"+gameId);

  }

  return (
    <Box sx={{ padding: 2 }}>
      {/* <Typography variant='h4' gutterBottom textAlign='center' color='primary'>
        Active Games
      </Typography> */}
      <Grid container spacing={4} rowSpacing={6}>
        {activeGames.map(game => (
          <Grid item xs={12} sm={6} md={4} key={game._id}>
            <ButtonBase sx={{ display: 'flex', width: '100%', textAlign: 'initial', height: '100%' }}>
              <ActiveGameCard
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  width: '100%',
                  position: 'relative',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.025)'
                  }
                }}
              >
                <CardBanner status={game.startDate ? 'scheduled' : 'unscheduled'}>
                  {game.startDate ? (
                    <ScheduledIcon sx={{ color: 'white' }} />
                  ) : (
                    <UnscheduledIcon sx={{ color: 'white' }} />
                  )}
                  <Typography sx={{ color: 'white' }} variant='body1' fontSize={14} fontWeight='bold'>
                    {game.startDate ? 'Scheduled' : 'Unscheduled'}
                  </Typography>
                </CardBanner>
                <CardMedia
                  component='img'
                  height='200'
                  image={game.thumbnailUrl || 'https://via.placeholder.com/150'}
                  alt={game.title}
                  sx={{
                    filter: 'brightness(0.8)',
                    transition: 'filter 0.3s',
                    '&:hover': { filter: 'brightness(1)' },
                    height: { xs: '180px', md: '200px' },
                    objectFit: "contain" // Responsive height
                  }}
                />
                <CardContent
                  sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: { xs: '12px', md: '14px' }
                  }}
                >
                  <Box>
                    <Typography
                      variant='h6'
                      fontWeight='bold'
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {game.title}
                    </Typography>
                    <Typography
                      sx={{
                        overflow: 'hidden', // Hides overflow content
                        textOverflow: 'ellipsis', // Adds ellipsis when text overflows
                        whiteSpace: 'nowrap' // Prevents text from wrapping to the next line
                      }}
                      variant='body2'
                      color='text.secondary'
                      paragraph
                    >
                      {game.details}
                    </Typography>
                    <Box sx={{ display: "flex", padding: "4px", gap: "1rem" }}>
                      <Typography variant='body2' color='text.secondary'>
                         {game.startDate ? new Date(game.startDate).toLocaleString() : 'N/A'}
                      </Typography>
                      <CountdownTimer startTime={game.startDate}></CountdownTimer>

                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-around" }}>
                    <Fab
                      variant='contained'
                      color='primary'
                      component='label'
                      size="small"
                      onClick={() => handleStartGame(game.id)}
                      sx={{ marginTop: 2, color: 'white' }}
                    >
                      <NotificationsIcon></NotificationsIcon>
                    </Fab>

                    {/* Icon Buttons for Edit and View */}
                    <Fab
                    color="primary"
                    component='label'
                      onClick={(e) => {
                         handleEditGame(game._id) }}
                      aria-label="edit"
                      size="small"
                      sx={{color:"white"}}
                    >
                      <EditIcon />
                    </Fab>
                    <Fab
                      onClick={() => handleViewGame(game._id)}
                      aria-label="view"
                      component='label'
                      size="small"
                      color='primary'
                      variant='contained'
                      sx={{color:"white"}}
                    >
                      <VisibilityIcon />
                    </Fab>
                    <Fab
                      onClick={() => handleStartGame(game._id)}
                      aria-label="start"
                      component='label'
                      size="small"
                      color='primary'
                      variant='contained'
                      sx={{display: game.startDate ? "none":'', color:"white"}}
                    >
                      <StartIcon />
                    </Fab>
                  </Box>

                </CardContent>
              </ActiveGameCard>
            </ButtonBase>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default ActiveGames
