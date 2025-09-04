'use client'
import React, { useState } from 'react'
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { API_URLS } from '@/configs/apiConfig'
import * as RestApi from '@/utils/restApiUtil'
import { useParams } from 'next/navigation'

function GamePaymentForm({ amount, sponsorshipId, currency, gameId, rewardId }) {
  const stripe = useStripe()
  const elements = useElements()
  const { lang: locale } = useParams()

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
      // Fetch clientSecret for game sponsorship payment
      const response = await RestApi.post(`${API_URLS.v0.GAME_SPONSORSHIP_PAYMENT}`, {
        sponsorshipAmount: amount * 100,
        currency: currency,
        sponsorshipId,
        gameId,
        rewardId
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
            return_url: `http://localhost:3000/${locale}/sponsor/game-payment-success?amount=${amount}&sponsorshipId=${
              data.sponsorshipId || sponsorshipId
            }&paymentId=${data.paymentId}&gameId=${gameId}&rewardId=${rewardId}`
          },
          metadata: {
            sponsorshipId: data?.sponsorshipId?.toString() || sponsorshipId.toString(),
            gameId: gameId.toString(),
            rewardId: rewardId.toString()
          }
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
      <div className='flex items-center justify-center'>
        <div
          className='inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white'
          role='status'
        >
          <span className='!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]'>
            Loading...
          </span>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className='bg-white p-2 rounded-md text-black'>
      <PaymentElement />
      {errorMessage && <div className='text-red-500'>{errorMessage}</div>}
      <button
        className='text-white bg-black mt-3 w-full p-5 font-bold rounded-md disabled:opacity-50 disabled:animate-pulse'
        disabled={loading || !stripe}
        type='submit'
      >
        {loading ? 'Processing...' : `Pay ₹${amount}`}
      </button>
    </form>
  )
}

export default GamePaymentForm
