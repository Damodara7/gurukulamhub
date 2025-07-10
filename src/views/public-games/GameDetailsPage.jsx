'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation' // Using App Router
import ViewDetails from '@/components/public-games/game-details/ViewDetails'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { CircularProgress, Box, Typography, Card, CardContent, Button } from '@mui/material'

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
      // <Box p={4}>
      //   <Typography color='error'>Error loading game.</Typography>
      // </Box>
      <Box display='flex' flexDirection='column' alignItems='center' bgcolor='#f5f5f5' px={2} py={4} gap={4}>
        <Card sx={{ maxWidth: 500, p: 3, textAlign: 'center' }}>
          <CardContent>
            <Typography variant='h5' gutterBottom>
              {error ? '⚠️ Error Occurred' : '🎮 Game is Not Available'}
            </Typography>
            {error ? (
              <Typography color='error' variant='body1' sx={{ mt: 2 }}>
                {error}
              </Typography>
            ) : (
              <Typography variant='body1' sx={{ mt: 2 }}>
                You can go back to Public games
              </Typography>
            )}

            <Box display='flex' gap={6} flexWrap='wrap' mt={2} alignItems='center' justifyContent='center'>
              <Button
                component='label'
                size='small'
                variant='contained'
                onClick={() => router.push('/public-games')}
                sx={{ color: 'white' }}
              >
                Back To Public Games
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    )
  }

  return <ViewDetails game={game} />
}

export default GameDetailsPage
