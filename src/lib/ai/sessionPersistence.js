import connectMongo from '@/utils/dbConnect-mongo'
import AIChatSession from '@/app/api/ai/ai-chat-session.model'

export async function hydrateSessionFromDb(session) {
  if (!session?.sessionId) return session

  await connectMongo()
  const dbSession = await AIChatSession.findOne({ sessionId: session.sessionId }).lean()
  if (!dbSession) return session

  session.messages = Array.isArray(dbSession.messages) ? dbSession.messages : session.messages
  session.toolLogs = Array.isArray(dbSession.toolLogs) ? dbSession.toolLogs : session.toolLogs
  session.createdAt = dbSession.createdAt ? new Date(dbSession.createdAt).getTime() : session.createdAt
  session.updatedAt = dbSession.updatedAt ? new Date(dbSession.updatedAt).getTime() : session.updatedAt
  return session
}

export async function persistSessionToDb(session) {
  if (!session?.sessionId) return

  await connectMongo()
  await AIChatSession.findOneAndUpdate(
    { sessionId: session.sessionId },
    {
      $set: {
        messages: session.messages || [],
        toolLogs: session.toolLogs || [],
        lastActiveAt: new Date()
      },
      $setOnInsert: {
        sessionId: session.sessionId
      }
    },
    { upsert: true, new: true }
  )
}

