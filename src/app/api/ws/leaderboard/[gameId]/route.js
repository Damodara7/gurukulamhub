// WebSocket endpoint for leaderboard updates for a specific game
// This file is for use with next-ws in the Next.js app directory

let leaderboardClientsByGame = globalThis.__leaderboardClientsByGame || {}
globalThis.__leaderboardClientsByGame = leaderboardClientsByGame

export function UPGRADE(client, request, server, context) {
  const { gameId } = context.params
  if (!leaderboardClientsByGame[gameId]) leaderboardClientsByGame[gameId] = new Set()
  leaderboardClientsByGame[gameId].add(client)
  console.log(`[WS] Leaderboard client connected for game ${gameId}. Total: ${leaderboardClientsByGame[gameId].size}`)

  client.on("close", () => {
    leaderboardClientsByGame[gameId].delete(client)
    console.log(`[WS] Leaderboard client disconnected for game ${gameId}. Total: ${leaderboardClientsByGame[gameId].size}`)
  })
}