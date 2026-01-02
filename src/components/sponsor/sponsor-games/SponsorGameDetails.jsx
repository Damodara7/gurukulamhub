'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Collapse,
  Grid,
  IconButton,
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
  useTheme,
  useMediaQuery
} from '@mui/material'
import {
  EmojiEvents,
  AttachMoney,
  CardGiftcard,
  Schedule,
  People,
  ArrowBack,
  Person,
  CheckCircle,
  ExpandLess,
  ExpandMore
} from '@mui/icons-material'
import ReactPlayer from 'react-player'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'

const SponsorGameDetails = ({ gameId }) => {
  const router = useRouter()
  const theme = useTheme()
  const isDarkMode = theme.palette.mode === 'dark'
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'))
  const [game, setGame] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(true)
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (gameId) {
      fetchGameDetails()
    }
  }, [gameId])

  // WebSocket connection for real-time game details updates
  useEffect(() => {
    if (!gameId) return

    const wsUrl =
      typeof window !== 'undefined'
        ? `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/api/ws/sponsor-games/${gameId}`
        : ''

    if (wsUrl) {
      const wsRef = new WebSocket(wsUrl)

      wsRef.onopen = () => {
        console.log(`[WS] Connected to sponsor game ${gameId} updates`)
        setIsConnected(true)
        setSocket(wsRef)
      }

      wsRef.onmessage = event => {
        try {
          const msg = JSON.parse(event.data)

          if (msg.type === 'sponsorGameDetails') {
            // Full game details update
            console.log('[WS] Sponsor game details updated')
            setGame(msg.data)
          } else if (msg.type === 'sponsorshipUpdate') {
            // Sponsorship update (new sponsor, payment success, etc.)
            console.log('[WS] Sponsorship update received:', msg.data)
            // Refresh game details to get latest data
            fetchGameDetails()
          } else if (msg.type === 'rewardSponsorshipUpdate') {
            // Reward sponsorship update
            console.log('[WS] Reward sponsorship update received:', msg.data)
            const { rewardId, reward } = msg.data

            // Update the specific reward in the game state
            setGame(prevGame => {
              if (!prevGame || !prevGame.rewards) return prevGame

              const updatedRewards = prevGame.rewards.map(r =>
                (r._id && r._id.toString() === rewardId) || r.position.toString() === rewardId.toString()
                  ? { ...r, ...reward }
                  : r
              )

              return {
                ...prevGame,
                rewards: updatedRewards
              }
            })
          }
        } catch (e) {
          console.error('[WS] Error parsing sponsor game message', e)
        }
      }

      wsRef.onerror = err => {
        console.error(`[WS] Sponsor game ${gameId} error`, err)
        setIsConnected(false)
      }

      wsRef.onclose = () => {
        console.log(`[WS] Sponsor game ${gameId} connection closed`)
        setIsConnected(false)
      }

      return () => {
        wsRef.close()
      }
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

  const handleSponsorReward = reward => {
    // Navigate to the individual reward page
    const rewardId = reward._id || reward.position
    router.push(`/sponsor/games/${gameId}/reward/${rewardId}`)
  }

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

  if (!game) {
    return (
      <Box
        sx={{
          minHeight: '100%',
          bgcolor: theme.palette.background.default,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, sm: 4 }
        }}
      >
        <Container maxWidth='sm'>
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
                Game not found or failed to load.
              </Alert>
              <Button
                variant='contained'
                component='label'
                startIcon={<ArrowBack />}
                onClick={() => router.push('/sponsor/games')}
                fullWidth
                sx={{
                  color: 'white',
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  py: { xs: 1.25, sm: 1.5 },
                  borderRadius: { xs: 1.5, sm: 2 }
                }}
              >
                Back to Games awaiting sponsorship
              </Button>
            </CardContent>
          </Card>
        </Container>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: theme.palette.background.default,
        overflow: 'hidden'
      }}
    >
      {/* Header Section - Fixed */}
      <Box
        sx={{
          flexShrink: 0,
          bgcolor: isDarkMode ? theme.palette.background.paper : 'white',
          pt: isHeaderExpanded ? { xs: 2.5, md: 3 } : { xs: 1.5, md: 2 },
          pb: isHeaderExpanded ? { xs: 2.5, md: 3 } : { xs: 1.5, md: 2 },
          borderBottom: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.15 : 0.1)}`,
          transition: 'padding 0.3s ease'
        }}
      >
        <Container maxWidth='lg' sx={{ position: 'relative' }}>
          {/* Chevron Toggle Button - Right side, vertically centered */}
          <IconButton
            onClick={() => setIsHeaderExpanded(!isHeaderExpanded)}
            sx={{
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              color: theme.palette.text.secondary,
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main
              }
            }}
          >
            {isHeaderExpanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>

          <Stack spacing={{ xs: 1.5, sm: 2 }} sx={{ pr: { xs: 6, sm: 7, md: 8 } }}>
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
              Back to Games awaiting sponsorship
            </Button>

            {/* Title */}
            <Typography
              variant='h4'
              fontWeight={700}
              sx={{
                fontSize: isHeaderExpanded
                  ? { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
                  : { xs: '1.125rem', sm: '1.25rem', md: '1.5rem' },
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${
                  theme.palette.secondary?.main || theme.palette.primary.light
                })`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: 1.3,
                transition: 'font-size 0.3s ease'
              }}
            >
              {game.title}
            </Typography>

            {/* Collapsible Content */}
            <Collapse in={isHeaderExpanded} timeout={300}>
              <Stack spacing={{ xs: 1.5, sm: 2 }}>
                {/* Status */}
                <Stack
                  direction='row'
                  justifyContent='space-between'
                  alignItems='center'
                  flexWrap='wrap'
                  gap={{ xs: 1.5, sm: 2 }}
                >
                  <Chip
                    label='Awaiting Sponsorship'
                    size='small'
                    sx={{
                      bgcolor: alpha(theme.palette.warning.main, isDarkMode ? 0.15 : 0.1),
                      color: theme.palette.warning.main,
                      fontWeight: 700,
                      fontSize: { xs: '0.65rem', sm: '0.7rem' },
                      border: `2px solid ${alpha(theme.palette.warning.main, isDarkMode ? 0.4 : 0.3)}`,
                      height: { xs: 24, sm: 26 }
                    }}
                  />
                </Stack>

                {/* Description */}
                {game?.description && (
                  <Typography
                    variant='body2'
                    sx={{
                      fontSize: { xs: '0.85rem', sm: '0.9rem', md: '0.95rem' },
                      color: 'text.secondary',
                      lineHeight: 1.6,
                      maxWidth: { xs: '100%', sm: '800px', md: '900px' }
                    }}
                  >
                    {game.description}
                  </Typography>
                )}

                {/* Quick Info Bar */}
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={{ xs: 2, sm: 3, md: 4 }}
                  flexWrap='wrap'
                  sx={{ pt: 1 }}
                >
                  <Stack direction='row' spacing={1} alignItems='center'>
                    <Box
                      sx={{
                        width: { xs: 28, sm: 32 },
                        height: { xs: 28, sm: 32 },
                        borderRadius: { xs: 1.25, sm: 1.5 },
                        bgcolor: isDarkMode ? alpha(theme.palette.info.main, 0.2) : alpha(theme.palette.info.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Schedule sx={{ fontSize: { xs: 16, sm: 18 }, color: theme.palette.info.main }} />
                    </Box>
                    <Box>
                      <Typography
                        variant='caption'
                        sx={{
                          color: 'text.secondary',
                          fontSize: { xs: '0.65rem', sm: '0.7rem' }
                        }}
                      >
                        MODE
                      </Typography>
                      <Typography
                        variant='body2'
                        fontWeight={600}
                        sx={{
                          color: 'text.primary',
                          fontSize: { xs: '0.83rem', sm: '0.875rem' }
                        }}
                      >
                        {game.gameMode === 'live' ? 'Live Game' : 'Self-paced'}
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction='row' spacing={1} alignItems='center'>
                    <Box
                      sx={{
                        width: { xs: 28, sm: 32 },
                        height: { xs: 28, sm: 32 },
                        borderRadius: { xs: 1.25, sm: 1.5 },
                        bgcolor: isDarkMode
                          ? alpha(theme.palette.secondary?.main || theme.palette.primary.main, 0.2)
                          : alpha(theme.palette.secondary?.main || theme.palette.primary.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <People
                        sx={{
                          fontSize: { xs: 16, sm: 18 },
                          color: theme.palette.secondary?.main || theme.palette.primary.main
                        }}
                      />
                    </Box>
                    <Box>
                      <Typography
                        variant='caption'
                        sx={{
                          color: 'text.secondary',
                          fontSize: { xs: '0.65rem', sm: '0.7rem' }
                        }}
                      >
                        PLAYERS
                      </Typography>
                      <Typography
                        variant='body2'
                        fontWeight={600}
                        sx={{
                          color: 'text.primary',
                          fontSize: { xs: '0.83rem', sm: '0.875rem' }
                        }}
                      >
                        Max {game.maxPlayers}
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction='row' spacing={1} alignItems='center'>
                    <Box
                      sx={{
                        width: { xs: 28, sm: 32 },
                        height: { xs: 28, sm: 32 },
                        borderRadius: { xs: 1.25, sm: 1.5 },
                        bgcolor: isDarkMode
                          ? alpha(theme.palette.warning.main, 0.2)
                          : alpha(theme.palette.warning.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <EmojiEvents sx={{ fontSize: { xs: 16, sm: 18 }, color: theme.palette.warning.main }} />
                    </Box>
                    <Box>
                      <Typography
                        variant='caption'
                        sx={{
                          color: 'text.secondary',
                          fontSize: { xs: '0.65rem', sm: '0.7rem' }
                        }}
                      >
                        REWARDS
                      </Typography>
                      <Typography
                        variant='body2'
                        fontWeight={600}
                        sx={{
                          color: 'text.primary',
                          fontSize: { xs: '0.83rem', sm: '0.875rem' }
                        }}
                      >
                        {game.rewards?.length || 0} Available
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction='row' spacing={1} alignItems='center'>
                    <Box
                      sx={{
                        width: { xs: 28, sm: 32 },
                        height: { xs: 28, sm: 32 },
                        borderRadius: { xs: 1.25, sm: 1.5 },
                        bgcolor: isDarkMode
                          ? alpha(theme.palette.success.main, 0.2)
                          : alpha(theme.palette.success.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Person sx={{ fontSize: { xs: 16, sm: 18 }, color: theme.palette.success.main }} />
                    </Box>
                    <Box>
                      <Typography
                        variant='caption'
                        sx={{
                          color: 'text.secondary',
                          fontSize: { xs: '0.65rem', sm: '0.7rem' }
                        }}
                      >
                        ORGANIZER
                      </Typography>
                      <Typography
                        variant='body2'
                        fontWeight={600}
                        sx={{
                          color: 'text.primary',
                          fontSize: { xs: '0.83rem', sm: '0.875rem' }
                        }}
                      >
                        {game.creatorEmail?.split('@')[0] || 'N/A'}
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </Stack>
            </Collapse>
          </Stack>
        </Container>
      </Box>

      {/* Main Content - Scrollable */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          minHeight: 0,
          WebkitOverflowScrolling: 'touch',
          scrollbarGutter: 'stable',
          // Custom scrollbar styling
          '&::-webkit-scrollbar': {
            width: '8px'
          },
          '&::-webkit-scrollbar-track': {
            background: alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.1 : 0.05),
            borderRadius: '4px'
          },
          '&::-webkit-scrollbar-thumb': {
            background:
              theme.palette.mode === 'dark'
                ? alpha(theme.palette.common.white, 0.3)
                : alpha(theme.palette.common.black, 0.2),
            borderRadius: '4px',
            '&:hover': {
              background:
                theme.palette.mode === 'dark'
                  ? alpha(theme.palette.common.white, 0.4)
                  : alpha(theme.palette.common.black, 0.3)
            }
          }
        }}
      >
        <Container maxWidth='lg' sx={{ mt: 4, pb: { xs: 6, sm: 8, md: 10 } }}>
          <Grid container spacing={4}>
            {/* Left Column */}
            <Grid item xs={12} md={8}>
              <Stack spacing={4}>
                {/* Quiz Details Card */}
                {game.quiz && (
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
                      <Stack spacing={{ xs: 2.5, sm: 3 }}>
                        {/* Quiz Header */}
                        <Box>
                          <Typography
                            variant='overline'
                            sx={{
                              color: theme.palette.primary.main,
                              fontWeight: 700,
                              letterSpacing: { xs: 1, sm: 1.5 },
                              fontSize: { xs: '0.65rem', sm: '0.7rem' }
                            }}
                          >
                            QUIZ INFORMATION
                          </Typography>
                          <Typography
                            variant='h5'
                            fontWeight={700}
                            sx={{
                              color: 'text.primary',
                              mt: 0.5,
                              fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' }
                            }}
                          >
                            {game.quiz.title || 'Quiz Title'}
                          </Typography>
                        </Box>

                        <Divider sx={{ borderColor: alpha(theme.palette.divider, isDarkMode ? 0.3 : 0.3) }} />

                        {/* Quiz Details */}
                        {game.quiz.details && (
                          <Box>
                            <Typography
                              variant='subtitle1'
                              fontWeight={700}
                              gutterBottom
                              sx={{
                                color: 'text.primary',
                                fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' }
                              }}
                            >
                              Description
                            </Typography>
                            <Typography
                              sx={{
                                color: 'text.secondary',
                                lineHeight: 1.7,
                                fontSize: { xs: '0.88rem', sm: '0.9rem', md: '0.95rem' }
                              }}
                            >
                              {game.quiz.details}
                            </Typography>
                          </Box>
                        )}

                        {/* Language & Syllabus */}
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1.5, sm: 2 }} flexWrap='wrap'>
                          {game.quiz.language && (
                            <Chip
                              label={`Language: ${game.quiz.language.name || game.quiz.language}`}
                              sx={{
                                bgcolor: isDarkMode
                                  ? alpha(theme.palette.info.main, 0.2)
                                  : alpha(theme.palette.info.main, 0.1),
                                color: theme.palette.info.main,
                                fontWeight: 600,
                                border: 'none',
                                fontSize: { xs: '0.8rem', sm: '0.875rem' }
                              }}
                            />
                          )}
                          {game.quiz.syllabus && (
                            <Chip
                              label={`Syllabus: ${game.quiz.syllabus}`}
                              sx={{
                                bgcolor: isDarkMode
                                  ? alpha(theme.palette.secondary?.main || theme.palette.primary.main, 0.2)
                                  : alpha(theme.palette.secondary?.main || theme.palette.primary.main, 0.1),
                                color: theme.palette.secondary?.main || theme.palette.primary.main,
                                fontWeight: 600,
                                border: 'none',
                                fontSize: { xs: '0.8rem', sm: '0.875rem' }
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
                      borderRadius: { xs: 3, md: 4 },
                      overflow: 'hidden',
                      bgcolor: isDarkMode ? alpha(theme.palette.background.paper, 0.6) : 'white',
                      border: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.3 : 0.1)}`,
                      boxShadow: isDarkMode
                        ? `0 2px 12px ${alpha(theme.palette.common.black, 0.3)}`
                        : '0 2px 12px rgba(0,0,0,0.04)'
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
                    borderRadius: { xs: 3, md: 4 },
                    bgcolor: isDarkMode ? alpha(theme.palette.background.paper, 0.6) : 'white',
                    border: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.3 : 0.1)}`,
                    boxShadow: isDarkMode
                      ? `0 2px 12px ${alpha(theme.palette.common.black, 0.3)}`
                      : '0 2px 12px rgba(0,0,0,0.04)'
                  }}
                >
                  <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                    <Typography
                      variant='h6'
                      fontWeight={700}
                      gutterBottom
                      sx={{
                        color: 'text.primary',
                        mb: { xs: 2.5, sm: 3 },
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }
                      }}
                    >
                      <EmojiEvents sx={{ fontSize: { xs: 20, sm: 22 }, color: theme.palette.warning.main }} />
                      Sponsorship Overview
                    </Typography>

                    <Stack spacing={2}>
                      {/* Total Rewards Count */}
                      <Box
                        sx={{
                          p: { xs: 1.5, sm: 2 },
                          borderRadius: { xs: 1.5, sm: 2 },
                          bgcolor: alpha(theme.palette.primary.main, isDarkMode ? 0.15 : 0.08),
                          border: `1px solid ${alpha(theme.palette.primary.main, isDarkMode ? 0.3 : 0.2)}`
                        }}
                      >
                        <Typography
                          variant='caption'
                          sx={{
                            color: 'text.secondary',
                            fontSize: { xs: '0.65rem', sm: '0.7rem' },
                            fontWeight: 700
                          }}
                        >
                          TOTAL REWARDS
                        </Typography>
                        <Typography
                          variant='h4'
                          fontWeight={800}
                          sx={{
                            color: theme.palette.primary.main,
                            mt: 0.5,
                            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' }
                          }}
                        >
                          {game.rewards?.length || 0}
                        </Typography>
                      </Box>

                      <Divider />

                      {/* Rewards Status */}
                      <Box>
                        <Typography
                          variant='subtitle2'
                          fontWeight={700}
                          gutterBottom
                          sx={{
                            color: 'text.primary',
                            mb: { xs: 1.25, sm: 1.5 },
                            fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' }
                          }}
                        >
                          Reward Status
                        </Typography>
                        <Stack spacing={1.5}>
                          {game.rewards && game.rewards.length > 0 ? (
                            game.rewards.map(reward => {
                              const remaining = calculateRemainingNeed(reward)
                              const isFullySponsored = remaining === 0
                              const totalNeeded =
                                reward.rewardType === 'cash'
                                  ? reward.rewardValuePerWinner * reward.numberOfWinnersForThisPosition
                                  : reward.numberOfWinnersForThisPosition
                              const totalAllocated =
                                reward.sponsors?.reduce((sum, sponsor) => {
                                  const allocated = sponsor.allocated || sponsor.rewardDetails?.allocated || 0
                                  return sum + allocated
                                }, 0) || 0
                              const percentageSponsored =
                                totalNeeded > 0 ? Math.round((totalAllocated / totalNeeded) * 100) : 0

                              return (
                                <Box
                                  key={reward._id || reward.position}
                                  sx={{
                                    p: { xs: 1.5, sm: 2 },
                                    borderRadius: { xs: 1.5, sm: 2 },
                                    bgcolor: isFullySponsored
                                      ? alpha(theme.palette.success.main, isDarkMode ? 0.15 : 0.08)
                                      : alpha(theme.palette.warning.main, isDarkMode ? 0.12 : 0.05),
                                    border: '1px solid',
                                    borderColor: isFullySponsored
                                      ? alpha(theme.palette.success.main, isDarkMode ? 0.3 : 0.2)
                                      : alpha(theme.palette.warning.main, isDarkMode ? 0.3 : 0.2)
                                  }}
                                >
                                  <Stack
                                    direction='row'
                                    justifyContent='space-between'
                                    alignItems='center'
                                    sx={{ mb: 1 }}
                                  >
                                    <Typography
                                      variant='body2'
                                      sx={{
                                        color: 'text.primary',
                                        fontSize: { xs: '0.83rem', sm: '0.875rem' },
                                        fontWeight: 700
                                      }}
                                    >
                                      Position {reward.position}
                                    </Typography>
                                    {isFullySponsored && (
                                      <CheckCircle
                                        sx={{ fontSize: { xs: 16, sm: 18 }, color: theme.palette.success.main }}
                                      />
                                    )}
                                  </Stack>

                                  {/* Progress Bar */}
                                  <Box sx={{ mb: 1 }}>
                                    <Box
                                      sx={{
                                        width: '100%',
                                        height: { xs: 5, sm: 6 },
                                        bgcolor: isDarkMode
                                          ? alpha(theme.palette.grey[600], 0.3)
                                          : alpha(theme.palette.grey[300], 0.3),
                                        borderRadius: 1,
                                        overflow: 'hidden'
                                      }}
                                    >
                                      <Box
                                        sx={{
                                          width: `${percentageSponsored}%`,
                                          height: '100%',
                                          bgcolor: isFullySponsored
                                            ? theme.palette.success.main
                                            : theme.palette.warning.main,
                                          transition: 'width 0.3s ease'
                                        }}
                                      />
                                    </Box>
                                  </Box>

                                  <Typography
                                    variant='caption'
                                    sx={{
                                      color: 'text.secondary',
                                      display: 'block',
                                      fontSize: { xs: '0.73rem', sm: '0.75rem' }
                                    }}
                                  >
                                    {percentageSponsored}% funded •{' '}
                                    {remaining > 0
                                      ? `${
                                          reward.rewardType === 'cash'
                                            ? `${reward.currency} ${remaining}`
                                            : `${remaining} items`
                                        } remaining`
                                      : 'Fully sponsored!'}
                                  </Typography>
                                </Box>
                              )
                            })
                          ) : (
                            <Typography
                              variant='body2'
                              sx={{
                                color: 'text.secondary',
                                fontStyle: 'italic',
                                fontSize: { xs: '0.88rem', sm: '0.9rem', md: '0.95rem' }
                              }}
                            >
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
        <Container maxWidth='lg' sx={{ mt: 6 }}>
          <Box sx={{ mb: 4 }}>
            <Typography
              variant='h4'
              fontWeight={800}
              sx={{
                color: 'text.primary',
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 1.5, sm: 2 },
                flexWrap: 'wrap'
              }}
            >
              <EmojiEvents sx={{ fontSize: { xs: 28, sm: 32 }, color: theme.palette.warning.main }} />
              Sponsorship Opportunities
            </Typography>
            <Typography
              variant='body1'
              sx={{
                color: 'text.secondary',
                fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' },
                lineHeight: 1.6
              }}
            >
              Review the rewards below and choose one to sponsor
            </Typography>
          </Box>

          {game.rewards?.length === 0 ? (
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
              <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                <Alert
                  severity='info'
                  sx={{
                    borderRadius: { xs: 2, sm: 3 },
                    fontSize: { xs: '0.9rem', sm: '1rem' }
                  }}
                >
                  No rewards defined yet for this game.
                </Alert>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
              {game.rewards
                .sort((a, b) => a.position - b.position)
                .map(reward => {
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
                  const isFullySponsored = remaining === 0
                  const percentageSponsored = totalNeeded > 0 ? Math.round((totalAllocated / totalNeeded) * 100) : 0

                  // Position colors
                  const positionColors = {
                    1: '#ffd700',
                    2: '#c0c0c0',
                    3: '#cd7f32'
                  }

                  return (
                    <Grid item xs={12} sm={6} md={6} key={reward._id || reward.position}>
                      <Card
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          borderRadius: { xs: 3, md: 4 },
                          border: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.3 : 0.1)}`,
                          bgcolor: isDarkMode ? alpha(theme.palette.background.paper, 0.6) : 'white',
                          boxShadow: isDarkMode
                            ? `0 2px 12px ${alpha(theme.palette.common.black, 0.3)}`
                            : '0 2px 12px rgba(0,0,0,0.04)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            boxShadow: isDarkMode
                              ? `0 8px 24px ${alpha(theme.palette.common.black, 0.5)}`
                              : '0 8px 24px rgba(0,0,0,0.1)',
                            transform: { xs: 'translateY(-4px)', md: 'translateY(-6px)' },
                            borderColor: isFullySponsored ? theme.palette.success.main : theme.palette.primary.main
                          }
                        }}
                      >
                        <CardContent
                          sx={{ p: { xs: 2.5, sm: 3 }, flexGrow: 1, display: 'flex', flexDirection: 'column' }}
                        >
                          {/* Position Header */}
                          <Stack direction='row' justifyContent='space-between' alignItems='center' sx={{ mb: 3 }}>
                            <Stack direction='row' alignItems='center' spacing={1.5}>
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
                              <Typography
                                variant='h6'
                                fontWeight={700}
                                sx={{
                                  color: 'text.primary',
                                  fontSize: { xs: '1rem', sm: '1.05rem', md: '1.1rem' }
                                }}
                              >
                                {getOrdinalSuffix(reward.position)} Place
                              </Typography>
                            </Stack>
                            {isFullySponsored && (
                              <Chip
                                icon={<CheckCircle sx={{ fontSize: { xs: 12, sm: 14 } }} />}
                                label='Sponsored'
                                size='small'
                                sx={{
                                  bgcolor: alpha(theme.palette.success.main, isDarkMode ? 0.15 : 0.1),
                                  color: theme.palette.success.main,
                                  fontWeight: 700,
                                  border: 'none',
                                  fontSize: { xs: '0.7rem', sm: '0.75rem' }
                                }}
                              />
                            )}
                          </Stack>
                          {/* Reward Details */}
                          <Stack direction='row' alignItems='center' spacing={2} sx={{ mb: 3 }}>
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 2,
                                bgcolor:
                                  reward.rewardType === 'cash'
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
                              <Typography
                                variant='caption'
                                sx={{
                                  color: 'text.secondary',
                                  fontSize: { xs: '0.65rem', sm: '0.7rem' }
                                }}
                              >
                                {reward.rewardType === 'cash' ? 'CASH REWARD' : 'PHYSICAL GIFT'}
                              </Typography>
                              <Typography
                                variant='h6'
                                fontWeight={700}
                                sx={{
                                  color: 'text.primary',
                                  lineHeight: 1.2,
                                  fontSize: { xs: '1rem', sm: '1.05rem', md: '1.1rem' }
                                }}
                              >
                                {reward.rewardType === 'cash'
                                  ? `${reward.currency} ${reward.rewardValuePerWinner}`
                                  : reward.nonCashReward}
                              </Typography>
                              <Typography
                                variant='caption'
                                sx={{
                                  color: 'text.secondary',
                                  fontSize: { xs: '0.73rem', sm: '0.75rem' }
                                }}
                              >
                                {reward.numberOfWinnersForThisPosition} winner
                                {reward.numberOfWinnersForThisPosition !== 1 ? 's' : ''}
                              </Typography>
                            </Box>
                          </Stack>

                          <Divider sx={{ mb: 3 }} />

                          {/* Progress Section */}
                          <Box sx={{ mb: { xs: 2.5, sm: 3 } }}>
                            <Stack
                              direction='row'
                              justifyContent='space-between'
                              alignItems='center'
                              sx={{ mb: { xs: 1.25, sm: 1.5 } }}
                            >
                              <Typography
                                variant='body2'
                                fontWeight={700}
                                sx={{
                                  color: 'text.primary',
                                  fontSize: { xs: '0.83rem', sm: '0.875rem' }
                                }}
                              >
                                Sponsorship Progress
                              </Typography>
                              <Typography
                                variant='h6'
                                fontWeight={800}
                                sx={{
                                  color: theme.palette.primary.main,
                                  fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }
                                }}
                              >
                                {percentageSponsored}%
                              </Typography>
                            </Stack>

                            <Box
                              sx={{
                                width: '100%',
                                height: { xs: 7, sm: 8 },
                                bgcolor: isDarkMode
                                  ? alpha(theme.palette.grey[600], 0.3)
                                  : alpha(theme.palette.grey[300], 0.5),
                                borderRadius: { xs: 1.5, sm: 2 },
                                overflow: 'hidden',
                                mb: { xs: 1.5, sm: 2 }
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

                            <Stack
                              direction={{ xs: 'column', sm: 'row' }}
                              justifyContent='space-between'
                              spacing={{ xs: 0.5, sm: 0 }}
                            >
                              <Typography
                                variant='caption'
                                sx={{
                                  color: 'text.secondary',
                                  fontSize: { xs: '0.73rem', sm: '0.75rem' }
                                }}
                              >
                                Sponsored:{' '}
                                <strong>
                                  {reward.rewardType === 'cash'
                                    ? `${reward.currency} ${totalAllocated}`
                                    : `${totalAllocated} items`}
                                </strong>
                              </Typography>
                              <Typography
                                variant='caption'
                                sx={{
                                  color: 'text.secondary',
                                  fontSize: { xs: '0.73rem', sm: '0.75rem' }
                                }}
                              >
                                Total:{' '}
                                <strong>
                                  {reward.rewardType === 'cash'
                                    ? `${reward.currency} ${totalNeeded}`
                                    : `${totalNeeded} items`}
                                </strong>
                              </Typography>
                            </Stack>
                          </Box>

                          <Divider sx={{ mb: 3 }} />

                          {/* Current Sponsors */}
                          {reward.sponsors && reward.sponsors.length > 0 && (
                            <Box sx={{ mb: { xs: 2.5, sm: 3 } }}>
                              <Typography
                                variant='subtitle2'
                                fontWeight={700}
                                gutterBottom
                                sx={{
                                  color: 'text.primary',
                                  mb: { xs: 1.5, sm: 2 },
                                  fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' }
                                }}
                              >
                                Current Sponsors ({reward.sponsors.length})
                              </Typography>

                              <Stack spacing={{ xs: 1.25, sm: 1.5 }}>
                                {reward.sponsors.map((sponsor, index) => (
                                  <Box
                                    key={index}
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: { xs: 1.5, sm: 2 },
                                      p: { xs: 1.5, sm: 2 },
                                      borderRadius: { xs: 1.5, sm: 2 },
                                      bgcolor: isDarkMode
                                        ? alpha(theme.palette.background.default, 0.4)
                                        : alpha(theme.palette.grey[50], 0.8),
                                      border: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.3 : 0.1)}`
                                    }}
                                  >
                                    <Avatar
                                      sx={{
                                        width: { xs: 32, sm: 36 },
                                        height: { xs: 32, sm: 36 },
                                        fontSize: { xs: '0.85rem', sm: '0.9rem' },
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
                                          color: 'text.primary',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap',
                                          mb: 0.5,
                                          fontSize: { xs: '0.83rem', sm: '0.875rem' }
                                        }}
                                      >
                                        {sponsor.email}
                                      </Typography>
                                      <Typography
                                        variant='caption'
                                        sx={{
                                          color: 'text.secondary',
                                          fontWeight: 600,
                                          fontSize: { xs: '0.73rem', sm: '0.75rem' }
                                        }}
                                      >
                                        Contributed:{' '}
                                        {reward.rewardType === 'cash'
                                          ? `${
                                              sponsor.currency || sponsor.rewardDetails?.currency || reward.currency
                                            } ${sponsor.allocated || sponsor.rewardDetails?.allocated || 0}`
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
                              py: { xs: 1.25, sm: 1.5 },
                              fontWeight: 700,
                              textTransform: 'none',
                              fontSize: { xs: '0.9rem', sm: '0.92rem', md: '0.95rem' },
                              borderRadius: { xs: 1.5, sm: 2 },
                              bgcolor: isFullySponsored ? theme.palette.success.main : theme.palette.primary.main,
                              color: 'white',
                              boxShadow: 'none',
                              '&:hover': {
                                bgcolor: isFullySponsored ? theme.palette.success.dark : theme.palette.primary.dark,
                                boxShadow: isDarkMode
                                  ? `0 4px 12px ${alpha(
                                      isFullySponsored ? theme.palette.success.main : theme.palette.primary.main,
                                      0.4
                                    )}`
                                  : '0 4px 12px rgba(0,0,0,0.15)',
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
