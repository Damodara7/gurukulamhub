let chatClientsByGroupId = globalThis.__chatClientsByGroupId || {}
globalThis.__chatClientsByGroupId = chatClientsByGroupId

// Utility to broadcast chat messages to all clients in a group
export function broadcastGroupChatMessage(groupId, message) {
  const clients = chatClientsByGroupId[groupId]
  if (!clients || clients.size === 0) {
    console.log(`[WS] No clients connected for group ${groupId} chat`)
    return
  }

  const messageData = JSON.stringify({
    type: 'newMessage',
    data: message
  })

  let sentCount = 0
  for (const client of clients) {
    if (client.readyState === 1) { // WebSocket.OPEN
      try {
        client.send(messageData)
        sentCount++
      } catch (error) {
        console.error(`[WS] Error sending message to client in group ${groupId}:`, error)
      }
    }
  }

  console.log(`[WS] Chat message broadcasted to ${sentCount}/${clients.size} clients for group ${groupId}`)
}

// Utility to broadcast message updates (edit/delete)
export function broadcastMessageUpdate(groupId, updateData) {
  const clients = chatClientsByGroupId[groupId]
  if (!clients || clients.size === 0) return

  const messageData = JSON.stringify({
    type: 'messageUpdate',
    data: updateData
  })

  for (const client of clients) {
    if (client.readyState === 1) {
      try {
        client.send(messageData)
      } catch (error) {
        console.error(`[WS] Error sending update to client in group ${groupId}:`, error)
      }
    }
  }
}

