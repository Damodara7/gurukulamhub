// WebSocket endpoint for combined messenger updates (individual + group chats)
// This file is for use with next-ws in the Next.js app directory

let messengerClients = globalThis.__messengerClients || new Set()
globalThis.__messengerClients = messengerClients

export function UPGRADE(client, request, server, context) {
  messengerClients.add(client)
  console.log(`[WS] Messenger client connected. Total: ${messengerClients.size}`)

  // Send welcome message
  client.send(JSON.stringify({
    type: 'connected',
    message: 'Connected to messenger'
  }))

  client.on('close', () => {
    messengerClients.delete(client)
    console.log(`[WS] Messenger client disconnected. Total: ${messengerClients.size}`)
  })

  client.on('error', (error) => {
    console.error(`[WS] Messenger client error:`, error)
  })
}

