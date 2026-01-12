let clientsBySponsorGameId = globalThis.__clientsBySponsorGameId || {}
globalThis.__clientsBySponsorGameId = clientsBySponsorGameId

// Utility to broadcast sponsor game details updates
export function broadcastSponsorGameDetails(gameId, gameData) {
  const clients = clientsBySponsorGameId[gameId]
  if (!clients || clients.size === 0) {
    console.log(`[WS] No clients connected for sponsor game ${gameId}`)
    return
  }

  const message = JSON.stringify({
    type: 'sponsorGameDetails',
    data: gameData
  })

  let sentCount = 0
  for (const client of clients) {
    if (client.readyState === 1) {
      // WebSocket.OPEN
      try {
        client.send(message)
        sentCount++
      } catch (error) {
        console.error(`[WS] Error sending sponsor game details for ${gameId}:`, error)
      }
    }
  }

  console.log(`[WS] Sponsor game details broadcasted to ${sentCount}/${clients.size} clients for game ${gameId}`)
}

// Utility to broadcast sponsorship updates (new sponsor, payment success, etc.)
export function broadcastSponsorshipUpdate(gameId, updateData) {
  const clients = clientsBySponsorGameId[gameId]
  if (!clients || clients.size === 0) {
    return
  }

  const message = JSON.stringify({
    type: 'sponsorshipUpdate',
    data: updateData
  })

  let sentCount = 0
  for (const client of clients) {
    if (client.readyState === 1) {
      try {
        client.send(message)
        sentCount++
      } catch (error) {
        console.error(`[WS] Error sending sponsorship update for ${gameId}:`, error)
      }
    }
  }

  console.log(`[WS] Sponsorship update broadcasted to ${sentCount}/${clients.size} clients for game ${gameId}`)
}

// Utility to broadcast reward sponsorship updates
export function broadcastRewardSponsorshipUpdate(gameId, rewardId, rewardData) {
  const clients = clientsBySponsorGameId[gameId]
  if (!clients || clients.size === 0) {
    return
  }

  const message = JSON.stringify({
    type: 'rewardSponsorshipUpdate',
    data: { rewardId, reward: rewardData }
  })

  let sentCount = 0
  for (const client of clients) {
    if (client.readyState === 1) {
      try {
        client.send(message)
        sentCount++
      } catch (error) {
        console.error(`[WS] Error sending reward sponsorship update for ${gameId}:`, error)
      }
    }
  }

  console.log(`[WS] Reward sponsorship update broadcasted to ${sentCount}/${clients.size} clients for game ${gameId}, reward ${rewardId}`)
}

