'use client'

import { useEffect, useRef } from 'react'

/**
 * Subscribes to real-time game detail updates for a single game (lobby, live, cancelled, etc.).
 * Keeps the connection open across status changes — do not key the effect on game.status.
 */
export function useGameDetailsWebSocket(gameId, onGameDetails) {
  const onGameDetailsRef = useRef(onGameDetails)
  onGameDetailsRef.current = onGameDetails

  useEffect(() => {
    if (!gameId) return

    const wsUrl =
      typeof window !== 'undefined'
        ? `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/api/ws/games/${gameId}`
        : ''

    if (!wsUrl) return

    let ws
    let reconnectTimer
    let closedByUnmount = false

    const connect = () => {
      ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        console.log('[WS] Connected to game details', gameId)
      }

      ws.onmessage = event => {
        try {
          const { data, type } = JSON.parse(event.data)
          if (type === 'gameDetails' && data) {
            onGameDetailsRef.current?.(data)
          }
        } catch (e) {
          console.error('[WS] Error parsing game details message', e)
        }
      }

      ws.onerror = err => {
        console.error('[WS] game details error', err)
      }

      ws.onclose = () => {
        if (!closedByUnmount) {
          reconnectTimer = setTimeout(connect, 3000)
        }
      }
    }

    connect()

    return () => {
      closedByUnmount = true
      if (reconnectTimer) clearTimeout(reconnectTimer)
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close()
      }
    }
  }, [gameId])
}

export default useGameDetailsWebSocket
