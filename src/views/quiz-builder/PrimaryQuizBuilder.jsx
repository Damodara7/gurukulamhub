'use client'

import React, { useEffect, useRef, useState } from 'react'
import QuizDetails from '@/components/quiz-builder-1/QuizDetails'
import QuestionBuilderArea from '@/components/quiz-builder-1/QuestionBuilderArea'
import { Box, Button, Snackbar, Alert } from '@mui/material'
import { API_URLS } from '@/configs/apiConfig'
import * as RestApi from '@/utils/restApiUtil'
import { validateQuizQuestions } from './validateQuizQuestions'
import { useRouter } from 'next/navigation'

function PrimaryQuizBuilder({ quiz }) {
  const router = useRouter()
  const builderAreaRef = useRef(null)
  const [errors, setErrors] = useState([])
  const [snackbar, setSnackbar] = useState({ open: false, message: '' })
  const [questionsLength, setQuestionsLength] = useState(0) // Add state for questions length

  function validateQuizQuestionsFunc(questions=null) {
    console.log({questions})
    // If questions are passed, validate only those
    if (questions) {
      const validation = validateQuizQuestions(questions);
      setErrors(validation.errors);
  
      if (!validation.isValid) {
        // Count errors by question for better messaging
        const errorCount = validation.errors.length;
        const questionCount = new Set(validation.errors.map(e => e.questionId)).size;
        
        setSnackbar({
          open: true,
          message: `Found ${errorCount} issue${errorCount > 1 ? 's' : ''} across ${questionCount} question${questionCount > 1 ? 's' : ''}. Please check all highlighted fields.`,
          severity: 'error',
          autoHideDuration: 8000 // Show longer for multiple errors
        });
        
        // Optional: Scroll to first error
        const firstErrorElement = document.querySelector(`[data-question-id="${validation.errors[0].questionId}"]`);
        firstErrorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return validation.isValid;
    }
    
    // Otherwise, use the existing logic to validate all questions from builder area
    if (builderAreaRef.current) {
      const quizQuestions = builderAreaRef.current.getQuizQuestions() || [];
      
      if (quizQuestions && quizQuestions.length > 0) {
        // Validate questions first
        const validation = validateQuizQuestions(quizQuestions);
        setErrors(validation.errors);
  
        if (!validation.isValid) {
          // Count errors by question for better messaging
          const errorCount = validation.errors.length;
          const questionCount = new Set(validation.errors.map(e => e.questionId)).size;
          
          setSnackbar({
            open: true,
            message: `Your quiz has ${errorCount} issue${errorCount > 1 ? 's' : ''} across ${questionCount} question${questionCount > 1 ? 's' : ''}. Please check all highlighted fields.`,
            severity: 'error',
            autoHideDuration: 8000 // Show longer for multiple errors
          });
          
          // Optional: Scroll to first error
          const firstErrorElement = document.querySelector(`[data-question-id="${validation.errors[0].questionId}"]`);
          firstErrorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return validation.isValid;
      } else {
        setSnackbar({
          open: true,
          message: 'Please add at least one question to your quiz',
          severity: 'warning'
        });
        return false;
      }
    }
    return false;
  }

  async function handleSaveQuiz() {
    const isValid = validateQuizQuestionsFunc()
    // No need to Proceed(To save quiz) if the Frontend validation failed
    if(!isValid){
      return
    }

    try {
      const res = await RestApi.put(`${API_URLS.v0.USERS_QUIZ}/${quiz._id || quiz.id}/save`)
      if (res.status === 'success') {
        setSnackbar({
          open: true,
          message: 'Quiz saved successfully!',
          severity: 'success'
        })
        router.push('/myquizzes/view')
      } else if (res.status === 'error') {
        setErrors(res.result?.errors)
        setSnackbar({
          open: true,
          message: `Validation failed with ${validation.errors.length} errors`,
          severity: 'error'
        })
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to save quiz',
        severity: 'error'
      })
    }
  }

  // Add this useEffect to track questions length
  useEffect(() => {
    if (builderAreaRef.current) {
      // Initial check
      setQuestionsLength(builderAreaRef.current.getQuizQuestions()?.length || 0)
      // You might want to add a way to update this when questions change
      // This depends on how your QuestionBuilderArea component works
    }
  }, [builderAreaRef.current]) // Run when ref changes

  return (
    <Box className='flex flex-col gap-2' sx={{ height: '89vh', minHeight: 0 }}>
      <Button
        onClick={handleSaveQuiz}
        className='self-end'
        variant='contained'
        component='label'
        style={{ color: 'white' }}
        disabled={questionsLength === 0 || errors.length > 0}
      >
        Save Quiz
      </Button>

      <Snackbar anchorOrigin={{vertical: 'top', horizontal: 'center'}} style={{zIndex: 10000}} sx={{ top: { xs: 50, sm: 50 } }}  open={snackbar.open} autoHideDuration={8000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>

      <QuizDetails quiz={quiz} />
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <QuestionBuilderArea ref={builderAreaRef} quiz={quiz} setQuestionsLength={setQuestionsLength} validateQuizQuestions={validateQuizQuestionsFunc} validationErrors={errors} />
      </Box>
    </Box>
  )
}

export default PrimaryQuizBuilder
