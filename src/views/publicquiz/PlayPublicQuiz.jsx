'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Typography,
  Alert,
  Stack,
  Chip,
  Grid,
  Card,
  CardContent,
  Fade,
  Container,
  useTheme,
  useMediaQuery,
  alpha
} from '@mui/material'
import TranslateIcon from '@mui/icons-material/Translate'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

import languageNotations from '@components/quizbuilder/05_Components/languageNotation.en.json'
import Loading from '@/components/Loading'
import QuizQuestion from '@/components/publicquiz/QuizQuestion'
import QuizSummary from '@/components/publicquiz/QuizSummary'
import QuizPosterScreen from '@/components/publicquiz/QuizPosterScreen'
import Timer from '@/components/Timer'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { toast } from 'react-toastify'
import { getAllMatchingFileUrlsFromS3WithUnknownExtension, quizBucketName } from '@/utils/awsS3Utils'

export const fetchQuestionsByLanguage = async (quizId, languageCode) => {
  const result = await RestApi.get(`${API_URLS.v0.USERS_QUIZ_QUESTION}?quizId=${quizId}&languageCode=${languageCode}`)
  return result
}

export const fetchQuizData = async quizId => {
  const result = await RestApi.get(`${API_URLS.v0.USERS_QUIZ}/${quizId}`)
  return result
}

export default function PlayPublicQuiz({ quizId, languageCode = null }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'))
  const isDesktop = useMediaQuery(theme.breakpoints.between('md', 'lg'))
  const isCompactHeader = isMobile
  const isDarkMode = theme.palette.mode === 'dark'
  const [quiz, setQuiz] = useState(null)
  const [selectedLanguage, setSelectedLanguage] = useState(languageCode)
  const [startQuiz, setStartQuiz] = useState(false)
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [showSummary, setShowSummary] = useState(false)
  const [usedHints, setUsedHints] = useState({})
  const [skippedQuestions, setSkippedQuestions] = useState([])
  const [isTimerActive, setIsTimerActive] = useState(false)
  const [time, setTime] = useState(0)

  useEffect(() => {
    if (languageCode && languageCode !== selectedLanguage) {
      setSelectedLanguage(languageCode)
    }
  }, [languageCode, selectedLanguage])

  async function getQuizDocUrls(quizUUID) {
    try {
      const fileUrls = await getAllMatchingFileUrlsFromS3WithUnknownExtension({
        bucketName: quizBucketName,
        fileNamePrefix: `${quizUUID}/documents`
      })
      if (!fileUrls) return []

      return fileUrls.map(fileUrl => {
        const match = fileUrl.match(/\/documents\/([0-9a-fA-F-]+)\./)
        const id = match ? match[1] : null
        return {
          id,
          description: `document-${id || 'unknown'}`,
          document: fileUrl
        }
      })
    } catch (error) {
      console.log('Error getting quiz docs: ', error)
      return []
    }
  }

  useEffect(() => {
    async function getQuizData() {
      setLoading(true)
      const result = await fetchQuizData(quizId)
      if (result?.status === 'success') {
        const quizDocs = await getQuizDocUrls(result.result.id)
        const mergedDocuments =
          result.result.documents?.map(doc => {
            const matchingDoc = quizDocs?.find(quizDoc => quizDoc.id === doc.id)
            return {
              description: doc.description,
              document: matchingDoc?.document || doc.document || null
            }
          }) || []

        setQuiz({
          ...result.result,
          documents: mergedDocuments
        })
      } else {
        toast.error('Error:' + result?.message)
      }
      setLoading(false)
    }

    getQuizData()
  }, [quizId])

  const quizLanguages = quiz
    ? [
        { ...quiz.language, isPrimaryLanguage: true },
        ...(quiz.secondaryLanguages || []).map(lang => ({ ...lang, isPrimaryLanguage: false }))
      ]
    : []

  const overallQuestionCount =
    quiz?.questionCount ??
    quiz?.totalQuestions ??
    quiz?.language?.questionCount ??
    quiz?.questions?.length ??
    quizLanguages.reduce((sum, lang) => sum + (lang?.questionCount || 0), 0) ??
    0

  const getLanguageByCode = code => quizLanguages.find(lang => lang.code === code)

  const selectedLanguageInfo = selectedLanguage ? getLanguageByCode(selectedLanguage) : null
  const currentQuestionCount = selectedLanguage
    ? questions.length || selectedLanguageInfo?.questionCount || overallQuestionCount
    : overallQuestionCount

  const quizImage =
    quiz?.thumbnail ||
    quiz?.thumbnailPoster ||
    quiz?.poster ||
    quiz?.banner ||
    quiz?.image ||
    'https://fakeimg.pl/200x200/?text=Quiz'

  useEffect(() => {
    if (selectedLanguage && quiz) {
      handleLanguageSelect(selectedLanguage)
    }
  }, [selectedLanguage, quiz])

  const handleLanguageSelect = async language => {
    await getQuestionsByLanguageCode(language)
    setSelectedLanguage(language)
  }

  async function getQuestionsByLanguageCode(language) {
    setLoading(true)
    const result = await fetchQuestionsByLanguage(quiz?._id, language)
    if (result?.status === 'success') {
      setQuestions(result?.result)
    } else {
      toast.error('Error:' + result?.message)
    }
    setLoading(false)
  }

  const handleAnswerSelect = (questionId, optionId) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionId }))
    setSkippedQuestions(prev => prev.filter(q => q.index !== currentQuestionIndex))
  }

  const handleAnswerFillInBlanks = (questionId, value) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  const handleShowHint = questionId => {
    setUsedHints(prev => ({ ...prev, [questionId]: true }))
  }

  const handleSkip = () => {
    const currentQuestionId = questions[currentQuestionIndex]?._id
    if (selectedAnswers[currentQuestionId]) {
      setSelectedAnswers(prev => {
        const updated = { ...prev }
        delete updated[currentQuestionId]
        return updated
      })
    }
    setSkippedQuestions(prev => [...prev, { question: questions[currentQuestionIndex], index: currentQuestionIndex }])
    handleNext()
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      setShowSummary(true)
      setIsTimerActive(false)
    }
  }

  const handleStartQuiz = () => {
    setIsTimerActive(true)
    setStartQuiz(true)
    setCurrentQuestionIndex(0)
  }

  const handleReplay = () => {
    setShowSummary(false)
    setSelectedAnswers({})
    setCurrentQuestionIndex(0)
    setSelectedLanguage(languageCode || null)
    setUsedHints({})
    setSkippedQuestions([])
    setTime(0)
    setIsTimerActive(false)
    setStartQuiz(false)
  }

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: isDarkMode ? theme.palette.background.default : '#f8f9fa'
        }}
      >
        <Loading />
      </Box>
    )
  }

  if (!quiz) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: isDarkMode ? theme.palette.background.default : '#f8f9fa',
          px: { xs: 2, sm: 3 }
        }}
      >
        <Alert
          severity='error'
          sx={{
            borderRadius: { xs: 2, sm: 3 },
            boxShadow: isDarkMode
              ? '0 12px 32px rgba(0,0,0,0.3)'
              : '0 12px 32px rgba(15,23,42,0.12)',
            maxWidth: { xs: '100%', sm: 400 }
          }}
        >
          Quiz not found
        </Alert>
      </Box>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const isAnswerSelected = Array.isArray(selectedAnswers[currentQuestion?._id])
    ? selectedAnswers[currentQuestion?._id].length > 0
    : !!selectedAnswers[currentQuestion?._id]
  const hasHint = !!currentQuestion?.data?.hint
  const hintUsed = !!usedHints[currentQuestion?._id]
  const isSkippable = currentQuestion?.data?.skippable

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

  const renderLanguageSelection = () => (
    <Stack spacing={4} alignItems='center'>
      <Stack spacing={2} alignItems='center' textAlign='center'>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: 3,
            bgcolor: alpha(theme.palette.primary.main, 0.15),
            color: theme.palette.primary.dark,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 10px 30px ${alpha(theme.palette.primary.main, 0.2)}`
          }}
        >
          <TranslateIcon sx={{ fontSize: 28 }} />
        </Box>
        <Box>
          <Typography
            variant='h5'
            fontWeight={800}
            sx={{ letterSpacing: '-0.015em', color: theme.palette.text.primary }}
          >
            Choose Your Language
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
            We support multiple languages for this quiz. Pick one to continue.
          </Typography>
        </Box>
        <Stack direction='row' spacing={1} flexWrap='wrap' justifyContent='center'>
          <Chip
            label={`${quizLanguages.length} ${quizLanguages.length === 1 ? 'language' : 'languages'} available`}
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              color: theme.palette.primary.main,
              fontWeight: 600,
              borderRadius: 2
            }}
          />
          <Chip
            label={`${quiz.questionCount || questions.length || 0} questions`}
            sx={{
              bgcolor: alpha(theme.palette.success.main, 0.12),
              color: theme.palette.success.main,
              fontWeight: 600,
              borderRadius: 2
            }}
          />
        </Stack>
      </Stack>

      <Grid container spacing={3} justifyContent='center'>
        {quizLanguages.map((lang, index) => (
          <Grid item xs={12} sm={6} md={4} key={lang.code}>
            <Fade in timeout={220 + index * 90}>
              <Box
                onClick={() => handleLanguageSelect(lang.code)}
                sx={{
                  position: 'relative',
                  borderRadius: { xs: 2.5, md: 3 },
                  border: `1px solid ${alpha(theme.palette.primary.main, isDarkMode ? 0.2 : 0.08)}`,
                  backgroundColor: isDarkMode ? theme.palette.background.paper : theme.palette.common.white,
                  px: { xs: 3, md: 4 },
                  py: { xs: 3, md: 4.2 },
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: { xs: 1.2, md: 1.6 },
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                  overflow: 'hidden',
                  boxShadow: isDarkMode
                    ? '0 8px 18px rgba(0,0,0,0.2)'
                    : '0 8px 18px rgba(15, 23, 42, 0.06)',
                  minHeight: { xs: 175, md: 200 },
                  color: theme.palette.text.primary,
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    background: `radial-gradient(circle at top, ${alpha(theme.palette.primary.light, 0.18)} 0%, transparent 60%)`,
                    opacity: 0,
                    transition: 'opacity 0.2s ease'
                  },
                  '&:hover, &:focus-visible': {
                    transform: 'translateY(-6px)',
                    borderColor: alpha(theme.palette.primary.main, isDarkMode ? 0.5 : 0.35),
                    boxShadow: isDarkMode
                      ? '0 18px 36px rgba(0,0,0,0.3)'
                      : '0 18px 36px rgba(15, 23, 42, 0.12)',
                    '&::before': {
                      opacity: 1
                    },
                    '& .lang-tile__symbol': {
                      borderColor: alpha(theme.palette.primary.main, 0.4),
                      color: theme.palette.primary.main,
                      boxShadow: '0 10px 20px rgba(15, 23, 42, 0.12)'
                    },
                    '& .lang-tile__primary': {
                      bgcolor: alpha(theme.palette.success.main, 0.2),
                      color: theme.palette.success.dark
                    }
                  }
                }}
              >
                <Box
                  className='lang-tile__symbol'
                  sx={{
                    width: { xs: 56, md: 60 },
                    height: { xs: 56, md: 60 },
                    borderRadius: { xs: 2, md: 2.5 },
                    border: `2px solid ${alpha(theme.palette.primary.main, 0.25)}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: { xs: '1.75rem', md: '1.9rem' },
                    fontWeight: 700,
                    color: theme.palette.primary.main,
                    background: alpha(theme.palette.primary.main, 0.05),
                    transition: 'all 0.2s ease',
                    zIndex: 1
                  }}
                >
                  {languageNotations.find(item => item.name === lang.name)?.notation || '🌐'}
                </Box>

                <Stack spacing={0.4} alignItems='center' sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                  <Typography className='lang-tile__name' variant='subtitle1' fontWeight={800} sx={{ fontSize: { xs: '1.05rem', md: '1.1rem' } }}>
                    {lang.name}
                  </Typography>
                  <Typography variant='caption' className='lang-tile__meta' color='text.secondary' sx={{ fontSize: { xs: '0.78rem', md: '0.84rem' } }}>
                    {lang.isPrimaryLanguage ? 'Primary language' : 'Alternate language'}
                  </Typography>
                </Stack>

                {lang.isPrimaryLanguage && (
                  <Chip
                    size='small'
                    label='Primary'
                    className='lang-tile__primary'
                    icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      bgcolor: alpha(theme.palette.success.main, 0.16),
                      color: theme.palette.success.main,
                      fontWeight: 700,
                      borderRadius: 2,
                      zIndex: 1,
                      px: 1.1,
                      transition: 'all 0.2s ease'
                    }}
                  />
                )}
              </Box>
            </Fade>
          </Grid>
        ))}
      </Grid>
    </Stack>
  )

  const renderBody = () => {
    if (!selectedLanguage) return renderLanguageSelection()

    if (!startQuiz) {
      return (
        <QuizPosterScreen
          key={selectedLanguage}
          quizLanguages={quizLanguages}
          language={getLanguageByCode(selectedLanguage) || null}
          quizData={quiz}
          onClickStart={handleStartQuiz}
        />
      )
    }

    if (questions.length === 0) {
      return (
        <Alert
          severity='warning'
          icon={false}
          sx={{
            borderRadius: { xs: 2, sm: 2.5 },
            border: `1px solid ${alpha(theme.palette.warning.main, isDarkMode ? 0.3 : 0.2)}`,
            bgcolor: alpha(theme.palette.warning.main, isDarkMode ? 0.12 : 0.06),
            maxWidth: { xs: '100%', sm: 600 },
            mx: 'auto'
          }}
        >
          No questions exist for the selected language.
        </Alert>
      )
    }

    return (
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
    )
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: isDarkMode ? theme.palette.background.default : '#f8f9fa',
        pb: { xs: 4, md: 6 }
      }}
    >
      <Box
        sx={{
          bgcolor: isDarkMode ? theme.palette.background.paper : 'white',
          pt: { xs: 2, md: 4 },
          pb: { xs: 2.5, md: 4 },
          borderBottom: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.1 : 0.08)}`,
          mb: { xs: 2.5, md: 4 }
        }}
      >
        <Container maxWidth='lg'>
          <Box
            sx={{
              maxWidth: { xs: '100%', md: 950 },
              mx: 'auto',
              px: { xs: 1.5, sm: 2, md: 0 }
            }}
          >
            {isCompactHeader ? (
              <Stack spacing={1.6}>
                <Stack direction='row' alignItems='center' spacing={1.4}>
                  <Box
                    component='img'
                    src={quizImage}
                    alt={quiz.title}
                    onError={e => {
                      e.currentTarget.src = 'https://fakeimg.pl/200x200/?text=Quiz'
                    }}
                    sx={{
                      width: 76,
                      height: 76,
                      borderRadius: 2.5,
                      objectFit: 'cover',
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
                      boxShadow: '0 8px 18px rgba(15, 23, 42, 0.12)'
                    }}
                  />

                  <Stack spacing={0.6} flex={1} minWidth={0} sx={{ px: 0.5 }}>
                    <Typography
                      variant='h5'
                      fontWeight={800}
                      sx={{
                        fontSize: '1.35rem',
                        lineHeight: 1.15,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}
                    >
                      {quiz.title}
                    </Typography>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      sx={{
                        fontSize: '0.88rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {quiz.details || 'Select a language to start playing this quiz.'}
                    </Typography>
                  </Stack>
                </Stack>

                {startQuiz && questions.length > 0 ? (
                  <Timer
                    time={time}
                    setTime={setTime}
                    isActive={isTimerActive}
                    sx={{
                      width: '100%',
                      minWidth: 'auto',
                      px: 1.8,
                      py: 1.4
                    }}
                  />
                ) : (
                  <Stack
                    spacing={0.6}
                    alignItems='center'
                    justifyContent='center'
                    textAlign='center'
                    sx={{
                      width: '100%',
                      py: 1.6,
                      color: alpha(theme.palette.text.primary, 0.68),
                      borderRadius: { xs: 2, sm: 2.5 },
                      border: `1px dashed ${alpha(theme.palette.primary.main, isDarkMode ? 0.3 : 0.2)}`,
                      bgcolor: isDarkMode ? alpha(theme.palette.background.default, 0.5) : 'transparent'
                    }}
                  >
                    <Typography variant='caption' fontWeight={700}>
                      Timer will appear here.
                    </Typography>
                    <Typography variant='caption'>
                      Hit <strong>Start Quiz</strong> to begin tracking your time.
                    </Typography>
                  </Stack>
                )}

                <Stack direction='row' spacing={0.8} flexWrap='wrap'>
                  {selectedLanguage && (
                    <Chip
                      label={selectedLanguageInfo?.name}
                      size='small'
                      sx={{
                        bgcolor: alpha(theme.palette.info.main, 0.14),
                        color: theme.palette.info.main,
                        fontWeight: 600
                      }}
                    />
                  )}
                  {selectedLanguage && (
                    <Chip
                      label={`${currentQuestionCount} Qs`}
                      size='small'
                      sx={{
                        bgcolor: alpha(theme.palette.success.main, 0.14),
                        color: theme.palette.success.main,
                        fontWeight: 600
                      }}
                    />
                  )}
                </Stack>
              </Stack>
            ) : (
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={{ xs: 2.4, md: 4 }}
                alignItems={{ xs: 'center', md: 'stretch' }}
                justifyContent='space-between'
              >
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={{ xs: 1.6, md: 3 }}
                  alignItems='center'
                  flex={1}
                >
                  <Box
                    component='img'
                    src={quizImage}
                    alt={quiz.title}
                    onError={e => {
                      e.currentTarget.src = 'https://fakeimg.pl/200x200/?text=Quiz'
                    }}
                    sx={{
                      width: { xs: 84, sm: 96, md: 120 },
                      height: { xs: 84, sm: 96, md: 120 },
                      borderRadius: { xs: 2.5, md: 3 },
                      objectFit: 'cover',
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
                      boxShadow: '0 10px 22px rgba(15, 23, 42, 0.14)'
                    }}
                  />

                  <Stack
                    spacing={{ xs: 1.1, md: 1.5 }}
                    alignItems={{ xs: 'center', md: 'flex-start' }}
                    textAlign={{ xs: 'center', md: 'left' }}
                    flex={1}
                    justifyContent='center'
                  >
                    <Typography
                      variant='h4'
                      fontWeight={800}
                      sx={{
                        fontSize: { xs: '1.55rem', sm: '1.75rem', md: '2.25rem' },
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}
                    >
                      {quiz.title}
                    </Typography>
                    <Typography
                      variant='body1'
                      color='text.secondary'
                      sx={{ maxWidth: 520, fontSize: { xs: '0.9rem', md: '1rem' } }}
                    >
                      {quiz.details || 'Select a language to start playing this quiz.'}
                    </Typography>
                    <Stack
                      direction='row'
                      spacing={1}
                      flexWrap='wrap'
                      justifyContent={{ xs: 'center', md: 'flex-start' }}
                    >
                      {selectedLanguage && (
                        <Chip
                          label={selectedLanguageInfo?.name}
                          sx={{
                            bgcolor: alpha(theme.palette.info.main, 0.12),
                            color: theme.palette.info.main,
                            fontWeight: 600
                          }}
                        />
                      )}
                      {selectedLanguage && (
                        <Chip
                          label={`${currentQuestionCount} Questions`}
                          sx={{
                            bgcolor: alpha(theme.palette.success.main, 0.12),
                            color: theme.palette.success.main,
                            fontWeight: 600
                          }}
                        />
                      )}
                    </Stack>
                  </Stack>
                </Stack>

                {startQuiz && questions.length > 0 ? (
                  <Timer
                    time={time}
                    setTime={setTime}
                    isActive={isTimerActive}
                    sx={{
                      alignSelf: { xs: 'stretch', md: 'center' },
                      width: { xs: '100%', sm: 260, md: 280 },
                      maxWidth: { xs: '100%', md: 320 },
                      mt: { xs: 1.5, md: 0 }
                    }}
                  />
                ) : (
                  <Stack
                    spacing={0.6}
                    alignItems='center'
                    justifyContent='center'
                    textAlign='center'
                    sx={{
                      width: { xs: '100%', sm: 260, md: 280 },
                      maxWidth: { xs: '100%', md: 320 },
                      minHeight: { xs: 96, md: 120 },
                      color: alpha(theme.palette.text.primary, 0.68),
                      borderRadius: { xs: 2, sm: 2.5 },
                      border: `1px dashed ${alpha(theme.palette.primary.main, isDarkMode ? 0.3 : 0.2)}`,
                      bgcolor: isDarkMode ? alpha(theme.palette.background.default, 0.5) : 'transparent',
                      px: { xs: 2, sm: 3 }
                    }}
                  >
                    <Typography variant='subtitle2' fontWeight={700}>
                      Get ready to track your time.
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Press <strong>Start Quiz</strong> and the timer begins automatically.
                    </Typography>
                  </Stack>
                )}
              </Stack>
            )}
          </Box>
        </Container>
      </Box>

      <Container maxWidth='lg' sx={{ px: { xs: 1.5, md: 0 } }}>
        <Box sx={{ maxWidth: 1080, mx: 'auto', px: { xs: 0, md: 1 } }}>{renderBody()}</Box>
      </Container>
    </Box>
  )
}
