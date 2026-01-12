// WebSocket endpoint for user-specific notifications
// This file is for use with next-ws in the Next.js app directory

let notificationClientsByUserId = globalThis.__notificationClientsByUserId || {}
globalThis.__notificationClientsByUserId = notificationClientsByUserId

export function UPGRADE(client, request, server, context) {
  const { userId } = context.params
  
  if (!userId) {
    console.error('[WS] Notification connection rejected: userId is required')
    client.close(1008, 'userId is required')
    return
  }

  // Initialize Set for this userId if it doesn't exist
  if (!notificationClientsByUserId[userId]) {
    notificationClientsByUserId[userId] = new Set()
  }
  
  notificationClientsByUserId[userId].add(client)
  console.log(`[WS] Notification client connected for user ${userId}. Total: ${notificationClientsByUserId[userId].size}`)

  // Send welcome message
  const welcomeMessage = JSON.stringify({
    type: 'connected',
    message: 'Connected to notification service',
    userId
  })
  if (client.readyState === 1) {
    client.send(welcomeMessage)
  }

  client.on('close', () => {
    if (notificationClientsByUserId[userId]) {
      notificationClientsByUserId[userId].delete(client)
      console.log(`[WS] Notification client disconnected for user ${userId}. Total: ${notificationClientsByUserId[userId]?.size || 0}`)
      
      // Clean up empty sets
      if (notificationClientsByUserId[userId].size === 0) {
        delete notificationClientsByUserId[userId]
      }
    }
  })

  client.on('error', error => {
    console.error(`[WS] Notification client error for user ${userId}:`, error)
  })
}



