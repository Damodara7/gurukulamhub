import mongoose from 'mongoose'

const locationSchema = new mongoose.Schema({
  country: { type: String },
  region: { type: String },
  city: { type: String },
  order: { type: Number },
  operation: {
    type: String,
    enum: ['AND', 'OR'],
    required: false // First filter doesn't need an operation
  }
})

const ageGroupSchema = new mongoose.Schema({
  min: { type: Number, min: 0, max: 120 },
  max: { type: Number, min: 0, max: 120 },
  order: { type: Number },
  operation: {
    type: String,
    enum: ['AND', 'OR'],
    required: false // First filter doesn't need an operation
  }
})

const genderSchema = new mongoose.Schema({
  values: {
    type: [String],
    enum: ['male', 'female', 'other'],
    validate: {
      validator: function (v) {
        return Array.isArray(v) && v.length > 0 && v.every(gender => ['male', 'female', 'other'].includes(gender))
      },
      message: 'Gender must be one or more of: male, female, other'
    }
  },
  order: { type: Number },
  operation: {
    type: String,
    enum: ['AND', 'OR'],
    required: false // First filter doesn't need an operation
  }
})

// Removed filterSchema - storing filters as simple objects

export const audienceSchema = new mongoose.Schema(
  {
    audienceName: {
      type: String,
      required: true
    },
    description: {
      type: String
    },

    // Keep legacy fields for backward compatibility (will be deprecated)
    location: locationSchema,
    gender: genderSchema,
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
