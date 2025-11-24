'use client'
import React from 'react'
import { Box, Container, Typography, Button, Stack, Grid, useTheme, useMediaQuery } from '@mui/material'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import Image from 'next/image'

function Hero({ isAuthenticated = false }) {
  const theme = useTheme()
  const router = useRouter()
  const { status } = useSession()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const handleGetStarted = () => {
    if (isAuthenticated || status === 'authenticated') {
      router.push('/publicquiz/view')
    } else {
      router.push('/auth/login')
    }
  }

  const handleBrowseQuizzes = () => {
    router.push('/publicquiz/view')
  }

  const handleViewGames = () => {
    router.push('/public-games')
  }

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: { xs: '90vh', md: '95vh' },
        display: 'flex',
        alignItems: 'center',
        background: `radial-gradient(circle at 20% 50%, ${theme.palette.primary.main}15 0%, transparent 50%),
                     radial-gradient(circle at 80% 80%, ${theme.palette.secondary.main}15 0%, transparent 50%),
                     ${theme.palette.background.default}`,
        overflow: 'hidden',
        pt: { xs: 10, md: 0 }
      }}
    >
      {/* Animated background shapes */}
      <Box
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
          opacity: 0.4,
          zIndex: 0,
          '& > div': {
            position: 'absolute',
            borderRadius: '50%'
          }
        }}
      >
        <Box
          sx={{
            width: 300,
            height: 300,
            top: '10%',
            right: '10%',
            background: `linear-gradient(135deg, ${theme.palette.primary.main}30, ${theme.palette.secondary.main}30)`,
            animation: 'float 20s ease-in-out infinite'
          }}
        />
        <Box
          sx={{
            width: 200,
            height: 200,
            bottom: '20%',
            left: '5%',
            background: `linear-gradient(135deg, ${theme.palette.secondary.main}30, ${theme.palette.primary.main}30)`,
            animation: 'float 15s ease-in-out infinite 5s'
          }}
        />
      </Box>

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={6} alignItems="center">
          {/* Left Content */}
          <Grid item xs={12} md={6}>
            <Stack spacing={4}>
               {/* Badge */}
               <Box
                 sx={{
                   display: 'inline-flex',
                   alignItems: 'center',
                   gap: 1,
                   bgcolor: theme.palette.primary.main,
                   color: 'white',
                   px: 2,
                   py: 0.75,
                   borderRadius: 50,
                   width: 'fit-content',
                   fontSize: '0.875rem',
                   fontWeight: 600,
                   animation: 'slideInLeft 0.6s ease-out'
                 }}
               >
                 {isAuthenticated ? '🎉 Welcome Back!' : '✨ India\'s #1 Quiz Platform'}
               </Box>

               {/* Main Headline */}
               <Typography
                 variant="h1"
                 sx={{
                   fontWeight: 900,
                   fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem', lg: '4.5rem' },
                   lineHeight: 1.1,
                   color: theme.palette.text.primary,
                   animation: 'slideInLeft 0.6s ease-out 0.1s backwards',
                   '& span': {
                     background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                     WebkitBackgroundClip: 'text',
                     WebkitTextFillColor: 'transparent',
                     display: 'inline-block'
                   }
                 }}
               >
                 {isAuthenticated ? (
                   <>
                     Ready to{' '}
                     <span>Continue Learning?</span>
                   </>
                 ) : (
                   <>
                     Learn. Play.{' '}
                     <span>Win Rewards!</span>
                   </>
                 )}
               </Typography>

               {/* Subheadline */}
               <Typography
                 variant="h5"
                 sx={{
                   color: theme.palette.text.secondary,
                   fontSize: { xs: '1.1rem', md: '1.25rem' },
                   lineHeight: 1.6,
                   fontWeight: 400,
                   animation: 'slideInLeft 0.6s ease-out 0.2s backwards'
                 }}
               >
                 {isAuthenticated ? (
                   'Explore new quizzes, join live competitions, and track your progress. Your next challenge awaits!'
                 ) : (
                   'Join thousands of learners competing in live quizzes and games. Test your knowledge, challenge friends, and win amazing prizes! 🏆'
                 )}
               </Typography>

               {/* CTA Buttons */}
               <Stack
                 direction={{ xs: 'column', sm: 'row' }}
                 spacing={2}
                 sx={{ animation: 'slideInLeft 0.6s ease-out 0.3s backwards' }}
               >
                 {isAuthenticated ? (
                   <>
                     <Button
                       component='label'
                       variant="contained"
                       size="large"
                       onClick={handleBrowseQuizzes}
                       startIcon={<PlayArrowIcon />}
                       sx={{
                         bgcolor: theme.palette.primary.main,
                         color: 'white',
                         px: 4,
                         py: 2,
                         fontSize: '1.1rem',
                         fontWeight: 700,
                         borderRadius: 2,
                         textTransform: 'none',
                         boxShadow: `0 8px 24px ${theme.palette.primary.main}40`,
                         '&:hover': {
                           bgcolor: theme.palette.primary.dark,
                           transform: 'translateY(-2px)',
                           boxShadow: `0 12px 32px ${theme.palette.primary.main}60`
                         },
                         transition: 'all 0.3s ease'
                       }}
                     >
                       Explore Quizzes
                     </Button>

                     <Button
                       variant="outlined"
                       size="large"
                       onClick={handleViewGames}
                       sx={{
                         borderColor: theme.palette.text.primary,
                         color: theme.palette.text.primary,
                         px: 4,
                         py: 2,
                         fontSize: '1.1rem',
                         fontWeight: 700,
                         borderRadius: 2,
                         borderWidth: 2,
                         textTransform: 'none',
                         '&:hover': {
                           borderWidth: 2,
                           borderColor: theme.palette.secondary.main,
                           bgcolor: `${theme.palette.secondary.main}10`,
                           transform: 'translateY(-2px)'
                         },
                         transition: 'all 0.3s ease'
                       }}
                     >
                       View Competitions
                     </Button>
                   </>
                 ) : (
                   <>
                     <Button
                       variant="contained"
                       component='label'
                       size="large"
                       onClick={handleGetStarted}
                       startIcon={<PlayArrowIcon />}
                       sx={{
                         bgcolor: theme.palette.primary.main,
                         color: 'white',
                         px: 4,
                         py: 2,
                         fontSize: '1.1rem',
                         fontWeight: 700,
                         borderRadius: 2,
                         textTransform: 'none',
                         boxShadow: `0 8px 24px ${theme.palette.primary.main}40`,
                         '&:hover': {
                           bgcolor: theme.palette.primary.dark,
                           transform: 'translateY(-2px)',
                           boxShadow: `0 12px 32px ${theme.palette.primary.main}60`
                         },
                         transition: 'all 0.3s ease'
                       }}
                     >
                       Start Playing Free
                     </Button>

                     <Button
                       variant="outlined"
                       size="large"
                       onClick={handleBrowseQuizzes}
                       sx={{
                         borderColor: theme.palette.text.primary,
                         color: theme.palette.text.primary,
                         px: 4,
                         py: 2,
                         fontSize: '1.1rem',
                         fontWeight: 700,
                         borderRadius: 2,
                         borderWidth: 2,
                         textTransform: 'none',
                         '&:hover': {
                           borderWidth: 2,
                           borderColor: theme.palette.primary.main,
                           bgcolor: `${theme.palette.primary.main}10`,
                           transform: 'translateY(-2px)'
                         },
                         transition: 'all 0.3s ease'
                       }}
                     >
                       Browse Quizzes
                     </Button>
                   </>
                 )}
               </Stack>

              {/* Stats */}
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={{ xs: 2, sm: 4 }}
                sx={{
                  pt: 3,
                  animation: 'slideInLeft 0.6s ease-out 0.4s backwards',
                  flexWrap: 'wrap'
                }}
              >
                <Box sx={{ minWidth: { xs: '100%', sm: 'auto' } }}>
                  <Typography 
                    variant="h4" 
                    fontWeight={800} 
                    color="primary"
                    sx={{ fontSize: { xs: '1.75rem', sm: '2rem' } }}
                  >
                    10K+
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    Active Players
                  </Typography>
                </Box>
                <Box sx={{ minWidth: { xs: '100%', sm: 'auto' } }}>
                  <Typography 
                    variant="h4" 
                    fontWeight={800} 
                    color="primary"
                    sx={{ fontSize: { xs: '1.75rem', sm: '2rem' } }}
                  >
                    500+
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    Live Games
                  </Typography>
                </Box>
                <Box sx={{ minWidth: { xs: '100%', sm: 'auto' } }}>
                  <Typography 
                    variant="h4" 
                    fontWeight={800} 
                    color="primary"
                    sx={{ fontSize: { xs: '1.75rem', sm: '2rem' } }}
                  >
                    ₹50L+
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    Prizes Won
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Grid>

          {/* Right Visual */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                position: 'relative',
                height: { xs: 400, md: 500 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'slideInRight 0.8s ease-out'
              }}
            >
              {/* Central element */}
              <Box
                sx={{
                  position: 'relative',
                  width: { xs: 280, md: 350 },
                  height: { xs: 280, md: 350 },
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}20)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 20px 60px ${theme.palette.primary.main}30`,
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    width: '110%',
                    height: '110%',
                    borderRadius: '50%',
                    border: `2px dashed ${theme.palette.primary.main}40`,
                    animation: 'rotate 30s linear infinite'
                  }
                }}
              >
                <Typography 
                  variant="h1" 
                  sx={{ 
                    fontSize: { xs: '4rem', sm: '6rem', md: '8rem' },
                    lineHeight: 1
                  }}
                >
                  🎓
                </Typography>
              </Box>

              {/* Floating cards */}
              {[
                { emoji: '🎯', top: '5%', right: '15%', delay: '0s', size: { xs: 50, md: 80 } },
                { emoji: '🏆', top: '45%', right: '5%', delay: '2s', size: { xs: 55, md: 90 } },
                { emoji: '⚡', bottom: '10%', right: '25%', delay: '4s', size: { xs: 45, md: 70 } },
                { emoji: '💡', top: '20%', left: '5%', delay: '1s', size: { xs: 52, md: 85 } },
                { emoji: '🎮', bottom: '25%', left: '15%', delay: '3s', size: { xs: 48, md: 75 } }
              ].map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    position: 'absolute',
                    top: item.top,
                    right: item.right,
                    bottom: item.bottom,
                    left: item.left,
                    width: { xs: item.size.xs, md: item.size.md },
                    height: { xs: item.size.xs, md: item.size.md },
                    borderRadius: 3,
                    bgcolor: 'background.paper',
                    boxShadow: theme.palette.mode === 'dark' 
                      ? '0 10px 30px rgba(0,0,0,0.3)' 
                      : '0 10px 30px rgba(0,0,0,0.1)',
                    display: { xs: 'none', md: 'flex' },
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: { xs: '1.25rem', md: '2rem' },
                    animation: `float 6s ease-in-out infinite ${item.delay}`,
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      boxShadow: theme.palette.mode === 'dark'
                        ? '0 15px 40px rgba(0,0,0,0.4)'
                        : '0 15px 40px rgba(0,0,0,0.15)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {item.emoji}
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Container>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </Box>
  )
}

export default Hero

