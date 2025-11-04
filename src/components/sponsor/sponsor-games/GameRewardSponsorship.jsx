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
  Container
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
      <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress size={48} />
      </Box>
    )
  }

  if (!game || !reward) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
        <Container maxWidth="sm">
          <Card sx={{ borderRadius: 4, bgcolor: 'white', border: '1px solid #e8eaed', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Alert severity='error' sx={{ mb: 3, borderRadius: 3 }}>
                Game or reward not found. Please check the URL and try again.
              </Alert>
              <Button
                variant='outlined'
                startIcon={<ArrowBack />}
                onClick={() => router.push('/sponsor/games')}
                fullWidth
                sx={{
                  textTransform: 'none',
                  fontWeight: 600
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
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa', pb: 8 }}>
      {/* Header Section */}
      <Box
        sx={{
          bgcolor: 'white',
          pt: { xs: 4, md: 5 },
          pb: { xs: 4, md: 5 },
          borderBottom: '1px solid #e8eaed'
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
                fontWeight: 600
              }}
            >
              Back to Games
            </Button>

            {/* Title */}
            <Typography
              variant="h3"
              fontWeight={800}
              sx={{
                fontSize: { xs: '1.75rem', md: '2.5rem' },
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
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
              <Typography variant="h5" fontWeight={700} sx={{ color: '#202124', mb: 0.5 }}>
                {game.title}
              </Typography>
              <Typography variant="body1" sx={{ color: '#5f6368' }}>
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
          mb: 4,
          borderRadius: 4,
          bgcolor: 'white',
          border: '1px solid #e8eaed',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Stack direction='row' alignItems='center' spacing={2} sx={{ mb: 3 }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: 2,
                bgcolor: reward.rewardType === 'cash' ? '#e6f7ed' : '#fff3e0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {reward.rewardType === 'cash' ? (
                <AttachMoney sx={{ fontSize: 30, color: '#2e7d32' }} />
              ) : (
                <CardGiftcard sx={{ fontSize: 30, color: '#f57c00' }} />
              )}
            </Box>
            <Box>
              <Typography variant='h5' fontWeight={700} sx={{ color: '#202124' }}>
                Position {reward.position} Reward
              </Typography>
              <Typography variant='body2' sx={{ color: '#5f6368' }}>
                {reward.numberOfWinnersForThisPosition} winner{reward.numberOfWinnersForThisPosition > 1 ? 's' : ''}
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ my: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant='subtitle2' sx={{ color: '#5f6368', mb: 1, fontWeight: 700, fontSize: '0.75rem' }}>
                  REWARD DETAILS
                </Typography>
                {reward.rewardType === 'cash' ? (
                  <Typography variant='h5' fontWeight={800} sx={{ color: theme.palette.success.main }}>
                    {reward.currency} {reward.rewardValuePerWinner}
                  </Typography>
                ) : (
                  <Typography variant='h6' fontWeight={700} sx={{ color: theme.palette.warning.main }}>
                    {reward.nonCashReward}
                  </Typography>
                )}
                <Typography variant='caption' sx={{ color: '#5f6368' }}>
                  per winner
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box 
                sx={{ 
                  textAlign: 'center', 
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.success.main, 0.08),
                  border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
                }}
              >
                <Typography variant='subtitle2' sx={{ color: '#5f6368', mb: 1, fontWeight: 700, fontSize: '0.75rem' }}>
                  ALREADY SPONSORED
                </Typography>
                <Typography 
                  variant='h5' 
                  fontWeight={800}
                  sx={{ color: theme.palette.success.main }}
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
                  p: 2,
                  borderRadius: 2,
                  bgcolor: remaining > 0 ? alpha(theme.palette.warning.main, 0.08) : alpha(theme.palette.success.main, 0.08),
                  border: remaining > 0 ? `1px solid ${alpha(theme.palette.warning.main, 0.2)}` : `1px solid ${alpha(theme.palette.success.main, 0.2)}`
                }}
              >
                <Typography variant='subtitle2' sx={{ color: '#5f6368', mb: 1, fontWeight: 700, fontSize: '0.75rem' }}>
                  REMAINING NEED
                </Typography>
                <Typography 
                  variant='h5' 
                  fontWeight={800}
                  sx={{ color: remaining > 0 ? theme.palette.warning.main : theme.palette.success.main }}
                >
                  {remaining > 0 
                    ? `${reward.rewardType === 'cash' ? `${reward.currency} ${remaining}` : `${remaining}`}`
                    : '✓ Done'
                  }
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
              borderRadius: 4,
              bgcolor: 'white',
              border: '1px solid #e8eaed',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Typography variant='h6' fontWeight={700} sx={{ color: '#202124', mb: 1 }}>
                Ready to Sponsor?
              </Typography>
              <Typography variant='body2' sx={{ color: '#5f6368', mb: 3, lineHeight: 1.7 }}>
                You can sponsor any amount up to the remaining need. Click the button below to provide your details and contribute to this reward.
              </Typography>
              
              <Button
                variant='contained'
                size='large'
                fullWidth
                component='label'
                onClick={handleSponsorClick}
                sx={{ 
                  color: 'white', 
                  py: 1.5,
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  borderRadius: 2
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
              borderRadius: 3,
              '& .MuiAlert-message': {
                fontSize: '1rem',
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
