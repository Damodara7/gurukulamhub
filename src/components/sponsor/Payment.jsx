'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Box, Card, CardContent, Divider, Typography, alpha, useTheme, useMediaQuery, Container, CircularProgress } from '@mui/material'
import PaymentForm from './PaymentForm'
import Timer from './Timer'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'

const CURRENCY = 'inr'

function Payment({ sponsorship }) {
  const theme = useTheme()
  const isDarkMode = theme.palette.mode === 'dark'
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [remainingTime, setRemainingTime] = useState(0)

  // Use useMemo to prevent recreation of stripePromise on every render
  const stripePromise = useMemo(() => {
    return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  }, [])

  useEffect(() => {
    // Calculate remaining time
    if (sponsorship?.sponsorshipExpiresAt) {
      const expiresAt = new Date(sponsorship.sponsorshipExpiresAt).getTime()
      const now = new Date().getTime()
      setRemainingTime(Math.max(0, expiresAt - now))
    }
  }, [sponsorship])

  if (!sponsorship)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: 0, overflow: 'auto' }}>
        <CircularProgress />
      </Box>
    )

  const games = Array.isArray(sponsorship.games) ? sponsorship.games : []
  const gameNames = games.map(game =>
    typeof game === 'string' ? game : game?.title || game?.name || game?._id || 'Untitled Game'
  )
  const quizzes = Array.isArray(sponsorship.quizzes) ? sponsorship.quizzes : []
  const quizNames = quizzes.map(quiz =>
    typeof quiz === 'string' ? quiz : quiz?.title || quiz?.name || quiz?._id || 'Untitled Quiz'
  )

  const renderAreaSummary = (label = 'Selected area:') => {
    const parts = [sponsorship.location?.country, sponsorship.location?.region, sponsorship.location?.city].filter(
      Boolean
    )

    if (parts.length === 0) return null

    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: { xs: 0.5, sm: 1 },
          mb: { xs: 1.25, sm: 1.5 }
        }}
      >
        <Typography
          variant='body1'
          sx={{
            fontWeight: 500,
            color: 'text.primary',
            fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' }
          }}
        >
          {label}
        </Typography>
        <Typography
          variant='body1'
          component='span'
          sx={{
            color: 'text.secondary',
            fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' },
            wordBreak: 'break-word'
          }}
        >
          {parts.join(', ')}
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: { xs: 3, sm: 4 }, width: '100%', height: '100%', minHeight: 0, overflow: 'auto' }}>
      {/* Instructions */}
      <Box
        sx={{
          mb: { xs: 2.5, sm: 3 },
          mx: { xs: 1, sm: 2 },
          p: { xs: 2, sm: 2.5 },
          borderRadius: { xs: 2, sm: 3 },
          bgcolor: isDarkMode
            ? alpha(theme.palette.info.main, 0.1)
            : alpha(theme.palette.info.main, 0.05),
          border: `1px solid ${alpha(theme.palette.info.main, isDarkMode ? 0.2 : 0.1)}`
        }}
      >
        <Typography
          variant='h6'
          sx={{
            mb: { xs: 1.5, sm: 2 },
            fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
            color: 'text.primary'
          }}
        >
          To test payments:
        </Typography>
        <Box component='ol' sx={{ pl: { xs: 2, sm: 2.5 }, '& li': { mb: { xs: 1.25, sm: 1.5 } } }}>
          <li>
            <Typography
              variant='body2'
              sx={{
                color: 'text.secondary',
                fontSize: { xs: '0.88rem', sm: '0.9rem', md: '0.95rem' }
              }}
            >
              Open terminal and run this command:
            </Typography>
            <Box
              sx={{
                p: { xs: 1.25, sm: 1.5 },
                bgcolor: isDarkMode ? alpha(theme.palette.background.paper, 0.6) : alpha(theme.palette.grey[100], 0.8),
                borderRadius: { xs: 1, sm: 1.5 },
                mt: 1,
                overflow: 'auto',
                border: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.3 : 0.1)}`
              }}
            >
              <Typography
                variant='body2'
                component='code'
                sx={{
                  fontFamily: 'monospace',
                  color: 'text.primary',
                  fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' },
                  wordBreak: 'break-all'
                }}
              >
                stripe listen --forward-to{' '}
                {`${process.env.NEXT_PUBLIC_API_URL}/sponsorship-payment/webhooks/stripe --skip-verify`}
              </Typography>
            </Box>
          </li>
          <li>
            <Typography
              variant='body2'
              sx={{
                color: 'text.secondary',
                fontSize: { xs: '0.88rem', sm: '0.9rem', md: '0.95rem' }
              }}
            >
              Use this test card number:
            </Typography>
            <Box
              sx={{
                p: { xs: 1.25, sm: 1.5 },
                bgcolor: isDarkMode ? alpha(theme.palette.background.paper, 0.6) : alpha(theme.palette.grey[100], 0.8),
                borderRadius: { xs: 1, sm: 1.5 },
                mt: 1,
                border: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.3 : 0.1)}`
              }}
            >
              <Typography
                variant='body2'
                sx={{
                  fontWeight: 'bold',
                  color: 'text.primary',
                  fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' }
                }}
              >
                4000 0035 6000 0008
              </Typography>
            </Box>
          </li>
          <li>
            <Typography
              variant='body2'
              sx={{
                color: 'text.secondary',
                fontSize: { xs: '0.88rem', sm: '0.9rem', md: '0.95rem' }
              }}
            >
              Use any future date for expiry, any 3 digits for CVC
            </Typography>
          </li>
        </Box>
      </Box>

      {/* Payment Card */}
      <Card
        sx={{
          maxWidth: { xs: '100%', sm: '600px' },
          mx: 'auto',
          mt: { xs: 3, sm: 4 },
          bgcolor: isDarkMode ? alpha(theme.palette.background.paper, 0.6) : 'white',
          border: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.3 : 0.1)}`,
          boxShadow: isDarkMode
            ? `0 4px 20px ${alpha(theme.palette.common.black, 0.3)}`
            : '0 4px 20px rgba(0,0,0,0.08)',
          borderRadius: { xs: 3, sm: 4 }
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 3, md: 4 } }}>
          <Typography
            className='text-center'
            variant='h4'
            component='h2'
            gutterBottom
            sx={{
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
              color: 'text.primary',
              fontWeight: 700
            }}
          >
            Payment
          </Typography>
          <Typography
            variant='body1'
            gutterBottom
            sx={{
              color: 'text.secondary',
              fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' },
              wordBreak: 'break-word'
            }}
          >
            Sponsorship ID: {sponsorship._id}
          </Typography>
          {gameNames.length > 0 && (
            <Typography
              variant='body1'
              gutterBottom
              sx={{
                color: 'text.secondary',
                fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' },
                wordBreak: 'break-word'
              }}
            >
              Games: {gameNames.join(', ')}
            </Typography>
          )}
          {quizNames.length > 0 && (
            <>
              <Typography
                variant='body1'
                gutterBottom
                sx={{
                  color: 'text.secondary',
                  fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' },
                  wordBreak: 'break-word'
                }}
              >
                Quizzes: {quizNames.join(', ')}
              </Typography>
              {renderAreaSummary('You sponsored quizzes in area:')}
            </>
          )}
          {sponsorship.sponsorType === 'area' &&
            renderAreaSummary(quizNames.length > 0 ? 'Sponsoring quizzes in area:' : 'Sponsoring games in area:')}

          <Timer
            remainingTime={remainingTime}
            setRemainingTime={setRemainingTime}
            sponsorshipExpiresAt={sponsorship.sponsorshipExpiresAt}
          />

          {remainingTime > 0 ? (
            <>
              {stripePromise ? (
                <Elements
                  stripe={stripePromise}
                  options={{
                    mode: 'payment',
                    amount: sponsorship.sponsorshipAmount * 100,
                    currency: CURRENCY
                  }}
                >
                  <PaymentForm
                    amount={sponsorship.sponsorshipAmount}
                    currency={CURRENCY}
                    sponsorshipId={sponsorship._id}
                  />
                </Elements>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 3 }}>
                  <CircularProgress size={24} sx={{ mr: 2 }} />
                  <Typography
                    sx={{
                      color: 'text.secondary',
                      fontSize: { xs: '0.9rem', sm: '1rem' }
                    }}
                  >
                    Initializing payment gateway...
                  </Typography>
                </Box>
              )}
            </>
          ) : (
            <Typography
              variant='body1'
              color={sponsorship.sponsorshipStatus === 'completed' ? 'success.main' : 'error'}
              sx={{
                mt: { xs: 2, sm: 2.5 },
                fontWeight: 'bold',
                fontSize: { xs: '0.95rem', sm: '1rem' },
                textAlign: 'center',
                p: { xs: 1.5, sm: 2 },
                borderRadius: { xs: 1.5, sm: 2 },
                bgcolor:
                  sponsorship.sponsorshipStatus === 'completed'
                    ? alpha(theme.palette.success.main, isDarkMode ? 0.15 : 0.08)
                    : alpha(theme.palette.error.main, isDarkMode ? 0.15 : 0.08),
                border: `1px solid ${
                  sponsorship.sponsorshipStatus === 'completed'
                    ? alpha(theme.palette.success.main, isDarkMode ? 0.3 : 0.2)
                    : alpha(theme.palette.error.main, isDarkMode ? 0.3 : 0.2)
                }`
              }}
            >
              {sponsorship.sponsorshipStatus === 'completed'
                ? 'This sponsorship has already completed!'
                : 'Sponsorship Expired!'}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

export default Payment
