'use client'

import React from 'react'
import { Box, Typography, Card, CardContent } from '@mui/material'
import { EmojiEvents } from '@mui/icons-material'
import Leaderboard from '@/components/apps/games/game-details/Leaderboard'
import GameHeader from '@/components/apps/games/game-details/GameHeader'

export default function GameLeaderboardPage({ gameId, game }) {
  return (
    <Box sx={{ p: 3 }}>
      {/* Game Header with minimal info */}
      <GameHeader game={game} />

      <Leaderboard
        participatedUsers={game?.participatedUsers}
        description={
          game.status === 'live'
            ? 'Live rankings as players compete in the game'
            : 'Final rankings from the completed game'
        }
      />
    </Box>
  )
}
