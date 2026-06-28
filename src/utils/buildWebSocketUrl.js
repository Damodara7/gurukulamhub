/**
 * Build a WebSocket URL for next-ws route handlers under /api/ws/.
 */
export function buildWebSocketUrl(path) {
  if (typeof window === 'undefined') return ''

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
  return `${protocol}://${window.location.host}/api/ws${normalizedPath}`
}
