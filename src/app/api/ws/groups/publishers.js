let groupsListClients = globalThis.__groupsListClients || new Set()
globalThis.__groupsListClients = groupsListClients

// Utility to broadcast groups list updates to all clients
export function broadcastGroupsList(groupsList) {
  const message = JSON.stringify({ type: 'groupsList', data: groupsList })
  for (const client of groupsListClients) {
    if (client.readyState === 1) {
      client.send(message)
    }
  }
}
