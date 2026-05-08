'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Typography, Alert, CardContent, useTheme, LinearProgress, Chip, Paper, alpha } from '@mui/material'
import Loading from '@/components/Loading'
import QuizQuestion from '@/components/publicquiz/QuizQuestion'
import Timer, { formatTime } from '@/components/Timer'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { toast } from 'react-toastify'
import GameEnded from '../GameEnded'
import { AccessTime as TimeIcon } from '@mui/icons-material'
import { useSession } from 'next-auth/react'

const getColor = percentage => {
  if (percentage > 50) return 'primary'
  if (percentage > 25) return 'warning'
  return 'error'
}

const TimerChip = ({ remainingTime, duration }) => {
  const progress = (remainingTime / duration) * 100
  const theme = useTheme()
  const color = getColor(progress)
  const colorValue =
    color === 'primary'
      ? theme.palette.primary.main
      : color === 'warning'
        ? theme.palette.warning.main
        : theme.palette.error.main

  return (
    <Chip
      label={formatTime(remainingTime)}
      color={color}
      variant='filled'
      sx={{
        fontWeight: 700,
        fontSize: { xs: '0.85rem', sm: '0.9rem' },
        fontFamily: 'monospace',
        letterSpacing: '0.05em',
        bgcolor: alpha(colorValue, theme.palette.mode === 'dark' ? 0.25 : 0.15),
        color: colorValue,
        border: `1.5px solid ${alpha(colorValue, 0.4)}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          bgcolor: alpha(colorValue, theme.palette.mode === 'dark' ? 0.3 : 0.2)
        }
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

  // Multiple Choice/True or False
  if (question.templateId === 'single-choice' || question.templateId === 'true-or-false') {
    if (selectedAnswer === correctAnswerIds[0]) {
      gainedMarks += Number(question.data?.marks) || 0
    }
  }

  // Multi Answer
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

export default function PlayGameQuiz({ game }) {
  const { data: session } = useSession()
  const theme = useTheme()
  console.log('game data :  ', game)
  const router = useRouter()
  // Inside PlayGameQuiz

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [usedHints, setUsedHints] = useState({})
  const [skippedQuestions, setSkippedQuestions] = useState([])
  const [gameEnded, setGameEnded] = useState(false)
  const [remainingTime, setRemainingTime] = useState(0)
  const [questionStartTimes, setQuestionStartTimes] = useState({})

  const [questionTimers, setQuestionTimers] = useState({})
  const performanceRef = useRef({
    startTime: null,
    questionStartTimes: {},
    totalTime: 0
  })

  const duration = game?.duration || 0
  const startTime = new Date(game?.startTime)

  const quiz = game?.quiz
  const questions = game?.questions

  const storageKey = `quiz-${quiz?._id}-state`

  // Initialize timing when component mounts
  useEffect(() => {
    performanceRef.current.startTime = performance.now()
    return () => {
      // Cleanup if needed
    }
  }, [])

  // Track when a question is first displayed with high prercession
  useEffect(() => {
    const currentQuestionId = questions[currentQuestionIndex]?._id
    if (currentQuestionId && !performanceRef.current.questionStartTimes[currentQuestionId]) {
      const now = performance.now()
      performanceRef.current.questionStartTimes[currentQuestionId] = now

      setQuestionStartTimes(prev => ({
        ...prev,
        [currentQuestionId]: {
          startTime: now,
          endTime: null,
          duration: null
        }
      }))
    }
  }, [currentQuestionIndex])

  // Calculate answer time with high precision
  const getAnswerTime = questionId => {
    if (!performanceRef.current.questionStartTimes[questionId]) return 0

    const endTime = performance.now()
    const startTime = performanceRef.current.questionStartTimes[questionId]
    return endTime - startTime // in ms
  }

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

      if (newRemaining <= 0) {
        clearInterval(timerInterval)
        handleGameEnd()
      }
    }, 1000)

    return () => clearInterval(timerInterval)
  }, [game?.startTime, duration])

  const handleAnswerSelect = (questionId, optionId) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionId }))
    const updatedSkippedQuestions = skippedQuestions.filter(q => q.index !== currentQuestionIndex)
    setSkippedQuestions(updatedSkippedQuestions)
  }

  const handleAnswerFillInBlanks = (questionId, value) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const handleShowHint = questionId => {
    setUsedHints(prev => ({ ...prev, [questionId]: true }))
  }

  const handleSkip = () => {
    const currentQuestionId = questions[currentQuestionIndex]?._id
    if (selectedAnswers[currentQuestionId]) {
      setSelectedAnswers(prev => {
        const updatedAnswers = { ...prev }
        delete updatedAnswers[currentQuestionId]
        return updatedAnswers
      })
    }
    setSkippedQuestions(prev => [...prev, { question: questions[currentQuestionIndex], index: currentQuestionIndex }])
    handleNext()
  }

  const handleGameEnd = async () => {
    setGameEnded(true)
    localStorage.removeItem(storageKey)
    // Hit backend endpoint
    await calculateAndUpdateUserScore({ finish: true })
  }

  const handleNext = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)

      // Calculate Score for This question & Update Score of User in DB
      await calculateAndUpdateUserScore({ finish: false })
    } else {
      // Final Question - Finish Quiz
      handleGameEnd()
    }
  }

  async function calculateAndUpdateUserScore({ finish }) {
    const currentQuestion = questions[currentQuestionIndex]
    const selectedAnswer = selectedAnswers[currentQuestion._id]
    // const questionStartTime = questionStartTimes[currentQuestion._id]
    // const answerTime = questionStartTime ? Math.floor((new Date() - questionStartTime) / 1000) : 0
    const answerTime = getAnswerTime(currentQuestion._id)

    if (!selectedAnswer) {
      // !selectedAnswer means Question was Skipped (Not answered)
      await updateUserScore(game._id, {
        userAnswer: {
          questionId: currentQuestion._id,
          answer: selectedAnswer,
          marks: 0,
          hintMarks: 0,
          hintUsed: false,
          skipped: true,
          answerTime: answerTime,
          answeredAt: new Date().toISOString() // Use ISO string for precession time
        },
        user: { id: session.user.id, email: session.user.email },
        finish: finish
      })
      return
    }
    const hintUsed = usedHints[currentQuestion._id] || false

    // Calculate marks for current question
    const calculatedMarks = calculateQuestionMarks(currentQuestion, selectedAnswer, hintUsed)

    // EndPoint
    await updateUserScore(game._id, {
      userAnswer: {
        question: currentQuestion._id,
        answer: selectedAnswer,
        marks: calculatedMarks,
        hintMarks: hintUsed ? currentQuestion?.data?.hintMarks : 0,
        hintUsed,
        skipped: false,
        answerTime: answerTime,
        answeredAt: new Date().toISOString() // Use ISO string for precession time
      },
      user: { id: session.user.id, email: session.user.email },
      finish: finish
    })

    // Update the question timer with end time
    if (questionTimers[currentQuestion._id]) {
      const endTime = performance.now()
      setQuestionTimers(prev => ({
        ...prev,
        [currentQuestion._id]: {
          ...prev[currentQuestion._id],
          endTime,
          duration: (endTime - prev[currentQuestion._id].startTime) / 1000
        }
      }))
    }
  }

  const handleExit = () => {
    router.push('/public-games') // Or your exit path
  }

  // Restore saved state
  useEffect(() => {
    const savedState = localStorage.getItem(storageKey)
    if (savedState) {
      const { currentQuestionIndex, selectedAnswers, usedHints, skippedQuestions, time } = JSON.parse(savedState)

      setCurrentQuestionIndex(currentQuestionIndex || 0)
      setSelectedAnswers(selectedAnswers || {})
      setUsedHints(usedHints || {})
      setSkippedQuestions(skippedQuestions || [])
    }
  }, [quiz._id])

  // Persist state
  useEffect(() => {
    const stateToSave = {
      currentQuestionIndex,
      selectedAnswers,
      usedHints,
      skippedQuestions
    }
    localStorage.setItem(storageKey, JSON.stringify(stateToSave))
  }, [currentQuestionIndex, selectedAnswers, usedHints, skippedQuestions])

  const currentQuestion = questions[currentQuestionIndex]
  const isAnswerSelected = Array.isArray(selectedAnswers[currentQuestion?._id])
    ? selectedAnswers[currentQuestion?._id].length > 0
    : !!selectedAnswers[currentQuestion?._id]
  const hasHint = !!currentQuestion?.data?.hint
  const hintUsed = !!usedHints[currentQuestion?._id]
  const isSkippable = currentQuestion?.data?.skippable

  const isUserCompletedGame = game.participatedUsers.find(pu => pu.email === session.user.email)?.completed || false
  const isGameEnded = new Date() > new Date(new Date(game.startTime).getTime() + game.duration * 1000)

  if (gameEnded || isGameEnded || isUserCompletedGame) {
    return (
      <Box sx={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        <GameEnded game={game} onExit={handleExit} />
      </Box>
    )
  }

  const progress = (remainingTime / game.duration) * 100

  return (
    <Box
      sx={{
        mx: 'auto',
        px: 2,
        width: { xs: '100%', sm: '100%' },
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Compact Time Remaining Display */}
      <Box
        sx={{
          maxWidth: 'lg',
          mx: 'auto',
          mt: { xs: 2, sm: 2.5 },
          mb: { xs: 2, sm: 2.5 },
          width: '100%',
          position: 'relative'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: { xs: 1.5, sm: 2 },
            px: { xs: 2, sm: 2.5 },
            py: { xs: 1.25, sm: 1.5 },
            borderRadius: 2,
            bgcolor: theme => alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.12 : 0.08),
            border: theme =>
              `1px solid ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.25 : 0.2)}`,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: theme =>
                `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              transform: `scaleX(${progress / 100})`,
              transformOrigin: 'left',
              transition: 'transform 0.3s ease'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, flex: 1, minWidth: 0 }}>
            <TimeIcon
              sx={{
                fontSize: { xs: 18, sm: 20 },
                color: theme =>
                  getColor(progress) === 'primary'
                    ? theme.palette.primary.main
                    : getColor(progress) === 'warning'
                      ? theme.palette.warning.main
                      : theme.palette.error.main,
                flexShrink: 0
              }}
            />
            <Typography
              variant='body2'
              sx={{
                fontSize: { xs: '0.75rem', sm: '0.8rem' },
                fontWeight: 600,
                color: 'text.secondary',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                whiteSpace: 'nowrap'
              }}
            >
              Time Remaining
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, flexShrink: 0 }}>
            <TimerChip remainingTime={remainingTime} duration={game.duration} />
          </Box>
        </Box>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {questions.length > 0 ? (
          <QuizQuestion
            currentQuestion={currentQuestion}
            currentQuestionIndex={currentQuestionIndex}
            questions={questions}
            selectedAnswers={selectedAnswers}
            handleAnswerFillInBlanks={handleAnswerFillInBlanks}
            handleAnswerSelect={handleAnswerSelect}
            handleShowHint={handleShowHint}
            hintUsed={hintUsed}
            hasHint={hasHint}
            isSkippable={isSkippable}
            handleSkip={handleSkip}
            isAnswerSelected={isAnswerSelected}
            handleNext={handleNext}
          />
        ) : (
          <Alert severity='error'>No questions available for this quiz</Alert>
        )}
      </Box>
    </Box>
  )
}
