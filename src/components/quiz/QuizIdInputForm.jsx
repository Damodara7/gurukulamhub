'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Box, TextField, Button, Typography, Alert, Collapse, IconButton } from '@mui/material'
import { Close } from '@mui/icons-material'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import IconButtonTooltip from '@/components/IconButtonTooltip'

const QuizIdInputForm = ({ mode = 'play' }) => {
  const [quizId, setQuizId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

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
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden',
        p: 3
      }}
    >
      {/* Decorative Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '-10%',
          right: '-10%',
          width: '40%',
          height: '40%',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          filter: 'blur(60px)'
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-10%',
          left: '-10%',
          width: '40%',
          height: '40%',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          filter: 'blur(60px)'
        }}
      />

      {/* Floating Geometric Shapes */}
      {[...Array(15)].map((_, i) => {
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
        const size = 25 + (i % 4) * 15

        return (
          <Box
            key={`shape-${i}`}
            sx={{
              position: 'absolute',
              width: `${size}px`,
              height: `${size}px`,
              left: `${5 + i * 7}%`,
              top: `${-10 + (i % 5) * 25}%`,
              animation: `floatShape${i} ${8 + i * 1.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.4}s`,
              opacity: 0.7,
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
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.4), rgba(240, 147, 251, 0.4))',
                borderRadius: '6px',
                border: '2px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
              }),
              ...(shape === 'triangle' && {
                width: 0,
                height: 0,
                borderLeft: `${size / 2}px solid transparent`,
                borderRight: `${size / 2}px solid transparent`,
                borderBottom: `${size}px solid rgba(102, 126, 234, 0.4)`,
                filter: 'drop-shadow(0 0 10px rgba(240, 147, 251, 0.6))'
              }),
              ...(shape === 'hexagon' && {
                background: 'rgba(240, 147, 251, 0.4)',
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                border: '2px solid rgba(255, 255, 255, 0.4)'
              }),
              ...(shape === 'diamond' && {
                background: 'linear-gradient(45deg, rgba(102, 126, 234, 0.4), rgba(240, 147, 251, 0.4))',
                transform: 'rotate(45deg)',
                border: '2px solid rgba(255, 255, 255, 0.4)'
              }),
              ...(shape === 'cylinder' && {
                background: `linear-gradient(90deg, 
                  rgba(102, 126, 234, 0.2) 0%, 
                  rgba(102, 126, 234, 0.6) 50%, 
                  rgba(102, 126, 234, 0.2) 100%)`,
                borderRadius: `${size / 2}px`,
                border: '2px solid rgba(255, 255, 255, 0.3)',
                boxShadow: 'inset -5px 0 10px rgba(0, 0, 0, 0.3), 0 0 20px rgba(102, 126, 234, 0.4)'
              }),
              ...(shape === 'cone' && {
                width: 0,
                height: 0,
                borderLeft: `${size / 2}px solid transparent`,
                borderRight: `${size / 2}px solid transparent`,
                borderBottom: `${size}px solid transparent`,
                borderBottomColor: 'rgba(240, 147, 251, 0.5)',
                filter: 'drop-shadow(0 0 15px rgba(240, 147, 251, 0.7))',
                background: `linear-gradient(to bottom, 
                  rgba(240, 147, 251, 0.6) 0%, 
                  rgba(240, 147, 251, 0.2) 100%)`
              }),
              ...(shape === 'sphere' && {
                borderRadius: '50%',
                background: `radial-gradient(circle at 30% 30%, 
                  rgba(255, 255, 255, 0.8) 0%, 
                  rgba(102, 126, 234, 0.6) 30%, 
                  rgba(102, 126, 234, 0.3) 100%)`,
                boxShadow: '0 8px 20px rgba(102, 126, 234, 0.5), inset -10px -10px 20px rgba(0, 0, 0, 0.3)'
              }),
              ...(shape === 'cube' && {
                background: 'rgba(102, 126, 234, 0.5)',
                border: '2px solid rgba(255, 255, 255, 0.4)',
                position: 'relative',
                transform: 'rotateX(30deg) rotateY(45deg)',
                transformStyle: 'preserve-3d',
                boxShadow: `
                  ${size / 4}px ${size / 4}px 0 rgba(240, 147, 251, 0.4),
                  ${size / 2}px ${size / 2}px 0 rgba(118, 75, 162, 0.3)
                `
              }),
              ...(shape === 'pyramid' && {
                width: 0,
                height: 0,
                borderLeft: `${size / 2}px solid transparent`,
                borderRight: `${size / 2}px solid transparent`,
                borderBottom: `${size}px solid rgba(102, 126, 234, 0.5)`,
                filter: 'drop-shadow(5px 5px 10px rgba(240, 147, 251, 0.5))',
                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
              }),
              ...(shape === 'ring' && {
                borderRadius: '50%',
                border: `${size / 6}px solid rgba(240, 147, 251, 0.6)`,
                background: 'transparent',
                boxShadow: `
                  0 0 20px rgba(240, 147, 251, 0.6),
                  inset 0 0 20px rgba(102, 126, 234, 0.3)
                `
              }),
              ...(shape === 'star' && {
                clipPath:
                  'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                background: 'linear-gradient(135deg, rgba(240, 147, 251, 0.6), rgba(102, 126, 234, 0.6))',
                filter: 'drop-shadow(0 0 15px rgba(240, 147, 251, 0.8))'
              }),
              ...(shape === 'octagon' && {
                clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
                background: 'rgba(102, 126, 234, 0.5)',
                border: '2px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
              }),
              ...(shape === 'pentagon' && {
                clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
                background: 'linear-gradient(135deg, rgba(240, 147, 251, 0.5), rgba(102, 126, 234, 0.5))',
                border: '2px solid rgba(255, 255, 255, 0.4)'
              })
            }}
          />
        )
      })}

      {/* Twinkling Stars/Sparkles */}
      {[...Array(20)].map((_, i) => (
        <Box
          key={`star-${i}`}
          sx={{
            position: 'absolute',
            width: `${3 + (i % 3) * 2}px`,
            height: `${3 + (i % 3) * 2}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: 'white',
            borderRadius: '50%',
            boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
            animation: `twinkle${i} ${1 + Math.random() * 2}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 3}s`,
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

      {/* Animated Wave Lines */}
      {[...Array(3)].map((_, i) => (
        <Box
          key={`wave-${i}`}
          sx={{
            position: 'absolute',
            width: '100%',
            height: '3px',
            left: 0,
            top: `${20 + i * 30}%`,
            background: `linear-gradient(90deg, transparent, rgba(255, 255, 255, ${0.3 - i * 0.1}), transparent)`,
            animation: `wave${i} ${3 + i}s linear infinite`,
            animationDelay: `${i * 0.5}s`,
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
      <Box sx={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '450px' }}>
        {/* Logo Title */}
        <Typography
          variant='h2'
          sx={{
            color: 'white',
            fontWeight: 700,
            textAlign: 'center',
            mb: 1,
            fontSize: { xs: '2rem', sm: '2.5rem' },
            textShadow: '0 2px 4px rgba(0,0,0,0.1)',
            letterSpacing: '0.02em',
            animation: 'fadeInBounce 1s ease-out, subtleGlow 3s ease-in-out infinite',
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
                textShadow: '0 2px 4px rgba(0,0,0,0.1), 0 0 10px rgba(255, 255, 255, 0.3)'
              },
              '50%': {
                textShadow:
                  '0 2px 4px rgba(0,0,0,0.1), 0 0 20px rgba(255, 255, 255, 0.5), 0 0 30px rgba(240, 147, 251, 0.3)'
              }
            }
          }}
        >
          GurukulamHub
        </Typography>
        <Typography
          variant='body1'
          sx={{
            color: 'rgba(255, 255, 255, 0.95)',
            textAlign: 'center',
            mb: 4,
            fontSize: { xs: '0.95rem', sm: '1rem' }
          }}
        >
          Enter Quiz ID to Start
        </Typography>

        {/* Form Card */}
        <Box
          component='form'
          sx={{
            backgroundColor: 'white',
            borderRadius: 4,
            p: { xs: 3, sm: 4 },
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(10px)'
          }}
        >
          {/* Input Field */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant='body2'
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                mb: 1,
                fontSize: '0.875rem'
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
                  fontSize: '1rem',
                  letterSpacing: '0.03em',
                  fontWeight: 500,
                  fontFamily: 'monospace'
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
              py: 1.5,
              borderRadius: 2,
              fontSize: '1rem',
              fontWeight: 600,
              color: 'white !important',
              textTransform: 'none',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.35)',
              background:
                'linear-gradient(135deg, rgba(102, 126, 234, 0.75) 0%, rgba(118, 75, 162, 0.75) 100%) !important',
              backgroundImage:
                'linear-gradient(135deg, rgba(102, 126, 234, 0.75) 0%, rgba(118, 75, 162, 0.75) 100%) !important',
              transition: 'box-shadow 0.3s ease',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(25, 44, 132, 0.5)',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important',
                backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important'
              },
              '&.Mui-disabled': {
                background:
                  'linear-gradient(135deg, rgba(102, 126, 234, 0.55) 0%, rgba(118, 75, 162, 0.55) 100%) !important',
                backgroundImage:
                  'linear-gradient(135deg, rgba(102, 126, 234, 0.55) 0%, rgba(118, 75, 162, 0.55) 100%) !important',
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
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography
            variant='body2'
            sx={{
              color: 'rgba(255, 255, 255, 0.85)',
              fontSize: '0.813rem',
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
