import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react'
import { Box, Typography, Button, Alert } from '@mui/material'
import SingleChoiceTemplate from '@/components/publicquiz/SingleChoiceTemplate'
import MultipleChoiceTemplate from '@/components/publicquiz/MultipleChoiceTemplate'
import TrueFalseQuizTemplate from '@/components/publicquiz/TrueFalseQuizTemplate'

const QuizQuestion = ({
  currentQuestion,
  currentQuestionIndex,
  questions,
  selectedAnswers,
  handleAnswerSelect,
  handleShowHint,
  hintUsed,
  hasHint,
  isSkippable,
  handleSkip,
  isAnswerSelected,
  handleNext
}) => {

  useEffect(() => {
    // Reset selectedAnswers for the new question if necessary
    //selectedAnswers[currentQuestion._id] = null;
  }, [currentQuestionIndex]);


  return (
    <Box sx={{ mt: 0, maxWidth: '600px', mx: 'auto' }}>
      <Box mb={2}>
        {/* Dynamically render the correct template based on the question type */}
        {currentQuestion?.templateId === 'single-choice' && (
          <SingleChoiceTemplate key={currentQuestion.id || currentQuestionIndex}
            question={currentQuestion}
            selectedAnswer={selectedAnswers[currentQuestion._id] || ''}
            onAnswerSelect={handleAnswerSelect}
          />
        )}
        {currentQuestion?.templateId === 'multiple-choice' && (
          <MultipleChoiceTemplate key={currentQuestion.id || currentQuestionIndex}
            question={currentQuestion}
            selectedAnswers={selectedAnswers[currentQuestion._id] || []}
            onAnswerSelect={handleAnswerSelect}
          />
        )}
        {currentQuestion?.templateId === 'true-or-false' && (
          <TrueFalseQuizTemplate key={currentQuestion.id || currentQuestionIndex}
            question={currentQuestion}
            selectedAnswer={selectedAnswers[currentQuestion._id] || ''}
            onAnswerSelect={handleAnswerSelect}
          />
        )}
      </Box>

      {/* Hint section
      {hasHint && !hintUsed && (
        <Button variant='outlined' onClick={() => handleShowHint(currentQuestion._id)}>
          Show Hint
        </Button>
      )}
      {hintUsed && (
        <Alert severity='info' icon={false} sx={{ mt: 2 }}>
          Hint: {currentQuestion.data.hint}
        </Alert>
      )} */}

      {/* Bottom action buttons */}
      {/* <Box className='flex justify-end gap-4 items-center w-full' mt={3}>
        {isSkippable && (
          <Button variant='outlined' color='warning' onClick={handleSkip}>
            Skip
          </Button>
        )}


      </Box> */}
    </Box>
  )
}

export default QuizQuestion
