import mongoose from 'mongoose'

const filterSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      trim: true
    },
    criteria: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    operator: {
      type: String,
      enum: ['AND', 'OR', 'NOT'],
      required: false
    }
  },
  { _id: false }
)

export const audienceSchema = new mongoose.Schema(
  {
    audienceName: {
      type: String,
      required: true
    },
    description: {
      type: String
    },

    filters: {
      type: [filterSchema],
      default: []
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true
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
