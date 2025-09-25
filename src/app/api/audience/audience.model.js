import mongoose from 'mongoose'

const locationSchema = new mongoose.Schema({
  country: { type: String },
  region: { type: String },
  city: { type: String }
})

const ageGroupSchema = new mongoose.Schema({
  min: { type: Number, min: 0, max: 120 },
  max: { type: Number, min: 0, max: 120 }
})

// New filter schema to store operations and order
const filterSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['age', 'location', 'gender'],
    required: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed, // Can be ageGroup, location, or gender
    required: true
  },
  operation: {
    type: String,
    enum: ['AND', 'OR'],
    required: false // First filter doesn't need an operation
  },
  order: {
    type: Number,
    required: true
  }
})

export const audienceSchema = new mongoose.Schema(
  {
    audienceName: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    // New structured filters array
    filters: [filterSchema],
    // Keep legacy fields for backward compatibility (will be deprecated)
    location: locationSchema,
    gender: {
      type: [String],
      enum: ['male', 'female', 'other']
    },
    ageGroup: ageGroupSchema,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true
    },
    membersCount: {
      type: Number,
      default: 0
    },
    creatorEmail: {
      type: String,
      required: true
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: Date,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users'
    },
    updatorEmail: String,
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users'
    },
    deletorEmail: String
  },
  { timestamps: true }
)

// Add indexes for better performance
audienceSchema.index({ audienceName: 1 }, { unique: true })
audienceSchema.index({ createdBy: 1 })

const Audience = mongoose.models?.audiences || mongoose.model('audiences', audienceSchema)

export default Audience
