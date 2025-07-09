'use client'
import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Typography, Alert, CardContent, useTheme, LinearProgress, Chip, Paper } from '@mui/material'
import Loading from '@/components/Loading'
import Timer, { formatTime } from '@/components/Timer'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { toast } from 'react-toastify'
import { AccessTime as TimeIcon } from '@mui/icons-material'
import { useSession } from 'next-auth/react'
import AdminForwardQuizQuestion from './AdminForwardQuizQuestion'
import AdminForwardLiveHeader from './AdminForwardLiveHeader'


function AdminForwardLivePage({ quiz, questions, game , setGame, onGameEnd }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [gameEnded, setGameEnded] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  // Check if user is admin
  useEffect(() => {
    if (session?.user?.email === game?.forwardingAdmin?.email) {
      setIsAdmin(true)
    }
  }, [session, game])

  const mappedQuestions = useMemo(() => {
    return questions || []
  }, [questions])

  const currentQuestion = mappedQuestions[currentQuestionIndex]

  

  const handleGameEnd = async () => {
    try {
      if (isAdmin) {
        const result = await RestApi.post(`${API_URLS.v0.USERS_GAME}/${game._id}/admin-forward/forward-question`, {
          user: { email: session.user.email },
          currentQuestionIndex
        })
        if (result.status === 'success') {
          setGame(result.result) // Update game state with the returned game data
          setGameEnded(true)
          if (onGameEnd) {
            onGameEnd()
          }
        } else {
          console.error('Failed to end game:', result.message)
        }
      }
    } catch (error) {
      console.error('Error ending game:', error)
    }
  }

  // console.log('game admin data', game)
  // console.log('Is admin:', isAdmin)
  // console.log('Game status:', game?.status)
  // console.log('Current question index:', currentQuestionIndex)
  // console.log('Total questions:', mappedQuestions.length)

  // Admin function to manually go to next question

  const handleForwardQuestion = async () => {
    try {
      if (currentQuestionIndex < mappedQuestions.length - 1) {
        // For non-final questions, just increment the index
        try {
            const res = await RestApi.post(`${API_URLS.v0.USERS_GAME}/${game._id}/admin-forward/forward-question`, {
              user: { email: session.user.email },
              currentQuestionIndex
            })
            if (res.status === 'success') {
              setGame(res.result)
              setCurrentQuestionIndex(res.result.liveQuestionIndex)
              console.log(res.result.liveQuestionIndex)
            } else {
              console.error('Failed to end game:', result.message)
            }
          
        } catch (error) {
          console.error('Error ending game:', error)
        }

      } else {
        // For the final question, end the game
        await handleGameEnd()
      }
    } catch (error) {
      console.log('Error forwarding questions:', error)
    }
  }

  useEffect(() => {
    setCurrentQuestionIndex(game?.liveQuestionIndex)
  }, [game?.liveQuestionIndex])


  return (
    <>
      <Box sx={{ mx: 'auto', px: 2, width: { xs: '100%', sm: '100%' }, height: '100%' }}>
        <AdminForwardLiveHeader
          registeredUsers={game?.registeredUsers}
          participatedUsers={game?.participatedUsers}
          game={game}
        />
        {mappedQuestions.length > 0 ? (
          <AdminForwardQuizQuestion
            currentQuestion={currentQuestion}
            currentQuestionIndex={currentQuestionIndex}
            questions={mappedQuestions}
            isAdmin={isAdmin}
            handleForwardQuestion={handleForwardQuestion}
          />
        ) : (
          <Alert severity='error'>No questions available for this quiz</Alert>
        )}
      </Box>
    </>
  )
}

export default AdminForwardLivePage