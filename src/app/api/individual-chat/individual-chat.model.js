import mongoose from 'mongoose'

export const individualChatMessageSchema = new mongoose.Schema(
  {
    chatId: {
      type: String,
      required: true,
      index: true
    },
    senderEmail: {
      type: String,
      required: true,
      index: true
    },
    receiverEmail: {
      type: String,
      required: true,
      index: true
    },
    message: {
      type: String,
      trim: true,
      default: ''
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'file', 'system'],
      default: 'text'
    },
    attachments: [
      {
        fileName: { type: String, required: true },
        fileType: { type: String, required: true },
        fileSize: { type: Number, default: 0 },
        url: { type: String, required: true },
        key: { type: String, default: null },
        uploadedAt: { type: Date, default: Date.now }
      }
    ],
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

// Compound indexes for efficient queries
individualChatMessageSchema.index({ chatId: 1, createdAt: -1 })
individualChatMessageSchema.index({ senderEmail: 1, receiverEmail: 1, createdAt: -1 })
individualChatMessageSchema.index({ chatId: 1, isDeleted: 1, createdAt: -1 })

const IndividualChatMessage = mongoose.models?.individualchatmessages || mongoose.model('individualchatmessages', individualChatMessageSchema)

export default IndividualChatMessage


