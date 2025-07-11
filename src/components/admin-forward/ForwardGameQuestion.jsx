'use client'
import React, { useEffect, useRef, useState } from 'react' // Combined import
import LiveForwardPage from './AdminForwardLivePage'
import NonLiveForwardPage from './AdminForwardPage'
import { Box, Button, Card, CardContent, Typography } from '@mui/material'
import { useRouter } from 'next/navigation'
import FallBackCard from '../apps/games/FallBackCard'
function ForwardGameQuestion({ gameId = null, game: initialGame = null }) {
  const [game, setGame] = useState(initialGame)
  const router = useRouter()

  const wsRef = useRef(null)

  useEffect(() => {
    if (gameId) {
      const wsUrl =
        typeof window !== undefined
          ? `${window.location.protocol === 'https' ? 'wss' : 'ws'}://${window.location.host}/api/ws/games/${gameId}`
          : ''

      if (wsUrl) {
        wsRef.current = new WebSocket(wsUrl)
        if (!wsRef.current) return

        wsRef.current.onopen = () => {
          console.log('[WS] Connected to game details updates')
        }

        wsRef.current.onmessage = event => {
          try {
            const { data, type } = JSON.parse(event.data)
            if (type === 'gameDetails') {
              setGame(data)
            }
          } catch (e) {
            console.error('[WS] Error parsing game details message', e)
          }
        }
        wsRef.current.onerror = err => {
          console.error('[WS] game details error', err)
        }
        wsRef.current.onclose = () => {
          console.log('[WS] game details connection closed')
        }
      }
    }
  }, [gameId])




  if(!game) return (
    <FallBackCard path='/apps/games'  content='You can go Back to All Games' btnText='Back To All Games'/>
  )

  if (
    game?.status === 'approved' ||
    game?.status === 'lobby' ||
    game?.status === 'completed' ||
    game?.status === 'cancelled'
  ) {
    return <NonLiveForwardPage game={game} setGame={setGame} />
  }

  if (game?.status === 'live') {
    const { quiz, questions, ...restGameData } = game
    return <LiveForwardPage quiz={quiz} questions={questions} game={restGameData} setGame={setGame} />
  }
  return null
}

export default ForwardGameQuestion
