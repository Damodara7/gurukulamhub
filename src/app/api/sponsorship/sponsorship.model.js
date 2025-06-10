import mongoose from 'mongoose'
import QuizModel from '../../api/quiz/quiz.model'
import GameModel from '../game/game.model'

const locationSchema = new mongoose.Schema({
  country: {
    type: String
  },
  region: {
    type: String
  },
  city: {
    type: String
  }
})

const sponsoredSchema = mongoose.Schema({
  game: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'game'
  },
  rewardSponsorships: {
    type: [
      {
        allocated: Number,
        rewardSponsorshipId: String
      }
    ],
    default: []
  }
})

const sponsorshipSchema = new mongoose.Schema(
  {
    sponsorType: {
      type: String,
      required: true,
      enum: ['game', 'quiz', 'area']
    },
    sponsorerType: {
      type: String,
      required: true,
      enum: ['individual', 'organization']
    },
    games: [String],
    quizzes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'quizzes'
      }
    ],
    location: locationSchema,
    orgName: String,
    website: String,
    orgType: String,
    email: String,
    fullname: String,
    accountHolderEmail: String,
    mobileNumber: String,
    sponsorshipAmount: Number,
    availableAmount: Number,
    currency: {
      type: String,
      enum: ['INR', 'USD'],
      default: 'INR'
    },
    rewardType: {
      type: String,
      enum: ['cash', 'physicalGift'],
      default: 'cash'
    },
    nonCashItem: String,
    numberOfNonCashItems: Number,
    availableItems: Number,
    rewardValuePerItem: Number,
    rewardValue: Number,
    rewardDescription: String,
    nonCashSponsorshipStatus: {
      type: String,
      enum: ['pending', 'completed', 'rejected'],
      required: function () {
        return this.rewardType === 'physicalGift'
      }
    },
    sponsorshipStatus: {
      type: String,
      enum: ['created', 'pending', 'failed', 'completed', 'expired'],
      required: function () {
        return this.rewardType === 'cash'
      }
      // 'created' --> when sponsorship submitted, just before payment initiated
      // 'pending' --> payment initiated but not completed
      // 'failed' --> payment failed
      // 'completed' --> payment completed and sponsorship approved
      // 'expired' --> sponsorship expired
    },
    sponsorshipExpiresAt: {
      type: Date
    },
    sponsored: {
      type: [sponsoredSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
)

const Sponsorship = mongoose.models.sponsorship || mongoose.model('sponsorship', sponsorshipSchema)

export default Sponsorship
