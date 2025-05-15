'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation' // Using App Router
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { CircularProgress, Box, Typography, useTheme } from '@mui/material'
import PlayGameInfoScreen from '@/components/public-games/play-game/PlayGameInfoScreen'
import StartPlayGame from '@/components/public-games/play-game/StartPlayGame'

function PlayGamePage() {
  const params = useParams()
  const router = useRouter()
  const [game, setGame] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [shouldStartGame, setShouldStartGame] = useState(false)

  useEffect(() => {
    const fetchGame = async () => {
      try {
        console.log('Fetching game with ID:', params.id) // Log the ID
        const res = await RestApi.get(`${API_URLS.v0.USERS_GAME}?id=${params.id}`)
        console.log('API Response:', res) // Log full response
        if (res.status === 'success') {
          setGame(res.result)
        } else {
          console.error('API Error:', res.message)
          setError(res.message)
        }
      } catch (err) {
        console.error('Fetch Error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (params?.id) {
      fetchGame()
    }
  }, [params?.id, router])

  if (loading) {
    return (
      <Box p={4} display='flex' justifyContent='center'>
        <CircularProgress />
      </Box>
    )
  }

  if (error || !game) {
    return (
      <Box p={4}>
        <Typography color='error'>Error loading game.</Typography>
      </Box>
    )
  }

  if (shouldStartGame) {
    return <StartPlayGame game={game} />
  }

  return <PlayGameInfoScreen game={game} setShouldStartGame={setShouldStartGame} />
}

export default PlayGamePage
