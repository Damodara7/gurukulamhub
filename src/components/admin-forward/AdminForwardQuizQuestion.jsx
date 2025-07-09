import React from 'react'
import { Box, Typography, Button } from '@mui/material'
import SingleChoiceTemplate from '@/components/publicquiz/SingleChoiceTemplate'
import MultipleChoiceTemplate from '@/components/publicquiz/MultipleChoiceTemplate'
import TrueFalseQuizTemplate from '@/components/publicquiz/TrueFalseQuizTemplate'
import FillInBlanksTemplate from '@/components/publicquiz/FillInBlanksTemplate'
import { Label } from '@mui/icons-material'

const AdminForwardQuizQuestion = ({
  currentQuestion,
  currentQuestionIndex,
  questions,
  isAdmin,
  handleForwardQuestion
}) => {
  return (
    <Box
      sx={{
        mt: 0,
        maxWidth: 'lg',
        mx: 'auto'
      }}
    >
      <Typography
        variant='h6'
        sx={{
          marginBottom: 2,
          color: 'text.primary',
          fontWeight: 'bold'
        }}
      >
        {`Question ${currentQuestionIndex + 1} of ${questions.length}`}
      </Typography>

      <Box mb={4}>
        {/* Question Content - Read Only */}
        {currentQuestion?.templateId === 'single-choice' && (
          <SingleChoiceTemplate question={currentQuestion} readOnly={true} />
        )}

        {currentQuestion?.templateId === 'multiple-choice' && (
          <MultipleChoiceTemplate question={currentQuestion} readOnly={true} />
        )}

        {currentQuestion?.templateId === 'true-or-false' && (
          <TrueFalseQuizTemplate question={currentQuestion} readOnly={true} />
        )}

        {currentQuestion?.templateId === 'fill-in-blank' && (
          <FillInBlanksTemplate question={currentQuestion} readOnly={true} />
        )}
      </Box>

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
            component='label'
            variant='contained'
            color='primary'
            onClick={handleForwardQuestion}
            sx={{
              px: 4,
              py: 1.5,
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1rem'
            }}
            size='small'
          >
            {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Game'}
          </Button>
        </Box>
      )}
    </Box>
  )
}

export default AdminForwardQuizQuestion