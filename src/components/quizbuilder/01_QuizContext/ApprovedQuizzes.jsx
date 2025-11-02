import React, { useState, useEffect } from 'react'
import ImageList from '@mui/material/ImageList'
import ImageListItem from '@mui/material/ImageListItem'
import ImageListItemBar from '@mui/material/ImageListItemBar'
import IconButton from '@mui/material/IconButton'
import {
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  Tooltip,
  useTheme,
  Box,
  Stack,
  Chip,
  Typography
} from '@mui/material'
import FileOpenIcon from '@mui/icons-material/FileOpen'
import UndoIcon from '@mui/icons-material/Undo'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import PublishIcon from '@mui/icons-material/Publish'
import useMediaQuery from '@mui/material/useMediaQuery'
import IconButtonTooltip from '@/components/IconButtonTooltip'
// components
import PrivacySelectFilter from './PrivacySelectFilter'

// utils
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'

import './QuizCardList.css'
import Image from 'mui-image'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'
import Loading from '@/components/Loading'
import { useRouter } from 'next/navigation'
import DeleteConfirmationDialog from '@/components/dialogs/DeleteConfirmationDialog'

export default function ApprovedQuizzes({ isAdmin = false }) {
  const router = useRouter()
  const mdScreenMatches = useMediaQuery('(min-width:768px)') // Adjust breakpoint as needed
  const { data: session, status } = useSession()
  const [approvedQuizzes, setApprovedQuizzes] = useState([])
  const [loading, setLoading] = useState(false)
  const [invalidateQuizzes, setInvalidateQuizzes] = useState(false)
  const [selectedQuizIds, setSelectedQuizIds] = useState([])
  const [movingToDraftQuizId, setMovingToDraftQuizId] = useState(null)
  const [movingToDraftSelectedQuizIds, setMovingToDraftSelectedQuizIds] = useState(null)

  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.only('xs'))
  const isSm = useMediaQuery(theme.breakpoints.only('sm'))
  const isMd = useMediaQuery(theme.breakpoints.only('md'))
  const isLg = useMediaQuery(theme.breakpoints.only('lg'))

  // Calculate columns based on screen size
  const getColumns = () => {
    if (isXs) return 2 // Mobile phones
    if (isSm) return 3 // Small tablets
    if (isMd) return 4 // Tablets
    if (isLg) return 5 // Laptops
    return 6 // Large screens
  }

  async function handleViewQuiz(quiz) {
    router.push(`/myquizzes/view/${quiz._id}`)
  }

  async function getApprovedQuizzes() {
    setLoading(true)
    const result = await RestApi.get(`${API_URLS.v0.USERS_QUIZ}?email=${session?.user?.email}&approvalState=approved`)
    if (result?.status === 'success') {
      // toast.success('Approved quizzes fetched successfully.')
      setLoading(false)
      setApprovedQuizzes(result.result)
    } else {
      // toast.error('Error fetching quizzes: ' + result?.result?.message)
      setLoading(false)
      setApprovedQuizzes([])
    }
  }

  async function handlePublishQuiz(quiz) {
    try {
      const response = await RestApi.put(`${API_URLS.v0.USERS_QUIZ}`, {
        id: quiz._id,
        approvalState: 'published'
      })
      if (response.status === 'success') {
        // toast.success(`Quiz "${quiz.title}" published successfully.`)
        setInvalidateQuizzes(prev => !prev) // Invalidate the quiz list to refresh
      } else {
        // toast.error(response.message)
      }
    } catch (error) {
      // toast.error('An error occurred while publishing the quiz.')
    }
  }

  useEffect(() => {
    getApprovedQuizzes()
  }, [invalidateQuizzes])

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
        ids: selectedQuizIds, // Send the array of IDs
        approvalState: 'published' // Include the approval state
      })

      if (response.status === 'success') {
        // toast.success('Quizzes published successfully.');
        setInvalidateQuizzes(prev => !prev)
      } else {
        // toast.error(response.message);
      }
    } catch (error) {
      // toast.error('An error occurred while publishing quizzes.');
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
        // toast.success('Quiz moved back to drafts successfully.')
        setInvalidateQuizzes(prev => !prev)
      } else {
        // toast.error(response.message)
      }
    } catch (error) {
      // toast.error('An unexpected error occurred while moving the quiz to drafts.')
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

      // Make the API call with the list of selected IDs
      const response = await RestApi.put(`${API_URLS.v0.USERS_QUIZ}`, {
        ids: selectedQuizIds, // Pass the array of IDs
        approvalState: 'draft'
      })

      if (response.status === 'success') {
        // Optionally show a success message
        // toast.success(`${response.message || 'Quizzes moved back to drafts successfully.'}`);
        setInvalidateQuizzes(prev => !prev)
      } else {
        // Optionally show an error message
        // toast.error(response.message);
      }
    } catch (error) {
      // Optionally show an error message
      // toast.error('An unexpected error occurred while moving quizzes to drafts.');
    } finally {
      setSelectedQuizIds([]) // Clear the selected IDs
    }
  }

  const handleMoveSelectedToDraftConfirm = () => {
    setMovingToDraftSelectedQuizIds(selectedQuizIds)
  }

  return (
    <>
      <Grid container rowSpacing={4} justifyContent='center'>
        {/* {approvedQuizzes.length > 0 && (
          <Grid container alignItems='center' justifyContent='space-between'>
            <Grid
              item
              xs={12}
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center'
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    color='primary'
                    indeterminate={selectedQuizIds.length > 0 && selectedQuizIds.length < approvedQuizzes.length}
                    checked={approvedQuizzes.length > 0 && selectedQuizIds.length === approvedQuizzes.length}
                    onChange={handleSelectAllChange} // Move the logic here
                  />
                }
                label='Select All'
                style={{ cursor: 'pointer' }}
              />
            </Grid>
          </Grid>
        )} */}

        {selectedQuizIds.length > 0 && (
          <Grid
            container
            justifyContent='center'
            alignItems='center'
            flexWrap='wrap'
            style={{
              padding: '5px 16px',
              gap: '10px',
              backgroundColor: 'rgba(0,0,0,0.05)', // Subtle light gray background
              borderRadius: '8px' // Smooth, rounded corners
            }}
          >
            <Button
              size='small'
              variant='outlined'
              color='primary'
              startIcon={<PublishIcon />}
              onClick={handlePublishSelected}
              style={{
                padding: '8px 16px',
                fontWeight: 'bold'
              }}
            >
              Publish
            </Button>
            <Button
              size='small'
              variant='outlined'
              color='primary'
              startIcon={<UndoIcon />}
              onClick={handleMoveSelectedToDraftConfirm}
              style={{
                padding: '8px 16px',
                fontWeight: 'bold'
              }}
            >
              Move to Draft
            </Button>
          </Grid>
        )}
        <Grid item xs={12}>
          {loading && <Loading />}
          {!loading && (
            <ImageList className='myImageList' gap={16} cols={getColumns()}>
              {approvedQuizzes.length > 0
                ? approvedQuizzes.map(item => (
                    <ImageListItem
                      key={item.id}
                      sx={{
                        cursor: 'pointer',
                        position: 'relative',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        backdropFilter: 'blur(20px)',
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid rgba(0, 0, 0, 0.06)',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: '0 16px 48px rgba(76, 175, 80, 0.15)',
                          '&::before': {
                            opacity: 0.6
                          }
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          borderRadius: '16px',
                          padding: '1px',
                          background: 'linear-gradient(135deg, #4caf50, #388e3c)',
                          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                          WebkitMaskComposite: 'xor',
                          maskComposite: 'exclude',
                          opacity: 0,
                          transition: 'opacity 0.5s ease'
                        }
                      }}
                      onClick={() => handleViewQuiz(item)}
                    >
                      <Checkbox
                        checked={selectedQuizIds.includes(item._id)}
                        onChange={e => {
                          handleIndividualSelectChange(item._id)
                        }}
                        onClick={e => e.stopPropagation()}
                        sx={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          color: '#ffffff',
                          bgcolor: 'rgba(0, 0, 0, 0.3)',
                          borderRadius: '6px',
                          zIndex: 3,
                          '&:hover': {
                            bgcolor: 'rgba(0, 0, 0, 0.5)'
                          }
                        }}
                      />

                      <Box
                        sx={{
                          position: 'relative',
                          height: '180px',
                          overflow: 'hidden',
                          bgcolor: 'rgba(76, 175, 80, 0.02)'
                        }}
                      >
                        <img
                          src={item.thumbnail || `https://fakeimg.pl/250x250/?text=${item.title}`}
                          alt={item.title}
                          style={{
                            width: '100%',
                            height: '180px',
                            objectFit: 'cover',
                            transition: 'transform 0.6s ease'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.transform = 'scale(1.08)'
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.transform = 'scale(1)'
                          }}
                        />
                        <Chip
                          label='APPROVED'
                          size='small'
                          sx={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            backdropFilter: 'blur(10px)',
                            bgcolor: 'rgba(255, 255, 255, 0.95)',
                            color: '#4caf50',
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            height: 26,
                            letterSpacing: 1,
                            border: '1px solid rgba(76, 175, 80, 0.2)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                          }}
                        />
                      </Box>

                      <Box sx={{ p: 2.5 }}>
                        <Typography
                          variant='h6'
                          sx={{
                            fontWeight: 700,
                            fontSize: '1.05rem',
                            lineHeight: 1.35,
                            color: '#1a1a1a',
                            mb: 1,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            minHeight: 45
                          }}
                        >
                          {item.title}
                        </Typography>
                        <Typography
                          variant='body2'
                          sx={{
                            fontSize: '0.825rem',
                            lineHeight: 1.6,
                            color: '#666',
                            mb: 2,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            minHeight: 42
                          }}
                        >
                          {item.details}
                        </Typography>

                        <Stack direction='row' spacing={0.75} sx={{ mt: 'auto' }}>
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
                              borderRadius: '8px',
                              py: 0.8,
                              fontSize: '0.65rem',
                              borderColor: '#667eea',
                              color: '#667eea',
                              fontWeight: 600,
                              textTransform: 'none',
                              minWidth: 0,
                              '&:hover': {
                                borderColor: '#667eea',
                                bgcolor: 'rgba(102, 126, 234, 0.08)'
                              }
                            }}
                          >
                            View
                          </Button>
                          <Button
                            size='small'
                            variant='contained'
                            startIcon={<PublishIcon fontSize='small' />}
                            onClick={e => {
                              e.stopPropagation()
                              handlePublishQuiz(item)
                            }}
                            sx={{
                              flex: 1,
                              borderRadius: '8px',
                              py: 0.8,
                              fontSize: '0.65rem',
                              bgcolor: '#2196f3 !important',
                              color: 'white !important',
                              fontWeight: 600,
                              textTransform: 'none',
                              minWidth: 0,
                              display: 'flex !important',
                              visibility: 'visible !important',
                              opacity: '1 !important',
                              '&:hover': {
                                bgcolor: '#1976d2 !important'
                              }
                            }}
                          >
                            Publish
                          </Button>
                          <Button
                            size='small'
                            variant='outlined'
                            startIcon={<UndoIcon fontSize='small' />}
                            onClick={e => handleStartMoveToDraft(item, e)}
                            sx={{
                              flex: 1,
                              borderRadius: '8px',
                              py: 0.8,
                              fontSize: '0.65rem',
                              borderColor: '#ff9800',
                              color: '#ff9800',
                              fontWeight: 600,
                              textTransform: 'none',
                              minWidth: 0,
                              '&:hover': {
                                borderColor: '#ff9800',
                                bgcolor: 'rgba(255, 152, 0, 0.08)'
                              }
                            }}
                          >
                            Undo
                          </Button>
                        </Stack>
                      </Box>
                    </ImageListItem>
                  ))
                : 'No Approved Quizzes'}
            </ImageList>
          )}
        </Grid>
      </Grid>
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
    </>
  )
}
