'use client'
import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Typography, Alert, CardContent, useTheme, LinearProgress, Chip, Paper } from '@mui/material'
import Loading from '@/components/Loading'
import Timer, { formatTime } from '@/components/Timer'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { toast } from 'react-toastify'
import GameEnded from '@/components/public-games/play-game/GameEnded'
import { AccessTime as TimeIcon } from '@mui/icons-material'
import { useSession } from 'next-auth/react'
import AdminForwardQuizQuestion from './AdminForwardQuizQuestion'
import AdminForwardLiveHeader from './AdminForwardLiveHeader'

// const getColor = percentage => {
//   if (percentage > 50) return 'primary'
//   if (percentage > 25) return 'warning'
//   return 'error'
// }

// const TimerChip = ({ remainingTime, duration }) => {
//   const progress = (remainingTime / duration) * 100

//   return (
//     <Chip
//       label={formatTime(remainingTime)}
//       color={getColor(progress)}
//       variant='outlined'
//       sx={{
//         transition: 'background-color 0.3s ease'
//       }}
//     />
//   )
// }

// const ProgressBar = ({ progress }) => {
//   return (
//     <LinearProgress
//       variant='determinate'
//       value={progress}
//       color={getColor(progress)}
//       sx={{
//         height: '8px',
//         transition: 'all 0.3s ease'
//       }}
//     />
//   )
// }

const calculateQuestionMarks = (question, selectedAnswer, hintUsed) => {
  const correctAnswerIds = question.data?.options?.filter(option => option.correct).map(option => option.id) || []
  let gainedMarks = 0

  // Single Choice/True or False
  if (question.templateId === 'single-choice' || question.templateId === 'true-or-false') {
    if (selectedAnswer === correctAnswerIds[0]) {
      gainedMarks += Number(question.data?.marks) || 0
    }
  }

  // Multiple Choice
  else if (question.templateId === 'multiple-choice') {
    const selectedAnswerIds = Array.isArray(selectedAnswer) ? selectedAnswer : [selectedAnswer]
    const correctSelected = selectedAnswerIds.filter(answerId => correctAnswerIds.includes(answerId)).length

    if (correctAnswerIds.length > 0) {
      gainedMarks += (correctSelected / correctAnswerIds.length) * (Number(question.data?.marks) || 0)
    }
  }

  // Fill in Blank
  else if (question.templateId === 'fill-in-blank') {
    const correctBlanks = question.data?.question?.filter(part => part.type === 'blank') || []
    const selectedBlankAnswers = Array.isArray(selectedAnswer) ? selectedAnswer : []

    const correctSelected = selectedBlankAnswers.filter(answer => {
      const correctBlank = correctBlanks.find(blank => blank.id === answer.id)
      return correctBlank && answer.content?.trim().toLowerCase() === correctBlank.content?.trim().toLowerCase()
    }).length

    if (correctBlanks.length > 0) {
      gainedMarks += (correctSelected / correctBlanks.length) * Number(question.data?.marks) || 0
    }
  }

  // Handle hint marks deduction
  const hintMarks = hintUsed ? Number(question.data?.hintMarks) || 0 : 0

  return gainedMarks + hintMarks
}

async function updateUserScore(gameId, { user, userAnswer, finish }) {
  try {
    const res = await RestApi.post(`${API_URLS.v0.USERS_GAME}/${gameId}/player`, {
      user,
      userAnswer,
      finish
    })
    if (res.status === 'success') {
      console.log('Score updated successfully')
    } else {
      console.log('Error while updating score: ', res.message)
    }
  } catch (error) {
    console.log('Error while updating score: ', error.message)
  }
}

function AdminForwardLivePage({ quiz, questions, game, onGameEnd }) {
  const { data: session } = useSession()
  const router = useRouter()
  const storageKey = `game-${game._id}-quiz-${quiz._id}-state`

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [usedHints, setUsedHints] = useState({})
  const [skippedQuestions, setSkippedQuestions] = useState([])
  const [gameEnded, setGameEnded] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  // Check if user is admin
  console.log('gamedata for check duration ' , game)
  useEffect(() => {
    if (session?.user?.email === game?.createdBy?.email) {
      setIsAdmin(true)
    }
  }, [session, game])

  const mappedQuestions = useMemo(() => {
    return questions || []
  }, [questions])

  // const calculateRemainingTime = () => {
  //   const now = new Date()
  //   const elapsed = Math.floor((now - startTime) / 1000)
  //   return Math.max(duration - elapsed, 0)
  // }

  // useEffect(() => {
  //   const initialRemaining = calculateRemainingTime()
  //   setRemainingTime(initialRemaining)

  //   const timerInterval = setInterval(() => {
  //     const newRemaining = calculateRemainingTime()
  //     setRemainingTime(newRemaining)
  //   }, 1000)

  //   return () => clearInterval(timerInterval)
  // }, [game?.startTime, duration])

  const currentQuestion = mappedQuestions[currentQuestionIndex]

  function handleAnswerSelect(questionId, optionId) {
    const newAnswers = { ...selectedAnswers, [questionId]: optionId }
    setSelectedAnswers(newAnswers)
    const updatedSkippedQuestions = skippedQuestions.filter(q => q.index !== currentQuestionIndex)
    setSkippedQuestions(updatedSkippedQuestions)
  }

  function handleAnswerFillInBlanks(questionId, value) {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  const handleShowHint = questionId => {
    setUsedHints(prev => ({ ...prev, [questionId]: true }))
  }

  async function handleSkip() {
    const currentQuestionId = mappedQuestions[currentQuestionIndex]?._id
    if (selectedAnswers[currentQuestionId]) {
      setSelectedAnswers(prev => {
        const updatedAnswers = { ...prev }
        delete updatedAnswers[currentQuestionId]
        return updatedAnswers
      })
    }
    setSkippedQuestions(prev => [
      ...prev,
      { question: mappedQuestions[currentQuestionIndex], index: currentQuestionIndex }
    ])
    handleNext()
  }

  async function handleGameEnd() {
    setGameEnded(true)
    localStorage.removeItem(storageKey)
    await calculateAndUpdateUserScore({ finish: true })
    if (onGameEnd) {
      onGameEnd() // Call the callback if provided
    }
  }

  async function handleNext() {
    if (currentQuestionIndex < mappedQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      await calculateAndUpdateUserScore({ finish: false })
    } else {
      handleGameEnd()
    }
  }

  // Admin-specific function to manually go to next question
  const handleForwardQuestion = async () => {
    if (currentQuestionIndex < mappedQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      await handleGameEnd()
    }
  }

  async function calculateAndUpdateUserScore({ finish }) {
    if (isAdmin) return // Skip score calculation for admin

    const currentQuestion = mappedQuestions[currentQuestionIndex]
    const selectedAnswer = selectedAnswers[currentQuestion._id]
    const hintUsed = usedHints[currentQuestion._id] || false

    if (!selectedAnswer) {
      await updateUserScore(game._id, {
        userAnswer: {
          question: currentQuestion._id,
          marks: 0,
          hintMarks: hintUsed ? currentQuestion?.data?.hintMarks : 0,
          hintUsed,
          skipped: true,
          answerTime: 0,
          fffPoints: 0,
          answeredAt: new Date().toISOString()
        },
        user: { id: session.user.id, email: session.user.email },
        finish: finish
      })
      return
    }

    const calculatedMarks = calculateQuestionMarks(currentQuestion, selectedAnswer, hintUsed)

    try {
      await updateUserScore(game._id, {
        userAnswer: {
          question: currentQuestion._id,
          answer: selectedAnswer,
          marks: calculatedMarks,
          hintMarks: hintUsed ? currentQuestion?.data?.hintMarks : 0,
          hintUsed,
          skipped: false,
          answerTime: 0,
          fffPoints: calculatedMarks > 0 ? 1000 : 0,
          answeredAt: new Date().toISOString()
        },
        user: { id: session.user.id, email: session.user.email },
        finish: finish
      })
    } catch (error) {
      console.log('Error updating user answer & score: ', error)
    }
  }

  const hintUsed = usedHints[currentQuestion?._id] || false
  const hasHint = !!currentQuestion?.data?.hint
  const isSkippable = true

  const handleExit = () => {
    router.push('/public-games')
  }

  useEffect(() => {
    const savedState = JSON.parse(localStorage.getItem(storageKey))
    if (savedState) {
      setCurrentQuestionIndex(savedState?.currentQuestionIndex || 0)
      setSelectedAnswers(savedState?.selectedAnswers || {})
      setUsedHints(savedState?.usedHints || {})
      setSkippedQuestions(savedState?.skippedQuestions || [])
    }
  }, [storageKey])

  useEffect(() => {
    const stateToSave = {
      currentQuestionIndex,
      selectedAnswers,
      usedHints,
      skippedQuestions
    }
    if (!gameEnded) {
      localStorage.setItem(storageKey, JSON.stringify(stateToSave))
    }
  }, [currentQuestionIndex, selectedAnswers, usedHints, skippedQuestions, storageKey])

  useEffect(() => {
    if (gameEnded) {
      localStorage.removeItem(storageKey)
    }
  }, [storageKey, gameEnded])

  const isUserCompletedGame = game.participatedUsers.find(pu => pu.email === session.user.email)?.completed || false

  // const isGameEnded = new Date() > new Date(new Date(game.startTime).getTime() + game.duration * 1000)

  if (gameEnded || isUserCompletedGame) {
    return <GameEnded game={game} onExit={handleExit} />
  }

  

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
            selectedAnswers={selectedAnswers}
            handleAnswerFillInBlanks={handleAnswerFillInBlanks}
            handleAnswerSelect={handleAnswerSelect}
            handleShowHint={handleShowHint}
            hintUsed={hintUsed}
            hasHint={hasHint}
            isSkippable={isSkippable}
            handleSkip={handleSkip}
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