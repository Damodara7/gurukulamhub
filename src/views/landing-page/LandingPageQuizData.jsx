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
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import imagePlaceholder from '/public/images/misc/image-placeholder.png'
import { useRouter } from 'next/navigation'
import LanguageIcon from '@mui/icons-material/Language'
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks'
import { useSession } from 'next-auth/react'

function LandingPageQuizData() {
  const [quizData, setQuizData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const theme = useTheme()
  const router = useRouter()
  const { data: session, status } = useSession()
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'))

  // DATA FETCHING
  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const res = await RestApi.get(`${API_URLS.v0.USERS_QUIZ}`)
        if (res.status === 'success') {
          // console.log('quiz data', res.result)
          setQuizData(res?.result || [])
        } else {
          setError(res.message)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchQuizData()
  }, [])

  // HANDLE VIEW ALL QUIZZES
  const handleViewAll = async () => {
    setIsCheckingAuth(true)
    if (status === 'authenticated') {
      router.push('/publicquiz/view')
    } else {
      router.push(`/auth/login?redirectTo=publicquiz/view`)
    }
  }

  // ========== RENDER CONDITIONS (AFTER HOOKS) ==========
  if (isRedirecting || status === 'loading') {
    return <Typography>Redirecting...</Typography> // Prevents flickering
  }

  if (error) return <Typography>Error: {error}</Typography>

  // Card dimensions styling constants
  const cardWidth = 230
  const cardHeight = 250

  // Skeleton loading components
  const renderHeaderSkeletons = () => (
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

  const renderCardSkeletons = () => {
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
        backgroundColor: theme.palette.background.default
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
            renderHeaderSkeletons()
          ) : (
            <>
              <Typography variant='h5' fontWeight={600} sx={{ py: 1 }}>
                Popular Quizzes
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
                                'View All Quizzes'
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
          {
            loading ? renderCardSkeletons():(
              quizData.slice(0, 7).map(quiz => (
                <Box
                  key={quiz._id}
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
                      my:2,
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
                      image={quiz?.thumbnail || imagePlaceholder.src}
                      alt={quiz.title}
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
                        {quiz.title || 'No Title'}
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
                        {quiz.details || 'No details available'}
                      </Typography>
    
                      <Box>
                        <Stack spacing={0.25}>
                          <Stack direction='row' alignItems='center' spacing={1}>
                            <LanguageIcon fontSize='small' color='action' />
                            <Typography variant='body2'>{quiz?.language?.name || 'No language'}</Typography>
                          </Stack>
    
                          <Stack direction='row' alignItems='center' spacing={1}>
                            <LibraryBooksIcon fontSize='small' color='action' />
                            <Typography variant='body2'>{quiz?.syllabus || 'No syllabus'}</Typography>
                          </Stack>
                        </Stack>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              ))
            )
          }
        </Box>
      </Container>
    </Box>
  )
}

export default LandingPageQuizData
