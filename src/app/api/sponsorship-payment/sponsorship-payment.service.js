import connectMongo from '@/utils/dbConnect-mongo'
import SponsorshipPayment from './sponsorship-payment.model'
import Sponsorship from '../sponsorship/sponsorship.model'
import User from '@/app/models/user.model.js'
import { createSponsorshipPaymentPendingNotification } from '../notifications/notification.helpers.js'
import Stripe from 'stripe'

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

export async function create({ data }) {
  try {
    await connectMongo()

    const sponsorship = await Sponsorship.findById(data.sponsorshipId)

    if (!sponsorship) {
      return { status: 'error', message: 'Sponsorship not found!', result: null }
    }
    if (sponsorship.sponsorshipStatus === 'cancelled') {
      return { status: 'error', message: "Sponsorship has been cancelled, can't proceed for payment!", result: null }
    }
    if (sponsorship.sponsorshipStatus === 'completed') {
      return { status: 'error', message: "This sponsorship has already completed!", result: null }
    }

    // Use Stripe to process the payment
    const paymentIntent = await getStripe().paymentIntents.create({
      amount: sponsorship.sponsorshipAmount * 100 || data.sponsorshipAmount,
      currency: data.currency || 'inr',
      description: `Sponsorship to spread Indian Knowledge System.`,
      automatic_payment_methods: { enabled: true },
      metadata: { sponsorshipId: sponsorship._id.toString() } // Include sponsorshipId in metadata
    })

    const sponsorshipPayment = new SponsorshipPayment({
      sponsorshipId: sponsorship._id,
      paymentId: paymentIntent.id,
      amount: sponsorship.sponsorshipAmount
    })
    await sponsorshipPayment.save()

    // Change Sponsorship status to pending for payment
    sponsorship.sponsorshipStatus = 'pending'
    await sponsorship.save()

    // ✅ NOTIFICATION: Notify sponsor that payment has been initiated
    if (sponsorship.rewardType === 'cash') {
      try {
        console.log('[Sponsorship Payment Service] Payment initiated, finding sponsor user...')
        // Find sponsor user by email
        const sponsorEmail = sponsorship.accountHolderEmail || sponsorship.email
        if (sponsorEmail) {
          const sponsorUser = await User.findOne({ email: sponsorEmail })
            .select('_id email')
            .lean()

          if (sponsorUser) {
            const notificationResult = await createSponsorshipPaymentPendingNotification(sponsorUser._id, {
              _id: sponsorship._id,
              id: sponsorship._id,
              sponsorshipAmount: sponsorship.sponsorshipAmount,
              currency: sponsorship.currency || 'INR',
              paymentId: paymentIntent.id,
              initiatedAt: new Date()
            })
            console.log('[Sponsorship Payment Service] Created payment pending notification for sponsor:', notificationResult)
          } else {
            console.warn('[Sponsorship Payment Service] Sponsor user not found for email:', sponsorEmail)
          }
        } else {
          console.warn('[Sponsorship Payment Service] No sponsor email found in sponsorship')
        }
      } catch (notificationError) {
        console.error('[Sponsorship Payment Service] Error creating payment pending notification:', notificationError)
        // Don't fail the payment creation if notification fails
      }
    }

    return {
      status: 'success',
      message: 'Sponsorship Payment created successfully',
      result: {
        sponsorshipPayment,
        paymentIntent,
        sponsorshipId: sponsorship._id,
        paymentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret
      }
    }
  } catch (err) {
    console.error(err)
    return { status: 'error', message: err.message, result: null }
  }
}
