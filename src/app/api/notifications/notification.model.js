import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema(
  {
    // **Required Fields** (userId optional for announcement templates)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: false,
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
        'GAME_SPONSOR_REQUEST',
        'GAME_ACCESS_REMOVED',
        'GAME_DELETED',
        'GAME_REGISTERED',
        'GAME_STARTED',
        'GAME_COMPLETED',
        'GAME_CANCELLED',
        'GAME_MISSED',
        'GAME_REMINDER',
        'GROUP_JOINED',
        'GROUP_REMOVED',
        'GROUP_REQUEST_RECEIVED',
        'GROUP_REQUEST_APPROVED',
        'GROUP_REQUEST_REJECTED',
        'ROLE_ASSIGNED',
        'ROLE_REMOVED',
        'PROFILE_COMPLETION_REMINDER',
        'SPONSORSHIP_PENDING_APPROVAL',
        'SPONSORSHIP_APPROVED',
        'SPONSORSHIP_REJECTED',
        'SPONSORSHIP_SUBMITTED',
        'ADMIN_NOTIFICATION'
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
        enum: ['quiz', 'game', 'group', 'user', 'role', 'profile', 'sponsorship'],
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
    },

    // **Admin notification grouping (for "send to all" + seen/total)**
    adminNotificationId: {
      type: String,
      required: false,
      index: true
      // Same value on all notifications created in one "announcement" batch
    },
    createdByEmail: {
      type: String,
      required: false,
      index: true
      // Admin who created this notification (for admin list + grouping)
    },
    announcementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'announcements',
      required: false,
      index: true
      // Legacy: link to announcement collection; single-model uses adminNotificationId only
    },

    // **Announcement template (single-model: announcement stored as notification)**
    isAnnouncementTemplate: {
      type: Boolean,
      default: false,
      index: true
      // true = this doc is the announcement template (no userId); used for "send to all" + new users
    },
    isActive: {
      type: Boolean,
      default: false,
      index: true
      // For templates: whether announcement is still active (new users get it)
    },
    activeUntil: {
      type: Date,
      default: null,
      index: true
      // For templates: optional expiry
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

// TTL Index - Auto-delete only documents that have expiresAt set and in the past.
// Documents without expiresAt (e.g. admin notifications) are never deleted by TTL.
// expireAfterSeconds: 0 means "delete when expiresAt < current time".
notificationSchema.index(
  { expiresAt: 1 },
  {
    expireAfterSeconds: 0,
    name: 'notification_ttl_index'
  }
)

// Index for type-based queries
notificationSchema.index({ userId: 1, type: 1, createdAt: -1 })

// Index for admin list: notifications created by this admin (ADMIN_NOTIFICATION)
notificationSchema.index({ createdByEmail: 1, type: 1, createdAt: -1 })
notificationSchema.index({ adminNotificationId: 1 })

// Index for active announcement templates (single-model: new users get past announcements)
notificationSchema.index({ isAnnouncementTemplate: 1, isActive: 1, activeUntil: 1, createdAt: -1 })

const Notification = mongoose.models?.notifications || mongoose.model('notifications', notificationSchema)

export default Notification
