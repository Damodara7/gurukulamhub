let clientsByAudienceId = globalThis.__clientsByAudienceId || {}
globalThis.__clientsByAudienceId = clientsByAudienceId

export function broadcastAudienceDetails(audienceId, audienceData) {
  const clients = clientsByAudienceId[audienceId]
  if (!clients) return

  const message = JSON.stringify({ type: 'audienceDetails', data: audienceData })
  for (let client of clients) {
    if (client.readyState === 1) {
      client.send(message)
    }
  }

  console.log(`[WS] Message broadcasted for audienceDetails of ${audienceId}`)
}
