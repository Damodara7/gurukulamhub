// components/Timer.js
import React, { useEffect } from 'react'
import { Typography, Box, Stack, LinearProgress, useTheme, alpha } from '@mui/material'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import { keyframes } from '@mui/system'

// Convert time to MM:SS format
export const formatTime = seconds => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

// Format time with hours if needed
export const formatTimeExtended = seconds => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  return formatTime(seconds)
}

export const formatTimeWithUnits = seconds => {
  if (seconds < 60) {
    return `${seconds} second${seconds === 1 ? '' : 's'}`
  }

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}${remainingSeconds ? ` ${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}` : ''}`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  return `${hours} hour${hours !== 1 ? 's' : ''}${remainingMinutes ? ` ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}` : ''}${
    remainingSeconds ? ` ${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}` : ''
  }`
}

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.05);
  }
`

const Timer = ({ isActive, time = 0, setTime = () => {}, totalSeconds = null, label = 'Timer', sx, compact = false }) => {
  const theme = useTheme()
  const isDarkMode = theme.palette.mode === 'dark'
  const hasTotal = typeof totalSeconds === 'number' && totalSeconds > 0
  const remaining = hasTotal ? Math.max(totalSeconds - time, 0) : null
  const progress = hasTotal ? Math.min(100, (time / totalSeconds) * 100) : null

  useEffect(() => {
    if (!isActive) return undefined

    const interval = setInterval(() => {
      setTime(prev => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive, setTime])

  // Compact mode for collapsed header
  if (compact) {
    return (
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: { xs: 1, sm: 1.25 },
          px: { xs: 1.2, md: 1.5 },
          py: { xs: 0.75, md: 0.9 },
          borderRadius: { xs: 1.5, md: 2 },
          border: `1.5px solid ${alpha(theme.palette.primary.main, isDarkMode ? 0.3 : 0.2)}`,
          background: isDarkMode
            ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)}, ${alpha(theme.palette.primary.dark, 0.1)})`
            : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.primary.light, 0.05)})`,
          boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, isDarkMode ? 0.2 : 0.15)}`,
          backdropFilter: 'blur(10px)',
          overflow: 'hidden',
          ...sx
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: { xs: 28, sm: 32 },
            height: { xs: 28, sm: 32 },
            borderRadius: '50%',
            bgcolor: alpha(theme.palette.primary.main, isDarkMode ? 0.2 : 0.15),
            color: theme.palette.primary.main,
            flexShrink: 0,
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              inset: -2,
              borderRadius: '50%',
              border: `1.5px solid ${alpha(theme.palette.primary.main, 0.3)}`,
              opacity: isActive ? 1 : 0.5,
              animation: isActive ? `${pulse} 2s ease-in-out infinite` : 'none'
            }
          }}
        >
          <AccessTimeIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />
        </Box>

        <Stack spacing={0} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography
            variant='h6'
            component='p'
            sx={{
              fontWeight: 700,
              letterSpacing: '-0.01em',
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              lineHeight: 1.2,
              color: theme.palette.text.primary,
              fontFamily: 'monospace',
              textAlign: 'center'
            }}
            aria-live='polite'
          >
            {formatTime(time)}
          </Typography>
          {!isActive && (
            <Typography
              variant='caption'
              sx={{
                color: alpha(theme.palette.text.secondary, 0.7),
                fontSize: { xs: '0.65rem', sm: '0.7rem' },
                lineHeight: 1,
                textAlign: 'center'
              }}
            >
              Paused
            </Typography>
          )}
        </Stack>

        {progress !== null && (
          <LinearProgress
            variant='determinate'
            value={progress}
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              height: 2,
              backgroundColor: 'transparent',
              '& .MuiLinearProgress-bar': {
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
              }
            }}
          />
        )}
      </Box>
    )
  }

  // Full mode for expanded header
  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: { xs: 1.5, sm: 2 },
        px: { xs: 1.8, sm: 2.2, md: 2.5 },
        py: { xs: 1.4, sm: 1.6, md: 1.8 },
        borderRadius: { xs: 2, sm: 2.5 },
        border: `1.5px solid ${alpha(theme.palette.primary.main, isDarkMode ? 0.25 : 0.15)}`,
        background: isDarkMode
          ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.18)}, ${alpha(theme.palette.primary.dark, 0.12)})`
          : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.12)}, ${alpha(theme.palette.primary.light, 0.08)})`,
        boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, isDarkMode ? 0.25 : 0.18)}`,
        backdropFilter: 'blur(12px)',
        color: theme.palette.text.primary,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, isDarkMode ? 0.3 : 0.22)}`
        },
        ...sx
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: isDarkMode
            ? `linear-gradient(135deg, ${alpha(theme.palette.common.white, 0.05)}, transparent)`
            : `linear-gradient(135deg, ${alpha(theme.palette.common.white, 0.2)}, transparent)`,
          opacity: 0.6,
          pointerEvents: 'none'
        }}
      />

      <Box
        sx={{
          position: 'relative',
          width: { xs: 44, sm: 48, md: 52 },
          height: { xs: 44, sm: 48, md: 52 },
          borderRadius: '50%',
          bgcolor: alpha(theme.palette.primary.main, isDarkMode ? 0.2 : 0.15),
          color: theme.palette.primary.main,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, isDarkMode ? 0.3 : 0.25)}`,
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: -3,
            borderRadius: '50%',
            border: `1.5px solid ${alpha(theme.palette.primary.main, 0.4)}`,
            opacity: isActive ? 1 : 0.5,
            animation: isActive ? `${pulse} 2s ease-in-out infinite` : 'none'
          }
        }}
      >
        <AccessTimeIcon sx={{ fontSize: { xs: 20, sm: 22, md: 24 } }} />
      </Box>

      <Stack spacing={0.3} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
        <Stack direction='row' spacing={0.75} alignItems='center' justifyContent='center' flexWrap='wrap'>
          {label && (
            <Typography
              variant='caption'
              sx={{
                letterSpacing: '0.05em',
                color: alpha(theme.palette.text.primary, 0.7),
                fontWeight: 600,
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                textTransform: 'uppercase'
              }}
            >
              {label}
            </Typography>
          )}
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              bgcolor: isActive ? theme.palette.success.main : theme.palette.grey[500],
              boxShadow: `0 0 0 3px ${alpha(
                isActive ? theme.palette.success.main : theme.palette.grey[500],
                0.2
              )}`,
              animation: isActive ? `${pulse} 2s ease-in-out infinite` : 'none'
            }}
          />
        </Stack>

        <Typography
          variant='h5'
          component='p'
          sx={{
            fontWeight: 700,
            letterSpacing: '-0.01em',
            fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
            lineHeight: 1.1,
            color: theme.palette.text.primary,
            fontFamily: 'monospace',
            textAlign: 'center'
          }}
          aria-live='polite'
        >
          {formatTime(time)}
        </Typography>

        <Typography
          variant='caption'
          sx={{
            color: alpha(theme.palette.text.secondary, 0.7),
            fontWeight: 500,
            fontSize: { xs: '0.7rem', sm: '0.75rem' },
            textAlign: 'center'
          }}
        >
          {isActive ? 'Running' : 'Paused'}
          {remaining !== null && ` • ${formatTime(remaining)} remaining`}
        </Typography>
      </Stack>

      {progress !== null && (
        <LinearProgress
          variant='determinate'
          value={progress}
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: 3,
            backgroundColor: 'transparent',
            '& .MuiLinearProgress-bar': {
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              borderRadius: '0 0 8px 8px'
            }
          }}
        />
      )}
    </Box>
  )
}

export default Timer
