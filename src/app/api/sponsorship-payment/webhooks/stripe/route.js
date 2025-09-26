import { NextResponse } from 'next/server'
import Sponsorship from '@/app/api/sponsorship/sponsorship.model'
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

const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

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
      event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret)
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
