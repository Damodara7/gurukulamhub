'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Box, Grid, Typography, Card, CardContent, Button } from '@mui/material'
import { EmojiEvents, Videocam } from '@mui/icons-material'
import ReactPlayer from 'react-player'
import RewardsList from '@/components/apps/games/game-details/RewardsList'
import GameHeader from '@/components/apps/games/game-details/GameHeader'
import RegisteredPlayersTable from '@/components/apps/games/game-details/RegisteredPlayersTable'
import ParticipatedPlayersTable from '@/components/apps/games/game-details/ParticipatedPlayersTable'
import GameLocationInfo from '@/components/apps/games/game-details/GameLocationInfo'
import GameStatistics from '@/components/apps/games/game-details/GameStatistics'
import AdminLeaderboard from '@/components/apps/games/game-details/AdminLeaderboard'
import GameGroupInfo from '@/components/apps/games/game-details/GameGroupInfo'
import AwaitingSponsorshipGamePage from '@/components/apps/games/game-details/AwaitingSponsorshipGamePage'
import SponsoredGamePage from '@/components/apps/games/game-details/SponsoredGamePage'
import { useRouter } from 'next/navigation'
import FallBackCard from '@/components/apps/games/FallBackCard'

export default function GameDetailsPage({ game: initialGame = null, gameId }) {
  const [game, setGame] = useState(initialGame)
  const wsRef = useRef(null)
  const router = useRouter()
  useEffect(() => {
    if (gameId) {
      const wsUrl =
        typeof window !== 'undefined'
          ? `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/api/ws/games/${gameId}`
          : ''

      if (wsUrl) {
        wsRef.current = new WebSocket(wsUrl)
        if (!wsRef.current) return

        wsRef.current.onopen = () => {
          console.log('[WS] Connected to game details updates')
        }

        wsRef.current.onmessage = event => {
          try {
            const { data, type } = JSON.parse(event.data)
            if (type === 'gameDetails') {
              setGame(data)
            }
          } catch (e) {
            console.error('[WS] Error parsing game details message', e)
          }
        }
        wsRef.current.onerror = err => {
          console.error('[WS] game details error', err)
        }
        wsRef.current.onclose = () => {
          console.log('[WS] game details connection closed')
        }
      }
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [gameId])

  if (!game)
    return <FallBackCard content='You can go back to All Games' path='/management/games' btnText='Back To All Games' />

  // Show special page for games awaiting sponsorship
  if (game.status === 'awaiting_sponsorship') {
    return <AwaitingSponsorshipGamePage game={game} />
  }

  // Show special page for sponsored games
  if (game.status === 'sponsored') {
    return <SponsoredGamePage game={game} />
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa' }}>
      {/* Gradient Header Banner */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          pt: 4,
          pb: 6,
          mb: -4,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.4
          }
        }}
      />

      <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, pb: 4, position: 'relative', mt: -2 }}>
        {/* Game Header Section */}
        <GameHeader game={game} />

        {/* Group Information Section */}
        <GameGroupInfo game={game} />

        {/* Promotional Video Section */}
        {game.promotionalVideoUrl && (
          <Card
            sx={{
              mb: 3,
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              overflow: 'hidden'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant='h6'
                sx={{
                  mb: 3,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  color: '#1a1a1a'
                }}
              >
                <Videocam sx={{ color: '#667eea' }} />
                Promotional Video
              </Typography>
              <Box
                sx={{
                  position: 'relative',
                  pt: '56.25%', // 16:9 aspect ratio
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
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
          <RegisteredPlayersTable
            registeredUsers={game?.registeredUsers}
            participatedUsers={game?.participatedUsers}
            game={game}
          />

          {/* Participated Players */}
          <ParticipatedPlayersTable game={game} participatedUsers={game?.participatedUsers} />
        </Grid>

        {/* Leaderboard Section */}
        <AdminLeaderboard game={game} />

        {/* Rewards Section */}
        {game.rewards.length > 0 && (
          <Card
            sx={{
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              overflow: 'hidden'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography
                  variant='h5'
                  sx={{
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color: '#1a1a1a'
                  }}
                >
                  <EmojiEvents sx={{ color: '#667eea' }} />
                  Rewards
                </Typography>
              </Box>

              {/* Rewards List */}
              <RewardsList rewards={game?.rewards} />
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  )
}
