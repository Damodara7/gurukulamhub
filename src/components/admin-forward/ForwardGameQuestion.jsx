'use client'
import React, { useEffect, useRef, useState } from 'react' // Combined import
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import LiveForwardPage from './AdminForwardLivePage'
import NonLiveForwardPage from './AdminForwardPage'
function ForwardGameQuestion({ gameId = null, game: initialGame = null }) {
  const [game, setGame] = useState(initialGame)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

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

  // useEffect(() => {
  //   const fetchGameData = async () => {
  //     try {
  //       const res = await RestApi.get(`${API_URLS.v0.USERS_GAME}?id=${gameId}`)
  //       if (res.status === 'success') {
  //         setGame(res?.result || [])
  //       } else {
  //         setError(res.message)
  //       }
  //     } catch (err) {
  //       setError(err.message)
  //     } finally {
  //       setLoading(false)
  //     }
  //   }

  //   fetchGameData()
  // }, [gameId])

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error}</p>
  if (!game) return <p>No game data found</p>

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
