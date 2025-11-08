'use client'

import React, { useEffect, useRef, useState } from 'react'
import QuizDetails from '@/components/quiz-builder-1/QuizDetails'
import QuestionBuilderArea from '@/components/quiz-builder-1/QuestionBuilderArea'
import {
  Box,
  Button,
  Snackbar,
  Alert,
  Typography,
  Container,
  Stack,
  useTheme,
  alpha
} from '@mui/material'
import { API_URLS } from '@/configs/apiConfig'
import * as RestApi from '@/utils/restApiUtil'
import { validateQuizQuestions } from './validateQuizQuestions'
import { useRouter } from 'next/navigation'
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined'
import SaveIcon from '@mui/icons-material/Save'

function PrimaryQuizBuilder({ quiz, isAdmin = false }) {
  const router = useRouter()
  const theme = useTheme()
  const builderAreaRef = useRef(null)
  const [errors, setErrors] = useState([])
  const [snackbar, setSnackbar] = useState({ open: false, message: '' })
  const [questionsLength, setQuestionsLength] = useState(0) // Add state for questions length

  function validateQuizQuestionsFunc(questions = null) {
    console.log({ questions })
    // If questions are passed, validate only those
    if (questions) {
      const validation = validateQuizQuestions(questions)
      setErrors(validation.errors)

      if (!validation.isValid) {
        // Count errors by question for better messaging
        const errorCount = validation.errors.length
        const questionCount = new Set(validation.errors.map(e => e.questionId)).size

        setSnackbar({
          open: true,
          message: `Found ${errorCount} issue${errorCount > 1 ? 's' : ''} across ${questionCount} question${
            questionCount > 1 ? 's' : ''
          }. Please check all highlighted fields.`,
          severity: 'error',
          autoHideDuration: 8000 // Show longer for multiple errors
        })

        // Optional: Scroll to first error
        const firstErrorElement = document.querySelector(`[data-question-id="${validation.errors[0].questionId}"]`)
        firstErrorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return validation.isValid
    }

    // Otherwise, use the existing logic to validate all questions from builder area
    if (builderAreaRef.current) {
      const quizQuestions = builderAreaRef.current.getQuizQuestions() || []

      if (quizQuestions && quizQuestions.length > 0) {
        // Validate questions first
        const validation = validateQuizQuestions(quizQuestions)
        setErrors(validation.errors)

        if (!validation.isValid) {
          // Count errors by question for better messaging
          const errorCount = validation.errors.length
          const questionCount = new Set(validation.errors.map(e => e.questionId)).size

          setSnackbar({
            open: true,
            message: `Your quiz has ${errorCount} issue${errorCount > 1 ? 's' : ''} across ${questionCount} question${
              questionCount > 1 ? 's' : ''
            }. Please check all highlighted fields.`,
            severity: 'error',
            autoHideDuration: 8000 // Show longer for multiple errors
          })

          // Optional: Scroll to first error
          const firstErrorElement = document.querySelector(`[data-question-id="${validation.errors[0].questionId}"]`)
          firstErrorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
        return validation.isValid
      } else {
        setSnackbar({
          open: true,
          message: 'Please add at least one question to your quiz',
          severity: 'warning'
        })
        return false
      }
    }
    return false
  }

  async function handleSaveQuiz() {
    const isValid = validateQuizQuestionsFunc()
    // No need to Proceed(To save quiz) if the Frontend validation failed
    if (!isValid) {
      return
    }

    try {
      const res = await RestApi.put(`${API_URLS.v0.USERS_QUIZ}/${quiz._id || quiz.id}/save`, {
        approvalState: isAdmin ? 'approved' : 'saved'
      })
      if (res.status === 'success') {
        setSnackbar({
          open: true,
          message: 'Quiz saved successfully!',
          severity: 'success'
        })
        router.push(`/${isAdmin ? 'management/quizzes' : 'myquizzes'}/view`)
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
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa', pb: 6 }}>
      {/* Header Section */}
      <Box
        sx={{
          bgcolor: 'white',
          pt: { xs: 3, md: 4 },
          pb: { xs: 3, md: 4 },
          borderBottom: '1px solid #e8eaed',
          mb: 4
        }}
      >
        <Container maxWidth="xl">
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            {/* Title */}
            <Stack spacing={1}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1.5,
                    bgcolor: theme.palette.primary.main,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <BuildOutlinedIcon sx={{ fontSize: 22 }} />
                </Box>
                <Typography
                  variant="h4"
                  fontWeight={800}
                  sx={{
                    fontSize: { xs: '1.5rem', md: '2rem' },
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  Build Quiz Questions
                </Typography>
              </Stack>
              <Typography variant="body1" sx={{ color: '#5f6368', fontSize: '0.95rem', ml: 7 }}>
                Create and manage your quiz questions. Add questions and configure their settings.
              </Typography>
            </Stack>

            {/* Save Button */}
            <Button
              onClick={handleSaveQuiz}
              variant='contained'
              component='label'
              disabled={questionsLength === 0 || errors.length > 0}
              startIcon={<SaveIcon />}
              size='large'
              sx={{
                color: 'white'
              }}
            >
              Save Quiz
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="xl">
        <Stack spacing={4}>
          <QuizDetails quiz={quiz} />
          <Box sx={{ minHeight: '600px', height: 'calc(100vh - 400px)' }}>
            <QuestionBuilderArea
              ref={builderAreaRef}
              quiz={quiz}
              setQuestionsLength={setQuestionsLength}
              validateQuizQuestions={validateQuizQuestionsFunc}
              validationErrors={errors}
            />
          </Box>
        </Stack>
      </Container>

      {/* Snackbar */}
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ top: { xs: 70, sm: 70 }, zIndex: 10000 }}
        open={snackbar.open}
        autoHideDuration={8000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{
            borderRadius: 2,
            fontWeight: 500,
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default PrimaryQuizBuilder
