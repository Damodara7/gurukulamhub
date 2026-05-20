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
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import imagePlaceholder from '/public/images/misc/image-placeholder.png'
import { useRouter } from 'next/navigation'
import LanguageIcon from '@mui/icons-material/Language'
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks'
import { useSession } from 'next-auth/react'
import { QUIZ_LANDING_PREVIEW_LIMIT } from '@/constants/quizListPagination'
import { normalizeQuizListResult } from '@/utils/quizListApi'

function LandingPageQuizData({ isAuthenticated = false }) {
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
        const params = new URLSearchParams({
          approvalState: 'published',
          privacyFilter: 'PUBLIC',
          limit: String(QUIZ_LANDING_PREVIEW_LIMIT),
          page: '1'
        })
        const res = await RestApi.get(`${API_URLS.v0.USERS_QUIZ}?${params.toString()}`)
        if (res.status === 'success') {
          const { items } = normalizeQuizListResult(res?.result)
          setQuizData(items || [])
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

  const navigateWithAuth = path => {
    if (isAuthenticated || status === 'authenticated') {
      router.push(path)
    } else {
      router.push(`/auth/login?redirectTo=${encodeURIComponent(path.replace(/^\//, ''))}`)
    }
  }

  const handleQuizClick = quiz => {
    navigateWithAuth(`/publicquiz/play/${quiz._id}`)
  }

  // HANDLE VIEW ALL QUIZZES
  const handleViewAll = () => {
    setIsCheckingAuth(true)
    navigateWithAuth('/publicquiz/view')
  }

  // ========== RENDER CONDITIONS (AFTER HOOKS) ==========
  if (isRedirecting || status === 'loading') {
    return <Typography>Redirecting...</Typography> // Prevents flickering
  }

  if (error) return <Typography>Error: {error}</Typography>

  // Card dimensions styling constants - responsive
  const cardWidth = { xs: 260, sm: 280, md: 300 }
  const cardHeight = { xs: 300, sm: 320, md: 340 }

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
    return Array(4)
      .fill(0)
      .map((_, index) => (
        <Box
          key={`skeleton-${index}`}
          sx={{
            flex: { xs: `0 0 ${cardWidth.xs}px`, sm: `0 0 ${cardWidth.sm}px`, md: `0 0 ${cardWidth.md}px` },
            scrollSnapAlign: 'start',
            height: '100%'
          }}
        >
          <Card sx={{ 
            width: { xs: cardWidth.xs, sm: cardWidth.sm, md: cardWidth.md }, 
            height: { xs: cardHeight.xs, sm: cardHeight.sm, md: cardHeight.md }, 
            my: 2 
          }}>
            <Skeleton 
              variant='rectangular' 
              width="100%" 
              height={{ xs: 100, md: 120 }} 
            />
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
        py: { xs: 8, md: 12 },
        background: `linear-gradient(180deg, 
          ${theme.palette.background.paper} 0%, 
          ${theme.palette.primary.main}05 50%,
          ${theme.palette.background.default} 100%)`
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
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: { xs: 2, sm: 0 },
            mb: { xs: 3, md: 4 }
          }}
        >
          {loading ? (
            renderHeaderSkeletons()
          ) : (
            <>
              <Stack spacing={0.5}>
                <Typography
                  variant="overline"
                  sx={{
                    color: theme.palette.primary.main,
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    letterSpacing: 3
                  }}
                >
                  {isAuthenticated ? 'EXPLORE & LEARN' : 'TRENDING NOW'}
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
                      animation: 'bounce 2s ease-in-out infinite',
                      '@keyframes bounce': {
                        '0%, 100%': { transform: 'translateY(0)' },
                        '50%': { transform: 'translateY(-10px)' }
                      }
                    }}
                  >
                    🎯
                  </Box>
                  {isAuthenticated ? 'Recommended Quizzes' : 'Popular Quizzes'}
                </Typography>
              </Stack>

              {quizData.length > 0 && (
                <Button
                  variant='contained'
                  size='large'
                  component='label'
                  onClick={handleViewAll}
                  endIcon=                  {isCheckingAuth || status === 'loading' ? null : <Box component="span">→</Box>}
                  sx={{
                    fontWeight: 700,
                    px: { xs: 3, md: 4 },
                    py: { xs: 1.5, md: 2 },
                    borderRadius: 3,
                    textTransform: 'none',
                    fontSize: { xs: '0.9rem', md: '1.05rem' },
                    minWidth: { xs: 160, md: 180 },
                    width: { xs: '100%', sm: 'auto' },
                    bgcolor: theme.palette.primary.main,
                    color: 'white',
                    boxShadow: `0 6px 20px ${theme.palette.primary.main}40`,
                    '&:hover': {
                      bgcolor: theme.palette.primary.dark,
                      transform: 'translateY(-3px)',
                      boxShadow: `0 10px 30px ${theme.palette.primary.main}60`,
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
                          color: 'white',
                          marginRight: '8px'
                        }}
                      />
                    </Box>
                  ) : (
                    'View All Quizzes'
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
            {renderCardSkeletons()}
          </Box>
        ) : quizData.length > 0 ? (
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
            {quizData.map(quiz => (
              <Box
                key={quiz._id}
                sx={{
                  flex: { 
                    xs: `0 0 ${cardWidth.xs}px`, 
                    sm: `0 0 ${cardWidth.sm}px`, 
                    md: `0 0 ${cardWidth.md}px` 
                  },
                  scrollSnapAlign: 'start'
                }}
              >
                <Card
                  onClick={() => handleQuizClick(quiz)}
                  role='button'
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleQuizClick(quiz)
                    }
                  }}
                  sx={{
                    width: { xs: cardWidth.xs, sm: cardWidth.sm, md: cardWidth.md },
                    height: { xs: cardHeight.xs, sm: cardHeight.sm, md: cardHeight.md },
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 4,
                    overflow: 'hidden',
                    bgcolor: 'background.paper',
                    boxShadow: theme.palette.mode === 'dark'
                      ? `0 4px 20px ${theme.palette.primary.main}25`
                      : `0 4px 20px ${theme.palette.primary.main}15`,
                    border: '1px solid',
                    borderColor: theme.palette.mode === 'dark'
                      ? `${theme.palette.primary.main}30`
                      : `${theme.palette.primary.main}20`,
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
                      background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      transform: 'scaleX(0)',
                      transformOrigin: 'left',
                      transition: 'transform 0.4s ease'
                    },
                    '&:hover': {
                      transform: 'translateY(-12px) scale(1.02)',
                      borderColor: theme.palette.primary.main,
                      boxShadow: theme.palette.mode === 'dark'
                        ? `0 25px 50px ${theme.palette.primary.main}40`
                        : `0 25px 50px ${theme.palette.primary.main}30`,
                      '&::before': {
                        transform: 'scaleX(1)'
                      },
                      '& .quiz-image': {
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
                      bgcolor: `${theme.palette.primary.main}10`
                    }}
                  >
                    <CardMedia
                      component='img'
                      className='quiz-image'
                      image={quiz?.thumbnail || imagePlaceholder.src}
                      alt={quiz.title}
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
                      label="QUIZ"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        bgcolor: theme.palette.primary.main,
                        color: 'white',
                        fontWeight: 800,
                        fontSize: '0.7rem',
                        letterSpacing: 1,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
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
                      {quiz.title || 'No Title'}
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
                      {quiz.details || 'No details available'}
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
                            bgcolor: `${theme.palette.primary.main}15`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <LanguageIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                        </Box>
                        <Typography variant='body2' fontWeight={600}>
                          {quiz?.language?.name || 'No language'}
                        </Typography>
                      </Stack>

                      <Stack direction='row' alignItems='center' spacing={1.5}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 2,
                            bgcolor: `${theme.palette.secondary.main}15`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <LibraryBooksIcon sx={{ fontSize: 18, color: 'secondary.main' }} />
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
                          {quiz?.syllabus || 'No syllabus'}
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
            <LibraryBooksIcon
              sx={{
                fontSize: 64,
                color: 'text.secondary',
                mb: 2
              }}
            />
            <Typography variant='h6' color='text.secondary' gutterBottom>
              No Quizzes Available
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              We don't have any quizzes at the moment. Check back later for exciting quizzes!
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  )
}

export default LandingPageQuizData
