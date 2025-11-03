import React from 'react'
import { Box, Grid, Typography, Card, CardContent, Button, Chip, Stack, Divider, Alert, Avatar } from '@mui/material'
import ReactPlayer from 'react-player'
import { EmojiEvents, AttachMoney, CardGiftcard, Schedule, People, RequestQuote } from '@mui/icons-material'
import { useRouter } from 'next/navigation'

export default function AwaitingSponsorshipGamePage({ game }) {
  const router = useRouter()

  const calculateRemainingNeed = reward => {
    const totalNeeded =
      reward.rewardType === 'cash'
        ? reward.rewardValuePerWinner * reward.numberOfWinnersForThisPosition
        : reward.numberOfWinnersForThisPosition

    const totalAllocated =
      reward.sponsors?.reduce((sum, sponsor) => {
        // Check both sponsor.allocated and sponsor.rewardDetails.allocated
        const allocated = sponsor.allocated || sponsor.rewardDetails?.allocated || 0
        return sum + allocated
      }, 0) || 0

    return Math.max(0, totalNeeded - totalAllocated)
  }

  const handleSponsorReward = (gameId, rewardId) => {
    router.push(`/sponsor/games/${gameId}/reward/${rewardId}`)
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
        {/* Game Header */}
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
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ xs: 'center', sm: 'flex-start' }}>
              {game.thumbnailPoster && (
                <Avatar
                  src={game.thumbnailPoster}
                  variant='rounded'
                  sx={{
                    width: { xs: 120, sm: 150 },
                    height: { xs: 120, sm: 150 },
                    borderRadius: '16px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                    border: '3px solid white'
                  }}
                />
              )}
              <Box sx={{ flexGrow: 1, width: '100%' }}>
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
                <Typography variant='body1' sx={{ color: 'text.secondary', mb: 3, fontSize: '1rem', lineHeight: 1.6 }}>
                  {game.description}
                </Typography>
                <Stack direction='row' spacing={2} flexWrap='wrap' useFlexGap>
                  <Chip
                    label='Awaiting Sponsorship'
                    icon={<RequestQuote sx={{ fontSize: 18 }} />}
                    sx={{
                      background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                      color: 'white',
                      fontWeight: 700,
                      borderRadius: '12px',
                      boxShadow: '0 2px 8px rgba(255, 152, 0, 0.3)',
                      '& .MuiChip-icon': {
                        color: 'white'
                      }
                    }}
                  />
                  <Chip
                    label={game.gameMode === 'live' ? 'Live Game' : 'Self-paced Game'}
                    icon={<Schedule sx={{ fontSize: 18 }} />}
                    sx={{
                      bgcolor: 'rgba(102, 126, 234, 0.08)',
                      color: '#667eea',
                      fontWeight: 600,
                      borderRadius: '12px',
                      '& .MuiChip-icon': {
                        color: '#667eea'
                      }
                    }}
                  />
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <Box
              sx={{
                p: 2.5,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)',
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              <People sx={{ color: '#667eea', fontSize: 32 }} />
              <Box>
                <Typography variant='h5' sx={{ fontWeight: 700, color: '#667eea' }}>
                  {game.maxPlayers}
                </Typography>
                <Typography variant='body2' sx={{ color: '#666', fontWeight: 600 }}>
                  Max Players
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box
              sx={{
                p: 2.5,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.08) 0%, rgba(251, 140, 0, 0.08) 100%)',
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              <EmojiEvents sx={{ color: '#ff9800', fontSize: 32 }} />
              <Box>
                <Typography variant='h5' sx={{ fontWeight: 700, color: '#ff9800' }}>
                  {game.rewards?.length || 0}
                </Typography>
                <Typography variant='body2' sx={{ color: '#666', fontWeight: 600 }}>
                  Reward Tiers
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Quiz Information */}
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
                mb: 2,
                fontWeight: 700,
                color: '#1a1a1a'
              }}
            >
              Quiz Information
            </Typography>
            <Typography variant='body1' gutterBottom>
              <strong>Title:</strong> {game.quiz?.title}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              <strong>Created by:</strong> {game.quiz?.createdBy}
            </Typography>
            {game.quiz?.details && (
              <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
                <strong>Description:</strong> {game.quiz.details}
              </Typography>
            )}
          </CardContent>
        </Card>

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
              <EmojiEvents sx={{ color: '#ff9800' }} />
              Rewards Awaiting Sponsorship
            </Typography>

            {game.rewards?.length === 0 ? (
              <Alert severity='info' sx={{ borderRadius: '12px' }}>
                No rewards have been defined for this game yet.
              </Alert>
            ) : (
              <Grid container spacing={3}>
                {game.rewards.map(reward => {
                  const remaining = calculateRemainingNeed(reward)

                  return (
                    <Grid item xs={12} md={6} key={reward._id || reward.position}>
                      <Card variant='outlined' sx={{ height: '100%' }}>
                        <CardContent>
                          <Typography variant='h6' gutterBottom>
                            Position {reward.position} Reward
                          </Typography>

                          <Box sx={{ mb: 2 }}>
                            {reward.rewardType === 'cash' ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <AttachMoney color='success' />
                                <Typography variant='body1' fontWeight='medium'>
                                  {reward.currency} {reward.rewardValuePerWinner} per winner
                                </Typography>
                              </Box>
                            ) : (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <CardGiftcard color='warning' />
                                <Typography variant='body1' fontWeight='medium'>
                                  {reward.nonCashReward}
                                </Typography>
                              </Box>
                            )}

                            <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                              {reward.numberOfWinnersForThisPosition} winner
                              {reward.numberOfWinnersForThisPosition > 1 ? 's' : ''}
                            </Typography>

                            <Typography
                              variant='body2'
                              color={remaining > 0 ? 'error.main' : 'success.main'}
                              sx={{ fontWeight: 'medium', mb: 2 }}
                            >
                              {remaining > 0
                                ? `Still needs: ${
                                    reward.rewardType === 'cash'
                                      ? `${reward.currency} ${remaining}`
                                      : `${remaining} items`
                                  }`
                                : 'Fully sponsored!'}
                            </Typography>
                          </Box>

                          {/* Current Sponsors */}
                          {reward.sponsors?.length > 0 && (
                            <Box sx={{ mb: 2 }}>
                              <Typography variant='subtitle2' gutterBottom>
                                Current Sponsors ({reward.sponsors.length})
                              </Typography>
                              <Stack spacing={1}>
                                {reward.sponsors.map(sponsor => (
                                  <Box
                                    key={sponsor._id || sponsor.email}
                                    sx={{ p: 1, bgcolor: 'grey.50', borderRadius: 1 }}
                                  >
                                    <Typography variant='body2' fontWeight='medium'>
                                      {sponsor.email}
                                    </Typography>
                                    <Typography variant='caption' color='text.secondary'>
                                      {reward.rewardType === 'cash'
                                        ? `Contributed: ${
                                            sponsor.currency || sponsor.rewardDetails?.currency || reward.currency
                                          } ${sponsor.allocated || sponsor.rewardDetails?.allocated || 0}`
                                        : `Provided: ${
                                            sponsor.allocated || sponsor.rewardDetails?.allocated || 0
                                          } items`}
                                    </Typography>
                                  </Box>
                                ))}
                              </Stack>
                            </Box>
                          )}

                          {/* Sponsor Button */}
                          {remaining > 0 && (
                            <Button
                              variant='contained'
                              component='label'
                              color='primary'
                              fullWidth
                              onClick={() => handleSponsorReward(game._id, reward._id || reward.position)}
                              sx={{ color: 'white' }}
                            >
                              Sponsor This Reward
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  )
                })}
              </Grid>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}
