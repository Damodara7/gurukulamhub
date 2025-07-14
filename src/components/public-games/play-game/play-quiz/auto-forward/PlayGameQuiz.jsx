'use client'
import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Typography, Alert, CardContent, useTheme, LinearProgress, Chip, Paper, Button } from '@mui/material'
import Loading from '@/components/Loading'
import QuizQuestion from './GameQuizQuestion'
import Timer, { formatTime } from '@/components/Timer'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { toast } from 'react-toastify'
import GameEnded from '../../GameEnded'
import { AccessTime as TimeIcon } from '@mui/icons-material'
import { useSession } from 'next-auth/react'
import Leaderboard from '../../Leaderboard'

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

export default function PlayGameQuiz({ game: initialGame, onGameEnd }) {
  const { data: session } = useSession()
  // console.log('game data :  ', game)
  const router = useRouter()

  // 1. Local game state and wsRef
  const [game, setGame] = useState(initialGame)
  const wsRef = useRef(null)
  const [, forceUpdate] = useState(0)

  // Inside PlayGameQuiz

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [usedHints, setUsedHints] = useState({})
  const [skippedQuestions, setSkippedQuestions] = useState([])
  const [gameEnded, setGameEnded] = useState(false)
  const [remainingTime, setRemainingTime] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  // const performanceRef = useRef({
  //   questionStartTimes: {}
  // })
  const questionTimerInitializedRef = useRef(false)

  const [questionTimeLeft, setQuestionTimeLeft] = useState(0)
  const [lastAnswerTimes, setLastAnswerTimes] = useState({})

  const duration = game?.duration || 0
  const startTime = useMemo(() => new Date(game?.startTime), [game?.startTime])

  const quiz = game?.quiz
  const questions = game?.questions

   const storageKey = `game-${game._id}-quiz-${quiz._id}-state`

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

  const currentQuestion = mappedQuestions[currentQuestionIndex]
  const hintUsed = !!usedHints[currentQuestion?._id];
  const hasHint = !!currentQuestion?.data?.hint;
  const isSkippable = currentQuestion?.data?.skippable;

  // Derive submitted state from server/player data
  const userEmail = session?.user?.email;
  const player = useMemo(() => game?.participatedUsers?.find(p => p.email === userEmail), [game, userEmail]);
  const isCurrentSubmitted = useMemo(() => {
    if (!player || !currentQuestion) return false;
    return player.answers?.some(ans => ans.question?.toString() === currentQuestion._id?.toString());
  }, [player, currentQuestion]);
  const canSubmit = !isCurrentSubmitted && questionTimeLeft > 0 && !submitting;

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

  async function handleSubmit() {
    if (!currentQuestion || isCurrentSubmitted || submitting) return;
    setSubmitting(true);
    const isLastQuestion = currentQuestionIndex === mappedQuestions.length - 1;
    await calculateAndUpdateUserScore({ finish: isLastQuestion });
    // Fetch latest game data to update player answers/submission state
    try {
      const res = await RestApi.get(`${API_URLS.v0.USERS_GAME}/${game._id}`);
      if (res.status === 'success' && res.result) {
        setGame(res.result);
        forceUpdate(n => n + 1);
      }
    } catch (e) {
      // Optionally handle error
    }
    setSubmitting(false);
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
    } else if (liveQuestionIndex >= mappedQuestions.length) {
      // If no question is active, the game might have ended
      setGameEnded(true)
    }
  }, [mappedQuestions, quiz._id])

  // Timer for question expiry and moving to next question
  useEffect(() => {
    if (!currentQuestion) return;
    const now = new Date();
    const expiresAt = new Date(currentQuestion?.data?.expiresAt);
    const msLeft = expiresAt - now;
    setQuestionTimeLeft(Math.max(Math.floor(msLeft / 1000), 0));

    if (msLeft <= 0) {
      // Move to the next question immediately
      const nextIdx = mappedQuestions.findIndex((q, idx) => idx > currentQuestionIndex && new Date(q.data.expiresAt) > now);
      if (nextIdx !== -1) {
        setCurrentQuestionIndex(nextIdx);
      } else {
        setGameEnded(true);
      }
      return;
    }

    // Timer for current question
    const interval = setInterval(() => {
      const now = new Date();
      const msLeft = expiresAt - now;
      setQuestionTimeLeft(Math.max(Math.floor(msLeft / 1000), 0));
      if (msLeft <= 0) {
        clearInterval(interval);
        // Move to next question immediately
        const nextIdx = mappedQuestions.findIndex((q, idx) => idx > currentQuestionIndex && new Date(q.data.expiresAt) > now);
        if (nextIdx !== -1) {
          setCurrentQuestionIndex(nextIdx);
        } else {
          setGameEnded(true);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [currentQuestionIndex, mappedQuestions]);

  // 2. WebSocket setup for real-time updates
  useEffect(() => {
    const gameId = game?._id
    if (!gameId) return
    const wsUrl =
      typeof window !== 'undefined'
        ? `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/api/ws/games/${gameId}`
        : ''
    if (!wsUrl) return
    wsRef.current = new window.WebSocket(wsUrl)
    wsRef.current.onopen = () => {
      // console.log('[WS] Connected to game details updates')
    }
    wsRef.current.onmessage = event => {
      try {
        const { data, type } = JSON.parse(event.data)
        if (type === 'gameDetails') {
          setGame(data)
          // Check if the current question is now submitted for the user
          const userEmail = session?.user?.email
          const player = data?.participatedUsers?.find(p => p.email === userEmail)
          const currentQuestion = data?.questions?.[currentQuestionIndex]
          const hasSubmitted = player?.answers?.some(ans => ans.question?.toString() === currentQuestion?._id?.toString())
          if (hasSubmitted) setSubmitting(false)
          forceUpdate(n => n + 1)
        }
      } catch (e) {
        // console.error('[WS] Error parsing game details message', e)
      }
    }
    wsRef.current.onerror = err => {
      // console.error('[WS] game details error', err)
    }
    wsRef.current.onclose = () => {
      // console.log('[WS] game details connection closed')
    }
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [game?._id])

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
            handleAnswerFillInBlanks={isCurrentSubmitted ? undefined : handleAnswerFillInBlanks}
            handleAnswerSelect={isCurrentSubmitted ? undefined : handleAnswerSelect}
            handleShowHint={isCurrentSubmitted ? undefined : handleShowHint}
            hintUsed={hintUsed}
            hasHint={hasHint}
            isSkippable={isSkippable}
            handleSkip={isCurrentSubmitted ? undefined : handleSkip}
            timeLeft={questionTimeLeft}
            disabled={isCurrentSubmitted}
          />
        ) : (
          <Alert severity='error'>No mappedQuestions available for this quiz</Alert>
        )}

        {/* Submit button and waiting message */}
        {currentQuestion && (
          <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Button
              onClick={handleSubmit}
              disabled={
                submitting ||
                isCurrentSubmitted ||
                !selectedAnswers[currentQuestion._id] ||
                !canSubmit
              }
              color={
                submitting
                  ? 'secondary'
                  : isCurrentSubmitted
                  ? 'success'
                  : 'primary'
              }
              component='label'
              variant='contained'
              mb={4}
              style={{
                color: '#fff',
                cursor:
                  submitting ||
                  isCurrentSubmitted ||
                  !selectedAnswers[currentQuestion._id] ||
                  !canSubmit
                    ? 'not-allowed'
                    : 'pointer'
              }}
            >
              {submitting
                ? 'Submitting...'
                : isCurrentSubmitted
                ? 'Submitted'
                : 'Submit'}
            </Button>
          </Box>
        )}
        {currentQuestion && isCurrentSubmitted && (
          <Box sx={{ mt: 2, textAlign: 'center', color: '#1976d2', fontWeight: 500 }}>
            Submitted! Waiting for next question...
          </Box>
        )}
        {currentQuestion && !isCurrentSubmitted && questionTimeLeft === 0 && (
          <Box sx={{ mt: 2, textAlign: 'center', color: '#1976d2', fontWeight: 500 }}>
            Time is up!
          </Box>
        )}

        <Leaderboard game={game} duringPlay={true} isAdmin={true} />
      </Box>
    </>
  )
}
