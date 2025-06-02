// components/public-games/PublicGamesList.tsx
'use client'

import React from 'react'
import GameCard from './GameCard'
import { Box, Grid, Typography } from '@mui/material'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import Loading from '@/components/Loading'

const PublicGamesList = ({ games, loading, error }) => {
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const statusFilter = searchParams.get('status') || 'all'

  const getUserGameStatus = (game) => {
    const userEmail = session?.user?.email

    // User participation checks should come first
    const participation = game?.participatedUsers?.find((p) => p.email === userEmail)
    if (participation) {
      return participation.completed 
        ? { status: 'completed' } 
        : { status: 'inProgress' }
    }

    // Then check game status
    if (game.status === 'cancelled') return { status: 'cancelled' }
    if (game.status === 'lobby') return { status: 'lobby' }
    if (game.status === 'approved') return { status: 'upcoming' }
    
    // Special handling for live games where user hasn't participated yet
    if (game.status === 'live') return { status: 'live' }
    
    // Registration checks
    const isRegistered = game?.registeredUsers?.some((r) => r.email === userEmail)
    if (isRegistered) {
      return game.status === 'completed' ? { status: 'missed' } : { status: 'registered' }
    }

    return { status: '' }
  }

  const filteredGames = games.filter((game) => {
    const userStatus = getUserGameStatus(game).status
    const userEmail = session?.user?.email
    const globalStatus = game.status

    if (statusFilter === 'all') return true
    if (statusFilter === 'upcoming') return globalStatus === 'approved'
    if (statusFilter === 'registered') {
      return globalStatus === 'approved' && game.registeredUsers?.some((r) => r.email === userEmail)
    }
    if (statusFilter === 'live') {
      return globalStatus === 'live' || 
             (userStatus === 'completed' && globalStatus === 'live')
    }

    return userStatus === statusFilter
  })

  if (loading) {
    return (
      <Box p={4} display='flex' justifyContent='center'>
        <Loading />
      </Box>
    )
  }

  if (error) {
    return (
      <Box p={4}>
        <Typography color='error'>Error: {error}</Typography>
      </Box>
    )
  }

  return (
    <>
      {filteredGames.length === 0 ? (
        <Box p={4}>
          <Typography>No games found.</Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {filteredGames.map((game) => (
            <Grid item key={game._id || game.id} xs={12} sm={6} md={4} lg={3}>
              <GameCard game={game} />
            </Grid>
          ))}
        </Grid>
      )}
    </>
  )
}

export default PublicGamesList