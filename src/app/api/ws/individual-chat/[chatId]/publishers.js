let chatClientsByChatId = globalThis.__individualChatClientsByChatId || {}
globalThis.__individualChatClientsByChatId = chatClientsByChatId

// Helper function to normalize chatId (decode and sort emails)
function normalizeChatId(chatId) {
  if (!chatId) return chatId
  
  try {
    // Decode URL-encoded chatId (handles multiple levels of encoding)
    let decoded = chatId
    for (let i = 0; i < 3; i++) {
      try {
        const testDecode = decodeURIComponent(decoded)
        if (testDecode === decoded) break // No more decoding needed
        decoded = testDecode
      } catch (e) {
        break // Can't decode further
      }
    }
    
    // Split and normalize emails
    const [email1, email2] = decoded.split('_')
    if (!email1 || !email2) return decoded // Invalid format, return as-is
    
    // Decode and normalize emails
    let normalizedEmail1 = email1
    let normalizedEmail2 = email2
    try {
      normalizedEmail1 = decodeURIComponent(email1).toLowerCase().trim()
      normalizedEmail2 = decodeURIComponent(email2).toLowerCase().trim()
    } catch (e) {
      normalizedEmail1 = email1.toLowerCase().trim()
      normalizedEmail2 = email2.toLowerCase().trim()
    }
    
    // Sort emails to ensure consistent chatId format
    const sorted = [normalizedEmail1, normalizedEmail2].sort()
    return `${sorted[0]}_${sorted[1]}`
  } catch (e) {
    console.warn('Failed to normalize chatId:', e)
    return chatId // Return original if normalization fails
  }
}

// Utility to broadcast chat messages to both participants in an individual chat
export function broadcastIndividualChatMessage(chatId, message) {
  // Normalize chatId to ensure it matches the format used when storing clients
  const normalizedChatId = normalizeChatId(chatId)
  
  const clients = chatClientsByChatId[normalizedChatId]
  if (!clients || clients.size === 0) {
    console.log(`[WS] No clients connected for individual chat ${normalizedChatId} (original: ${chatId})`)
    console.log(`[WS] Available chatIds:`, Object.keys(chatClientsByChatId))
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
        console.error(`[WS] Error sending message to client in chat ${chatId}:`, error)
      }
    }
  }

  console.log(`[WS] Individual chat message broadcasted to ${sentCount}/${clients.size} clients for chat ${normalizedChatId}`)
  
  // Also broadcast to messenger clients
  const MessengerPublishers = require('../../messenger/publishers.js')
  MessengerPublishers.broadcastIndividualChatMessage(normalizedChatId, message)
}

// Utility to broadcast message updates (edit/delete)
export function broadcastMessageUpdate(chatId, updateData) {
  // Normalize chatId to ensure it matches the format used when storing clients
  const normalizedChatId = normalizeChatId(chatId)
  
  const clients = chatClientsByChatId[normalizedChatId]
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
        console.error(`[WS] Error sending update to client in chat ${chatId}:`, error)
      }
    }
  }
  
  // Also broadcast to messenger clients
  const MessengerPublishers = require('../../messenger/publishers.js')
  MessengerPublishers.broadcastIndividualChatMessageUpdate(normalizedChatId, updateData)
}

// Utility to broadcast unread count updates
export function broadcastUnreadCountUpdate(chatId, unreadCount) {
  // Normalize chatId to ensure it matches the format used when storing clients
  const normalizedChatId = normalizeChatId(chatId)
  
  const clients = chatClientsByChatId[normalizedChatId]
  if (!clients || clients.size === 0) return

  const messageData = JSON.stringify({
    type: 'unreadCountUpdate',
    data: { unreadCount }
  })

  for (const client of clients) {
    if (client.readyState === 1) {
      try {
        client.send(messageData)
      } catch (error) {
        console.error(`[WS] Error sending unread count update to client in chat ${chatId}:`, error)
      }
    }
  }
  
  // Also broadcast to messenger clients
  const MessengerPublishers = require('../../messenger/publishers.js')
  MessengerPublishers.broadcastIndividualChatUnreadCount(normalizedChatId, unreadCount)
}


