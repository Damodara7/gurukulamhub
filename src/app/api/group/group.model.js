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

export const groupSchema = new mongoose.Schema(
  {
    groupName: {
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
    status: {
      type: String,
      enum: ['public', 'private'],
      default: 'private'
    },
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
groupSchema.index({ groupName: 1 }, { unique: true })
groupSchema.index({ createdBy: 1 })

const Group = mongoose.models?.groups || mongoose.model('groups', groupSchema)

export default Group
