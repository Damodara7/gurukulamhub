'use client'

import React, { useState, useEffect } from 'react'
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
  CircularProgress,
  Avatar,
  Paper,
  Container,
  Divider,
  alpha,
  useTheme
} from '@mui/material'
import {
  EmojiEvents,
  AttachMoney,
  CardGiftcard,
  Schedule,
  People,
  ArrowBack,
  Person,
  CheckCircle
} from '@mui/icons-material'
import ReactPlayer from 'react-player'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'

const SponsorGameDetails = ({ gameId }) => {
  const router = useRouter()
  const theme = useTheme()
  const [game, setGame] = useState(null)
  const [loading, setLoading] = useState(true)

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
      } else {
        console.error('Error fetching game:', result)
        toast.error('Failed to load game details')
        setGame(null)
      }
    } catch (error) {
      console.error('Error fetching game:', error)
      toast.error('An error occurred while loading game details')
      setGame(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSponsorReward = (reward) => {
    // Navigate to the individual reward page
    const rewardId = reward._id || reward.position
    router.push(`/sponsor/games/${gameId}/reward/${rewardId}`)
  }

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


  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={48} />
      </Box>
    )
  }

  if (!game) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
        <Container maxWidth="sm">
          <Card sx={{ borderRadius: 4, bgcolor: 'white', border: '1px solid #e8eaed', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Alert severity='error' sx={{ mb: 3 }}>
          Game not found or failed to load.
        </Alert>
        <Button
          variant='contained'
          component='label'
          startIcon={<ArrowBack />}
          onClick={() => router.push('/sponsor/games')}
          fullWidth
          sx={{
            color: 'white'
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
          {game.title}
        </Typography>
        
            {/* Status */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Chip 
            label='Awaiting Sponsorship' 
            size='small'
                sx={{
                  bgcolor: alpha(theme.palette.warning.main, 0.1),
                  color: theme.palette.warning.main,
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  border: `2px solid ${alpha(theme.palette.warning.main, 0.3)}`
                }}
              />
        </Stack>

            {/* Description */}
            {game?.description && (
              <Typography
                variant="body1"
                sx={{
                  fontSize: '1.05rem',
                  color: '#5f6368',
                  lineHeight: 1.7,
                  maxWidth: '900px'
                }}
              >
                {game.description}
              </Typography>
            )}

            {/* Quick Info Bar */}
            <Stack direction="row" spacing={4} flexWrap="wrap" sx={{ pt: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1.5,
                    bgcolor: '#e8f4fd',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Schedule sx={{ fontSize: 18, color: '#1976d2' }} />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#5f6368', fontSize: '0.7rem' }}>
                    MODE
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ color: '#202124', fontSize: '0.875rem' }}>
                    {game.gameMode === 'live' ? 'Live Game' : 'Self-paced'}
                  </Typography>
                </Box>
              </Stack>
              
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1.5,
                    bgcolor: '#f3e5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <People sx={{ fontSize: 18, color: '#7b1fa2' }} />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#5f6368', fontSize: '0.7rem' }}>
                    PLAYERS
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ color: '#202124', fontSize: '0.875rem' }}>
                    Max {game.maxPlayers}
                  </Typography>
                </Box>
              </Stack>
              
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1.5,
                    bgcolor: '#fff3e0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <EmojiEvents sx={{ fontSize: 18, color: '#f57c00' }} />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#5f6368', fontSize: '0.7rem' }}>
                    REWARDS
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ color: '#202124', fontSize: '0.875rem' }}>
                    {game.rewards?.length || 0} Available
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1.5,
                    bgcolor: '#e8f5e9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Person sx={{ fontSize: 18, color: '#2e7d32' }} />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#5f6368', fontSize: '0.7rem' }}>
                    ORGANIZER
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ color: '#202124', fontSize: '0.875rem' }}>
                    {game.creatorEmail?.split('@')[0] || 'N/A'}
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Grid container spacing={4}>
          {/* Left Column */}
          <Grid item xs={12} md={8}>
            <Stack spacing={4}>
              {/* Quiz Details Card */}
              {game.quiz && (
                <Card
                  sx={{
                    borderRadius: 4,
                    bgcolor: 'white',
                    border: '1px solid #e8eaed',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
                  }}
                >
                  <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                    <Stack spacing={3}>
                      {/* Quiz Header */}
                      <Box>
                        <Typography variant="overline" sx={{ color: theme.palette.primary.main, fontWeight: 700, letterSpacing: 1.5, fontSize: '0.7rem' }}>
                          QUIZ INFORMATION
                        </Typography>
                        <Typography variant="h5" fontWeight={700} sx={{ color: '#202124', mt: 0.5 }}>
                          {game.quiz.title || 'Quiz Title'}
                        </Typography>
                      </Box>

                      <Divider sx={{ opacity: 0.3 }} />

                      {/* Quiz Details */}
                      {game.quiz.details && (
                  <Box>
                          <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ color: '#202124' }}>
                            Description
                    </Typography>
                          <Typography sx={{ color: '#5f6368', lineHeight: 1.7, fontSize: '0.95rem' }}>
                            {game.quiz.details}
                    </Typography>
                  </Box>
                )}

                      {/* Language & Syllabus */}
                      <Stack direction="row" spacing={2} flexWrap="wrap">
                        {game.quiz.language && (
                          <Chip
                            label={`Language: ${game.quiz.language.name || game.quiz.language}`}
                            sx={{
                              bgcolor: '#e8f4fd',
                              color: '#0c5a9e',
                              fontWeight: 600,
                              border: 'none'
                            }}
                          />
                        )}
                        {game.quiz.syllabus && (
                          <Chip
                            label={`Syllabus: ${game.quiz.syllabus}`}
                            sx={{
                              bgcolor: '#f3e5f5',
                              color: '#7b1fa2',
                              fontWeight: 600,
                              border: 'none'
                            }}
                          />
                        )}
                      </Stack>
              </Stack>
            </CardContent>
          </Card>
              )}

              {/* Promotional Video */}
              {game.promotionalVideoUrl && (
                <Card
                  sx={{
                    borderRadius: 4,
                    overflow: 'hidden',
                    bgcolor: 'white',
                    border: '1px solid #e8eaed',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
                  }}
                >
                  <Box sx={{ position: 'relative', pt: '56.25%', bgcolor: '#000' }}>
                    <ReactPlayer
                      url={game.promotionalVideoUrl}
                      width='100%'
                      height='100%'
                      style={{ position: 'absolute', top: 0, left: 0 }}
                      controls
                      playing={false}
                    />
                  </Box>
                </Card>
              )}
            </Stack>
        </Grid>
        
          {/* Right Sidebar */}
        <Grid item xs={12} md={4}>
            <Stack spacing={3} sx={{ position: { md: 'sticky' }, top: 20 }}>
              {/* Sponsorship Summary Card */}
              <Card
                sx={{
                  borderRadius: 4,
                  bgcolor: 'white',
                  border: '1px solid #e8eaed',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#202124', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmojiEvents sx={{ fontSize: 22, color: theme.palette.warning.main }} />
                    Sponsorship Overview
              </Typography>
              
              <Stack spacing={2}>
                    {/* Total Rewards Count */}
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                      }}
                    >
                      <Typography variant="caption" sx={{ color: '#5f6368', fontSize: '0.7rem', fontWeight: 700 }}>
                        TOTAL REWARDS
                      </Typography>
                      <Typography variant="h4" fontWeight={800} sx={{ color: theme.palette.primary.main, mt: 0.5 }}>
                        {game.rewards?.length || 0}
                  </Typography>
                </Box>
                
                    <Divider />
                    
                    {/* Rewards Status */}
                <Box>
                      <Typography variant="subtitle2" fontWeight={700} gutterBottom sx={{ color: '#202124', mb: 1.5 }}>
                        Reward Status
                  </Typography>
                      <Stack spacing={1.5}>
                        {game.rewards && game.rewards.length > 0 ? (
                          game.rewards.map(reward => {
                    const remaining = calculateRemainingNeed(reward)
                            const isFullySponsored = remaining === 0
                            const totalNeeded = reward.rewardType === 'cash' 
                              ? reward.rewardValuePerWinner * reward.numberOfWinnersForThisPosition
                              : reward.numberOfWinnersForThisPosition
                            const totalAllocated = reward.sponsors?.reduce((sum, sponsor) => {
                              const allocated = sponsor.allocated || sponsor.rewardDetails?.allocated || 0
                              return sum + allocated
                            }, 0) || 0
                            const percentageSponsored = totalNeeded > 0 ? Math.round((totalAllocated / totalNeeded) * 100) : 0

                    return (
                              <Box 
                                key={reward._id || reward.position}
                                sx={{
                                  p: 2,
                                  borderRadius: 2,
                                  bgcolor: isFullySponsored 
                                    ? alpha(theme.palette.success.main, 0.08)
                                    : alpha(theme.palette.warning.main, 0.05),
                                  border: '1px solid',
                                  borderColor: isFullySponsored
                                    ? alpha(theme.palette.success.main, 0.2)
                                    : alpha(theme.palette.warning.main, 0.2)
                                }}
                              >
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Typography 
                          variant='body2' 
                                    sx={{ 
                                      color: '#202124',
                                      fontSize: '0.875rem',
                                      fontWeight: 700
                                    }}
                                  >
                                    Position {reward.position}
                                  </Typography>
                                  {isFullySponsored && <CheckCircle sx={{ fontSize: 18, color: theme.palette.success.main }} />}
                                </Stack>
                                
                                {/* Progress Bar */}
                                <Box sx={{ mb: 1 }}>
                                  <Box
                                    sx={{
                                      width: '100%',
                                      height: 6,
                                      bgcolor: alpha(theme.palette.grey[300], 0.3),
                                      borderRadius: 1,
                                      overflow: 'hidden'
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        width: `${percentageSponsored}%`,
                                        height: '100%',
                                        bgcolor: isFullySponsored ? theme.palette.success.main : theme.palette.warning.main,
                                        transition: 'width 0.3s ease'
                                      }}
                                    />
                                  </Box>
                                </Box>

                                <Typography 
                                  variant='caption' 
                                  sx={{ color: '#5f6368', display: 'block', fontSize: '0.75rem' }}
                                >
                                  {percentageSponsored}% funded • {remaining > 0 
                                    ? `${reward.rewardType === 'cash' ? `${reward.currency} ${remaining}` : `${remaining} items`} remaining`
                            : 'Fully sponsored!'
                          }
                        </Typography>
                      </Box>
                    )
                          })
                        ) : (
                          <Typography variant='body2' sx={{ color: '#5f6368', fontStyle: 'italic' }}>
                            No rewards available
                          </Typography>
                        )}
                      </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
            </Stack>
          </Grid>
        </Grid>
      </Container>

      {/* Rewards Section */}
      <Container maxWidth="lg" sx={{ mt: 6 }}>
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant='h4' 
            fontWeight={800}
            sx={{ 
              color: '#202124',
              fontSize: { xs: '1.75rem', md: '2rem' },
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            <EmojiEvents sx={{ fontSize: 32, color: theme.palette.warning.main }} />
            Sponsorship Opportunities
          </Typography>
          <Typography variant="body1" sx={{ color: '#5f6368', fontSize: '1rem', lineHeight: 1.6 }}>
            Review the rewards below and choose one to sponsor
          </Typography>
        </Box>

          {game.rewards?.length === 0 ? (
          <Card sx={{ borderRadius: 4, bgcolor: 'white', border: '1px solid #e8eaed', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <CardContent sx={{ p: 4 }}>
              <Alert severity='info' sx={{ borderRadius: 3 }}>
              No rewards defined yet for this game.
            </Alert>
            </CardContent>
          </Card>
          ) : (
            <Grid container spacing={3}>
            {game.rewards
              .sort((a, b) => a.position - b.position)
              .map(reward => {
                const remaining = calculateRemainingNeed(reward)
                const totalNeeded = reward.rewardType === 'cash' 
                  ? reward.rewardValuePerWinner * reward.numberOfWinnersForThisPosition
                  : reward.numberOfWinnersForThisPosition
                const totalAllocated = reward.sponsors?.reduce((sum, sponsor) => {
                  const allocated = sponsor.allocated || sponsor.rewardDetails?.allocated || 0
                  return sum + allocated
                }, 0) || 0
                const isFullySponsored = remaining === 0
                const percentageSponsored = totalNeeded > 0 ? Math.round((totalAllocated / totalNeeded) * 100) : 0

                // Position colors
                const positionColors = {
                  1: '#ffd700',
                  2: '#c0c0c0',
                  3: '#cd7f32'
                }
                
                return (
                  <Grid item xs={12} md={6} key={reward._id || reward.position}>
                    <Card 
                      sx={{ 
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 4,
                        border: '1px solid #e8eaed',
                        bgcolor: 'white',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                          transform: 'translateY(-6px)',
                          borderColor: isFullySponsored ? theme.palette.success.main : theme.palette.primary.main
                        }
                      }}
                    >
                      <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                        {/* Position Header */}
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                          <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Avatar
                              sx={{
                                bgcolor: positionColors[reward.position] || '#a0a0a0',
                                width: 36,
                                height: 36,
                                fontSize: '0.95rem',
                                fontWeight: 800,
                                color: '#000'
                              }}
                            >
                              {reward.position}
                            </Avatar>
                            <Typography variant='h6' fontWeight={700} sx={{ color: '#202124', fontSize: '1.1rem' }}>
                              {getOrdinalSuffix(reward.position)} Place
                            </Typography>
                          </Stack>
                          {isFullySponsored && (
                            <Chip
                              icon={<CheckCircle sx={{ fontSize: 14 }} />}
                              label="Sponsored"
                              size="small"
                              sx={{
                                bgcolor: alpha(theme.palette.success.main, 0.1),
                                color: theme.palette.success.main,
                                fontWeight: 700,
                                border: 'none'
                              }}
                            />
                          )}
                        </Stack>
                        {/* Reward Details */}
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 2,
                              bgcolor: reward.rewardType === 'cash' 
                                ? alpha(theme.palette.success.main, 0.1)
                                : alpha(theme.palette.warning.main, 0.1),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {reward.rewardType === 'cash' ? (
                              <AttachMoney sx={{ fontSize: 22, color: theme.palette.success.main }} />
                            ) : (
                              <CardGiftcard sx={{ fontSize: 22, color: theme.palette.warning.main }} />
                            )}
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" sx={{ color: '#5f6368', fontSize: '0.7rem' }}>
                              {reward.rewardType === 'cash' ? 'CASH REWARD' : 'PHYSICAL GIFT'}
                            </Typography>
                            <Typography variant="h6" fontWeight={700} sx={{ color: '#202124', lineHeight: 1.2 }}>
                              {reward.rewardType === 'cash' 
                                ? `${reward.currency} ${reward.rewardValuePerWinner}`
                                : reward.nonCashReward
                              }
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#5f6368' }}>
                              {reward.numberOfWinnersForThisPosition} winner{reward.numberOfWinnersForThisPosition !== 1 ? 's' : ''}
                            </Typography>
                          </Box>
                        </Stack>

                        <Divider sx={{ mb: 3 }} />

                        {/* Progress Section */}
                        <Box sx={{ mb: 3 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                            <Typography variant="body2" fontWeight={700} sx={{ color: '#202124' }}>
                              Sponsorship Progress
                            </Typography>
                            <Typography variant="h6" fontWeight={800} sx={{ color: theme.palette.primary.main }}>
                              {percentageSponsored}%
                            </Typography>
                          </Stack>
                          
                          <Box
                            sx={{
                              width: '100%',
                              height: 8,
                              bgcolor: '#f0f1f3',
                              borderRadius: 2,
                              overflow: 'hidden',
                              mb: 2
                            }}
                          >
                            <Box
                              sx={{
                                width: `${percentageSponsored}%`,
                                height: '100%',
                                bgcolor: isFullySponsored ? theme.palette.success.main : theme.palette.primary.main,
                                transition: 'width 0.5s ease'
                              }}
                            />
                          </Box>
                          
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="caption" sx={{ color: '#5f6368' }}>
                              Sponsored: <strong>{reward.rewardType === 'cash' ? `${reward.currency} ${totalAllocated}` : `${totalAllocated} items`}</strong>
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#5f6368' }}>
                              Total: <strong>{reward.rewardType === 'cash' ? `${reward.currency} ${totalNeeded}` : `${totalNeeded} items`}</strong>
                            </Typography>
                          </Stack>
                        </Box>

                        <Divider sx={{ mb: 3 }} />

                        {/* Current Sponsors */}
                        {reward.sponsors && reward.sponsors.length > 0 && (
                          <Box sx={{ mb: 3 }}>
                            <Typography variant='subtitle2' fontWeight={700} gutterBottom sx={{ color: '#202124', mb: 2 }}>
                              Current Sponsors ({reward.sponsors.length})
                            </Typography>
                            
                            <Stack spacing={1.5}>
                              {reward.sponsors.map((sponsor, index) => (
                                <Box 
                                  key={index}
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    p: 2,
                                    borderRadius: 2,
                                    bgcolor: '#fafbfc',
                                    border: '1px solid #e8eaed'
                                  }}
                                >
                                  <Avatar 
                                    sx={{ 
                                      width: 36, 
                                      height: 36, 
                                      fontSize: '0.9rem',
                                      fontWeight: 700,
                                      bgcolor: theme.palette.primary.main
                                    }}
                                  >
                                    {sponsor.email?.charAt(0)?.toUpperCase() || 'S'}
                                  </Avatar>
                                  <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography 
                                      variant='body2' 
                                      fontWeight={600} 
                                      sx={{ 
                                        color: '#202124',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        mb: 0.5
                                      }}
                                    >
                                      {sponsor.email}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#5f6368', fontWeight: 600 }}>
                                      Contributed: {reward.rewardType === 'cash' 
                                        ? `${sponsor.currency || sponsor.rewardDetails?.currency || reward.currency} ${sponsor.allocated || sponsor.rewardDetails?.allocated || 0}` 
                                        : `${sponsor.allocated || sponsor.rewardDetails?.allocated || 0} items`}
                                    </Typography>
                                  </Box>
                                </Box>
                              ))}
                            </Stack>
                          </Box>
                        )}

                        {/* CTA Button */}
                        <Button
                          variant='contained'
                          component='label'
                          fullWidth
                          onClick={() => handleSponsorReward(reward)}
                          disabled={isFullySponsored}
                          sx={{ 
                            mt: 'auto',
                            py: 1.5,
                            fontWeight: 700,
                            textTransform: 'none',
                            fontSize: '0.95rem',
                            borderRadius: 2,
                            bgcolor: isFullySponsored ? theme.palette.success.main : theme.palette.primary.main,
                            color: 'white',
                            boxShadow: 'none',
                            '&:hover': {
                              bgcolor: isFullySponsored ? theme.palette.success.dark : theme.palette.primary.dark,
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                              transform: 'translateY(-2px)'
                            },
                            '&:disabled': {
                              bgcolor: theme.palette.success.main,
                              color: 'white',
                              opacity: 0.8
                            },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {isFullySponsored ? '✓ Fully Sponsored' : 'Sponsor This Reward'}
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

export default SponsorGameDetails

function getOrdinalSuffix(number) {
  const j = number % 10,
    k = number % 100
  if (j === 1 && k !== 11) return number + 'st'
  if (j === 2 && k !== 12) return number + 'nd'
  if (j === 3 && k !== 13) return number + 'rd'
  return number + 'th'
}
