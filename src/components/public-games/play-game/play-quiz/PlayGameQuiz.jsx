'use client'
import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Typography, Alert, CardContent, useTheme, LinearProgress, Chip, Paper } from '@mui/material'
import Loading from '@/components/Loading'
import QuizQuestion from './AdminForwardGameQuizQuestion'
import Timer, { formatTime } from '@/components/Timer'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { toast } from 'react-toastify'
import './PlayGameQuiz.css'
import GameEnded from '../GameEnded'
import { AccessTime as TimeIcon } from '@mui/icons-material'
import { useSession } from 'next-auth/react'
import Leaderboard from '../Leaderboard'

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
      sx={{
        transition: 'background-color 0.3s ease'
      }}
    />
  )
}

const ProgressBar = ({ progress }) => {
  return (
    <LinearProgress
      variant='determinate'
      value={progress}
      color={getColor(progress)}
      sx={{
        height: '8px',
        transition: 'all 0.3s ease'
      }}
    />
  )
}

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
      console.log('user answer payload: ', userAnswer)
      console.log('Score updated successfully')
    } else {
      console.log('Error while updating score: ', res.message)
    }
  } catch (error) {
    console.log('Error while updating score: ', error.message)
  }
}

export default function PlayGameQuiz({ quiz, questions, game, onGameEnd }) {
  const { data: session } = useSession()
  // console.log('game data :  ', game)
  const router = useRouter()
  const storageKey = `game-${game._id}-quiz-${quiz._id}-state`
  // Inside PlayGameQuiz

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [usedHints, setUsedHints] = useState({})
  const [skippedQuestions, setSkippedQuestions] = useState([])
  const [gameEnded, setGameEnded] = useState(false)
  const [remainingTime, setRemainingTime] = useState(0)

  // const performanceRef = useRef({
  //   questionStartTimes: {}
  // })
  const questionTimerInitializedRef = useRef(false)

  const [questionTimeLeft, setQuestionTimeLeft] = useState(0)
  const [lastAnswerTimes, setLastAnswerTimes] = useState({})

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

  // Track when a question is first displayed with high prercession
  // useEffect(() => {
  //   const currentQuestionId = mappedQuestions[currentQuestionIndex]?._id
  //   if (currentQuestionId && !performanceRef.current.questionStartTimes[currentQuestionId]) {
  //     const now = new Date()
  //     performanceRef.current.questionStartTimes[currentQuestionId] = now
  //   }
  // }, [currentQuestionIndex])

  const calculateRemainingTime = () => {
    const now = new Date()
    const elapsed = Math.floor((now - startTime) / 1000)
    return Math.max(duration - elapsed, 0)
  }

  useEffect(() => {
    const initialRemaining = calculateRemainingTime()
    setRemainingTime(initialRemaining)

    const timerInterval = setInterval(() => {
      const newRemaining = calculateRemainingTime()
      setRemainingTime(newRemaining)

      // if (newRemaining <= 0 && !gameEnded) {
      //   clearInterval(timerInterval)
      //   handleGameEnd()
      // }
    }, 1000)

    return () => clearInterval(timerInterval)
  }, [game?.startTime, duration])

  // When question changes, set timer from question.data.timer
  useEffect(() => {
    const currentQuestion = mappedQuestions[currentQuestionIndex]
    if (!currentQuestion) return
    const questionExpiresAt = currentQuestion?.data?.expiresAt
    const now = new Date()
    const timerRemaining = Math.floor((questionExpiresAt - now) / 1000)
    setQuestionTimeLeft(timerRemaining)
    questionTimerInitializedRef.current = false
  }, [currentQuestionIndex])

  // New useEffect to handle timer countdown and auto-submit
  useEffect(() => {
    if (questionTimeLeft <= 0) return
    const interval = setInterval(() => {
      setQuestionTimeLeft(prev => {
        if (!questionTimerInitializedRef.current) {
          questionTimerInitializedRef.current = true
        }
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [questionTimeLeft])

  // New useEffect to handle auto-submit when timer hits 0
  useEffect(() => {
    if (questionTimeLeft === 0 && questionTimerInitializedRef.current) {
      questionTimerInitializedRef.current = false
      handleAutoSubmit()
    }
  }, [
    questionTimeLeft,
    selectedAnswers,
    usedHints,
    currentQuestionIndex,
    lastAnswerTimes,
    questionTimerInitializedRef.current
  ])

  const currentQuestion = mappedQuestions[currentQuestionIndex]

  // Track last answer time (ms from question start)
  function handleAnswerSelect(questionId, optionId) {
    console.log('Selected options', optionId, 'for question', questionId)

    const newAnswers = { ...selectedAnswers, [questionId]: optionId }

    setSelectedAnswers(newAnswers)
    setLastAnswerTimes(prev => ({ ...prev, [questionId]: new Date() }))
    const updatedSkippedQuestions = skippedQuestions.filter(q => q.index !== currentQuestionIndex)
    setSkippedQuestions(updatedSkippedQuestions)
  }

  function handleAnswerFillInBlanks(questionId, value) {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: value }))
    setLastAnswerTimes(prev => ({ ...prev, [questionId]: new Date() }))
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
    // Hit backend endpoint
    await calculateAndUpdateUserScore({ finish: true })
  }

  async function handleNext() {
    if (currentQuestionIndex < mappedQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)

      // Calculate Score for This question & Update Score of User in DB
      await calculateAndUpdateUserScore({ finish: false })
    } else {
      // Final Question - Finish Quiz
      handleGameEnd()
    }
  }

  // On timer expiry, auto-submit answer and go to next question
  async function handleAutoSubmit() {
    if (currentQuestionIndex < mappedQuestions.length - 1) {
      await calculateAndUpdateUserScore({ finish: false, auto: true })
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      await handleGameEnd()
    }
  }

  // Update calculateAndUpdateUserScore to use latest state directly
  async function calculateAndUpdateUserScore({ finish }) {
    const currentQuestion = mappedQuestions[currentQuestionIndex]
    const curQuestionTimerSeconds = currentQuestion?.data?.timerSeconds || 0
    const curQuestionExpiresAt = currentQuestion?.data?.expiresAt
    const selectedAnswer = selectedAnswers[currentQuestion._id]
    const questionStart = new Date(curQuestionExpiresAt - curQuestionTimerSeconds * 1000)
    const lastAnswerTime = lastAnswerTimes[currentQuestion._id]
    const answerTime = lastAnswerTime && questionStart ? lastAnswerTime - questionStart : null // ms from question start to last answer change
    const answeredAt = lastAnswerTimes[currentQuestion._id] || null
    const hintUsed = usedHints[currentQuestion._id] || false

    if (!selectedAnswer) {
      // !selectedAnswer means Question was Skipped (Not answered)
      await updateUserScore(game._id, {
        userAnswer: {
          question: currentQuestion._id,
          marks: 0,
          hintMarks: hintUsed ? currentQuestion?.data?.hintMarks : 0,
          hintUsed,
          skipped: true,
          answerTime: curQuestionTimerSeconds,
          fffPoints: 0,
          answeredAt: curQuestionExpiresAt || new Date().toISOString()
        },
        user: { id: session.user.id, email: session.user.email },
        finish: finish
      })
      return
    }

    // Calculate marks for current question
    const calculatedMarks = calculateQuestionMarks(currentQuestion, selectedAnswer, hintUsed)

    const maxFFF = 1000 // 1000 for more granularity
    const fffPoints =
      calculatedMarks > 0
        ? maxFFF *
          (1 - answerTime / (curQuestionTimerSeconds * 1000)) *
          (calculatedMarks / currentQuestion?.data?.marks)
        : 0

    // EndPoint
    try {
      await updateUserScore(game._id, {
        userAnswer: {
          question: currentQuestion._id,
          answer: selectedAnswer,
          marks: calculatedMarks, // marks user got
          hintMarks: hintUsed ? currentQuestion?.data?.hintMarks : 0,
          hintUsed,
          skipped: false,
          answerTime: answerTime,
          fffPoints,
          answeredAt: answeredAt
        },
        user: { id: session.user.id, email: session.user.email },
        finish: finish
      })
    } catch (error) {
      console.log('Error updating user answer & score: ', error)
    }
  }

  const handleExit = () => {
    router.push('/public-games') // Or your exit path
  }

  // Restore saved state and sync with live game state
  useEffect(() => {
    const now = new Date()
    const liveQuestionIndex = mappedQuestions.findIndex(q => q.data.expiresAt >= now)

    if (liveQuestionIndex !== -1) {
      setCurrentQuestionIndex(liveQuestionIndex)
      const savedState = JSON.parse(localStorage.getItem(storageKey))
      if (savedState && savedState.currentQuestionIndex === liveQuestionIndex) {
        setSelectedAnswers(savedState?.selectedAnswers || {})
        setUsedHints(savedState?.usedHints || {})
        setSkippedQuestions(savedState?.skippedQuestions || [])
      }
    } else if (liveQuestionIndex >= mappedQuestions.length) {
      // If no question is active, the game might have ended
      setGameEnded(true)
    }
  }, [mappedQuestions, quiz._id, storageKey])

  // Persist state
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

  const isAnswerSelected = Array.isArray(selectedAnswers[currentQuestion?._id])
    ? selectedAnswers[currentQuestion?._id].length > 0
    : !!selectedAnswers[currentQuestion?._id]
  const hasHint = !!currentQuestion?.data?.hint
  const hintUsed = !!usedHints[currentQuestion?._id]
  const isSkippable = currentQuestion?.data?.skippable

  const isUserCompletedGame = game.participatedUsers.find(pu => pu.email === session.user.email)?.completed || false
  const isGameEnded = new Date() > new Date(new Date(game.startTime).getTime() + game.duration * 1000)

  if (gameEnded || isGameEnded || isUserCompletedGame) {
    return <GameEnded game={game} onExit={handleExit} />
  }

  const progress = (remainingTime / game.duration) * 100

  return (
    <>
      <Box sx={{ mx: 'auto', px: 2, width: { xs: '100%', sm: '100%' }, height: '100%' }}>
        <Paper elevation={0} sx={{ p: 2, my: 4, maxWidth: 'lg', mx: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant='h6' component='div'>
              Time Remaining
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <TimerChip remainingTime={remainingTime} duration={game.duration} />
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
            isSkippable={isSkippable}
            handleSkip={handleSkip}
            timeLeft={questionTimeLeft}
          />
        ) : (
          <Alert severity='error'>No mappedQuestions available for this quiz</Alert>
        )}

        <Leaderboard game={game} duringPlay={true} isAdmin={true} />
      </Box>
    </>
  )
}
