'use client'

import { Box, Container, Typography, Button, Stack, Chip, Card, CardContent } from '@mui/material'
import { useTheme, alpha } from '@mui/material/styles'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import CelebrationIcon from '@mui/icons-material/Celebration'
import Leaderboard from './Leaderboard'
import { useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'
const Lottie = dynamic(() => import('lottie-react'), { ssr: false })
import trophyAnimation from '../../../../public/animations/trophy.json'

const GameEnded = ({ onExit, game = null, isAdmin = false }) => {
  const { data: session } = useSession()
  const theme = useTheme()
  const hasParticipated = game?.participatedUsers?.find(p => p.email === session?.user?.email)

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100%',
        background: `radial-gradient(circle at 20% 30%, ${alpha(
          theme.palette.primary.main,
          theme.palette.mode === 'dark' ? 0.15 : 0.08
        )} 0%, transparent 50%),
                     radial-gradient(circle at 80% 70%, ${alpha(
                       theme.palette.secondary.main,
                       theme.palette.mode === 'dark' ? 0.15 : 0.08
                     )} 0%, transparent 50%),
                     ${theme.palette.background.default}`,
        py: { xs: 4, md: 6 },
        position: 'relative',
        overflow: 'auto',
        overflowX: 'hidden',
        pb: { xs: 6, md: 8 }
      }}
    >
      {/* Decorative Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: theme.palette.mode === 'dark' ? 0.05 : 0.03,
          backgroundImage: `radial-gradient(circle at 2px 2px, ${theme.palette.primary.main} 1px, transparent 0)`,
          backgroundSize: '40px 40px',
          pointerEvents: 'none'
        }}
      />

      <Container
        maxWidth='lg'
        sx={{
          width: '100%',
          position: 'relative',
          zIndex: 1,
          pb: { xs: 2, md: 3 },
          px: { xs: 2, sm: 3, md: 4 }
        }}
      >
        {/* Hero Section */}
        <Box
          sx={{
            mb: { xs: 5, md: 7 },
            textAlign: 'center'
          }}
        >
          <Stack spacing={2} alignItems='center'>
            {/* Status Chip */}
            <Chip
              icon={<CelebrationIcon sx={{ fontSize: 18 }} />}
              label='Game Completed'
              sx={{
                fontWeight: 700,
                bgcolor: alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.25 : 0.12),
                color: theme.palette.success.main,
                border: `1.5px solid ${alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.4 : 0.3)}`,
                borderRadius: 3,
                px: 2,
                py: 0.5,
                fontSize: '0.9rem',
                boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.2)}`
              }}
            />

            {/* Game Title */}
            <Typography
              variant='h2'
              sx={{
                fontSize: { xs: '2rem', sm: '2.75rem', md: '3.5rem' },
                fontWeight: 900,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: 1.1,
                letterSpacing: '-0.03em',
                px: { xs: 2, md: 0 },
                mb: 0
              }}
            >
              {game?.title || 'Game'}
            </Typography>

            {/* Trophy Animation */}
            <Box
              sx={{
                width: { xs: 240, sm: 320, md: 380 },
                height: { xs: 240, sm: 320, md: 380 },
                position: 'relative'
              }}
            >
              <Lottie animationData={trophyAnimation} loop={false} />
            </Box>

            {/* Game Ended Message Card */}
            <Card
              sx={{
                maxWidth: 600,
                mx: 'auto',
                mt: { xs: -1, md: -1.5 },
                bgcolor:
                  theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.8) : alpha('#fff', 0.9),
                backdropFilter: 'blur(20px)',
                borderRadius: 4,
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.3 : 0.1)}`,
                overflow: 'visible'
              }}
            >
              <CardContent sx={{ p: { xs: 3, md: 4 }, pt: { xs: 4, md: 5 } }}>
                <Stack spacing={2} alignItems='center'>
                  <Typography
                    variant='h4'
                    sx={{
                      fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' },
                      fontWeight: 800,
                      color: theme.palette.mode === 'dark' ? theme.palette.error.light : theme.palette.error.main,
                      letterSpacing: '-0.02em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5
                    }}
                  >
                    <EmojiEventsIcon sx={{ fontSize: { xs: 32, md: 40 } }} />
                    Game Ended!
                  </Typography>
                  <Typography
                    variant='body1'
                    sx={{
                      color: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.85) : 'text.secondary',
                      fontSize: { xs: '1rem', md: '1.1rem' },
                      textAlign: 'center',
                      lineHeight: 1.7,
                      maxWidth: 500
                    }}
                  >
                    The game has concluded. Check the leaderboard below to see how you ranked among all participants!
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Box>

        {/* Leaderboard Section */}
        {game && (
          <Box
            sx={{
              mb: { xs: 4, md: 5 },
              position: 'relative'
            }}
          >
            <Card
              sx={{
                bgcolor: theme.palette.mode === 'dark' ? theme.palette.background.paper : 'white',
                borderRadius: 4,
                border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                boxShadow: `0 12px 40px ${alpha(
                  theme.palette.common.black,
                  theme.palette.mode === 'dark' ? 0.3 : 0.08
                )}`,
                overflow: 'visible',
                position: 'relative',
                maxHeight: { xs: '70vh', md: '80vh' },
                display: 'flex',
                flexDirection: 'column',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  zIndex: 1
                }
              }}
            >
              <Box
                sx={{
                  overflow: 'auto',
                  overflowX: 'hidden',
                  maxHeight: { xs: '70vh', md: '80vh' },
                  '&::-webkit-scrollbar': {
                    width: '8px'
                  },
                  '&::-webkit-scrollbar-track': {
                    background:
                      theme.palette.mode === 'dark'
                        ? alpha(theme.palette.common.black, 0.2)
                        : alpha(theme.palette.common.black, 0.05),
                    borderRadius: '4px'
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: alpha(theme.palette.primary.main, 0.5),
                    borderRadius: '4px',
                    '&:hover': {
                      background: alpha(theme.palette.primary.main, 0.7)
                    }
                  }
                }}
              >
                <Leaderboard game={game} isAdmin={isAdmin} />
              </Box>
            </Card>
          </Box>
        )}

        {/* Thank You Message */}
        {hasParticipated && (
          <Card
            sx={{
              mb: { xs: 4, md: 5 },
              bgcolor: `linear-gradient(135deg, ${alpha(
                theme.palette.primary.main,
                theme.palette.mode === 'dark' ? 0.2 : 0.1
              )}, ${alpha(theme.palette.secondary.main, theme.palette.mode === 'dark' ? 0.15 : 0.08)})`,
              background: `linear-gradient(135deg, ${alpha(
                theme.palette.primary.main,
                theme.palette.mode === 'dark' ? 0.2 : 0.1
              )}, ${alpha(theme.palette.secondary.main, theme.palette.mode === 'dark' ? 0.15 : 0.08)})`,
              borderRadius: 3,
              border: `2px solid ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.4 : 0.25)}`,
              boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.15)}`,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -50,
                right: -50,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.2)} 0%, transparent 70%)`,
                pointerEvents: 'none'
              }
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 4 }, position: 'relative', zIndex: 1 }}>
              <Stack spacing={1.5} alignItems='center' textAlign='center'>
                <CelebrationIcon
                  sx={{
                    fontSize: { xs: 40, md: 48 },
                    color: theme.palette.primary.main,
                    mb: 0.5
                  }}
                />
                <Typography
                  variant='h5'
                  sx={{
                    fontWeight: 800,
                    color: theme.palette.primary.main,
                    fontSize: { xs: '1.25rem', md: '1.5rem' },
                    letterSpacing: '-0.01em'
                  }}
                >
                  Thank You for Participating!
                </Typography>
                <Typography
                  variant='body1'
                  sx={{
                    color: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.85) : 'text.secondary',
                    fontSize: { xs: '0.95rem', md: '1.05rem' },
                    maxWidth: 500,
                    lineHeight: 1.7
                  }}
                >
                  Your participation makes this community stronger. Keep playing, keep learning, and keep improving!
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Action Button */}
        <Stack alignItems='center' sx={{ mt: { xs: 2, md: 3 }, mb: { xs: 1, md: 2 } }}>
          <Button
            variant='contained'
            size='large'
            component='label'
            onClick={onExit}
            startIcon={<EmojiEventsIcon />}
            sx={{
              px: { xs: 5, md: 7 },
              py: { xs: 1.5, md: 1.75 },
              fontSize: { xs: '1rem', md: '1.1rem' },
              fontWeight: 700,
              color: 'white',
              borderRadius: 3,
              textTransform: 'none',
              boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.4 : 0.35)}`,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                transition: 'left 0.5s'
              },
              '&:hover': {
                boxShadow: `0 12px 32px ${alpha(
                  theme.palette.primary.main,
                  theme.palette.mode === 'dark' ? 0.5 : 0.45
                )}`,
                transform: 'translateY(-3px)',
                '&::before': {
                  left: '100%'
                }
              },
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            Explore Available Games
          </Button>
        </Stack>
      </Container>
    </Box>
  )
}

export default GameEnded
