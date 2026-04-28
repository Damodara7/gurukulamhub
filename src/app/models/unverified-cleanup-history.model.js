import mongoose from 'mongoose'

const deletedUserSnapshotSchema = new mongoose.Schema(
  {
    userId: { type: String, default: '' },
    firstname: { type: String, default: '' },
    lastname: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    createdAt: { type: Date, default: null },
    wasOlderThan24Hours: { type: Boolean, default: false }
  },
  { _id: false }
)

const unverifiedCleanupHistorySchema = new mongoose.Schema(
  {
    cleanupType: {
      type: String,
      enum: ['automatic', 'manual'],
      required: true
    },
    deletedCount: {
      type: Number,
      default: 0
    },
    deletedUsers: {
      type: [deletedUserSnapshotSchema],
      default: []
    },
    initiatedByName: {
      type: String,
      default: 'System'
    },
    initiatedByEmail: {
      type: String,
      default: ''
    },
    initiatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
)

const UnverifiedCleanupHistory =
  mongoose.models.unverified_cleanup_history ||
  mongoose.model('unverified_cleanup_history', unverifiedCleanupHistorySchema)

export default UnverifiedCleanupHistory
