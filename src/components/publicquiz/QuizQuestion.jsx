import React from 'react'
import { Box, Typography, Button, Alert } from '@mui/material'
import SingleChoiceTemplate from './SingleChoiceTemplate'
import MultipleChoiceTemplate from './MultipleChoiceTemplate'
import TrueFalseQuizTemplate from './TrueFalseQuizTemplate'
import FillInBlanksTemplate from './FillInBlanksTemplate'

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
  isAnswerSelected,
  handleNext
}) => {
  return (
    <Box sx={{ mt: 0, maxWidth: 'lg', mx: 'auto' }}>
      <Typography variant='h6' sx={{ marginBottom: 2, color: '#555' }}>
        {`Question ${currentQuestionIndex + 1} / ${questions.length}`}
      </Typography>

      <Box mb={2}>
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

        <Button
          onClick={isAnswerSelected ? handleNext : null}
          disabled={!isAnswerSelected}
          variant='contained'
          component='label'
          color='primary'
          sx={{
            cursor: isAnswerSelected ? 'pointer' : 'not-allowed',
            // backgroundColor: isAnswerSelected ? '#1976d2' : '#ccc',
            color: '#fff',
            '&:hover': {
              // backgroundColor: isAnswerSelected ? '#1565c0' : '#ccc',
              boxShadow: isAnswerSelected ? '0 4px 8px rgba(0, 0, 0, 0.2)' : 'none'
            },
            transition: 'box-shadow 0.3s ease, background-color 0.3s ease'
          }}
        >
          {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next'}
        </Button>
      </Box>
    </Box>
  )
}

export default QuizQuestion
