'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Box, Grid, Typography, Card, CardContent , Button } from '@mui/material'
import { EmojiEvents, Videocam } from '@mui/icons-material'
import ReactPlayer from 'react-player'
import RewardsList from '@/components/apps/games/game-details/RewardsList'
import GameHeader from '@/components/apps/games/game-details/GameHeader'
import RegisteredPlayersTable from '@/components/apps/games/game-details/RegisteredPlayersTable'
import ParticipatedPlayersTable from '@/components/apps/games/game-details/ParticipatedPlayersTable'
import GameLocationInfo from '@/components/apps/games/game-details/GameLocationInfo'
import GameStatistics from '@/components/apps/games/game-details/GameStatistics'
import AdminLeaderboard from '@/components/apps/games/game-details/AdminLeaderboard'
import { useRouter } from 'next/navigation'

export default function GameDetailsPage({ game: initialGame = null, gameId }) {
  const [game, setGame] = useState(initialGame)
  const wsRef = useRef(null)
  const router = useRouter()
  useEffect(() => {
    if (gameId) {
      const wsUrl =
        typeof window !== undefined
          ? `${window.location.protocol === 'https' ? 'wss' : 'ws'}://${window.location.host}/api/ws/games/${gameId}`
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
    return (
      <Box display='flex' flexDirection='column' alignItems='center' bgcolor='#f5f5f5' px={2} py={4} gap={4}>
        <Card sx={{ maxWidth: 500, p: 3, textAlign: 'center' }}>
          <CardContent>
            <Typography variant='h5' gutterBottom>
              🎮 Game is Not Available
            </Typography>

            <Typography variant='body1' sx={{ mt: 2 }}>
              You can go back to the all games
            </Typography>
            <Typography variant='h6' color='primary' sx={{ mt: 1 }}></Typography>

            <Box display='flex' gap={6} flexWrap='wrap' mt={2} alignItems='center' justifyContent='center'>
              <Button
                component='label'
                size='small'
                variant='contained'
                onClick={() => router.push('/apps/games')}
                sx={{ color: 'white' }}
              >
                Back To All Games
              </Button>
            </Box>
          </CardContent>
        </Card>
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
