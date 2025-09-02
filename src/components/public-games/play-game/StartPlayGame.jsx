import { useRouter } from 'next/navigation'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Box, Typography, CircularProgress, Card, CardContent, Button } from '@mui/material'
import PlayGameQuiz from './play-quiz/auto-forward/PlayGameQuiz'
import AssessmentPlayGameQuiz from './play-quiz/AssessmentPlayGameQuiz'
import AdminForwardPlayGame from './play-quiz/admin-forward/PlayGameQuiz'
import FallBackCard from '@/components/apps/games/FallBackCard'

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
      <FallBackCard
        content='You can go back to Home page'
        error={error}
        path='/'
        btnText='Back to Home'
      />
    )
  }

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
