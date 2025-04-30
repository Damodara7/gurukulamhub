'use client'

import React, { useState, useEffect } from 'react'
import { Grid,Fab, Card, CardMedia, CardContent, Typography, Box, ButtonBase, Button } from '@mui/material'
import { red } from '@mui/material/colors'
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import { styled, keyframes } from '@mui/system'
import CountdownTimer from './CountDownTimer'
import { useRouter } from 'next/navigation';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EditIcon from '@mui/icons-material/Edit';
import Diversity2Icon from '@mui/icons-material/Diversity2';
import VisibilityIcon from '@mui/icons-material/Visibility';
import StartIcon from '@mui/icons-material/Start';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

// Live pulse animation for the live icon
const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
`

// Styled component for the live icon
const LiveIcon = styled(PlayCircleFilledWhiteIcon)(({ theme }) => ({
  color: red[500],
  animation: `${pulse} 1.5s infinite ease-in-out`,
  fontSize: '3rem',
  [theme.breakpoints.down('sm')]: {
    fontSize: '2.2rem'
  }
}))



// Sample data (replace this with real live games data)
const liveGames = [
  {
    id: 1,
    title: 'Ultimate Quiz Showdown',
    details: 'Compete against the best in this knowledge-packed quiz!',
    startedAt: new Date(new Date().getTime() + 5000).toISOString(),
    gameStatus:"live",
    status:"active",
    posterUrl:"",
    promoVideoUrl:"",
  },
  {
    id: 2,
    title: 'History Buffs Challenge',
    details: 'Test your knowledge on world history in this exciting quiz.',
    startedAt: new Date(new Date().getTime() + 10000).toISOString(),
    gameStatus:"active",
    status:"active",
  },
  {
    id: 3,
    title: 'Science Whiz Kids',
    details: 'Can you answer questions about the wonders of science?',
    startedAt: new Date(new Date().getTime() + 15000).toISOString(),
    gameStatus:"archive",
    status:"active",
  },
  {
    id: 4,
    title: 'Geography Masters',
    details: 'Identify countries, capitals, and landmarks in this geography quiz.',
    startedAt: new Date(new Date().getTime() + 20000).toISOString()
  },
  {
    id: 5,
    title: 'Pop Culture Frenzy',
    details: 'Test your knowledge of movies, music, and pop culture trivia!',
    startedAt: new Date(new Date().getTime() + 25000).toISOString()
  },
  {
    id: 6,
    title: 'Sports Trivia Showdown',
    details: 'Answer questions about sports legends, teams, and events.',
    startedAt: new Date(new Date().getTime() + 30000).toISOString()
  },
  {
    id: 7,
    title: 'Math Wizards',
    details: 'Solve quick math problems and puzzles in this fast-paced quiz.',
    startedAt: new Date(new Date().getTime() + 35000).toISOString()
  },
  {
    id: 8,
    title: 'Literature Legends',
    details: 'Do you know the most famous books and authors? Find out here!',
    startedAt: new Date(new Date().getTime() + 40000).toISOString()
  },
  {
    id: 9,
    title: 'General Knowledge Quiz Bash',
    details: 'The ultimate test of your all-around knowledge!',
    startedAt: new Date(new Date().getTime() + 45000).toISOString()
  }
]

const LiveGames = ({liveGames}) => {
  const router = useRouter();

  const handleClick = game => {
    console.log(`Clicked on game: ${game.title}`)
    // Handle navigation or other logic here
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

  const handleJoinGame = gameId =>{
    console.log(`Joining game with ID: ${gameId}`)
    router.push("/game/join/")
  }

  const handleRunGame = gameId =>{
    console.log("Run page of game with",gameId);
    router.push("/mygames/run/"+gameId)
  }

  return (
    <Box sx={{ pb: 1 }}>
      {/* Padding responsive to screen size */}
       <Grid container spacing={4} rowSpacing={6}>
        {liveGames.map(game => (
          <Grid item xs={12} sm={6} md={4} key={game._id}>
            <ButtonBase
              onClick={() => handleClick(game)} // Ripple effect on click
              sx={{ display: 'flex', width: '100%', textAlign: 'initial', height: '100%' }}
            >
              <Card
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
                <CardMedia
                  component='img'
                  height='200'
                  image={game.thumbnailUrl || 'https://via.placeholder.com/150'}
                  alt={game.title}
                  sx={{
                    filter: 'brightness(0.9)',
                    transition: 'filter 0.3s',
                    '&:hover': { filter: 'brightness(1)' },
                    height: { xs: '180px', md: '200px' }, // Responsive height
                    objectFit:"contain"
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
                  </Box>
                  <Box sx={{display:"flex", alignItems:"center",justifyContent:"space-around"}}>
                  <CountdownTimer startTime={game.startDate} />
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-around" }}>

                    {/* Icon Buttons for Edit and View */}
                    <Fab
                      onClick={() => handleRunGame(game._id)}
                      aria-label="view"
                      component='label'
                      size="small"
                      color='primary'
                      variant='contained'
                      sx={{color:"white"}}
                    >
                      <RocketLaunchIcon />
                    </Fab>
                    <Fab
                      onClick={() => handleJoinGame(game._id)}
                      aria-label="view"
                      component='label'
                      size="small"
                      color='primary'
                      variant='contained'
                      sx={{color:"white"}}
                    >
                      <Diversity2Icon />
                    </Fab>
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

                  </Box>

                </CardContent>

                <Box
                  sx={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.1rem',
                    backgroundColor: 'rgba(255, 0, 0, 0.85)',
                    borderRadius: '30px',
                    padding: '5px 12px',
                    color: '#fff',
                    boxShadow: '0 0 15px rgba(255, 0, 0, 0.7)',
                    animation: 'pulse 1.5s infinite ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      boxShadow: '0 0 20px rgba(255, 0, 0, 1)'
                    }
                  }}
                >
                  <LiveIcon sx={{ fontSize: { xs: '1.5rem', md: '2rem' }, marginRight: '12px', color: 'white' }} />
                  <Typography
                    variant='body1'
                    fontWeight='bold'
                    sx={{
                      letterSpacing: '0.1em',
                      textShadow: '0 0 8px rgba(255, 0, 0, 1)',
                      fontSize: { xs: '0.8rem', md: '1rem' }, // Responsive font size
                      color: 'white'
                    }}
                  >
                    LIVE
                  </Typography>
                </Box>
              </Card>
            </ButtonBase>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default LiveGames
