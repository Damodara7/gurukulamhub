'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Typography, Alert, CardContent, useTheme, LinearProgress, Chip } from '@mui/material'
import Loading from '@/components/Loading'
import QuizQuestion from '@/components/publicquiz/QuizQuestion'
import Timer, { formatTime } from '@/components/Timer'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { toast } from 'react-toastify'
import './PlayGameQuiz'
import GameEnded from '../GameEnded'

const TimerChip = ({ remainingTime, duration }) => {
  const percentage = (remainingTime / duration) * 100
  const getColor = () => {
    if (percentage > 50) return 'success'
    if (percentage > 25) return 'warning'
    return 'error'
  }

  return (
    <Chip
      label={formatTime(remainingTime)}
      color={getColor()}
      sx={{
        fontWeight: 'bold',
        fontSize: '1.2rem',
        padding: '8px 16px',
        borderRadius: '4px',
        transition: 'background-color 0.3s ease'
      }}
    />
  )
}

const ProgressBar = ({ remainingTime, duration }) => {
  const percentage = (remainingTime / duration) * 100

  return (
    <LinearProgress
      variant='determinate'
      value={percentage}
      sx={{
        height: '10px',
        borderRadius: '5px',
        backgroundColor: '#e0e0e0',
        '& .MuiLinearProgress-bar': {
          borderRadius: '5px',
          background: `linear-gradient(90deg, 
              #4CAF50 ${percentage}%, 
              #ffeb3b ${percentage}%, 
              #f44336 100%)`,
          transition: 'all 0.3s ease'
        }
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

  return (
    <Box>
      <Box sx={{ mx: 'auto', p: 3, width: { xs: '100%', sm: '100%' } }}>
        <Box sx={{ mb: 3 }}>
          <ProgressBar remainingTime={remainingTime} duration={duration} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant='body2'>Time Remaining: {formatTime(remainingTime)}</Typography>
            <TimerChip remainingTime={remainingTime} duration={duration} />
          </Box>
        </Box>

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
