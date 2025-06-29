'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation' // Using App Router
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { CircularProgress, Box, Typography, useTheme } from '@mui/material'
import PlayGameInfoScreen from '@/components/public-games/play-game/PlayGameInfoScreen'
import StartPlayGame from '@/components/public-games/play-game/StartPlayGame'
import GameEnded from '@/components/public-games/play-game/GameEnded'
import GameRegistrationNotice from '@/components/public-games/play-game/GameRegistrationNotice'


function PlayGamePage() {
  const params = useParams()
  const router = useRouter()
  const [game, setGame] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [shouldStartGame, setShouldStartGame] = useState(false)

  useEffect(() => {
    const fetchGame = async () => {
      try {
        console.log('Fetching game with ID:', params.id) // Log the ID
        const res = await RestApi.get(`${API_URLS.v0.USERS_GAME}?id=${params.id}`)
        console.log('API Response:', res) // Log full response
        if (res.status === 'success') {
          setGame(res.result)
          setShouldStartGame(res.result?.status==='live')
        } else {
          console.error('API Error:', res.message)
          setError(res.message)
        }
      } catch (err) {
        console.error('Fetch Error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (params?.id) {
      fetchGame()
    }
  }, [params?.id, router])

  const handleExit = () => {
    router.push('/public-games') // Or your exit path
  }

  if (loading) {
    return (
      <Box p={4} display='flex' justifyContent='center'>
        <CircularProgress />
      </Box>
    )
  }

  if (error || !game) {
    return (
      <Box p={4}>
        <Typography color='error'>Error loading game.</Typography>
      </Box>
    )
  }

  //check if game has ended
  if (new Date() > new Date(new Date(game.startTime).getTime() + game.duration * 1000)) {
    console.log("Hello")
    return <GameEnded game={game} onExit={handleExit}  />
  }

  // caluculate the difference in minutes
  // first we get the starttime and then get the current time and we get the result in the milliseconds 
  // for convertiing milliseconds to minutes we divide by 1000 and then by 60
  // this will give us the time left in minutes

  // const timeleft = (new Date(game.startTime).getTime() - new Date().getTime()) / (1000 * 60);

  // if( timeleft >= 10){
  //   return <GameRegistrationNotice game={game}/>
  // }

  //if user has choosen to start the game
  if (shouldStartGame) {
    return <StartPlayGame game={game} setGame={setGame} />
  }
  
  //default-case - show game info screen
  if(game.status === 'lobby'){
    return <PlayGameInfoScreen game={game} setShouldStartGame={setShouldStartGame} />
  }

  return <GameRegistrationNotice game={game}/>

}

export default PlayGamePage
