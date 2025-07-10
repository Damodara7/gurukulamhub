'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation' // Using App Router
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { CircularProgress, Box, Typography, useTheme, CardContent, Button, Card  } from '@mui/material'
import PlayGameInfoScreen from '@/components/public-games/play-game/PlayGameInfoScreen'
import StartPlayGame from '@/components/public-games/play-game/StartPlayGame'
import GameEnded from '@/components/public-games/play-game/GameEnded'
import GameRegistrationNotice from '@/components/public-games/play-game/GameRegistrationNotice'
import textAlign from 'tailwindcss-logical/plugins/textAlign'


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
      // <Box p={4}>
      //   <Typography color='error'>Error loading game.</Typography>
      // </Box>
      <Box display='flex' flexDirection='column' alignItems='center' bgcolor='f5f5f5' px={2} py={4} gap={4}>
        <Card sx={{ maxwidth: 500, p: 3, textAlign: 'center' }}>
          <CardContent>
            <Typography variant='h5' gutterBottom>
              {error ? '⚠️  Error Occurred' : '🎮 Game is Not Available'}
            </Typography>
            {error ? (
              <Typography color='error' variant='body1' sx={{mt:2}}>
                {error}
              </Typography>
            ):(
            <Typography variant='body1' sx={{ mt:2 }}>
              You can go back to Public Games
            </Typography>)}
            <Box display='flex' gap={6} flexWrap='wrap' mt={2} alignItems='center' justifyContent='center'>
              <Button
              component='label'
              size='small'
              variant='contained'
              onClick={()=>router.push('/public-games')}
              sx={{color:'white'}}
              >
                Back To Public Games
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    )
  }

  //check if game has ended
  if (game.status === 'completed') {
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
