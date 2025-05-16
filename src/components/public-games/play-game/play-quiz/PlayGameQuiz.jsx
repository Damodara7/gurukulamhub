'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Typography, Alert, CardContent, useTheme, LinearProgress, Chip, Paper } from '@mui/material'
import Loading from '@/components/Loading'
import QuizQuestion from '@/components/publicquiz/QuizQuestion'
import Timer, { formatTime } from '@/components/Timer'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { toast } from 'react-toastify'
import './PlayGameQuiz'
import GameEnded from '../GameEnded'
import { AccessTime as TimeIcon } from '@mui/icons-material'

const getColor = (percentage) => {
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

export const fetchQuizData = async quizId => {
  const result = await RestApi.get(`${API_URLS.v0.USERS_QUIZ}/${quizId}`)
  return result
}

export default function PlayGameQuiz({ quiz, questions, game }) {
  const router = useRouter()
  const storageKey = `quiz-${quiz._id}-state`

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [usedHints, setUsedHints] = useState({})
  const [skippedQuestions, setSkippedQuestions] = useState([])
  const [gameEnded, setGameEnded] = useState(false)
  const [remainingTime, setRemainingTime] = useState(0)
  const duration = game?.duration || 0
  const startTime = new Date(game?.startTime)
  //   const startTime = new Date(Date.now() + 5 * 60 * 1000)

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

  const handleGameEnd = () => {
    setGameEnded(true)
    localStorage.removeItem(storageKey)
    // Hit backend endpoint
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      // Final Question - Finish Quiz
      handleGameEnd()
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

  if (gameEnded) {
    return <GameEnded game={game} onExit={handleExit} />
  }

  const progress = (remainingTime / game.duration) * 100

  return (
    <>
      <Box sx={{ mx: 'auto', px: 2, width: { xs: '100%', sm: '100%' }, height: '100%' }}>
        <Paper elevation={0} sx={{ p: 2, mb: 4 }}>
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
    </>
  )
}
