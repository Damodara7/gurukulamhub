import mongoose from 'mongoose'

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  isCorrect: { type: Boolean, default: false }
})

const videoQuestionSchema = new mongoose.Schema({
  type: { type: String, enum: ['single-choice', 'multiple-choice'], required: true },
  text: { type: String, required: true },
  options: { type: [optionSchema], required: true },
  explanation: { type: String, default: '' },
  marks: { type: Number, default: 1 },
  invocationTime: { type: Number, default: 1 },
  conceptStartTime: { type: Number, default:0},
  invocationAtEnd: { type: Boolean, default: false }
})

const recommendedSegmentSchema = new mongoose.Schema({
  startTime: { type: Number, required: true },
  endTime: { type: Number, required: true },
  description: { type: String }
})

const videosSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    contextIds: {
      type: [String],
      required: true
    },
    genericContextIds: {
      type: [String],
      required: true
    },
    academicContextIds: {
      type: [String]
    },
    questions: {
      type: [videoQuestionSchema],
      default: []
    },
    recommendedSegments: {
      type: [recommendedSegmentSchema],
      default: []
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: String,
      required: true
    },
    updatedBy: {
      type: String
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)

// Register the videos model
const Videos = mongoose.models.videos || mongoose.model('videos', videosSchema)

export default Videos
