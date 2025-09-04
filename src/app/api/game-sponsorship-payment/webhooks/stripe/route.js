import { NextResponse } from 'next/server'
import * as GameSponsorshipPaymentService from '../../game-sponsorship-payment.service'
import Stripe from 'stripe'
import Sponsorship from '@/app/api/sponsorship/sponsorship.model'

export const dynamic = 'force-dynamic'; // Ensure this is a dynamic route
export const runtime = 'nodejs'; // Specify the runtime environment
export const fetchCache = 'force-no-store'; // Disable caching

const stripe = Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_7e58bb3bbfef88f65591b5bbbb2e931b3cccf8f906edb012ea8a4aeff3fc2586'

export async function POST(request) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    let event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    console.log('Game sponsorship webhook event:', event.type)

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object
        console.log('Game sponsorship payment succeeded:', paymentIntent.id)

        // Only process game sponsorship payments
        if (paymentIntent.metadata.type === 'game_sponsorship') {
          const result = await GameSponsorshipPaymentService.handlePaymentSuccess(paymentIntent)
          
          if (result.status === 'success') {
            console.log('Game sponsorship payment processed successfully')
          } else {
            console.error('Game sponsorship payment processing failed:', result.message)
          }
        }
        break

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object
        console.log('Game sponsorship payment failed:', failedPayment.id)
        
        // Update sponsorship status to failed
        if (failedPayment.metadata.type === 'game_sponsorship') {
          try {
            const sponsorship = await Sponsorship.findById(failedPayment.metadata.sponsorshipId)
            if (sponsorship) {
              sponsorship.sponsorshipStatus = 'failed'
              await sponsorship.save()
            }
          } catch (err) {
            console.error('Error updating failed sponsorship:', err)
          }
        }
        break

      default:
        console.log(`Unhandled game sponsorship event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Game sponsorship webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
