'use client'
import {
  Button,
  Card,
  useTheme,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Stack,
  Container,
  useMediaQuery,
  Skeleton,
  CircularProgress,
  Chip
} from '@mui/material'
import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import imagePlaceholder from '/public/images/misc/image-placeholder.png'
import EventIcon from '@mui/icons-material/Event'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

function LandingPageGamedata({ isAuthenticated = false }) {
  const [gameData, setGameData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const { data: session, status } = useSession()
  const theme = useTheme()
  const router = useRouter()
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'))

  // DATA FETCHING
  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const res = await RestApi.get(`${API_URLS.v0.USERS_GAME}`)
        if (res.status === 'success') {
          setGameData(res?.result || [])
        } else {
          setError(res.message)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchGameData()
  }, [])

  // HANDLE VIEW ALL GAMES
  const handleViewAll = async () => {
    setIsCheckingAuth(true)

    if (isAuthenticated || status === 'authenticated') {
      router.push('/public-games')
    } else {
      router.push(`/auth/login?redirectTo=public-games`)
    }
  }

  const formatGameDate = dateString => {
    if (!dateString) return 'Time not specified'
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? 'Invalid date' : format(date, 'PPpp')
  }

  // RENDER CONDITIONS (AFTER HOOKS)
  if (isRedirecting || status === 'loading') {
    return <Typography>Redirecting...</Typography> // Prevents flickering
  }

  if (error) return <Typography>Error: {error}</Typography>

  // Card dimensions
  const cardWidth = 280
  const cardHeight = 340

  const renderHeaderSkeleton = () => (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%'
      }}
    >
      <Skeleton variant='text' width={180} height={40} />
      <Skeleton variant='rectangular' width={120} height={36} />
    </Box>
  )

  const renderCardSkeleton = () => {
    return Array(4)
      .fill(0)
      .map((_, index) => (
        <Box
          key={`skeleton-${index}`}
          sx={{
            flex: `0 0 ${cardWidth}px`,
            scrollSnapAlign: 'start',
            height: '100%'
          }}
        >
          <Card sx={{ width: cardWidth, height: cardHeight, my: 2 }}>
            <Skeleton variant='rectangular' width={cardWidth} height={100} />
            <CardContent>
              <Skeleton variant='text' width='80%' height={24} />
              <Skeleton variant='text' width='60%' height={16} />
              <Box sx={{ mt: 2 }}>
                <Stack spacing={1}>
                  <Skeleton variant='text' width='70%' height={16} />
                  <Skeleton variant='text' width='70%' height={16} />
                  <Skeleton variant='text' width='70%' height={16} />
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Box>
      ))
  }
  return (
    <Box
      sx={{
        width: '100%',
        position: 'relative',
        py: { xs: 8, md: 12 },
        background: `linear-gradient(180deg, 
          ${theme.palette.background.default} 0%, 
          ${theme.palette.secondary.main}05 50%,
          ${theme.palette.background.paper} 100%)`
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          position: 'relative'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4
          }}
        >
          {loading ? (
            renderHeaderSkeleton()
          ) : (
            <>
              <Stack spacing={0.5}>
                <Typography
                  variant="overline"
                  sx={{
                    color: theme.palette.secondary.main,
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    letterSpacing: 3
                  }}
                >
                  {isAuthenticated ? 'COMPETE NOW' : 'LIVE NOW'}
                </Typography>
                <Typography 
                  variant='h3' 
                  fontWeight={900}
                  sx={{ 
                    fontSize: { xs: '1.75rem', md: '2.25rem' },
                    color: theme.palette.text.primary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}
                >
                  <Box 
                    component="span" 
                    sx={{ 
                      fontSize: '2.5rem',
                      display: 'inline-block',
                      animation: 'shake 2s ease-in-out infinite',
                      '@keyframes shake': {
                        '0%, 100%': { transform: 'rotate(0deg)' },
                        '25%': { transform: 'rotate(-10deg)' },
                        '75%': { transform: 'rotate(10deg)' }
                      }
                    }}
                  >
                    🏆
                  </Box>
                  {isAuthenticated ? 'Join Competitions' : 'Live Competitions'}
                </Typography>
              </Stack>

              {gameData.length > 0 && (
                <Button
                  variant='contained'
                  size='large'
                  component='label'
                  onClick={handleViewAll}
                  endIcon={isCheckingAuth || status === 'loading' ? null : <Box component="span">→</Box>}
                  sx={{
                    fontWeight: 700,
                    px: 4,
                    py: 2,
                    borderRadius: 3,
                    textTransform: 'none',
                    fontSize: '1.05rem',
                    minWidth: 180,
                    bgcolor: theme.palette.secondary.main,
                    color: 'white',
                    boxShadow: `0 6px 20px ${theme.palette.secondary.main}40`,
                    '&:hover': {
                      bgcolor: theme.palette.secondary.dark,
                      transform: 'translateY(-3px)',
                      boxShadow: `0 10px 30px ${theme.palette.secondary.main}60`,
                      '& .MuiButton-endIcon': {
                        transform: 'translateX(5px)'
                      }
                    },
                    '& .MuiButton-endIcon': {
                      transition: 'transform 0.3s ease'
                    },
                    transition: 'all 0.3s ease'
                  }}
                  disabled={isCheckingAuth || status === 'loading'}
                >
                  {isCheckingAuth || status === 'loading' ? (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CircularProgress
                        size={20}
                        thickness={4}
                        sx={{
                          color: 'primary.main', // Force color
                          marginRight: '8px'
                        }}
                      />
                    </Box>
                  ) : (
                    'View All Games'
                  )}
                </Button>
              )}
            </>
          )}
        </Box>

        {/* Content Area */}
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              gap: 3,
              overflowX: 'auto',
              overflowY: 'hidden',
              scrollSnapType: 'x mandatory',
              msOverflowStyle: 'auto',
              scrollbarWidth: 'thin',
              alignItems: 'center'
            }}
          >
            {renderCardSkeleton()}
          </Box>
        ) : gameData.length > 0 ? (
          <Box
            sx={{
              display: 'flex',
              gap: 3,
              overflowX: 'auto',
              overflowY: 'hidden',
              scrollSnapType: 'x mandatory',
              msOverflowStyle: 'auto',
              scrollbarWidth: 'thin',
              alignItems: 'center'
            }}
          >
            {gameData.slice(0, 7).map(game => (
              <Box
                key={game._id}
                sx={{
                  flex: `0 0 ${cardWidth}px`,
                  scrollSnapAlign: 'start'
                }}
              >
                <Card
                  sx={{
                    width: cardWidth,
                    height: cardHeight,
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 4,
                    overflow: 'hidden',
                    bgcolor: 'background.paper',
                    boxShadow: `0 4px 20px ${theme.palette.secondary.main}15`,
                    border: '1px solid',
                    borderColor: `${theme.palette.secondary.main}20`,
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.error.main})`,
                      transform: 'scaleX(0)',
                      transformOrigin: 'left',
                      transition: 'transform 0.4s ease'
                    },
                    '&:hover': {
                      transform: 'translateY(-12px) scale(1.02)',
                      borderColor: theme.palette.secondary.main,
                      boxShadow: `0 25px 50px ${theme.palette.secondary.main}30`,
                      '&::before': {
                        transform: 'scaleX(1)'
                      },
                      '& .game-image': {
                        transform: 'scale(1.1)'
                      }
                    }
                  }}
                >
                  <Box 
                    sx={{ 
                      position: 'relative',
                      overflow: 'hidden',
                      height: 140,
                      bgcolor: `${theme.palette.secondary.main}10`
                    }}
                  >
                    <CardMedia
                      component='img'
                      className='game-image'
                      image={game?.thumbnailPoster || imagePlaceholder.src}
                      alt={game.title}
                      sx={{ 
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.4s ease'
                      }}
                      onError={e => {
                        e.target.src = imagePlaceholder.src
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.1) 100%)'
                      }}
                    />
                    <Chip
                      label="LIVE"
                      size="small"
                      icon={<Box component="span" sx={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: '50%', 
                        bgcolor: 'white',
                        animation: 'blink 1.5s ease-in-out infinite',
                        '@keyframes blink': {
                          '0%, 100%': { opacity: 1 },
                          '50%': { opacity: 0.3 }
                        }
                      }} />}
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        bgcolor: theme.palette.error.main,
                        color: 'white',
                        fontWeight: 800,
                        fontSize: '0.7rem',
                        letterSpacing: 1,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        '& .MuiChip-icon': {
                          color: 'white',
                          marginLeft: 1
                        }
                      }}
                    />
                  </Box>
                  <CardContent
                    sx={{
                      flexGrow: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      p: 3,
                      gap: 2
                    }}
                  >
                    <Typography 
                      variant='h6' 
                      fontWeight={700}
                      sx={{
                        fontSize: '1.1rem',
                        lineHeight: 1.3,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        minHeight: 50
                      }}
                    >
                      {game.title || 'Not Specified'}
                    </Typography>

                    <Typography
                      variant='body2'
                      color='text.secondary'
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.6,
                        fontSize: '0.875rem',
                        minHeight: 42,
                        mb: 'auto'
                      }}
                    >
                      {game.description || 'No description available'}
                    </Typography>

                    <Stack 
                      spacing={1.5}
                      sx={{
                        pt: 2,
                        borderTop: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <Stack direction='row' alignItems='center' spacing={1.5}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 2,
                            bgcolor: `${theme.palette.info.main}15`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <EventIcon sx={{ fontSize: 18, color: 'info.main' }} />
                        </Box>
                        <Typography 
                          variant='body2' 
                          fontWeight={600}
                          sx={{
                            fontSize: '0.8rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {formatGameDate(game.startTime)}
                        </Typography>
                      </Stack>

                      <Stack direction='row' alignItems='center' spacing={1.5}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 2,
                            bgcolor: `${theme.palette.warning.main}15`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <LocationOnIcon sx={{ fontSize: 18, color: 'warning.main' }} />
                        </Box>
                        <Typography 
                          variant='body2' 
                          fontWeight={600}
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {game?.location?.city || game?.location?.region || game?.location?.country || 'Anywhere'}
                        </Typography>
                      </Stack>

                      <Stack direction='row' alignItems='center' spacing={1.5}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 2,
                            bgcolor: `${theme.palette.success.main}15`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <EmojiEventsIcon sx={{ fontSize: 18, color: 'success.main' }} />
                        </Box>
                        <Typography 
                          variant='body2' 
                          fontWeight={600}
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {(() => {
                            if (!game?.rewards?.length) return 'No rewards'
                            const firstReward = [...game.rewards].sort((a, b) => a.position - b.position)[0]
                            const sponsor = firstReward?.sponsors?.[0]
                            const rewardType = sponsor?.rewardDetails?.rewardType

                            if (rewardType === 'cash') {
                              return new Intl.NumberFormat(undefined, {
                                style: 'currency',
                                currency: sponsor?.rewardDetails?.currency || 'INR'
                              }).format(firstReward.rewardValuePerWinner)
                            }

                            if (rewardType === 'physicalGift') {
                              return sponsor?.rewardDetails?.nonCashReward
                            }

                            return 'Custom Reward'
                          })()}
                        </Typography>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 8,
              textAlign: 'center'
            }}
          >
            <EmojiEventsIcon
              sx={{
                fontSize: 64,
                color: 'text.secondary',
                mb: 2
              }}
            />
            <Typography variant='h6' color='text.secondary' gutterBottom>
              No Games Available
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              We don't have any games at the moment. Check back later for exciting games!
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  )
}

export default LandingPageGamedata
