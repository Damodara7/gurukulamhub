let clientsBySponsorGames = globalThis.__clientsBySponsorGames || new Set()
globalThis.__clientsBySponsorGames = clientsBySponsorGames

export function UPGRADE(client, request, server, context) {
  clientsBySponsorGames.add(client)
  console.log(`[WS] Sponsor games list client connected. Total: ${clientsBySponsorGames.size}`)

  client.on('close', () => {
    clientsBySponsorGames.delete(client)
    console.log(`[WS] Sponsor games list client disconnected. Total: ${clientsBySponsorGames.size}`)
  })
}

