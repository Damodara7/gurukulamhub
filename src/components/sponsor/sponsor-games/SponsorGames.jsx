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
  CardMedia,
  useMediaQuery
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
  const isDarkMode = theme.palette.mode === 'dark'
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'))
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
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: theme.palette.background.default,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <CircularProgress size={48} />
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default, pb: { xs: 6, md: 8 } }}>
      {/* Clean Professional Header */}
      <Box
        sx={{
          bgcolor: isDarkMode ? theme.palette.background.paper : 'white',
          pt: { xs: 3, sm: 4, md: 5 },
          pb: { xs: 3, sm: 4, md: 5 },
          borderBottom: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.15 : 0.1)}`
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={2.5}>
            {/* Title Section */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 2, sm: 2 }}
              alignItems={{ xs: 'flex-start', sm: 'center' }}
            >
              <Box
                sx={{
                  width: { xs: 48, sm: 56 },
                  height: { xs: 48, sm: 56 },
                  borderRadius: { xs: 2, sm: 3 },
                  bgcolor: alpha(theme.palette.primary.main, isDarkMode ? 0.2 : 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <VolunteerActivism sx={{ fontSize: { xs: 28, sm: 32 }, color: theme.palette.primary.main }} />
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h3"
                  fontWeight={800}
                  sx={{
                    fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.25rem' },
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary?.main || theme.palette.primary.light})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    lineHeight: 1.2,
                    mb: 0.5
                  }}
                >
                  Games Awaiting Sponsorship
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: 'text.secondary',
                    fontSize: { xs: '0.9rem', sm: '1rem' }
                  }}
                >
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
                    px: { md: 2.5, lg: 3 },
                    py: 1.5,
                    borderRadius: { md: 2.5, lg: 3 },
                    bgcolor: alpha(theme.palette.primary.main, isDarkMode ? 0.15 : 0.08),
                    border: `1px solid ${alpha(theme.palette.primary.main, isDarkMode ? 0.3 : 0.2)}`
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
                  <Typography
                    variant="body1"
                    fontWeight={700}
                    sx={{
                      color: theme.palette.primary.main,
                      fontSize: { md: '0.95rem', lg: '1rem' }
                    }}
                  >
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
              borderRadius: { xs: 3, md: 4 },
              bgcolor: isDarkMode ? alpha(theme.palette.background.paper, 0.6) : 'white',
              border: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.3 : 0.1)}`,
              boxShadow: isDarkMode
                ? `0 2px 12px ${alpha(theme.palette.common.black, 0.3)}`
                : '0 2px 12px rgba(0,0,0,0.04)',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: { xs: 8, sm: 9, md: 10 },
                px: { xs: 3, sm: 4 },
                textAlign: 'center'
              }}
            >
              <Box
                sx={{
                  width: { xs: 80, sm: 90, md: 100 },
                  height: { xs: 80, sm: 90, md: 100 },
                  borderRadius: '50%',
                  bgcolor: alpha(theme.palette.success.main, isDarkMode ? 0.2 : 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: { xs: 2.5, sm: 3 },
                  border: isDarkMode ? `1px solid ${alpha(theme.palette.success.main, 0.3)}` : 'none'
                }}
              >
                <CheckCircle sx={{ fontSize: { xs: 44, sm: 50, md: 56 }, color: theme.palette.success.main }} />
              </Box>
              <Typography
                variant="h5"
                fontWeight={700}
                gutterBottom
                sx={{
                  color: 'text.primary',
                  mb: { xs: 1, sm: 1.5 },
                  fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' }
                }}
              >
                All Games Fully Sponsored! 🎉
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                  maxWidth: { xs: '100%', sm: 500, md: 600 },
                  fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' },
                  lineHeight: 1.7
                }}
              >
                Wonderful news! There are currently no games awaiting sponsorship. Check back later for new
                opportunities to support educational initiatives.
              </Typography>
            </Box>
          </Card>
        ) : (
          <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
            {games.map(game => {
              const totalRewards = game.rewards?.length || 0
              const totalRemaining = game.rewards?.reduce((sum, reward) => sum + calculateRemainingNeed(reward), 0) || 0
              const isFullySponsored = totalRemaining === 0

              return (
                <Grid item xs={12} sm={6} md={6} lg={4} key={game._id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      bgcolor: isDarkMode ? alpha(theme.palette.background.paper, 0.6) : 'white',
                      border: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.3 : 0.1)}`,
                      borderRadius: { xs: 3, md: 4 },
                      boxShadow: isDarkMode
                        ? `0 2px 12px ${alpha(theme.palette.common.black, 0.3)}`
                        : '0 2px 12px rgba(0,0,0,0.04)',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: { xs: 'translateY(-4px)', md: 'translateY(-6px)' },
                        boxShadow: isDarkMode
                          ? `0 12px 28px ${alpha(theme.palette.common.black, 0.5)}`
                          : '0 12px 28px rgba(0,0,0,0.12)',
                        borderColor: isFullySponsored ? theme.palette.success.main : theme.palette.primary.main
                      }
                    }}
                    onClick={() => handleViewGameDetails(game._id)}
                  >
                    {/* Clean Image Section */}
                    <Box
                      sx={{
                        height: { xs: 160, sm: 170, md: 180 },
                        background: isFullySponsored
                          ? `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.8)}, ${alpha(
                              theme.palette.success.light,
                              0.9
                            )})`
                          : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.8)}, ${alpha(
                              theme.palette.secondary?.main || theme.palette.primary.light,
                              0.9
                            )})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative'
                      }}
                    >
                      <EmojiEvents sx={{ fontSize: { xs: 52, sm: 58, md: 64 }, color: 'white', opacity: 0.9 }} />

                      {/* Status Badge */}
                      <Chip
                        label={isFullySponsored ? 'Fully Sponsored' : 'Seeking Support'}
                        icon={isFullySponsored ? <CheckCircle sx={{ fontSize: { xs: 12, sm: 14 } }} /> : undefined}
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: { xs: 12, sm: 14, md: 16 },
                          right: { xs: 12, sm: 14, md: 16 },
                          bgcolor: isDarkMode ? alpha(theme.palette.common.white, 0.95) : 'white',
                          color: isFullySponsored ? theme.palette.success.main : theme.palette.warning.main,
                          fontWeight: 700,
                          fontSize: { xs: '0.65rem', sm: '0.7rem' },
                          boxShadow: isDarkMode
                            ? `0 2px 8px ${alpha(theme.palette.common.black, 0.3)}`
                            : '0 2px 8px rgba(0,0,0,0.15)',
                          '& .MuiChip-icon': {
                            color: isFullySponsored ? theme.palette.success.main : theme.palette.warning.main
                          }
                        }}
                      />
                    </Box>

                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: { xs: 2.5, sm: 3 } }}>
                      {/* Title & Quiz */}
                      <Box sx={{ mb: { xs: 2.5, sm: 3 } }}>
                        <Typography
                          variant='h6'
                          fontWeight={700}
                          gutterBottom
                          sx={{
                            color: 'text.primary',
                            fontSize: { xs: '1.05rem', sm: '1.1rem', md: '1.15rem' },
                            lineHeight: 1.3,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            minHeight: { xs: 44, sm: 48, md: 50 }
                          }}
                        >
                          {game.title}
                        </Typography>
                        <Typography
                          variant='body2'
                          sx={{
                            color: 'text.secondary',
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            fontSize: { xs: '0.83rem', sm: '0.85rem', md: '0.875rem' }
                          }}
                        >
                          Quiz: {game.quiz?.title || 'Not specified'}
                        </Typography>
                      </Box>

                      {/* Clean Info Grid */}
                      <Stack spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: { xs: 2.5, sm: 3 } }}>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Box
                            sx={{
                              width: { xs: 36, sm: 40 },
                              height: { xs: 36, sm: 40 },
                              borderRadius: { xs: 1.5, sm: 2 },
                              bgcolor: alpha(theme.palette.info.main, isDarkMode ? 0.2 : 0.1),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            <Schedule sx={{ fontSize: { xs: 18, sm: 20 }, color: theme.palette.info.main }} />
                          </Box>
                          <Typography
                            variant='body2'
                            fontWeight={600}
                            sx={{
                              color: 'text.primary',
                              fontSize: { xs: '0.83rem', sm: '0.85rem', md: '0.875rem' }
                            }}
                          >
                            {game.gameMode === 'live' ? 'Live Game' : 'Self-paced'}
                          </Typography>
                        </Stack>

                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Box
                            sx={{
                              width: { xs: 36, sm: 40 },
                              height: { xs: 36, sm: 40 },
                              borderRadius: { xs: 1.5, sm: 2 },
                              bgcolor: alpha(theme.palette.secondary?.main || theme.palette.primary.main, isDarkMode ? 0.2 : 0.1),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            <People sx={{ fontSize: { xs: 18, sm: 20 }, color: theme.palette.secondary?.main || theme.palette.primary.main }} />
                          </Box>
                          <Typography
                            variant='body2'
                            fontWeight={600}
                            sx={{
                              color: 'text.primary',
                              fontSize: { xs: '0.83rem', sm: '0.85rem', md: '0.875rem' }
                            }}
                          >
                            Max {game.maxPlayers} players
                          </Typography>
                        </Stack>

                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Box
                            sx={{
                              width: { xs: 36, sm: 40 },
                              height: { xs: 36, sm: 40 },
                              borderRadius: { xs: 1.5, sm: 2 },
                              bgcolor: alpha(theme.palette.warning.main, isDarkMode ? 0.2 : 0.1),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            <EmojiEvents sx={{ fontSize: { xs: 18, sm: 20 }, color: theme.palette.warning.main }} />
                          </Box>
                          <Typography
                            variant='body2'
                            fontWeight={600}
                            sx={{
                              color: 'text.primary',
                              fontSize: { xs: '0.83rem', sm: '0.85rem', md: '0.875rem' }
                            }}
                          >
                            {totalRewards} reward{totalRewards !== 1 ? 's' : ''}
                          </Typography>
                        </Stack>
                      </Stack>

                      <Divider sx={{ my: 2 }} />

                      {/* Status Info */}
                      <Box
                        sx={{
                          mb: { xs: 2.5, sm: 3 },
                          p: { xs: 1.5, sm: 2 },
                          borderRadius: { xs: 1.5, sm: 2 },
                          bgcolor: isFullySponsored
                            ? alpha(theme.palette.success.main, isDarkMode ? 0.15 : 0.08)
                            : alpha(theme.palette.warning.main, isDarkMode ? 0.15 : 0.08),
                          border: '1px solid',
                          borderColor: isFullySponsored
                            ? alpha(theme.palette.success.main, isDarkMode ? 0.3 : 0.2)
                            : alpha(theme.palette.warning.main, isDarkMode ? 0.3 : 0.2)
                        }}
                      >
                        <Typography
                          variant='body2'
                          sx={{
                            fontWeight: 700,
                            fontSize: { xs: '0.8rem', sm: '0.82rem', md: '0.85rem' },
                            color: isFullySponsored ? theme.palette.success.main : theme.palette.warning.main,
                            display: 'flex',
                            alignItems: 'center',
                            gap: { xs: 0.75, sm: 1 }
                          }}
                        >
                          {isFullySponsored ? (
                            <>
                              <CheckCircle sx={{ fontSize: { xs: 16, sm: 18 } }} />
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
                          py: { xs: 1.25, sm: 1.5 },
                          fontWeight: 700,
                          textTransform: 'none',
                          fontSize: { xs: '0.9rem', sm: '0.92rem', md: '0.95rem' },
                          borderRadius: { xs: 1.5, sm: 2 },
                          color: 'white',
                          bgcolor: isFullySponsored ? theme.palette.success.main : theme.palette.primary.main,
                          boxShadow: 'none',
                          '&:hover': {
                            bgcolor: isFullySponsored ? theme.palette.success.dark : theme.palette.primary.dark,
                            boxShadow: isDarkMode
                              ? `0 4px 12px ${alpha(isFullySponsored ? theme.palette.success.main : theme.palette.primary.main, 0.4)}`
                              : '0 4px 12px rgba(0,0,0,0.15)',
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