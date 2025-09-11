// WebSocket endpoint for user-specific updates
// This file is for use with next-ws in the Next.js app directory

let userClientsByEmail = globalThis.__userClientsByEmail || {}
globalThis.__userClientsByEmail = userClientsByEmail

export function SOCKET(client, request, server, context) {
  const { userEmail } = context.params
  if (!userClientsByEmail[userEmail]) userClientsByEmail[userEmail] = new Set()
  userClientsByEmail[userEmail].add(client)
  console.log(`[WS] User client connected for user ${userEmail}. Total: ${userClientsByEmail[userEmail].size}`)

  client.on('close', () => {
    userClientsByEmail[userEmail].delete(client)
    console.log(`[WS] User client disconnected for user ${userEmail}. Total: ${userClientsByEmail[userEmail].size}`)
  })
}
