import React, { useState, useEffect } from 'react'
import ImageList from '@mui/material/ImageList'
import ImageListItem from '@mui/material/ImageListItem'
import ImageListItemBar from '@mui/material/ImageListItemBar'
import IconButton from '@mui/material/IconButton'
import { Button, Checkbox, CircularProgress, FormControlLabel, Grid, Tooltip, useTheme } from '@mui/material'
import FileOpenIcon from '@mui/icons-material/FileOpen'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import RestoreIcon from '@mui/icons-material/Restore'
import DeleteIcon from '@mui/icons-material/Delete'
import UndoIcon from '@mui/icons-material/Undo'
import useMediaQuery from '@mui/material/useMediaQuery'

// utils
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'

import './QuizCardList.css'
import Image from 'mui-image'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'
import Loading from '@/components/Loading'
import { useRouter } from 'next/navigation'
import IconButtonTooltip from '@/components/IconButtonTooltip'
import DeleteConfirmationDialog from '@/components/dialogs/DeleteConfirmationDialog'

export default function RejectedQuizzes({}) {
  const router = useRouter()
  const mdScreenMatches = useMediaQuery('(min-width:768px)') // Adjust breakpoint as needed
  const { data: session, status } = useSession()
  const [rejectedQuizzes, setRejectedQuizzes] = useState([])
  const [loading, setLoading] = useState(false)
  const [invalidateQuizzes, setInvalidateQuizzes] = useState(false)
  const [selectedQuizIds, setSelectedQuizIds] = useState([])
  const [deletingQuizId, setDeletingQuizId] = useState(null)
  const [deletingSelectedQuizIds, setDeletingSelectedQuizIds] = useState(null)

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

  async function getRejectedQuizzes() {
    setLoading(true)
    const result = await RestApi.get(`${API_URLS.v0.USERS_QUIZ}?email=${session?.user?.email}&approvalState=rejected`)
    if (result?.status === 'success') {
      // toast.success('Rejected quizzes fetched successfully.')
      setLoading(false)
      setRejectedQuizzes(result.result)
    } else {
      // toast.error('Error fetching quizzes: ' + result?.result?.message)
      setLoading(false)
      setRejectedQuizzes([])
    }
  }

  async function handleMoveToDrafts(quiz) {
    try {
      const response = await RestApi.put(`${API_URLS.v0.USERS_QUIZ}`, {
        id: quiz._id,
        approvalState: 'draft'
      })
      if (response.status === 'success') {
        // toast.success(`Quiz "${quiz.title}" moved to Drafts successfully.`)
        setInvalidateQuizzes(prev => !prev) // Invalidate the quiz list to refresh
      } else {
        // toast.error(response.message)
      }
    } catch (error) {
      // toast.error('An error occurred while moving the quiz to drafts.')
    }
  }

  const handleSelectAllChange = event => {
    if (event.target.checked) {
      setSelectedQuizIds(rejectedQuizzes.map(quiz => quiz._id))
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

  function handleStartDeleteQuiz(quiz, e) {
    e.stopPropagation()
    setDeletingQuizId(quiz._id)
    console.log('Deleting quiz:', quiz)
  }

  const handleMoveSelectedToDraft = async () => {
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

  async function handleDeleteQuiz() {
    console.log('Deleting quiz confirmed')
    try {
      const response = await RestApi.del(`${API_URLS.v0.USERS_QUIZ}?id=${deletingQuizId}`)
      if (response.status === 'success') {
        console.log('Quiz deleted successfully')
        setInvalidateQuizzes(prev => !prev)
        // toast.success(response.message || 'Quiz deleted successfully.')
      } else {
        console.log('Error:', response.message)
        // toast.error(response.message)
      }
    } catch (error) {
      console.error('Error:', error)
      // toast.error('An unexpected error occurred while deleting the quiz.')
    } finally {
      setDeletingQuizId(null)
    }
  }

  function handleCancelDeleteQuiz() {
    setDeletingQuizId(null)
  }

  const handleDeleteSelectedConfirm = () => {
    setDeletingSelectedQuizIds(selectedQuizIds)
  }

  const handleDeleteSelected = async () => {
    console.log('Deleting quizzes:', selectedQuizIds)
    console.log('Deleting selected quiz ids:', selectedQuizIds)

    try {
      const response = await RestApi.del(
        `${API_URLS.v0.USERS_QUIZ}`,
        { ids: selectedQuizIds } // Send selectedQuizIds in the body
      )

      if (response.status === 'success') {
        console.log('Quizzes deleted successfully')
        setInvalidateQuizzes(prev => !prev) // Invalidate cache to refresh the quiz list
        setSelectedQuizIds([]) // Clear selected quiz IDs
        // toast.success(response.message || 'Quizzes deleted successfully.');
      } else {
        console.log('Error:', response.message)
        // toast.error(response.message);
      }
    } catch (error) {
      console.error('Error:', error)
      // toast.error('An unexpected error occurred while deleting the quizzes.');
    } finally {
      setDeletingSelectedQuizIds(null) // Reset deletion state
    }
  }

  const handleCancelDeleteSelected = () => {
    setDeletingSelectedQuizIds(null)
  }

  useEffect(() => {
    getRejectedQuizzes()
  }, [invalidateQuizzes])

  return (
    <>
      <Grid container rowSpacing={4} justifyContent='center'>
        {/* {rejectedQuizzes.length > 0 && (
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
                    indeterminate={selectedQuizIds.length > 0 && selectedQuizIds.length < rejectedQuizzes.length}
                    checked={rejectedQuizzes.length > 0 && selectedQuizIds.length === rejectedQuizzes.length}
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
              startIcon={<UndoIcon />}
              onClick={handleMoveSelectedToDraft}
              style={{
                padding: '8px 16px',
                fontWeight: 'bold'
              }}
            >
              Move to Draft
            </Button>
            <Button
              size='small'
              variant='outlined'
              color='error'
              startIcon={<DeleteIcon />}
              onClick={handleDeleteSelectedConfirm}
              style={{
                padding: '8px 16px',
                fontWeight: 'bold'
              }}
            >
              Delete
            </Button>
          </Grid>
        )}
        <Grid item xs={12}>
          {loading && <Loading />}
          {!loading && (
            <ImageList className='myImageList' gap={16} cols={getColumns()}>
              {rejectedQuizzes.length > 0
                ? rejectedQuizzes.map(item => (
                    <ImageListItem
                      key={item.id}
                      style={{
                        minHeight: '248px',
                        padding: '0',
                        alignContent: 'center',
                        alignItems: 'center',
                        position: 'relative',
                        cursor: 'pointer',
                        border: '1px solid gray'
                      }}
                      onClick={() => handleViewQuiz(item)}
                    >
                      {/* Checkbox positioned in the top-left corner */}
                      <Checkbox
                        checked={selectedQuizIds.includes(item._id)}
                        onChange={e => {
                          handleIndividualSelectChange(item._id)
                        }}
                        onClick={e => e.stopPropagation()}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          color: '#ffffff', // Change checkbox color for better contrast
                          zIndex: 2 // Ensures the checkbox is visible over the image
                        }}
                      />
                      <Image
                        src={`${item.thumbnail || 'https://fakeimg.pl/250x250/?text=' + item.title}`}
                        alt={item.title}
                        sx={{ maxHeight: '300px', maxWidth: '300px' }}
                        fit='fill'
                      />

                      <ImageListItemBar
                        sx={{
                          background: 'rgba(0, 0, 0, 0.7)', // Darker background for better visibility of text and icons
                          display: 'flex',
                          flexDirection: 'column', // Stack items vertically
                          alignItems: 'stretch', // Align items to the left
                          padding: 0,
                          '& .MuiImageListItemBar-titleWrap': {
                            marginBottom: '2px', // Space between title/details and the buttons
                            padding: '1px 4px'
                          },
                          '& .MuiImageListItemBar-title': {
                            fontSize: '14px', // Font size for title
                            color: '#fff', // White title color
                            marginBottom: '2px'
                          },
                          '& .MuiImageListItemBar-subtitle': {
                            fontSize: '12px', // Font size for subtitle
                            color: '#ccc', // Lighter color for subtitle/details
                            marginTop: '0px'
                          }
                        }}
                        title={
                          <div
                            style={{
                              fontSize: '14px',
                              color: '#fff',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {item.title}
                          </div>
                        }
                        subtitle={
                          <div
                            style={{
                              fontSize: '12px',
                              color: '#ccc',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {item.details}
                          </div>
                        }
                        actionIcon={
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-around',
                              alignItems: 'center',
                              background: 'rgba(255, 255, 255, 0.1)', // Background for button container
                              borderRadius: '4px',
                              padding: '1px',
                              alignSelf: 'stretch',
                              width: '100%'
                            }}
                          >
                              <IconButtonTooltip title='View'
                                sx={{ color: 'white' }}
                                aria-label={`view quiz ${item.title}`}
                                onClick={e => {
                                  e.stopPropagation()
                                  handleViewQuiz(item)
                                }}
                              >
                                <VisibilityOutlinedIcon />
                              </IconButtonTooltip>
                              <IconButtonTooltip title='Move to drafts'
                                sx={{ color: 'white' }}
                                aria-label={`move to drafts ${item.title}`}
                                onClick={e => {
                                  e.stopPropagation()
                                  handleMoveToDrafts(item)
                                }}
                              >
                                <UndoIcon />
                              </IconButtonTooltip>
                              <IconButtonTooltip title='Delete'
                                sx={{ color: 'red' }} // Red icon color for delete button
                                aria-label={`delete quiz ${item.owner}`}
                                onClick={e => {
                                  handleStartDeleteQuiz(item, e)
                                }}
                              >
                                <DeleteIcon />
                              </IconButtonTooltip>
                          </div>
                        }
                      />
                    </ImageListItem>
                  ))
                : 'No Rejected Quizzes'}
            </ImageList>
          )}
        </Grid>
      </Grid>
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
    </>
  )
}
