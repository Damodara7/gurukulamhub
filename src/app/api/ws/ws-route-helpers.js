/** Silence Next.js "No HTTP methods exported" warnings for next-ws routes. */
export function GET() {
  return new Response('WebSocket endpoint — connect via WS upgrade', {
    status: 426,
    headers: { Upgrade: 'websocket' }
  })
}
