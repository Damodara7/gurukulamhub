import React from 'react'
import GameCard from '@/components/public-games/GameCard'
import { Box, Grid } from '@mui/material'

const games = [
  {
    id: '1',
    name: 'Battle Royale',
    info: 'Multiplayer survival challenge',
    image: 'https://via.placeholder.com/300x180',
    liveDate: '2025-06-15 18:00',
    details: 'A last-man-standing survival game.'
  },
  {
    id: '2',
    name: 'Trivia Challenge',
    info: 'Fast-paced quiz',
    image: 'https://via.placeholder.com/300x180',
    liveDate: '2025-06-18 14:00',
    details: 'Answer quickly and accurately!'
  }
]

const PublicGamesPage = () => {
  return (
    <Box p={4}>
      <Grid container spacing={2}>
        {games.map(game => (
          <Grid item key={game.id}>
            <GameCard game={game} />
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default PublicGamesPage
