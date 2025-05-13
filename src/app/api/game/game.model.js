import mongoose from 'mongoose'

const locationSchema = new mongoose.Schema({
  country: String,
  region: String,
  city: String
})
const registeredUserSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  email: String,
  registeredAt: Date
})
const participatedUserSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  email: String,
  joinedAt: Date,
  score: Number,
  completed: {
    type: Boolean,
    default: false
  },
  finishedAt: Date // When they completed the game
})
const sponsorerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  email: String,
  rewardDetails: {
    rewardType: {
      type: String,
      enum: ['cash', 'physicalGift', 'other']
    },
    rewardValue: Number,
    currency: {
      type: String,
      default: 'INR'
    },
    nonCashReward: String,
    numberOfNonCashRewards: Number
  }
})
const rewardSchema = new mongoose.Schema({
  position: {
    type: Number,
    enum: [1, 2, 3, 4, 5]
  },
  numberOfCandidatesForThisPosition: {
    type: Number,
    default: 1,
    min: 1
  },
  sponsors: [sponsorerSchema],
  winners: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
      }
    ],
    default: []
  } // Store the winners for each reward position
})

const gameSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    pin: { type: String, unique: true, required: true },
    description: {
      type: String
    },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'quiz',
      required: true
    },
    location: locationSchema,
    startTime: {
      type: Date,
      required: true
    },
    duration: {
      // In seconds
      type: Number,
      required: true
    },
    promotionalVideoUrl: String,
    thumbnailPoster: String,
    requireRegistration: {
      type: Boolean,
      default: false
    },
    registrationEndTime: {
      type: Date
    },
    registeredUsers: {
      type: [registeredUserSchema],
      default: []
    },
    participatedUsers: {
      type: [participatedUserSchema],
      default: []
    },
    maxPlayers: {
      type: Number,
      min: 1
    },
    status: {
      type: String,
      enum: ['created', 'reg_open', 'reg_closed', 'lobby', 'live', 'completed', 'cancelled'],
      default: 'created'
    },
    rewards: {
      type: [rewardSchema],
      default: []
    },
    totalRewardValue: {
      type: Number
    },
    tags: {
      type: [String]
    },
    winnersDeclared: {
      // Flag to indicate if winners have been declared
      type: Boolean,
      default: false
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true
    },
    creatorEmail: String
  },
  { timestamps: true }
)

const Game = mongoose.models.game || mongoose.model('game', gameSchema)

export default Game
