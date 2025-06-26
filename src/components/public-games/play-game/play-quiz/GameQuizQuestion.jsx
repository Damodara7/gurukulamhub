import React from 'react'
import { Box, Typography, Button, Alert } from '@mui/material'
import SingleChoiceTemplate from '../../../publicquiz/SingleChoiceTemplate'
import MultipleChoiceTemplate from '../../../publicquiz/MultipleChoiceTemplate'
import TrueFalseQuizTemplate from '../../../publicquiz/TrueFalseQuizTemplate'
import FillInBlanksTemplate from '../../../publicquiz/FillInBlanksTemplate'

const QuizQuestion = ({
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
  timer,
  timeLeft
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
        {/* Dynamically render the correct template based on the question type */}
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
      {hasHint && !hintUsed && (
        <Button variant='outlined' onClick={() => handleShowHint(currentQuestion._id)}>
          Show Hint
        </Button>
      )}
      {hintUsed && (
        <Alert severity='info' icon={false} sx={{ mt: 2 }}>
          Hint: {currentQuestion.data.hint}
        </Alert>
      )}
      {/* Bottom action buttons */}
      <Box className='flex justify-end gap-4 items-center w-full' mt={3}>
        {isSkippable && (
          <Button variant='outlined' color='warning' onClick={handleSkip}>
            Skip
          </Button>
        )}
      </Box>
    </Box>
  )
}

export default QuizQuestion
