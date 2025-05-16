'use client'

import React, { useState, useEffect } from 'react'
import * as RestApi from '@/utils/restApiUtil'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { API_URLS } from '@/configs/apiConfig'
import { Box, Typography, Card, CardContent, TextField, Button, Alert, CircularProgress } from '@mui/material'
import { toast } from 'react-toastify'

const GamePinInputFormPage = () => {
  const [gamePin, setGamePin] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { data: session } = useSession()
  const router = useRouter()

  const validateGame = async () => {
    if (!gamePin || !email) return

    // Handle form submission
    try {
      setLoading(true)
      setError(null)

      // Basic validation
      if (!session?.user) {
        throw new Error('You must be logged in to join a game')
      }
      // Validate game PIN
      const gameRes = await RestApi.get(`${API_URLS.v0.USERS_GAME}?pin=${gamePin}`)
      if (gameRes.status === 'success') {
        // Join the game
        const joinRes = await RestApi.post(`${API_URLS.v0.USERS_GAME}/${gameRes.result?._id}/join`, {
          user: { id: session.user.id, email: email }
        })

        if (joinRes.status === 'success') {
          toast.success('Joined game successfully!')
          router.push(`/public-games/${gameRes.result?._id}/play`)
        } else {
          throw new Error(joinRes.message || 'Failed to join game')
        }
      } else {
        throw new Error(gameRes.message || 'Invalid game PIN')
      }
    } catch (err) {
      console.error('Validation error:', err)
      setError(err.message)
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = e => {
    validateGame()
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'grey.50',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        p: 4
      }}
    >
      {/* Header */}
      <Box sx={{ width: '100%', maxWidth: '800px', textAlign: 'center', mb: 8 }}>
        <Typography variant='h2' color='primary.main' fontWeight='bold'>
          Gurukul Hub
        </Typography>
        <Typography variant='subtitle1' color='text.secondary' mt={2}>
          Enter Game Pin and Email to Join the Game
        </Typography>
      </Box>

      {/* Game Entry Card */}
      <Card sx={{ width: '100%', maxWidth: '500px' }}>
        <CardContent>
          <form>
            {/* Game PIN Field */}
            <Box mb={4}>
              <TextField
                fullWidth
                label='Game PIN'
                variant='outlined'
                value={gamePin}
                onChange={e => setGamePin(e.target.value)}
                placeholder='Enter game PIN'
                required
              />
            </Box>

            {/* Email Field */}
            <Box mb={6}>
              <TextField
                fullWidth
                label='Email'
                variant='outlined'
                type='email'
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder='Enter your email'
                required
              />
            </Box>

            {/* Error Message */}
            {error && (
              <Alert severity='error' sx={{ mb: 4 }}>
                {error}
              </Alert>
            )}

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              component='label'
              sx={{ color: 'white' }}
              variant='contained'
              color='primary'
              fullWidth
              size='large'
              disabled={loading}
            >
              {loading ? (
                <>
                  <CircularProgress size={24} color='inherit' sx={{ mr: 2 }} />
                  Verifying...
                </>
              ) : (
                'Enter'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  )
}

export default GamePinInputFormPage
