import mongoose from 'mongoose'
import Quiz from '../quiz/quiz.model'
import User from '@/app/models/user.model'
import QuestionsModel from '../question/question.model'
import SponsorshipModel from '../sponsorship/sponsorship.model'

const locationSchema = new mongoose.Schema({
  country: String,
  region: String,
  city: String
})
const registeredUserSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  },
  email: String,
  registeredAt: Date
})
const answerSchema = new mongoose.Schema({
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'questions'
  },
  answer: {
    type: mongoose.Schema.Types.Mixed,
    validate: {
      validator: function (value) {
        return typeof value === 'string' || (Array.isArray(value) && value.every(item => typeof item === 'string'))
      },
      message: 'Answer must be either a string or an array of strings'
    }
  },
  marks: Number,
  hintMarks: Number,
  hintUsed: Boolean,
  skipped: Boolean,
  answerTime: Number, // Time taken (in ms) to answer this question
  fffPoints: Number,
  answeredAt: Date // Timestamp when answered
})
const participatedUserSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  },
  email: String,
  joinedAt: Date,
  score: { type: Number, default: 0 },
  fffPoints: { type: Number, default: 0 },
  answers: { type: [answerSchema], default: [] },
  completed: {
    type: Boolean,
    default: false
  },
  finishedAt: Date // When they completed the game
})
const sponsorerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  },
  email: String,
  sponsorshipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'sponsorship'
  },
  rewardDetails: {
    rewardType: {
      type: String,
      enum: ['cash', 'physicalGift']
    },
    rewardValuePerItem: Number, // For physical gift only
    rewardValue: Number, // Total Cash (OR) numberOfNonCashRewards * rewardValuePerItem
    currency: {
      type: String,
      default: 'INR'
    },
    nonCashReward: String,
    numberOfNonCashRewards: Number,
    allocated: Number // ==> numberOfNonCashRewards for PHYSICALGIFT (OR) rewardValue for CASH
  }
})
const rewardSchema = new mongoose.Schema({
  position: {
    type: Number,
    enum: [1, 2, 3, 4, 5]
  },
  numberOfWinnersForThisPosition: {
    type: Number,
    default: 1,
    min: 1
  },
  rewardValuePerWinner: Number,
  rewardType: {
    type: String,
    enum: ['cash', 'physicalGift'],
    default: 'cash'
  },
  currency: {
    type: String,
    default: 'INR'
  },
  nonCashReward: String,
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
      ref: 'quizzes', //Need to be changed to "quiz"
      required: true
    },
    maxScore: Number,
    questionsCount: Number,
    location: locationSchema,
    startTime: {
      type: Date,
      required: function() {
        return this.status !== 'awaiting_sponsorship' && this.status !== 'sponsored'
      }
    },
    timezone: {
      type: String,
      required: function() {
        return this.status !== 'awaiting_sponsorship' && this.status !== 'sponsored'
      }
    },
    gameMode: {
      type: String,
      enum: ['live', 'self-paced'],
      default: 'live',
      required: true
    },
    forwardType: {
      type: String,
      enum: ['auto', 'admin'],
      default: 'auto'
    },
    forwardingAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users'
    },
    liveQuestionIndex: {
      type: Number,
      default: 0
    },
    liveQuestionStartedAt: {
      type: Date
    },
    duration: {
      // In seconds
      type: Number,
      required: function() {
        return this.status !== 'awaiting_sponsorship' && this.status !== 'sponsored' && this.gameMode === 'self-paced'
      }
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
    // registeredUsers: {
    //   type: [registeredUserSchema],
    //   default: []
    // },
    // participatedUsers: {
    //   type: [participatedUserSchema],
    //   default: []
    // },
    limitPlayers: Boolean,
    maxPlayers: {
      type: Number,
      min: 1,
      default: 100000
    },
    status: {
      type: String,
      enum: ['created', 'approved', 'lobby', 'live', 'completed', 'cancelled', 'awaiting_sponsorship', 'sponsored'],
      default: 'created'
    },
    cancellationReason: String,
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
      ref: 'users',
      required: true
    },
    creatorEmail: String,
    approvedAt: Date,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users'
    },
    approverEmail: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users'
    },
    updaterEmail: String,
    deletedAt: Date,
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users'
    },
    deleterEmail: String,
    tags: [String],
    audienceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'audiences'
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)

const Game = mongoose.models.game || mongoose.model('game', gameSchema)

export default Game
