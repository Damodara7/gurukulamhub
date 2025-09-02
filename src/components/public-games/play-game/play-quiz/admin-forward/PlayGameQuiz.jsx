import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Typography, Alert, Paper, Chip, LinearProgress, Button, Card, CardContent } from '@mui/material'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import GameEnded from '../../GameEnded'
import { useSession } from 'next-auth/react'
import { formatTime } from '@/components/Timer'
import AdminForwardGameQuizQuestion from './GameQuizQuestion'
import Leaderboard from '../../Leaderboard'

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

// Utility to check if the answer is empty for the current question type
function isAnswerEmpty(question, answer) {
  if (!answer) return true
  if (question?.templateId === 'multiple-choice') {
    return !Array.isArray(answer) || answer.length === 0
  }
  if (question?.templateId === 'fill-in-blank') {
    if (Array.isArray(answer)) {
      return answer.length === 0 || answer.every(a => !a.content || a.content.trim() === '')
    }
    if (typeof answer === 'object' && answer !== null) {
      return Object.values(answer).every(val => !val || val.trim() === '')
    }
  }
  // For single-choice, true/false, treat empty string or undefined as empty
  return answer === '' || answer === undefined || answer === null
}

export default function AdminForwardPlayGame({ game: initialGame }) {
  const { data: session } = useSession()
  const router = useRouter()

  // Place mappedQuestions and currentQuestion at the top
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const selectedAnswersRef = useRef({})
  const usedHintsRef = useRef({})
  const lastAnswerTimesRef = useRef({})
  // To force re-render when refs change
  const [, forceUpdate] = useState(0)
  const [gameEnded, setGameEnded] = useState(false)
  const [game, setGame] = useState(initialGame)
  const wsRef = useRef(null)
  const prevLiveIndexRef = useRef(game?.liveQuestionIndex ?? 0)
  const submittedQuestionsRef = useRef(new Set())
  const questionStartTimesRef = useRef({})
  const [submitting, setSubmitting] = useState(false)
  const [selectedAnswersVersion, setSelectedAnswersVersion] = useState(0)

  // These must come after questions and startTime are available
  const startTime = useMemo(() => new Date(game?.startTime), [game?.startTime])
  const questions = game?.questions
  const mappedQuestions = useMemo(() => {
    return (
      questions?.map(q => {
        return {
          ...q,
          data: {
            ...q.data
            // expiredAt: q?.expiredAt
          }
        }
      }) || []
    )
  }, [questions, startTime])
  const currentQuestion = mappedQuestions[currentQuestionIndex]

  // Now, all hooks and code that use currentQuestion can safely reference it
  // Helper: Check if user has submitted for the current live question
  const userEmail = session?.user?.email
  const player = useMemo(() => {
    // Find the player object for the current user
    return game?.participatedUsers?.find(p => p.email === userEmail)
  }, [game, userEmail])

  const hasSubmittedCurrent = useMemo(() => {
    if (!player || !currentQuestion) return false
    return player?.answers?.some(ans => ans.question?.toString() === currentQuestion._id?.toString())
  }, [player, currentQuestion])

  // Find the submitted answer for the current question (if any)
  const submittedAnswer = useMemo(() => {
    if (!player || !currentQuestion) return null
    return player.answers?.find(ans => ans.question?.toString() === currentQuestion._id?.toString()) || null
  }, [player, currentQuestion])

  // Compute selectedAnswers to show: use submitted answer if available, else local
  const effectiveSelectedAnswers = useMemo(() => {
    if (!currentQuestion) return {}
    if (hasSubmittedCurrent && submittedAnswer) {
      return { ...selectedAnswersRef.current, [currentQuestion._id]: submittedAnswer.answer }
    }
    return selectedAnswersRef.current
  }, [hasSubmittedCurrent, submittedAnswer, currentQuestion, selectedAnswersVersion])

  // Determine if hint was used (either in-progress or in submitted answer)
  const effectiveHintUsed = hasSubmittedCurrent
    ? submittedAnswer?.hintUsed || false
    : usedHintsRef.current[currentQuestion?._id] || false
  const effectiveHasHint = !!currentQuestion?.data?.hint

  const gameId = game?._id
  const quiz = game?.quiz
  // const storageKey = `game-${game._id}-quiz-${quiz._id}-admin-state`

  // Ensure the start time for the first question is set to game.startTime
  useEffect(() => {
    if (game?.startTime) {
      questionStartTimesRef.current[0] = new Date(game?.startTime)
    }
  }, [game?.startTime])

  useEffect(() => {
    if (gameId) {
      const wsUrl =
        typeof window !== undefined
          ? `${window.location.protocol === 'https' ? 'wss' : 'ws'}://${window.location.host}/api/ws/games/${gameId}`
          : ''

      if (wsUrl) {
        wsRef.current = new WebSocket(wsUrl)
        if (!wsRef.current) return

        wsRef.current.onopen = () => {
          console.log('[WS] Connected to game details updates')
        }

        wsRef.current.onmessage = event => {
          try {
            const { data, type } = JSON.parse(event.data)
            if (type === 'gameDetails') {
              setGame(data)
              const userEmail = session?.user?.email
              const player = data?.participatedUsers?.find(p => p.email === userEmail)
              const currentQuestion = data?.questions?.[currentQuestionIndex]
              const hasSubmitted = player?.answers?.some(
                ans => ans.question?.toString() === currentQuestion?._id?.toString()
              )
              if (hasSubmitted) setSubmitting(false)
              const liveIdx = data?.liveQuestionIndex
              const prevLiveIdx = prevLiveIndexRef.current
              const totalQuestions = mappedQuestions.length

              // If liveIdx increased, just update the current question index (no auto submission)
              if (typeof liveIdx === 'number' && liveIdx !== prevLiveIdx && liveIdx > 0 && liveIdx < totalQuestions) {
                // Record the start time for the new question
                if (!(liveIdx in questionStartTimesRef.current)) {
                  questionStartTimesRef.current[liveIdx] = data?.liveQuestionStartedAt || new Date()
                }
                setCurrentQuestionIndex(liveIdx)
              }

              // If game completed, just set gameEnded (no auto submission)
              if (data?.status === 'completed') {
                setGameEnded(true)
              }

              prevLiveIndexRef.current = liveIdx
            }
          } catch (e) {
            console.error('[WS] Error parsing game details message', e)
          }
        }
        wsRef.current.onerror = err => {
          console.error('[WS] game details error', err)
        }
        wsRef.current.onclose = () => {
          console.log('[WS] game details connection closed')
        }
      }
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [gameId])

  useEffect(() => {
    setCurrentQuestionIndex(game?.liveQuestionIndex)
    if (game?.liveQuestionIndex > 0) {
      questionStartTimesRef.current[game?.liveQuestionIndex] = new Date(game?.liveQuestionStartedAt)
    }
  }, [game?.liveQuestionIndex])

  function handleAnswerSelect(questionId, optionId) {
    selectedAnswersRef.current = { ...selectedAnswersRef.current, [questionId]: optionId }
    lastAnswerTimesRef.current = { ...lastAnswerTimesRef.current, [questionId]: new Date() }
    setSelectedAnswersVersion(v => v + 1)
    forceUpdate(n => n + 1)
  }

  function handleAnswerFillInBlanks(questionId, value) {
    selectedAnswersRef.current = { ...selectedAnswersRef.current, [questionId]: value }
    lastAnswerTimesRef.current = { ...lastAnswerTimesRef.current, [questionId]: new Date() }
    setSelectedAnswersVersion(v => v + 1)
    forceUpdate(n => n + 1)
  }

  const handleShowHint = questionId => {
    usedHintsRef.current = { ...usedHintsRef.current, [questionId]: true }
    forceUpdate(n => n + 1)
  }

  async function calculateAndUpdateUserScore({ finish, index, liveQuestionStartedAt }) {
    const idx = typeof index === 'number' ? index : currentQuestionIndex
    const currentQuestion = mappedQuestions[idx]
    // Use the tracked question start time if available
    const questionStart = questionStartTimesRef.current[idx] || new Date()
    const lastAnswerTime = lastAnswerTimesRef.current[currentQuestion._id]
    const answerTime = lastAnswerTime && questionStart ? lastAnswerTime - questionStart : null
    const answeredAt = lastAnswerTimesRef.current[currentQuestion._id] || null
    const selectedAnswer = selectedAnswersRef.current[currentQuestion._id]
    const hintUsed = usedHintsRef.current[currentQuestion._id] || false

    const calculatedMarks = calculateQuestionMarks(currentQuestion, selectedAnswer, hintUsed)
    const curQuestionTimerSeconds = new Date(liveQuestionStartedAt).getTime() - new Date(questionStart).getTime() || 0

    console.log('answerTime:', answerTime)
    console.log('questionStart:', questionStart)
    console.log('liveQuestionStartedAt:', liveQuestionStartedAt)
    console.log('curQuestionTimerSeconds:', curQuestionTimerSeconds)

    // const maxScore = game?.maxScore || mappedQuestions?.reduce((acc, q) => acc + q?.data?.marks, 0)

    const maxFFF = 1000
    const fffPoints = calculatedMarks > 0 ? maxFFF * (calculatedMarks / Number(currentQuestion?.data?.marks)) : 0
    try {
      await updateUserScore(game?._id, {
        user: { id: session.user.id, email: session.user.email },
        userAnswer: {
          question: currentQuestion._id,
          answer: selectedAnswer || '',
          marks: calculatedMarks || 0,
          hintMarks: hintUsed ? currentQuestion?.data?.hintMarks : 0,
          hintUsed,
          skipped: !selectedAnswer,
          answerTime: answerTime,
          fffPoints,
          answeredAt: answeredAt
        },
        finish: finish
      })
    } catch (error) {
      console.error('Error updating user score: ', error)
    }
  }

  async function handleSubmit() {
    if (!currentQuestion || hasSubmittedCurrent || submitting) return
    setSubmitting(true)
    const idx = currentQuestionIndex
    const questionStart = questionStartTimesRef.current[idx] || new Date()
    const now = new Date()
    const answerTime = now - questionStart
    const selectedAnswer = selectedAnswersRef.current[currentQuestion._id]
    const hintUsed = usedHintsRef.current[currentQuestion._id] || false
    const calculatedMarks = calculateQuestionMarks(currentQuestion, selectedAnswer, hintUsed)
    // Use a fallback for curQuestionTimerSeconds if not available
    const curQuestionTimerSeconds =
      (game?.liveQuestionStartedAt ? now.getTime() - new Date(game.liveQuestionStartedAt).getTime() : answerTime) ||
      answerTime ||
      1

    console.log('answerTime: ', answerTime)
    console.log('curQuestionTimerSeconds: ', curQuestionTimerSeconds)
    const maxFFF = 1000
    const fffPoints = calculatedMarks > 0 ? maxFFF * (calculatedMarks / Number(currentQuestion?.data?.marks)) : 0
    const isLastQuestion = currentQuestionIndex === mappedQuestions.length - 1
    try {
      await updateUserScore(game?._id, {
        user: { id: session.user.id, email: session.user.email },
        userAnswer: {
          question: currentQuestion._id,
          answer: selectedAnswer || '',
          marks: calculatedMarks || 0,
          hintMarks: hintUsed ? currentQuestion?.data?.hintMarks : 0,
          hintUsed,
          skipped: !selectedAnswer,
          answerTime: answerTime,
          fffPoints,
          answeredAt: now
        },
        finish: isLastQuestion
      })
    } catch (error) {
      console.error('Error submitting answer: ', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleExit = () => {
    router.push('/public-games')
  }

  if (!game) {
    return (
      <Box display='flex' flexDirection='column' alignItems='center' bgcolor='#f5f5f5' px={2} py={4} gap={4}>
        <Card sx={{ maxWidth: 500, p: 3, textAlign: 'center' }}>
          <CardContent>
            <Typography variant='h5' gutterBottom>
              {'🎮 Games are Not Available'}
            </Typography>

            <Typography variant='body1' sx={{ mt: 2 }}>
              You can go back to Public games
            </Typography>

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

  if (gameEnded) {
    return <GameEnded game={game} onExit={handleExit} isAdmin={false} />
  }

  return (
    <>
      <Box sx={{ mx: 'auto', px: 2, width: { xs: '100%', sm: '100%' }, height: '100%' }}>
        {mappedQuestions.length > 0 ? (
          <AdminForwardGameQuizQuestion
            currentQuestion={currentQuestion}
            currentQuestionIndex={currentQuestionIndex}
            questions={mappedQuestions}
            selectedAnswers={effectiveSelectedAnswers}
            handleAnswerFillInBlanks={hasSubmittedCurrent ? undefined : handleAnswerFillInBlanks}
            handleAnswerSelect={hasSubmittedCurrent ? undefined : handleAnswerSelect}
            handleShowHint={hasSubmittedCurrent ? undefined : handleShowHint}
            hintUsed={effectiveHintUsed}
            hasHint={effectiveHasHint}
            isSkippable={false}
            handleSkip={null}
            timeLeft={null}
            disabled={hasSubmittedCurrent || submitting}
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
                hasSubmittedCurrent ||
                isAnswerEmpty(currentQuestion, effectiveSelectedAnswers[currentQuestion._id])
              }
              color={submitting ? 'secondary' : hasSubmittedCurrent ? 'success' : 'primary'}
              component='label'
              variant='contained'
              mb={4}
              style={{
                color: '#fff',
                cursor:
                  submitting ||
                  hasSubmittedCurrent ||
                  isAnswerEmpty(currentQuestion, effectiveSelectedAnswers[currentQuestion._id])
                    ? 'not-allowed'
                    : 'pointer'
              }}
            >
              {submitting ? 'Submitting...' : hasSubmittedCurrent ? 'Submitted' : 'Submit'}
            </Button>
          </Box>
        )}
        {currentQuestion && hasSubmittedCurrent && (
          <Box sx={{ mt: 2, textAlign: 'center', color: '#1976d2', fontWeight: 500 }}>
            Please Wait for next question...
          </Box>
        )}

        <Leaderboard game={game} duringPlay={true} isAdmin={true} />
      </Box>
    </>
  )
}
