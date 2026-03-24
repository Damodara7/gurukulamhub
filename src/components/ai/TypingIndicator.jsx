'use client'

import React from 'react'
import { Box, Paper, Typography, Stack, Fade, alpha, keyframes } from '@mui/material'
import { SmartToy as AiIcon } from '@mui/icons-material'

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const dotPulse = keyframes`
  0%, 60%, 100% {
    opacity: 0.35;
    transform: translateY(0);
  }
  30% {
    opacity: 1;
    transform: translateY(-4px);
  }
`

function TypingIndicator({ theme, isDarkMode, statusText }) {
  return (
    <Fade in timeout={200}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-start',
          width: '100%',
          animation: `${fadeInUp} 0.3s ease-out`
        }}
      >
        <Paper
          elevation={0}
          sx={{
            px: 2,
            py: 1.5,
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.2 : 0.12)}`,
            bgcolor: alpha(theme.palette.action.hover, isDarkMode ? 0.15 : 0.06),
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <AiIcon sx={{ fontSize: 20, color: 'text.secondary', opacity: 0.85 }} />
          <Stack direction='row' alignItems='center' spacing={0.75} sx={{ py: 0.25 }}>
            {[0, 1, 2].map((i) => (
              <Box
                key={i}
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: 'text.secondary',
                  animation: `${dotPulse} 1.2s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`
                }}
              />
            ))}
          </Stack>
          <Typography variant='caption' color='text.secondary' sx={{ ml: 0.5 }}>
            {statusText || 'AI is thinking...'}
          </Typography>
        </Paper>
      </Box>
    </Fade>
  )
}

export default TypingIndicator
