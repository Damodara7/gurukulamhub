import mongoose from 'mongoose'

const aiChatSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    messages: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
    },
    toolLogs: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  { timestamps: true, collection: 'ai_chat_sessions' }
)

const AIChatSession =
  mongoose.models.ai_chat_sessions || mongoose.model('ai_chat_sessions', aiChatSessionSchema)

export default AIChatSession

