import { useRouter } from 'next/navigation'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Box, Typography, CircularProgress } from '@mui/material'
import PlayGameQuiz from './play-quiz/PlayGameQuiz'
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

  if (error) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' height='100%'>
        <Typography color='error' variant='body1'>
          {error}
        </Typography>
      </Box>
    )
  }

  if (!data) return null

  const { quiz, questions, gameMode, forwardType, ...restGameData } = data
  console.log({ data })

  const PlayGameQuizByMode =
    gameMode === 'live' ? (forwardType === 'auto' ? PlayGameQuiz : AdminForwardPlayGame) : AssessmentPlayGameQuiz

  return (
    <Box p={4} height='100%'>
      <PlayGameQuizByMode quiz={quiz} questions={questions} game={restGameData} />
    </Box>
  )
}

export default StartPlayGame
