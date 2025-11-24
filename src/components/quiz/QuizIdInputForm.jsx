'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Box, TextField, Button, Typography, Alert, Collapse, IconButton, useTheme, alpha, useMediaQuery } from '@mui/material'
import { Close } from '@mui/icons-material'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import IconButtonTooltip from '@/components/IconButtonTooltip'

const QuizIdInputForm = ({ mode = 'play' }) => {
  const [quizId, setQuizId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))

  // Function to validate MongoDB ObjectId
  const isValidObjectId = id => {
    return /^[0-9a-fA-F]{24}$/.test(id)
  }

  const fetchQuizData = async quizId => {
    try {
      const response = await RestApi.get(`${API_URLS.v0.USERS_QUIZ}/${quizId}`)
      return response
    } catch (error) {
      console.error('Error fetching quiz data:', error)
      throw error
    }
  }

  const handleSubmit = async e => {
    console.log('hello')
    setError('')
    setLoading(true)

    try {
      // Validate input
      if (!quizId.trim()) {
        throw new Error('Please enter a valid Quiz ID')
      }

      if (!isValidObjectId(quizId)) {
        throw new Error('Invalid Quiz ID')
      }

      // Then verify quiz exists
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
  // Get theme colors for gradient
  const primaryColor = theme.palette.primary.main
  const secondaryColor = theme.palette.secondary.main
  
  // Adjust gradient based on theme mode
  const backgroundGradient = theme.palette.mode === 'dark'
    ? `linear-gradient(135deg, ${alpha(primaryColor, 0.8)} 0%, ${alpha(secondaryColor, 0.8)} 100%)`
    : `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: backgroundGradient,
        position: 'relative',
        overflow: 'hidden',
        p: { xs: 2, sm: 3, md: 4 }
      }}
    >
      {/* Decorative Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '-10%',
          right: '-10%',
          width: { xs: '60%', md: '40%' },
          height: { xs: '60%', md: '40%' },
          borderRadius: '50%',
          background: alpha(theme.palette.common.white, theme.palette.mode === 'dark' ? 0.05 : 0.1),
          filter: 'blur(60px)',
          display: { xs: 'none', sm: 'block' }
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-10%',
          left: '-10%',
          width: { xs: '60%', md: '40%' },
          height: { xs: '60%', md: '40%' },
          borderRadius: '50%',
          background: alpha(theme.palette.common.white, theme.palette.mode === 'dark' ? 0.05 : 0.1),
          filter: 'blur(60px)',
          display: { xs: 'none', sm: 'block' }
        }}
      />

      {/* Floating Geometric Shapes - Reduced on mobile for performance */}
      {[...Array(isMobile ? 5 : isTablet ? 10 : 15)].map((_, i) => {
        const shapes = [
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
        const shape = shapes[i % shapes.length]
        const size = isMobile ? 15 + (i % 3) * 10 : 25 + (i % 4) * 15

        return (
          <Box
            key={`shape-${i}`}
            sx={{
              position: 'absolute',
              width: `${size}px`,
              height: `${size}px`,
              left: `${5 + i * 7}%`,
              top: `${-10 + (i % 5) * 25}%`,
              animation: isMobile ? 'none' : `floatShape${i} ${8 + i * 1.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.4}s`,
              opacity: theme.palette.mode === 'dark' ? 0.5 : 0.7,
              display: { xs: i < 5 ? 'block' : 'none', sm: 'block' },
              [`@keyframes floatShape${i}`]: {
                '0%, 100%': {
                  transform: `translate(0, 0) rotate(0deg) scale(1)`,
                  opacity: 0.4
                },
                '25%': {
                  transform: `translate(${15 + i * 4}px, ${25 + i * 8}px) rotate(90deg) scale(1.2)`,
                  opacity: 0.7
                },
                '50%': {
                  transform: `translate(${-8 + i * 2}px, ${50 + i * 4}px) rotate(180deg) scale(0.9)`,
                  opacity: 0.9
                },
                '75%': {
                  transform: `translate(${-25 + i * 4}px, ${25 + i * 8}px) rotate(270deg) scale(1.1)`,
                  opacity: 0.6
                }
              },
              ...(shape === 'square' && {
                background: `linear-gradient(135deg, ${alpha(primaryColor, 0.4)}, ${alpha(secondaryColor, 0.4)})`,
                borderRadius: '6px',
                border: `2px solid ${alpha(theme.palette.common.white, 0.4)}`,
                boxShadow: `0 4px 15px ${alpha(primaryColor, 0.3)}`
              }),
              ...(shape === 'triangle' && {
                width: 0,
                height: 0,
                borderLeft: `${size / 2}px solid transparent`,
                borderRight: `${size / 2}px solid transparent`,
                borderBottom: `${size}px solid ${alpha(primaryColor, 0.4)}`,
                filter: `drop-shadow(0 0 10px ${alpha(secondaryColor, 0.6)})`
              }),
              ...(shape === 'hexagon' && {
                background: alpha(secondaryColor, 0.4),
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                border: `2px solid ${alpha(theme.palette.common.white, 0.4)}`
              }),
              ...(shape === 'diamond' && {
                background: `linear-gradient(45deg, ${alpha(primaryColor, 0.4)}, ${alpha(secondaryColor, 0.4)})`,
                transform: 'rotate(45deg)',
                border: `2px solid ${alpha(theme.palette.common.white, 0.4)}`
              }),
              ...(shape === 'cylinder' && {
                background: `linear-gradient(90deg, 
                  ${alpha(primaryColor, 0.2)} 0%, 
                  ${alpha(primaryColor, 0.6)} 50%, 
                  ${alpha(primaryColor, 0.2)} 100%)`,
                borderRadius: `${size / 2}px`,
                border: `2px solid ${alpha(theme.palette.common.white, 0.3)}`,
                boxShadow: `inset -5px 0 10px ${alpha(theme.palette.common.black, 0.3)}, 0 0 20px ${alpha(primaryColor, 0.4)}`
              }),
              ...(shape === 'cone' && {
                width: 0,
                height: 0,
                borderLeft: `${size / 2}px solid transparent`,
                borderRight: `${size / 2}px solid transparent`,
                borderBottom: `${size}px solid transparent`,
                borderBottomColor: alpha(secondaryColor, 0.5),
                filter: `drop-shadow(0 0 15px ${alpha(secondaryColor, 0.7)})`,
                background: `linear-gradient(to bottom, 
                  ${alpha(secondaryColor, 0.6)} 0%, 
                  ${alpha(secondaryColor, 0.2)} 100%)`
              }),
              ...(shape === 'sphere' && {
                borderRadius: '50%',
                background: `radial-gradient(circle at 30% 30%, 
                  ${alpha(theme.palette.common.white, 0.8)} 0%, 
                  ${alpha(primaryColor, 0.6)} 30%, 
                  ${alpha(primaryColor, 0.3)} 100%)`,
                boxShadow: `0 8px 20px ${alpha(primaryColor, 0.5)}, inset -10px -10px 20px ${alpha(theme.palette.common.black, 0.3)}`
              }),
              ...(shape === 'cube' && {
                background: alpha(primaryColor, 0.5),
                border: `2px solid ${alpha(theme.palette.common.white, 0.4)}`,
                position: 'relative',
                transform: 'rotateX(30deg) rotateY(45deg)',
                transformStyle: 'preserve-3d',
                boxShadow: `
                  ${size / 4}px ${size / 4}px 0 ${alpha(secondaryColor, 0.4)},
                  ${size / 2}px ${size / 2}px 0 ${alpha(secondaryColor, 0.3)}
                `
              }),
              ...(shape === 'pyramid' && {
                width: 0,
                height: 0,
                borderLeft: `${size / 2}px solid transparent`,
                borderRight: `${size / 2}px solid transparent`,
                borderBottom: `${size}px solid ${alpha(primaryColor, 0.5)}`,
                filter: `drop-shadow(5px 5px 10px ${alpha(secondaryColor, 0.5)})`,
                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
              }),
              ...(shape === 'ring' && {
                borderRadius: '50%',
                border: `${size / 6}px solid ${alpha(secondaryColor, 0.6)}`,
                background: 'transparent',
                boxShadow: `
                  0 0 20px ${alpha(secondaryColor, 0.6)},
                  inset 0 0 20px ${alpha(primaryColor, 0.3)}
                `
              }),
              ...(shape === 'star' && {
                clipPath:
                  'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                background: `linear-gradient(135deg, ${alpha(secondaryColor, 0.6)}, ${alpha(primaryColor, 0.6)})`,
                filter: `drop-shadow(0 0 15px ${alpha(secondaryColor, 0.8)})`
              }),
              ...(shape === 'octagon' && {
                clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
                background: alpha(primaryColor, 0.5),
                border: `2px solid ${alpha(theme.palette.common.white, 0.4)}`,
                boxShadow: `0 4px 15px ${alpha(primaryColor, 0.4)}`
              }),
              ...(shape === 'pentagon' && {
                clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
                background: `linear-gradient(135deg, ${alpha(secondaryColor, 0.5)}, ${alpha(primaryColor, 0.5)})`,
                border: `2px solid ${alpha(theme.palette.common.white, 0.4)}`
              })
            }}
          />
        )
      })}

      {/* Twinkling Stars/Sparkles - Reduced on mobile */}
      {[...Array(isMobile ? 8 : 20)].map((_, i) => (
        <Box
          key={`star-${i}`}
          sx={{
            position: 'absolute',
            width: `${3 + (i % 3) * 2}px`,
            height: `${3 + (i % 3) * 2}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: theme.palette.common.white,
            borderRadius: '50%',
            boxShadow: `0 0 10px ${alpha(theme.palette.common.white, 0.8)}`,
            animation: isMobile ? 'none' : `twinkle${i} ${1 + Math.random() * 2}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 3}s`,
            opacity: isMobile ? 0.6 : 1,
            [`@keyframes twinkle${i}`]: {
              '0%, 100%': {
                opacity: 0.2,
                transform: 'scale(1)'
              },
              '50%': {
                opacity: 1,
                transform: 'scale(1.5)'
              }
            }
          }}
        />
      ))}

      {/* Animated Wave Lines - Hidden on mobile */}
      {[...Array(3)].map((_, i) => (
        <Box
          key={`wave-${i}`}
          sx={{
            position: 'absolute',
            width: '100%',
            height: '3px',
            left: 0,
            top: `${20 + i * 30}%`,
            background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.common.white, 0.3 - i * 0.1)}, transparent)`,
            animation: isMobile ? 'none' : `wave${i} ${3 + i}s linear infinite`,
            animationDelay: `${i * 0.5}s`,
            display: { xs: 'none', md: 'block' },
            [`@keyframes wave${i}`]: {
              '0%': {
                transform: 'translateX(-100%)'
              },
              '100%': {
                transform: 'translateX(100%)'
              }
            }
          }}
        />
      ))}

      {/* Main Content */}
      <Box sx={{ 
        position: 'relative', 
        zIndex: 1, 
        width: '100%', 
        maxWidth: { xs: '100%', sm: '450px' },
        px: { xs: 2, sm: 0 }
      }}>
        {/* Logo Title */}
        <Typography
          variant='h2'
          sx={{
            color: theme.palette.common.white,
            fontWeight: 700,
            textAlign: 'center',
            mb: { xs: 0.75, sm: 1 },
            fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' },
            textShadow: `0 2px 4px ${alpha(theme.palette.common.black, 0.1)}`,
            letterSpacing: '0.02em',
            animation: isMobile ? 'fadeInBounce 1s ease-out' : 'fadeInBounce 1s ease-out, subtleGlow 3s ease-in-out infinite',
            '@keyframes fadeInBounce': {
              '0%': {
                opacity: 0,
                transform: 'translateY(-20px)'
              },
              '50%': {
                transform: 'translateY(5px)'
              },
              '100%': {
                opacity: 1,
                transform: 'translateY(0)'
              }
            },
            '@keyframes subtleGlow': {
              '0%, 100%': {
                textShadow: `0 2px 4px ${alpha(theme.palette.common.black, 0.1)}, 0 0 10px ${alpha(theme.palette.common.white, 0.3)}`
              },
              '50%': {
                textShadow:
                  `0 2px 4px ${alpha(theme.palette.common.black, 0.1)}, 0 0 20px ${alpha(theme.palette.common.white, 0.5)}, 0 0 30px ${alpha(secondaryColor, 0.3)}`
              }
            }
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
            fontSize: { xs: '0.875rem', sm: '0.95rem', md: '1rem' }
          }}
        >
          Enter Quiz ID to Start
        </Typography>

        {/* Form Card */}
        <Box
          component='form'
          sx={{
            backgroundColor: theme.palette.background.paper,
            borderRadius: { xs: 3, sm: 4 },
            p: { xs: 2.5, sm: 3, md: 4 },
            boxShadow: theme.palette.mode === 'dark'
              ? '0 20px 60px rgba(0, 0, 0, 0.5)'
              : '0 20px 60px rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
          }}
        >
          {/* Input Field */}
          <Box sx={{ mb: { xs: 2.5, sm: 3 } }}>
            <Typography
              variant='body2'
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                mb: { xs: 0.75, sm: 1 },
                fontSize: { xs: '0.8rem', sm: '0.875rem' }
              }}
            >
              Quiz ID
            </Typography>
            <TextField
              fullWidth
              placeholder='Enter Quiz ID'
              variant='outlined'
              inputProps={{
                maxLength: 24
              }}
              value={quizId}
              onChange={e => {
                if (e.target.value.length <= 24) {
                  setQuizId(e.target.value)
                }
              }}
              error={!!error}
              sx={{
                '& .MuiInputBase-input': {
                  textAlign: 'center',
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  letterSpacing: '0.03em',
                  fontWeight: 500,
                  fontFamily: 'monospace'
                },
                '& .MuiFormHelperText-root': {
                  fontSize: { xs: '0.7rem', sm: '0.75rem' }
                }
              }}
              helperText='Example: 6792294e5237090e08b0a0e8'
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
              borderRadius: 2,
              fontSize: { xs: '0.9rem', sm: '1rem' },
              fontWeight: 600,
              color: 'white !important',
              textTransform: 'none',
              boxShadow: `0 4px 12px ${alpha(primaryColor, 0.35)}`,
              background: `linear-gradient(135deg, ${alpha(primaryColor, 0.75)} 0%, ${alpha(secondaryColor, 0.75)} 100%) !important`,
              backgroundImage: `linear-gradient(135deg, ${alpha(primaryColor, 0.75)} 0%, ${alpha(secondaryColor, 0.75)} 100%) !important`,
              transition: 'box-shadow 0.3s ease',
              '&:hover': {
                boxShadow: `0 6px 20px ${alpha(primaryColor, 0.5)}`,
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%) !important`,
                backgroundImage: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%) !important`
              },
              '&.Mui-disabled': {
                background: `linear-gradient(135deg, ${alpha(primaryColor, 0.55)} 0%, ${alpha(secondaryColor, 0.55)} 100%) !important`,
                backgroundImage: `linear-gradient(135deg, ${alpha(primaryColor, 0.55)} 0%, ${alpha(secondaryColor, 0.55)} 100%) !important`,
                opacity: 0.6,
                color: 'white !important'
              }
            }}
          >
            {loading ? 'Loading...' : 'Enter Quiz'}
          </Button>

          {/* Error Message */}
          <Collapse in={!!error} sx={{ mt: 2 }}>
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

        {/* Additional Info */}
        <Box sx={{ textAlign: 'center', mt: { xs: 2.5, sm: 3 } }}>
          <Typography
            variant='body2'
            sx={{
              color: alpha(theme.palette.common.white, 0.85),
              fontSize: { xs: '0.75rem', sm: '0.813rem' },
              fontWeight: 500
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
