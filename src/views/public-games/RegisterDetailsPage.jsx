'use client'
import React, { useState } from 'react'
import { Box, Button, Typography } from '@mui/material'
import RegisterForm from '@/components/public-games/RegisterForm';
const games = {
  1: {
    id: '1',
    name: 'Battle Royale',
    liveDate: '2025-06-15 18:00',
    details: 'A last-man-standing survival game.'
  },
  2: {
    id: '2',
    name: 'Trivia Challenge',
    liveDate: '2025-06-18 14:00',
    details: 'Answer quickly and accurately!'
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
