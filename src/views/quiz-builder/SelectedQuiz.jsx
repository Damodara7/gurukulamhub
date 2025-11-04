'use client'

import React, { useEffect, useState } from 'react'
import { API_URLS } from '@/configs/apiConfig'
import * as RestApi from '@/utils/restApiUtil'
import MainQuizQuestionBuilder from '@/components/quizbuilder/02_QuestionBuilder/MainQuizQuestionBuilder'
import QuizDetails from '@/components/quiz-builder-1/QuizDetails'
import { 
  Alert, 
  AlertTitle, 
  Stack, 
  Box, 
  Container, 
  Typography, 
  useTheme,
  alpha,
  CircularProgress
} from '@mui/material'
import LoadingDialog from '@/components/LoadingDialog'
import EditIcon from '@mui/icons-material/Edit'
import QuizIcon from '@mui/icons-material/Quiz'

function SelectedQuiz({ quiz, isAdmin=false }) {
  const [isLoading, setIsLoading] = useState(false)
  const [quizData, setQuizData] = useState(null)
  const theme = useTheme()

  useEffect(() => {
    async function getQuizData() {
      setIsLoading(true)
      console.log('Fetching Selected Quiz Data now...')
      const result = await RestApi.get(`${API_URLS.v0.USERS_QUIZ}/${quiz._id}`)
      if (result?.status === 'success') {
        console.log('Quizzes Fetched result', result)
        setQuizData(result?.result)
      } else {
        // toast.error('Error:' + result?.message)
        console.log('Error:' + result?.message)
        console.log('Error Fetching quizes:', result)
      }
      setIsLoading(false)
    }

    getQuizData()
  }, [])

  if (isLoading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        bgcolor: '#f8f9fa', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress size={48} />
          <Typography variant="body1" color="text.secondary" fontWeight={500}>
            Loading quiz data...
          </Typography>
        </Stack>
      </Box>
    )
  }

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
          <Stack spacing={2}>
            {/* Title */}
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{
                fontSize: { xs: '1.5rem', md: '2rem' },
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              <EditIcon sx={{ fontSize: { xs: 28, md: 36 }, color: 'primary.main' }} />
              Quiz Builder
            </Typography>
            
            <Typography variant="body1" sx={{ color: '#5f6368', maxWidth: '800px' }}>
              Build and manage your quiz questions. Add primary questions and their translations.
            </Typography>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="xl">
        <Stack spacing={4}>
          {/* Quiz Details Card */}
          <Box
            sx={{
              bgcolor: 'white',
              borderRadius: 2,
              border: '1px solid #e8eaed',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                p: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                borderBottom: '2px solid',
                borderColor: 'primary.main'
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1.5,
                    bgcolor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <QuizIcon sx={{ fontSize: 22 }} />
                </Box>
                <Typography variant="h6" fontWeight={700} sx={{ color: 'text.primary' }}>
                  Quiz Information
                </Typography>
              </Stack>
            </Box>
            <Box sx={{ p: 0 }}>
              <QuizDetails quiz={quiz} />
            </Box>
          </Box>

          {/* Question Builder Section */}
          <Box
            sx={{
              bgcolor: 'white',
              borderRadius: 2,
              border: '1px solid #e8eaed',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                p: 2,
                bgcolor: alpha(theme.palette.secondary.main, 0.05),
                borderBottom: '2px solid',
                borderColor: 'secondary.main'
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box
                  sx={{
                    width: 4,
                    height: 24,
                    bgcolor: 'secondary.main',
                    borderRadius: 2
                  }}
                />
                <Typography variant="h6" fontWeight={700} sx={{ color: 'secondary.main' }}>
                  Question Builder
                </Typography>
              </Stack>
            </Box>
            <Box sx={{ p: 0 }}>
              <MainQuizQuestionBuilder data={quiz} isAdmin={isAdmin}/>
            </Box>
          </Box>
        </Stack>
      </Container>
    </Box>
  )
}

export default SelectedQuiz
