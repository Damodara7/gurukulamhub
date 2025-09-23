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

export const audienceSchema = new mongoose.Schema(
  {
    audienceName: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    location: locationSchema,
    gender: {
      type: [String],
      enum: ['male', 'female', 'other']
    },
    ageGroup: ageGroupSchema,
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
      }
    ],
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
