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
  CircularProgress
} from '@mui/material'
import {
  EmojiEvents,
  AttachMoney,
  CardGiftcard,
  Schedule,
  People,
  ArrowForward
} from '@mui/icons-material'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'

const SponsorGames = () => {
  const router = useRouter()
  const { data: session } = useSession()
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant='h4' gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 3 }}>
        Games Awaiting Sponsorship
      </Typography>

      <Typography variant='body1' paragraph sx={{ mb: 4, color: 'text.secondary' }}>
        Support these games by sponsoring their rewards. Your contribution helps make these educational initiatives possible.
      </Typography>

      {games.length === 0 ? (
        <Alert severity='info' sx={{ mt: 3 }}>
          No games are currently awaiting sponsorship. Check back later for new opportunities!
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {games.map(game => {
            const totalRewards = game.rewards?.length || 0
            const totalRemaining = game.rewards?.reduce((sum, reward) => sum + calculateRemainingNeed(reward), 0) || 0
            
            return (
              <Grid item xs={12} md={6} lg={4} key={game._id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 3
                    }
                  }}
                  onClick={() => handleViewGameDetails(game._id)}
                >
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Game Header */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant='h6' gutterBottom noWrap>
                        {game.title}
                      </Typography>
                      <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                        Quiz: {game.quiz?.title}
                      </Typography>
                      <Chip 
                        label='Awaiting Sponsorship' 
                        color='warning' 
                        size='small'
                        sx={{ mb: 2 }}
                      />
                    </Box>

                    {/* Game Details */}
                    <Stack spacing={1} sx={{ mb: 3, flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Schedule fontSize='small' color='action' />
                        <Typography variant='body2' color='text.secondary'>
                          {game.gameMode === 'live' ? 'Live Game' : 'Self-paced Game'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <People fontSize='small' color='action' />
                        <Typography variant='body2' color='text.secondary'>
                          Max {game.maxPlayers} players
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EmojiEvents fontSize='small' color='action' />
                        <Typography variant='body2' color='text.secondary'>
                          {totalRewards} reward{totalRewards !== 1 ? 's' : ''}
                        </Typography>
                      </Box>
                    </Stack>

                    {/* Sponsorship Status */}
                    <Box sx={{ mb: 2 }}>
                      <Typography 
                        variant='body2' 
                        color={totalRemaining > 0 ? 'error.main' : 'success.main'}
                        sx={{ fontWeight: 'medium' }}
                      >
                        {totalRemaining > 0 
                          ? `Still needs sponsorship`
                          : 'Fully sponsored!'
                        }
                      </Typography>
                    </Box>

                    {/* View Details Button */}
                    <Button
                      variant='contained'
                      endIcon={<ArrowForward />}
                      fullWidth
                      component='label'
                      sx={{ mt: 'auto', color: 'white' }}
                    >
                      View Details & Sponsor
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      )}
    </Box>
  )
}

export default SponsorGames