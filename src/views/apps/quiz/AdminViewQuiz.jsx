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
  IconButton
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
import ChevronToggleComponent from '@/components/media-viewer/ChevronToggleComponent'
import VideoAd from '@views/apps/advertisements/VideoAd/VideoAd'
import ImagePopup from '@/components/ImagePopup'
import ConfirmationDialog from '@/components/dialogs/confirmation-dialog'
import { useSession } from 'next-auth/react'
import { approveQuiz, moveQuizToPending, rejectQuiz } from '@/actions/quiz'
import Loading from '@/components/Loading'
import GoBackButton from '@/components/GoBackButton'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

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

  async function handleRejectQuiz() {
    const reqBody = {
      id: quizId,
      approvalState: 'rejected',
      approvedBy: session?.user?.email
    }
    try {
      const result = await rejectQuiz(reqBody)
      if (result.status === 'success') {
        router.push('/management/quiz/list')
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
        router.push('/management/quiz/list')
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
        router.push('/management/quiz/list')
      } else {
        console.error('Error approving quiz:', result)
      }
    } catch (error) {
      console.error('Error approving quiz:', error)
    }
  }

  if (loading.quizzes) {
    return <Loading />
  }

  if (!quizData) {
    return <Alert severity='error'>Quiz not found.</Alert>
  }

  const { thumbnail, title, details, owner, syllabus, contextIds, courseLinks, documents, tags } = quizData

  return (
    <Box sx={{ maxWidth: '1200px', margin: 'auto', padding: 4, pb: 12, position: 'relative' }}>
      {/* Back Button */}
      {/* <Box sx={{ position: 'absolute', top: 16, left: 16 }}>
        <IconButtonTooltip title='' onClick={() => router.push('/management/quiz/list')}>
          <ArrowBackIcon />
        </IconButtonTooltip>
      </Box> */}
      <GoBackButton path='/management/quiz/list' />
      <Box sx={{ padding: 2, backgroundColor: '#f0f4f8', borderRadius: '12px', maxWidth: '1200px', margin: 'auto' }}>
        {/* Thumbnail Section */}
        <Box sx={{ width: '100%', textAlign: 'center', mb: 2 }}>
          <img
            src={thumbnail || `https://fakeimg.pl/250x250/?text=${title}`}
            alt={title}
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '300px',
              borderRadius: '12px',
              border: `2px solid ${theme.palette.primary.main}`,
              maxWidth: '400px', // Constrain width on larger devices
              margin: 'auto' // Center align
            }}
          />
        </Box>

        {/* Title and Details Section */}
        <Grid container spacing={3} sx={{ mb: 2, textAlign: 'center' }}>
          <Grid item xs={12}>
            <Typography variant='h4' color='textPrimary' sx={{ fontWeight: 'bold' }}>
              {title}
            </Typography>
            <Typography
              variant='body1'
              color='textSecondary'
              sx={{
                fontSize: { xs: '0.9rem' },
                // maxWidth: '800px',
                mb: 1
              }}
            >
              {details}
            </Typography>
            <Chip
              color={
                quizData.approvalState === 'pending'
                  ? 'primary'
                  : quizData.approvalState === 'approved'
                    ? 'success'
                    : quizData.approvalState === 'rejected'
                      ? 'error'
                      : 'info'
              }
              variant='tonal'
              size='small'
              label={quizData.approvalState.toUpperCase()}
            />
          </Grid>
        </Grid>

        {/* Additional Information Section */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant='subtitle1'>
                <strong>Owner:</strong> {owner}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant='subtitle1'>
                <strong>Syllabus:</strong> {syllabus}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant='subtitle1'>
                <strong>Context IDs:</strong> {contextIds}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <ChevronToggleComponent
                heading='Course Links:'
                minimizedSubHeading='Click the chevron to view course links'
              >
                {courseLinks?.length > 0 ? (
                  <Box display='flex' flexDirection='column' gap={2}>
                    {courseLinks.map((link, index) => (
                      <Box key={index} display='flex' flexDirection='column' gap={1} alignItems='flex-start'>
                        <VideoAd url={link?.link || ''} showPause autoPlay={false} />
                        <ImagePopup imageUrl={link?.link || ''} mediaType={link.mediaType} />
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography color='error'>No course links exist.</Typography>
                )}
              </ChevronToggleComponent>
            </Grid>
            <Grid item xs={12}>
              <ChevronToggleComponent heading='Documents:' minimizedSubHeading='Click the chevron to view documents'>
                {documents?.length > 0 ? (
                  documents.map((document, index) => (
                    <Box key={index} display='flex' alignItems='center' gap={2} mb={1}>
                      <Typography variant='body2'>{`Document ${index + 1}: ${document.description}`}</Typography>
                      <Link href={document?.document || ''} target='_blank' rel='noopener noreferrer'>
                        <Typography color='primary'>View Document</Typography>
                      </Link>
                    </Box>
                  ))
                ) : (
                  <Typography color='error'>No documents exist.</Typography>
                )}
              </ChevronToggleComponent>
            </Grid>
            <Grid item xs={12}>
              <Typography variant='subtitle1' sx={{ mb: 2 }}>
                <strong>Tags:</strong>
              </Typography>
              <Box display='flex' gap={1} flexWrap='wrap'>
                {tags.length > 0 ? (
                  tags.map((tag, index) => (
                    <Chip key={index} label={tag} size='small' color='secondary' sx={{ fontSize: '0.9rem' }} />
                  ))
                ) : (
                  <Typography variant='body1' color='textSecondary' sx={{ fontStyle: 'italic', opacity: 0.7 }}>
                    No tags available
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Two Column Layout for Questions */}
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
        {/* Left Column for Dummy Templates */}
        <Box
          sx={{
            flex: '0 0 30%', // Set width for the dummy templates column
            maxWidth: '200px',
            maxHeight: '600px',
            overflowY: 'auto',
            border: '1px solid #ccc',
            padding: 2,
            bgcolor: '#f9f9f9'
          }}
        >
          <Typography variant='h5' sx={{ marginBottom: 2 }}>
            Primary Questions
          </Typography>
          {primaryQuestions.length > 0 ? (
            primaryQuestions.map(question => (
              <Box
                key={question._id}
                onClick={() => handlePrimaryQuestionClick(question._id)}
                sx={{
                  cursor: 'pointer',
                  marginBottom: 2,
                  border: selectedPrimaryQuestionId === question._id ? '2px solid blue' : '2px solid #ccc', // Highlight selected
                  padding: 1,
                  transition: 'background-color 0.3s',
                  '&:hover': {
                    backgroundColor: '#e0e0e0'
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
              </Box>
            ))
          ) : (
            <Typography>No primary questions available.</Typography>
          )}
        </Box>

        {/* Right Column for Real Templates */}
        <Box
          sx={{
            flex: '1', // Take the remaining space
            maxHeight: '600px',
            overflowY: 'auto',
            border: '1px solid #ccc',
            padding: 2
          }}
        >
          {/* Highlight selected primary question template */}
          {selectedPrimaryQuestionId && (
            <>
              <Typography variant='h5' sx={{ marginBottom: 2 }}>
                Selected Primary Question Template
              </Typography>
              <Box
                sx={{
                  border: '2px solid blue', // Highlight border
                  padding: 2,
                  marginBottom: 2,
                  bgcolor: '#e8f0fe' // Light blue background for emphasis
                }}
              >
                {primaryQuestions.map(question => {
                  if (question._id === selectedPrimaryQuestionId) {
                    return (
                      <Box key={question._id}>
                        {/* Language Chip */}
                        <Chip
                          size='small'
                          color={'primary'}
                          label={`${question.language.split('|')[1]}`}
                          sx={{ marginBottom: 1, float: 'right', color: 'white' }}
                        />
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
              </Box>
            </>
          )}

          {/* Heading for Secondary Questions */}
          <Typography variant='h5' sx={{ marginBottom: 2, marginTop: 4 }}>
            Secondary Questions
          </Typography>

          {/* Render secondary questions */}
          {loading.secondaryQuestions && <Loading />}
          {!loading.secondaryQuestions &&
            (secondaryQuestions.length > 0 ? (
              secondaryQuestions.map((question, index) => {
                const chipColors = ['secondary', 'success', 'error', 'warning', 'info', 'primary']
                return (
                  <Box
                    key={question._id}
                    sx={{
                      border: '1px solid #ccc',
                      borderRadius: 1,
                      padding: 2,
                      marginBottom: 2,
                      bgcolor: '#f3f4f6' // Light background for secondary questions
                    }}
                  >
                    {/* Language Chip */}
                    <Chip
                      size='small'
                      color={chipColors[index % chipColors.length]}
                      label={`${question.language.split('|')[1]}`}
                      sx={{ marginBottom: 1, float: 'right', color: 'white' }}
                    />

                    {/* Render the actual template */}
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
              })
            ) : (
              <Typography>No secondary questions available.</Typography>
            ))}
        </Box>
      </Box>

      {/* Edit and Delete Buttons */}
      <Stack
        direction='row'
        justifyContent={'center'}
        gap={2}
        sx={{ marginTop: 6 }}
        style={{ position: 'fixed', bottom: '10px', left: '0', width: '100%' }}
      >
        {quizData.approvalState !== 'rejected' && (
          <Button
            variant='contained'
            color='error'
            component='label'
            style={{ color: 'white' }}
            onClick={() => handleRejectQuizConfirmation()}
          >
            Reject Quiz
          </Button>
        )}
        {quizData.approvalState !== 'pending' && quizData.approvalState !== 'published' && (
          <Button
            variant='contained'
            color='primary'
            component='label'
            style={{ color: 'white' }}
            onClick={() => handleMoveToPendingConfirmation()}
          >
            Move To Pending
          </Button>
        )}
        {quizData.approvalState !== 'approved' && quizData.approvalState !== 'published' && (
          <Button
            variant='contained'
            color='success'
            component='label'
            style={{ color: 'white' }}
            onClick={() => handleApproveQuiz()}
          >
            Approve Quiz
          </Button>
        )}
      </Stack>

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
