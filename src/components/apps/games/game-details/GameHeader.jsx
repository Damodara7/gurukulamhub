import React from 'react'
import { Card, Box, Avatar, Typography, Chip, Stack } from '@mui/material'
import { Schedule, People, Quiz as QuizIcon } from '@mui/icons-material'
import imagePlaceholder from '/public/images/misc/image-placeholder.png'

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
  const config = statusConfig[game.status] || statusConfig.created

  return (
    <Card
      sx={{
        mb: 3,
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        overflow: 'hidden',
        background: 'rgba(255, 255, 255, 0.98)',
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
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
              border: '3px solid white'
            }}
            onError={e => (e.target.src = imagePlaceholder?.src)}
          />
          <Box sx={{ flexGrow: 1, width: '100%' }}>
            <Stack direction='row' justifyContent='space-between' alignItems='flex-start' sx={{ mb: 2 }}>
              <Typography
                variant='h3'
                component='h1'
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '1.75rem', sm: '2.25rem' },
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  flex: 1,
                  mr: 2
                }}
              >
                {game.title}
              </Typography>
              <Chip
                label={config.label.toUpperCase()}
                size='medium'
                sx={{
                  background: config.gradient,
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  height: 32,
                  px: 1.5,
                  borderRadius: '16px',
                  boxShadow: `0 2px 8px ${config.shadow}`,
                  letterSpacing: 1
                }}
              />
            </Stack>

            <Typography
              variant='body1'
              sx={{
                color: 'text.secondary',
                mb: 3,
                fontSize: '1rem',
                lineHeight: 1.6
              }}
            >
              {game.description}
            </Typography>

            <Stack direction='row' spacing={2} flexWrap='wrap' useFlexGap>
              {game.startTime && (
                <Chip
                  icon={<Schedule sx={{ fontSize: 18 }} />}
                  label={`${new Date(game.startTime).toLocaleString()}`}
                  sx={{
                    bgcolor: 'rgba(102, 126, 234, 0.08)',
                    color: '#667eea',
                    fontWeight: 600,
                    borderRadius: '12px',
                    '& .MuiChip-icon': {
                      color: '#667eea'
                    }
                  }}
                />
              )}
              <Chip
                icon={<People sx={{ fontSize: 18 }} />}
                label={`${game.participatedUsers?.length || 0}/${game.maxPlayers} Players`}
                sx={{
                  bgcolor: 'rgba(102, 126, 234, 0.08)',
                  color: '#667eea',
                  fontWeight: 600,
                  borderRadius: '12px',
                  '& .MuiChip-icon': {
                    color: '#667eea'
                  }
                }}
              />
              {game.quiz?.title && (
                <Chip
                  icon={<QuizIcon sx={{ fontSize: 18 }} />}
                  label={game.quiz.title}
                  sx={{
                    bgcolor: 'rgba(102, 126, 234, 0.08)',
                    color: '#667eea',
                    fontWeight: 600,
                    borderRadius: '12px',
                    '& .MuiChip-icon': {
                      color: '#667eea'
                    }
                  }}
                />
              )}
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Card>
  )
}

export default GameHeader
