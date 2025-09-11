let userClientsByEmail = globalThis.__userClientsByEmail || {}
globalThis.__userClientsByEmail = userClientsByEmail

// Utility to broadcast user-specific updates
export function broadcastToUser(userEmail, messageData) {
  const clients = userClientsByEmail[userEmail]
  if (!clients) return

  const message = JSON.stringify({ type: 'userUpdate', data: messageData })
  for (const client of clients) {
    if (client.readyState === 1) {
      client.send(message)
    }
  }

  console.log(`[WS] Message broadcasted to user ${userEmail}`)
}
