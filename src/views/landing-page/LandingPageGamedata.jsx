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
  CircularProgress
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

function LandingPageGamedata() {
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

    if (status === 'authenticated') {
      router.push('/public-games')
    } else {
      router.push(`/auth/login?redirectTo=public-games`)
      // Store intended destination before redirecting to sign-in
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
  const cardWidth = 230 // Slightly wider for better content display
  const cardHeight = 250

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
    return Array(7)
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
        backgroundColor: theme.palette.background.default,
        mt: 4
      }}
    >
      <Container
        maxWidth={false}
        sx={{
          position: 'relative'
        }}
      >
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: theme.palette.background.default,
            py: 0.5
          }}
        >
          {loading ? (
            renderHeaderSkeleton()
          ) : (
            <>
              <Typography variant='h5' fontWeight={600} sx={{ py: 1 }}>
                Popular Games
              </Typography>

              <Button
                variant='outlined'
                size='small'
                onClick={handleViewAll}
                sx={{
                  fontWeight: 600,
                  minWidth: 120, // Prevents button width collapse
                  position: 'relative' // Helps with spinner positioning
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
            </>
          )}
        </Box>

        {/* Horizontal scroll container Game Cards */}
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
          {loading
            ? renderCardSkeleton()
            : gameData.slice(0, 7).map(game => (
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
                      my: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.03)',
                        boxShadow: theme.shadows[6]
                      }
                    }}
                  >
                    <CardMedia
                      component='img'
                      height='100'
                      image={game?.thumbnailPoster || imagePlaceholder.src}
                      alt={game.title}
                      sx={{ objectFit: 'cover' }}
                      onError={e => {
                        e.target.src = imagePlaceholder.src
                      }}
                    />
                    <CardContent
                      sx={{
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      <Typography gutterBottom variant='h6' fontWeight={600} noWrap>
                        {game.title || 'Not Specified'}
                      </Typography>

                      <Typography
                        variant='caption'
                        color='text.secondary'
                        sx={{
                          height: 20,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {game.description || 'No description available'}
                      </Typography>

                      <Box>
                        <Stack spacing={0.25}>
                          <Stack direction='row' alignItems='center' spacing={1}>
                            <EventIcon fontSize='small' color='action' />
                            <Typography variant='body2'>{formatGameDate(game.startTime)}</Typography>
                          </Stack>

                          <Stack direction='row' alignItems='center' spacing={1}>
                            <LocationOnIcon fontSize='small' color='action' />
                            <Typography variant='body2'>
                              {game?.location?.city || game?.location?.region || game?.location?.country || 'Any Where'}
                            </Typography>
                          </Stack>

                          <Stack direction='row' alignItems='center' spacing={1}>
                            <EmojiEventsIcon fontSize='small' color='action' />
                            <Typography variant='body2'>
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
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              ))}
        </Box>
      </Container>
    </Box>
  )
}

export default LandingPageGamedata
