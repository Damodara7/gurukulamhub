import { handleMcpRequest } from '@/lib/mcp/server'

export const dynamic = 'force-dynamic'

export async function GET(req) {
  return handleMcpRequest(req)
}

export async function POST(req) {
  return handleMcpRequest(req)
}

export async function DELETE(req) {
  return handleMcpRequest(req)
}

