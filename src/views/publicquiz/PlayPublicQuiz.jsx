'use client'
import React, { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Box, Button, Card, Typography, Alert, Stack, Chip, Grid, CardContent, useTheme, alpha, Container, Fade } from '@mui/material'
import languageNotations from '@components/quizbuilder/05_Components/languageNotation.en.json'
import Loading from '@/components/Loading'
import QuizQuestion from '@/components/publicquiz/QuizQuestion'
import QuizSummary from '@/components/publicquiz/QuizSummary'
import QuizPosterScreen from '@/components/publicquiz/QuizPosterScreen'
import Timer, { formatTime } from '@/components/Timer'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { toast } from 'react-toastify'
import './publicQuiz.css'
import TranslateIcon from '@mui/icons-material/Translate'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import {
  getAllMatchingFileUrlsFromS3WithUnknownExtension,
  getFileUrlFromS3WithUnknownExtension,
  quizBucketName
} from '@/utils/awsS3Utils'

export const fetchQuestionsByLanguage = async (quizId, languageCode) => {
  console.log({languageCode, quizId})
  const result = await RestApi.get(`${API_URLS.v0.USERS_QUIZ_QUESTION}?quizId=${quizId}&languageCode=${languageCode}`)
  console.log({result})
  return result
}
export const fetchQuizData = async quizId => {
  const result = await RestApi.get(`${API_URLS.v0.USERS_QUIZ}/${quizId}`)
  return result
}

export default function PlayPublicQuiz({ quizId, languageCode = null }) {
  const theme = useTheme()
  // const { quizId } = useParams()
  // const searchParams = useSearchParams()
  const [quiz, setQuiz] = useState(null) // Store quiz data
  const [selectedLanguage, setSelectedLanguage] = useState(languageCode) // Store selected language
  const [startQuiz, setStartQuiz] = useState(false)
  const [questions, setQuestions] = useState([]) // Store all questions for the selected language
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0) // Current question index
  const [selectedAnswers, setSelectedAnswers] = useState({}) // Store selected answers
  const [loading, setLoading] = useState(true)
  const [showSummary, setShowSummary] = useState(false) // Show quiz summary
  const [usedHints, setUsedHints] = useState({})
  const [skippedQuestions, setSkippedQuestions] = useState([])
  const [isTimerActive, setIsTimerActive] = useState(false)
  const [time, setTime] = useState(0) // time in seconds

  // const languageCode = languageCode
  // console.log(languageCode)

  console.log('quiz id: ', quizId)

  // Watch for changes in search params (especially 'languageCode')
  useEffect(() => {
    if (languageCode && languageCode !== selectedLanguage) {
      setTimeout(() => {
        setSelectedLanguage(languageCode)
      }, 0) // Ensure it runs after the current render cycle
    }
  }, [languageCode, selectedLanguage])

  async function getQuizDocUrls(quizUUID) {
    try {
      const fileUrls = await getAllMatchingFileUrlsFromS3WithUnknownExtension({
        // Urls
        bucketName: quizBucketName,
        fileNamePrefix: `${quizUUID}/documents`
      })
      console.log('quiz doc urls: ', fileUrls)
      if (fileUrls) {
        return fileUrls.map(fileUrl => {
          // Use a regex to capture the id from the URL (assuming the pattern is `${quizId}/documents/${id}.fileType`)
          const match = fileUrl.match(/\/documents\/([0-9a-fA-F-]+)\./)

          const id = match ? match[1] : null // If a match is found, extract the id (match[1])

          return {
            id: id, // Use the extracted id or a fallback if not found
            description: `document-${id || 'unknown-id'}`, // Use id in the description
            document: fileUrl // The file URL
          }
        })
      } else {
        console.log('No quiz docs found')
      }
    } catch (error) {
      console.log('Error getting quiz docs: ', error)
    }
  }

  // Fetch quiz data when the component loads
  useEffect(() => {
    async function getQuizData() {
      setLoading(true)
      const result = await fetchQuizData(quizId) // Fetch quiz metadata
      if (result?.status === 'success') {
        // toast.success('Successfully loaded quiz')
        const quizDocs = await getQuizDocUrls(result.result.id) // uuId, not _id
        console.log('Quiz docs: ', quizDocs)

        // Assuming result.result.documents and quizDocs are both arrays of the same length
        const mergeDocuments =
          result.result.documents?.map((doc, index) => {
            // Find corresponding document in quizDocs
            const matchingDoc = quizDocs?.find(quizDoc => quizDoc.id === doc.id) // Assuming they match by index

            return {
              description: doc.description, // Get description from result.result.documents
              document: matchingDoc?.document || null // Get document from quizDocs or fallback to null if not found
            }
          }) || []

        // Now set the combined data in the quiz object
        setQuiz(prevQuiz => ({
          ...result?.result,
          documents: mergeDocuments // Update the documents with merged data
        }))

        // setQuiz(result?.result)
      } else {
        toast.error('Error:' + result?.message)
        console.log('Error Fetching quiz:', result)
      }
      setLoading(false)
    }
    getQuizData()
  }, [quizId])

  let quizLanguages = []
  if (quiz) {
    quizLanguages =
      [
        { ...quiz.language, isPrimaryLanguage: true },
        ...quiz.secondaryLanguages.map(lang => ({ ...lang, isPrimaryLanguage: false }))
      ] || []
  }

  function getLanguageByCode(code) {
    const language = quizLanguages.find(lang => lang.code === code)
    return language
  }

  useEffect(() => {
    if (selectedLanguage) {
      handleLanguageSelect(selectedLanguage)
    }
  }, [selectedLanguage, quiz]) // whenever selected language or quiz changes it should be re-executed

  // Fetch questions based on selected language
  const handleLanguageSelect = async languageCode => {
    await getQuestionsByLanguageCode(languageCode)
    setSelectedLanguage(languageCode)
  }

  async function getQuestionsByLanguageCode(languageCode) {
    setLoading(true)
    // console.log('quiz id...:', quiz?.id)
    // console.log('languageCode:', languageCode)
    const result = await fetchQuestionsByLanguage(quiz?._id, languageCode)
    if (result?.status === 'success') {
      // toast.success(`Questions of quizId=${quiz?.id} of languageCode=${languageCode} fetched successfully.`)
      // console.log('Questions...', result?.result)
      setQuestions(result?.result)
      // setCurrentQuestionIndex(0)
      // setIsTimerActive(true)
    } else {
      toast.error('Error:' + result?.message)
      console.log('Error Fetching questions:', result)
    }
    setLoading(false)
  }

  // Handle answer selection
  const handleAnswerSelect = (questionId, optionId) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionId }))

    // Remove from skipped if answered
    const updatedSkippedQuestions = skippedQuestions.filter(q => q.index !== currentQuestionIndex)
    setSkippedQuestions(updatedSkippedQuestions)
  }

  const handleAnswerFillInBlanks = (questionId, value) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: value // Update the specific part's answer
    }))
  }

  // Handle hint view
  const handleShowHint = questionId => {
    setUsedHints(prev => ({ ...prev, [questionId]: true }))
  }

  // Skip the current question
  const handleSkip = () => {
    const currentQuestionId = questions[currentQuestionIndex]?._id

    // Remove selected answer if any, marking the question as unanswered
    if (selectedAnswers[currentQuestionId]) {
      setSelectedAnswers(prev => {
        const updatedAnswers = { ...prev }
        delete updatedAnswers[currentQuestionId]
        return updatedAnswers
      })
    }

    // Add question to skippedQuestions array if it hasn't been answered
    setSkippedQuestions(prev => [...prev, { question: questions[currentQuestionIndex], index: currentQuestionIndex }])

    handleNext()
  }

  // Go to the next question or complete the quiz
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      setShowSummary(true)
      setIsTimerActive(false)
    }
  }

  function handleStartQuiz() {
    setIsTimerActive(true)
    setStartQuiz(true)
    setCurrentQuestionIndex(0)
    // console.log('quiz questions: ', questions)
  }

  // Replay quiz
  const handleReplay = () => {
    setShowSummary(false)
    setSelectedAnswers({})
    setCurrentQuestionIndex(0)
    if (languageCode) {
      setSelectedLanguage(languageCode)
    } else {
      setSelectedLanguage(null)
    }
    setUsedHints({})
    setSkippedQuestions([])
    setTime(0)
    setIsTimerActive(false)
    setStartQuiz(false)
  }

  if (loading) {
    return <Loading />
  }

  if (!quiz) {
    return <Alert severity='error'>Quiz not found</Alert>
  }

  const currentQuestion = questions[currentQuestionIndex]
  const isAnswerSelected = Array.isArray(selectedAnswers[currentQuestion?._id])
    ? selectedAnswers[currentQuestion?._id].length > 0
    : !!selectedAnswers[currentQuestion?._id]
  const hasHint = !!currentQuestion?.data?.hint
  const hintUsed = !!usedHints[currentQuestion?._id]
  const isSkippable = currentQuestion?.data?.skippable

  // Display quiz summary
  if (showSummary) {
    return (
      <QuizSummary
        questions={questions}
        selectedAnswers={selectedAnswers}
        usedHints={usedHints}
        handleReplay={handleReplay}
        time={time}
      />
    )
  }

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        background: `radial-gradient(circle at 10% 20%, ${alpha(theme.palette.primary.main, 0.03)} 0%, transparent 50%),
                     radial-gradient(circle at 90% 80%, ${alpha(theme.palette.secondary.main, 0.03)} 0%, transparent 50%),
                     #fafbfc`
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ py: { xs: 3, md: 5 } }}>
          {/* Elegant Header */}
          <Box 
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: { xs: 4, md: 5 },
              gap: 2,
              backdropFilter: 'blur(20px)',
              bgcolor: alpha('#fff', 0.9),
              p: { xs: 2.5, md: 3.5 },
              borderRadius: 4,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
            }}
          >
            {/* Title */}
            <Typography
              sx={{
                fontSize: { xs: '1.5rem', md: '2.25rem' },
                fontWeight: 700,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textAlign: { xs: 'center', md: 'left' },
                flex: 1,
                letterSpacing: '-0.01em'
              }}
            >
              {quiz.title}
            </Typography>

            {/* Timer */}
            {isTimerActive && startQuiz && questions.length > 0 && (
              <Box>
                <Timer time={time} setTime={setTime} isActive={isTimerActive} />
              </Box>
            )}
          </Box>

          {!selectedLanguage ? (
            <Box>
              {/* Language Selection Header */}
              <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ mb: 2 }}>
                  <TranslateIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                  <Typography
                    sx={{
                      fontSize: { xs: '1.75rem', md: '2rem' },
                      fontWeight: 700,
                      color: 'text.primary'
                    }}
                  >
                    Choose Language
                  </Typography>
                </Stack>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
                  Select your preferred language to start
                </Typography>
              </Box>

              {/* Language Cards Grid */}
              <Grid container spacing={3} sx={{ justifyContent: 'center', maxWidth: 800, mx: 'auto' }}>
                {quizLanguages.map((lang, index) => (
                  <Grid item xs={6} sm={4} md={3} key={lang.code}>
                    <Fade in timeout={200 + index * 60}>
                      <Card
                        onClick={() => handleLanguageSelect(lang.code)}
                        sx={{
                          height: 180,
                          cursor: 'pointer',
                          borderRadius: 4,
                          backdropFilter: 'blur(10px)',
                          bgcolor: alpha('#fff', 0.85),
                          border: `2px solid ${alpha(theme.palette.divider, 0.1)}`,
                          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          position: 'relative',
                          overflow: 'hidden',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            opacity: 0,
                            transition: 'opacity 0.3s ease',
                            zIndex: 0
                          },
                          '&:hover': {
                            transform: 'translateY(-6px)',
                            boxShadow: `0 12px 28px ${alpha(theme.palette.primary.main, 0.15)}`,
                            borderColor: 'transparent',
                            '&::before': {
                              opacity: 1
                            },
                            '& .lang-content': {
                              color: 'white',
                              transform: 'scale(1.05)'
                            }
                          }
                        }}
                      >
                        <Stack 
                          className="lang-content"
                          spacing={1.5} 
                          alignItems="center"
                          sx={{ 
                            position: 'relative', 
                            zIndex: 1,
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <Typography
                            variant="h4"
                            sx={{
                              fontSize: '3rem',
                              fontWeight: 700
                            }}
                          >
                            {languageNotations.find(item => item.name === lang.name)?.notation || '🌐'}
                          </Typography>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 600,
                              fontSize: '1rem',
                              textAlign: 'center'
                            }}
                          >
                            {lang.name}
                          </Typography>
                        </Stack>

                        {/* Primary Badge */}
                        {lang.isPrimaryLanguage && (
                          <Chip
                            icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                            label="Primary"
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 10,
                              right: 10,
                              height: 24,
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              backdropFilter: 'blur(10px)',
                              bgcolor: alpha(theme.palette.success.main, 0.15),
                              color: 'success.dark',
                              zIndex: 2,
                              border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
                              '& .MuiChip-icon': {
                                color: 'success.main'
                              }
                            }}
                          />
                        )}
                      </Card>
                    </Fade>
                  </Grid>
                ))}
              </Grid>
            </Box>
        ) : startQuiz ? (
          questions.length > 0 ? (
            <QuizQuestion
              currentQuestion={currentQuestion}
              currentQuestionIndex={currentQuestionIndex}
              questions={questions}
              selectedAnswers={selectedAnswers}
              handleAnswerFillInBlanks={handleAnswerFillInBlanks}
              handleAnswerSelect={handleAnswerSelect}
              handleShowHint={handleShowHint}
              hintUsed={hintUsed}
              hasHint={hasHint}
              isSkippable={isSkippable}
              handleSkip={handleSkip}
              isAnswerSelected={isAnswerSelected}
              handleNext={handleNext}
            />
          ) : (
            <Alert icon={false} severity='error'>
              No questions exist for the selected language.
            </Alert>
          )
        ) : (
          <QuizPosterScreen
            key={selectedLanguage}
            quizLanguages={quizLanguages}
            language={getLanguageByCode(selectedLanguage) || null}
            quizData={quiz}
            onClickStart={handleStartQuiz}
          />
        )}
      </Box>
      </Container>
    </Box>
  )
}
