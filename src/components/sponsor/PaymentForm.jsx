'use client'
import React, { useState } from 'react'
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { API_URLS } from '@/configs/apiConfig'
import * as RestApi from '@/utils/restApiUtil'
import { useParams } from 'next/navigation'
import { Box, Button, Alert, CircularProgress, alpha, useTheme, useMediaQuery } from '@mui/material'

function PaymentForm({ amount, sponsorshipId, currency }) {
  const stripe = useStripe()
  const elements = useElements()
  const { lang: locale } = useParams()
  const theme = useTheme()
  const isDarkMode = theme.palette.mode === 'dark'
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async event => {
    event.preventDefault()
    setLoading(true)

    if (!stripe || !elements) {
      setErrorMessage('Error: Stripe or Elements not loaded')
      setLoading(false)
      return
    }

    try {
      // Fetch clientSecret
      const response = await RestApi.post(`${API_URLS.v0.SPONSORSHIP_PAYMENT}`, {
        sponsorshipAmount: amount * 100,
        currency: currency,
        sponsorshipId
      })

      if (response.status === 'success') {
        const data = response.result // { clientSecret, sponsorshipId, paymentId }
        console.log({ data })

        // Submit payment details
        const { error: submitError } = await elements.submit()

        if (submitError) {
          setErrorMessage(submitError.message)
          setLoading(false)
          return
        }

        // Confirm payment
        const { error } = await stripe.confirmPayment({
          elements: elements,
          clientSecret: data.clientSecret,
          confirmParams: {
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/sponsor/payment-success?amount=${amount}&sponsorshipId=${
              data.sponsorshipId || sponsorshipId
            }&paymentId=${data.paymentId}`
          },
          metadata: {
            sponsorshipId: data?.sponsorshipId?.toString() || sponsorshipId.toString()
            // paymentId: data?.paymentId?.toString()
          } // Include sponsorshipId in metadata
        })

        if (error) {
          setErrorMessage(error.message)
        } else {
          setErrorMessage('Payment success')
        }
      } else if (response.status === 'error') {
        throw new Error('Failed to fetch client secret')
      }
    } catch (error) {
      console.error('Error:', error)
      setErrorMessage('Failed to process payment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!stripe || !elements) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
        <CircularProgress size={32} />
      </Box>
    )
  }

  return (
    <Box
      component='form'
      onSubmit={handleSubmit}
      sx={{
        bgcolor: isDarkMode ? alpha(theme.palette.background.paper, 0.4) : 'white',
        p: { xs: 2, sm: 2.5 },
        borderRadius: { xs: 2, sm: 3 },
        border: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.3 : 0.1)}`
      }}
    >
      <Box
        sx={{
          mb: { xs: 2, sm: 2.5 },
          '& .StripeElement': {
            color: isDarkMode ? theme.palette.text.primary : undefined
          }
        }}
      >
        <PaymentElement
          options={{
            layout: 'tabs'
          }}
        />
      </Box>
      {errorMessage && (
        <Alert
          severity='error'
          sx={{
            mb: { xs: 2, sm: 2.5 },
            borderRadius: { xs: 1.5, sm: 2 },
            fontSize: { xs: '0.88rem', sm: '0.9rem', md: '0.95rem' }
          }}
        >
          {errorMessage}
        </Alert>
      )}
      <Button
        type='submit'
        variant='contained'
        fullWidth
        disabled={loading || !stripe}
        sx={{
          mt: { xs: 2, sm: 2.5 },
          py: { xs: 1.5, sm: 1.75, md: 2 },
          fontSize: { xs: '0.95rem', sm: '1rem', md: '1.05rem' },
          fontWeight: 700,
          borderRadius: { xs: 1.5, sm: 2 },
          color: 'white',
          boxShadow: isDarkMode ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}` : undefined,
          '&:hover': {
            boxShadow: isDarkMode
              ? `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`
              : undefined,
            transform: 'translateY(-1px)'
          },
          '&:disabled': {
            opacity: 0.6,
            animation: loading ? 'pulse 1.5s ease-in-out infinite' : 'none',
            '@keyframes pulse': {
              '0%, 100%': { opacity: 0.6 },
              '50%': { opacity: 0.4 }
            }
          },
          transition: 'all 0.3s ease'
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <CircularProgress size={20} sx={{ color: 'white' }} />
            Processing...
          </Box>
        ) : (
          `Pay ₹${amount}`
        )}
      </Button>
    </Box>
  )
}

export default PaymentForm
