'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation' // Using App Router
import ViewDetails from '@/components/public-games/game-details/ViewDetails'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { CircularProgress, Box, Typography, Card, CardContent, Button } from '@mui/material'
import FallBackCard from '@/components/apps/games/FallBackCard'

const GameDetailsPage = () => {
  const params = useParams()
  const router = useRouter()
  const [game, setGame] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
      <FallBackCard
        error={error}
        path='/public-games'
        content='You can go Back to Public Games'
        btnText='Back To Public Games'
      />
    )
  }

  return <ViewDetails game={game} />
}

export default GameDetailsPage
