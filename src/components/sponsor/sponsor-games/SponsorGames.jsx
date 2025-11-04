import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Avatar,
  Stack,
  Divider,
  Alert,
  CircularProgress,
  Container,
  alpha,
  useTheme,
  CardMedia
} from '@mui/material'
import {
  EmojiEvents,
  AttachMoney,
  CardGiftcard,
  Schedule,
  People,
  ArrowForward,
  VolunteerActivism,
  CheckCircle
} from '@mui/icons-material'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'

const SponsorGames = () => {
  const router = useRouter()
  const { data: session } = useSession()
  const theme = useTheme()
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGamesAwaitingSponsorship()
  }, [])

  const fetchGamesAwaitingSponsorship = async () => {
    setLoading(true)
    try {
      const result = await RestApi.get(`${API_URLS.v0.USERS_GAME}?status=awaiting_sponsorship`)
      if (result?.status === 'success') {
        setGames(result.result || [])
      } else {
        console.error('Error fetching games:', result)
        toast.error('Failed to load games')
        setGames([])
      }
    } catch (error) {
      console.error('Error fetching games:', error)
      toast.error('An error occurred while loading games')
      setGames([])
    } finally {
      setLoading(false)
    }
  }

  const handleViewGameDetails = (gameId) => {
    // Navigate to game details page
    router.push(`/sponsor/games/${gameId}`)
  }

  const calculateRemainingNeed = (reward) => {
    const totalNeeded = reward.rewardType === 'cash' 
      ? reward.rewardValuePerWinner * reward.numberOfWinnersForThisPosition
      : reward.numberOfWinnersForThisPosition
    
    const totalAllocated = reward.sponsors?.reduce((sum, sponsor) => sum + (sponsor.allocated || 0), 0) || 0
    
    return Math.max(0, totalNeeded - totalAllocated)
  }

  const getSponsorButtonOptions = (reward) => {
    const remaining = calculateRemainingNeed(reward)
    const options = []
    
    if (reward.rewardType === 'cash') {
      // For cash rewards, offer different amount options
      const perWinner = reward.rewardValuePerWinner
      const totalNeeded = perWinner * reward.numberOfWinnersForThisPosition
      
      // Offer to sponsor for 1 winner, 2 winners, etc.
      for (let i = 1; i <= reward.numberOfWinnersForThisPosition; i++) {
        const amount = perWinner * i
        if (amount <= remaining) {
          options.push({
            amount,
            label: `Sponsor ${i} winner${i > 1 ? 's' : ''} (${reward.currency} ${amount})`,
            winners: i
          })
        }
      }
    } else {
      // For physical gifts, offer to sponsor items
      for (let i = 1; i <= remaining; i++) {
        options.push({
          amount: i,
          label: `Sponsor ${i} item${i > 1 ? 's' : ''}`,
          items: i
        })
      }
    }
    
    return options
  }

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={48} />
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa', pb: 8 }}>
      {/* Clean Professional Header */}
      <Box
        sx={{
          bgcolor: 'white',
          pt: { xs: 4, md: 5 },
          pb: { xs: 4, md: 5 },
          borderBottom: '1px solid #e8eaed'
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={2.5}>
            {/* Title Section */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <VolunteerActivism sx={{ fontSize: 32, color: theme.palette.primary.main }} />
              </Box>
              
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h3"
                  fontWeight={800}
                  sx={{
                    fontSize: { xs: '1.75rem', md: '2.25rem' },
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    lineHeight: 1.2,
                    mb: 0.5
                  }}
                >
                  Games Awaiting Sponsorship
                </Typography>
                <Typography variant="body1" sx={{ color: '#5f6368', fontSize: '1rem' }}>
                  Support educational competitions and help students achieve their goals
                </Typography>
              </Box>

              {/* Counter Badge */}
              {games.length > 0 && (
                <Box
                  sx={{
                    display: { xs: 'none', md: 'flex' },
                    alignItems: 'center',
                    gap: 1.5,
                    px: 3,
                    py: 1.5,
                    borderRadius: 3,
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                  }}
                >
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: theme.palette.primary.main,
                      animation: 'pulse 2s ease-in-out infinite',
                      '@keyframes pulse': {
                        '0%, 100%': { opacity: 1 },
                        '50%': { opacity: 0.5 }
                      }
                    }}
                  />
                  <Typography variant="body1" fontWeight={700} sx={{ color: theme.palette.primary.main }}>
                    {games.length} {games.length === 1 ? 'Game' : 'Games'} Available
                  </Typography>
                </Box>
              )}
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 4, position: 'relative', zIndex: 2 }}>
        {games.length === 0 ? (
          <Card
            sx={{
              borderRadius: 4,
              bgcolor: 'white',
              border: '1px solid #e8eaed',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 10,
                px: 4,
                textAlign: 'center'
              }}
            >
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3
                }}
              >
                <CheckCircle sx={{ fontSize: 56, color: theme.palette.success.main }} />
              </Box>
              <Typography variant="h5" fontWeight={700} gutterBottom sx={{ color: '#202124', mb: 1.5 }}>
                All Games Fully Sponsored! 🎉
              </Typography>
              <Typography variant="body1" sx={{ color: '#5f6368', maxWidth: 600, fontSize: '1rem', lineHeight: 1.7 }}>
                Wonderful news! There are currently no games awaiting sponsorship. Check back later for new opportunities to support educational initiatives.
              </Typography>
            </Box>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {games.map(game => {
              const totalRewards = game.rewards?.length || 0
              const totalRemaining = game.rewards?.reduce((sum, reward) => sum + calculateRemainingNeed(reward), 0) || 0
              const isFullySponsored = totalRemaining === 0
              
              return (
                <Grid item xs={12} md={6} lg={4} key={game._id}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      cursor: 'pointer',
                      bgcolor: 'white',
                      border: '1px solid #e8eaed',
                      borderRadius: 4,
                      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-6px)',
                        boxShadow: '0 12px 28px rgba(0,0,0,0.12)',
                        borderColor: isFullySponsored ? theme.palette.success.main : theme.palette.primary.main
                      }
                    }}
                    onClick={() => handleViewGameDetails(game._id)}
                  >
                    {/* Clean Image Section */}
                    <Box 
                      sx={{ 
                        height: 180,
                        background: isFullySponsored
                          ? `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.8)}, ${alpha(theme.palette.success.light, 0.9)})`
                          : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.8)}, ${alpha(theme.palette.secondary.main, 0.9)})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative'
                      }}
                    >
                      <EmojiEvents 
                        sx={{ 
                          fontSize: 64, 
                          color: 'white', 
                          opacity: 0.9
                        }} 
                      />
                      
                      {/* Status Badge */}
                      <Chip
                        label={isFullySponsored ? 'Fully Sponsored' : 'Seeking Support'}
                        icon={isFullySponsored ? <CheckCircle sx={{ fontSize: 14 }} /> : undefined}
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 16,
                          right: 16,
                          bgcolor: 'white',
                          color: isFullySponsored ? theme.palette.success.main : theme.palette.warning.main,
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                          '& .MuiChip-icon': {
                            color: isFullySponsored ? theme.palette.success.main : theme.palette.warning.main
                          }
                        }}
                      />
                    </Box>

                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
                      {/* Title & Quiz */}
                      <Box sx={{ mb: 3 }}>
                        <Typography 
                          variant='h6' 
                          fontWeight={700}
                          gutterBottom
                          sx={{
                            color: '#202124',
                            fontSize: '1.15rem',
                            lineHeight: 1.3,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            minHeight: 50
                          }}
                        >
                          {game.title}
                        </Typography>
                        <Typography 
                          variant='body2' 
                          sx={{ 
                            color: '#5f6368',
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            fontSize: '0.875rem'
                          }}
                        >
                          Quiz: {game.quiz?.title || 'Not specified'}
                        </Typography>
                      </Box>

                      {/* Clean Info Grid */}
                      <Stack spacing={2} sx={{ mb: 3 }}>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 2,
                              bgcolor: alpha(theme.palette.info.main, 0.1),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            <Schedule sx={{ fontSize: 20, color: theme.palette.info.main }} />
                          </Box>
                          <Typography variant='body2' fontWeight={600} sx={{ color: '#202124', fontSize: '0.875rem' }}>
                            {game.gameMode === 'live' ? 'Live Game' : 'Self-paced'}
                          </Typography>
                        </Stack>
                        
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 2,
                              bgcolor: alpha(theme.palette.secondary.main, 0.1),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            <People sx={{ fontSize: 20, color: theme.palette.secondary.main }} />
                          </Box>
                          <Typography variant='body2' fontWeight={600} sx={{ color: '#202124', fontSize: '0.875rem' }}>
                            Max {game.maxPlayers} players
                          </Typography>
                        </Stack>
                        
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 2,
                              bgcolor: alpha(theme.palette.warning.main, 0.1),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            <EmojiEvents sx={{ fontSize: 20, color: theme.palette.warning.main }} />
                          </Box>
                          <Typography variant='body2' fontWeight={600} sx={{ color: '#202124', fontSize: '0.875rem' }}>
                            {totalRewards} reward{totalRewards !== 1 ? 's' : ''}
                          </Typography>
                        </Stack>
                      </Stack>

                      <Divider sx={{ my: 2 }} />

                      {/* Status Info */}
                      <Box 
                        sx={{ 
                          mb: 3,
                          p: 2,
                          borderRadius: 2,
                          bgcolor: isFullySponsored 
                            ? alpha(theme.palette.success.main, 0.08)
                            : alpha(theme.palette.warning.main, 0.08),
                          border: '1px solid',
                          borderColor: isFullySponsored
                            ? alpha(theme.palette.success.main, 0.2)
                            : alpha(theme.palette.warning.main, 0.2)
                        }}
                      >
                        <Typography 
                          variant='body2' 
                          sx={{ 
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            color: isFullySponsored ? theme.palette.success.main : theme.palette.warning.main,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                          }}
                        >
                          {isFullySponsored ? (
                            <>
                              <CheckCircle sx={{ fontSize: 18 }} />
                              Fully Sponsored
                            </>
                          ) : (
                            '🎯 Needs Sponsorship'
                          )}
                        </Typography>
                      </Box>

                      {/* CTA Button */}
                      <Button
                        variant='contained'
                        component='label'
                        endIcon={<ArrowForward />}
                        fullWidth
                        sx={{ 
                          mt: 'auto',
                          py: 1.5,
                          fontWeight: 700,
                          textTransform: 'none',
                          fontSize: '0.95rem',
                          borderRadius: 2,
                          color: 'white',
                          bgcolor: isFullySponsored ? theme.palette.success.main : theme.palette.primary.main,
                          boxShadow: 'none',
                          '&:hover': {
                            bgcolor: isFullySponsored ? theme.palette.success.dark : theme.palette.primary.dark,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            transform: 'translateY(-2px)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {isFullySponsored ? 'View Details' : 'Sponsor Now'}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              )
            })}
          </Grid>
        )}
      </Container>
    </Box>
  )
}

export default SponsorGames