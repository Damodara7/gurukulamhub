import Stripe from 'stripe'
import connectMongo from '@/utils/dbConnect-mongo'
import Sponsorship from '@/app/api/sponsorship/sponsorship.model'
import * as GameSponsorshipService from '../game-sponsorship/game-sponsorship.service'
import {
  broadcastSponsorGameDetails,
  broadcastRewardSponsorshipUpdate
} from '@/app/api/ws/sponsor-games/[gameId]/publishers'
import { broadcastSponsorGamesList, broadcastGameStatusChange } from '@/app/api/ws/sponsor-games/publishers'

// Lazy initialization to avoid build-time errors
let stripe = null
const getStripe = () => {
  if (!stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY || process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY

    if (!secretKey) {
      throw new Error('Stripe secret key is not configured. Please set STRIPE_SECRET_KEY or NEXT_PUBLIC_STRIPE_SECRET_KEY in the environment.')
    }

    stripe = new Stripe(secretKey, { apiVersion: '2023-10-16' })
  }
  return stripe
}

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
    const paymentIntent = await getStripe().paymentIntents.create({
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
      const { game, reward } = result.result

      // Broadcast WebSocket updates
      try {
        // Broadcast updated game details
        if (game) {
          broadcastSponsorGameDetails(gameId, game)
        }

        // Broadcast reward sponsorship update
        const updatedReward = game?.rewards?.find(
          r => (r._id && r._id.toString() === rewardId) || r.position.toString() === rewardId
        )
        if (updatedReward) {
          broadcastRewardSponsorshipUpdate(gameId, rewardId, updatedReward)
        }

        // If game is now fully sponsored, broadcast status change
        if (game?.status === 'sponsored') {
          broadcastGameStatusChange(gameId, 'sponsored')
        }
      } catch (wsError) {
        console.error('[WS] Error broadcasting sponsor game updates:', wsError)
        // Don't fail the payment if WebSocket broadcast fails
      }

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
