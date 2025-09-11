let clientsByGroupId = globalThis.__clientsByGroupId || {}
globalThis.__clientsByGroupId = clientsByGroupId

export function SOCKET(client, request, server, context) {
  const { groupId } = context.params
  if (!clientsByGroupId[groupId]) clientsByGroupId[groupId] = new Set()
  clientsByGroupId[groupId].add(client)
  console.log(`[WS] Group client connected for group ${groupId}. Total: ${clientsByGroupId[groupId].size}`)

  client.on('close', () => {
    clientsByGroupId[groupId].delete(client)
    console.log(`[WS] Group client disconnected for group ${groupId}. Total: ${clientsByGroupId[groupId].size}`)
  })
}
