'use client'

import React from 'react'
import { Box, Typography, Card, CardContent, Grid, Button, Chip, Stack, Alert, Avatar, Paper } from '@mui/material'
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

  const calculateRemainingNeed = reward => {
    const totalNeeded =
      reward.rewardType === 'cash'
        ? reward.rewardValuePerWinner * reward.numberOfWinnersForThisPosition
        : reward.numberOfWinnersForThisPosition

    const totalAllocated =
      reward.sponsors?.reduce((sum, sponsor) => {
        const allocated = sponsor.allocated || sponsor.rewardDetails?.allocated || 0
        return sum + allocated
      }, 0) || 0

    return Math.max(0, totalNeeded - totalAllocated)
  }

  const handleScheduleGame = () => {
    router.push(`/management/games/${game._id}/edit`)
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa' }}>
      {/* Gradient Header Banner */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          pt: 4,
          pb: 6,
          mb: -4,
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
      />

      <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, pb: 4, position: 'relative', mt: -2 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Button
            variant='contained'
            startIcon={<ArrowBack />}
            onClick={() => router.push('/management/games')}
            sx={{
              mb: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: '12px',
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)'
              }
            }}
          >
            Back to Games
          </Button>

          <Card
            sx={{
              mb: 3,
              borderRadius: '20px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
              overflow: 'hidden',
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography
                variant='h3'
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '1.75rem', sm: '2.25rem' },
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  mb: 2
                }}
              >
                {game.title}
              </Typography>

              <Stack direction='row' spacing={2} alignItems='center' sx={{ mb: 3 }} flexWrap='wrap' useFlexGap>
                <Chip
                  label='Sponsored'
                  sx={{
                    background: 'linear-gradient(135deg, #9575cd 0%, #7e57c2 100%)',
                    color: 'white',
                    fontWeight: 700,
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(149, 117, 205, 0.3)'
                  }}
                />
                <Typography variant='body1' sx={{ color: '#666', fontWeight: 600 }}>
                  Quiz: {game.quiz?.title}
                </Typography>
              </Stack>

              {/* Sponsorship Success Alert */}
              <Alert
                severity='success'
                sx={{
                  borderRadius: '12px',
                  border: '2px solid #4caf50',
                  background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.08) 0%, rgba(139, 195, 74, 0.08) 100%)'
                }}
              >
                <Typography variant='subtitle1' sx={{ fontWeight: 700, mb: 1 }}>
                  🎉 All rewards have been fully sponsored!
                </Typography>
                <Typography variant='body2'>
                  This game is ready to be scheduled. Click the "Schedule Game" button below to set the start time and
                  other scheduling details.
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Box>

        {/* Game Information */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={8}>
            <Card
              sx={{
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                background: 'rgba(255, 255, 255, 0.98)'
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant='h6'
                  sx={{
                    mb: 3,
                    fontWeight: 700,
                    color: '#1a1a1a'
                  }}
                >
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
            <Card
              sx={{
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                background: 'rgba(255, 255, 255, 0.98)'
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant='h6'
                  sx={{
                    mb: 3,
                    fontWeight: 700,
                    color: '#1a1a1a'
                  }}
                >
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
                            Position {reward.position}:{' '}
                            {remaining > 0
                              ? `Still needs ${
                                  reward.rewardType === 'cash'
                                    ? `${reward.currency} ${remaining}`
                                    : `${remaining} items`
                                }`
                              : 'Fully sponsored!'}
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
          <Card
            sx={{
              mb: 3,
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              background: 'rgba(255, 255, 255, 0.98)'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant='h6'
                sx={{
                  mb: 3,
                  fontWeight: 700,
                  color: '#1a1a1a'
                }}
              >
                Promotional Video
              </Typography>
              <Box
                sx={{
                  position: 'relative',
                  pt: '56.25%', // 16:9 aspect ratio
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
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
        <Card
          sx={{
            mb: 3,
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            background: 'rgba(255, 255, 255, 0.98)'
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant='h6'
              sx={{
                mb: 3,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: '#1a1a1a'
              }}
            >
              <EmojiEvents sx={{ color: '#9575cd' }} />
              Sponsored Rewards ({game.rewards?.length || 0})
            </Typography>

            {game.rewards?.length === 0 ? (
              <Alert severity='info'>No rewards defined for this game.</Alert>
            ) : (
              <Grid container spacing={3}>
                {game.rewards.map(reward => {
                  const remaining = calculateRemainingNeed(reward)
                  const totalNeeded =
                    reward.rewardType === 'cash'
                      ? reward.rewardValuePerWinner * reward.numberOfWinnersForThisPosition
                      : reward.numberOfWinnersForThisPosition
                  const totalAllocated =
                    reward.sponsors?.reduce((sum, sponsor) => {
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
                                <strong>
                                  {reward.currency} {reward.rewardValuePerWinner}
                                </strong>{' '}
                                per winner
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
                            <strong>Total Needed:</strong>{' '}
                            {reward.rewardType === 'cash'
                              ? `${reward.currency} ${totalNeeded}`
                              : `${totalNeeded} items`}
                          </Typography>

                          <Typography variant='body2' color='text.secondary'>
                            <strong>Currently Sponsored:</strong>{' '}
                            {reward.rewardType === 'cash'
                              ? `${reward.currency} ${totalAllocated}`
                              : `${totalAllocated} items`}
                          </Typography>

                          <Typography
                            variant='body2'
                            color={remaining > 0 ? 'error.main' : 'success.main'}
                            sx={{ fontWeight: 'medium' }}
                          >
                            <strong>Remaining Need:</strong>{' '}
                            {remaining > 0
                              ? `${
                                  reward.rewardType === 'cash'
                                    ? `${reward.currency} ${remaining}`
                                    : `${remaining} items`
                                }`
                              : 'Fully sponsored!'}
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
                                    {sponsor.email} -{' '}
                                    {reward.rewardType === 'cash'
                                      ? `${sponsor.currency || sponsor.rewardDetails?.currency || reward.currency} ${
                                          sponsor.allocated || sponsor.rewardDetails?.allocated || 0
                                        }`
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
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            variant='contained'
            size='large'
            startIcon={<EditIcon />}
            onClick={handleScheduleGame}
            sx={{
              px: 6,
              py: 1.8,
              fontSize: '1.1rem',
              fontWeight: 700,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #9575cd 0%, #7e57c2 100%) !important',
              color: 'white !important',
              boxShadow: '0 4px 14px rgba(149, 117, 205, 0.4)',
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(135deg, #8561c5 0%, #6d48b6 100%) !important',
                boxShadow: '0 6px 20px rgba(149, 117, 205, 0.6)',
                transform: 'translateY(-2px)'
              }
            }}
          >
            Schedule Game
          </Button>
          <Typography variant='body2' color='text.secondary' sx={{ mt: 2, fontWeight: 500 }}>
            Set start time, duration, and other scheduling details
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default SponsoredGamePage
