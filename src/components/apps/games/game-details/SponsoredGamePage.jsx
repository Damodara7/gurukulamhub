'use client'

import React from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Stack,
  Alert,
  Avatar,
  Paper
} from '@mui/material'
import {
  EmojiEvents,
  AttachMoney,
  CardGiftcard,
  Schedule,
  People,
  ArrowBack,
  Person,
  Edit as EditIcon
} from '@mui/icons-material'
import ReactPlayer from 'react-player'
import { useRouter } from 'next/navigation'

const SponsoredGamePage = ({ game }) => {
  const router = useRouter()

  const calculateRemainingNeed = (reward) => {
    const totalNeeded = reward.rewardType === 'cash' 
      ? reward.rewardValuePerWinner * reward.numberOfWinnersForThisPosition
      : reward.numberOfWinnersForThisPosition
    
    const totalAllocated = reward.sponsors?.reduce((sum, sponsor) => {
      const allocated = sponsor.allocated || sponsor.rewardDetails?.allocated || 0
      return sum + allocated
    }, 0) || 0
    
    return Math.max(0, totalNeeded - totalAllocated)
  }

  const handleScheduleGame = () => {
    router.push(`/management/games/${game._id}/edit`)
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant='outlined'
          startIcon={<ArrowBack />}
          onClick={() => router.push('/management/games')}
          sx={{ mb: 2 }}
        >
          Back to Games
        </Button>
        
        <Typography variant='h4' gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          {game.title}
        </Typography>
        
        <Stack direction='row' spacing={2} alignItems='center' sx={{ mb: 2 }}>
          <Chip 
            label='Sponsored' 
            color='info' 
            size='small'
          />
          <Typography variant='body2' color='text.secondary'>
            Quiz: {game.quiz?.title}
          </Typography>
        </Stack>

        {/* Sponsorship Success Alert */}
        <Alert severity='success' sx={{ mb: 3 }}>
          <Typography variant='subtitle2' gutterBottom>
            🎉 All rewards have been fully sponsored!
          </Typography>
          <Typography variant='body2'>
            This game is ready to be scheduled. Click the "Schedule Game" button below to set the start time and other scheduling details.
          </Typography>
        </Alert>
      </Box>

      {/* Game Information */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Game Information
              </Typography>
              
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Schedule fontSize='small' color='action' />
                  <Typography variant='body2'>
                    <strong>Game Mode:</strong> {game.gameMode === 'live' ? 'Live Game' : 'Self-paced Game'}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <People fontSize='small' color='action' />
                  <Typography variant='body2'>
                    <strong>Max Players:</strong> {game.maxPlayers}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Person fontSize='small' color='action' />
                  <Typography variant='body2'>
                    <strong>Created by:</strong> {game.creatorEmail}
                  </Typography>
                </Box>
                
                {game.description && (
                  <Box>
                    <Typography variant='body2' sx={{ fontWeight: 'medium', mb: 1 }}>
                      Description:
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {game.description}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Sponsorship Summary
              </Typography>
              
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmojiEvents fontSize='small' color='action' />
                  <Typography variant='body2'>
                    <strong>Total Rewards:</strong> {game.rewards?.length || 0}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant='body2' sx={{ fontWeight: 'medium', mb: 1 }}>
                    Sponsorship Status:
                  </Typography>
                  {game.rewards?.map(reward => {
                    const remaining = calculateRemainingNeed(reward)
                    return (
                      <Box key={reward._id || reward.position} sx={{ mb: 1 }}>
                        <Typography 
                          variant='body2' 
                          color={remaining > 0 ? 'error.main' : 'success.main'}
                          sx={{ fontSize: '0.875rem' }}
                        >
                          Position {reward.position}: {remaining > 0 
                            ? `Still needs ${reward.rewardType === 'cash' ? `${reward.currency} ${remaining}` : `${remaining} items`}`
                            : 'Fully sponsored!'
                          }
                        </Typography>
                      </Box>
                    )
                  })}
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Promotional Video */}
      {game.promotionalVideoUrl && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              Promotional Video
            </Typography>
            <Box
              sx={{
                position: 'relative',
                pt: '40.25%', // 16:9 aspect ratio
                borderRadius: 2,
                overflow: 'hidden'
              }}
            >
              <ReactPlayer
                url={game.promotionalVideoUrl}
                width='100%'
                height='100%'
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0
                }}
                controls
              />
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Rewards Section */}
      <Card>
        <CardContent>
          <Typography variant='h6' gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmojiEvents />
            Sponsored Rewards ({game.rewards?.length || 0})
          </Typography>

          {game.rewards?.length === 0 ? (
            <Alert severity='info'>
              No rewards defined for this game.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {game.rewards.map(reward => {
                const remaining = calculateRemainingNeed(reward)
                const totalNeeded = reward.rewardType === 'cash' 
                  ? reward.rewardValuePerWinner * reward.numberOfWinnersForThisPosition
                  : reward.numberOfWinnersForThisPosition
                const totalAllocated = reward.sponsors?.reduce((sum, sponsor) => {
                  const allocated = sponsor.allocated || sponsor.rewardDetails?.allocated || 0
                  return sum + allocated
                }, 0) || 0
                
                return (
                  <Grid item xs={12} md={6} key={reward._id || reward.position}>
                    <Paper sx={{ p: 3, height: '100%' }}>
                      <Typography variant='h6' gutterBottom>
                        Position {reward.position} Reward
                      </Typography>
                      
                      <Stack spacing={2} sx={{ mb: 3 }}>
                        {reward.rewardType === 'cash' ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AttachMoney color='success' />
                            <Typography variant='body1'>
                              <strong>{reward.currency} {reward.rewardValuePerWinner}</strong> per winner
                            </Typography>
                          </Box>
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CardGiftcard color='warning' />
                            <Typography variant='body1'>
                              <strong>{reward.nonCashReward}</strong>
                            </Typography>
                          </Box>
                        )}
                        
                        <Typography variant='body2' color='text.secondary'>
                          <strong>Number of Winners:</strong> {reward.numberOfWinnersForThisPosition}
                        </Typography>
                        
                        <Typography variant='body2' color='text.secondary'>
                          <strong>Total Needed:</strong> {reward.rewardType === 'cash' 
                            ? `${reward.currency} ${totalNeeded}` 
                            : `${totalNeeded} items`}
                        </Typography>
                        
                        <Typography variant='body2' color='text.secondary'>
                          <strong>Currently Sponsored:</strong> {reward.rewardType === 'cash' 
                            ? `${reward.currency} ${totalAllocated}` 
                            : `${totalAllocated} items`}
                        </Typography>
                        
                        <Typography 
                          variant='body2' 
                          color={remaining > 0 ? 'error.main' : 'success.main'}
                          sx={{ fontWeight: 'medium' }}
                        >
                          <strong>Remaining Need:</strong> {remaining > 0 
                            ? `${reward.rewardType === 'cash' ? `${reward.currency} ${remaining}` : `${remaining} items`}`
                            : 'Fully sponsored!'
                          }
                        </Typography>

                        {/* Show existing sponsors */}
                        {reward.sponsors && reward.sponsors.length > 0 && (
                          <Box>
                            <Typography variant='body2' sx={{ fontWeight: 'medium', mb: 1 }}>
                              Sponsors:
                            </Typography>
                            {reward.sponsors.map((sponsor, index) => (
                              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                                  {sponsor.email?.charAt(0)?.toUpperCase() || 'S'}
                                </Avatar>
                                <Typography variant='body2' color='text.secondary'>
                                  {sponsor.email} - {reward.rewardType === 'cash' 
                                    ? `${sponsor.currency || sponsor.rewardDetails?.currency || reward.currency} ${sponsor.allocated || sponsor.rewardDetails?.allocated || 0}` 
                                    : `${sponsor.allocated || sponsor.rewardDetails?.allocated || 0} items`}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Stack>
                    </Paper>
                  </Grid>
                )
              })}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Schedule Game Button */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Button
          variant='contained'
          size='large'
          component='label'
          startIcon={<EditIcon />}
          onClick={handleScheduleGame}
          sx={{
            fontSize: '1.1rem',
            fontWeight: 600,
            color: 'white'
          }}
        >
          Schedule Game
        </Button>
        <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
          Set start time, duration, and other scheduling details
        </Typography>
      </Box>
    </Box>
  )
}

export default SponsoredGamePage
