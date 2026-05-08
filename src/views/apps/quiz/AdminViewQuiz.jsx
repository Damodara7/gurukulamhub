'use client'

import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Alert,
  Stack,
  Chip,
  useTheme,
  Grid,
  IconButton,
  Container,
  Card,
  CardContent,
  Divider,
  alpha,
  Collapse
} from '@mui/material'
import { useRouter } from 'next/navigation'
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
import { API_URLS } from '@/configs/apiConfig'
import * as RestApi from '@/utils/restApiUtil'
import Link from 'next/link'
import Image from 'next/image'
import VideoAd from '@views/apps/advertisements/VideoAd/VideoAd'
import ImagePopup from '@/components/ImagePopup'
import ConfirmationDialog from '@/components/dialogs/confirmation-dialog'
import { useSession } from 'next-auth/react'
import { approveQuiz, moveQuizToPending, rejectQuiz } from '@/actions/quiz'
import Loading from '@/components/Loading'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import VisibilityIcon from '@mui/icons-material/Visibility'
import QuestionMarkIcon from '@mui/icons-material/QuestionMark'
import LanguageIcon from '@mui/icons-material/Language'
import InfoIcon from '@mui/icons-material/Info'
import PersonIcon from '@mui/icons-material/Person'
import BookIcon from '@mui/icons-material/Book'
import LabelIcon from '@mui/icons-material/Label'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import PendingIcon from '@mui/icons-material/Pending'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'

const AdminViewQuiz = ({ quizId }) => {
  const { data: session } = useSession()
  const router = useRouter()
  const theme = useTheme()
  const [quizData, setQuizData] = useState(null)
  const [primaryQuestions, setPrimaryQuestions] = useState([])
  const [secondaryQuestions, setSecondaryQuestions] = useState([])
  const [loading, setLoading] = useState({ quizzes: false, secondaryQuestions: false })
  const [selectedPrimaryQuestionId, setSelectedPrimaryQuestionId] = useState(null)
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState({ pending: false, reject: false })
  const [isQuizInfoExpanded, setIsQuizInfoExpanded] = useState(false)
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false)

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setLoading(prev => ({ ...prev, quizzes: true }))
        const result = await RestApi.get(`${API_URLS.v0.USERS_QUIZ}/${quizId}`)
        if (result.status === 'success') {
          setQuizData(result.result)
          fetchPrimaryQuestions(result.result._id)
        }
      } catch (error) {
        console.error('Error fetching quiz data:', error)
      } finally {
        setLoading(prev => ({ ...prev, quizzes: false }))
      }
    }

    const fetchPrimaryQuestions = async quizId => {
      const result = await RestApi.get(`${API_URLS.v0.USERS_QUIZ_QUESTION}?quizId=${quizId}&isPrimary=true`)
      if (result.status === 'success') {
        setPrimaryQuestions(result.result)
      }
    }

    fetchQuizData()
  }, [quizId])

  const handlePrimaryQuestionClick = async questionId => {
    setLoading(prev => ({ ...prev, secondaryQuestions: true }))
    setSelectedPrimaryQuestionId(questionId) // Highlight the selected dummy template

    try {
      const result = await RestApi.get(
        `${API_URLS.v0.USERS_QUIZ_QUESTION}?quizId=${quizId}&primaryQuestionId=${questionId}`
      )
      if (result.status === 'success') {
        setSecondaryQuestions(result.result)
      } else {
        // Optional: handle unexpected success response status
        console.error('Unexpected response status:', result)
      }
    } catch (error) {
      console.error('Failed to fetch secondary questions:', error)
      // Optional: set error state or show a user-friendly message
    } finally {
      setLoading(prev => ({ ...prev, secondaryQuestions: false }))
    }
  }

  async function handleRejectQuiz(payload = {}) {
    const rejectionReason = payload?.rejectionReason?.trim()
    const reqBody = {
      id: quizId,
      approvalState: 'rejected',
      approvedBy: session?.user?.email,
      remarks: rejectionReason ? [rejectionReason] : []
    }
    try {
      const result = await rejectQuiz(reqBody)
      if (result.status === 'success') {
        router.push('/management/user-quizzes/list')
      } else {
        console.error('Error rejecting quiz:', result)
        throw new Error('Error rejecting quiz.')
      }
    } catch (error) {
      console.error('Error rejecting quiz:', error)
      throw new Error('Unknown error while rejecting quiz.')
    }
  }

  async function handleRejectQuizConfirmation() {
    setConfirmationDialogOpen(prev => ({ ...prev, reject: true }))
  }

  async function handleMoveToPending() {
    const reqBody = {
      id: quizId,
      approvalState: 'pending',
      approvedBy: session?.user?.email
    }
    try {
      const result = await moveQuizToPending(reqBody)
      if (result.status === 'success') {
        router.push('/management/user-quizzes/list')
      } else {
        console.error('Error moving quiz to pending:', result)
        throw new Error('Error moving quiz to pending.')
      }
    } catch (error) {
      console.error('Error moving quiz to pending:', error)
      throw new Error('Unknown error while moving quiz to pending.')
    }
  }

  async function handleMoveToPendingConfirmation() {
    setConfirmationDialogOpen(prev => ({ ...prev, pending: true }))
  }

  async function handleApproveQuiz() {
    const reqBody = {
      id: quizId,
      approvalState: 'approved',
      approvedBy: session?.user?.email
    }
    try {
      const result = await approveQuiz(reqBody)
      if (result.status === 'success') {
        router.push('/management/user-quizzes/list')
      } else {
        console.error('Error approving quiz:', result)
      }
    } catch (error) {
      console.error('Error approving quiz:', error)
    }
  }

  if (loading.quizzes) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100%' }}>
        <Stack spacing={2} alignItems='center'>
          <CircularProgress size={48} />
          <Typography variant='body1' color='text.secondary' fontWeight={500}>
            Loading quiz...
          </Typography>
        </Stack>
      </Box>
    )
  }

  if (!quizData) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100%' }}>
        <Alert severity='error'>Quiz not found.</Alert>
      </Box>
    )
  }

  const { thumbnail, title, details, owner, syllabus, contextIds, courseLinks, documents, tags } = quizData

  const getStatusConfig = () => {
    const configs = {
      pending: { color: 'warning', icon: <PendingIcon fontSize='small' />, label: 'PENDING' },
      approved: { color: 'success', icon: <CheckCircleIcon fontSize='small' />, label: 'APPROVED' },
      rejected: { color: 'error', icon: <CancelIcon fontSize='small' />, label: 'REJECTED' },
      published: { color: 'info', icon: <CheckCircleIcon fontSize='small' />, label: 'PUBLISHED' }
    }
    return configs[quizData.approvalState] || configs.pending
  }

  const statusConfig = getStatusConfig()

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        bgcolor: theme.palette.background.default
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          bgcolor: theme.palette.background.paper,
          pt: isHeaderCollapsed ? { xs: 1, sm: 1.25 } : { xs: 1.5, sm: 2 },
          pb: isHeaderCollapsed ? { xs: 1, sm: 1.25 } : { xs: 1.5, sm: 2 },
          borderBottom: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.12 : 0.08)}`,
          mb: isHeaderCollapsed ? 1 : 2,
          transition: 'all 0.3s ease',
          flexShrink: 0
        }}
      >
        <Container maxWidth='xl'>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Stack direction='row' alignItems='center' spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => router.push('/management/user-quizzes/list')}
                size='small'
                sx={{
                  px: 0,
                  minWidth: 'auto',
                  color: 'text.secondary',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                  '&:hover': {
                    bgcolor: 'transparent',
                    color: 'primary.main'
                  }
                }}
              >
                Back
              </Button>
              <Box
                sx={{
                  width: { xs: 28, sm: 32 },
                  height: { xs: 28, sm: 32 },
                  borderRadius: 1.5,
                  bgcolor: theme.palette.primary.main,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <VisibilityIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />
              </Box>
              <Typography
                variant='h6'
                fontWeight={700}
                sx={{
                  fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                Review Quiz
              </Typography>
              <Chip
                icon={statusConfig.icon}
                label={statusConfig.label}
                color={statusConfig.color}
                size='small'
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '0.6875rem', sm: '0.75rem' },
                  height: { xs: 24, sm: 26 },
                  flexShrink: 0,
                  '& .MuiChip-icon': {
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    color: 'inherit'
                  }
                }}
              />
            </Stack>
            <IconButton
              onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
              size='small'
              sx={{
                color: 'text.secondary',
                flexShrink: 0,
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: 'text.primary'
                }
              }}
            >
              {isHeaderCollapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
            </IconButton>
          </Box>
          {!isHeaderCollapsed && (
            <Typography
              variant='body2'
              sx={{
                color: theme.palette.text.secondary,
                fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                mt: 1,
                ml: { xs: 0, sm: 5.5 }
              }}
            >
              Review quiz details, questions, and manage approval status
            </Typography>
          )}
        </Container>
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          overflow: 'hidden',
          px: { xs: 2, md: 3 }
        }}
      >
        <Stack spacing={4} sx={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* Quiz Details Card */}
          <Card
            sx={{
              borderRadius: 2,
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.12 : 0.08)}`,
              boxShadow: theme.palette.mode === 'dark' ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.04)',
              overflow: 'hidden',
              flexShrink: 0
            }}
          >
            <Box
              sx={{
                p: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                borderBottom: '2px solid',
                borderColor: 'primary.main',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Stack direction='row' alignItems='center' spacing={1.5}>
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
                  <InfoIcon sx={{ fontSize: 22 }} />
                </Box>
                <Typography variant='h6' fontWeight={700}>
                  Quiz Information
                </Typography>
              </Stack>

              <IconButton
                onClick={() => setIsQuizInfoExpanded(!isQuizInfoExpanded)}
                size='small'
                sx={{
                  gap: 0.5,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1.5,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                  fontSize: '0.875rem',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.2)
                  }
                }}
              >
                <Typography variant='caption' fontWeight={600} sx={{ textTransform: 'none', fontSize: '0.75rem' }}>
                  {isQuizInfoExpanded ? 'Hide' : 'Show'}
                </Typography>
                {isQuizInfoExpanded ? (
                  <ExpandLessIcon sx={{ fontSize: 18 }} />
                ) : (
                  <ExpandMoreIcon sx={{ fontSize: 18 }} />
                )}
              </IconButton>
            </Box>

            <Collapse in={isQuizInfoExpanded} timeout={300}>
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  {/* Thumbnail */}
                  <Grid item xs={12} md={4}>
                    <Box
                      sx={{
                        width: '100%',
                        maxWidth: 300,
                        height: 200,
                        mx: 'auto',
                        borderRadius: 2,
                        overflow: 'hidden',
                        bgcolor: alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.08 : 0.1),
                        border: `1px solid ${alpha(
                          theme.palette.divider,
                          theme.palette.mode === 'dark' ? 0.12 : 0.08
                        )}`,
                        position: 'relative'
                      }}
                    >
                      <Image
                        src={thumbnail || '/images/misc/image-placeholder.png'}
                        alt={title}
                        fill
                        unoptimized
                        style={{ objectFit: 'cover' }}
                        onError={e => {
                          e.target.src = '/images/misc/image-placeholder.png'
                        }}
                      />
                    </Box>
                  </Grid>

                  {/* Details */}
                  <Grid item xs={12} md={8}>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant='h5' fontWeight={700} gutterBottom>
                          {title}
                        </Typography>
                        <Typography variant='body1' color='text.secondary' sx={{ lineHeight: 1.7 }}>
                          {details}
                        </Typography>
                      </Box>

                      <Divider />

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Stack direction='row' spacing={1} alignItems='center'>
                            <PersonIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                            <Typography variant='body2'>
                              <strong>Owner:</strong> {owner}
                            </Typography>
                          </Stack>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Stack direction='row' spacing={1} alignItems='center'>
                            <BookIcon sx={{ fontSize: 20, color: 'secondary.main' }} />
                            <Typography variant='body2'>
                              <strong>Syllabus:</strong> {syllabus}
                            </Typography>
                          </Stack>
                        </Grid>
                        {contextIds && (
                          <Grid item xs={12}>
                            <Typography variant='body2'>
                              <strong>Context IDs:</strong> {contextIds}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>

                      {/* Tags */}
                      {tags?.length > 0 && (
                        <Box>
                          <Stack direction='row' spacing={1} alignItems='center' sx={{ mb: 1 }}>
                            <LabelIcon sx={{ fontSize: 20, color: 'info.main' }} />
                            <Typography variant='subtitle2' fontWeight={600}>
                              Tags:
                            </Typography>
                          </Stack>
                          <Stack direction='row' spacing={1} flexWrap='wrap' sx={{ gap: 1 }}>
                            {tags.map((tag, index) => (
                              <Chip
                                key={index}
                                label={tag}
                                size='small'
                                sx={{
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  color: theme.palette.primary.main,
                                  fontWeight: 600
                                }}
                              />
                            ))}
                          </Stack>
                        </Box>
                      )}

                      {/* Course Links */}
                      {courseLinks?.length > 0 && (
                        <Box>
                          <Typography variant='subtitle2' fontWeight={600} gutterBottom>
                            Course Links:
                          </Typography>
                          <Stack spacing={2}>
                            {courseLinks.map((link, index) => (
                              <Box key={index}>
                                <VideoAd url={link?.link || ''} showPause autoPlay={false} />
                                <ImagePopup imageUrl={link?.link || ''} mediaType={link.mediaType} />
                              </Box>
                            ))}
                          </Stack>
                        </Box>
                      )}

                      {/* Documents */}
                      {documents?.length > 0 && (
                        <Box>
                          <Typography variant='subtitle2' fontWeight={600} gutterBottom>
                            Documents:
                          </Typography>
                          <Stack spacing={1}>
                            {documents.map((document, index) => (
                              <Box
                                key={index}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  p: 1.5,
                                  borderRadius: 1,
                                  bgcolor: alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.05 : 0.03),
                                  border: `1px solid ${alpha(
                                    theme.palette.divider,
                                    theme.palette.mode === 'dark' ? 0.12 : 0.08
                                  )}`
                                }}
                              >
                                <Typography variant='body2'>{`Document ${index + 1}: ${
                                  document.description
                                }`}</Typography>
                                <Button
                                  component={Link}
                                  href={document?.document || ''}
                                  target='_blank'
                                  rel='noopener noreferrer'
                                  variant='outlined'
                                  size='small'
                                  sx={{ textTransform: 'none', fontWeight: 600 }}
                                >
                                  View
                                </Button>
                              </Box>
                            ))}
                          </Stack>
                        </Box>
                      )}
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </Collapse>
          </Card>

          {/* Questions Section */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
            <Grid container spacing={3} sx={{ flex: 1, minHeight: 0, display: 'flex' }}>
              {/* Primary Questions Sidebar */}
              <Grid item xs={12} md={3} sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, height: '100%' }}>
                <Card
                  sx={{
                    borderRadius: 2,
                    bgcolor: theme.palette.background.paper,
                    border: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.12 : 0.08)}`,
                    boxShadow:
                      theme.palette.mode === 'dark' ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.04)',
                    position: { md: 'sticky' },
                    top: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    minHeight: 0,
                    overflow: 'hidden'
                  }}
                >
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      borderBottom: '2px solid',
                      borderColor: 'primary.main',
                      flexShrink: 0
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
                          justifyContent: 'center'
                        }}
                      >
                        <QuestionMarkIcon sx={{ fontSize: 20 }} />
                      </Box>
                      <Stack>
                        <Typography variant='caption' sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                          PRIMARY QUESTIONS
                        </Typography>
                        <Typography variant='body2' fontWeight={600}>
                          {quizData.language?.name || 'N/A'}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Box>

                  <Box
                    sx={{
                      whiteSpace: { md: 'normal', xs: 'nowrap' },
                      p: 1.5,
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      minHeight: 0,
                      overflow: 'hidden'
                    }}
                  >
                    <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', minHeight: 0 }}>
                      {primaryQuestions.length > 0 ? (
                        primaryQuestions.map((question, index) => (
                          <Card
                            key={question._id}
                            onClick={() => handlePrimaryQuestionClick(question._id)}
                            sx={{
                              mb: 1.5,
                              width: { md: '100%', xs: 200 },
                              display: { md: 'block', xs: 'inline-block' },
                              mr: { xs: 1.5, md: 0 },
                              cursor: 'pointer',
                              border: '2px solid',
                              borderColor: selectedPrimaryQuestionId === question._id ? 'primary.main' : 'divider',
                              bgcolor:
                                selectedPrimaryQuestionId === question._id
                                  ? alpha(theme.palette.primary.main, 0.05)
                                  : theme.palette.background.paper,
                              boxShadow:
                                selectedPrimaryQuestionId === question._id
                                  ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`
                                  : theme.palette.mode === 'dark'
                                    ? '0 2px 8px rgba(0,0,0,0.3)'
                                    : '0 2px 8px rgba(0,0,0,0.04)',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              flexShrink: 0,
                              '&:hover': {
                                borderColor: 'primary.main',
                                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
                                transform: 'translateX(4px)'
                              }
                            }}
                          >
                            {(() => {
                              switch (question.templateId) {
                                case 'single-choice':
                                  return <DummySingleChoiceTemplate question={question} />
                                case 'multiple-choice':
                                  return <DummyMultipleChoiceTemplate question={question} />
                                case 'true-or-false':
                                  return <DummyTrueOrFalseTemplate question={question} />
                                case 'fill-in-blank':
                                  return <DummyFillInTheBlanksTemplate question={question} />
                                default:
                                  return <Typography>No Template Found</Typography>
                              }
                            })()}
                          </Card>
                        ))
                      ) : (
                        <Box sx={{ p: 3, textAlign: 'center' }}>
                          <Typography variant='body2' color='text.secondary'>
                            No questions available
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Card>
              </Grid>

              {/* Main Content Area */}
              <Grid
                item
                xs={12}
                md={9}
                sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, height: '100%', flex: 1 }}
              >
                <Box
                  sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0,
                    overflow: 'hidden',
                    height: '100%'
                  }}
                >
                  <Box
                    sx={{
                      flex: 1,
                      overflowY: 'auto',
                      overflowX: 'hidden',
                      minHeight: 0,
                      WebkitOverflowScrolling: 'touch',
                      pr: 1
                    }}
                  >
                    <Stack spacing={3}>
                      {/* Selected Primary Question */}
                      {selectedPrimaryQuestionId && (
                        <Card
                          sx={{
                            borderRadius: 2,
                            bgcolor: theme.palette.background.paper,
                            border: `1px solid ${alpha(
                              theme.palette.divider,
                              theme.palette.mode === 'dark' ? 0.12 : 0.08
                            )}`,
                            boxShadow:
                              theme.palette.mode === 'dark'
                                ? '0 2px 12px rgba(0,0,0,0.3)'
                                : '0 2px 12px rgba(0,0,0,0.04)',
                            flexShrink: 0
                          }}
                        >
                          <Box
                            sx={{
                              p: 2,
                              bgcolor: alpha(theme.palette.primary.main, 0.05),
                              borderBottom: '1px solid',
                              borderColor: 'divider'
                            }}
                          >
                            <Stack direction='row' justifyContent='space-between' alignItems='center'>
                              <Typography variant='subtitle1' fontWeight={600}>
                                Primary Question
                              </Typography>
                              {primaryQuestions.map(question => {
                                if (question._id === selectedPrimaryQuestionId) {
                                  return (
                                    <Chip
                                      key={question._id}
                                      icon={<LanguageIcon />}
                                      label={question.language.split('|')[1]}
                                      size='small'
                                      sx={{
                                        bgcolor: theme.palette.primary.main,
                                        color: 'white',
                                        fontWeight: 600,
                                        '& .MuiChip-icon': {
                                          color: 'white'
                                        }
                                      }}
                                    />
                                  )
                                }
                                return null
                              })}
                            </Stack>
                          </Box>
                          {primaryQuestions.map(question => {
                            if (question._id === selectedPrimaryQuestionId) {
                              return (
                                <Box key={question._id}>
                                  {(() => {
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
                                  })()}
                                </Box>
                              )
                            }
                            return null
                          })}
                        </Card>
                      )}

                      {/* Secondary Questions */}
                      {/* <Card
                  sx={{
                    borderRadius: 2,
                    bgcolor: theme.palette.background.paper,
                    border: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.12 : 0.08)}`,
                    boxShadow:
                      theme.palette.mode === 'dark' ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.04)',
                    flexShrink: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0,
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
                          borderRadius: 1
                        }}
                      />
                      <Typography variant='h6' fontWeight={700}>
                        Secondary Language Questions
                      </Typography>
                      <Chip
                        label={`${secondaryQuestions.length} Questions`}
                        size='small'
                        sx={{
                          bgcolor: alpha(theme.palette.secondary.main, 0.1),
                          color: 'secondary.main',
                          fontWeight: 600
                        }}
                      />
                    </Stack>
                  </Box>

                  <Box sx={{ p: 2, flex: 1, overflowY: 'auto', overflowX: 'hidden', minHeight: 0 }}>
                    {loading.secondaryQuestions ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
                        <CircularProgress />
                      </Box>
                    ) : secondaryQuestions.length > 0 ? (
                      secondaryQuestions.map((question, index) => {
                        const chipColors = ['secondary', 'success', 'error', 'warning', 'info', 'primary']
                        return (
                          <Card
                            key={question._id}
                            sx={{
                              mb: 2,
                              borderRadius: 2,
                              border: '1px solid',
                              borderColor: 'divider',
                              boxShadow:
                                theme.palette.mode === 'dark'
                                  ? '0 2px 8px rgba(0,0,0,0.3)'
                                  : '0 2px 8px rgba(0,0,0,0.06)',
                              flexShrink: 0
                            }}
                          >
                            <Box
                              sx={{
                                p: 1.5,
                                bgcolor: alpha(theme.palette.secondary.main, 0.06),
                                borderBottom: '1px solid',
                                borderColor: 'divider'
                              }}
                            >
                              <Stack direction='row' justifyContent='space-between' alignItems='center'>
                                <Typography variant='subtitle2' fontWeight={600}>
                                  Question {index + 1}
                                </Typography>
                                <Chip
                                  icon={<LanguageIcon />}
                                  label={question.language.split('|')[1]}
                                  size='small'
                                  color={chipColors[index % chipColors.length]}
                                  sx={{
                                    fontWeight: 600,
                                    '& .MuiChip-icon': {
                                      color: 'inherit'
                                    }
                                  }}
                                />
                              </Stack>
                            </Box>
                            {(() => {
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
                            })()}
                          </Card>
                        )
                      })
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
                        <QuestionMarkIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                        <Typography variant='body2' color='text.secondary'>
                          No secondary questions available
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          Select a primary question to view its translations
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Card> */}
                    </Stack>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Action Buttons */}
          <Card
            sx={{
              borderRadius: 2,
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.12 : 0.08)}`,
              boxShadow: theme.palette.mode === 'dark' ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.04)',
              overflow: 'hidden',
              flexShrink: 0
            }}
          >
            <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Stack direction='row' spacing={2} justifyContent='center' flexWrap='wrap'>
                {quizData.approvalState !== 'approved' && quizData.approvalState !== 'published' && (
                  <Button
                    variant='contained'
                    color='success'
                    component='label'
                    size='medium'
                    startIcon={<CheckCircleIcon />}
                    onClick={() => handleApproveQuiz()}
                    sx={{
                      px: 3,
                      color: 'white',
                      textTransform: 'none',
                      fontWeight: 600
                    }}
                  >
                    Approve Quiz
                  </Button>
                )}
                {quizData.approvalState !== 'pending' && quizData.approvalState !== 'published' && (
                  <Button
                    variant='contained'
                    color='warning'
                    component='label'
                    size='medium'
                    startIcon={<PendingIcon />}
                    onClick={() => handleMoveToPendingConfirmation()}
                    sx={{
                      px: 3,
                      color: 'white',
                      textTransform: 'none',
                      fontWeight: 600
                    }}
                  >
                    Move To Pending
                  </Button>
                )}
                {quizData.approvalState !== 'rejected' && (
                  <Button
                    variant='contained'
                    color='error'
                    component='label'
                    size='medium'
                    startIcon={<CancelIcon />}
                    onClick={() => handleRejectQuizConfirmation()}
                    sx={{
                      px: 3,
                      color: 'white',
                      textTransform: 'none',
                      fontWeight: 600
                    }}
                  >
                    Reject Quiz
                  </Button>
                )}
              </Stack>
            </Box>
          </Card>
        </Stack>
      </Box>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmationDialogOpen.pending}
        setOpen={bool => setConfirmationDialogOpen(prev => ({ ...prev, pending: false }))}
        type='move-quiz-to-pending' // Customize based on your context
        onConfirm={handleMoveToPending}
      />
      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmationDialogOpen.reject}
        setOpen={bool => setConfirmationDialogOpen(prev => ({ ...prev, reject: false }))}
        type='reject-quiz' // Customize based on your context
        onConfirm={handleRejectQuiz}
      />
    </Box>
  )
}

export default AdminViewQuiz
