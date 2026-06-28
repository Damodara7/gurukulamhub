import { GET } from '@/app/api/ws/ws-route-helpers.js'

export { GET }

// next-ws 2.x: UPGRADE(client, wsServer, request, context)
export function UPGRADE(client, wsServer, request) {
  console.warn('[WS] Rejected bare /ws/notifications — use /api/ws/notifications/{userId}')
  client.close(1008, 'userId required — connect to /api/ws/notifications/{userId}')
}
