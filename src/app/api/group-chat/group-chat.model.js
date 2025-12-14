import mongoose from 'mongoose'
import Group from '../group/group.model'

export const groupChatMessageSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'groups',
      required: true,
      index: true
    },
    senderEmail: {
      type: String,
      required: true,
      index: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'file', 'system'],
      default: 'text'
    },
    readBy: [
      {
        userEmail: {
          type: String,
          required: true
        },
        readAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: Date,
    deletedBy: String,
    deletedFor: [
      {
        userEmail: {
          type: String,
          required: true
        },
        deletedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    deletedForEveryone: {
      type: Boolean,
      default: false
    },
    editedAt: Date,
    isEdited: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)

// Compound index for efficient queries
groupChatMessageSchema.index({ groupId: 1, createdAt: -1 })
groupChatMessageSchema.index({ groupId: 1, isDeleted: 1, createdAt: -1 })

const GroupChatMessage = mongoose.models?.groupchatmessages || mongoose.model('groupchatmessages', groupChatMessageSchema)

export default GroupChatMessage

