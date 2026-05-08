//   const primaryQuestionData = {
//     _id: data._id,
//     id: id,
// templateId: 'single-choice',
//     data: {
//       language: language,
//       question: question,
//       hint: hint,
//       hintMarks: hintMarks,
//       marks: marks,
//       timerSeconds: timerSeconds,
//       skippable: skippable,
//       language: language,
//       status: status,
//       options: options
//     }
//   }

'use client'

import React, { useEffect, useState } from 'react'
import { API_URLS } from '@/configs/apiConfig'
import * as RestApi from '@/utils/restApiUtil'
import {
  AlertTitle,
  Button,
  Chip,
  useMediaQuery,
  useTheme,
  Container,
  alpha,
  CircularProgress,
  Collapse,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material'
import { Alert, Stack, Grid, Card, Typography, CardContent, CardHeader, Divider, Box, Tooltip } from '@mui/material'
import Loading from '@/components/Loading'
import QuizDetails from '@/components/quiz-builder-1/QuizDetails'
import { useRouter } from 'next/navigation'

// Mui icons
import EditIcon from '@mui/icons-material/Edit'
import VisibilityIcon from '@mui/icons-material/Visibility'
import LanguageIcon from '@mui/icons-material/Language'
import QuestionMarkIcon from '@mui/icons-material/QuestionMark'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'

import {
  SingleChoiceTemplate,
  MultipleChoiceTemplate,
  TrueOrFalseTemplate,
  FillInTheBlanksTemplate,
  DummySingleChoiceTemplate,
  DummyMultipleChoiceTemplate,
  DummyTrueOrFalseTemplate,
  DummyFillInTheBlanksTemplate
} from '@/components/quizbuilder/Templates'
import ViewQuizQuestionParametersPanel from '@/components/quizbuilder/ViewQuizQuestionParametersPanel'

function ViewQuiz({ quiz, isAdmin = false }) {
  const router = useRouter()
  const [isMinimizedBool, setIsMinimizedBool] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [quizData, setQuizData] = useState(null)
  const [primaryQuestions, setPrimaryQuestions] = useState([])
  const [secQuestions, setSecQuestions] = useState([])
  const [selectedPrimaryQuestion, setSelectedPrimaryQuestion] = useState(null)
  const [primaryQuestionEditing, setPrimaryQuestionEditing] = useState(false)
  const [secQuestionsLoading, setSecQuestionsLoading] = useState(false)
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(true)
  const [headerEditMenuAnchor, setHeaderEditMenuAnchor] = useState(null)

  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'))

  useEffect(() => {
    async function getQuizData() {
      setIsLoading(true)
      console.log('Fetching Selected Quiz Data now...')
      const result = await RestApi.get(`${API_URLS.v0.USERS_QUIZ}/${quiz._id}`)
      if (result?.status === 'success') {
        console.log('Quizzes Fetched result', result)
        setQuizData(result?.result)
        await fetchPrimaryQuestions(quiz._id) // Fetch primary questions after getting quiz data
      } else {
        // toast.error('Error:' + result?.message)
        console.log('Error:' + result?.message)
      }
      setIsLoading(false)
    }

    getQuizData()
  }, [quiz._id])

  const fetchPrimaryQuestions = async quizId => {
    console.log('Fetching primary questions...')
    const result = await RestApi.get(`${API_URLS.v0.USERS_QUIZ_QUESTION}?quizId=${quiz._id}&isPrimary=true`)
    if (result.status === 'success') {
      console.log(`result: primary questions of quiz= ${quizId}...`, result)
      setPrimaryQuestions(result?.result || [])
    } else {
      console.log('Error Fetching primary questions:', result)
      setPrimaryQuestions([])
      // toast.error('Error Fetching primary questions:' + result?.message)
    }
  }

  useEffect(() => {
    if (selectedPrimaryQuestion) {
      fetchSecondaryQuestions(selectedPrimaryQuestion?._id)
    }
  }, [selectedPrimaryQuestion])

  useEffect(() => {
    setPrimaryQuestionEditing(false)
  }, [selectedPrimaryQuestion?._id])

  const fetchSecondaryQuestions = async questionId => {
    setSecQuestionsLoading(true)
    console.log('Fetching secondary questions...')
    const result = await RestApi.get(
      `${API_URLS.v0.USERS_QUIZ_QUESTION}?quizId=${quiz?._id}&primaryQuestionId=${questionId}`
    )
    if (result.status === 'success') {
      setSecQuestions(result?.result || [])
    }
    setSecQuestionsLoading(false)
  }

  function handleEditQuizDetails() {
    router.push(`/${isAdmin ? 'management/quizzes' : 'myquizzes'}/edit/${quiz._id}`)
  }
  function handleEditQuizQuestions() {
    router.push(`/${isAdmin ? 'management/quizzes' : 'myquizzes'}/builder/${quiz._id}`)
  }

  const canEditQuestionParams = quiz?.approvalState === 'draft' || quiz?.approvalState === 'saved'
  const showHeaderQuizEditMenu = quiz?.approvalState === 'draft' || quiz?.approvalState === 'saved'

  const closeHeaderEditMenu = () => setHeaderEditMenuAnchor(null)

  const refreshAfterQuestionSave = async primaryQuestionId => {
    const pRes = await RestApi.get(`${API_URLS.v0.USERS_QUIZ_QUESTION}?quizId=${quiz._id}&isPrimary=true`)
    if (pRes.status !== 'success') return

    const newList = pRes.result || []
    // Snapshot of the list as it was BEFORE this refresh — used to pick a
    // neighbour when the currently-selected question was deleted.
    const previousList = primaryQuestions

    setSelectedPrimaryQuestion(prev => {
      if (!prev) return prev
      const stillExists = newList.find(q => q._id === prev._id)
      if (stillExists) return stillExists

      // The selected question was deleted — pick a sensible neighbour:
      //   1. The question that took its place (same index → next question)
      //   2. Failing that, the question above it
      //   3. Otherwise null (deleted question was the only one)
      const oldIndex = previousList.findIndex(q => q._id === prev._id)
      if (oldIndex < 0) return newList[0] || null
      return newList[oldIndex] || newList[oldIndex - 1] || null
    })
    setPrimaryQuestions(newList)

    // Only refresh secondary questions if the active primary question still exists.
    // If it was deleted, the useEffect watching selectedPrimaryQuestion will fetch
    // them for the newly-selected neighbour, and clearing here avoids a flash of
    // stale data tied to the deleted question.
    if (primaryQuestionId && newList.some(q => q._id === primaryQuestionId)) {
      const sRes = await RestApi.get(
        `${API_URLS.v0.USERS_QUIZ_QUESTION}?quizId=${quiz._id}&primaryQuestionId=${primaryQuestionId}`
      )
      if (sRes.status === 'success') {
        setSecQuestions(sRes.result || [])
      }
    } else {
      setSecQuestions([])
    }
  }

  if (isLoading) {
    return <Loading />
  }

  console.log('Primary questions:', primaryQuestions)

  const renderDummyTemplate = (question, title, questionNumber) => {
    switch (question.templateId) {
      case 'single-choice':
        return <DummySingleChoiceTemplate question={question} title={title} questionNumber={questionNumber} />
      case 'multiple-choice':
        return <DummyMultipleChoiceTemplate question={question} title={title} questionNumber={questionNumber} />
      case 'true-or-false':
        return <DummyTrueOrFalseTemplate question={question} title={title} questionNumber={questionNumber} />
      case 'fill-in-blank':
        return <DummyFillInTheBlanksTemplate question={question} title={title} questionNumber={questionNumber} />
      default:
        return <Typography>No Template Found</Typography>
    }
  }

  const renderRealTemplate = question => {
    switch (question.templateId) {
      case 'single-choice':
        return <SingleChoiceTemplate question={question} />
      case 'multiple-choice':
        return <MultipleChoiceTemplate question={question} />
      case 'true-or-false':
        return <TrueOrFalseTemplate question={question} />
      case 'fill-in-blank':
        return <FillInTheBlanksTemplate question={question} />
      default:
        return <Typography>No Template Found</Typography>
    }
  }

  console.log('Secondary questions:', secQuestions)

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: theme.palette.background.default,
        pb: 6
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          bgcolor: theme.palette.background.paper,
          pt: isHeaderExpanded ? { xs: 3, md: 4 } : { xs: 2, md: 2.5 },
          pb: isHeaderExpanded ? { xs: 3, md: 4 } : { xs: 2, md: 2.5 },
          borderBottom: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.12 : 0.08)}`,
          mb: 4,
          transition: 'padding 0.3s ease'
        }}
      >
        <Container maxWidth='xl'>
          <Stack spacing={isHeaderExpanded ? 2 : 1.5}>
            {/* Top row: always visible — Back + title (left), Edit + expand (right). Collapsed = compact bar only. */}
            <Stack
              direction='row'
              alignItems='center'
              spacing={{ xs: 1, sm: 2 }}
              sx={{
                flexWrap: 'nowrap',
                gap: 1,
                minHeight: { xs: 44, sm: 48 }
              }}
            >
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => router.back()}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  color: 'text.secondary',
                  flexShrink: 0,
                  px: { xs: 0.5, sm: 1 },
                  minWidth: 'auto',
                  '&:hover': {
                    bgcolor: 'transparent',
                    color: 'primary.main'
                  }
                }}
              >
                Back
              </Button>

              <Typography
                component='h1'
                variant='h4'
                fontWeight={800}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  fontSize: isHeaderExpanded
                    ? { xs: '1.35rem', sm: '1.5rem', md: '2rem' }
                    : { xs: '1.05rem', sm: '1.2rem', md: '1.45rem' },
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: isHeaderExpanded ? 1.5 : 1,
                  transition: 'all 0.3s ease',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                <VisibilityIcon
                  sx={{
                    fontSize: isHeaderExpanded
                      ? { xs: 26, md: 34 }
                      : { xs: 20, sm: 22, md: 24 },
                    color: 'primary.main',
                    flexShrink: 0,
                    transition: 'font-size 0.3s ease'
                  }}
                />
                View Quiz
              </Typography>

              <Stack direction='row' alignItems='center' spacing={0.5} sx={{ flexShrink: 0 }}>
                {showHeaderQuizEditMenu && (
                  <>
                    <Tooltip title='Edit questions or quiz details'>
                      <Button
                        variant='outlined'
                        size='small'
                        color='primary'
                        startIcon={<EditIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />}
                        aria-label='Open edit menu'
                        aria-controls={headerEditMenuAnchor ? 'view-quiz-header-edit-menu' : undefined}
                        aria-haspopup='true'
                        aria-expanded={Boolean(headerEditMenuAnchor) ? 'true' : undefined}
                        onClick={e => setHeaderEditMenuAnchor(e.currentTarget)}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 700,
                          borderRadius: 2,
                          whiteSpace: 'nowrap',
                          px: { xs: 1, sm: 1.5 },
                          py: 0.75,
                          flexShrink: 0
                        }}
                      >
                        Edit
                      </Button>
                    </Tooltip>
                    <Menu
                      id='view-quiz-header-edit-menu'
                      anchorEl={headerEditMenuAnchor}
                      open={Boolean(headerEditMenuAnchor)}
                      onClose={closeHeaderEditMenu}
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                      slotProps={{ paper: { sx: { minWidth: 200, borderRadius: 2 } } }}
                    >
                      <MenuItem
                        onClick={() => {
                          handleEditQuizQuestions()
                          closeHeaderEditMenu()
                        }}
                        sx={{ py: 1.25, fontWeight: 600 }}
                      >
                        Edit Questions
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          handleEditQuizDetails()
                          closeHeaderEditMenu()
                        }}
                        sx={{ py: 1.25, fontWeight: 600 }}
                      >
                        Edit Quiz Details
                      </MenuItem>
                    </Menu>
                  </>
                )}
                <Tooltip title={isHeaderExpanded ? 'Collapse header' : 'Expand header'}>
                  <IconButton
                    onClick={() => setIsHeaderExpanded(!isHeaderExpanded)}
                    edge='end'
                    sx={{
                      color: theme.palette.text.secondary,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main
                      }
                    }}
                  >
                    {isHeaderExpanded ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>

            {/* Description + hints — only when expanded (never in collapsed mode) */}
            <Collapse in={isHeaderExpanded} timeout={300} unmountOnExit>
              <Stack spacing={2} sx={{ pt: 0.5 }}>
                <Typography variant='body1' sx={{ color: theme.palette.text.secondary, maxWidth: '800px' }}>
                  Review your quiz details and questions. View primary and secondary language questions.
                </Typography>

                {showHeaderQuizEditMenu && (
                  <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                    Use <strong>Edit</strong> to open <strong>Edit Questions</strong> or <strong>Edit Quiz Details</strong>.
                  </Typography>
                )}
              </Stack>
            </Collapse>
          </Stack>
        </Container>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto', width: '100%', maxWidth: '100%' }}>
        <Stack spacing={4} sx={{ width: '100%', maxWidth: '100%', px: { xs: 2, sm: 3, md: 4 } }}>
          {/* Quiz Details */}
          <QuizDetails quiz={quizData} />

          {/* Questions Section */}
          <Grid container spacing={{ xs: 2, md: 3 }} sx={{ width: '100%', margin: 0 }}>
            {/* Primary Questions Sidebar */}
            <Grid item xs={12} md={3} sx={{ width: '100%', maxWidth: '100%' }}>
              <Box
                sx={{
                  position: { md: 'sticky' },
                  top: 20,
                  width: '100%',
                  maxWidth: '100%'
                }}
              >
                <Card
                  sx={{
                    borderRadius: 2,
                    bgcolor: theme.palette.background.paper,
                    border: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.12 : 0.08)}`,
                    boxShadow:
                      theme.palette.mode === 'dark' ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.04)',
                    overflow: 'hidden',
                    width: '100%',
                    maxWidth: '100%'
                  }}
                >
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      borderBottom: '2px solid',
                      borderColor: 'primary.main'
                    }}
                  >
                    <Stack direction='row' alignItems='center' spacing={1.5}>
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: 1.5,
                          bgcolor: 'primary.main',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <QuestionMarkIcon sx={{ fontSize: 20 }} />
                      </Box>
                      <Stack sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                          variant='caption'
                          sx={{ color: 'text.secondary', fontSize: '0.7rem', fontWeight: 600 }}
                        >
                          PRIMARY QUESTIONS
                        </Typography>
                        <Typography
                          variant='body2'
                          fontWeight={700}
                          sx={{ color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis' }}
                        >
                          {quiz?.language?.name}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Box>

                  <Box
                    sx={{
                      overflowY: 'auto',
                      overflowX: 'hidden',
                      maxHeight: { xs: '200px', md: '70vh' },
                      p: 1.5,
                      width: '100%'
                    }}
                  >
                    {primaryQuestions?.length > 0 ? (
                      <Stack spacing={1.5}>
                        {primaryQuestions.map((question, index) => (
                          <Card
                            key={question._id}
                            sx={{
                              position: 'relative',
                              cursor: 'pointer',
                              width: '100%',
                              border: '2px solid',
                              borderColor: selectedPrimaryQuestion?._id === question._id ? 'primary.main' : 'divider',
                              borderRadius: 2,
                              bgcolor:
                                selectedPrimaryQuestion?._id === question._id
                                  ? alpha(theme.palette.primary.main, 0.08)
                                  : theme.palette.background.paper,
                              boxShadow:
                                selectedPrimaryQuestion?._id === question._id
                                  ? `0 4px 16px ${alpha(theme.palette.primary.main, 0.2)}`
                                  : theme.palette.mode === 'dark'
                                    ? '0 1px 4px rgba(0,0,0,0.3)'
                                    : '0 1px 4px rgba(0,0,0,0.05)',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              '&:hover': {
                                borderColor: 'primary.main',
                                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
                                transform: 'translateX(4px)'
                              }
                            }}
                            onClick={() => setSelectedPrimaryQuestion(question)}
                          >
                            {selectedPrimaryQuestion?._id === question._id && canEditQuestionParams ? (
                              <Tooltip title='Edit question in place'>
                                <IconButton
                                  size='small'
                                  aria-label='Edit question'
                                  onClick={e => {
                                    e.stopPropagation()
                                    setSelectedPrimaryQuestion(question)
                                    setPrimaryQuestionEditing(true)
                                  }}
                                  component='label'
                                  color='primary'
                                  sx={{
                                    position: 'absolute',
                                    top: 8,
                                    right: 8,
                                    zIndex: 2,
                                    boxShadow: 2,
                                  }}
                                >
                                  <EditIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                              </Tooltip>
                            ) : null}
                            {renderDummyTemplate(
                              question,
                              `${index + 1}. ${question?.data?.question || '* Question is not completed!'}`,
                              index + 1
                            )}
                          </Card>
                        ))}
                      </Stack>
                    ) : (
                      <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant='body2' color='text.secondary'>
                          No questions available
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Card>
              </Box>
            </Grid>

            {/* Main Content Area */}
            <Grid item xs={12} md={9} sx={{ width: '100%', maxWidth: '100%', minWidth: 0 }}>
              {selectedPrimaryQuestion ? (
                <Stack spacing={3}>
                  {/* Selected Primary Question */}
                  <Card
                    sx={{
                      borderRadius: 2,
                      bgcolor: theme.palette.background.paper,
                      border: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.12 : 0.08)}`,
                      boxShadow:
                        theme.palette.mode === 'dark' ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.04)',
                      overflow: 'hidden'
                    }}
                  >
                    {/* <Box
                      sx={{
                        p: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <Typography variant='subtitle1' fontWeight={700} sx={{ color: 'text.primary' }}>
                        Primary Question
                      </Typography>
                      <Chip
                        icon={<LanguageIcon sx={{ fontSize: 16 }} />}
                        size='small'
                        label={selectedPrimaryQuestion?.language?.split('|')[1]}
                        sx={{
                          bgcolor: 'primary.main',
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          '& .MuiChip-icon': { color: 'white' }
                        }}
                      />
                    </Box> */}
                    {/* {renderRealTemplate(selectedPrimaryQuestion)} */}
                    <ViewQuizQuestionParametersPanel
                      question={selectedPrimaryQuestion}
                      canEdit={canEditQuestionParams}
                      editing={primaryQuestionEditing}
                      onEditingChange={setPrimaryQuestionEditing}
                      onSaved={() => refreshAfterQuestionSave(selectedPrimaryQuestion._id)}
                    />
                  </Card>

                  {/* Secondary Questions Section */}
                  {/* <Card
                    sx={{
                      borderRadius: 2,
                      bgcolor: theme.palette.background.paper,
                      border: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.12 : 0.08)}`,
                      boxShadow:
                        theme.palette.mode === 'dark' ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.04)',
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
                      <Stack direction='row' alignItems='center' spacing={1.5}>
                        <Box
                          sx={{
                            width: 4,
                            height: 24,
                            bgcolor: 'secondary.main',
                            borderRadius: 2
                          }}
                        />
                        <Typography variant='h6' fontWeight={700} sx={{ color: 'secondary.main' }}>
                          Secondary Language Questions
                        </Typography>
                        {secQuestions.length > 0 && (
                          <Chip
                            label={`${secQuestions.length} question${secQuestions.length !== 1 ? 's' : ''}`}
                            size='small'
                            sx={{
                              bgcolor: 'secondary.main',
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.7rem'
                            }}
                          />
                        )}
                      </Stack>
                    </Box>

                    <Box sx={{ p: 2 }}>
                      {secQuestionsLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                          <CircularProgress size={40} />
                        </Box>
                      ) : secQuestions.length > 0 ? (
                        <Box
                          sx={{
                            maxHeight: '60vh',
                            overflowY: 'auto',
                            pr: 1
                          }}
                        >
                          <Stack spacing={3}>
                            {secQuestions.map((secQuestion, index) => (
                              <Card
                                key={secQuestion._id}
                                sx={{
                                  borderRadius: 2,
                                  border: '1px solid',
                                  borderColor: 'divider',
                                  boxShadow:
                                    theme.palette.mode === 'dark'
                                      ? '0 2px 8px rgba(0,0,0,0.3)'
                                      : '0 2px 8px rgba(0,0,0,0.06)',
                                  overflow: 'hidden'
                                }}
                              >
                                <Box
                                  sx={{
                                    p: 1.5,
                                    bgcolor: alpha(theme.palette.secondary.main, 0.06),
                                    borderBottom: '1px solid',
                                    borderColor: 'divider',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                  }}
                                >
                                  <Typography variant='caption' fontWeight={700} sx={{ color: 'text.secondary' }}>
                                    Question {index + 1}
                                  </Typography>
                                  <Chip
                                    icon={<LanguageIcon sx={{ fontSize: 14 }} />}
                                    size='small'
                                    label={secQuestion?.language?.split('|')[1]}
                                    sx={{
                                      bgcolor: 'secondary.main',
                                      color: 'white',
                                      fontWeight: 600,
                                      fontSize: '0.7rem',
                                      height: 22,
                                      '& .MuiChip-icon': { color: 'white' }
                                    }}
                                  />
                                </Box>
                                {renderRealTemplate(secQuestion)}
                                <ViewQuizQuestionParametersPanel
                                  question={secQuestion}
                                  canEdit={canEditQuestionParams}
                                  onSaved={() => refreshAfterQuestionSave(selectedPrimaryQuestion?._id)}
                                />
                              </Card>
                            ))}
                          </Stack>
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            p: 6,
                            textAlign: 'center',
                            bgcolor: alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.05 : 0.1),
                            borderRadius: 2,
                            border: '1px dashed',
                            borderColor: 'divider'
                          }}
                        >
                          <Typography variant='body1' color='text.secondary' sx={{ fontWeight: 500 }}>
                            No secondary language questions exist for this question.
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Card> */}
                </Stack>
              ) : (
                <Card
                  sx={{
                    borderRadius: 2,
                    bgcolor: theme.palette.background.paper,
                    border: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.12 : 0.08)}`,
                    boxShadow:
                      theme.palette.mode === 'dark' ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.04)',
                    p: 8,
                    textAlign: 'center'
                  }}
                >
                  <QuestionMarkIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant='h6' fontWeight={600} color='text.secondary' gutterBottom>
                    Select a Question
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Choose a primary question from the left panel to view its details and secondary language versions.
                  </Typography>
                </Card>
              )}
            </Grid>
          </Grid>
        </Stack>
      </Box>
    </Box>
  )
}

export default ViewQuiz
