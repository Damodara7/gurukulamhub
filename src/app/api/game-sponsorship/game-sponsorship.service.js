import connectMongo from '@/utils/dbConnect-mongo'
import Sponsorship from '../sponsorship/sponsorship.model'
import Game from '../game/game.model'
import mongoose from 'mongoose'
import {updateSponsorshipsForGame, broadcastAdminGamesUpdate} from '../game/game.service'

  export async function createGameSponsorship(data) {
    try {
      await connectMongo()

      // Set initial status based on reward type
      const initialData = { 
        ...data, 
        sponsorshipExpiresAt: new Date(Date.now() + 2 * 60 * 1000) // 2 minutes
      }
      
      if (data.rewardType === 'physicalGift') {
        initialData.nonCashSponsorshipStatus = 'completed'
      } else if (data.rewardType === 'cash') {
        initialData.sponsorshipStatus = 'created'
      }
      
      const sponsorship = new Sponsorship(initialData)
      await sponsorship.save()

      console.log('Game sponsorship created:', sponsorship)

      return { 
        status: 'success', 
        message: 'Game sponsorship created successfully', 
        result: sponsorship 
      }
    } catch (err) {
      console.error('Game sponsorship creation error:', err)
      return { 
        status: 'error', 
        message: err.message, 
        result: null 
      }
    }
  }

  export async function getGameSponsorships(queryParams) {
    try {
      await connectMongo()

      const sponsorships = await Sponsorship.find({
        sponsorType: 'game',
        ...queryParams
      })
        .populate('quizzes', 'title _id')
        .sort({ createdAt: -1 })

      return { 
        status: 'success', 
        message: 'Game sponsorships fetched successfully', 
        result: sponsorships 
      }
    } catch (err) {
      console.error('Game sponsorships fetch error:', err)
      return { 
        status: 'error', 
        message: err.message, 
        result: null 
      }
    }
  }

  export async function updateGameWithSponsorship(sponsorshipId, gameId, rewardId, allocatedAmount) {
    try {
      await connectMongo()

      // Get the sponsorship details
      const sponsorship = await Sponsorship.findById(sponsorshipId)
      if (!sponsorship) {
        throw new Error('Sponsorship not found')
      }

      // Get the game
      const game = await Game.findById(gameId)
      if (!game) {
        throw new Error('Game not found')
      }

      // Find the specific reward
      const reward = game.rewards.find(r => 
        (r._id && r._id.toString() === rewardId) || 
        r.position.toString() === rewardId
      )

      if (!reward) {
        throw new Error('Reward not found')
      }

      // Add the sponsor to the reward
      const newSponsor = {
        _id: new mongoose.Types.ObjectId(), // Add unique ID for the sponsor
        email: sponsorship.email,
        sponsorshipId: sponsorship._id,
        allocated: allocatedAmount,
        rewardType: sponsorship.rewardType,
        currency: sponsorship.currency,
        rewardDetails: {
          rewardType: sponsorship.rewardType,
          allocated: allocatedAmount,
          currency: sponsorship.currency,
          ...(sponsorship.rewardType === 'cash' && {
            rewardValue: allocatedAmount
          }),
          ...(sponsorship.rewardType === 'physicalGift' && {
            nonCashReward: sponsorship.nonCashItem,
            numberOfNonCashRewards: allocatedAmount,
            rewardValuePerItem: sponsorship.rewardValuePerItem,
            rewardValue: allocatedAmount * sponsorship.rewardValuePerItem
          })
        }
      }

      // Add sponsor to reward
      reward.sponsors.push(newSponsor)

             // Update sponsorship status and available amount/items to 0 (since it's being used immediately)
       if (sponsorship.rewardType === 'cash') {
         sponsorship.sponsorshipStatus = 'completed'
         sponsorship.availableAmount = 0
       } else {
         sponsorship.nonCashSponsorshipStatus = 'completed'
         sponsorship.availableItems = 0
       }

      // Add to sponsored array
      const sponsoredEntry = {
        game: gameId,
        rewardSponsorships: [{
          allocated: allocatedAmount,
          rewardSponsorshipId: newSponsor._id.toString(),
          rewardId: reward._id || reward.position
        }]
      }

      sponsorship.sponsored.push(sponsoredEntry)

      // Save both documents
      await Promise.all([
        game.save({ validateBeforeSave: false }),
        sponsorship.save()
      ])

      await updateSponsorshipsForGame(game)

      // Check if all rewards are fully sponsored and update game status
      const allRewardsFullySponsored = game.rewards.every(reward => {
        const totalNeeded = reward.rewardType === 'cash' 
          ? reward.rewardValuePerWinner * reward.numberOfWinnersForThisPosition
          : reward.numberOfWinnersForThisPosition
        
        const totalAllocated = reward.sponsors?.reduce((sum, sponsor) => 
          sum + (sponsor.allocated || sponsor.rewardDetails?.allocated || 0), 0
        ) || 0
        
        return totalAllocated >= totalNeeded
      })

      if (allRewardsFullySponsored && game.status === 'awaiting_sponsorship') {
        game.status = 'sponsored'
        // Don't require timezone/startTime for sponsored games that haven't been scheduled yet
        await game.save({ validateBeforeSave: false })
      }

      // Broadcast admin games update to include awaiting_sponsorship and sponsored games
      await broadcastAdminGamesUpdate()

      return { 
        status: 'success', 
        message: 'Game updated with sponsorship successfully', 
        result: { game, sponsorship } 
      }
    } catch (err) {
      console.error('Game sponsorship update error:', err)
      return { 
        status: 'error', 
        message: err.message, 
        result: null 
      }
    }
  }
