import React from 'react'
import { Box, Card, CardContent, Typography, Button, Grid, Container, useTheme } from '@mui/material'
import { alpha } from '@mui/material/styles'
import {
  Schedule as ScheduleIcon,
  RequestQuote as RequestIcon,
  SportsEsports as GameIcon,
  Favorite as FavoriteIcon
} from '@mui/icons-material'

const GameCreationModeSelector = ({ onModeSelect }) => {
  const theme = useTheme()

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `radial-gradient(circle at 20% 20%, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 50%),
                     radial-gradient(circle at 80% 80%, ${alpha(
                       theme.palette.secondary.main,
                       0.05
                     )} 0%, transparent 50%),
                     ${theme.palette.background.default}`
      }}
    >
      {/* Elegant Header */}
      <Box
        sx={{
          backdropFilter: 'blur(20px)',
          bgcolor: alpha('#fff', 0.7),
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
          pt: { xs: 4, md: 6 },
          pb: { xs: 4, md: 6 }
        }}
      >
        <Container maxWidth='lg'>
          <Box sx={{ textAlign: 'center' }}>
            {/* Icon and Title */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 2,
                mb: 2
              }}
            >
              <Box
                sx={{
                  width: { xs: 48, sm: 56 },
                  height: { xs: 48, sm: 56 },
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.3)}`
                }}
              >
                <GameIcon sx={{ fontSize: 28, color: 'white' }} />
              </Box>
              <Typography
                sx={{
                  fontSize: { xs: '2rem', md: '2.5rem' },
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.02em'
                }}
              >
                Create New Game
              </Typography>
            </Box>
            <Typography
              variant='body1'
              color='text.secondary'
              sx={{
                fontSize: '1.05rem',
                lineHeight: 1.8,
                maxWidth: 600,
                mx: 'auto',
                fontWeight: 400
              }}
            >
              Choose how you want to create your game
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Content Area */}
      <Container maxWidth='lg' sx={{ py: { xs: 3, md: 4 } }}>
        {/* Cards Section */}
        <Grid container spacing={{ xs: 3, md: 4 }} sx={{ mb: 5 }}>
          {/* Option 1: Create & Schedule with existing sponsors */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                borderRadius: 3,
                background: '#ffffff',
                border: theme => `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                boxShadow: theme => theme.shadows[3],
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 40px rgba(139, 92, 246, 0.2)',
                  '&::before': {
                    opacity: 1
                  }
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #8b5cf6 0%, #c4b5fd 100%)',
                  opacity: 0,
                  transition: 'opacity 0.3s ease'
                }
              }}
              onClick={() => onModeSelect('existing_sponsors')}
            >
              <CardContent
                sx={{
                  p: { xs: 3, sm: 4 },
                  textAlign: 'center',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #c4b5fd 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                    boxShadow: '0 4px 14px rgba(139, 92, 246, 0.3)',
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'rotate(5deg)'
                    }
                  }}
                >
                  <ScheduleIcon sx={{ fontSize: 40, color: 'white' }} />
                </Box>
                <Typography
                  variant='h5'
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: '1.25rem', sm: '1.5rem' },
                    color: '#1a1a1a',
                    mb: 2
                  }}
                >
                  Create & Schedule Game
                </Typography>
                <Typography
                  variant='body1'
                  sx={{
                    color: 'text.secondary',
                    mb: 3,
                    lineHeight: 1.7,
                    fontSize: '0.95rem',
                    flex: 1
                  }}
                >
                  Use existing sponsorships to create and immediately schedule your game
                </Typography>
                <Button
                  variant='contained'
                  component='label'
                  fullWidth
                  sx={{
                    borderRadius: 2,
                    color: 'white',
                    fontWeight: 600,
                  }}

                >
                  Create with Existing Sponsors
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Option 2: Create game & Request sponsorship */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                borderRadius: 3,
                background: '#ffffff',
                border: theme => `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                boxShadow: theme => theme.shadows[3],
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 40px rgba(139, 92, 246, 0.2)',
                  '&::before': {
                    opacity: 1
                  }
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #8b5cf6 0%, #c4b5fd 100%)',
                  opacity: 0,
                  transition: 'opacity 0.3s ease'
                }
              }}
              onClick={() => onModeSelect('request_sponsorship')}
            >
              <CardContent
                sx={{
                  p: { xs: 3, sm: 4 },
                  textAlign: 'center',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #a78bfa 0%, #ddd6fe 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                    boxShadow: '0 4px 14px rgba(139, 92, 246, 0.25)',
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'rotate(5deg)'
                    }
                  }}
                >
                  <RequestIcon sx={{ fontSize: 40, color: 'white' }} />
                </Box>
                <Typography
                  variant='h5'
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: '1.25rem', sm: '1.5rem' },
                    color: '#1a1a1a',
                    mb: 2
                  }}
                >
                  Create Game & Request Sponsorship
                </Typography>
                <Typography
                  variant='body1'
                  sx={{
                    color: 'text.secondary',
                    mb: 3,
                    lineHeight: 1.7,
                    fontSize: '0.95rem',
                    flex: 1
                  }}
                >
                  Create your game first and request sponsors to fund the rewards
                </Typography>
                <Button
                  variant='contained'
                  component='label'
                  fullWidth
                  sx={{
                    borderRadius: 2,
                    color: 'white',
                    fontWeight: 600,
                  }}
                >
                  Request Sponsorship
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Info Section */}
        <Card
          sx={{
            borderRadius: 3,
            background: '#ffffff',
            border: theme => `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            boxShadow: theme => theme.shadows[2],
            p: { xs: 3, sm: 4 }
          }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  p: 3,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(196, 181, 253, 0.05) 100%)',
                  border: theme => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(196, 181, 253, 0.08) 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.15)'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #c4b5fd 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                    }}
                  >
                    <ScheduleIcon sx={{ fontSize: 20, color: 'white' }} />
                  </Box>
                  <Typography
                    variant='h6'
                    sx={{
                      color: 'text.primary',
                      fontWeight: 700,
                      fontSize: '1.1rem'
                    }}
                  >
                    Option 1: Existing Sponsors
                  </Typography>
                </Box>
                <Typography
                  variant='body2'
                  sx={{
                    color: 'text.secondary',
                    lineHeight: 1.7,
                    fontSize: '0.95rem'
                  }}
                >
                  Best when you already have sponsors committed to your game. Schedule and launch immediately.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  p: 3,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(196, 181, 253, 0.05) 100%)',
                  border: theme => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(196, 181, 253, 0.08) 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.15)'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #a78bfa 0%, #ddd6fe 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(139, 92, 246, 0.25)'
                    }}
                  >
                    <RequestIcon sx={{ fontSize: 20, color: 'white' }} />
                  </Box>
                  <Typography
                    variant='h6'
                    sx={{
                      color: 'text.primary',
                      fontWeight: 700,
                      fontSize: '1.1rem'
                    }}
                  >
                    Option 2: Request Sponsorship
                  </Typography>
                </Box>
                <Typography
                  variant='body2'
                  sx={{
                    color: 'text.secondary',
                    lineHeight: 1.7,
                    fontSize: '0.95rem'
                  }}
                >
                  Best when you want to create the game first and find sponsors later. Perfect for planning ahead.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Card>
      </Container>
    </Box>
  )
}

export default GameCreationModeSelector
