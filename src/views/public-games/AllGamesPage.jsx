'use client'

import React, { useEffect, useState } from 'react'
import GameCard from '@/components/public-games/GameCard'
import GameUserStatusTabs from '@/components/public-games/GameUserStatusTabs'
import { Box, Grid, CircularProgress, Typography } from '@mui/material'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { useSession } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'

export const PublicGamesPage = () => {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session } = useSession()
  const statusFilter = searchParams.get('status') || 'all'

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await RestApi.get(`${API_URLS.v0.USERS_GAME}/public`)
        if (res.status === 'success') {
          setGames(res?.result || [])
        } else {
          setError(res.message)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchGames()
  }, [])

  const getUserGameStatus = game => {
    const userEmail = session?.user?.email

    // Game status checks first
    if (game.status === 'cancelled') return { status: 'cancelled' }
    if (game.status === 'lobby') return { status: 'lobby' }
    if (game.status === 'live') return { status: 'live' }
    if (game.status === 'approved') return { status: 'upcoming' }

    // User participation checks
    const participation = game?.participatedUsers?.find(p => p.email === userEmail)
    if (participation) {
      return participation.completed ? { status: 'completed' } : { status: 'inProgress' }
    }

    // Registration checks
    const isRegistered = game?.registeredUsers?.some(r => r.email === userEmail)
    if (isRegistered) {
      return game.status === 'completed' ? { status: 'missed' } : { status: 'registered' }
    }

    return { status: '' }
  }

  const filteredGames = games.filter(game => {
    const userStatus = getUserGameStatus(game).status
    const userEmail = session?.user?.email

    if (statusFilter === 'all') return true
    if (statusFilter === 'upcoming') return game.status === 'approved'
    if (statusFilter === 'registered')
      return game.status === 'approved' && game.registeredUsers?.some(r => r.email === userEmail)

    return userStatus === statusFilter
  })

  const handleStatusChange = newStatus => {
    const params = new URLSearchParams(searchParams.toString())
    newStatus === 'all' ? params.delete('status') : params.set('status', newStatus)
    router.push(`?${params.toString()}`)
  }

  if (loading) {
    return (
      <Box p={4} display='flex' justifyContent='center'>
        <CircularProgress />
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
    <Box p={4} className='flex flex-col items-center gap-2'>
      <GameUserStatusTabs value={statusFilter} onChange={handleStatusChange} />

      {filteredGames.length === 0 ? (
        <Box p={4}>
          <Typography>No games found.</Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {filteredGames.map(game => (
            <Grid item key={game._id || game.id} xs={12} sm={6} md={4} lg={3}>
              <GameCard game={game} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  )
}

export default PublicGamesPage
