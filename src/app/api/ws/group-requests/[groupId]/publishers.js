let groupRequestClientsByGroupId = globalThis.__groupRequestClientsByGroupId || {}
globalThis.__groupRequestClientsByGroupId = groupRequestClientsByGroupId

// Utility to broadcast group request updates to all clients for a group
export function broadcastGroupRequests(groupId, requestData) {
  const clients = groupRequestClientsByGroupId[groupId]
  if (!clients) return
  const message = JSON.stringify({ type: 'groupRequests', data: requestData })
  for (const client of clients) {
    if (client.readyState === 1) {
      client.send(message)
    }
  }
}
