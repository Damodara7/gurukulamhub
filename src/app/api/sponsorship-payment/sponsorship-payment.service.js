import connectMongo from '@/utils/dbConnect-mongo'
import SponsorshipPayment from './sponsorship-payment.model'
import Sponsorship from '../sponsorship/sponsorship.model'
import Stripe from 'stripe'

const stripe = Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY)

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
    const paymentIntent = await stripe.paymentIntents.create({
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
