import { NextResponse } from 'next/server'
import Sponsorship from '@/app/api/sponsorship/sponsorship.model'
import User from '@/app/models/user.model.js'
import {
  createSponsorshipPaymentCompletedNotification,
  createSponsorshipPaymentFailedNotification
} from '@/app/api/notifications/notification.helpers.js'
import Stripe from 'stripe'

// depricated
// export const config = {
//   api: {
//     bodyParser: false // Disable default body parsing
//   }
// }
export const dynamic = 'force-dynamic'; // Ensure this is a dynamic route
export const runtime = 'nodejs'; // Specify the runtime environment
export const fetchCache = 'force-no-store'; // Disable caching

// Lazy initialization to avoid build-time errors
let stripe = null
const getStripe = () => {
  if (!stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY || process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY

    if (!secretKey) {
      throw new Error('Stripe secret key is not configured. Please set STRIPE_SECRET_KEY in the environment.')
    }

    stripe = new Stripe(secretKey, { apiVersion: '2023-10-16' })
  }
  return stripe
}

export async function POST(request) {
  try {
    console.log('Inside /api/webhooks/stripe')

    // Get raw body as buffer
    const rawBody = await request.text()
    console.log({rawBody})
    const sig = request.headers.get('stripe-signature')
    console.log('Sig', sig)

    const endpointSecret =
      process.env.STRIPE_WEBHOOK_SECRET || 'whsec_7e58bb3bbfef88f65591b5bbbb2e931b3cccf8f906edb012ea8a4aeff3fc2586'

    let event

    try {
      event = getStripe().webhooks.constructEvent(rawBody, sig, endpointSecret)
    } catch (err) {
      console.error('Webhook error:', err.message)
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntentSucceeded = event.data.object
        const { sponsorshipId, paymentId } = paymentIntentSucceeded.metadata

        const sponsorship = await Sponsorship.findOne({ _id: sponsorshipId })
        if (!sponsorship) {
          console.error('Sponsorship not found')
          return NextResponse.json({ error: 'Sponsorship not found' }, { status: 404 })
        }

        sponsorship.sponsorshipStatus = 'completed'
        await sponsorship.save()

        // ✅ NOTIFICATION: Notify sponsor that payment was completed
        if (sponsorship.rewardType === 'cash') {
          try {
            console.log('[Webhook] Payment succeeded, finding sponsor user...')
            const sponsorEmail = sponsorship.accountHolderEmail || sponsorship.email
            if (sponsorEmail) {
              const sponsorUser = await User.findOne({ email: sponsorEmail })
                .select('_id email')
                .lean()

              if (sponsorUser) {
                const notificationResult = await createSponsorshipPaymentCompletedNotification(sponsorUser._id, {
                  _id: sponsorship._id,
                  id: sponsorship._id,
                  sponsorshipAmount: sponsorship.sponsorshipAmount,
                  currency: sponsorship.currency || 'INR',
                  paymentId: paymentIntentSucceeded.id,
                  completedAt: new Date()
                })
                console.log('[Webhook] Created payment completed notification for sponsor:', notificationResult)
              } else {
                console.warn('[Webhook] Sponsor user not found for email:', sponsorEmail)
              }
            } else {
              console.warn('[Webhook] No sponsor email found in sponsorship')
            }
          } catch (notificationError) {
            console.error('[Webhook] Error creating payment completed notification:', notificationError)
            // Don't fail the webhook if notification fails
          }
        }
        break

      case 'payment_intent.payment_failed':
        const paymentIntentFailed = event.data.object
        const { sponsorshipId: sponsorshipIdFailed, paymentId: paymentIdFailed } = paymentIntentFailed.metadata

        const sponsorshipFailed = await Sponsorship.findOne({ _id: sponsorshipIdFailed })
        if (!sponsorshipFailed) {
          console.error('Sponsorship not found')
          return NextResponse.json({ error: 'Sponsorship not found' }, { status: 404 })
        }

        sponsorshipFailed.sponsorshipStatus = 'failed'
        await sponsorshipFailed.save()

        // ✅ NOTIFICATION: Notify sponsor that payment failed
        if (sponsorshipFailed.rewardType === 'cash') {
          try {
            console.log('[Webhook] Payment failed, finding sponsor user...')
            const sponsorEmail = sponsorshipFailed.accountHolderEmail || sponsorshipFailed.email
            if (sponsorEmail) {
              const sponsorUser = await User.findOne({ email: sponsorEmail })
                .select('_id email')
                .lean()

              if (sponsorUser) {
                // Extract failure reason from Stripe payment intent
                const failureReason =
                  paymentIntentFailed.last_payment_error?.message ||
                  paymentIntentFailed.last_payment_error?.decline_code ||
                  paymentIntentFailed.outcome?.reason ||
                  null

                const notificationResult = await createSponsorshipPaymentFailedNotification(sponsorUser._id, {
                  _id: sponsorshipFailed._id,
                  id: sponsorshipFailed._id,
                  sponsorshipAmount: sponsorshipFailed.sponsorshipAmount,
                  currency: sponsorshipFailed.currency || 'INR',
                  paymentId: paymentIntentFailed.id,
                  failureReason: failureReason,
                  failedAt: new Date()
                })
                console.log('[Webhook] Created payment failed notification for sponsor:', notificationResult)
              } else {
                console.warn('[Webhook] Sponsor user not found for email:', sponsorEmail)
              }
            } else {
              console.warn('[Webhook] No sponsor email found in sponsorship')
            }
          } catch (notificationError) {
            console.error('[Webhook] Error creating payment failed notification:', notificationError)
            // Don't fail the webhook if notification fails
          }
        }
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
