'use client'

import React from 'react'
import { Box, Typography, Card, CardContent } from '@mui/material'
import { EmojiEvents } from '@mui/icons-material'
import GameHeader from '@/components/apps/games/game-details/GameHeader'
import AdminLeaderboard from '@/components/apps/games/game-details/AdminLeaderboard'

export default function GameLeaderboardPage({ gameId, game }) {
  return (
    <Box sx={{ p: 3, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Game Header with minimal info */}
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box>
          <GameHeader game={game} />
        </Box>

        <Box sx={{flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'auto'}}>
          <AdminLeaderboard
            game={game}
            description={
              game.status === 'live'
                ? 'Live rankings as players compete in the game'
                : 'Final rankings from the completed game'
            }
          />
        </Box>
      </Box>
    </Box>
  )
}
