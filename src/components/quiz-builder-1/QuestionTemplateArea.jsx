import { Alert, Box, Typography, useTheme, alpha } from '@mui/material'
import React from 'react'
import DynamicQuestionTemplate from '../quizbuilder/02_QuestionBuilder/DynamicQuestionTemplate'
import QuizIcon from '@mui/icons-material/Quiz'

function QuestionTemplateArea({
  selectedQuestion,
  onSaveQuestion,
  onDeleteQuestion,
  validationErrors = [],
  questionsLength = 0
}) {
  const theme = useTheme()

  return (
    <Box sx={{ height: '100%', overflow: 'auto', p: 1 }}>
      {selectedQuestion && (
        <DynamicQuestionTemplate
          key={selectedQuestion._id}
          id={selectedQuestion.id}
          templateId={selectedQuestion.templateId}
          data={selectedQuestion}
          saveQuestion={onSaveQuestion}
          deleteQuestion={onDeleteQuestion}
          validationErrors={validationErrors}
        />
      )}
      {!selectedQuestion && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            p: 6,
            textAlign: 'center',
            borderRadius: 2,
            bgcolor: questionsLength === 0 
              ? alpha(theme.palette.warning.main, 0.08)
              : alpha(theme.palette.primary.main, 0.05),
            border: '1px dashed',
            borderColor: questionsLength === 0 ? theme.palette.warning.main : theme.palette.primary.main
          }}
        >
          <QuizIcon 
            sx={{ 
              fontSize: 64, 
              color: questionsLength === 0 ? theme.palette.warning.main : theme.palette.primary.main,
              mb: 2,
              opacity: 0.7
            }} 
          />
          <Typography 
            variant='h6' 
            sx={{ 
              color: questionsLength === 0 ? theme.palette.warning.main : theme.palette.primary.main,
              fontWeight: 700,
              mb: 1
            }}
          >
            {questionsLength > 0 ? 'Ready to Build!' : 'Let\'s Get Started!'}
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ maxWidth: '400px' }}>
            {questionsLength > 0 
              ? 'Click "Create New Question" to add a question or select an existing question to edit' 
              : 'Click "Create New Question" button to add your first question'}
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default QuestionTemplateArea
