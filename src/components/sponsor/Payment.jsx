'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Box, Card, CardContent, Divider, Typography } from '@mui/material'
import PaymentForm from './PaymentForm'
import Timer from './Timer'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'

const CURRENCY = 'inr'

function Payment({ sponsorship }) {
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

  if (!sponsorship) return <Typography>Loading...</Typography>

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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <Typography variant='body1' sx={{ fontWeight: 500 }}>
          {label}
        </Typography>
        <Typography variant='body1' component='span'>
          {parts.join(', ')}
        </Typography>
      </Box>
    )
  }

  return (
    <>
      {/* Instructions */}
      <Box sx={{ mb: 2, mx: 2 }}>
        <Typography variant='h6' sx={{ mb: 1 }}>
          To test payments:
        </Typography>
        <Box component='ol' sx={{ pl: 2.5, '& li': { mb: 1 } }}>
          <li>
            <Typography variant='body2'>Open terminal and run this command:</Typography>
            <Box sx={{ p: 1.5, bgcolor: '#e9ecef', borderRadius: 1, mt: 1, overflow: 'auto' }}>
              <Typography variant='body2' component='code' sx={{ fontFamily: 'monospace' }}>
                stripe listen --forward-to {`${process.env.NEXT_PUBLIC_API_URL}/sponsorship-payment/webhooks/stripe --skip-verify`}
              </Typography>
            </Box>
          </li>
          <li>
            <Typography variant='body2'>Use this test card number:</Typography>
            <Box sx={{ p: 1.5, bgcolor: '#e9ecef', borderRadius: 1, mt: 1 }}>
              <Typography variant='body2' sx={{ fontWeight: 'bold' }}>
                4000 0035 6000 0008
              </Typography>
            </Box>
          </li>
          <li>
            <Typography variant='body2'>Use any future date for expiry, any 3 digits for CVC</Typography>
          </li>
        </Box>
      </Box>

      {/* Payment Card */}
      <Card sx={{ maxWidth: 'sm', mx: 'auto', mt: 4 }}>
        <CardContent>
          <Typography className='text-center' variant='h4' component='h2' gutterBottom>
            Payment
          </Typography>
          <Typography variant='body1' gutterBottom>
            Sponsorship ID: {sponsorship._id}
          </Typography>
          {gameNames.length > 0 && (
            <Typography variant='body1' gutterBottom>
              Games: {gameNames.join(', ')}
            </Typography>
          )}
          {quizNames.length > 0 && (
            <>
              <Typography variant='body1' gutterBottom>
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
                <Typography>Initializing payment gateway...</Typography>
              )}
            </>
          ) : (
            <Typography
              variant='body1'
              color={sponsorship.sponsorshipStatus === 'completed' ? 'green' : 'error'}
              sx={{ mt: 2, fontWeight:'bold' }}
            >
              {sponsorship.sponsorshipStatus === 'completed'
                ? 'This sponsorship has already completed!'
                : `Sponsorship Expired!`}
            </Typography>
          )}
        </CardContent>
      </Card>
    </>
  )
}

export default Payment
