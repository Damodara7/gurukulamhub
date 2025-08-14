import mongoose from 'mongoose'
import User from '@/app/models/user.model'

const locationSchema = new mongoose.Schema({
  country: { type: String },
  region: { type: String },
  city: { type: String }
})

const ageGroupSchema = new mongoose.Schema({
  min: { type: Number, min: 0, max: 120 },
  max: { type: Number, min: 0, max: 120 }
})

export const groupSchema = new mongoose.Schema(
  {
    groupName: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    location: locationSchema,
    gender: {
      type: String,
      enum: ['male', 'female', 'other']
    },
    ageGroup: ageGroupSchema,
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
groupSchema.index({ groupName: 1 }, { unique: true })
groupSchema.index({ createdBy: 1 })

const Group = mongoose.models?.groups || mongoose.model('groups', groupSchema)

export default Group
