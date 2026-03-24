let aiChatClientsBySessionId = globalThis.__aiChatClientsBySessionId || {}
globalThis.__aiChatClientsBySessionId = aiChatClientsBySessionId

function normalizeSessionId(sessionId) {
  return String(sessionId || '').trim()
}

export function UPGRADE(client, request, server, context) {
  const normalizedSessionId = normalizeSessionId(context?.params?.sessionId)
  if (!normalizedSessionId) {
    client.close(1008, 'sessionId is required')
    return
  }

  if (!aiChatClientsBySessionId[normalizedSessionId]) {
    aiChatClientsBySessionId[normalizedSessionId] = new Set()
  }

  aiChatClientsBySessionId[normalizedSessionId].add(client)
  console.log(`[WS][AI] client connected for session ${normalizedSessionId}`)

  if (client.readyState === 1) {
    client.send(
      JSON.stringify({
        type: 'connected',
        sessionId: normalizedSessionId
      })
    )
  }

  client.on('message', data => {
    try {
      const msg = JSON.parse(data.toString())
      if (msg?.type === 'ping' && client.readyState === 1) {
        client.send(JSON.stringify({ type: 'pong' }))
      }
    } catch {
      // Ignore non-JSON heartbeat payloads
    }
  })

  client.on('close', () => {
    const clients = aiChatClientsBySessionId[normalizedSessionId]
    if (!clients) return
    clients.delete(client)
    if (clients.size === 0) {
      delete aiChatClientsBySessionId[normalizedSessionId]
    }
  })

  client.on('error', error => {
    console.error(`[WS][AI] client error for session ${normalizedSessionId}:`, error)
  })
}

export function GET() {
  return new Response('WebSocket endpoint', { status: 426 })
}

