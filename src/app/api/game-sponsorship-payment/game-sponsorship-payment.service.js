import Stripe from 'stripe'
import connectMongo from '@/utils/dbConnect-mongo'
import Sponsorship from '@/app/api/sponsorship/sponsorship.model'
import * as GameSponsorshipService from '../game-sponsorship/game-sponsorship.service'

const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

export async function createPaymentIntent(data) {
  try {
    await connectMongo()

    const { sponsorshipAmount, currency, sponsorshipId, gameId, rewardId } = data

    // Get the sponsorship
    const sponsorship = await Sponsorship.findById(sponsorshipId)
    if (!sponsorship) {
      throw new Error('Sponsorship not found')
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: sponsorshipAmount * 100, // Convert to cents
      currency: currency.toLowerCase(),
      description: `Game sponsorship for reward.`,
      automatic_payment_methods: { enabled: true },
      metadata: {
        sponsorshipId: sponsorshipId.toString(),
        gameId: gameId.toString(),
        rewardId: rewardId.toString(),
        type: 'game_sponsorship'
      }
    })

    // Update sponsorship status
    sponsorship.sponsorshipStatus = 'pending'
    await sponsorship.save()

    return {
      status: 'success',
      message: 'Payment intent created successfully',
      result: {
        clientSecret: paymentIntent.client_secret,
        sponsorshipId: sponsorship._id,
        paymentId: paymentIntent.id
      }
    }
  } catch (err) {
    console.error('Game sponsorship payment intent creation error:', err)
    return {
      status: 'error',
      message: err.message,
      result: null
    }
  }
}

export async function handlePaymentSuccess(paymentIntent) {
  try {
    await connectMongo()

    const { sponsorshipId, gameId, rewardId } = paymentIntent.metadata

    // Get the sponsorship
    const sponsorship = await Sponsorship.findById(sponsorshipId)
    if (!sponsorship) {
      throw new Error('Sponsorship not found')
    }

    // Update sponsorship status
    sponsorship.sponsorshipStatus = 'completed'
    await sponsorship.save()

    // Update the game with the sponsorship
    const allocatedAmount =
      sponsorship.rewardType === 'cash' ? sponsorship.sponsorshipAmount : sponsorship.numberOfNonCashItems

    const result = await GameSponsorshipService.updateGameWithSponsorship(
      sponsorshipId,
      gameId,
      rewardId,
      allocatedAmount
    )

    if (result.status === 'success') {
      return {
        status: 'success',
        message: 'Game sponsorship payment processed successfully',
        result: result.result
      }
    } else {
      throw new Error(result.message)
    }
  } catch (err) {
    console.error('Game sponsorship payment success handling error:', err)
    return {
      status: 'error',
      message: err.message,
      result: null
    }
  }
}
