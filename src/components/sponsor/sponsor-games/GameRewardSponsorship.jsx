'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Stack,
  Divider,
  useTheme,
  alpha,
  Container,
  useMediaQuery
} from '@mui/material'
import {
  EmojiEvents,
  AttachMoney,
  CardGiftcard,
  ArrowBack
} from '@mui/icons-material'
import { useRouter, useSearchParams } from 'next/navigation'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { toast } from 'react-toastify'
import GameSponsorDialog from './GameSponsorDialog'

const GameRewardSponsorship = ({ gameId, rewardId }) => {
  const router = useRouter()
  const theme = useTheme()
  const isDarkMode = theme.palette.mode === 'dark'
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [game, setGame] = useState(null)
  const [reward, setReward] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    if (gameId) {
      fetchGameDetails()
    }
  }, [gameId])

  const fetchGameDetails = async () => {
    setLoading(true)
    try {
      const result = await RestApi.get(`${API_URLS.v0.USERS_GAME}/${gameId}`)
      if (result?.status === 'success') {
        setGame(result.result)
        const foundReward = result.result.rewards?.find(r => 
          (r._id && r._id === rewardId) || r.position === parseInt(rewardId)
        )
        setReward(foundReward)
      } else {
        toast.error('Failed to load game details')
        router.push('/sponsor/games')
      }
    } catch (error) {
      console.error('Error fetching game:', error)
      toast.error('An error occurred while loading the game')
      router.push('/sponsor/games')
    } finally {
      setLoading(false)
    }
  }

  const calculateRemainingNeed = () => {
    if (!reward) return 0
    const totalNeeded = reward.rewardType === 'cash' 
      ? reward.rewardValuePerWinner * reward.numberOfWinnersForThisPosition
      : reward.numberOfWinnersForThisPosition
    
    const totalAllocated = reward.sponsors?.reduce((sum, sponsor) => {
      // Check both sponsor.allocated and sponsor.rewardDetails.allocated
      const allocated = sponsor.allocated || sponsor.rewardDetails?.allocated || 0
      return sum + allocated
    }, 0) || 0
    
    return Math.max(0, totalNeeded - totalAllocated)
  }

  const handleSponsorClick = () => {
    setDialogOpen(true)
  }

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: theme.palette.background.default,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <CircularProgress size={48} />
      </Box>
    )
  }

  if (!game || !reward) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: theme.palette.background.default,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, sm: 4 }
        }}
      >
        <Container maxWidth="sm">
          <Card
            sx={{
              borderRadius: { xs: 3, md: 4 },
              bgcolor: isDarkMode ? alpha(theme.palette.background.paper, 0.6) : 'white',
              border: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.3 : 0.1)}`,
              boxShadow: isDarkMode
                ? `0 2px 12px ${alpha(theme.palette.common.black, 0.3)}`
                : '0 2px 12px rgba(0,0,0,0.04)'
            }}
          >
            <CardContent sx={{ p: { xs: 3, sm: 4 }, textAlign: 'center' }}>
              <Alert
                severity='error'
                sx={{
                  mb: { xs: 2.5, sm: 3 },
                  borderRadius: { xs: 2, sm: 3 }
                }}
              >
                Game or reward not found. Please check the URL and try again.
              </Alert>
              <Button
                variant='outlined'
                startIcon={<ArrowBack />}
                onClick={() => router.push('/sponsor/games')}
                fullWidth
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  py: { xs: 1.25, sm: 1.5 },
                  borderRadius: { xs: 1.5, sm: 2 },
                  ...(isDarkMode && {
                    borderColor: alpha(theme.palette.divider, 0.3),
                    '&:hover': {
                      borderColor: alpha(theme.palette.primary.main, 0.5),
                      backgroundColor: alpha(theme.palette.primary.main, 0.08)
                    }
                  })
                }}
              >
                Back to Games
              </Button>
            </CardContent>
          </Card>
        </Container>
      </Box>
    )
  }

  const remaining = calculateRemainingNeed()

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default, pb: { xs: 6, md: 8 } }}>
      {/* Header Section */}
      <Box
        sx={{
          bgcolor: isDarkMode ? theme.palette.background.paper : 'white',
          pt: { xs: 3, sm: 4, md: 5 },
          pb: { xs: 3, sm: 4, md: 5 },
          borderBottom: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.15 : 0.1)}`
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={3}>
            {/* Back Button */}
            <Button
              variant='outlined'
              startIcon={<ArrowBack />}
              onClick={() => router.push('/sponsor/games')}
              sx={{
                width: 'fit-content',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: { xs: '0.9rem', sm: '1rem' },
                ...(isDarkMode && {
                  borderColor: alpha(theme.palette.divider, 0.3),
                  '&:hover': {
                    borderColor: alpha(theme.palette.primary.main, 0.5),
                    backgroundColor: alpha(theme.palette.primary.main, 0.08)
                  }
                })
              }}
            >
              Back to Games
            </Button>

            {/* Title */}
            <Typography
              variant="h3"
              fontWeight={800}
              sx={{
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.5rem' },
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary?.main || theme.palette.primary.light})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: 1.3
              }}
            >
              Sponsor Game Reward
            </Typography>

            {/* Game Info */}
            <Box>
              <Typography
                variant="h5"
                fontWeight={700}
                sx={{
                  color: 'text.primary',
                  mb: 0.5,
                  fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' }
                }}
              >
                {game.title}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                  fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' }
                }}
              >
                Quiz: {game.quiz?.title}
              </Typography>
            </Box>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 4 }}>

      {/* Reward Info */}
      <Card
        sx={{
          mb: { xs: 3, sm: 4 },
          borderRadius: { xs: 3, md: 4 },
          bgcolor: isDarkMode ? alpha(theme.palette.background.paper, 0.6) : 'white',
          border: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.3 : 0.1)}`,
          boxShadow: isDarkMode
            ? `0 2px 12px ${alpha(theme.palette.common.black, 0.3)}`
            : '0 2px 12px rgba(0,0,0,0.04)'
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 3, md: 4 } }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={{ xs: 1.5, sm: 2 }}
            sx={{ mb: { xs: 2.5, sm: 3 } }}
          >
            <Box
              sx={{
                width: { xs: 48, sm: 52 },
                height: { xs: 48, sm: 52 },
                borderRadius: { xs: 1.5, sm: 2 },
                bgcolor:
                  reward.rewardType === 'cash'
                    ? isDarkMode
                      ? alpha(theme.palette.success.main, 0.2)
                      : alpha(theme.palette.success.main, 0.1)
                    : isDarkMode
                      ? alpha(theme.palette.warning.main, 0.2)
                      : alpha(theme.palette.warning.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {reward.rewardType === 'cash' ? (
                <AttachMoney sx={{ fontSize: { xs: 26, sm: 30 }, color: theme.palette.success.main }} />
              ) : (
                <CardGiftcard sx={{ fontSize: { xs: 26, sm: 30 }, color: theme.palette.warning.main }} />
              )}
            </Box>
            <Box>
              <Typography
                variant='h5'
                fontWeight={700}
                sx={{
                  color: 'text.primary',
                  fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' }
                }}
              >
                Position {reward.position} Reward
              </Typography>
              <Typography
                variant='body2'
                sx={{
                  color: 'text.secondary',
                  fontSize: { xs: '0.88rem', sm: '0.9rem', md: '0.95rem' }
                }}
              >
                {reward.numberOfWinnersForThisPosition} winner{reward.numberOfWinnersForThisPosition > 1 ? 's' : ''}
              </Typography>
            </Box>
          </Stack>

          <Divider
            sx={{
              my: { xs: 2.5, sm: 3 },
              borderColor: alpha(theme.palette.divider, isDarkMode ? 0.3 : 0.5)
            }}
          />

          <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center', p: { xs: 1.5, sm: 2 } }}>
                <Typography
                  variant='subtitle2'
                  sx={{
                    color: 'text.secondary',
                    mb: 1,
                    fontWeight: 700,
                    fontSize: { xs: '0.7rem', sm: '0.75rem' }
                  }}
                >
                  REWARD DETAILS
                </Typography>
                {reward.rewardType === 'cash' ? (
                  <Typography
                    variant='h5'
                    fontWeight={800}
                    sx={{
                      color: theme.palette.success.main,
                      fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' }
                    }}
                  >
                    {reward.currency} {reward.rewardValuePerWinner}
                  </Typography>
                ) : (
                  <Typography
                    variant='h6'
                    fontWeight={700}
                    sx={{
                      color: theme.palette.warning.main,
                      fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' }
                    }}
                  >
                    {reward.nonCashReward}
                  </Typography>
                )}
                <Typography
                  variant='caption'
                  sx={{
                    color: 'text.secondary',
                    fontSize: { xs: '0.73rem', sm: '0.75rem' }
                  }}
                >
                  per winner
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box
                sx={{
                  textAlign: 'center',
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: { xs: 1.5, sm: 2 },
                  bgcolor: alpha(theme.palette.success.main, isDarkMode ? 0.15 : 0.08),
                  border: `1px solid ${alpha(theme.palette.success.main, isDarkMode ? 0.3 : 0.2)}`
                }}
              >
                <Typography
                  variant='subtitle2'
                  sx={{
                    color: 'text.secondary',
                    mb: 1,
                    fontWeight: 700,
                    fontSize: { xs: '0.7rem', sm: '0.75rem' }
                  }}
                >
                  ALREADY SPONSORED
                </Typography>
                <Typography
                  variant='h5'
                  fontWeight={800}
                  sx={{
                    color: theme.palette.success.main,
                    fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' }
                  }}
                >
                  {(() => {
                    const totalAllocated = reward.sponsors?.reduce((sum, sponsor) => {
                      const allocated = sponsor.allocated || sponsor.rewardDetails?.allocated || 0
                      return sum + allocated
                    }, 0) || 0

                    return `${reward.rewardType === 'cash' ? `${reward.currency} ${totalAllocated}` : `${totalAllocated}`}`
                  })()}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box
                sx={{
                  textAlign: 'center',
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: { xs: 1.5, sm: 2 },
                  bgcolor:
                    remaining > 0
                      ? alpha(theme.palette.warning.main, isDarkMode ? 0.15 : 0.08)
                      : alpha(theme.palette.success.main, isDarkMode ? 0.15 : 0.08),
                  border:
                    remaining > 0
                      ? `1px solid ${alpha(theme.palette.warning.main, isDarkMode ? 0.3 : 0.2)}`
                      : `1px solid ${alpha(theme.palette.success.main, isDarkMode ? 0.3 : 0.2)}`
                }}
              >
                <Typography
                  variant='subtitle2'
                  sx={{
                    color: 'text.secondary',
                    mb: 1,
                    fontWeight: 700,
                    fontSize: { xs: '0.7rem', sm: '0.75rem' }
                  }}
                >
                  REMAINING NEED
                </Typography>
                <Typography
                  variant='h5'
                  fontWeight={800}
                  sx={{
                    color: remaining > 0 ? theme.palette.warning.main : theme.palette.success.main,
                    fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' }
                  }}
                >
                  {remaining > 0
                    ? `${reward.rewardType === 'cash' ? `${reward.currency} ${remaining}` : `${remaining}`}`
                    : '✓ Done'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

        {/* Sponsorship Button */}
        {remaining > 0 ? (
          <Card
            sx={{
              borderRadius: { xs: 3, md: 4 },
              bgcolor: isDarkMode ? alpha(theme.palette.background.paper, 0.6) : 'white',
              border: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.3 : 0.1)}`,
              boxShadow: isDarkMode
                ? `0 2px 12px ${alpha(theme.palette.common.black, 0.3)}`
                : '0 2px 12px rgba(0,0,0,0.04)'
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, sm: 3, md: 4 } }}>
              <Typography
                variant='h6'
                fontWeight={700}
                sx={{
                  color: 'text.primary',
                  mb: 1,
                  fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }
                }}
              >
                Ready to Sponsor?
              </Typography>
              <Typography
                variant='body2'
                sx={{
                  color: 'text.secondary',
                  mb: { xs: 2.5, sm: 3 },
                  lineHeight: 1.7,
                  fontSize: { xs: '0.88rem', sm: '0.9rem', md: '0.95rem' }
                }}
              >
                You can sponsor any amount up to the remaining need. Click the button below to provide your details
                and contribute to this reward.
              </Typography>

              <Button
                variant='contained'
                size='large'
                fullWidth
                component='label'
                onClick={handleSponsorClick}
                sx={{
                  color: 'white',
                  py: { xs: 1.25, sm: 1.5 },
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: { xs: '0.9rem', sm: '0.92rem', md: '0.95rem' },
                  borderRadius: { xs: 1.5, sm: 2 },
                  boxShadow: isDarkMode ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}` : undefined,
                  '&:hover': {
                    boxShadow: isDarkMode
                      ? `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`
                      : undefined
                  }
                }}
              >
                Sponsor This Reward
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Alert
            severity='success'
            sx={{
              borderRadius: { xs: 2, sm: 3 },
              '& .MuiAlert-message': {
                fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' },
                fontWeight: 600
              }
            }}
          >
            This reward is fully sponsored! Thank you for your interest.
          </Alert>
        )}
      </Container>

      {/* Game Sponsor Dialog */}
      <GameSponsorDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        game={game}
        reward={reward}
        maxAmount={remaining}
      />
    </Box>
  )
}

export default GameRewardSponsorship
