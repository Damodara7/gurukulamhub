import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema(
  {
    // **Required Fields**
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
      index: true
    },

    type: {
      type: String,
      required: true,
      enum: [
        'QUIZ_APPROVED',
        'QUIZ_REJECTED',
        'QUIZ_PENDING_APPROVAL',
        'QUIZ_PUBLISHED',
        'GAME_CREATED',
        'GAME_ACCESS_REMOVED',
        'GAME_DELETED',
        'GAME_REMINDER',
        'GROUP_JOINED',
        'GROUP_REMOVED',
        'GROUP_REQUEST_RECEIVED',
        'GROUP_REQUEST_APPROVED',
        'GROUP_REQUEST_REJECTED',
        'ROLE_ASSIGNED',
        'ROLE_REMOVED',
        'PROFILE_COMPLETION_REMINDER'
      ],
      index: true
    },

    title: {
      type: String,
      required: true
    },

    message: {
      type: String,
      required: true
    },

    // **Status Fields**
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },

    readAt: {
      type: Date,
      default: null
    },

    isFavorite: {
      type: Boolean,
      default: false,
      index: true
    },

    // **Related Entity References (optional, based on notification type)**
    relatedEntity: {
      entityType: {
        type: String,
        enum: ['quiz', 'game', 'group', 'user', 'role', 'profile'],
        required: false
      },
      entityId: {
        type: mongoose.Schema.Types.Mixed, // Can be ObjectId or String
        required: false
      }
    },

    // **Additional Metadata (for different notification types)**
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
      // Examples:
      // - For QUIZ_APPROVED/REJECTED: { quizTitle, remarks, approvedBy }
      // - For GAME_CREATED: { gameTitle, gameId, registrationDeadline }
      // - For GROUP_JOINED: { groupName, groupId }
      // - For ROLE_ASSIGNED: { roleName, assignedBy }
      // - For PROFILE_COMPLETION: { completionPercentage, missingFields }
    },

    // **Action/CTA (Call to Action)**
    actionUrl: {
      type: String,
      required: false
      // Example: '/quiz/123', '/game/456', '/profile/edit'
    },

    actionLabel: {
      type: String,
      required: false
      // Example: 'View Quiz', 'Register Now', 'Complete Profile'
    },

    // **Expiration (for time-sensitive notifications)**
    expiresAt: {
      type: Date,
      required: false,
      index: true
      // Example: Game registration deadline
    }
  },
  {
    timestamps: true // Adds createdAt and updatedAt automatically
  }
)

// **Indexes**

// Compound index for efficient user notification queries (sorted by newest first)
notificationSchema.index({ userId: 1, createdAt: -1 })

// Compound index for unread notifications
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 })

// Compound index for favorite notifications
notificationSchema.index({ userId: 1, isFavorite: 1, createdAt: -1 })

// TTL Index - Auto-delete notifications older than 90 days
// Note: MongoDB TTL indexes work on date fields and delete documents after the specified seconds
// We'll set this to expire 90 days (7776000 seconds) after createdAt
notificationSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 7776000, // 90 days in seconds
    name: 'notification_ttl_index'
  }
)

// Index for type-based queries
notificationSchema.index({ userId: 1, type: 1, createdAt: -1 })

const Notification = mongoose.models?.notifications || mongoose.model('notifications', notificationSchema)

export default Notification
