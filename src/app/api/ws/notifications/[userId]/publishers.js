let notificationClientsByUserId = globalThis.__notificationClientsByUserId || {}
globalThis.__notificationClientsByUserId = notificationClientsByUserId

export function broadcastNotificationToUser(userId, notificationData) {
  const clients = notificationClientsByUserId[userId]
  if (!clients || clients.size === 0) {
    console.log(`[WS] No notification clients connected for user ${userId}`)
    return
  }

  const message = JSON.stringify({
    type: 'notification',
    data: notificationData
  })

  let sentCount = 0
  for (const client of clients) {
    if (client.readyState === 1) {
      // WebSocket.OPEN
      try {
        client.send(message)
        sentCount++
      } catch (error) {
        console.error(`[WS] Error sending notification to client for user ${userId}:`, error)
      }
    }
  }

  console.log(`[WS] Notification broadcasted to ${sentCount}/${clients.size} clients for user ${userId}`)
}

export function broadcastNotificationCount(userId, countData) {
  const clients = notificationClientsByUserId[userId]
  if (!clients || clients.size === 0) {
    return
  }

  const message = JSON.stringify({
    type: 'notificationCount',
    data: countData
  })

  let sentCount = 0
  for (const client of clients) {
    if (client.readyState === 1) {
      try {
        client.send(message)
        sentCount++
      } catch (error) {
        console.error(`[WS] Error sending notification count to client for user ${userId}:`, error)
      }
    }
  }

  console.log(`[WS] Notification count broadcasted to ${sentCount}/${clients.size} clients for user ${userId}`)
}

export function broadcastNotificationUpdate(userId, updateData) {
  const clients = notificationClientsByUserId[userId]
  if (!clients || clients.size === 0) {
    return
  }

  const message = JSON.stringify({
    type: 'notificationUpdate',
    data: updateData
  })

  let sentCount = 0
  for (const client of clients) {
    if (client.readyState === 1) {
      try {
        client.send(message)
        sentCount++
      } catch (error) {
        console.error(`[WS] Error sending notification update to client for user ${userId}:`, error)
      }
    }
  }

  console.log(`[WS] Notification update broadcasted to ${sentCount}/${clients.size} clients for user ${userId}`)
}
