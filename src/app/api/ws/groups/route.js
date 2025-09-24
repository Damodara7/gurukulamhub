// WebSocket endpoint for groups list updates
// This file is for use with next-ws in the Next.js app directory

let groupsListClients = globalThis.__groupsListClients || new Set()
globalThis.__groupsListClients = groupsListClients

export function UPGRADE(client, request, server, context) {
  groupsListClients.add(client)
  console.log(`[WS] Groups list client connected. Total: ${groupsListClients.size}`)

  client.on('close', () => {
    groupsListClients.delete(client)
    console.log(`[WS] Groups list client disconnected. Total: ${groupsListClients.size}`)
  })
}
