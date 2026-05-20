import React from 'react'
import { Card, Box, Avatar, Typography, Chip, Stack, useTheme } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { Schedule, People, Quiz as QuizIcon, EmojiEvents } from '@mui/icons-material'
import imagePlaceholder from '/public/images/misc/image-placeholder.png'
import { getGameStartDisplay } from '@/utils/formatGameVenueTime'

const statusConfig = {
  // created: 'default',
  //   approved: 'success',
  //   lobby: 'info',
  //   live: 'error',
  //   completed: 'primary',
  //   cancelled: 'error'
  created: {
    gradient: 'linear-gradient(135deg, #ffa726 0%, #fb8c00 100%)',
    label: 'Created',
    shadow: 'rgba(255, 167, 38, 0.3)'
  },
  approved: {
    gradient: 'linear-gradient(135deg, #7c4dff 0%, #651fff 100%)',
    label: 'Approved',
    shadow: 'rgba(124, 77, 255, 0.3)'
  },
  lobby: {
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    label: 'Lobby',
    shadow: 'rgba(102, 126, 234, 0.3)'
  },
  live: {
    gradient: 'linear-gradient(135deg, #ef5350 0%, #e53935 100%)',
    label: 'Live',
    shadow: 'rgba(239, 83, 80, 0.3)'
  },
  completed: {
    gradient: 'linear-gradient(135deg, #66bb6a 0%, #43a047 100%)',
    label: 'Completed',
    shadow: 'rgba(102, 187, 106, 0.3)'
  },
  cancelled: {
    gradient: 'linear-gradient(135deg, #ffa726 0%, #fb8c00 100%)',
    label: 'Cancelled',
    shadow: 'rgba(255, 167, 38, 0.3)'
  }
}

function GameHeader({ game }) {
  const theme = useTheme()
  const startDisplay = getGameStartDisplay(game?.startTime, game)
  const config = statusConfig[game.status] || statusConfig.created

  return (
    <Card
      sx={{
        mb: 3,
        borderRadius: '20px',
        boxShadow:
          theme.palette.mode === 'dark'
            ? `0 8px 32px ${alpha(theme.palette.common.black, 0.5)}`
            : '0 8px 32px rgba(0, 0, 0, 0.12)',
        overflow: 'hidden',
        background: theme.palette.background.paper,
        backdropFilter: 'blur(10px)'
      }}
    >
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ xs: 'center', sm: 'flex-start' }}>
          <Avatar
            variant='rounded'
            src={game?.thumbnailPoster || imagePlaceholder?.src}
            sx={{
              width: { xs: 120, sm: 150 },
              height: { xs: 120, sm: 150 },
              borderRadius: '16px',
              boxShadow:
                theme.palette.mode === 'dark'
                  ? `0 4px 20px ${alpha(theme.palette.common.black, 0.4)}`
                  : '0 4px 20px rgba(0, 0, 0, 0.15)',
              border: `3px solid ${theme.palette.background.paper}`
            }}
            onError={e => (e.target.src = imagePlaceholder?.src)}
          />
          <Box sx={{ flexGrow: 1, width: '100%' }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent='space-between'
              alignItems={{ xs: 'flex-start', sm: 'flex-start' }}
              spacing={{ xs: 1, sm: 2 }}
              sx={{ mb: { xs: 1.5, sm: 2 } }}
            >
              <Typography
                variant='h3'
                component='h1'
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '1.25rem', sm: '1.75rem', md: '2.25rem' },
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  flex: 1,
                  mr: { xs: 0, sm: 2 },
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: { xs: 2, sm: 3 },
                  WebkitBoxOrient: 'vertical',
                  lineHeight: 1.2
                }}
                title={game.title}
              >
                {game.title}
              </Typography>
              <Chip
                label={config.label.toUpperCase()}
                size='small'
                sx={{
                  background: config.gradient,
                  color: 'white',
                  fontWeight: 700,
                  fontSize: { xs: '0.65rem', sm: '0.75rem' },
                  height: { xs: 24, sm: 32 },
                  px: { xs: 1, sm: 1.5 },
                  borderRadius: '16px',
                  boxShadow: `0 2px 8px ${config.shadow}`,
                  letterSpacing: { xs: 0.5, sm: 1 },
                  alignSelf: { xs: 'flex-start', sm: 'auto' }
                }}
              />
            </Stack>

            <Typography
              variant='body1'
              sx={{
                color: 'text.secondary',
                mb: { xs: 2, sm: 3 },
                fontSize: { xs: '0.875rem', sm: '1rem' },
                lineHeight: { xs: 1.5, sm: 1.6 },
                display: '-webkit-box',
                WebkitLineClamp: { xs: 3, sm: 4 },
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {game.description}
            </Typography>

            <Stack direction='row' spacing={{ xs: 1, sm: 2 }} flexWrap='wrap' useFlexGap sx={{ gap: { xs: 1, sm: 2 } }}>
              {game.startTime && (
                <Chip
                  icon={<Schedule sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                  label={startDisplay.cardText}
                  size='small'
                  sx={{
                    bgcolor:
                      theme.palette.mode === 'dark'
                        ? alpha(theme.palette.primary.main, 0.15)
                        : alpha(theme.palette.primary.main, 0.08),
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                    borderRadius: '12px',
                    fontSize: { xs: '0.7rem', sm: '0.875rem' },
                    height: { xs: 28, sm: 32 },
                    '& .MuiChip-icon': {
                      color: theme.palette.primary.main
                    },
                    '& .MuiChip-label': {
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: { xs: '200px', sm: 'none' }
                    }
                  }}
                />
              )}
              <Chip
                icon={<People sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                label={`${game.participatedUsers?.length || 0}/${game.maxPlayers} Players`}
                size='small'
                sx={{
                  bgcolor:
                    theme.palette.mode === 'dark'
                      ? alpha(theme.palette.primary.main, 0.15)
                      : alpha(theme.palette.primary.main, 0.08),
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                  borderRadius: '12px',
                  fontSize: { xs: '0.7rem', sm: '0.875rem' },
                  height: { xs: 28, sm: 32 },
                  '& .MuiChip-icon': {
                    color: theme.palette.primary.main
                  }
                }}
              />
              {game.quiz?.title && (
                <Chip
                  icon={<QuizIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                  label={game.quiz.title}
                  size='small'
                  sx={{
                    bgcolor:
                      theme.palette.mode === 'dark'
                        ? alpha(theme.palette.primary.main, 0.15)
                        : alpha(theme.palette.primary.main, 0.08),
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                    borderRadius: '12px',
                    fontSize: { xs: '0.7rem', sm: '0.875rem' },
                    height: { xs: 28, sm: 32 },
                    '& .MuiChip-icon': {
                      color: theme.palette.primary.main
                    },
                    '& .MuiChip-label': {
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: { xs: '150px', sm: 'none' }
                    }
                  }}
                />
              )}
              <Chip
                icon={<EmojiEvents sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                label={`${Number(game?.totalPoints || 0)} Points`}
                size='small'
                sx={{
                  bgcolor:
                    theme.palette.mode === 'dark'
                      ? alpha(theme.palette.primary.main, 0.15)
                      : alpha(theme.palette.primary.main, 0.08),
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                  borderRadius: '12px',
                  fontSize: { xs: '0.7rem', sm: '0.875rem' },
                  height: { xs: 28, sm: 32 },
                  '& .MuiChip-icon': {
                    color: theme.palette.primary.main
                  }
                }}
              />
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Card>
  )
}

export default GameHeader
