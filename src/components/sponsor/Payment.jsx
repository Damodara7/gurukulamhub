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
                stripe listen --forward-to http://localhost:3000/api/sponsorship-payment/webhooks/stripe --skip-verify
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
          {sponsorship.games.length > 0 && (
            <Typography variant='body1' gutterBottom>
              Games: {sponsorship.games.join(', ')}
            </Typography>
          )}
          {sponsorship.quizzes.length > 0 && (
            <>
              <Typography variant='body1' gutterBottom>
                Quizzes: {sponsorship.quizzes?.map(q => q.title).join(', ')}
              </Typography>
              {(() => {
                let area = ``
                if (sponsorship.location?.country) {
                  area += `${sponsorship.location?.country}`
                }
                if (sponsorship.location?.region) {
                  area += `, ${sponsorship.location?.region}`
                }
                if (sponsorship.location?.city) {
                  area += `, ${sponsorship.location?.city}`
                }
                return (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <Typography variant='body1' sx={{ fontWeight: 500 }}>
                      You sponsored for games in area:
                    </Typography>
                    <Typography variant='body1' component='span'>
                      {area}
                    </Typography>
                  </Box>
                )
              })()}
            </>
          )}
          {sponsorship.sponsorType === 'area' &&
            (() => {
              let area = ``
              if (sponsorship.location?.country) {
                area += `${sponsorship.location?.country}`
              }
              if (sponsorship.location?.region) {
                area += `, ${sponsorship.location?.region}`
              }
              if (sponsorship.location?.city) {
                area += `, ${sponsorship.location?.city}`
              }
              return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <Typography variant='body1' sx={{ fontWeight: 500 }}>
                    Sponsoring for games in area:
                  </Typography>
                  <Typography variant='body1' component='span'>
                    {area}
                  </Typography>
                </Box>
              )
            })()}

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
