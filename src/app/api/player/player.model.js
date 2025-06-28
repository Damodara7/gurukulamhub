import mongoose from 'mongoose'
import User from '@/app/models/user.model'
import QuestionsModel from '../question/question.model'
import GamesModel from '../game/game.model'

const answerSchema = new mongoose.Schema({
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'questions'
  },
  answer: mongoose.Schema.Types.Mixed, // string or array
  marks: Number,
  hintMarks: Number,
  hintUsed: Boolean,
  skipped: Boolean,
  answerTime: Number, // ms
  fffPoints: Number,
  answeredAt: Date
})

const playerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true
    },
    game: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'game',
      required: true
    },
    email: { type: String, required: true },
    registeredAt: { type: Date, default: Date.now },
    finishedAt: Date,
    score: { type: Number, default: 0 },
    fffPoints: { type: Number, default: 0 },
    answers: { type: [answerSchema], default: [] },
    completed: { type: Boolean, default: false },
    status: { type: String, enum: ['registered', 'participated', 'completed'], default: 'registered' },
    joinedAt: { type: Date },
    // Add any additional fields as needed
  },
  { timestamps: true }
)

const Player = mongoose.models.player || mongoose.model('player', playerSchema)

export default Player

