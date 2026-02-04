// WebSocket endpoint for group chat
// This file is for use with next-ws in the Next.js app directory

let chatClientsByGroupId = globalThis.__chatClientsByGroupId || {}
globalThis.__chatClientsByGroupId = chatClientsByGroupId

export function UPGRADE(client, request, server, context) {
  const { groupId } = context.params
  
  if (!chatClientsByGroupId[groupId]) {
    chatClientsByGroupId[groupId] = new Set()
  }
  
  chatClientsByGroupId[groupId].add(client)
  console.log(`[WS] Chat client connected for group ${groupId}. Total: ${chatClientsByGroupId[groupId].size}`)

  // Send welcome message
  client.send(JSON.stringify({
    type: 'connected',
    groupId,
    message: 'Connected to group chat'
  }))

  // Handle ping/pong for keepalive
  client.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString())
      if (msg.type === 'ping') {
        // Respond with pong to keep connection alive
        client.send(JSON.stringify({ type: 'pong' }))
      }
    } catch (error) {
      // Ignore parsing errors for non-JSON messages
    }
  })

  client.on('close', () => {
    if (chatClientsByGroupId[groupId]) {
      chatClientsByGroupId[groupId].delete(client)
      console.log(`[WS] Chat client disconnected for group ${groupId}. Total: ${chatClientsByGroupId[groupId]?.size || 0}`)
    }
  })

  client.on('error', (error) => {
    console.error(`[WS] Chat client error for group ${groupId}:`, error)
  })
}

