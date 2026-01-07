'use client'
import React from 'react'
import { Box, Container, Typography, Button, Stack, useTheme } from '@mui/material'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'

function FinalCTA({ isAuthenticated = false }) {
  const theme = useTheme()
  const router = useRouter()
  const { status } = useSession()

  const handleGetStarted = () => {
    if (isAuthenticated || status === 'authenticated') {
      router.push('/publicquiz/view')
    } else {
      router.push('/auth/login')
    }
  }

  return (
    <Box
      sx={{
        position: 'relative',
        py: { xs: 10, md: 14 },
        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        color: 'white',
        overflow: 'hidden'
      }}
    >
      {/* Background Pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}
      />

      <Container maxWidth='md' sx={{ position: 'relative', zIndex: 1 }}>
        <Stack spacing={5} alignItems='center' textAlign='center'>
          {/* Icon */}
          <Box
            sx={{
              fontSize: { xs: '3rem', md: '5rem' },
              animation: 'bounce 2s ease-in-out infinite'
            }}
          >
            {isAuthenticated ? '🎯' : '🚀'}
          </Box>

          {/* Headline */}
          <Typography
            variant='h2'
            sx={{
              fontWeight: 900,
              fontSize: { xs: '2rem', md: '3rem' },
              lineHeight: 1.2
            }}
          >
            {isAuthenticated ? 'Keep Your Momentum Going!' : 'Ready to Start Your Learning Journey?'}
          </Typography>

          {/* Subheadline */}
          <Typography
            variant='h5'
            sx={{
              fontSize: { xs: '1.1rem', md: '1.3rem' },
              opacity: 0.95,
              maxWidth: 600,
              lineHeight: 1.6
            }}
          >
            {isAuthenticated
              ? 'Challenge yourself with new quizzes every day. Track your progress and compete for top positions!'
              : 'Join 10,000+ students who are already learning, competing, and winning prizes on GurukulamHub'}
          </Typography>

          {/* CTA Button */}
          <Button
            variant='contained'
            component='label'
            size='large'
            startIcon={<RocketLaunchIcon />}
            onClick={handleGetStarted}
            sx={{
              bgcolor: 'white',
              color: theme.palette.primary.main,
              px: { xs: 4, md: 6 },
              py: { xs: 1.5, md: 2.5 },
              fontSize: { xs: '1rem', md: '1.2rem' },
              fontWeight: 800,
              borderRadius: 3,
              textTransform: 'none',
              mt: 2,
              width: { xs: '100%', sm: 'auto' },
              boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.95)',
                transform: 'translateY(-4px) scale(1.02)',
                boxShadow: '0 15px 50px rgba(0,0,0,0.4)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            {isAuthenticated ? 'Start Playing Quizzes Now' : 'Get Started Free Now'}
          </Button>

          {/* Trust Badges */}
          {!isAuthenticated && (
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 1.5, sm: 3 }}
              sx={{ pt: 2 }}
              alignItems='center'
            >
              <Typography
                variant='body1'
                sx={{
                  opacity: 0.9,
                  fontSize: { xs: '0.875rem', md: '1rem' }
                }}
              >
                ✓ No credit card required
              </Typography>
              <Typography
                variant='body1'
                sx={{
                  opacity: 0.9,
                  fontSize: { xs: '0.875rem', md: '1rem' }
                }}
              >
                ✓ Free forever
              </Typography>
              <Typography
                variant='body1'
                sx={{
                  opacity: 0.9,
                  fontSize: { xs: '0.875rem', md: '1rem' }
                }}
              >
                ✓ Cancel anytime
              </Typography>
            </Stack>
          )}
        </Stack>
      </Container>

      <style jsx global>{`
        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </Box>
  )
}

export default FinalCTA
