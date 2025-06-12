'use client'

import React from 'react'
import { Box, Typography, Card, CardContent } from '@mui/material'
import { EmojiEvents } from '@mui/icons-material'
import GameHeader from '@/components/apps/games/game-details/GameHeader'
import AdminLeaderboard from '@/components/apps/games/game-details/AdminLeaderboard'

export default function GameLeaderboardPage({ gameId, game }) {
  return (
    <Box sx={{ p: 3 }}>
      {/* Game Header with minimal info */}
      <GameHeader game={game} />

      <AdminLeaderboard
        game={game}
        maxheight={600}
        description={
          game.status === 'live'
            ? 'Live rankings as players compete in the game'
            : 'Final rankings from the completed game'
        }
      />
    </Box>
  )
}
