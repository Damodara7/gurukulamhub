import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'

const clients = globalThis.__aiMcpClients || new Map()
globalThis.__aiMcpClients = clients

function getMcpUrl(origin) {
  return new URL('/api/ai/mcp', origin)
}

export async function getMcpClient({ aiSessionId, origin }) {
  const cached = clients.get(aiSessionId)
  if (cached) return cached

  const transport = new StreamableHTTPClientTransport(getMcpUrl(origin))
  const client = new Client({
    name: 'gurukulam-agent-client',
    version: '1.0.0'
  })

  await client.connect(transport)
  const instance = { client, transport }
  clients.set(aiSessionId, instance)
  return instance
}

export async function listMcpTools(ctx) {
  const { client } = await getMcpClient(ctx)
  const res = await client.listTools()
  return res?.tools || []
}

export async function callMcpTool(ctx, { name, args }) {
  const { client } = await getMcpClient(ctx)
  const res = await client.callTool({
    name,
    arguments: args || {}
  })
  return res
}

