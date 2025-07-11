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
        <Alert icon={false} severity={questionsLength === 0 ? 'warning' : 'info'}>
          {questionsLength > 0 ? `Create New Question or Edit Question` : `Create New Question`}
        </Alert>
      )}
    </Box>
  )
}

export default QuestionTemplateArea
