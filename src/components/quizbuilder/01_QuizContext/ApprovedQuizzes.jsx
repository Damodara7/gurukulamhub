import React, { useState, useEffect } from 'react'
import {
  Button,
  Checkbox,
  Grid,
  Tooltip,
  useTheme,
  Box,
  Stack,
  Chip,
  Typography,
  Card,
  CardContent,
  alpha,
  CircularProgress,
  Pagination
} from '@mui/material'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import UndoIcon from '@mui/icons-material/Undo'
import PublishIcon from '@mui/icons-material/Publish'
import LanguageIcon from '@mui/icons-material/Language'
import QuizIcon from '@mui/icons-material/Quiz'
import useMediaQuery from '@mui/material/useMediaQuery'

// utils
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { QUIZ_GRID_PAGE_SIZE, ADMIN_MY_QUIZZES_GRID_PAGE_SIZE } from '@/constants/quizListPagination'
import { normalizeQuizListResult } from '@/utils/quizListApi'

import './QuizCardList.css'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'
import Loading from '@/components/Loading'
import { useRouter } from 'next/navigation'
import DeleteConfirmationDialog from '@/components/dialogs/DeleteConfirmationDialog'

export default function ApprovedQuizzes({ isAdmin = false }) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const pageSize = isAdmin ? ADMIN_MY_QUIZZES_GRID_PAGE_SIZE : QUIZ_GRID_PAGE_SIZE
  const [approvedQuizzes, setApprovedQuizzes] = useState([])
  const [loading, setLoading] = useState(false)
  const [invalidateQuizzes, setInvalidateQuizzes] = useState(false)
  const [selectedQuizIds, setSelectedQuizIds] = useState([])
  const [movingToDraftQuizId, setMovingToDraftQuizId] = useState(null)
  const [movingToDraftSelectedQuizIds, setMovingToDraftSelectedQuizIds] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)

  const theme = useTheme()

  async function handleViewQuiz(quiz) {
    router.push(`/myquizzes/view/${quiz._id}`)
  }

  async function getApprovedQuizzes() {
    setLoading(true)
    const params = new URLSearchParams({
      email: session?.user?.email || '',
      approvalState: 'approved',
      limit: String(pageSize),
      page: String(page)
    })
    const result = await RestApi.get(`${API_URLS.v0.USERS_QUIZ}?${params.toString()}`)
    if (result?.status === 'success') {
      const { items, totalPages: tp } = normalizeQuizListResult(result.result)
      setLoading(false)
      setApprovedQuizzes(items)
      setTotalPages(tp)
    } else {
      setLoading(false)
      setApprovedQuizzes([])
      setTotalPages(0)
    }
  }

  async function handlePublishQuiz(quiz) {
    try {
      const response = await RestApi.put(`${API_URLS.v0.USERS_QUIZ}`, {
        id: quiz._id,
        approvalState: 'published'
      })
      if (response.status === 'success') {
        setInvalidateQuizzes(prev => !prev)
        setPage(1)
      }
    } catch (error) {
      // Handle error
    }
  }

  useEffect(() => {
    getApprovedQuizzes()
  }, [invalidateQuizzes, page])

  const handleSelectAllChange = event => {
    if (event.target.checked) {
      setSelectedQuizIds(approvedQuizzes.map(quiz => quiz._id))
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

  const handlePublishSelected = async () => {
    console.log('Publishing quizzes:', selectedQuizIds)
    try {
      const response = await RestApi.put(`${API_URLS.v0.USERS_QUIZ}`, {
        ids: selectedQuizIds,
        approvalState: 'published'
      })

      if (response.status === 'success') {
        setInvalidateQuizzes(prev => !prev)
        setPage(1)
      }
    } catch (error) {
      // Handle error
    } finally {
      setSelectedQuizIds([])
    }
  }

  function handleStartMoveToDraft(quiz, e) {
    e.stopPropagation()
    setMovingToDraftQuizId(quiz._id)
  }

  async function handleMoveToDraft() {
    try {
      const response = await RestApi.put(`${API_URLS.v0.USERS_QUIZ}`, {
        id: movingToDraftQuizId,
        approvalState: 'draft'
      })
      if (response.status === 'success') {
        setInvalidateQuizzes(prev => !prev)
        setPage(1)
      }
    } catch (error) {
      // Handle error
    } finally {
      setMovingToDraftQuizId(null)
    }
  }

  function handleCancelMoveToDraft() {
    setMovingToDraftQuizId(null)
    setMovingToDraftSelectedQuizIds(null)
  }

  const handleMoveSelectedToDraft = async () => {
    setMovingToDraftSelectedQuizIds(null)
    try {
      console.log('Moving to draft quizzes:', selectedQuizIds)

      const response = await RestApi.put(`${API_URLS.v0.USERS_QUIZ}`, {
        ids: selectedQuizIds,
        approvalState: 'draft'
      })

      if (response.status === 'success') {
        setInvalidateQuizzes(prev => !prev)
        setPage(1)
      }
    } catch (error) {
      // Handle error
    } finally {
      setSelectedQuizIds([])
    }
  }

  const handleMoveSelectedToDraftConfirm = () => {
    setMovingToDraftSelectedQuizIds(selectedQuizIds)
  }

  return (
    <Box>
      {selectedQuizIds.length > 0 && (
        <Box
          sx={{
            mb: 3,
            p: 2,
            bgcolor: alpha(theme.palette.success.main, 0.08),
            borderRadius: 2,
            border: '1px solid',
            borderColor: alpha(theme.palette.success.main, 0.2),
            display: 'flex',
            justifyContent: 'center',
            gap: 2,
            flexWrap: 'wrap'
          }}
        >
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
          <Button
            size='small'
            variant='outlined'
            startIcon={<UndoIcon />}
            onClick={handleMoveSelectedToDraftConfirm}
            sx={{
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Move to Draft ({selectedQuizIds.length})
          </Button>
        </Box>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
          <CircularProgress size={48} thickness={4} />
        </Box>
      ) : approvedQuizzes.length > 0 ? (
        <>
          <Grid container spacing={3}>
          {approvedQuizzes.map(item => {
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

                    {/* Approved Badge */}
                    <Chip
                      label='APPROVED'
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
                      <Tooltip title='Publish Quiz' arrow>
                        <Button
                          size='small'
                          variant='outlined'
                          color='info'
                          startIcon={<PublishIcon fontSize='small' />}
                          onClick={e => {
                            e.stopPropagation()
                            handlePublishQuiz(item)
                          }}
                          sx={{
                            flex: 1,
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.7rem'
                          }}
                        >
                          Publish
                        </Button>
                      </Tooltip>
                      <Tooltip title='Move to Drafts' arrow>
                        <Button
                          size='small'
                          variant='outlined'
                          color='warning'
                          onClick={e => handleStartMoveToDraft(item, e)}
                          sx={{
                            minWidth: 'auto',
                            px: 1.5
                          }}
                        >
                          <UndoIcon fontSize='small' />
                        </Button>
                      </Tooltip>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
          </Grid>
          {totalPages > 1 ? (
            <Stack alignItems='center' sx={{ pt: 3, pb: 1 }}>
              <Pagination
                color='primary'
                count={totalPages}
                page={page}
                disabled={loading}
                onChange={(_, value) => setPage(value)}
                showFirstButton
                showLastButton
              />
            </Stack>
          ) : null}
        </>
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
            No Approved Quizzes
          </Typography>
          <Typography variant='body2' color='text.secondary' textAlign='center' sx={{ maxWidth: '400px' }}>
            You don't have any approved quizzes yet.
          </Typography>
        </Box>
      )}

      {(movingToDraftQuizId || (movingToDraftSelectedQuizIds && movingToDraftSelectedQuizIds?.length > 0)) && (
        <DeleteConfirmationDialog
          handleClose={handleCancelMoveToDraft}
          open={movingToDraftQuizId || movingToDraftSelectedQuizIds}
          handleConfirm={movingToDraftSelectedQuizIds?.length > 0 ? handleMoveSelectedToDraft : handleMoveToDraft}
          confirmText='Proceed'
          closeText='Cancel'
          title='Are you sure?'
          description={
            movingToDraftSelectedQuizIds
              ? `This will move the ${movingToDraftSelectedQuizIds.length} ${
                  movingToDraftSelectedQuizIds.length > 1 ? 'quizzes' : 'quiz'
                } back to drafts. Are you sure you want to proceed?`
              : 'This will move the quiz back to drafts. Are you sure you want to proceed?'
          }
        />
      )}
    </Box>
  )
}
