'use client'

import React from 'react'
import { Box, Button, Card, CardContent, Typography, useTheme, alpha } from '@mui/material'
import { Cancel } from '@mui/icons-material'
import { useRouter } from 'next/navigation'

const ADMIN_TIMEOUT_REASONS = ['game did not start on time', 'game did not start on time.']

function isAdminTimeoutCancellation(cancellationReason) {
  if (!cancellationReason) return false
  return ADMIN_TIMEOUT_REASONS.includes(cancellationReason.trim().toLowerCase())
}

function GameCancelledNotice({ game, redirectPath = '/public-games' }) {
  const router = useRouter()
  const theme = useTheme()

  const isTimeout = isAdminTimeoutCancellation(game?.cancellationReason)
  const message = isTimeout
    ? 'This game could not be started due to a technical issue. Please try joining another game or check back later.'
    : game?.cancellationReason || 'This game has been cancelled.'

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        px: 2,
        py: 4
      }}
    >
      <Card
        sx={{
          maxWidth: 520,
          width: '100%',
          textAlign: 'center',
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
          boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 12px 40px rgba(0,0,0,0.08)'
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mb: 1 }}>
            <Cancel sx={{ fontSize: 36, color: 'error.main' }} />
            <Typography variant='h5' fontWeight={700} color='error.main'>
              Game is cancelled
            </Typography>
          </Box>

          {game?.title && (
            <Typography
              variant='h6'
              color='primary.main'
              fontWeight={700}
              sx={{ mb: 2, textTransform: 'capitalize' }}
            >
              {game.title}
            </Typography>
          )}

          <Typography variant='body1' color='text.secondary' sx={{ mb: 3, lineHeight: 1.7 }}>
            {message}
          </Typography>

          <Button
            component='label'
            variant='contained'
            color='primary'
            size='large'
            onClick={() => router.push(redirectPath)}
            sx={{ color: 'white', minWidth: 220, borderRadius: 2, mt: 1 }}
          >
            Back To Public Games
          </Button>
        </CardContent>
      </Card>
    </Box>
  )
}

export default GameCancelledNotice
