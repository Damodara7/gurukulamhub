let groupRequestClientsByGroupId = globalThis.__groupRequestClientsByGroupId || {}
globalThis.__groupRequestClientsByGroupId = groupRequestClientsByGroupId

export function UPGRADE(client, request, server, context) {
  const { groupId } = context.params
  if (!groupRequestClientsByGroupId[groupId]) groupRequestClientsByGroupId[groupId] = new Set()
  groupRequestClientsByGroupId[groupId].add(client)
  console.log(
    `[WS] Group request client connected for group ${groupId}. Total: ${groupRequestClientsByGroupId[groupId].size}`
  )

  client.on('close', () => {
    groupRequestClientsByGroupId[groupId].delete(client)
    console.log(
      `[WS] Group request client disconnected for group ${groupId}. Total: ${groupRequestClientsByGroupId[groupId].size}`
    )
  })
}
