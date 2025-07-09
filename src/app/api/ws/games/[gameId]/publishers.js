let clientsByGameId = globalThis.__clientsByGameId || {}
globalThis.__clientsByGameId = clientsByGameId

export function broadcastGameDetails(gameId, gameData) {
  const clients = clientsByGameId[gameId]
  if (!clients) return

  const message = JSON.stringify({ type: 'gameDetails', data: gameData })
  for (let client of clients) {
    if (client.readyState === 1) {
      client.send(message)
    }
  }

  console.log(`[WS] Message broadcasted for gameDetails of ${gameId}`)
}
