'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation' // Using App Router
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { CircularProgress, Box } from '@mui/material'
import PlayGameInfoScreen from '@/components/public-games/play-game/PlayGameInfoScreen'
import StartPlayGame from '@/components/public-games/play-game/StartPlayGame'
import GameEnded from '@/components/public-games/play-game/GameEnded'
import GameRegistrationNotice from '@/components/public-games/play-game/GameRegistrationNotice'
import FallBackCard from '@/components/apps/games/FallBackCard'
import GameCancelledNotice from '@/components/public-games/play-game/GameCancelledNotice'
import { useGameDetailsWebSocket } from '@/hooks/useGameDetailsWebSocket'

function PlayGamePage() {
  const params = useParams()
  const router = useRouter()
  const [game, setGame] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [shouldStartGame, setShouldStartGame] = useState(false)

  const applyGameUpdate = useCallback(updatedGame => {
    if (!updatedGame) return
    setGame(updatedGame)
    setShouldStartGame(updatedGame.status === 'live')
  }, [])

  const fetchGame = useCallback(async () => {
    try {
      const res = await RestApi.get(`${API_URLS.v0.USERS_GAME}?id=${params.id}`)
      if (res.status === 'success') {
        applyGameUpdate(res.result)
      } else {
        setError(res.message)
      }
    } catch (err) {
      console.error('Fetch Error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [params.id, applyGameUpdate])

  useEffect(() => {
    if (params?.id) {
      setLoading(true)
      fetchGame()
    }
  }, [params?.id, fetchGame])

  // Real-time updates: approved → lobby → live → cancelled
  useGameDetailsWebSocket(params?.id, applyGameUpdate)

  // Poll fallback so UI stays in sync if a WS message is missed (e.g. dev hot reload)
  useEffect(() => {
    if (!params?.id || loading) return

    const pollInterval = setInterval(() => {
      RestApi.get(`${API_URLS.v0.USERS_GAME}?id=${params.id}`)
        .then(res => {
          if (res.status === 'success' && res.result) {
            applyGameUpdate(res.result)
          }
        })
        .catch(() => {})
    }, 15000)

    return () => clearInterval(pollInterval)
  }, [params?.id, loading, applyGameUpdate])

  const handleExit = () => {
    router.push('/public-games') // Or your exit path
  }

  if (loading) {
    return (
      <Box
        sx={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'background.default'
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  if (error || !game) {
    return (
      <Box
        sx={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'background.default'
        }}
      >
        <FallBackCard
          error={error}
          path='/public-games'
          content='You can go back to Public Games '
          btnText='Back To Public Games'
        />
      </Box>
    )
  }

  //check if game has ended
  if (game.status === 'completed') {
    return (
      <Box
        sx={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
          bgcolor: 'background.default'
        }}
      >
        <GameEnded game={game} onExit={handleExit} />
      </Box>
    )
  }

  // caluculate the difference in minutes
  // first we get the starttime and then get the current time and we get the result in the milliseconds
  // for convertiing milliseconds to minutes we divide by 1000 and then by 60
  // this will give us the time left in minutes

  // const timeleft = (new Date(game.startTime).getTime() - new Date().getTime()) / (1000 * 60);

  // if( timeleft >= 10){
  //   return <GameRegistrationNotice game={game}/>
  // }

  if (game.status === 'cancelled') {
    return <GameCancelledNotice game={game} redirectPath='/public-games' />
  }

  // Only enter the quiz after the server has moved the game to live (admin-forward requires manual start)
  if (shouldStartGame && game.status === 'live') {
    return <StartPlayGame game={game} setGame={setGame} />
  }

  //default-case - show game info screen
  if (game.status === 'lobby') {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
          bgcolor: 'background.default'
        }}
      >
        <PlayGameInfoScreen game={game} setShouldStartGame={setShouldStartGame} setGame={setGame} />
      </Box>
    )
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        bgcolor: 'background.default'
      }}
    >
      <GameRegistrationNotice game={game} />
    </Box>
  )
}

export default PlayGamePage
