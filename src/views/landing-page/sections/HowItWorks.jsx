'use client'
import React from 'react'
import { Box, Container, Typography, Grid, Stack, useTheme } from '@mui/material'

const steps = [
  {
    number: '1',
    emoji: '📝',
    title: 'Sign Up Free',
    description: 'Create your account in just 30 seconds. No credit card needed.'
  },
  {
    number: '2',
    emoji: '🎮',
    title: 'Choose Your Quiz',
    description: 'Browse 500+ quizzes or join live competitions happening now.'
  },
  {
    number: '3',
    emoji: '🏆',
    title: 'Win & Learn',
    description: 'Compete, climb leaderboards, and win real prizes & rewards!'
  }
]

function HowItWorks() {
  const theme = useTheme()

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        background: `linear-gradient(180deg, 
          ${theme.palette.background.default} 0%, 
          ${theme.palette.background.paper} 100%)`
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={8}>
          {/* Header */}
          <Stack spacing={2} alignItems="center" textAlign="center">
            <Typography
              variant="overline"
              sx={{
                color: theme.palette.primary.main,
                fontWeight: 700,
                fontSize: '0.9rem',
                letterSpacing: 3
              }}
            >
              SIMPLE PROCESS
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '2rem', md: '2.75rem' }
              }}
            >
              How It Works
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600 }}>
              Get started in 3 easy steps
            </Typography>
          </Stack>

          {/* Steps */}
          <Grid container spacing={4}>
            {steps.map((step, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Stack
                  spacing={3}
                  alignItems="center"
                  textAlign="center"
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    height: '100%',
                    position: 'relative',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-10px)',
                      '& .step-emoji': {
                        transform: 'scale(1.2) rotate(10deg)'
                      }
                    }
                  }}
                >
                  {/* Number Badge */}
                  <Box
                    sx={{
                      width: { xs: 40, md: 50 },
                      height: { xs: 40, md: 50 },
                      borderRadius: '50%',
                      bgcolor: theme.palette.primary.main,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: { xs: '1.25rem', md: '1.5rem' },
                      boxShadow: `0 4px 20px ${theme.palette.primary.main}40`
                    }}
                  >
                    {step.number}
                  </Box>

                  {/* Emoji */}
                  <Box
                    className="step-emoji"
                    sx={{
                      fontSize: { xs: '3.5rem', md: '5rem' },
                      transition: 'transform 0.3s ease'
                    }}
                  >
                    {step.emoji}
                  </Box>

                  {/* Content */}
                  <Typography 
                    variant="h5" 
                    fontWeight={700}
                    sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' } }}
                  >
                    {step.title}
                  </Typography>
                  <Typography 
                    variant="body1" 
                    color="text.secondary" 
                    sx={{ 
                      lineHeight: 1.7,
                      fontSize: { xs: '0.875rem', md: '1rem' },
                      px: { xs: 1, md: 0 }
                    }}
                  >
                    {step.description}
                  </Typography>

                  {/* Connector Arrow (except last) */}
                  {index < steps.length - 1 && (
                    <Box
                      sx={{
                        display: { xs: 'none', md: 'block' },
                        position: 'absolute',
                        top: '30%',
                        right: '-10%',
                        fontSize: '3rem',
                        color: theme.palette.primary.main,
                        opacity: 0.3
                      }}
                    >
                      →
                    </Box>
                  )}
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Container>
    </Box>
  )
}

export default HowItWorks

