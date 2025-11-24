'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Box, TextField, Button, Typography, Alert, Collapse, useMediaQuery } from '@mui/material'
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
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'))

  const [quizId, setQuizId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const shapes = useMemo(
    () =>
      Array.from({ length: 15 }, (_, index) => {
        const size = 28 + (index % 4) * 12
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
    []
  )

  const stars = useMemo(
    () =>
      Array.from({ length: 24 }, (_, index) => ({
        id: `sparkle-${index}`,
        size: 3 + (index % 3) * 2,
        left: `${((index * 29) % 94) + 3}%`,
        top: `${((index * 37) % 92) + 4}%`,
        duration: 1.4 + (index % 4) * 0.6,
        delay: index * 0.22
      })),
    []
  )

  const activeShapes = shapes.slice(0, isMobile ? 6 : isTablet ? 10 : shapes.length)
  const activeStars = stars.slice(0, isMobile ? 10 : isTablet ? 16 : stars.length)

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
              background: 'linear-gradient(135deg, rgba(102,126,234,0.45), rgba(240,147,251,0.45))',
              border: '2px solid rgba(255,255,255,0.35)',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.35)'
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
              borderBottom: `${size}px solid rgba(102, 126, 234, 0.45)`,
              filter: 'drop-shadow(0 0 10px rgba(240, 147, 251, 0.55))'
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
              background: 'rgba(240, 147, 251, 0.35)',
              border: '2px solid rgba(255, 255, 255, 0.35)'
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
              background: 'linear-gradient(135deg, rgba(102,126,234,0.45), rgba(240,147,251,0.45))',
              border: '2px solid rgba(255,255,255,0.35)'
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
              background:
                'linear-gradient(90deg, rgba(102,126,234,0.2), rgba(102,126,234,0.65), rgba(102,126,234,0.2))',
              border: '2px solid rgba(255,255,255,0.25)',
              boxShadow: 'inset -6px 0 10px rgba(0,0,0,0.25), 0 0 18px rgba(118,75,162,0.45)'
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
              borderBottom: `${size}px solid rgba(240, 147, 251, 0.5)`,
              filter: 'drop-shadow(0 0 14px rgba(240, 147, 251, 0.6))'
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
              background:
                'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.75), rgba(102,126,234,0.65), rgba(102,126,234,0.25))',
              boxShadow: '0 8px 18px rgba(102,126,234,0.45), inset -10px -10px 18px rgba(0,0,0,0.25)'
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
              background: 'rgba(102,126,234,0.48)',
              border: '2px solid rgba(255,255,255,0.35)',
              boxShadow: `${size / 4}px ${size / 4}px 0 rgba(240,147,251,0.4), ${size / 2}px ${size / 2}px 0 rgba(
                118,
                75,
                162,
                0.3
              )`
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
              borderBottom: `${size}px solid rgba(102, 126, 234, 0.45)`,
              filter: 'drop-shadow(4px 6px 12px rgba(240,147,251,0.45))'
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
              border: `${Math.max(size * 0.18, 4)}px solid rgba(240,147,251,0.55)`,
              background: 'transparent',
              boxShadow: '0 0 18px rgba(240,147,251,0.55), inset 0 0 18px rgba(102,126,234,0.3)'
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
              background: 'linear-gradient(135deg, rgba(240,147,251,0.6), rgba(102,126,234,0.6))',
              filter: 'drop-shadow(0 0 16px rgba(240, 147, 251, 0.75))'
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
              background: 'rgba(102,126,234,0.5)',
              border: '2px solid rgba(255,255,255,0.35)',
              boxShadow: '0 4px 12px rgba(102,126,234,0.4)'
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
              background: 'linear-gradient(135deg, rgba(240,147,251,0.5), rgba(102,126,234,0.5))',
              border: '2px solid rgba(255,255,255,0.35)'
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
        minHeight: { xs: '100dvh', md: '100vh' },
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        px: { xs: 2, sm: 3 },
        py: { xs: 6, sm: 8 },
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
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
            top: { xs: '-18%', sm: '-12%' },
            right: { xs: '-30%', sm: '-18%' },
            width: { xs: '55%', sm: '38%' },
            aspectRatio: '1',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.12)',
            filter: 'blur(60px)'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: { xs: '-22%', sm: '-15%' },
            left: { xs: '-28%', sm: '-16%' },
            width: { xs: '60%', sm: '40%' },
            aspectRatio: '1',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
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
              background: 'rgba(255,255,255,0.95)',
              boxShadow: '0 0 12px rgba(255, 255, 255, 0.75)',
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
              height: '3px',
              background: `linear-gradient(90deg, transparent, rgba(255,255,255,${0.3 - index * 0.08}), transparent)`,
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
          maxWidth: { xs: 'min(100%, 420px)', md: '460px' },
          mx: 'auto'
        }}
      >
        <Typography
          variant='h2'
          sx={{
            color: theme.palette.common.white,
            fontWeight: 700,
            textAlign: 'center',
            mb: { xs: 1, sm: 1.5 },
            fontSize: { xs: 'clamp(1.8rem, 6vw, 2.3rem)', sm: 'clamp(2.2rem, 4vw, 2.6rem)' },
            letterSpacing: '0.02em',
            textShadow: '0 2px 4px rgba(0,0,0,0.15)'
          }}
        >
          GurukulamHub
        </Typography>
        <Typography
          variant='body1'
          sx={{
            color: alpha(theme.palette.common.white, 0.95),
            textAlign: 'center',
            mb: { xs: 3, sm: 4 },
            fontSize: { xs: '1rem', sm: '1.05rem' }
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
            gap: { xs: 2, sm: 3 },
            backgroundColor: 'rgba(255,255,255,0.98)',
            borderRadius: 4,
            p: { xs: 3, sm: 4 },
            boxShadow: { xs: '0 16px 44px rgba(0, 0, 0, 0.25)', md: '0 22px 65px rgba(0, 0, 0, 0.3)' },
            backdropFilter: 'blur(12px)'
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
                backgroundColor: 'rgba(255,255,255,0.9)',
                borderRadius: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                },
                '& .MuiInputBase-input': {
                  textAlign: 'center',
                  fontSize: { xs: '1rem', sm: '1.05rem' },
                  letterSpacing: '0.04em',
                  fontWeight: 500,
                  fontFamily: 'monospace'
                },
                '& .MuiFormHelperText-root': {
                  fontSize: { xs: '0.7rem', sm: '0.75rem' }
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
              py: { xs: 1.25, sm: 1.5 },
              py: { xs: 1.25, sm: 1.5 },
              borderRadius: 2,
              fontSize: { xs: '1rem', sm: '1.05rem' },
              fontWeight: 600,
              color: 'white !important',
              textTransform: 'none',
              background: 'linear-gradient(135deg, rgba(102,126,234,0.85), rgba(118,75,162,0.85)) !important',
              boxShadow: '0 6px 18px rgba(102, 126, 234, 0.38)',
              transition: 'transform 0.25s ease, box-shadow 0.25s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 26px rgba(25, 44, 132, 0.45)',
                background: 'linear-gradient(135deg, #667eea, #764ba2) !important'
              },
              '&.Mui-disabled': {
                background: 'linear-gradient(135deg, rgba(102,126,234,0.55), rgba(118,75,162,0.55)) !important',
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
                borderRadius: 2,
                '& .MuiAlert-icon': {
                  fontSize: '1.25rem'
                }
              }}
            >
              {error}
            </Alert>
          </Collapse>
        </Box>

        <Box sx={{ textAlign: 'center', mt: { xs: 3, sm: 3.5 } }}>
          <Typography
            variant='body2'
            sx={{
              color: 'rgba(255, 255, 255, 0.88)',
              fontSize: { xs: '0.85rem', sm: '0.9rem' },
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
