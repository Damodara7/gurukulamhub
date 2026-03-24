import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js'
import { agentTools } from '@/lib/tools'

const transports = globalThis.__aiMcpTransports || {}
globalThis.__aiMcpTransports = transports

function createConfiguredServer() {
  const server = new McpServer({
    name: 'gurukulam-agent-tools',
    version: '1.0.0'
  })

  for (const tool of agentTools) {
    server.registerTool(
      tool.name,
      {
        description: tool.description,
        inputSchema: tool.schema
      },
      async (args = {}) => {
        const result = await tool.handler(args)
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result)
            }
          ],
          structuredContent: result
        }
      }
    )
  }

  return server
}

function getSessionHeader(req) {
  return req.headers.get('mcp-session-id') || ''
}

async function getOrCreateTransport(sessionId) {
  if (sessionId && transports[sessionId]) {
    return transports[sessionId]
  }

  const server = createConfiguredServer()
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: () => crypto.randomUUID(),
    onsessioninitialized: (newId) => {
      transports[newId] = transport
    }
  })

  await server.connect(transport)
  if (sessionId) transports[sessionId] = transport
  return transport
}

export async function handleMcpRequest(req) {
  const sessionId = getSessionHeader(req)
  const transport = await getOrCreateTransport(sessionId)
  const response = await transport.handleRequest(req)

  if (req.method === 'DELETE') {
    const sid = sessionId || transport.sessionId
    if (sid && transports[sid]) {
      delete transports[sid]
    }
  }

  return response
}

