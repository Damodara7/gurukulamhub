// WebSocket endpoint for leaderboard updates for a specific game
// This file is for use with next-ws in the Next.js app directory

let clientsByGame = globalThis.__leaderboardClientsByGame || {}
globalThis.__leaderboardClientsByGame = clientsByGame

export function SOCKET(client, request, server, context) {
  const { gameId } = context.params
  if (!clientsByGame[gameId]) clientsByGame[gameId] = new Set()
  clientsByGame[gameId].add(client)
  console.log(`[WS] Leaderboard client connected for game ${gameId}. Total: ${clientsByGame[gameId].size}`)

  client.on("close", () => {
    clientsByGame[gameId].delete(client)
    console.log(`[WS] Leaderboard client disconnected for game ${gameId}. Total: ${clientsByGame[gameId].size}`)
  })
}

// Utility to broadcast leaderboard updates to all clients for a game
export function broadcastLeaderboard(gameId, leaderboardData) {
  const clients = clientsByGame[gameId]
  if (!clients) return
  const message = JSON.stringify({ type: "leaderboard", data: leaderboardData })
  for (const client of clients) {
    if (client.readyState === 1) {
      client.send(message)
    }
  }
} 