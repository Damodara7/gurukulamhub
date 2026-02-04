let clientsByGroupId = globalThis.__clientsByGroupId || {}
globalThis.__clientsByGroupId = clientsByGroupId

export function UPGRADE(client, request, server, context) {
  const { groupId } = context.params
  if (!clientsByGroupId[groupId]) clientsByGroupId[groupId] = new Set()
  clientsByGroupId[groupId].add(client)
  console.log(`[WS] Group client connected for group ${groupId}. Total: ${clientsByGroupId[groupId].size}`)

  // Handle ping/pong for keepalive
  client.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString())
      if (msg.type === 'ping') {
        // Respond with pong to keep connection alive
        client.send(JSON.stringify({ type: 'pong' }))
      }
    } catch (error) {
      // Ignore parsing errors for non-JSON messages
    }
  })

  client.on('close', () => {
    clientsByGroupId[groupId].delete(client)
    console.log(`[WS] Group client disconnected for group ${groupId}. Total: ${clientsByGroupId[groupId].size}`)
  })
}
