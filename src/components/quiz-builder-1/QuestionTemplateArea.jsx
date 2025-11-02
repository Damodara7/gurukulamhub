import { Alert, Box, Typography } from '@mui/material'
import React from 'react'
import DynamicQuestionTemplate from '../quizbuilder/02_QuestionBuilder/DynamicQuestionTemplate'

function QuestionTemplateArea({
  selectedQuestion,
  onSaveQuestion,
  onDeleteQuestion,
  validationErrors = [],
  questionsLength = 0
}) {
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
            p: 4,
            textAlign: 'center',
            borderRadius: '12px',
            backgroundColor: questionsLength === 0 ? 'rgba(255, 152, 0, 0.08)' : 'rgba(102, 126, 234, 0.08)',
            border: `2px dashed ${questionsLength === 0 ? '#ff9800' : '#667eea'}`
          }}
        >
          <Typography variant='h6' sx={{ color: questionsLength === 0 ? '#ff9800' : '#667eea', fontWeight: 600, mb: 1 }}>
            {questionsLength > 0 ? '📝 Ready to Build!' : '🎯 Let\'s Get Started!'}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {questionsLength > 0 
              ? 'Click "+ Create New" to add a question or select an existing question to edit' 
              : 'Click "+ Create New" button to add your first question'}
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default QuestionTemplateArea
