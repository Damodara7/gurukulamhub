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
  Divider
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!game || !reward) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity='error'>
          Game or reward not found. Please check the URL and try again.
        </Alert>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => router.push('/sponsor/games')}
          sx={{ mt: 2 }}
        >
          Back to Games
        </Button>
      </Box>
    )
  }

  const remaining = calculateRemainingNeed()

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => router.push('/sponsor/games')}
          sx={{ mb: 2 }}
        >
          Back to Games
        </Button>
        <Typography variant='h4' gutterBottom>
          Sponsor Game Reward
        </Typography>
      </Box>

      {/* Game Info */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant='h6' gutterBottom>
            {game.title}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Quiz: {game.quiz?.title}
          </Typography>
        </CardContent>
      </Card>

      {/* Reward Info */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction='row' alignItems='center' spacing={2} sx={{ mb: 2 }}>
            {reward.rewardType === 'cash' ? (
              <AttachMoney color='success' sx={{ fontSize: 32 }} />
            ) : (
              <CardGiftcard color='warning' sx={{ fontSize: 32 }} />
            )}
            <Box>
              <Typography variant='h6'>
                Position {reward.position} Reward
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {reward.numberOfWinnersForThisPosition} winner{reward.numberOfWinnersForThisPosition > 1 ? 's' : ''}
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Typography variant='subtitle2' gutterBottom>
                Reward Details
              </Typography>
              {reward.rewardType === 'cash' ? (
                <Typography variant='body1'>
                  {reward.currency} {reward.rewardValuePerWinner} per winner
                </Typography>
              ) : (
                <Typography variant='body1'>
                  {reward.nonCashReward}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant='subtitle2' gutterBottom>
                Already Sponsored
              </Typography>
              <Typography 
                variant='body1' 
                color='success.main'
                fontWeight='medium'
              >
                {(() => {
                  const totalAllocated = reward.sponsors?.reduce((sum, sponsor) => {
                    const allocated = sponsor.allocated || sponsor.rewardDetails?.allocated || 0
                    return sum + allocated
                  }, 0) || 0
                  
                  return `${reward.rewardType === 'cash' ? `${reward.currency} ${totalAllocated}` : `${totalAllocated} items`}`
                })()}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant='subtitle2' gutterBottom>
                Remaining Need
              </Typography>
              <Typography 
                variant='body1' 
                color={remaining > 0 ? 'error.main' : 'success.main'}
                fontWeight='medium'
              >
                {remaining > 0 
                  ? `${reward.rewardType === 'cash' ? `${reward.currency} ${remaining}` : `${remaining} items`}`
                  : 'Fully sponsored!'
                }
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Sponsorship Button */}
      {remaining > 0 ? (
        <Card>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              Ready to Sponsor?
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
              You can sponsor any amount up to the remaining need. Click the button below to provide your details and contribute to this reward.
            </Typography>
            
            <Button
              variant='contained'
              size='large'
              fullWidth
              component='label'
              onClick={handleSponsorClick}
              sx={{ color: 'white', py: 1.5 }}
            >
              Sponsor This Reward
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Alert severity='success'>
          This reward is fully sponsored! Thank you for your interest.
        </Alert>
      )}

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
