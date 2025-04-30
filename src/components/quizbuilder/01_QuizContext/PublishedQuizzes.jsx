import React, { useState, useEffect } from 'react'
import ImageList from '@mui/material/ImageList'
import ImageListItem from '@mui/material/ImageListItem'
import ImageListItemBar from '@mui/material/ImageListItemBar'
import ListSubheader from '@mui/material/ListSubheader'
import IconButton from '@mui/material/IconButton'
import InfoIcon from '@mui/icons-material/Info'
import { Button, Checkbox, FormControlLabel, Grid, Tooltip, Typography, useTheme } from '@mui/material'
import FileOpenIcon from '@mui/icons-material/FileOpen'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import DeleteIcon from '@mui/icons-material/Delete'
import UndoIcon from '@mui/icons-material/Undo'
import YouTubeIcon from '@mui/icons-material/YouTube'
import useMediaQuery from '@mui/material/useMediaQuery'

// components
import PrivacySelectFilter from './PrivacySelectFilter'
import DeleteConfirmationDialog from '@/components/dialogs/DeleteConfirmationDialog'
import IconButtonTooltip from '@/components/IconButtonTooltip'

// utils
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'

import './QuizCardList.css'
//import Image from 'next/image';
import Image from 'mui-image'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'
import Loading from '@/components/Loading'
import { useRouter } from 'next/navigation'

export default function PublishedQuizzes({}) {
  const router = useRouter()
  const mdScreenMatches = useMediaQuery('(min-width:768px)') // Adjust breakpoint as needed
  const { data: session, status } = useSession()
  const [publishedQuizzes, setPublishedQuizzes] = useState([])
  const [movingToDraftQuizId, setMovingToDraftQuizId] = useState(null)
  const [movingToDraftSelectedQuizIds, setMovingToDraftSelectedQuizIds] = useState(null)
  const [loading, setLoading] = useState(false)
  const [invalidateQuizzes, setInvalidateQuizzes] = useState(false)
  const [privacyType, setPrivacyType] = useState('PUBLIC')
  const [selectedQuizIds, setSelectedQuizIds] = useState([])

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

  function handlePrivacyTypeChange(privacyType) {
    setPrivacyType(privacyType)
  }

  async function handleViewQuiz(quiz) {
    router.push(`/myquizzes/view/${quiz._id}`)
  }

  async function getPublishedQuizzes() {
    setLoading(true)
    const result = await RestApi.get(
      `${API_URLS.v0.USERS_QUIZ}?email=${session?.user?.email}&approvalState=published&privacyFilter=${privacyType}`
    )
    if (result?.status === 'success') {
      // toast.success('Published quizzes fetched successfully.')
      setLoading(false)
      setPublishedQuizzes(result.result)
    } else {
      // toast.error('Error fetching quizzes: ' + result?.result?.message)
      setLoading(false)
      setPublishedQuizzes([])
    }
  }

  useEffect(() => {
    getPublishedQuizzes()
  }, [privacyType, invalidateQuizzes])

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

  const handleSelectAllChange = event => {
    if (event.target.checked) {
      setSelectedQuizIds(publishedQuizzes.map(quiz => quiz._id))
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
      <Grid container rowSpacing={2} justifyContent='center'>
        {publishedQuizzes.length > 0 && (
          <Grid container alignItems='center' justifyContent='space-between'>
            <Grid
              item
              xs={7}
              sm={4}
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0px', // Adds space between the label and the filter
                padding: '8px 16px', // Adds padding around the filter area
                borderRadius: '8px' // Rounded corners for a modern look
              }}
            >
              <Typography
                variant='h6'
                style={{
                  fontWeight: '500',
                  color: '#333', // Darker text color for better contrast
                  marginRight: '8px' // Adds a bit of space between the label and select
                }}
              >
                Filter:
              </Typography>
              <PrivacySelectFilter onChange={handlePrivacyTypeChange} />
            </Grid>

            <Grid
              item
              xs={5}
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
                    indeterminate={selectedQuizIds.length > 0 && selectedQuizIds.length < publishedQuizzes.length}
                    checked={publishedQuizzes.length > 0 && selectedQuizIds.length === publishedQuizzes.length}
                    onChange={handleSelectAllChange} // Move the logic here
                  />
                }
                label='Select All'
                style={{ cursor: 'pointer' }}
              />
            </Grid>
          </Grid>
        )}
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
              {publishedQuizzes.length > 0
                ? publishedQuizzes.map(item => (
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
                                onClick={e => handleStartMoveToDraft(item, e)}
                              >
                                <UndoIcon />
                              </IconButtonTooltip>
                          </div>
                        }
                      />
                    </ImageListItem>
                  ))
                : 'No Published Quizzes'}
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
