let clientsByGroupId = globalThis.__clientsByGroupId || {}
globalThis.__clientsByGroupId = clientsByGroupId

export function broadcastGroupDetails(groupId, groupData) {
  const clients = clientsByGroupId[groupId]
  if (!clients) return

  const message = JSON.stringify({ type: 'groupDetails', data: groupData })
  for (let client of clients) {
    if (client.readyState === 1) {
      client.send(message)
    }
  }

  console.log(`[WS] Message broadcasted for groupDetails of ${groupId}`)
}
