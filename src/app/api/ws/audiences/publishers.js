let audiencesListClients = globalThis.__audiencesListClients || new Set()
globalThis.__audiencesListClients = audiencesListClients

// Utility to broadcast audiences list updates to all clients
export function broadcastAudiencesList(audiencesList) {
  const message = JSON.stringify({ type: 'audiencesList', data: audiencesList })
  for (const client of audiencesListClients) {
    if (client.readyState === 1) {
      client.send(message)
    }
  }
}
