'use client'
import React from 'react'
import { Box, Container, Typography, Grid, Paper, Stack, useTheme } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import GroupsIcon from '@mui/icons-material/Groups'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'

const features = [
  {
    icon: '🎯',
    title: 'Interactive Quizzes',
    description: 'Engage with thousands of quizzes across various topics',
    color: '#FF6B6B'
  },
  {
    icon: '🏆',
    title: 'Win Real Prizes',
    description: 'Compete and win cash rewards, certificates & more',
    color: '#4ECDC4'
  },
  {
    icon: '👥',
    title: 'Play with Friends',
    description: 'Challenge your friends or join public competitions',
    color: '#45B7D1'
  },
  {
    icon: '📊',
    title: 'Track Progress',
    description: 'Monitor your performance with detailed analytics',
    color: '#FFA07A'
  }
]

function ValueProposition() {
  const theme = useTheme()

  return (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.paper' }}>
      <Container maxWidth="lg">
        <Stack spacing={8}>
          {/* Header */}
          <Stack spacing={2} alignItems="center" textAlign="center">
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '2rem', md: '2.75rem' },
                color: theme.palette.text.primary
              }}
            >
              Why Students Love{' '}
              <Box
                component="span"
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                GurukulamHub
              </Box>
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: 600, fontSize: { xs: '1rem', md: '1.1rem' } }}
            >
              Everything you need to make learning fun, competitive, and rewarding
            </Typography>
          </Stack>

          {/* Features Grid */}
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    height: '100%',
                    borderRadius: 4,
                    border: '2px solid',
                    borderColor: 'divider',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: feature.color,
                      transform: 'translateY(-10px)',
                      boxShadow: `0 20px 40px ${feature.color}30`,
                      '& .feature-icon': {
                        transform: 'scale(1.2) rotate(10deg)'
                      }
                    }
                  }}
                >
                  <Stack spacing={2} alignItems="center">
                    <Box
                      className="feature-icon"
                      sx={{
                        fontSize: '4rem',
                        transition: 'transform 0.3s ease'
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" fontWeight={700}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      {feature.description}
                    </Typography>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Bottom Banner */}
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 4,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.secondary.main}15)`,
              border: `2px solid ${theme.palette.primary.main}30`,
              textAlign: 'center'
            }}
          >
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} justifyContent="center" alignItems="center">
              <Stack direction="row" spacing={1} alignItems="center">
                <CheckCircleIcon sx={{ color: 'success.main', fontSize: 28 }} />
                <Typography variant="h6" fontWeight={600}>
                  100% Free to Start
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <CheckCircleIcon sx={{ color: 'success.main', fontSize: 28 }} />
                <Typography variant="h6" fontWeight={600}>
                  No Credit Card Required
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <CheckCircleIcon sx={{ color: 'success.main', fontSize: 28 }} />
                <Typography variant="h6" fontWeight={600}>
                  Instant Access
                </Typography>
              </Stack>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Box>
  )
}

export default ValueProposition

