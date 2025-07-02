import React from 'react'
import { Box, Typography, Button, Alert } from '@mui/material'
import SingleChoiceTemplate from '@/components/publicquiz/SingleChoiceTemplate'
import MultipleChoiceTemplate from '@/components/publicquiz/MultipleChoiceTemplate'
import TrueFalseQuizTemplate from '@/components/publicquiz/TrueFalseQuizTemplate'
import FillInBlanksTemplate from '@/components/publicquiz/FillInBlanksTemplate'

const AdminForwardQuizQuestion = ({
  currentQuestion,
  currentQuestionIndex,
  questions,
  selectedAnswers,
  handleAnswerSelect,
  handleAnswerFillInBlanks,
  handleShowHint,
  hintUsed,
  hasHint,
  isSkippable,
  handleSkip,
  timeLeft,
  isAdmin,
  handleForwardQuestion
}) => {
  return (
    <Box sx={{ mt: 0, maxWidth: 'lg', mx: 'auto' }}>
      <Typography variant='h6' sx={{ marginBottom: 2, color: '#555' }}>
        {`Question ${currentQuestionIndex + 1} / ${questions.length}`}
      </Typography>
      <Box mb={2}>
        <Typography variant='subtitle1' sx={{ color: '#1976d2', mb: 1 }}>
          Time Left: {timeLeft}s
        </Typography>

        {/* Question Content */}
        {currentQuestion?.templateId === 'single-choice' && (
          <SingleChoiceTemplate
            question={currentQuestion}
            selectedAnswer={selectedAnswers[currentQuestion._id] || ''}
            onAnswerSelect={handleAnswerSelect}
          />
        )}

        {currentQuestion?.templateId === 'multiple-choice' && (
          <MultipleChoiceTemplate
            question={currentQuestion}
            selectedAnswers={selectedAnswers[currentQuestion._id] || []}
            onAnswerSelect={handleAnswerSelect}
          />
        )}

        {currentQuestion?.templateId === 'true-or-false' && (
          <TrueFalseQuizTemplate
            question={currentQuestion}
            selectedAnswer={selectedAnswers[currentQuestion._id] || ''}
            onAnswerSelect={handleAnswerSelect}
          />
        )}

        {currentQuestion?.templateId === 'fill-in-blank' && (
          <FillInBlanksTemplate
            question={currentQuestion}
            selectedAnswer={selectedAnswers[currentQuestion._id] || {}}
            onAnswer={handleAnswerFillInBlanks}
          />
        )}
      </Box>

      {/* Hint section */}
      {hasHint && !hintUsed && !isAdmin && (
        <Button variant='outlined' onClick={() => handleShowHint(currentQuestion._id)}>
          Show Hint
        </Button>
      )}

      {hintUsed && (
        <Alert severity='info' icon={false} sx={{ mt: 2 }}>
          Hint: {currentQuestion.data.hint}
        </Alert>
      )}

      {/* Admin Controls */}
      {isAdmin && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: 4,
            gap: 2
          }}
        >
          <Button
            variant='contained'
            color='primary'
            onClick={handleForwardQuestion}
            sx={{
              px: 4,
              py: 1.5,
              fontWeight: 'bold'
            }}
          >
            {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'End Game'}
          </Button>
        </Box>
      )}
    </Box>
  )
}

export default AdminForwardQuizQuestion