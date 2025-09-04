import React from 'react'
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Stack,
  Divider,
  Alert,
  Avatar
} from '@mui/material'
import ReactPlayer from 'react-player'
import {
  EmojiEvents,
  AttachMoney,
  CardGiftcard,
  Schedule,
  People,
  RequestQuote
} from '@mui/icons-material'
import { useRouter } from 'next/navigation'

export default function AwaitingSponsorshipGamePage({ game }) {
  const router = useRouter()

  const calculateRemainingNeed = (reward) => {
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

  const handleSponsorReward = (gameId, rewardId) => {
    router.push(`/sponsor/games/${gameId}/reward/${rewardId}`)
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Game Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction='row' justifyContent='space-between' alignItems='flex-start' sx={{ mb: 2 }}>
            <Box>
              <Typography variant='h4' gutterBottom>
                {game.title}
              </Typography>
              <Typography variant='body1' color='text.secondary' sx={{ mb: 2 }}>
                {game.description}
              </Typography>
              <Stack direction='row' spacing={1} sx={{ mb: 2 }}>
                <Chip 
                  label='Awaiting Sponsorship' 
                  color='warning' 
                  icon={<RequestQuote />}
                />
                <Chip 
                  label={game.gameMode === 'live' ? 'Live Game' : 'Self-paced Game'} 
                  color='info'
                  icon={<Schedule />}
                />
              </Stack>
            </Box>
            {game.thumbnailPoster && (
              <Avatar
                src={game.thumbnailPoster}
                sx={{ width: 80, height: 80 }}
                variant='rounded'
              />
            )}
          </Stack>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <People color='action' />
                <Typography variant='body2' color='text.secondary'>
                  Max {game.maxPlayers} players
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmojiEvents color='action' />
                <Typography variant='body2' color='text.secondary'>
                  {game.rewards?.length || 0} rewards
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Quiz Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant='h6' gutterBottom>
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
            Rewards Awaiting Sponsorship
          </Typography>
          
          {game.rewards?.length === 0 ? (
            <Alert severity='info'>
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
                            {reward.numberOfWinnersForThisPosition} winner{reward.numberOfWinnersForThisPosition > 1 ? 's' : ''}
                          </Typography>
                          
                          <Typography 
                            variant='body2' 
                            color={remaining > 0 ? 'error.main' : 'success.main'}
                            sx={{ fontWeight: 'medium', mb: 2 }}
                          >
                            {remaining > 0 
                              ? `Still needs: ${reward.rewardType === 'cash' ? `${reward.currency} ${remaining}` : `${remaining} items`}`
                              : 'Fully sponsored!'
                            }
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
                                <Box key={sponsor._id || sponsor.email} sx={{ p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                                  <Typography variant='body2' fontWeight='medium'>
                                    {sponsor.email}
                                  </Typography>
                                  <Typography variant='caption' color='text.secondary'>
                                    {reward.rewardType === 'cash'
                                      ? `Contributed: ${sponsor.currency || sponsor.rewardDetails?.currency || reward.currency} ${sponsor.allocated || sponsor.rewardDetails?.allocated || 0}`
                                      : `Provided: ${sponsor.allocated || sponsor.rewardDetails?.allocated || 0} items`}
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
  )
}
