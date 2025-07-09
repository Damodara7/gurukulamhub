// WebSocket endpoint for games list updates
// This file is for use with next-ws in the Next.js app directory

let gamesListClients = globalThis.__gamesListClients || new Set()
globalThis.__gamesListClients = gamesListClients

export function SOCKET(client, request, server, context) {
  gamesListClients.add(client)
  console.log(`[WS] Games list client connected. Total: ${gamesListClients.size}`)

  client.on("close", () => {
    gamesListClients.delete(client)
    console.log(`[WS] Games list client disconnected. Total: ${gamesListClients.size}`)
  })
} 