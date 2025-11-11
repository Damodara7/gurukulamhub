'use client'

import React, { useState, useEffect } from 'react'
import * as RestApi from '@/utils/restApiUtil'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { API_URLS } from '@/configs/apiConfig'
import { Box, Typography, Card, CardContent, TextField, Button, Alert, CircularProgress } from '@mui/material'
import { toast } from 'react-toastify'
import SportsEsportsIcon from '@mui/icons-material/SportsEsports'
import LockIcon from '@mui/icons-material/Lock'
import EmailIcon from '@mui/icons-material/Email'

const GamePinInputFormPage = () => {
  const [gamePin, setGamePin] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()

  //check for the gamepin in url when component mounts
  useEffect(() => {
    const urlGamePin = searchParams.get('gamepin')
    if (urlGamePin && validateGamePin(urlGamePin)) {
      setGamePin(urlGamePin)
    }
  }, [searchParams])

  const validateGamePin = pin => {
    return /^\d{6}$/.test(pin)
  }

  // Basic Gmail validation
  const validateEmail = email => {
    return /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email.toLowerCase())
  }

  const handleGamePinChange = e => {
    const value = e.target.value
    // Only allow numbers and limit to 6 characters
    if (/^\d*$/.test(value) && value.length <= 6) {
      setGamePin(value)
    }
  }

  const handleEmailChange = e => {
    setEmail(e.target.value.toLowerCase().trim())
  }

  const validateGame = async () => {
    setError(null)
    // Client-side validation
    if (!gamePin) {
      setError('Game PIN is required')
      return
    }

    if (!validateGamePin(gamePin)) {
      setError('Game PIN must be 6 digits')
      return
    }

    if (!email) {
      setError('Email is required')
      return
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid Gmail address')
      return
    }

    if (!session?.user) {
      setError('You must be logged in to join a game')
      return
    }

    // Handle form submission
    try {
      setLoading(true)

      // Validate game PIN
      const gameRes = await RestApi.get(`${API_URLS.v0.USERS_GAME}?pin=${gamePin}`)
      if (gameRes.status === 'success') {
        // Join the game
        const joinRes = await RestApi.post(`${API_URLS.v0.USERS_GAME}/${gameRes.result?._id}/join`, {
          user: { id: session.user.id, email: email }
        })

        if (joinRes.status === 'success') {
          toast.success('Joined game successfully!')
          router.push(`/public-games/${gameRes.result?._id}/play`)
        } else {
          throw new Error(joinRes.message || 'Failed to join game')
        }
      } else {
        throw new Error(gameRes.message || 'Invalid game PIN')
      }
    } catch (err) {
      console.error('Validation error:', err)
      setError(err.message)
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = e => {
    e?.preventDefault()
    validateGame()
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        position: 'relative',
        overflow: 'hidden'
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

      {/* Animated Bubbles - Spread across entire screen */}
      {[...Array(15)].map((_, i) => (
        <Box
          key={`bubble-${i}`}
          sx={{
            position: 'absolute',
            width: `${20 + (i % 5) * 15}px`,
            height: `${20 + (i % 5) * 15}px`,
            borderRadius: '50%',
            background: `rgba(255, 255, 255, ${0.1 + (i % 3) * 0.05})`,
            boxShadow: `inset 0 0 10px rgba(255, 255, 255, 0.3), 0 0 20px rgba(255, 255, 255, 0.1)`,
            border: '1px solid rgba(255, 255, 255, 0.2)',
            left: `${(i * 7) % 100}%`,
            bottom: `-${50 + (i % 4) * 20}px`,
            animation: `floatBubble${i} ${8 + (i % 5) * 2}s ease-in-out infinite`,
            animationDelay: `${i * 0.8}s`,
            [`@keyframes floatBubble${i}`]: {
              '0%': {
                transform: `translateY(0) translateX(0) scale(0.8)`,
                opacity: 0
              },
              '10%': {
                opacity: 0.6
              },
              '50%': {
                transform: `translateY(-50vh) translateX(${(i % 2 === 0 ? 1 : -1) * (20 + i * 3)}px) scale(1)`,
                opacity: 0.8
              },
              '90%': {
                opacity: 0.4
              },
              '100%': {
                transform: `translateY(-110vh) translateX(${(i % 2 === 0 ? 1 : -1) * (40 + i * 5)}px) scale(0.6)`,
                opacity: 0
              }
            }
          }}
        />
      ))}

      {/* Main Content Container */}
      <Box
        sx={{
          width: '100%',
          maxWidth: '450px',
          zIndex: 1
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          {/* Gaming Icon with Enhanced Animation */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 95,
              height: 95,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
              boxShadow: '0 10px 40px rgba(102, 126, 234, 0.5), 0 0 0 5px rgba(255, 255, 255, 0.3)',
              backdropFilter: 'blur(10px)',
              mb: 2,
              position: 'relative',
              animation:
                'bounce 2s ease-in-out infinite, rotate360 8s linear infinite, scaleGlow 3s ease-in-out infinite',
              '@keyframes bounce': {
                '0%, 100%': {
                  transform: 'translateY(0px)'
                },
                '50%': {
                  transform: 'translateY(-20px)'
                }
              },
              '@keyframes rotate360': {
                '0%': {
                  transform: 'rotate(0deg)'
                },
                '100%': {
                  transform: 'rotate(360deg)'
                }
              },
              '@keyframes scaleGlow': {
                '0%, 100%': {
                  boxShadow: '0 10px 40px rgba(102, 126, 234, 0.5), 0 0 0 5px rgba(255, 255, 255, 0.3)',
                  filter: 'brightness(1)'
                },
                '50%': {
                  boxShadow: '0 15px 60px rgba(118, 75, 162, 0.8), 0 0 0 8px rgba(240, 147, 251, 0.5)',
                  filter: 'brightness(1.2)'
                }
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                width: '120%',
                height: '120%',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                filter: 'blur(25px)',
                opacity: 0.7,
                zIndex: -1,
                animation: 'breathe 3s ease-in-out infinite'
              },
              '@keyframes breathe': {
                '0%, 100%': {
                  transform: 'scale(0.9)',
                  opacity: 0.5
                },
                '50%': {
                  transform: 'scale(1.2)',
                  opacity: 0.9
                }
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                border: '3px solid rgba(255, 255, 255, 0.3)',
                animation: 'ripple 2s ease-out infinite'
              },
              '@keyframes ripple': {
                '0%': {
                  transform: 'scale(1)',
                  opacity: 1
                },
                '100%': {
                  transform: 'scale(1.5)',
                  opacity: 0
                }
              }
            }}
          >
            <SportsEsportsIcon
              sx={{
                fontSize: 48,
                color: 'white',
                filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.4))',
                animation: 'iconShake 0.5s ease-in-out infinite alternate',
                '@keyframes iconShake': {
                  '0%': {
                    transform: 'scale(1) rotate(0deg)'
                  },
                  '100%': {
                    transform: 'scale(1.1) rotate(5deg)'
                  }
                }
              }}
            />
          </Box>

          {/* Decorative particles around icon */}
          <Box
            sx={{
              position: 'absolute',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '250px',
              height: '120px',
              pointerEvents: 'none'
            }}
          >
            {[...Array(5)].map((_, i) => (
              <Box
                key={i}
                sx={{
                  position: 'absolute',
                  width: i % 2 === 0 ? '10px' : '6px',
                  height: i % 2 === 0 ? '10px' : '6px',
                  borderRadius: '50%',
                  background: i === 0 || i === 3 ? '#667eea' : i === 1 || i === 4 ? '#764ba2' : '#f093fb',
                  left: `${20 + i * 15}%`,
                  animation: `orbit${i} ${2 + i * 0.5}s ease-in-out infinite`,
                  animationDelay: `${i * 0.3}s`,
                  [`@keyframes orbit${i}`]: {
                    '0%': {
                      transform: `translate(0, 0) scale(0) rotate(0deg)`,
                      opacity: 0
                    },
                    '25%': {
                      opacity: 1
                    },
                    '50%': {
                      transform: `translate(${(i - 2) * 30}px, -40px) scale(1.5) rotate(180deg)`,
                      opacity: 1
                    },
                    '75%': {
                      opacity: 0.5
                    },
                    '100%': {
                      transform: `translate(${(i - 2) * -20}px, -10px) scale(0) rotate(360deg)`,
                      opacity: 0
                    }
                  }
                }}
              />
            ))}
          </Box>

          <Typography
            variant='h3'
            sx={{
              color: 'white',
              fontWeight: 700,
              mb: 1,
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              fontSize: { xs: '2rem', sm: '2.5rem' },
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
            Gurukulam Hub
          </Typography>
          <Typography
            variant='body1'
            sx={{
              color: 'rgba(255, 255, 255, 0.95)',
              fontWeight: 400,
              fontSize: { xs: '0.95rem', sm: '1rem' }
            }}
          >
            Enter Game PIN and Email to Join
          </Typography>
        </Box>

        {/* Game Entry Card */}
        <Card
          elevation={0}
          sx={{
            width: '100%',
            borderRadius: 4,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(10px)',
            background: 'white'
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <form onSubmit={handleSubmit}>
              {/* Game PIN Field */}
              <Box mb={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LockIcon sx={{ fontSize: 18, color: 'primary.main', mr: 1 }} />
                  <Typography
                    variant='body2'
                    sx={{
                      fontWeight: 600,
                      color: 'text.primary',
                      fontSize: '0.875rem'
                    }}
                  >
                    Game PIN
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  variant='outlined'
                  value={gamePin}
                  onChange={handleGamePinChange}
                  onFocus={() => setError(null)}
                  placeholder='Enter 6-digit PIN'
                  required
                  inputProps={{
                    maxLength: 6,
                    pattern: '[0-9]*',
                    inputMode: 'numeric'
                  }}
                  helperText='Example: 574515'
                />
              </Box>

              {/* Email Field */}
              <Box mb={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <EmailIcon sx={{ fontSize: 18, color: 'primary.main', mr: 1 }} />
                  <Typography
                    variant='body2'
                    sx={{
                      fontWeight: 600,
                      color: 'text.primary',
                      fontSize: '0.875rem'
                    }}
                  >
                    Email Address
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  variant='outlined'
                  type='email'
                  value={email}
                  onChange={handleEmailChange}
                  onFocus={() => setError(null)}
                  placeholder='your.email@gmail.com'
                  required
                  inputProps={{
                    pattern: '[a-zA-Z0-9._%+-]+@gmail\\.com'
                  }}
                  helperText='Only Gmail addresses accepted'
                />
              </Box>

              {/* Error Message */}
              {error && (
                <Alert
                  severity='error'
                  sx={{
                    mb: 2.5,
                    borderRadius: 2,
                    fontSize: '0.85rem',
                    py: 0.5,
                    '& .MuiAlert-icon': {
                      fontSize: '1.25rem'
                    }
                  }}
                >
                  {error}
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type='submit'
                onClick={handleSubmit}
                variant='contained'
                fullWidth
                disabled={loading}
                sx={{
                  py: 1.25,
                  borderRadius: 2,
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  color: 'white !important',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.35)',
                  background:
                    'linear-gradient(135deg, rgba(102, 126, 234, 0.75) 0%, rgba(118, 75, 162, 0.75) 100%) !important',
                  backgroundImage:
                    'linear-gradient(135deg, rgba(102, 126, 234, 0.75) 0%, rgba(118, 75, 162, 0.75) 100%) !important',
                  transition: 'box-shadow 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important',
                    backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important',
                    color: 'white !important'
                  },
                  '&:active': {
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
                {loading ? (
                  <>
                    <CircularProgress size={20} sx={{ color: 'white', mr: 1.5 }} />
                    Verifying...
                  </>
                ) : (
                  'Join Game'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Features Section */}
        <Box
          sx={{
            mt: 3,
            display: 'flex',
            justifyContent: 'space-around',
            gap: 2,
            flexWrap: 'wrap'
          }}
        >
          <Box sx={{ textAlign: 'center', flex: '1 1 120px' }}>
            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                mb: 1
              }}
            >
              <Typography sx={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>🎮</Typography>
            </Box>
            <Typography variant='caption' sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 500 }}>
              Interactive
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center', flex: '1 1 120px' }}>
            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                mb: 1
              }}
            >
              <Typography sx={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>⚡</Typography>
            </Box>
            <Typography variant='caption' sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 500 }}>
              Real-time
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center', flex: '1 1 120px' }}>
            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                mb: 1
              }}
            >
              <Typography sx={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>🏆</Typography>
            </Box>
            <Typography variant='caption' sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 500 }}>
              Competitive
            </Typography>
          </Box>
        </Box>

        {/* Additional Info */}
        <Box sx={{ textAlign: 'center', mt: 3, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
          <Typography
            variant='body2'
            sx={{
              color: 'rgba(255, 255, 255, 0.85)',
              fontSize: '0.813rem',
              fontWeight: 500
            }}
          >
            Need help? Contact your game administrator
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default GamePinInputFormPage
