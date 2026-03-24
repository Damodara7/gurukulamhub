const SESSION_TTL_MS = 1000 * 60 * 60
const sessions = globalThis.__aiAgentSessions || new Map()
globalThis.__aiAgentSessions = sessions

function makeSession(sessionId) {
  return {
    sessionId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [
      {
        role: 'system',
        content:
          'You are a helpful AI assistant with general knowledge. You can answer any question the user asks.\n\n' +
          '- Use your knowledge for general questions: programming (Java, Python, etc.), math, explanations, tutorials, or any topic. Answer directly without tools.\n' +
          '- Use the provided tools ONLY when the user asks about this platform\'s data: games, quizzes, questions, users, roles, features, permissions, sponsorships, or related queries. Then call the appropriate tool(s) and summarize the results.\n' +
          '- Never refuse to answer because "you can only use tools". You can and should answer general questions from your knowledge.'
      }
    ],
    toolLogs: []
  }
}

export function getOrCreateSession(sessionId) {
  const sid = sessionId || `s-${Date.now()}-${Math.random().toString(36).slice(2)}`
  let data = sessions.get(sid)
  if (!data) {
    data = makeSession(sid)
    sessions.set(sid, data)
  }
  data.updatedAt = Date.now()
  return data
}

export function saveSession(session) {
  if (!session?.sessionId) return
  session.updatedAt = Date.now()
  sessions.set(session.sessionId, session)
}

export function pruneSessions() {
  const cutoff = Date.now() - SESSION_TTL_MS
  for (const [key, value] of sessions.entries()) {
    if ((value?.updatedAt || 0) < cutoff) {
      sessions.delete(key)
    }
  }
}

