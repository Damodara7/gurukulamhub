'use client'

import React from 'react'
import { Card, CardMedia, CardContent, Typography, Button, Stack } from '@mui/material'
import { useRouter } from 'next/navigation'

const GameCard = ({ game }) => {
  const router = useRouter()

  const handleView = () => {
    router.push(`/en/public-games/${game.id}`)
  }

  const handleRegister = () => {
    router.push(`/en/public-games/${game.id}/register`)
  }

  return (
    <Card sx={{ maxWidth: 400, margin: 2 }}>
      <CardMedia component='img' height='180' image={game.image} alt={game.name} />
      <CardContent>
        <Typography variant='h5'>{game.name}</Typography>
        <Typography variant='body2' color='text.secondary'>
          {game.info}
        </Typography>
        <Typography variant='caption'>Live on: {game.liveDate}</Typography>

        <Stack direction='row' spacing={2} mt={2}>
          <Button variant='contained' color='primary' onClick={handleView}>
            View
          </Button>
          <Button variant='contained' color='success' onClick={handleRegister}>
            Register
          </Button>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default GameCard
