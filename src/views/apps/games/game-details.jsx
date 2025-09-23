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
      <FallBackCard content='You can go back to All Games' path='/management/games' btnText='Back To All Games' />
    )

  // Show special page for games awaiting sponsorship
  if (game.status === 'awaiting_sponsorship') {
    return <AwaitingSponsorshipGamePage game={game} />
  }

  // Show special page for sponsored games
  if (game.status === 'sponsored') {
    return <SponsoredGamePage game={game} />
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Game Header Section */}
      <GameHeader game={game} />

      {/* Group Information Section */}
      <GameGroupInfo game={game} />

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
