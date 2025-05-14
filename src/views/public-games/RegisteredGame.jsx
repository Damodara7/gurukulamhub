'use client'
import React, { useState } from 'react'
import { Box, Button, Typography } from '@mui/material'
import RegisterForm from '@/components/public-games/registered-game/RegisterForm';


const games = {
  1: {
    id: '1',
    title: 'Battle Royale',
    pin: '123456',
    description: 'Multiplayer survival challenge',
    quiz: 'quiz123',
    startTime: '2025-06-15T18:00:00Z',
    duration: 600,
    promotionalVideoUrl: '',
    thumbnailPoster: 'https://picsum.photos/200/300',
    requireRegistration: true,
    registrationEndTime: '2025-06-15T17:00:00Z',
    maxPlayers: 100,
    tags: ['survival', 'multiplayer'],
    location: {
      country: 'USA',
      region: 'California',
      city: 'San Francisco'
    },
    rewards: [],
    status: 'reg_open',
    totalRewardValue: 1000,
    winnersDeclared: false,
    createdBy: 'user123',
    creatorEmail: 'creator@example.com'
  },
  2: {
    id: '2',
    title: 'Trivia Challenge',
    pin: '654321',
    description: 'Answer quickly and accurately!',
    quiz: 'quiz456',
    startTime: '2025-06-18T14:00:00Z',
    duration: 600,
    promotionalVideoUrl: '',
    thumbnailPoster: 'https://via.placeholder.com/300x180',
    requireRegistration: true,
    registrationEndTime: '2025-06-18T13:00:00Z',
    maxPlayers: 100,
    tags: ['quiz', 'trivia'],
    location: {
      country: 'India',
      region: 'Karnataka',
      city: 'Bangalore'
    },
    rewards: [],
    status: 'reg_open',
    totalRewardValue: 500,
    winnersDeclared: false,
    createdBy: 'user456',
    creatorEmail: 'quizmaster@example.com'
  }
}

const RegisterPage = ({ params }) => {
  const [open , setOpen ] = useState(true);

  if(!params || !params.id){
    return <Typography>Game not found</Typography>
  }

  const game = games[params.id]

  if(!game){
    return <p>Game not found</p>;
  }
  
  return (
    <Box p={4}>
      <RegisterForm open={open} handleClose={() => setOpen(false)} game = { game }  />
    </Box>
  )
}

export default RegisterPage
