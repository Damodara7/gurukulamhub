// WebSocket endpoint for games list updates
// This file is for use with next-ws in the Next.js app directory

let gamesClients = globalThis.__gamesClients || new Set()
globalThis.__gamesClients = gamesClients

export function SOCKET(client, request, server, context) {
  gamesClients.add(client)
  console.log(`[WS] Games list client connected. Total: ${gamesClients.size}`)

  client.on("close", () => {
    gamesClients.delete(client)
    console.log(`[WS] Games list client disconnected. Total: ${gamesClients.size}`)
  })
}

// Utility to broadcast games list updates to all clients
export function broadcastGamesList(gamesList) {
  console.log('gamesList broadcast: ', gamesList)
  console.log('gamesClients: ', gamesClients)
  const message = JSON.stringify({ type: "gamesList", data: gamesList })
  for (const client of gamesClients) {
    if (client.readyState === 1) {
      client.send(message)
    }
  }
} 