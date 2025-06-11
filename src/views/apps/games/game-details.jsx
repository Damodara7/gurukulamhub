'use client'

import React, { useState } from 'react'
import { Box, Grid, Typography, Card, CardContent } from '@mui/material'
import { EmojiEvents, Videocam } from '@mui/icons-material'
import ReactPlayer from 'react-player'
import RewardsList from '@/components/apps/games/game-details/RewardsList'
import Leaderboard from '@/components/apps/games/game-details/Leaderboard'
import GameHeader from '@/components/apps/games/game-details/GameHeader'
import RegisteredPlayersTable from '@/components/apps/games/game-details/RegisteredPlayersTable'
import ParticipatedPlayersTable from '@/components/apps/games/game-details/ParticipatedPlayersTable'
import GameLocationInfo from '@/components/apps/games/game-details/GameLocationInfo'
import GameStatistics from '@/components/apps/games/game-details/GameStatistics'

export default function GameDetailsPage({ game = null }) {
  if (!game)
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant='h6'>No game data available</Typography>
      </Box>
    )

  return (
    <Box sx={{ p: 3 }}>
      {/* Game Header Section */}
      <GameHeader game={game} />

    
      {/* Promotional Video Section */}
      {game.promotionalVideoUrl && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant='h6' sx={{ mb: 2 }}>
              <Videocam sx={{ mr: 1, verticalAlign: 'middle' }} />
              Promotional Video
            </Typography>
            <Box
              sx={{
                position: 'relative',
                pt: '40.25%', // 16:9 aspect ratio
                borderRadius: 2,
                overflow: 'hidden'
              }}
            >
              <ReactPlayer
                url={game.promotionalVideoUrl}
                width='100%'
                height='100%'
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0
                }}
                controls
              />
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Game Information Grid */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Location Details */}
        <GameLocationInfo game={game} />

        {/* Game Statistics */}
        <GameStatistics game={game} />
      </Grid>

      {/* Registration & Participation Section */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Registered Players */}
        <RegisteredPlayersTable registeredUsers={game?.registeredUsers} participatedUsers={game?.participatedUsers} game={game} />

        {/* Participated Players */}
        <ParticipatedPlayersTable game={game} participatedUsers={game?.participatedUsers} />
      </Grid>

      {/* Leaderboard Section */}
      <Leaderboard participatedUsers={game?.participatedUsers} game={game}  />

      {/* Rewards Section */}
      {game.rewards.length > 0 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant='h6'>
                <EmojiEvents sx={{ mr: 1, verticalAlign: 'middle' }} />
                Rewards
              </Typography>
            </Box>

            {/* Rewards List */}
            <RewardsList rewards={game?.rewards} />
          </CardContent>
        </Card>
      )}
    </Box>
  )
}
