import { useRouter } from 'next/navigation'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Box, Typography, CircularProgress, Card, CardContent, Button } from '@mui/material'
import PlayGameQuiz from './play-quiz/auto-forward/PlayGameQuiz'
import AssessmentPlayGameQuiz from './play-quiz/AssessmentPlayGameQuiz'
import AdminForwardPlayGame from './play-quiz/admin-forward/PlayGameQuiz'

const StartPlayGame = ({ game }) => {
  const router = useRouter()
  const { data: session, status } = useSession()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  console.log('game inside the StartPlayGame: ', game)

  useEffect(() => {
    if (
      !session ||
      status === 'loading' ||
      game?.participatedUsers?.findIndex(
        p => p.email === session?.user?.email && ['participated', 'completed'].includes(p.status)
      ) >= 0
    ) {
      setData(game)
    } else {
      const startGame = async () => {
        setLoading(true)
        try {
          const res = await RestApi.post(`${API_URLS.v0.USERS_GAME}/${game._id}/start`, {
            user: {
              email: session.user.email,
              id: session.user.id
            }
          })

          if (res.status === 'success') {
            setData(res.result)
          } else {
            setError(res.message || 'Failed to start the game.')
          }
        } catch (err) {
          console.error('Error starting game:', err)
          setError('An error occurred while starting the game.')
        } finally {
          setLoading(false)
        }
      }

      startGame()
    }
  }, [session, status, game])

  if (loading || status === 'loading') {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' height='100%'>
        <CircularProgress />
      </Box>
    )
  }
  if (error || !data) {
    return (
      <Box display='flex' flexDirection='column' alignItems='center' bgcolor='#f5f5f5' px={2} py={4} gap={4}>

            <Card sx={{ maxWidth: 500, p: 3, textAlign: 'center' }}>
              <CardContent>
                <Typography variant='h5' gutterBottom>
                  {error ? '⚠️ Error Occurred' : '🎮 Game is Not Available'}
                </Typography>

                {error ? (
                  <Typography color='error' variant='body1' sx={{ mt: 2 }}>
                    {error}
                  </Typography>
                ) : (
                  <Typography variant='body1' sx={{ mt: 2 }}>
                    You can go back to Public games
                  </Typography>
                )}
      
                <Box display='flex' gap={6} flexWrap='wrap' mt={2} alignItems='center' justifyContent='center'>
                  <Button
                    component='label'
                    size='small'
                    variant='contained'
                    onClick={() => router.push('/public-games')}
                    sx={{ color: 'white' }}
                  >
                    Back To Public Games
                  </Button>
                </Box>

              </CardContent>
            </Card>
      </Box>
    )
  }

  // if (error) {
  //   return (
  //     <Box display='flex' justifyContent='center' alignItems='center' height='100%'>
  //       <Typography color='error' variant='body1'>
  //         {error}
  //       </Typography>
  //     </Box>
  //   )
  // }

  // if (!data ) return (
  //   <Box display='flex' flexDirection='column' alignItems='center' bgcolor='#f5f5f5' px={2} py={4} gap={4}>
  //     <Card sx={{ maxWidth: 500, p: 3, textAlign: 'center' }}>
  //       <CardContent>
  //         <Typography variant='h5' gutterBottom>
  //           🎮 Game is Not Available
  //         </Typography>

  //         <Typography variant='body1' sx={{ mt: 2 }}>
  //           You can go back to Public games
  //         </Typography>
  //         <Typography variant='h6' color='primary' sx={{ mt: 1 }}></Typography>

  //         <Box display='flex' gap={6} flexWrap='wrap' mt={2} alignItems='center' justifyContent='center'>
  //           <Button
  //             component='label'
  //             size='small'
  //             variant='contained'
  //             onClick={() => router.push('/public-games')}
  //             sx={{ color: 'white' }}
  //           >
  //             Back To Public Games
  //           </Button>
  //         </Box>
  //       </CardContent>
  //     </Card>
  //   </Box>
  // )

  const { quiz, questions, gameMode, forwardType, ...restGameData } = data
  // console.log({ data })

  const PlayGameQuizByMode =
    gameMode === 'live' ? (forwardType === 'auto' ? PlayGameQuiz : AdminForwardPlayGame) : AssessmentPlayGameQuiz

  return (
    <Box p={4} height='100%'>
      <PlayGameQuizByMode quiz={quiz} questions={questions} game={data} />
    </Box>
  )
}

export default StartPlayGame
