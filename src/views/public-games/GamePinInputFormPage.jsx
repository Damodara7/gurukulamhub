'use client'

import React, { useEffect, useMemo, useState } from 'react'
import * as RestApi from '@/utils/restApiUtil'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { API_URLS } from '@/configs/apiConfig'
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Collapse,
  useMediaQuery,
  alpha
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { keyframes } from '@mui/system'
import { toast } from 'react-toastify'
import SportsEsportsIcon from '@mui/icons-material/SportsEsports'
import LockIcon from '@mui/icons-material/Lock'
import EmailIcon from '@mui/icons-material/Email'

const floatBubble = keyframes`
  0% {
    transform: translate3d(0, 0, 0) scale(0.75);
    opacity: 0;
  }
  12% {
    opacity: 0.45;
  }
  48% {
    transform: translate3d(var(--bubble-shift, 18px), -48vh, 0) scale(1);
    opacity: 0.78;
  }
  100% {
    transform: translate3d(calc(var(--bubble-shift, 18px) * 1.35), -108vh, 0) scale(0.6);
    opacity: 0;
  }
`

const iconBounce = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-16px);
  }
`

const iconGlow = keyframes`
  0%, 100% {
    box-shadow: 0 14px 40px rgba(102, 126, 234, 0.55), 0 0 0 5px rgba(255, 255, 255, 0.28);
    filter: brightness(1);
  }
  50% {
    box-shadow: 0 20px 60px rgba(118, 75, 162, 0.75), 0 0 0 9px rgba(240, 147, 251, 0.45);
    filter: brightness(1.18);
  }
`

const ringPulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.9;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
`

const highlightItems = [
  { id: 'interactive', icon: '🎮', label: 'Interactive' },
  { id: 'realtime', icon: '⚡', label: 'Real-time' },
  { id: 'competitive', icon: '🏆', label: 'Competitive' }
]

const GamePinInputFormPage = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'))
  const isDesktop = useMediaQuery(theme.breakpoints.between('md', 'lg'))
  const isDarkMode = theme.palette.mode === 'dark'

  const [gamePin, setGamePin] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
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

  const bubbleConfigs = useMemo(
    () =>
      Array.from({ length: 18 }, (_, index) => ({
        id: `bubble-${index}`,
        size: 26 + (index % 4) * 14,
        left: ((index * 17) % 86) + 7,
        duration: 11 + (index % 5) * 2.3,
        delay: index * 0.55,
        shift: (index % 2 === 0 ? 1 : -1) * (20 + index * 1.6),
        opacity: 0.34 + (index % 3) * 0.16
      })),
    []
  )

  const activeBubbles = useMemo(() => {
    if (isMobile) return bubbleConfigs.slice(0, 8)
    if (isTablet) return bubbleConfigs.slice(0, 12)
    if (isDesktop) return bubbleConfigs.slice(0, 15)
    return bubbleConfigs
  }, [bubbleConfigs, isMobile, isTablet, isDesktop])

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
      if (error) setError('')
    }
  }

  const handleEmailChange = e => {
    setEmail(e.target.value.toLowerCase().trim())
    if (error) setError('')
  }

  const validateGame = async () => {
    setError('')
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
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async e => {
    e?.preventDefault()
    if (loading) return
    await validateGame()
  }

  return (
    <Box
      component='main'
      sx={{
        minHeight: { xs: '100dvh', sm: '100vh' },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        px: { xs: 1.5, sm: 2, md: 3, lg: 4 },
        py: { xs: 5, sm: 6, md: 7, lg: 8 },
        background: isDarkMode
          ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        overflowX: 'hidden'
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: { xs: '-18%', sm: '-14%', md: '-12%', lg: '-10%' },
            right: { xs: '-32%', sm: '-22%', md: '-18%', lg: '-15%' },
            width: { xs: '58%', sm: '42%', md: '38%', lg: '36%' },
            aspectRatio: '1',
            borderRadius: '50%',
            background: isDarkMode
              ? alpha(theme.palette.primary.light, 0.2)
              : 'rgba(255, 255, 255, 0.12)',
            filter: 'blur(62px)'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: { xs: '-20%', sm: '-16%', md: '-14%', lg: '-12%' },
            left: { xs: '-30%', sm: '-20%', md: '-16%', lg: '-14%' },
            width: { xs: '60%', sm: '44%', md: '40%', lg: '38%' },
            aspectRatio: '1',
            borderRadius: '50%',
            background: isDarkMode
              ? alpha(theme.palette.secondary?.main || theme.palette.primary.main, 0.15)
              : 'rgba(255, 255, 255, 0.1)',
            filter: 'blur(68px)'
          }}
        />

        {activeBubbles.map(bubble => (
          <Box
            key={bubble.id}
            sx={{
              position: 'absolute',
              left: `${bubble.left}%`,
              bottom: { xs: '-14%', sm: '-16%', md: '-18%' },
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              borderRadius: '50%',
              opacity: bubble.opacity,
              background: isDarkMode
                ? alpha(theme.palette.common.white, 0.15)
                : 'rgba(255,255,255,0.18)',
              border: isDarkMode
                ? `1px solid ${alpha(theme.palette.common.white, 0.3)}`
                : '1px solid rgba(255,255,255,0.25)',
              boxShadow: isDarkMode
                ? `0 0 25px ${alpha(theme.palette.primary.light, 0.2)}, inset 0 0 18px ${alpha(theme.palette.common.white, 0.2)}`
                : '0 0 25px rgba(255, 255, 255, 0.18), inset 0 0 18px rgba(255, 255, 255, 0.35)',
              animation: `${floatBubble} ${bubble.duration}s ease-in-out infinite`,
              animationDelay: `${bubble.delay}s`,
              '--bubble-shift': `${bubble.shift}px`,
              mixBlendMode: isDarkMode ? 'normal' : 'screen'
            }}
          />
        ))}
      </Box>

      {/* Main Content Container */}
      <Box
        sx={{
          width: '100%',
          maxWidth: { xs: 'min(100%, 420px)', sm: '440px', md: '450px', lg: '460px' },
          zIndex: 1
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: { xs: 3.5, sm: 4 } }}>
          <Box
            sx={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: { xs: 80, sm: 88, md: 92 },
              height: { xs: 80, sm: 88, md: 92 },
              borderRadius: '50%',
              background: isDarkMode
                ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 45%, ${theme.palette.secondary?.main || theme.palette.primary.light} 100%)`
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 45%, #f093fb 100%)',
              animation: `${iconBounce} 5.5s ease-in-out infinite, ${iconGlow} 6.5s ease-in-out infinite`,
              boxShadow: isDarkMode
                ? `0 14px 40px ${alpha(theme.palette.primary.main, 0.5)}, 0 0 0 5px ${alpha(theme.palette.common.white, 0.2)}`
                : undefined
            }}
          >
            <Box
              component='span'
              sx={{
                position: 'absolute',
                inset: '-14%',
                borderRadius: '50%',
                filter: 'blur(26px)',
                background: isDarkMode
                  ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.6)}, ${alpha(theme.palette.secondary?.main || theme.palette.primary.main, 0.6)})`
                  : 'linear-gradient(135deg, rgba(102,126,234,0.55), rgba(240,147,251,0.55))',
                opacity: 0.8
              }}
            />
            <Box
              component='span'
              sx={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: `3px solid ${alpha(theme.palette.common.white, isDarkMode ? 0.45 : 0.35)}`,
                animation: `${ringPulse} 2.6s ease-out infinite`
              }}
            />
            <SportsEsportsIcon
              sx={{
                position: 'relative',
                fontSize: { xs: 40, sm: 44, md: 48 },
                color: theme.palette.common.white,
                filter: isDarkMode
                  ? `drop-shadow(0 4px 10px ${alpha(theme.palette.common.black, 0.4)})`
                  : 'drop-shadow(0 4px 10px rgba(0,0,0,0.35))'
              }}
            />
          </Box>

          <Typography
            variant='h3'
            sx={{
              mt: { xs: 2, sm: 2.5 },
              color: theme.palette.common.white,
              fontWeight: 700,
              letterSpacing: '0.015em',
              textShadow: isDarkMode
                ? `0 2px 8px ${alpha(theme.palette.common.black, 0.3)}`
                : '0 2px 4px rgba(0,0,0,0.18)',
              fontSize: {
                xs: 'clamp(1.75rem, 6vw, 2.3rem)',
                sm: 'clamp(2rem, 4.5vw, 2.6rem)',
                md: 'clamp(2.3rem, 3vw, 2.9rem)',
                lg: 'clamp(2.5rem, 2.5vw, 3.1rem)'
              }
            }}
          >
            Gurukulam Hub
          </Typography>
          <Typography
            variant='body1'
            sx={{
              color: alpha(theme.palette.common.white, 0.92),
              fontSize: { xs: '0.95rem', sm: '1rem', md: '1.05rem' },
              fontWeight: 500
            }}
          >
            Enter Game PIN and Email to Join
          </Typography>
        </Box>

        {/* Game Entry Card */}
        <Card
          elevation={0}
          sx={{
            backgroundColor: isDarkMode
              ? alpha(theme.palette.background.paper, 0.95)
              : 'rgba(255,255,255,0.98)',
            borderRadius: { xs: 3, sm: 3.5, md: 4 },
            boxShadow: isDarkMode
              ? {
                  xs: `0 16px 44px ${alpha(theme.palette.common.black, 0.5)}`,
                  md: `0 22px 60px ${alpha(theme.palette.common.black, 0.6)}`
                }
              : {
                  xs: '0 16px 44px rgba(0,0,0,0.28)',
                  md: '0 22px 60px rgba(0,0,0,0.32)'
                },
            backdropFilter: 'blur(14px)',
            border: isDarkMode ? `1px solid ${alpha(theme.palette.divider, 0.5)}` : 'none'
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Box
              component='form'
              noValidate
              onSubmit={handleSubmit}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: { xs: 2.5, sm: 3 }
              }}
            >
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LockIcon sx={{ fontSize: 18, color: 'primary.main', mr: 1 }} />
                  <Typography
                    variant='body2'
                    sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.9rem', letterSpacing: '0.02em' }}
                  >
                    Game PIN
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  variant='outlined'
                  value={gamePin}
                  onChange={handleGamePinChange}
                  placeholder='Enter 6-digit PIN'
                  onFocus={() => setError(null)}
                  required
                  inputProps={{
                    maxLength: 6,
                    pattern: '[0-9]*',
                    inputMode: 'numeric'
                  }}
                  helperText='Example: 574515'
                  FormHelperTextProps={{
                    sx: {
                      textAlign: 'center',
                      fontWeight: 500,
                      fontSize: { xs: '0.7rem', sm: '0.75rem' }
                    }
                  }}
                  sx={{
                    backgroundColor: isDarkMode
                      ? alpha(theme.palette.background.default, 0.6)
                      : 'rgba(255,255,255,0.96)',
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
                      color: isDarkMode ? theme.palette.text.primary : undefined
                    },
                    '& .MuiFormHelperText-root': {
                      color: isDarkMode ? alpha(theme.palette.text.secondary, 0.8) : undefined
                    }
                  }}
                />
              </Box>

              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <EmailIcon sx={{ fontSize: 18, color: 'primary.main', mr: 1 }} />
                  <Typography
                    variant='body2'
                    sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.9rem', letterSpacing: '0.02em' }}
                  >
                    Gmail Address
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
                    pattern: '[a-zA-Z0-9._%+-]+@gmail\\.com',
                    inputMode: 'email'
                  }}
                  helperText='Only Gmail addresses accepted'
                  FormHelperTextProps={{
                    sx: {
                      textAlign: 'center',
                      fontWeight: 500,
                      fontSize: { xs: '0.7rem', sm: '0.75rem' }
                    }
                  }}
                  sx={{
                    backgroundColor: isDarkMode
                      ? alpha(theme.palette.background.default, 0.6)
                      : 'rgba(255,255,255,0.96)',
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
                      color: isDarkMode ? theme.palette.text.primary : undefined
                    },
                    '& .MuiFormHelperText-root': {
                      color: isDarkMode ? alpha(theme.palette.text.secondary, 0.8) : undefined
                    }
                  }}
                />
              </Box>

              <Collapse in={!!error}>
                <Alert
                  severity='error'
                  onClose={() => setError('')}
                  sx={{
                    borderRadius: { xs: 1.5, sm: 2 },
                    fontSize: { xs: '0.85rem', sm: '0.88rem' },
                    py: 1,
                    '& .MuiAlert-icon': {
                      fontSize: { xs: '1.2rem', sm: '1.25rem' }
                    }
                  }}
                >
                  {error}
                </Alert>
              </Collapse>

              <Button
                type='submit'
                onClick={handleSubmit}
                variant='contained'
                fullWidth
                disabled={loading}
                sx={{
                  py: { xs: 1.25, sm: 1.4, md: 1.45 },
                  borderRadius: { xs: 1.5, sm: 2 },
                  fontSize: { xs: '0.95rem', sm: '1rem', md: '1.05rem' },
                  fontWeight: 600,
                  textTransform: 'none',
                  color: 'white !important',
                  background: isDarkMode
                    ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.9)}, ${alpha(theme.palette.primary.dark, 0.9)}) !important`
                    : 'linear-gradient(135deg, rgba(102,126,234,0.85), rgba(118,75,162,0.85)) !important',
                  boxShadow: isDarkMode
                    ? `0 6px 18px ${alpha(theme.palette.primary.main, 0.4)}`
                    : '0 6px 18px rgba(102, 126, 234, 0.35)',
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
                {loading ? (
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5 }}>
                    <CircularProgress size={20} sx={{ color: 'white' }} />
                    Verifying...
                  </Box>
                ) : (
                  'Join Game'
                )}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Features Section */}
        <Box
          sx={{
            mt: { xs: 3.5, sm: 4 },
            display: { xs: 'grid', sm: 'flex' },
            gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'unset' },
            alignItems: 'center',
            justifyContent: 'center',
            gap: { xs: 2, sm: 3.5 }
          }}
        >
          {highlightItems.map((item, index) => {
            const placementStyles =
              index === 0
                ? { justifySelf: { xs: 'start', sm: 'center' }, gridColumn: { xs: '1', sm: 'auto' } }
                : index === 1
                  ? { justifySelf: { xs: 'end', sm: 'center' }, gridColumn: { xs: '2', sm: 'auto' } }
                  : { justifySelf: { xs: 'center', sm: 'center' }, gridColumn: { xs: '1 / span 2', sm: 'auto' } }

            return (
              <Box
                key={item.id}
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'row', sm: 'column' },
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: { xs: 1, sm: 1.5 },
                  px: { xs: 1.5, sm: 2 },
                  py: { xs: 1.25, sm: 1.5 },
                  borderRadius: { xs: 2.5, sm: 3 },
                  background: isDarkMode
                    ? alpha(theme.palette.common.white, 0.12)
                    : 'rgba(255, 255, 255, 0.16)',
                  backdropFilter: 'blur(12px)',
                  minWidth: { sm: 120 },
                  border: isDarkMode ? `1px solid ${alpha(theme.palette.divider, 0.3)}` : 'none',
                  ...placementStyles
                }}
              >
                <Typography sx={{ fontSize: { xs: '1.5rem', sm: '1.6rem' }, lineHeight: 1 }}>{item.icon}</Typography>
                <Typography
                  variant='caption'
                  sx={{
                    color: alpha(theme.palette.common.white, 0.94),
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    fontSize: { xs: '0.75rem', sm: '0.8rem' }
                  }}
                >
                  {item.label}
                </Typography>
              </Box>
            )
          })}
        </Box>

        {/* Additional Info */}
        <Box
          sx={{
            textAlign: 'center',
            mt: { xs: 3, sm: 3.5, md: 4 },
            pt: { xs: 2, sm: 2.5, md: 3 },
            borderTop: `1px solid ${alpha(theme.palette.common.white, isDarkMode ? 0.3 : 0.22)}`
          }}
        >
          <Typography
            variant='body2'
            sx={{
              color: alpha(theme.palette.common.white, isDarkMode ? 0.9 : 0.88),
              fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' },
              fontWeight: 500,
              letterSpacing: '0.01em'
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
