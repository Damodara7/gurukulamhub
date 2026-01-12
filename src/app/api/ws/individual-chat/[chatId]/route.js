// WebSocket endpoint for individual chat
// This file is for use with next-ws in the Next.js app directory

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

export function UPGRADE(client, request, server, context) {
  const { chatId } = context.params
  
  // Normalize chatId to ensure consistent format
  const normalizedChatId = normalizeChatId(chatId)
  
  if (!chatClientsByChatId[normalizedChatId]) {
    chatClientsByChatId[normalizedChatId] = new Set()
  }
  
  chatClientsByChatId[normalizedChatId].add(client)
  console.log(`[WS] Individual chat client connected for chat ${normalizedChatId} (original: ${chatId}). Total: ${chatClientsByChatId[normalizedChatId].size}`)

  // Send welcome message
  client.send(JSON.stringify({
    type: 'connected',
    chatId: normalizedChatId,
    message: 'Connected to individual chat'
  }))

  client.on('close', () => {
    if (chatClientsByChatId[normalizedChatId]) {
      chatClientsByChatId[normalizedChatId].delete(client)
      console.log(`[WS] Individual chat client disconnected for chat ${normalizedChatId}. Total: ${chatClientsByChatId[normalizedChatId]?.size || 0}`)
    }
  })

  client.on('error', (error) => {
    console.error(`[WS] Individual chat client error for chat ${normalizedChatId}:`, error)
  })
}


