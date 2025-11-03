import React from 'react'
import { Box, Card, CardContent, Typography, Button, Grid, Container } from '@mui/material'
import {
  Schedule as ScheduleIcon,
  RequestQuote as RequestIcon,
  SportsEsports as GameIcon,
  Favorite as FavoriteIcon
} from '@mui/icons-material'

const GameCreationModeSelector = ({ onModeSelect }) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: { xs: 4, sm: 6, md: 8 },
        px: { xs: 2, sm: 3 },
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.4
        }
      }}
    >
      <Container maxWidth='lg' sx={{ position: 'relative', zIndex: 1 }}>
        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
            <GameIcon sx={{ fontSize: { xs: 40, sm: 50, md: 60 }, color: 'white' }} />
            <Typography
              variant='h2'
              sx={{
                color: 'white',
                fontWeight: 700,
                fontSize: { xs: '2rem', sm: '2.75rem', md: '3.5rem' },
                letterSpacing: '-1px',
                textShadow: '0 2px 20px rgba(0,0,0,0.2)'
              }}
            >
              Create New Game
            </Typography>
          </Box>
          <Typography
            variant='h6'
            sx={{
              color: 'rgba(255, 255, 255, 0.95)',
              maxWidth: '700px',
              mx: 'auto',
              fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
              fontWeight: 400
            }}
          >
            Choose how you want to create your game
          </Typography>
        </Box>

        {/* Cards Section */}
        <Grid container spacing={{ xs: 3, md: 4 }} sx={{ mb: 5 }}>
          {/* Option 1: Create & Schedule with existing sponsors */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                borderRadius: '24px',
                background: 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: '0 20px 60px rgba(102, 126, 234, 0.4)',
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
                  height: '6px',
                  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
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
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)'
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
                  fullWidth
                  sx={{
                    py: 1.5,
                    borderRadius: '12px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important',
                    color: '#ffffff !important',
                    boxShadow: '0 4px 14px rgba(102, 126, 234, 0.4)',
                    opacity: '1 !important',
                    visibility: 'visible !important',
                    '& .MuiButton-label': {
                      color: '#ffffff !important',
                      opacity: '1 !important'
                    },
                    '& span': {
                      color: '#ffffff !important',
                      opacity: '1 !important'
                    },
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%) !important',
                      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                      transform: 'translateY(-2px)',
                      color: '#ffffff !important'
                    }
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
                borderRadius: '24px',
                background: 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: '0 20px 60px rgba(102, 126, 234, 0.3)',
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
                  height: '6px',
                  background: 'linear-gradient(90deg, rgba(102, 126, 234, 0.7) 0%, rgba(118, 75, 162, 0.7) 100%)',
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
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.7) 0%, rgba(118, 75, 162, 0.7) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.25)'
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
                  fullWidth
                  sx={{
                    py: 1.5,
                    borderRadius: '12px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    background:
                      'linear-gradient(135deg, rgba(102, 126, 234, 0.85) 0%, rgba(118, 75, 162, 0.85) 100%) !important',
                    color: '#ffffff !important',
                    boxShadow: '0 4px 14px rgba(102, 126, 234, 0.3)',
                    opacity: '1 !important',
                    visibility: 'visible !important',
                    '& .MuiButton-label': {
                      color: '#ffffff !important',
                      opacity: '1 !important'
                    },
                    '& span': {
                      color: '#ffffff !important',
                      opacity: '1 !important'
                    },
                    '&:hover': {
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important',
                      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
                      transform: 'translateY(-2px)',
                      color: '#ffffff !important'
                    }
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
            borderRadius: '20px',
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: 'none',
            p: { xs: 3, sm: 4 }
          }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  p: 3,
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                    }}
                  >
                    <FavoriteIcon sx={{ fontSize: 18, color: 'white' }} />
                  </Box>
                  <Typography
                    variant='body1'
                    sx={{
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '1rem'
                    }}
                  >
                    Option 1: Existing Sponsors
                  </Typography>
                </Box>
                <Typography
                  variant='body2'
                  sx={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    lineHeight: 1.6
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
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.7) 0%, rgba(118, 75, 162, 0.7) 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.25)'
                    }}
                  >
                    <FavoriteIcon sx={{ fontSize: 18, color: 'white' }} />
                  </Box>
                  <Typography
                    variant='body1'
                    sx={{
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '1rem'
                    }}
                  >
                    Option 2: Request Sponsorship
                  </Typography>
                </Box>
                <Typography
                  variant='body2'
                  sx={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    lineHeight: 1.6
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
