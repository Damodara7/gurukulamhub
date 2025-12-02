// components/Timer.js
import React, { useEffect } from 'react'
import { Typography, Box, Stack, LinearProgress, useTheme, alpha } from '@mui/material'
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled'
import { keyframes } from '@mui/system'

// Convert time to MM:SS format
export const formatTime = seconds => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
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
  0% {
    transform: scale(1);
    opacity: 1;
  }
  70% {
    transform: scale(1.75);
    opacity: 0;
  }
  100% {
    transform: scale(1.75);
    opacity: 0;
  }
`

const Timer = ({ isActive, time = 0, setTime = () => {}, totalSeconds = null, label = 'Timer', sx }) => {
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

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: { xs: 1.75, md: 2.5 },
        px: { xs: 2.2, md: 2.8 },
        py: { xs: 1.9, md: 2.2 },
        borderRadius: { xs: 2.2, md: 2.6 },
        border: `1px solid ${alpha(theme.palette.primary.main, isDarkMode ? 0.25 : 0.12)}`,
        background: isDarkMode
          ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)}, ${alpha(theme.palette.primary.dark, 0.15)})`
          : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.14)}, ${alpha(theme.palette.primary.dark, 0.08)})`,
        boxShadow: isDarkMode
          ? `0 24px 54px ${alpha(theme.palette.primary.main, 0.3)}`
          : `0 24px 54px ${alpha(theme.palette.primary.main, 0.18)}`,
        backdropFilter: 'blur(20px)',
        color: theme.palette.text.primary,
        overflow: 'hidden',
        minWidth: { xs: '100%', sm: 218 },
        maxWidth: { xs: '100%', sm: 260 },
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: isDarkMode
            ? `0 28px 60px ${alpha(theme.palette.primary.main, 0.35)}`
            : `0 28px 60px ${alpha(theme.palette.primary.main, 0.22)}`
        },
        ...sx
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: isDarkMode
            ? `linear-gradient(160deg, ${alpha(theme.palette.common.white, 0.08)}, transparent)`
            : `linear-gradient(160deg, ${alpha(theme.palette.common.white, 0.24)}, transparent)`,
          opacity: 0.7,
          pointerEvents: 'none'
        }}
      />

      <Box
        sx={{
          position: 'relative',
          width: { xs: 48, md: 54 },
          height: { xs: 48, md: 54 },
          borderRadius: '50%',
          bgcolor: isDarkMode ? alpha(theme.palette.background.paper, 0.9) : theme.palette.common.white,
          color: theme.palette.primary.main,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 18px 40px ${alpha(theme.palette.primary.main, isDarkMode ? 0.35 : 0.25)}`,
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: -4,
            borderRadius: '50%',
            border: `1.5px solid ${alpha(theme.palette.primary.main, isDarkMode ? 0.45 : 0.35)}`,
            opacity: isActive ? 1 : 0.45,
            animation: isActive ? `${pulse} 2.6s ease-out infinite` : 'none'
          }
        }}
      >
        <AccessTimeFilledIcon sx={{ fontSize: { xs: 22, md: 24 } }} />
      </Box>

      <Stack spacing={0.35} sx={{ flex: 1, minWidth: 0, position: 'relative', zIndex: 1 }}>
        <Stack direction='row' spacing={1} alignItems='center'>
          <Typography
            variant='overline'
            sx={{
              letterSpacing: '0.12em',
              color: alpha(theme.palette.text.primary, 0.7),
              fontWeight: 700
            }}
          >
            {label.toUpperCase()}
          </Typography>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: isActive ? theme.palette.success.main : theme.palette.grey[400],
              boxShadow: `0 0 0 6px ${alpha(
                isActive ? theme.palette.success.main : theme.palette.grey[400],
                0.12
              )}`
            }}
          />
        </Stack>

        <Typography
          variant='h4'
          component='p'
          sx={{
            fontWeight: 800,
            letterSpacing: '-0.02em',
            fontSize: { xs: '1.85rem', md: '2.2rem' },
            lineHeight: 1.05,
            color: theme.palette.text.primary
          }}
          aria-live='polite'
        >
          {formatTime(time)}
        </Typography>

        <Typography
          variant='body2'
          sx={{
            color: alpha(theme.palette.text.primary, 0.65),
            fontWeight: 500
          }}
        >
          {isActive ? 'Counting up' : 'Paused'}
          {remaining !== null ? ` • ${formatTimeWithUnits(remaining)} left` : ''}
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
            height: 4,
            borderRadius: '0 0 14px 14px',
            backgroundColor: alpha(theme.palette.common.white, 0.3),
            '& .MuiLinearProgress-bar': {
              borderRadius: '0 0 14px 14px',
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
            }
          }}
        />
      )}
    </Box>
  )
}

export default Timer
