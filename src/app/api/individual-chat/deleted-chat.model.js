import mongoose from 'mongoose'

export const deletedChatSchema = new mongoose.Schema(
  {
    chatId: {
      type: String,
      required: true,
      index: true
    },
    userEmail: {
      type: String,
      required: true,
      index: true
    },
    deletedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
)

// Compound index to ensure uniqueness of chatId + userEmail combination
deletedChatSchema.index({ chatId: 1, userEmail: 1 }, { unique: true })

const DeletedChat = mongoose.models?.deletedchats || mongoose.model('deletedchats', deletedChatSchema)

export default DeletedChat

