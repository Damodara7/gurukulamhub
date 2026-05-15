'use client'

import React, { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Typography
} from '@mui/material'
import { PlayArrow } from '@mui/icons-material'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import GameLobbyParticipants from '@/components/games/GameLobbyParticipants'

const GRACE_MS = 5 * 60 * 1000

function AdminForwardStartPanel({ game, setGame }) {
  const { data: session } = useSession()
  const [starting, setStarting] = useState(false)
  const [timeUntilStart, setTimeUntilStart] = useState('')
  const [timeUntilCancel, setTimeUntilCancel] = useState('')

  const isForwardingAdmin = session?.user?.email === game?.forwardingAdmin?.email
  const startTime = new Date(game?.startTime)
  const graceDeadline = new Date(startTime.getTime() + GRACE_MS)

  useEffect(() => {
    const updateTimers = () => {
      const now = new Date()
      const untilStart = Math.floor((startTime - now) / 1000)
      const untilCancel = Math.floor((graceDeadline - now) / 1000)

      if (untilStart > 0) {
        const m = Math.floor(untilStart / 60)
        const s = untilStart % 60
        setTimeUntilStart(`${m}m ${s}s`)
        setTimeUntilCancel('')
        return
      }

      setTimeUntilStart('')

      if (untilCancel > 0) {
        const m = Math.floor(untilCancel / 60)
        const s = untilCancel % 60
        setTimeUntilCancel(`${m}m ${s}s`)
      } else {
        setTimeUntilCancel('expired')
      }
    }

    updateTimers()
    const interval = setInterval(updateTimers, 1000)
    return () => clearInterval(interval)
  }, [game?.startTime])

  const handleStartGame = async () => {
    setStarting(true)
    try {
      const res = await RestApi.post(`${API_URLS.v0.USERS_GAME}/${game._id}/admin-forward/start`, {
        user: { email: session.user.email }
      })
      if (res.status === 'success') {
        setGame(res.result)
        toast.success(res.message || 'Game started')
      } else {
        toast.error(res.message || 'Failed to start game')
      }
    } catch (error) {
      console.error('Error starting game:', error)
      toast.error('An error occurred while starting the game')
    } finally {
      setStarting(false)
    }
  }

  if (!isForwardingAdmin || game?.status !== 'lobby') {
    return null
  }

  const now = new Date()
  const canStart = now >= startTime && now <= graceDeadline

  return (
    <Grid item xs={12}>
      <Card
        sx={{
          textAlign: 'center',
          boxShadow: 3,
          borderLeft: '4px solid',
          borderColor: canStart ? 'success.main' : 'warning.main',
          borderRadius: 2
        }}
      >
        <CardContent>
          <Typography variant='h6' gutterBottom sx={{ fontWeight: 'bold' }}>
            Start Game Session
          </Typography>

          {timeUntilStart ? (
            <Alert severity='info' sx={{ mb: 2, textAlign: 'left' }}>
              Scheduled start is in <strong>{timeUntilStart}</strong>. You can start the game once that time is
              reached. If you do not start within 5 minutes after that, the game will be cancelled automatically.
            </Alert>
          ) : timeUntilCancel && timeUntilCancel !== 'expired' ? (
            <Alert severity='warning' sx={{ mb: 2, textAlign: 'left' }}>
              The game is ready to start. You have <strong>{timeUntilCancel}</strong> to start before it is
              cancelled.
            </Alert>
          ) : (
            <Alert severity='error' sx={{ mb: 2, textAlign: 'left' }}>
              The start window has expired. This game will be cancelled if it has not started already.
            </Alert>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
              component='label'
              variant='contained'
              color='success'
              size='large'
              startIcon={starting ? <CircularProgress size={20} color='inherit' /> : <PlayArrow />}
              disabled={!canStart || starting}
              onClick={handleStartGame}
              sx={{ color: 'white', minWidth: 200 }}
            >
              {starting ? 'Starting...' : 'Start Game'}
            </Button>
          </Box>

          <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 2 }}>
            Players will receive the first question only after you start the game.
          </Typography>

          <Box sx={{ mt: 3, textAlign: 'left' }}>
            <GameLobbyParticipants
              registeredUsers={game?.registeredUsers}
              title='Players in the lobby'
              subtitle='Registered players waiting for you to start the session.'
            />
          </Box>
        </CardContent>
      </Card>
    </Grid>
  )
}

export default AdminForwardStartPanel
