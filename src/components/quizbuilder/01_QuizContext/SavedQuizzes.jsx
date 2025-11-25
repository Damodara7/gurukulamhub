import React, { useEffect, useState } from 'react'
import {
  Button,
  Checkbox,
  Grid,
  Tooltip,
  Typography,
  useTheme,
  Box,
  Stack,
  Chip,
  Card,
  CardContent,
  alpha,
  CircularProgress
} from '@mui/material'
import useMediaQuery from '@mui/material/useMediaQuery'

// components
import PrivacySelectFilter from './PrivacySelectFilter'

import './QuizCardList.css'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { toast } from 'react-toastify'
import DeleteConfirmationDialog from '@/components/dialogs/DeleteConfirmationDialog'
import { useSession } from 'next-auth/react'

// MUI icons
import DeleteIcon from '@mui/icons-material/Delete'
import SendIcon from '@mui/icons-material/Send'
import PublishIcon from '@mui/icons-material/Publish'
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import LanguageIcon from '@mui/icons-material/Language'
import QuizIcon from '@mui/icons-material/Quiz'

import { useRouter } from 'next/navigation'
import Loading from '@/components/Loading'

export default function SavedQuizzes({ isAdmin = false }) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [myQuizzes, setMyQuizzes] = useState([])
  const [privacyType, setPrivacyType] = useState('PUBLIC')
  const [loading, setLoading] = useState(false)
  const [invalidateQuizzes, setInvalidateQuizzes] = useState(false)
  const [selectedQuizIds, setSelectedQuizIds] = useState([])
  const [deletingQuizId, setDeletingQuizId] = useState(null)
  const [deletingSelectedQuizIds, setDeletingSelectedQuizIds] = useState(null)
  const [sendingSelectedQuizIdsForApproval, setSendingSelectedQuizIdsForApproval] = useState(null)

  const theme = useTheme()

  function handleBuildQuiz(quiz) {
    router.push(`/${isAdmin ? 'management/quizzes' : 'myquizzes'}/builder/${quiz._id}`)
  }

  async function getQuizData() {
    setLoading(true)
    const result = await RestApi.get(
      `${API_URLS.v0.USERS_QUIZ}?email=${session?.user?.email}&approvalState=saved&privacyFilter=${privacyType}`
    )
    if (result?.status === 'success') {
      console.log('Quizzes Fetched result', result)
      setLoading(false)
      setMyQuizzes(result.result)
    } else {
      console.log('Error Fetching quizes:', result)
      setLoading(false)
      setMyQuizzes([])
    }
  }

  useEffect(() => {
    getQuizData()
  }, [privacyType, invalidateQuizzes])

  function handlePrivacyTypeChange(newPrivacyType) {
    setPrivacyType(newPrivacyType)
  }

  function handleStartDeleteQuiz(quiz, e) {
    e.stopPropagation()
    setDeletingQuizId(quiz._id)
    console.log('Deleting quiz:', quiz)
  }

  async function handleDeleteQuiz() {
    console.log('Deleting quiz confirmed')
    try {
      const response = await RestApi.del(`${API_URLS.v0.USERS_QUIZ}?id=${deletingQuizId}`)
      if (response.status === 'success') {
        console.log('Quiz deleted successfully')
        setInvalidateQuizzes(prev => !prev)
      } else {
        console.log('Error:', response.message)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setDeletingQuizId(null)
    }
  }

  function handleCancelDeleteQuiz() {
    setDeletingQuizId(null)
  }

  async function handleSendToApproval(quiz) {
    try {
      const response = await RestApi.put(`${API_URLS.v0.USERS_QUIZ}`, {
        id: quiz._id,
        approvalState: 'pending'
      })
      if (response.status === 'success') {
        setInvalidateQuizzes(prev => !prev)
      }
    } catch (error) {
      // Handle error
    }
  }

  const handleSelectAllChange = event => {
    if (event.target.checked) {
      setSelectedQuizIds(myQuizzes.map(quiz => quiz._id))
    } else {
      setSelectedQuizIds([])
    }
  }

  const handleIndividualSelectChange = quizId => {
    setSelectedQuizIds(prev => {
      if (prev.includes(quizId)) {
        return prev.filter(id => id !== quizId)
      } else {
        return [...prev, quizId]
      }
    })
  }

  async function handlePublishPrivateQuiz(quiz) {
    try {
      const response = await RestApi.put(`${API_URLS.v0.USERS_QUIZ}`, {
        _id: quiz._id,
        approvalState: 'published'
      })
      if (response.status === 'success') {
        setInvalidateQuizzes(prev => !prev)
      }
    } catch (error) {
      // Handle error
    }
  }

  async function handleViewQuiz(quiz) {
    router.push(`/${isAdmin ? 'management/quizzes' : 'myquizzes'}/view/${quiz._id}`)
  }

  const handleSendSelectedToApprovalConfirm = () => {
    setSendingSelectedQuizIdsForApproval(selectedQuizIds)
  }

  const handleSendSelectedToApproval = async () => {
    console.log('Sending quizzes to approval:', selectedQuizIds)
    try {
      const response = await RestApi.put(`${API_URLS.v0.USERS_QUIZ}`, {
        ids: selectedQuizIds,
        approvalState: 'pending'
      })

      if (response.status === 'success') {
        setInvalidateQuizzes(prev => !prev)
      }
    } catch (error) {
      // Handle error
    } finally {
      setSendingSelectedQuizIdsForApproval(null)
      setSelectedQuizIds([])
    }
  }

  const handleCancelSendToApprovalSelected = () => {
    setSendingSelectedQuizIdsForApproval(null)
  }

  const handleDeleteSelectedConfirm = () => {
    setDeletingSelectedQuizIds(selectedQuizIds)
  }

  const handleDeleteSelected = async () => {
    console.log('Deleting quizzes:', selectedQuizIds)

    try {
      const response = await RestApi.del(`${API_URLS.v0.USERS_QUIZ}`, { ids: selectedQuizIds })

      if (response.status === 'success') {
        console.log('Quizzes deleted successfully')
        setInvalidateQuizzes(prev => !prev)
        setSelectedQuizIds([])
      } else {
        console.log('Error:', response.message)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setDeletingSelectedQuizIds(null)
    }
  }

  const handleCancelDeleteSelected = () => {
    setDeletingSelectedQuizIds(null)
  }

  async function handlePublish(quiz) {
    try {
      const response = await RestApi.put(`${API_URLS.v0.USERS_QUIZ}`, {
        id: quiz._id,
        approvalState: 'published'
      })
      if (response.status === 'success') {
        setInvalidateQuizzes(prev => !prev)
      }
    } catch (error) {
      // Handle error
    }
  }

  const handlePublishSelected = async () => {
    console.log('Publishing quizzes:', selectedQuizIds)
    try {
      const response = await RestApi.put(`${API_URLS.v0.USERS_QUIZ}`, {
        ids: selectedQuizIds,
        approvalState: 'published'
      })

      if (response.status === 'success') {
        setInvalidateQuizzes(prev => !prev)
      }
    } catch (error) {
      // Handle error
    } finally {
      setSelectedQuizIds([])
    }
  }

  return (
    <Box>
      {selectedQuizIds.length > 0 && (
        <Box
          sx={{
            mb: 3,
            p: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            borderRadius: 2,
            border: '1px solid',
            borderColor: alpha(theme.palette.primary.main, 0.2),
            display: 'flex',
            justifyContent: 'center',
            gap: 2,
            flexWrap: 'wrap'
          }}
        >
          {!isAdmin && (
            <Button
              size='small'
              variant='contained'
              component='label'
              startIcon={<SendIcon />}
              onClick={handleSendSelectedToApprovalConfirm}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                bgcolor: 'success.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'success.dark'
                }
              }}
            >
              Send to Approval ({selectedQuizIds.length})
            </Button>
          )}
          {isAdmin && (
            <Button
              size='small'
              variant='contained'
              component='label'
              startIcon={<PublishIcon />}
              onClick={handlePublishSelected}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                bgcolor: 'info.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'info.dark'
                }
              }}
            >
              Publish ({selectedQuizIds.length})
            </Button>
          )}
          <Button
            size='small'
            variant='outlined'
            color='error'
            startIcon={<DeleteIcon />}
            onClick={handleDeleteSelectedConfirm}
            sx={{
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Delete ({selectedQuizIds.length})
          </Button>
        </Box>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
          <Stack spacing={2} alignItems='center'>
            <CircularProgress size={48} />
            <Typography variant='body1' color='text.secondary' fontWeight={500}>
              Loading quizzes...
            </Typography>
          </Stack>
        </Box>
      ) : myQuizzes.length > 0 ? (
        <Grid container spacing={3}>
          {myQuizzes.map(item => {
            const thumbnail =
              item.thumbnail?.length > 0
                ? item.thumbnail
                : `https://fakeimg.pl/400x250/?text=${encodeURIComponent(item.title || 'Quiz')}`

            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item._id || item.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 2,
                    overflow: 'hidden',
                    bgcolor: theme.palette.background.paper,
                    border: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.12 : 0.08)}`,
                    boxShadow:
                      theme.palette.mode === 'dark'
                        ? `0 2px 12px ${alpha(theme.palette.common.black, 0.3)}`
                        : '0 2px 12px rgba(0,0,0,0.04)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.info.main})`,
                      transform: 'scaleX(0)',
                      transformOrigin: 'left',
                      transition: 'transform 0.3s ease',
                      zIndex: 1
                    },
                    '&:hover': {
                      transform: { xs: 'none', sm: 'translateY(-8px)' },
                      borderColor: theme.palette.success.main,
                      boxShadow:
                        theme.palette.mode === 'dark'
                          ? `0 12px 40px ${alpha(theme.palette.success.main, 0.3)}`
                          : `0 12px 40px ${alpha(theme.palette.success.main, 0.15)}`,
                      '&::before': {
                        transform: 'scaleX(1)'
                      },
                      '& .quiz-image': {
                        transform: { xs: 'none', sm: 'scale(1.08)' }
                      }
                    }
                  }}
                  onClick={() => handleViewQuiz(item)}
                >
                  {/* Checkbox */}
                  <Checkbox
                    checked={selectedQuizIds.includes(item._id)}
                    onChange={() => handleIndividualSelectChange(item._id)}
                    onClick={e => e.stopPropagation()}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      zIndex: 2,
                      bgcolor:
                        theme.palette.mode === 'dark'
                          ? alpha(theme.palette.background.paper, 0.9)
                          : 'rgba(255, 255, 255, 0.9)',
                      borderRadius: 1,
                      '&:hover': {
                        bgcolor: theme.palette.background.paper
                      }
                    }}
                  />

                  {/* Thumbnail */}
                  <Box
                    sx={{
                      position: 'relative',
                      overflow: 'hidden',
                      height: 180,
                      bgcolor: alpha(theme.palette.success.main, 0.08)
                    }}
                  >
                    <Box
                      component='img'
                      className='quiz-image'
                      src={thumbnail}
                      alt={item.title}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.4s ease'
                      }}
                      onError={e => {
                        e.target.src = `https://fakeimg.pl/400x250/?text=${encodeURIComponent(item.title || 'Quiz')}`
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `linear-gradient(180deg, transparent 0%, ${alpha(
                          theme.palette.common.black,
                          theme.palette.mode === 'dark' ? 0.5 : 0.3
                        )} 100%)`
                      }}
                    />

                    {/* Saved Badge */}
                    <Chip
                      label='SAVED'
                      size='small'
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        bgcolor: alpha(theme.palette.success.main, 0.9),
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        boxShadow: `0 2px 8px ${alpha(
                          theme.palette.common.black,
                          theme.palette.mode === 'dark' ? 0.4 : 0.2
                        )}`
                      }}
                    />
                  </Box>

                  {/* Card Content */}
                  <CardContent
                    sx={{
                      flexGrow: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      p: 2.5,
                      gap: 1.5
                    }}
                  >
                    {/* Title */}
                    <Typography
                      variant='h6'
                      fontWeight={700}
                      sx={{
                        fontSize: '1.1rem',
                        lineHeight: 1.3,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        minHeight: 52,
                        color: 'text.primary'
                      }}
                    >
                      {item.title || 'Untitled Quiz'}
                    </Typography>

                    {/* Details */}
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.6,
                        fontSize: '0.875rem',
                        minHeight: 40,
                        flexGrow: 1
                      }}
                    >
                      {item.details || 'No description available'}
                    </Typography>

                    {/* Footer Info */}
                    <Stack
                      direction='row'
                      alignItems='center'
                      spacing={1.5}
                      sx={{
                        pt: 1.5,
                        borderTop: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      {item.language && (
                        <Stack direction='row' alignItems='center' spacing={0.75}>
                          <Box
                            sx={{
                              width: 28,
                              height: 28,
                              borderRadius: 1,
                              bgcolor: alpha(theme.palette.success.main, 0.1),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <LanguageIcon sx={{ fontSize: 16, color: 'success.main' }} />
                          </Box>
                          <Typography variant='caption' fontWeight={600} sx={{ fontSize: '0.75rem' }}>
                            {item.language?.name || 'Unknown'}
                          </Typography>
                        </Stack>
                      )}
                    </Stack>

                    {/* Action Buttons */}
                    <Stack direction='row' spacing={1} sx={{ mt: 1 }}>
                      <Button
                        size='small'
                        variant='outlined'
                        startIcon={<VisibilityOutlinedIcon fontSize='small' />}
                        onClick={e => {
                          e.stopPropagation()
                          handleViewQuiz(item)
                        }}
                        sx={{
                          flex: 1,
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: '0.7rem'
                        }}
                      >
                        View
                      </Button>
                      <Button
                        size='small'
                        variant='contained'
                        component='label'
                        startIcon={<BuildOutlinedIcon fontSize='small' />}
                        onClick={e => {
                          e.stopPropagation()
                          handleBuildQuiz(item)
                        }}
                        sx={{
                          flex: 1,
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          color: 'white'
                        }}
                      >
                        Build
                      </Button>
                      {!isAdmin && (
                        <Tooltip title='Send for Approval' arrow>
                          <Button
                            size='small'
                            variant='outlined'
                            color='success'
                            onClick={e => {
                              e.stopPropagation()
                              handleSendToApproval(item)
                            }}
                            sx={{
                              minWidth: 'auto',
                              px: 1.5
                            }}
                          >
                            <SendIcon fontSize='small' />
                          </Button>
                        </Tooltip>
                      )}
                      {isAdmin && (
                        <Tooltip title='Publish Quiz' arrow>
                          <Button
                            size='small'
                            variant='outlined'
                            color='info'
                            onClick={e => {
                              e.stopPropagation()
                              handlePublish(item)
                            }}
                            sx={{
                              minWidth: 'auto',
                              px: 1.5
                            }}
                          >
                            <PublishIcon fontSize='small' />
                          </Button>
                        </Tooltip>
                      )}
                      <Tooltip title='Delete Quiz' arrow>
                        <Button
                          size='small'
                          variant='outlined'
                          color='error'
                          onClick={e => {
                            handleStartDeleteQuiz(item, e)
                          }}
                          sx={{
                            minWidth: 'auto',
                            px: 1.5
                          }}
                        >
                          <DeleteIcon fontSize='small' />
                        </Button>
                      </Tooltip>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            bgcolor: theme.palette.background.paper,
            borderRadius: 2,
            border: '1px dashed',
            borderColor: 'divider',
            p: 8
          }}
        >
          <QuizIcon
            sx={{
              fontSize: 80,
              color: 'text.secondary',
              mb: 3,
              opacity: 0.5
            }}
          />
          <Typography variant='h6' color='text.secondary' fontWeight={600} gutterBottom>
            No Saved Quizzes Found
          </Typography>
          <Typography variant='body2' color='text.secondary' textAlign='center' sx={{ maxWidth: '400px' }}>
            You don't have any saved quizzes yet. Save a quiz to see it here!
          </Typography>
        </Box>
      )}

      {deletingQuizId && (
        <DeleteConfirmationDialog
          handleClose={handleCancelDeleteQuiz}
          open={deletingQuizId}
          handleConfirm={handleDeleteQuiz}
          title='Are you sure?'
          description='This action cannot be undone. Are you sure you want to proceed?'
        />
      )}
      {deletingSelectedQuizIds && deletingSelectedQuizIds?.length > 0 && (
        <DeleteConfirmationDialog
          handleClose={handleCancelDeleteSelected}
          open={deletingSelectedQuizIds}
          handleConfirm={handleDeleteSelected}
          confirmText='Delete'
          closeText='Cancel'
          title='Are you sure?'
          description={`This will delete the ${deletingSelectedQuizIds.length} ${
            deletingSelectedQuizIds.length > 1 ? 'quizzes' : 'quiz'
          }. Are you sure you want to proceed?`}
        />
      )}
      {sendingSelectedQuizIdsForApproval && sendingSelectedQuizIdsForApproval?.length > 0 && (
        <DeleteConfirmationDialog
          handleClose={handleCancelSendToApprovalSelected}
          open={sendingSelectedQuizIdsForApproval}
          handleConfirm={handleSendSelectedToApproval}
          confirmText='Send'
          closeText='Cancel'
          title='Are you sure?'
          description={`This will send the ${sendingSelectedQuizIdsForApproval.length} ${
            sendingSelectedQuizIdsForApproval.length > 1 ? 'quizzes' : 'quiz'
          } for approval. Are you sure you want to proceed?`}
        />
      )}
    </Box>
  )
}
