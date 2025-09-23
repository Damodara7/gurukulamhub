// WebSocket endpoint for audiences list updates
// This file is for use with next-ws in the Next.js app directory

let audiencesListClients = globalThis.__audiencesListClients || new Set()
globalThis.__audiencesListClients = audiencesListClients

export function SOCKET(client, request, server, context) {
  audiencesListClients.add(client)
  console.log(`[WS] Audiences list client connected. Total: ${audiencesListClients.size}`)

  client.on('close', () => {
    audiencesListClients.delete(client)
    console.log(`[WS] Audiences list client disconnected. Total: ${audiencesListClients.size}`)
  })
}
