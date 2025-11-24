'use client'
import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  IconButton,
  useTheme,
  alpha,
  Skeleton,
  Fade,
  Divider
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { useRouter } from 'next/navigation'
import imagePlaceholder from '/public/images/misc/image-placeholder.png'

export default function ViewPublicQuizzes() {
  const router = useRouter()
  const theme = useTheme()
  const [publishedQuizzes, setPublishedQuizzes] = useState([])
  const [filteredQuizzes, setFilteredQuizzes] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [hoveredCard, setHoveredCard] = useState(null)

  async function handlePlayQuiz(quiz) {
    router.push(`/publicquiz/play/${quiz._id}`)
  }

  async function getPublishedQuizzes() {
    setLoading(true)
    const result = await RestApi.get(`${API_URLS.v0.USERS_QUIZ}?approvalState=published&privacyFilter=PUBLIC`)
    if (result?.status === 'success') {
      setLoading(false)
      setPublishedQuizzes(result.result)
      setFilteredQuizzes(result.result)
    } else {
      setLoading(false)
      setPublishedQuizzes([])
      setFilteredQuizzes([])
    }
  }

  useEffect(() => {
    getPublishedQuizzes()
  }, [])

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredQuizzes(publishedQuizzes)
    } else {
      const filtered = publishedQuizzes.filter(
        quiz =>
          quiz.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          quiz.details?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          quiz.syllabus?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredQuizzes(filtered)
    }
  }, [searchQuery, publishedQuizzes])

  const renderSkeletonCards = () => {
    return Array(9)
      .fill(0)
      .map((_, index) => (
        <Grid item xs={12} sm={6} md={4} key={`skeleton-${index}`}>
          <Card sx={{ 
            height: { xs: 'auto', sm: 420, md: 440 },
            minHeight: { xs: 400, sm: 420, md: 440 },
            borderRadius: 4, 
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper'
          }}>
            <Skeleton 
              variant='rectangular' 
              height={{ xs: 180, sm: 200, md: 240 }}
              sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
            />
            <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
              <Stack spacing={1}>
                <Skeleton variant='rounded' width={100} height={28} />
                <Skeleton variant='text' width='90%' height={28} sx={{ mt: 2 }} />
                <Skeleton variant='text' width='75%' height={24} />
                <Skeleton variant='text' width='85%' height={20} sx={{ mt: 2 }} />
                <Skeleton variant='text' width='65%' height={20} />
                <Skeleton variant='rectangular' width='100%' height={{ xs: 44, md: 52 }} sx={{ mt: 3, borderRadius: 3 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))
  }

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        background: `radial-gradient(circle at 20% 20%, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 50%),
                     radial-gradient(circle at 80% 80%, ${alpha(theme.palette.secondary.main, 0.05)} 0%, transparent 50%),
                     ${theme.palette.background.default}`
      }}
    >
      {/* Elegant Header */}
      <Box
        sx={{
          backdropFilter: 'blur(20px)',
          bgcolor: theme.palette.mode === 'dark'
            ? alpha(theme.palette.background.paper, 0.8)
            : alpha(theme.palette.background.paper, 0.7),
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.15 : 0.08)}`,
          pt: { xs: 4, sm: 5, md: 8 },
          pb: { xs: 4, sm: 5, md: 8 }
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={{ xs: 3, sm: 4, md: 5 }} alignItems="center">
            {/* Elegant Title */}
            <Box sx={{ textAlign: 'center', px: { xs: 2, sm: 0 } }}>
              <Typography
                sx={{
                  fontSize: { xs: '2rem', sm: '2.75rem', md: '3.5rem' },
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: { xs: 1.5, md: 2 },
                  letterSpacing: '-0.02em'
                }}
              >
                Quiz Collection
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary"
                sx={{ 
                  fontSize: { xs: '0.9rem', sm: '1rem', md: '1.05rem' },
                  lineHeight: 1.8,
                  maxWidth: 600,
                  mx: 'auto',
                  fontWeight: 400,
                  px: { xs: 2, sm: 0 }
                }}
              >
                Curated quizzes designed to challenge and inspire
              </Typography>
            </Box>

            {/* Glass Search Bar */}
            <Box sx={{ maxWidth: 600, width: '100%', px: { xs: 2, sm: 0 } }}>
              <Box
                sx={{
                  backdropFilter: 'blur(10px)',
                  bgcolor: theme.palette.mode === 'dark'
                    ? alpha(theme.palette.background.paper, 0.6)
                    : alpha(theme.palette.background.paper, 0.6),
                  border: `1px solid ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.25 : 0.15)}`,
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  '&:focus-within': {
                    borderColor: theme.palette.primary.main,
                    bgcolor: theme.palette.mode === 'dark'
                      ? alpha(theme.palette.background.paper, 0.9)
                      : alpha(theme.palette.background.paper, 0.9),
                    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.12)}`
                  }
                }}
              >
                <TextField
                  fullWidth
                  placeholder="Search quizzes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ 
                          color: theme.palette.primary.main, 
                          fontSize: { xs: 20, md: 22 } 
                        }} />
                      </InputAdornment>
                    ),
                    endAdornment: searchQuery && (
                      <InputAdornment position="end">
                        <IconButton 
                          size="small" 
                          onClick={() => setSearchQuery('')}
                          sx={{ color: 'text.secondary' }}
                        >
                          <Box sx={{ fontSize: '1rem' }}>✕</Box>
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: {
                      '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                      py: { xs: 1.25, md: 1.5 },
                      px: { xs: 1.5, md: 2 },
                      fontSize: { xs: '0.9rem', md: '1rem' }
                    }
                  }}
                />
              </Box>
              
              {searchQuery && (
                <Fade in>
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ 
                      mt: 1.5, 
                      display: 'block',
                      textAlign: 'center',
                      fontSize: '0.875rem'
                    }}
                  >
                    {filteredQuizzes.length} result{filteredQuizzes.length !== 1 ? 's' : ''}
                  </Typography>
                </Fade>
              )}
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* Quiz Cards */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, sm: 5, md: 8 }, px: { xs: 2, sm: 3, md: 4 } }}>
        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
          {loading ? (
            renderSkeletonCards()
          ) : filteredQuizzes.length > 0 ? (
            filteredQuizzes.map((quiz, index) => (
              <Grid item xs={12} sm={6} md={4} key={quiz._id}>
                <Fade in timeout={200 + index * 40}>
                  <Card
                    onMouseEnter={() => setHoveredCard(quiz._id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    sx={{
                      height: { xs: 'auto', sm: 420, md: 440 },
                      minHeight: { xs: 400, sm: 420, md: 440 },
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: { xs: 3, md: 4 },
                      overflow: 'hidden',
                      backdropFilter: 'blur(20px)',
                      bgcolor: theme.palette.mode === 'dark'
                        ? alpha(theme.palette.background.paper, 0.9)
                        : alpha(theme.palette.background.paper, 0.9),
                      border: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.2 : 0.1)}`,
                      boxShadow: hoveredCard === quiz._id
                        ? `0 16px 48px ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.25 : 0.15)}`
                        : theme.palette.mode === 'dark'
                        ? '0 2px 12px rgba(0,0,0,0.3)'
                        : '0 2px 12px rgba(0,0,0,0.04)',
                      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer',
                      transform: hoveredCard === quiz._id ? 'translateY(-8px)' : 'translateY(0)',
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        borderRadius: { xs: 3, md: 4 },
                        padding: '1px',
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        WebkitMaskComposite: 'xor',
                        maskComposite: 'exclude',
                        opacity: hoveredCard === quiz._id ? 0.6 : 0,
                        transition: 'opacity 0.5s ease'
                      }
                    }}
                    onClick={() => handlePlayQuiz(quiz)}
                  >
                    {/* Image with Glass Effect */}
                    <Box 
                      sx={{ 
                        position: 'relative',
                        height: { xs: 180, sm: 200, md: 240 },
                        overflow: 'hidden',
                        bgcolor: alpha(theme.palette.primary.main, 0.02)
                      }}
                    >
                      <CardMedia
                        component="img"
                        image={quiz?.thumbnail || imagePlaceholder.src}
                        alt={quiz.title}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'all 0.6s ease',
                          transform: hoveredCard === quiz._id ? 'scale(1.08)' : 'scale(1)',
                          filter: hoveredCard === quiz._id ? 'brightness(0.9)' : 'brightness(1)'
                        }}
                        onError={(e) => {
                          e.target.src = imagePlaceholder.src
                        }}
                      />

                      {/* Play Overlay */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: alpha('#000', hoveredCard === quiz._id ? 0.25 : 0),
                          transition: 'background-color 0.4s ease'
                        }}
                      >
                        <Box
                          sx={{
                            width: { xs: 56, md: 64 },
                            height: { xs: 56, md: 64 },
                            borderRadius: '50%',
                            backdropFilter: 'blur(10px)',
                            bgcolor: theme.palette.mode === 'dark'
                              ? alpha(theme.palette.background.paper, 0.95)
                              : alpha(theme.palette.background.paper, 0.95),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: theme.palette.mode === 'dark'
                              ? '0 8px 32px rgba(0,0,0,0.5)'
                              : '0 8px 32px rgba(0,0,0,0.2)',
                            border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                            opacity: hoveredCard === quiz._id ? 1 : 0,
                            transform: hoveredCard === quiz._id ? 'scale(1)' : 'scale(0.8)',
                            transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                          }}
                        >
                          <PlayArrowIcon 
                            sx={{ 
                              fontSize: { xs: 28, md: 32 },
                              color: theme.palette.primary.main,
                              ml: 0.5
                            }} 
                          />
                        </Box>
                      </Box>

                      {/* Elegant Badge */}
                      <Chip
                        label="QUIZ"
                        icon={<AutoAwesomeIcon sx={{ fontSize: { xs: 10, md: 12 } }} />}
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: { xs: 12, md: 16 },
                          left: { xs: 12, md: 16 },
                          backdropFilter: 'blur(10px)',
                          bgcolor: theme.palette.mode === 'dark'
                            ? alpha(theme.palette.background.paper, 0.95)
                            : alpha(theme.palette.background.paper, 0.95),
                          color: theme.palette.primary.main,
                          fontWeight: 700,
                          fontSize: { xs: '0.65rem', md: '0.7rem' },
                          height: { xs: 24, md: 26 },
                          letterSpacing: 1,
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                          boxShadow: theme.palette.mode === 'dark'
                            ? '0 2px 8px rgba(0,0,0,0.3)'
                            : '0 2px 8px rgba(0,0,0,0.08)',
                          '& .MuiChip-icon': {
                            color: theme.palette.primary.main
                          }
                        }}
                      />
                    </Box>

                    {/* Content */}
                    <CardContent 
                      sx={{ 
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        p: { xs: 2.5, sm: 3, md: 3.5 }
                      }}
                    >
                      {/* Category Tag */}
                      {quiz?.syllabus && (
                        <Chip
                          label={quiz.syllabus}
                          size="small"
                          sx={{
                            width: 'fit-content',
                            height: 24,
                            fontSize: '0.7rem',
                            bgcolor: alpha(theme.palette.secondary.main, 0.08),
                            color: 'secondary.main',
                            fontWeight: 600,
                            borderRadius: 1.5,
                            mb: 2,
                            border: `1px solid ${alpha(theme.palette.secondary.main, 0.15)}`
                          }}
                        />
                      )}

                      {/* Title */}
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          fontSize: { xs: '1rem', sm: '1.1rem', md: '1.15rem' },
                          lineHeight: 1.35,
                          color: 'text.primary',
                          mb: { xs: 1, md: 1.5 },
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          minHeight: { xs: 44, md: 50 }
                        }}
                      >
                        {quiz.title || 'Untitled Quiz'}
                      </Typography>

                      {/* Description */}
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: { xs: '0.8rem', md: '0.875rem' },
                          lineHeight: 1.7,
                          color: 'text.secondary',
                          mb: 'auto',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          minHeight: { xs: 57, md: 63 }
                        }}
                      >
                        {quiz.details || 'An engaging quiz to test and expand your knowledge'}
                      </Typography>

                      {/* Divider */}
                      <Divider sx={{ 
                        my: { xs: 2, md: 2.5 }, 
                        opacity: theme.palette.mode === 'dark' ? 0.2 : 0.4 
                      }} />

                      {/* Meta Row */}
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: { xs: 2, md: 2.5 } }}>
                        {quiz?.language?.name && (
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: 'text.secondary', 
                              fontSize: { xs: '0.75rem', md: '0.8rem' } 
                            }}
                          >
                            📚 {quiz.language.name}
                          </Typography>
                        )}
                      </Stack>

                      {/* Play Button */}
                      <Button
                        variant="contained"
                        component='label'
                        fullWidth
                        startIcon={<PlayArrowIcon sx={{ fontSize: { xs: 18, md: 20 } }} />}
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePlayQuiz(quiz)
                        }}
                        sx={{
                          py: { xs: 1.25, md: 1.5 },
                          fontWeight: 600,
                          fontSize: { xs: '0.875rem', md: '0.95rem' },
                          color: 'white',
                          textTransform: 'none',
                          borderRadius: { xs: 2, md: 2.5 },
                          background: hoveredCard === quiz._id
                            ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
                            : theme.palette.primary.main,
                          boxShadow: hoveredCard === quiz._id
                            ? `0 8px 24px ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.4 : 0.35)}`
                            : 'none',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.4 : 0.35)}`
                          }
                        }}
                      >
                        Start Quiz
                      </Button>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  py: { xs: 8, md: 12 },
                  px: { xs: 2, md: 3 },
                  backdropFilter: 'blur(10px)',
                  bgcolor: theme.palette.mode === 'dark'
                    ? alpha(theme.palette.background.paper, 0.6)
                    : alpha(theme.palette.background.paper, 0.6),
                  borderRadius: 4,
                  border: `2px dashed ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.3 : 0.2)}`
                }}
              >
                <Box
                  sx={{
                    fontSize: { xs: '3rem', md: '4rem' },
                    mb: { xs: 1.5, md: 2 },
                    opacity: 0.7
                  }}
                >
                  📚
                </Box>
                <Typography
                  sx={{
                    fontSize: { xs: '1.5rem', md: '1.75rem' },
                    fontWeight: 700,
                    color: 'text.primary',
                    mb: 1,
                    textAlign: 'center'
                  }}
                >
                  {searchQuery ? 'No Matches' : 'No Quizzes Yet'}
                </Typography>
                <Typography 
                  variant="body1" 
                  color="text.secondary"
                  textAlign="center"
                  sx={{ 
                    maxWidth: 400, 
                    lineHeight: 1.7,
                    fontSize: { xs: '0.875rem', md: '1rem' },
                    px: { xs: 2, md: 0 }
                  }}
                >
                  {searchQuery
                    ? `No quizzes found for "${searchQuery}"`
                    : 'Our collection is being curated'}
                </Typography>
                {searchQuery && (
                  <Button
                    variant="outlined"
                    onClick={() => setSearchQuery('')}
                    sx={{
                      mt: { xs: 2, md: 3 },
                      px: { xs: 2.5, md: 3 },
                      py: { xs: 0.75, md: 1 },
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: { xs: '0.875rem', md: '1rem' },
                      borderWidth: 1.5,
                      '&:hover': {
                        borderWidth: 1.5
                      }
                    }}
                  >
                    Clear Search
                  </Button>
                )}
              </Box>
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  )
}
