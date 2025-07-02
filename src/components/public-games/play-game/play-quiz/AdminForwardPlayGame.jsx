import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Typography, Alert, Paper, Chip, LinearProgress } from '@mui/material'
import QuizQuestion from './GameQuizQuestion'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import GameEnded from '../GameEnded'
import { useSession } from 'next-auth/react'
import { formatTime } from '@/components/Timer'

const getColor = percentage => {
  if (percentage > 50) return 'primary'
  if (percentage > 25) return 'warning'
  return 'error'
}

const TimerChip = ({ remainingTime, duration }) => {
  const progress = (remainingTime / duration) * 100
  return (
    <Chip
      label={formatTime(remainingTime)}
      color={getColor(progress)}
      variant='outlined'
      sx={{ transition: 'background-color 0.3s ease' }}
    />
  )
}

const ProgressBar = ({ progress }) => (
  <LinearProgress
    variant='determinate'
    value={progress}
    color={getColor(progress)}
    sx={{ height: '8px', transition: 'all 0.3s ease' }}
  />
)

const calculateQuestionMarks = (question, selectedAnswer, hintUsed) => {
  const correctAnswerIds = question.data?.options?.filter(option => option.correct).map(option => option.id) || []
  let gainedMarks = 0
  if (question.templateId === 'single-choice' || question.templateId === 'true-or-false') {
    if (selectedAnswer === correctAnswerIds[0]) {
      gainedMarks += Number(question.data?.marks) || 0
    }
  } else if (question.templateId === 'multiple-choice') {
    const selectedAnswerIds = Array.isArray(selectedAnswer) ? selectedAnswer : [selectedAnswer]
    const correctSelected = selectedAnswerIds.filter(answerId => correctAnswerIds.includes(answerId)).length
    if (correctAnswerIds.length > 0) {
      gainedMarks += (correctSelected / correctAnswerIds.length) * (Number(question.data?.marks) || 0)
    }
  } else if (question.templateId === 'fill-in-blank') {
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
    if (res.status !== 'success') {
      // Optionally handle error
    }
  } catch (error) {
    // Optionally handle error
  }
}

export default function AdminForwardPlayGame({ quiz, questions, game }) {
  const { data: session } = useSession()
  const router = useRouter()
  const storageKey = `game-${game._id}-quiz-${quiz._id}-admin-state`

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(game.liveQuestionIndex || 0)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [usedHints, setUsedHints] = useState({})
  const [lastAnswerTimes, setLastAnswerTimes] = useState({})
  const [gameEnded, setGameEnded] = useState(false)
  const [remainingTime, setRemainingTime] = useState(0)
  const [pollingGame, setPollingGame] = useState(game)

  const duration = game?.duration || 0
  const startTime = useMemo(() => new Date(game?.startTime), [game?.startTime])

  const mappedQuestions = useMemo(() => {
    let cumulativeTime = 0
    return (
      questions?.map(q => {
        cumulativeTime += (q?.data?.timerSeconds || 0) * 1000
        return {
          ...q,
          data: {
            ...q.data,
            expiresAt: new Date(startTime.getTime() + cumulativeTime)
          }
        }
      }) || []
    )
  }, [questions, startTime])

  // Poll for liveQuestionIndex changes (simulate websocket)
  useEffect(() => {
    if (gameEnded) return
    const interval = setInterval(async () => {
      const res = await RestApi.get(`${API_URLS.v0.USERS_GAME}/${game._id}`)
      if (res?.result) {
        setPollingGame(res.result)
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [game._id, gameEnded])

  // When liveQuestionIndex changes, submit previous and move to new
  useEffect(() => {
    if (pollingGame.liveQuestionIndex !== currentQuestionIndex) {
      // Submit answer for previous question if not already submitted
      if (currentQuestionIndex >= 0 && currentQuestionIndex < mappedQuestions.length) {
        calculateAndUpdateUserScore({ finish: false, index: currentQuestionIndex })
      }
      setCurrentQuestionIndex(pollingGame.liveQuestionIndex)
    }
    if (pollingGame.status === 'completed') {
      setGameEnded(true)
    }
  }, [pollingGame.liveQuestionIndex, pollingGame.status])

  useEffect(() => {
    const initialRemaining = Math.max(duration - Math.floor((Date.now() - startTime.getTime()) / 1000), 0)
    setRemainingTime(initialRemaining)
    const timerInterval = setInterval(() => {
      const newRemaining = Math.max(duration - Math.floor((Date.now() - startTime.getTime()) / 1000), 0)
      setRemainingTime(newRemaining)
    }, 1000)
    return () => clearInterval(timerInterval)
  }, [duration, startTime])

  function handleAnswerSelect(questionId, optionId) {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionId }))
    setLastAnswerTimes(prev => ({ ...prev, [questionId]: new Date() }))
  }

  function handleAnswerFillInBlanks(questionId, value) {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: value }))
    setLastAnswerTimes(prev => ({ ...prev, [questionId]: new Date() }))
  }

  const handleShowHint = questionId => {
    setUsedHints(prev => ({ ...prev, [questionId]: true }))
  }

  async function calculateAndUpdateUserScore({ finish, index }) {
    const idx = typeof index === 'number' ? index : currentQuestionIndex
    const currentQuestion = mappedQuestions[idx]
    const curQuestionTimerSeconds = currentQuestion?.data?.timerSeconds || 0
    const curQuestionExpiresAt = currentQuestion?.data?.expiresAt
    const selectedAnswer = selectedAnswers[currentQuestion._id]
    const questionStart = new Date(curQuestionExpiresAt - curQuestionTimerSeconds * 1000)
    const lastAnswerTime = lastAnswerTimes[currentQuestion._id]
    const answerTime = lastAnswerTime && questionStart ? lastAnswerTime - questionStart : null
    const answeredAt = lastAnswerTimes[currentQuestion._id] || null
    const hintUsed = usedHints[currentQuestion._id] || false
    if (!selectedAnswer) return
    const calculatedMarks = calculateQuestionMarks(currentQuestion, selectedAnswer, hintUsed)
    const maxFFF = 1000
    const fffPoints =
      calculatedMarks > 0
        ? maxFFF *
          (1 - answerTime / (curQuestionTimerSeconds * 1000)) *
          (calculatedMarks / currentQuestion?.data?.marks)
        : 0
    try {
      await updateUserScore(game._id, {
        user: { id: session.user.id, email: session.user.email },
        userAnswer: {
          question: currentQuestion._id,
          answer: selectedAnswer,
          marks: calculatedMarks,
          hintMarks: hintUsed ? currentQuestion?.data?.hintMarks : 0,
          hintUsed,
          skipped: false,
          answerTime: answerTime,
          fffPoints,
          answeredAt: answeredAt
        },
        finish: finish
      })
    } catch (error) {}
  }

  const handleExit = () => {
    router.push('/public-games')
  }

  const currentQuestion = mappedQuestions[currentQuestionIndex]
  const progress = (remainingTime / duration) * 100
  const hasHint = !!currentQuestion?.data?.hint
  const hintUsed = !!usedHints[currentQuestion?._id]

  if (gameEnded) {
    return <GameEnded game={game} onExit={handleExit} isAdmin={false} />
  }

  return (
    <>
      <Box sx={{ mx: 'auto', px: 2, width: { xs: '100%', sm: '100%' }, height: '100%' }}>
        <Paper elevation={0} sx={{ p: 2, my: 4, maxWidth: 'lg', mx: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant='h6' component='div'>
              Time Remaining
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <TimerChip remainingTime={remainingTime} duration={duration} />
            </Box>
          </Box>
          <ProgressBar progress={progress} />
        </Paper>
        {mappedQuestions.length > 0 ? (
          <QuizQuestion
            currentQuestion={currentQuestion}
            currentQuestionIndex={currentQuestionIndex}
            questions={mappedQuestions}
            selectedAnswers={selectedAnswers}
            handleAnswerFillInBlanks={handleAnswerFillInBlanks}
            handleAnswerSelect={handleAnswerSelect}
            handleShowHint={handleShowHint}
            hintUsed={hintUsed}
            hasHint={hasHint}
            isSkippable={false}
            handleSkip={null}
            timeLeft={null}
          />
        ) : (
          <Alert severity='error'>No mappedQuestions available for this quiz</Alert>
        )}
      </Box>
    </>
  )
}
