'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Box, TextField, Button, Typography, Alert, Collapse, useMediaQuery, alpha } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { keyframes } from '@mui/system'
import { Close } from '@mui/icons-material'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import IconButtonTooltip from '@/components/IconButtonTooltip'

const floatAnimation = keyframes`
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.35;
  }
  33% {
    transform: translate(calc(-50% + 12px), calc(-50% + 18px)) scale(1.05);
    opacity: 0.6;
  }
  66% {
    transform: translate(calc(-50% - 10px), calc(-50% + 24px)) scale(0.92);
    opacity: 0.8;
  }
`

const twinkleAnimation = keyframes`
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.25;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.6);
    opacity: 1;
  }
`

const waveAnimation = keyframes`
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
`

const SHAPE_TYPES = [
  'square',
  'triangle',
  'hexagon',
  'diamond',
  'cylinder',
  'cone',
  'sphere',
  'cube',
  'pyramid',
  'ring',
  'star',
  'octagon',
  'pentagon'
]

const QuizIdInputForm = ({ mode = 'play' }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'))
  const isDesktop = useMediaQuery(theme.breakpoints.between('md', 'lg'))
  const isLargeDesktop = useMediaQuery(theme.breakpoints.up('xl'))
  const isDarkMode = theme.palette.mode === 'dark'

  const [quizId, setQuizId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const shapes = useMemo(
    () =>
      Array.from({ length: 15 }, (_, index) => {
        const baseSize = isMobile ? 20 : isTablet ? 24 : isDesktop ? 28 : 32
        const size = baseSize + (index % 4) * (isMobile ? 8 : isTablet ? 10 : 12)
        return {
          id: `shape-${index}`,
          type: SHAPE_TYPES[index % SHAPE_TYPES.length],
          size,
          left: `${((index * 17) % 80) + 10}%`,
          top: `${((index * 23) % 70) + 15}%`,
          duration: 9 + (index % 5) * 1.8,
          delay: index * 0.35,
          opacity: 0.4 + (index % 3) * 0.15
        }
      }),
    [isMobile, isTablet, isDesktop]
  )

  const stars = useMemo(
    () =>
      Array.from({ length: 24 }, (_, index) => ({
        id: `sparkle-${index}`,
        size: (isMobile ? 2 : isTablet ? 2.5 : 3) + (index % 3) * (isMobile ? 1.5 : 2),
        left: `${((index * 29) % 94) + 3}%`,
        top: `${((index * 37) % 92) + 4}%`,
        duration: 1.4 + (index % 4) * 0.6,
        delay: index * 0.22
      })),
    [isMobile, isTablet]
  )

  const activeShapes = shapes.slice(
    0,
    isMobile ? 6 : isTablet ? 8 : isDesktop ? 12 : shapes.length
  )
  const activeStars = stars.slice(
    0,
    isMobile ? 8 : isTablet ? 12 : isDesktop ? 18 : stars.length
  )

  const isValidObjectId = id => /^[0-9a-fA-F]{24}$/.test(id)

  const fetchQuizData = async currentQuizId => {
    try {
      const response = await RestApi.get(`${API_URLS.v0.USERS_QUIZ}/${currentQuizId}`)
      return response
    } catch (fetchError) {
      console.error('Error fetching quiz data:', fetchError)
      throw fetchError
    }
  }

  const handleSubmit = async event => {
    event.preventDefault()
    if (loading) return

    setError('')
    setLoading(true)

    try {
      if (!quizId.trim()) {
        throw new Error('Please enter a valid Quiz ID')
      }

      if (!isValidObjectId(quizId)) {
        throw new Error('Invalid Quiz ID')
      }

      const quizDataRes = await fetchQuizData(quizId)
      if (quizDataRes?.status !== 'success') {
        throw new Error('Invalid Quiz ID')
      }

      // Redirect if all checks pass
      router.push(`/publicquiz/play/${quizId}`)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  const renderShapeContent = ({ type, size }) => {
    const primaryColor = theme.palette.primary.main
    const secondaryColor = theme.palette.secondary?.main || theme.palette.primary.light
    const borderOpacity = isDarkMode ? 0.5 : 0.35
    const bgOpacity = isDarkMode ? 0.6 : 0.45
    const lightBgOpacity = isDarkMode ? 0.5 : 0.35
    const shadowOpacity = isDarkMode ? 0.5 : 0.35
    const whiteAlpha = alpha(theme.palette.common.white, borderOpacity)
    const primaryGradient = `linear-gradient(135deg, ${alpha(primaryColor, bgOpacity)}, ${alpha(secondaryColor, bgOpacity)})`
    const defaultGradient = 'linear-gradient(135deg, rgba(102,126,234,0.45), rgba(240,147,251,0.45))'

    switch (type) {
      case 'square':
        return (
          <Box
            component='span'
            sx={{
              display: 'block',
              width: '100%',
              height: '100%',
              borderRadius: '8px',
              background: isDarkMode ? primaryGradient : defaultGradient,
              border: `2px solid ${whiteAlpha}`,
              boxShadow: `0 4px 12px ${alpha(primaryColor, shadowOpacity)}`
            }}
          />
        )
      case 'triangle':
        return (
          <Box
            component='span'
            sx={{
              display: 'block',
              width: 0,
              height: 0,
              borderLeft: `${size / 2}px solid transparent`,
              borderRight: `${size / 2}px solid transparent`,
              borderBottom: `${size}px solid ${isDarkMode ? alpha(primaryColor, bgOpacity) : 'rgba(102, 126, 234, 0.45)'}`,
              filter: `drop-shadow(0 0 10px ${alpha(secondaryColor, 0.55)})`
            }}
          />
        )
      case 'hexagon':
        return (
          <Box
            component='span'
            sx={{
              display: 'block',
              width: '100%',
              height: '100%',
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              background: isDarkMode ? alpha(secondaryColor, lightBgOpacity) : 'rgba(240, 147, 251, 0.35)',
              border: `2px solid ${whiteAlpha}`
            }}
          />
        )
      case 'diamond':
        return (
          <Box
            component='span'
            sx={{
              display: 'block',
              width: '100%',
              height: '100%',
              transform: 'rotate(45deg)',
              borderRadius: '10%',
              background: isDarkMode ? primaryGradient : defaultGradient,
              border: `2px solid ${whiteAlpha}`
            }}
          />
        )
      case 'cylinder':
        return (
          <Box
            component='span'
            sx={{
              display: 'block',
              width: '100%',
              height: '100%',
              borderRadius: `${size / 2}px`,
              background: isDarkMode
                ? `linear-gradient(90deg, ${alpha(primaryColor, 0.2)}, ${alpha(primaryColor, 0.65)}, ${alpha(primaryColor, 0.2)})`
                : 'linear-gradient(90deg, rgba(102,126,234,0.2), rgba(102,126,234,0.65), rgba(102,126,234,0.2))',
              border: `2px solid ${alpha(theme.palette.common.white, borderOpacity - 0.1)}`,
              boxShadow: isDarkMode
                ? `inset -6px 0 10px ${alpha(theme.palette.common.black, 0.3)}, 0 0 18px ${alpha(primaryColor, shadowOpacity + 0.1)}`
                : 'inset -6px 0 10px rgba(0,0,0,0.25), 0 0 18px rgba(118,75,162,0.45)'
            }}
          />
        )
      case 'cone':
        return (
          <Box
            component='span'
            sx={{
              display: 'block',
              width: 0,
              height: 0,
              borderLeft: `${size / 2}px solid transparent`,
              borderRight: `${size / 2}px solid transparent`,
              borderBottom: `${size}px solid ${isDarkMode ? alpha(secondaryColor, bgOpacity + 0.05) : 'rgba(240, 147, 251, 0.5)'}`,
              filter: `drop-shadow(0 0 14px ${alpha(secondaryColor, 0.6)})`
            }}
          />
        )
      case 'sphere':
        return (
          <Box
            component='span'
            sx={{
              display: 'block',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: isDarkMode
                ? `radial-gradient(circle at 30% 30%, ${alpha(theme.palette.common.white, 0.7)}, ${alpha(primaryColor, 0.65)}, ${alpha(primaryColor, 0.25)})`
                : 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.75), rgba(102,126,234,0.65), rgba(102,126,234,0.25))',
              boxShadow: isDarkMode
                ? `0 8px 18px ${alpha(primaryColor, shadowOpacity + 0.1)}, inset -10px -10px 18px ${alpha(theme.palette.common.black, 0.3)}`
                : '0 8px 18px rgba(102,126,234,0.45), inset -10px -10px 18px rgba(0,0,0,0.25)'
            }}
          />
        )
      case 'cube':
        return (
          <Box
            component='span'
            sx={{
              display: 'block',
              width: '100%',
              height: '100%',
              borderRadius: '12%',
              background: isDarkMode ? alpha(primaryColor, bgOpacity + 0.03) : 'rgba(102,126,234,0.48)',
              border: `2px solid ${whiteAlpha}`,
              boxShadow: isDarkMode
                ? `${size / 4}px ${size / 4}px 0 ${alpha(secondaryColor, 0.4)}, ${size / 2}px ${size / 2}px 0 ${alpha(primaryColor, 0.3)}`
                : `${size / 4}px ${size / 4}px 0 rgba(240,147,251,0.4), ${size / 2}px ${size / 2}px 0 rgba(118,75,162,0.3)`
            }}
          />
        )
      case 'pyramid':
        return (
          <Box
            component='span'
            sx={{
              display: 'block',
              width: 0,
              height: 0,
              borderLeft: `${size / 2}px solid transparent`,
              borderRight: `${size / 2}px solid transparent`,
              borderBottom: `${size}px solid ${isDarkMode ? alpha(primaryColor, bgOpacity) : 'rgba(102, 126, 234, 0.45)'}`,
              filter: `drop-shadow(4px 6px 12px ${alpha(secondaryColor, shadowOpacity + 0.1)})`
            }}
          />
        )
      case 'ring':
        return (
          <Box
            component='span'
            sx={{
              display: 'block',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: `${Math.max(size * 0.18, 4)}px solid ${isDarkMode ? alpha(secondaryColor, bgOpacity + 0.1) : 'rgba(240,147,251,0.55)'}`,
              background: 'transparent',
              boxShadow: isDarkMode
                ? `0 0 18px ${alpha(secondaryColor, bgOpacity + 0.1)}, inset 0 0 18px ${alpha(primaryColor, 0.3)}`
                : '0 0 18px rgba(240,147,251,0.55), inset 0 0 18px rgba(102,126,234,0.3)'
            }}
          />
        )
      case 'star':
        return (
          <Box
            component='span'
            sx={{
              display: 'block',
              width: '100%',
              height: '100%',
              clipPath:
                'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
              background: isDarkMode
                ? `linear-gradient(135deg, ${alpha(secondaryColor, bgOpacity + 0.15)}, ${alpha(primaryColor, bgOpacity + 0.15)})`
                : 'linear-gradient(135deg, rgba(240,147,251,0.6), rgba(102,126,234,0.6))',
              filter: `drop-shadow(0 0 16px ${alpha(secondaryColor, 0.75)})`
            }}
          />
        )
      case 'octagon':
        return (
          <Box
            component='span'
            sx={{
              display: 'block',
              width: '100%',
              height: '100%',
              clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
              background: isDarkMode ? alpha(primaryColor, bgOpacity + 0.05) : 'rgba(102,126,234,0.5)',
              border: `2px solid ${whiteAlpha}`,
              boxShadow: `0 4px 12px ${alpha(primaryColor, shadowOpacity + 0.05)}`
            }}
          />
        )
      case 'pentagon':
        return (
          <Box
            component='span'
            sx={{
              display: 'block',
              width: '100%',
              height: '100%',
              clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
              background: isDarkMode
                ? `linear-gradient(135deg, ${alpha(secondaryColor, bgOpacity + 0.05)}, ${alpha(primaryColor, bgOpacity + 0.05)})`
                : 'linear-gradient(135deg, rgba(240,147,251,0.5), rgba(102,126,234,0.5))',
              border: `2px solid ${whiteAlpha}`
            }}
          />
        )
      default:
        return null
    }
  }

  return (
    <Box
      component='section'
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: { xs: '100dvh', sm: '100vh' },
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        px: { xs: 1.5, sm: 2, md: 3, lg: 4 },
        py: { xs: 4, sm: 6, md: 7, lg: 8 },
        background: isDarkMode
          ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: { xs: '-18%', sm: '-12%', md: '-10%' },
            right: { xs: '-30%', sm: '-18%', md: '-15%' },
            width: { xs: '55%', sm: '38%', md: '35%', lg: '32%' },
            aspectRatio: '1',
            borderRadius: '50%',
            background: isDarkMode
              ? alpha(theme.palette.primary.light, 0.2)
              : 'rgba(255, 255, 255, 0.12)',
            filter: 'blur(60px)'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: { xs: '-22%', sm: '-15%', md: '-12%' },
            left: { xs: '-28%', sm: '-16%', md: '-14%' },
            width: { xs: '60%', sm: '40%', md: '38%', lg: '35%' },
            aspectRatio: '1',
            borderRadius: '50%',
            background: isDarkMode
              ? alpha(theme.palette.secondary?.main || theme.palette.primary.main, 0.15)
              : 'rgba(255, 255, 255, 0.1)',
            filter: 'blur(65px)'
          }}
        />

        {activeShapes.map(shape => (
          <Box
            key={shape.id}
            sx={{
              position: 'absolute',
              left: shape.left,
              top: shape.top,
              width: `${shape.size}px`,
              height: `${shape.size}px`,
              transform: 'translate(-50%, -50%)',
              opacity: shape.opacity,
              animation: `${floatAnimation} ${shape.duration}s ease-in-out infinite`,
              animationDelay: `${shape.delay}s`,
              willChange: 'transform, opacity'
            }}
          >
            {renderShapeContent(shape)}
          </Box>
        ))}

        {activeStars.map(star => (
          <Box
            key={star.id}
            sx={{
              position: 'absolute',
              left: star.left,
              top: star.top,
              width: `${star.size}px`,
              height: `${star.size}px`,
              borderRadius: '50%',
              background: isDarkMode
                ? alpha(theme.palette.common.white, 0.9)
                : 'rgba(255,255,255,0.95)',
              boxShadow: isDarkMode
                ? `0 0 ${star.size * 2}px ${alpha(theme.palette.primary.light, 0.6)}`
                : '0 0 12px rgba(255, 255, 255, 0.75)',
              transform: 'translate(-50%, -50%)',
              animation: `${twinkleAnimation} ${star.duration}s ease-in-out infinite`,
              animationDelay: `${star.delay}s`,
              willChange: 'transform, opacity'
            }}
          />
        ))}

        {[20, 50, 78].map((position, index) => (
          <Box
            key={`wave-${index}`}
            sx={{
              position: 'absolute',
              left: 0,
              top: `${position}%`,
              width: '100%',
              height: { xs: '2px', sm: '3px' },
              background: isDarkMode
                ? `linear-gradient(90deg, transparent, ${alpha(theme.palette.common.white, 0.2 - index * 0.06)}, transparent)`
                : `linear-gradient(90deg, transparent, rgba(255,255,255,${0.3 - index * 0.08}), transparent)`,
              animation: `${waveAnimation} ${5.5 + index * 1.4}s linear infinite`,
              animationDelay: `${index * 0.6}s`,
              opacity: 0.75 - index * 0.2
            }}
          />
        ))}
      </Box>

      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: { xs: 'min(100%, 420px)', sm: '440px', md: '460px', lg: '480px', xl: '500px' },
          mx: 'auto'
        }}
      >
        <Typography
          variant='h2'
          sx={{
            color: theme.palette.common.white,
            fontWeight: 700,
            textAlign: 'center',
            mb: { xs: 1, sm: 1.25, md: 1.5 },
            fontSize: {
              xs: 'clamp(1.75rem, 6vw, 2.2rem)',
              sm: 'clamp(2rem, 4vw, 2.4rem)',
              md: 'clamp(2.2rem, 3vw, 2.6rem)',
              lg: 'clamp(2.3rem, 2.5vw, 2.8rem)'
            },
            letterSpacing: '0.02em',
            textShadow: isDarkMode
              ? `0 2px 8px ${alpha(theme.palette.common.black, 0.3)}`
              : '0 2px 4px rgba(0,0,0,0.15)'
          }}
        >
          GurukulamHub
        </Typography>
        <Typography
          variant='body1'
          sx={{
            color: alpha(theme.palette.common.white, 0.95),
            textAlign: 'center',
            mb: { xs: 2.5, sm: 3, md: 3.5, lg: 4 },
            fontSize: { xs: '0.95rem', sm: '1rem', md: '1.05rem', lg: '1.1rem' }
          }}
        >
          Enter Quiz ID to Start
        </Typography>

        <Box
          component='form'
          noValidate
          onSubmit={handleSubmit}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: { xs: 2, sm: 2.5, md: 3 },
            backgroundColor: isDarkMode
              ? alpha(theme.palette.background.paper, 0.95)
              : 'rgba(255,255,255,0.98)',
            borderRadius: { xs: 3, sm: 3.5, md: 4 },
            p: { xs: 2.5, sm: 3, md: 3.5, lg: 4 },
            boxShadow: isDarkMode
              ? {
                  xs: `0 16px 44px ${alpha(theme.palette.common.black, 0.5)}`,
                  md: `0 22px 65px ${alpha(theme.palette.common.black, 0.6)}`
                }
              : {
                  xs: '0 16px 44px rgba(0, 0, 0, 0.25)',
                  md: '0 22px 65px rgba(0, 0, 0, 0.3)'
                },
            backdropFilter: 'blur(12px)',
            border: isDarkMode ? `1px solid ${alpha(theme.palette.divider, 0.5)}` : 'none'
          }}
        >
          <Box>
            <Typography
              variant='body2'
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                mb: 1,
                fontSize: { xs: '0.87rem', sm: '0.9rem' },
                letterSpacing: '0.02em'
              }}
            >
              Quiz ID
            </Typography>
            <TextField
              fullWidth
              placeholder='Enter Quiz ID'
              variant='outlined'
              value={quizId}
              inputProps={{
                maxLength: 24,
                inputMode: 'text',
                autoCapitalize: 'none',
                autoCorrect: 'off',
                spellCheck: false
              }}
              onChange={event => {
                const { value } = event.target
                if (value.length <= 24) {
                  setQuizId(value.trimStart())
                }
              }}
              error={!!error}
              helperText='Example: 6792294e5237090e08b0a0e8'
              FormHelperTextProps={{
                sx: {
                  textAlign: 'center',
                  fontWeight: 500
                }
              }}
              sx={{
                backgroundColor: isDarkMode
                  ? alpha(theme.palette.background.default, 0.6)
                  : 'rgba(255,255,255,0.9)',
                borderRadius: { xs: 1.5, sm: 2 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: { xs: 1.5, sm: 2 },
                  ...(isDarkMode && {
                    '& fieldset': {
                      borderColor: alpha(theme.palette.divider, 0.3)
                    },
                    '&:hover fieldset': {
                      borderColor: alpha(theme.palette.primary.main, 0.5)
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main
                    }
                  })
                },
                '& .MuiInputBase-input': {
                  textAlign: 'center',
                  fontSize: { xs: '0.95rem', sm: '1rem', md: '1.05rem' },
                  letterSpacing: '0.04em',
                  fontWeight: 500,
                  fontFamily: 'monospace',
                  color: isDarkMode ? theme.palette.text.primary : undefined
                },
                '& .MuiFormHelperText-root': {
                  fontSize: { xs: '0.68rem', sm: '0.7rem', md: '0.75rem' },
                  color: isDarkMode ? alpha(theme.palette.text.secondary, 0.8) : undefined
                }
              }}
            />
          </Box>

          {/* Enter Button */}
          <Button
            onClick={handleSubmit}
            variant='contained'
            component='label'
            fullWidth
            disabled={loading || quizId.length !== 24}
            sx={{
              py: { xs: 1.25, sm: 1.4, md: 1.5 },
              borderRadius: { xs: 1.5, sm: 2 },
              fontSize: { xs: '0.95rem', sm: '1rem', md: '1.05rem' },
              fontWeight: 600,
              color: 'white !important',
              textTransform: 'none',
              background: isDarkMode
                ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.9)}, ${alpha(theme.palette.primary.dark, 0.9)}) !important`
                : 'linear-gradient(135deg, rgba(102,126,234,0.85), rgba(118,75,162,0.85)) !important',
              boxShadow: isDarkMode
                ? `0 6px 18px ${alpha(theme.palette.primary.main, 0.4)}`
                : '0 6px 18px rgba(102, 126, 234, 0.38)',
              transition: 'transform 0.25s ease, box-shadow 0.25s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: isDarkMode
                  ? `0 10px 26px ${alpha(theme.palette.primary.main, 0.6)}`
                  : '0 10px 26px rgba(25, 44, 132, 0.45)',
                background: isDarkMode
                  ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark}) !important`
                  : 'linear-gradient(135deg, #667eea, #764ba2) !important'
              },
              '&.Mui-disabled': {
                background: isDarkMode
                  ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.5)}, ${alpha(theme.palette.primary.dark, 0.5)}) !important`
                  : 'linear-gradient(135deg, rgba(102,126,234,0.55), rgba(118,75,162,0.55)) !important',
                opacity: 0.7,
                color: 'rgba(255,255,255,0.9) !important'
              }
            }}
          >
            {loading ? 'Loading...' : 'Enter Quiz'}
          </Button>

          <Collapse in={!!error}>
            <Alert
              severity='error'
              action={
                <IconButtonTooltip
                  title='Close'
                  aria-label='close'
                  color='inherit'
                  size='small'
                  onClick={() => setError('')}
                >
                  <Close fontSize='inherit' />
                </IconButtonTooltip>
              }
              sx={{
                borderRadius: { xs: 1.5, sm: 2 },
                fontSize: { xs: '0.875rem', sm: '0.9rem' },
                '& .MuiAlert-icon': {
                  fontSize: { xs: '1.2rem', sm: '1.25rem' }
                }
              }}
            >
              {error}
            </Alert>
          </Collapse>
        </Box>

        <Box sx={{ textAlign: 'center', mt: { xs: 2.5, sm: 3, md: 3.5 } }}>
          <Typography
            variant='body2'
            sx={{
              color: alpha(theme.palette.common.white, isDarkMode ? 0.9 : 0.88),
              fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' },
              fontWeight: 500,
              letterSpacing: '0.01em'
            }}
          >
            Need help? Contact your quiz administrator
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default QuizIdInputForm
