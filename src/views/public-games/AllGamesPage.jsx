'use client'

import React, { useEffect, useState } from 'react'
import GameCard from '@/components/public-games/GameCard'
import { Box, Grid, CircularProgress, Typography } from '@mui/material'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'

export const PublicGamesPage = () => {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await RestApi.get(`${API_URLS.v0.USERS_GAME}?status=live`)
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

  if (games.length === 0) {
    return (
      <Box p={4}>
        <Typography>No games found.</Typography>
      </Box>
    )
  }

  return (
    <Box p={4}>
      <Grid container spacing={2}>
        {games.map(game => (
          <Grid item key={game._id || game.id} xs={12} sm={6} md={4}>
            <GameCard game={game} />
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default PublicGamesPage
