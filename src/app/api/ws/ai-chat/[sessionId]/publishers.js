let aiChatClientsBySessionId = globalThis.__aiChatClientsBySessionId || {}
globalThis.__aiChatClientsBySessionId = aiChatClientsBySessionId

function normalizeSessionId(sessionId) {
  return String(sessionId || '').trim()
}

export function broadcastAiChatSessionUpdate(sessionId, payload) {
  const normalizedSessionId = normalizeSessionId(sessionId)
  if (!normalizedSessionId) return

  const clients = aiChatClientsBySessionId[normalizedSessionId]
  if (!clients || clients.size === 0) return

  const message = JSON.stringify({
    type: 'sessionUpdate',
    sessionId: normalizedSessionId,
    ...payload
  })

  for (const client of clients) {
    if (client.readyState !== 1) continue
    try {
      client.send(message)
    } catch (error) {
      console.error(`[WS][AI] broadcast error for session ${normalizedSessionId}:`, error)
    }
  }
}

