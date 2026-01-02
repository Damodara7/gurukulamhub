let clientsBySponsorGameId = globalThis.__clientsBySponsorGameId || {}
globalThis.__clientsBySponsorGameId = clientsBySponsorGameId

export function UPGRADE(client, request, server, context) {
  const { gameId } = context.params
  if (!clientsBySponsorGameId[gameId]) clientsBySponsorGameId[gameId] = new Set()
  clientsBySponsorGameId[gameId].add(client)
  console.log(`[WS] Sponsor game client connected for game ${gameId}. Total: ${clientsBySponsorGameId[gameId].size}`)

  client.on('close', () => {
    clientsBySponsorGameId[gameId].delete(client)
    console.log(`[WS] Sponsor game client disconnected for game ${gameId}. Total: ${clientsBySponsorGameId[gameId].size}`)
  })
}

