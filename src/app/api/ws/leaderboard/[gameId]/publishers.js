let leaderboardClientsByGame = globalThis.__leaderboardClientsByGame || {}
globalThis.__leaderboardClientsByGame = leaderboardClientsByGame

// Utility to broadcast leaderboard updates to all clients for a game
export function broadcastLeaderboard(gameId, leaderboardData) {
  const clients = leaderboardClientsByGame[gameId]
  if (!clients) return
  const message = JSON.stringify({ type: "leaderboard", data: leaderboardData })
  for (const client of clients) {
    if (client.readyState === 1) {
      client.send(message)
    }
  }
}