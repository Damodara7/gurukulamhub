import mongoose from 'mongoose'

export const groupRequestSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'groups',
      required: true
    },
    userEmail: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    approvedAt: {
      type: Date
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users'
    },
    approvedEmail: {
      type: String
    },
    rejectedAt: {
      type: Date
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users'
    },
    rejectedEmail: {
      type: String
    },
    rejectedReason: {
      type: String
    }
  },
  { timestamps: true }
)

// Add indexes for better performance
groupRequestSchema.index({ groupId: 1, userEmail: 1 }, { unique: true })
groupRequestSchema.index({ groupId: 1, status: 1 })
groupRequestSchema.index({ userEmail: 1 })
groupRequestSchema.index({ status: 1 })

const GroupRequest = mongoose.models?.groupRequests || mongoose.model('groupRequests', groupRequestSchema)

export default GroupRequest
