import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Typography, Alert, Paper, Chip, LinearProgress, Card, CardContent, Button } from '@mui/material'
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

export default function AdminForwardPlayGame({ game: initialGame }) {
  const { data: session } = useSession()
  const router = useRouter()

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

  const gameId = game?._id
  const quiz = game?.quiz
  const questions = game?.questions
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
              const liveIdx = data?.liveQuestionIndex
              const prevLiveIdx = prevLiveIndexRef.current
              const totalQuestions = mappedQuestions.length

              // If liveIdx increased, submit answer for previous question
              if (typeof liveIdx === 'number' && liveIdx !== prevLiveIdx && liveIdx > 0 && liveIdx < totalQuestions) {
                // Record the start time for the new question
                if (!(liveIdx in questionStartTimesRef.current)) {
                  questionStartTimesRef.current[liveIdx] = data?.liveQuestionStartedAt || new Date()
                }
                const prevQIdx = liveIdx - 1
                if (!submittedQuestionsRef.current.has(prevQIdx)) {
                  calculateAndUpdateUserScore({
                    finish: false,
                    index: prevQIdx,
                    liveQuestionStartedAt: data?.liveQuestionStartedAt
                  })
                  submittedQuestionsRef.current.add(prevQIdx)
                }
                setCurrentQuestionIndex(liveIdx)
              }

              // If game completed, submit answer for last question
              if (data?.status === 'completed') {
                const lastQIdx = totalQuestions - 1
                if (!(lastQIdx in questionStartTimesRef.current)) {
                  questionStartTimesRef.current[lastQIdx] = data?.liveQuestionStartedAt || new Date()
                }
                if (!submittedQuestionsRef.current.has(lastQIdx)) {
                  calculateAndUpdateUserScore({
                    finish: true,
                    index: lastQIdx,
                    liveQuestionStartedAt: data?.liveQuestionStartedAt
                  })
                  submittedQuestionsRef.current.add(lastQIdx)
                }
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

  const startTime = useMemo(() => new Date(game?.startTime), [game?.startTime])

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

  function handleAnswerSelect(questionId, optionId) {
    selectedAnswersRef.current = { ...selectedAnswersRef.current, [questionId]: optionId }
    lastAnswerTimesRef.current = { ...lastAnswerTimesRef.current, [questionId]: new Date() }
    forceUpdate(n => n + 1)
  }

  function handleAnswerFillInBlanks(questionId, value) {
    selectedAnswersRef.current = { ...selectedAnswersRef.current, [questionId]: value }
    lastAnswerTimesRef.current = { ...lastAnswerTimesRef.current, [questionId]: new Date() }
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

    const maxFFF = 1000
    const fffPoints =
      calculatedMarks > 0
        ? maxFFF * (1 - answerTime / curQuestionTimerSeconds) * (calculatedMarks / currentQuestion?.data?.marks)
        : 0
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

  const handleExit = () => {
    router.push('/public-games')
  }

  const currentQuestion = mappedQuestions[currentQuestionIndex]
  const hasHint = !!currentQuestion?.data?.hint
  const hintUsed = !!usedHintsRef.current[currentQuestion?._id]

  if (!game) {
    return (
      <Box display='flex' flexDirection='column' alignItems='center' bgcolor='#f5f5f5' px={2} py={4} gap={4}>
        <Card sx={{ maxWidth: 500, p: 3, textAlign: 'center' }}>
          <CardContent>
            <Typography variant='h5' gutterBottom>
              {'🎮 Games areNot Available'}
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
            selectedAnswers={selectedAnswersRef.current}
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

        <Leaderboard game={game} duringPlay={true} isAdmin={true} />
      </Box>
    </>
  )
}
