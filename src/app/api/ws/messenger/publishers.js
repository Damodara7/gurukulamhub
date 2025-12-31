// Publishers for messenger WebSocket updates
// Broadcasts to all connected messenger clients

let messengerClients = globalThis.__messengerClients || new Set()
globalThis.__messengerClients = messengerClients

/**
 * Broadcast a message to all connected messenger clients
 */
export function broadcastToMessenger(message) {
  const messageStr = JSON.stringify(message)
  let sentCount = 0
  
  messengerClients.forEach(client => {
    try {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(messageStr)
        sentCount++
      }
    } catch (error) {
      console.error('[WS] Messenger broadcast error:', error)
    }
  })
  
  if (sentCount > 0) {
    console.log(`[WS] Messenger broadcast to ${sentCount} clients:`, message.type)
  }
}

/**
 * Broadcast individual chat message update
 */
export function broadcastIndividualChatMessage(chatId, message) {
  const normalizedChatId = chatId // chatId should already be normalized from the caller
  broadcastToMessenger({
    type: 'individualChatMessage',
    chatId: normalizedChatId,
    data: message
  })
  console.log(`[WS] Messenger: Broadcasting individualChatMessage for chatId: ${normalizedChatId}, sender: ${message.senderEmail}`)
}

/**
 * Broadcast individual chat deletion (chat removed from user's list)
 */
export function broadcastIndividualChatDeleted(chatId, userEmail) {
  broadcastToMessenger({
    type: 'individualChatDeleted',
    chatId: chatId,
    userEmail: userEmail
  })
  console.log(`[WS] Messenger: Broadcasting individualChatDeleted for chatId: ${chatId}, user: ${userEmail}`)
}

/**
 * Broadcast individual chat message update (read status, edit, delete)
 */
export function broadcastIndividualChatMessageUpdate(chatId, message) {
  broadcastToMessenger({
    type: 'individualChatMessageUpdate',
    chatId,
    data: message
  })
}

/**
 * Broadcast individual chat unread count update
 */
export function broadcastIndividualChatUnreadCount(chatId, unreadCount) {
  broadcastToMessenger({
    type: 'individualChatUnreadCount',
    chatId,
    data: { unreadCount }
  })
}

/**
 * Broadcast group chat message update
 */
export function broadcastGroupChatMessage(groupId, message) {
  broadcastToMessenger({
    type: 'groupChatMessage',
    groupId,
    data: message
  })
}

/**
 * Broadcast group chat message update (read status, edit, delete)
 */
export function broadcastGroupChatMessageUpdate(groupId, message) {
  broadcastToMessenger({
    type: 'groupChatMessageUpdate',
    groupId,
    data: message
  })
}

/**
 * Broadcast groups list update
 */
export function broadcastGroupsListUpdate() {
  broadcastToMessenger({
    type: 'groupsListUpdate'
  })
}

