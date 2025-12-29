let clientsBySponsorGames = globalThis.__clientsBySponsorGames || new Set()
globalThis.__clientsBySponsorGames = clientsBySponsorGames

// Utility to broadcast sponsor games list updates
export function broadcastSponsorGamesList(gamesData) {
  if (!clientsBySponsorGames || clientsBySponsorGames.size === 0) {
    console.log(`[WS] No clients connected for sponsor games list`)
    return
  }

  const message = JSON.stringify({
    type: 'sponsorGamesList',
    data: gamesData
  })

  let sentCount = 0
  for (const client of clientsBySponsorGames) {
    if (client.readyState === 1) {
      // WebSocket.OPEN
      try {
        client.send(message)
        sentCount++
      } catch (error) {
        console.error(`[WS] Error sending sponsor games list update:`, error)
      }
    }
  }

  console.log(`[WS] Sponsor games list broadcasted to ${sentCount}/${clientsBySponsorGames.size} clients`)
}

// Utility to broadcast when a game is added/removed from the list
export function broadcastGameStatusChange(gameId, status) {
  if (!clientsBySponsorGames || clientsBySponsorGames.size === 0) {
    return
  }

  const message = JSON.stringify({
    type: 'gameStatusChange',
    data: { gameId, status }
  })

  let sentCount = 0
  for (const client of clientsBySponsorGames) {
    if (client.readyState === 1) {
      try {
        client.send(message)
        sentCount++
      } catch (error) {
        console.error(`[WS] Error sending game status change:`, error)
      }
    }
  }

  console.log(`[WS] Game status change broadcasted to ${sentCount}/${clientsBySponsorGames.size} clients`)
}

