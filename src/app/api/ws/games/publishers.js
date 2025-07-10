let gamesListClients = globalThis.__gamesListClients || new Set()
globalThis.__gamesListClients = gamesListClients

// Utility to broadcast games list updates to all clients
export function broadcastGamesList(gamesList) {
  const message = JSON.stringify({ type: 'gamesList', data: gamesList })
  for (const client of gamesListClients) {
    if (client.readyState === 1) {
      client.send(message)
    }
  }
}
