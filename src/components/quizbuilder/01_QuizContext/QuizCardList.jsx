import React, { useEffect, useState } from 'react'
import ImageList from '@mui/material/ImageList'
import ImageListItem from '@mui/material/ImageListItem'
import ImageListItemBar from '@mui/material/ImageListItemBar'
import ListSubheader from '@mui/material/ListSubheader'
import IconButton from '@mui/material/IconButton'
import InfoIcon from '@mui/icons-material/Info'
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  FormControlLabel,
  Grid,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material'
import useMediaQuery from '@mui/material/useMediaQuery'

// components
import PrivacySelectFilter from './PrivacySelectFilter'

import './QuizCardList.css'
//import Image from 'next/image';
import Image from 'mui-image'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { toast } from 'react-toastify'
import DeleteConfirmationDialog from '@/components/dialogs/DeleteConfirmationDialog'
import { useSession } from 'next-auth/react'

// MUI icons
import FileOpenIcon from '@mui/icons-material/FileOpen'
import TranslateIcon from '@mui/icons-material/Translate'
import DeleteIcon from '@mui/icons-material/Delete'
import SendIcon from '@mui/icons-material/Send'
import PublishIcon from '@mui/icons-material/Publish'
import YouTubeIcon from '@mui/icons-material/YouTube'
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'

import { useRouter } from 'next/navigation'
import Loading from '@/components/Loading'
import TranslationLanguagesDialog from '@/components/quizbuilder/01_QuizContext/TranslationLanguagesDialog'
import IconButtonTooltip from '@/components/IconButtonTooltip'
const data = [
  {
    thumbnail: 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e',
    title: 'Ramayana',
    owner: 'parsi.venkatramana@gmail.com',
    details: 'all about ramayana'
  }
]

export default function QuizCardList({}) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [myQuizzes, setMyQuizzes] = useState([])
  const [privacyType, setPrivacyType] = useState('PUBLIC')
  const [loading, setLoading] = useState(false)
  const [invalidateQuizzes, setInvalidateQuizzes] = useState(false)
  // const [makingPrivateQuizId, setMakingPrivateQuizId] = useState(null)
  const [selectedQuizIds, setSelectedQuizIds] = useState([])
  const [deletingQuizId, setDeletingQuizId] = useState(null)

  const [deletingSelectedQuizIds, setDeletingSelectedQuizIds] = useState(null)
  const [sendingSelectedQuizIdsForApproval, setSendingSelectedQuizIdsForApproval] = useState(null)
  const [translatingQuiz, setTranslatingQuiz] = useState(null)

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

  function handleBuildQuiz(quiz) {
    router.push(`/myquizzes/builder/${quiz._id}`)
  }

  async function getQuizData() {
    setLoading(true)
    const result = await RestApi.get(
      `${API_URLS.v0.USERS_QUIZ}?email=${session?.user?.email}&approvalState=draft&privacyFilter=${privacyType}`
    )
    if (result?.status === 'success') {
      console.log('Quizzes Fetched result', result)
      // toast.success('Quizzes Fetched Successfully .')
      setLoading(false)
      setMyQuizzes(result.result)
    } else {
      // toast.error('Error:' + result?.result?.message)
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

  // async function handleSendToApproval(quiz) {
  //   try {
  //     const response = await RestApi.put(`${API_URLS.v0.USERS_QUIZ}`, {
  //       id: quiz._id,
  //       approvalState: 'pending'
  //     })
  //     if (response.status === 'success') {
  //       // toast.success('Quiz sent for approval successfully.')
  //       setInvalidateQuizzes(prev => !prev)
  //     } else {
  //       // toast.error(response.message)
  //     }
  //   } catch (error) {
  //     // toast.error('An error occurred while sending the quiz for approval.')
  //   }
  // }

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

  // async function handlePublishPrivateQuiz(quiz) {
  //   try {
  //     const response = await RestApi.put(`${API_URLS.v0.USERS_QUIZ}`, {
  //       _id: quiz._id,
  //       approvalState: 'published'
  //     })
  //     if (response.status === 'success') {
  //       // toast.success('Quiz published successfully.')
  //       setInvalidateQuizzes(prev => !prev)
  //     } else {
  //       // toast.error(response.message)
  //     }
  //   } catch (error) {
  //     // toast.error('An error occurred while publishing the quiz.')
  //   }
  // }

  async function handleViewQuiz(quiz) {
    router.push(`/myquizzes/view/${quiz._id}`)
  }

  // function handleStartMakeQuizPrivate(quiz, e) {
  //   e.stopPropagation()
  //   setMakingPrivateQuizId(quiz._id)
  //   console.log('Making quiz private:', quiz)
  // }

  // async function handleMakeQuizPrivate() {
  //   console.log('Making quiz private confirmed')
  //   try {
  //     const response = await RestApi.put(`${API_URLS.v0.USERS_QUIZ}/${makingPrivateQuizId}`, {
  //       privacy: 'private',
  //     })
  //     if (response.status ==='success') {
  //       console.log('Quiz made private successfully')
  //       setInvalidateQuizzes(prev =>!prev)
  //       // toast.success(response.message || 'Quiz made private successfully.')
  //     } else {
  //       console.log('Error:', response.message)
  //       // toast.error(response.message)
  //     }
  //   } catch (error) {
  //     console.error('Error:', error)
  //     // toast.error('An unexpected error occurred while making the quiz private.')
  //   } finally {
  //     setMakingPrivateQuizId(null)
  //   }
  // }

  // const handleSendSelectedToApprovalConfirm = () => {
  //   setSendingSelectedQuizIdsForApproval(selectedQuizIds)
  // }

  // const handleSendSelectedToApproval = async () => {
  //   console.log('Sending quizzes to approval:', selectedQuizIds)
  //   try {
  //     const response = await RestApi.put(`${API_URLS.v0.USERS_QUIZ}`, {
  //       ids: selectedQuizIds, // Send the array of IDs
  //       approvalState: 'pending' // Include the approval state
  //     })

  //     if (response.status === 'success') {
  //       // toast.success('Quizzes sent for approval successfully.');
  //       setInvalidateQuizzes(prev => !prev)
  //     } else {
  //       // toast.error(response.message);
  //     }
  //   } catch (error) {
  //     // toast.error('An error occurred while sending quizzes for approval.');
  //   } finally {
  //     setSendingSelectedQuizIdsForApproval(null)
  //     setSelectedQuizIds([])
  //   }
  // }

  // const handleCancelSendToApprovalSelected = () => {
  //   setSendingSelectedQuizIdsForApproval(null)
  // }

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

  // function handleClickTranslate(quiz) {
  //   console.log('Translating quiz', quiz)
  //   setTranslatingQuiz(quiz)
  // }

  // async function onTranslateQuiz(quizId, language) {
  //   console.log('Translating quizId, language: ', quizId, language)
  //   try {
  //     const response = await RestApi.post(API_URLS.v0.USERS_QUIZ_TRANSLATION, { quizId, language })
  //     if (response.status === 'success') {
  //       console.log('Quiz translation successful:', response?.result)
  //       toast.success('Quiz translation successful.')
  //       setTranslatingQuiz(null)
  //     } else {
  //       console.log('Error:', response.message)
  //       toast.error(response.message)
  //     }
  //   } catch (error) {
  //     console.error('Error:', error)
  //     toast.error('An unexpected error occurred while translating the quiz.')
  //   }
  // }

  return (
    <div style={{ width: '100%' }}>
      <Grid container rowSpacing={2} justifyContent='center'>
        {myQuizzes.length > 0 && (
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
                    indeterminate={selectedQuizIds.length > 0 && selectedQuizIds.length < myQuizzes.length}
                    checked={myQuizzes.length > 0 && selectedQuizIds.length === myQuizzes.length}
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
            {/* <Button
              size='small'
              variant='outlined'
              color='primary'
              startIcon={<SendIcon />}
              onClick={handleSendSelectedToApprovalConfirm}
              style={{
                padding: '8px 16px',
                fontWeight: 'bold'
              }}
            >
              Send to Approval
            </Button> */}
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
              {myQuizzes.length > 0
                ? myQuizzes?.map(item => {
                    if (item.thumbnail.length === 0) {
                      item.thumbnail = 'https://fakeimg.pl/250x250/?text=' + item.title
                    }
                    return (
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
                          //srcSet={`${item.thumbnail}?w=248&fit=crop&auto=format&dpr=2 2x`}
                          src={`${item?.thumbnail}`}
                          //?w=248&fit=crop&auto=format`}
                          alt={item.title}
                          // sx={{ maxHeight: '300px', maxWidth: '300px' }}
                          fit='fill'
                        />

                        <ImageListItemBar
                          actionPosition='top'
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
                                  sx={{ color: '#fff' }} // White icon color
                                  aria-label={`view quiz ${item.title}`}
                                  onClick={e => {
                                    e.stopPropagation()
                                    handleViewQuiz(item)
                                  }}
                                >
                                  <VisibilityOutlinedIcon />
                                </IconButtonTooltip>
                              
                                <IconButtonTooltip title='Build'
                                  sx={{ color: '#fff' }} // White icon color
                                  aria-label={`build quiz ${item.title}`}
                                  onClick={e => {
                                    e.stopPropagation()
                                    handleBuildQuiz(item)
                                  }}
                                >
                                  <BuildOutlinedIcon />
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
                    )
                  })
                : 'No Quizzes Exist'}
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
      {/* {translatingQuiz && (
        <TranslationLanguagesDialog
          open={translatingQuiz}
          onTranslate={onTranslateQuiz}
          onClose={() => setTranslatingQuiz(null)}
          quiz={translatingQuiz}
        />
      )} */}
    </div>
  )
}

// ;<ImageList
//   cols={getColumns()}
//   gap={16}
//   sx={{
//     width: '100%',
//     margin: 0,
//     padding: 2,
//     // Responsive height calculation
//     gridAutoRows: 'auto',
//     '& .MuiImageListItem-root': {
//       display: 'flex',
//       flexDirection: 'column',
//       height: 'auto !important',
//       transition: 'transform 0.3s ease',
//       '&:hover': {
//         transform: 'scale(1.03)',
//         zIndex: 1
//       }
//     }
//   }}
// >
//   {myQuizzes.length > 0 ? (
//     myQuizzes.map(item => {
//       if (item.thumbnail.length === 0) {
//         item.thumbnail = `https://fakeimg.pl/250x250/?text=${encodeURIComponent(item.title)}`
//       }
//       return (
//         <ImageListItem
//           key={item.id}
//           sx={{
//             position: 'relative',
//             cursor: 'pointer',
//             borderRadius: 1,
//             overflow: 'hidden',
//             boxShadow: theme.shadows[2],
//             '&:hover': {
//               boxShadow: theme.shadows[6]
//             }
//           }}
//         >
//           {/* Checkbox */}
//           <Checkbox
//             checked={selectedQuizIds.includes(item._id)}
//             onChange={e => {
//               e.stopPropagation()
//               handleIndividualSelectChange(item._id)
//             }}
//             sx={{
//               position: 'absolute',
//               top: 8,
//               left: 8,
//               color: 'common.white',
//               zIndex: 2,
//               '&.Mui-checked': {
//                 color: 'primary.light'
//               }
//             }}
//           />

//           {/* Image with responsive sizing */}
//           <Box
//             sx={{
//               position: 'relative',
//               // paddingTop: '100%', // Creates square aspect ratio
//               width: '100%'
//             }}
//           >
//             <Image
//               src={item.thumbnail}
//               alt={item.title}
//               fill
//               style={{
//                 objectFit: 'cover',
//                 width: '100%',
//                 height: '100%'
//               }}
//             />
//           </Box>

//           {/* Item Bar with responsive text */}
//           <ImageListItemBar
//             sx={{
//               background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, transparent 100%)',
//               display: 'flex',
//               flexDirection: 'column',
//               alignItems: 'flex-start',
//               padding: theme.spacing(1),
//               '& .MuiImageListItemBar-titleWrap': {
//                 width: '100%',
//                 padding: 0,
//                 marginBottom: theme.spacing(0.5)
//               },
//               '& .MuiImageListItemBar-title': {
//                 fontSize: '0.875rem',
//                 fontWeight: 500,
//                 color: 'white',
//                 whiteSpace: 'nowrap',
//                 overflow: 'hidden',
//                 textOverflow: 'ellipsis',
//                 width: '100%',
//                 [theme.breakpoints.up('md')]: { fontSize: '1.25rem' }
//               },
//               '& .MuiImageListItemBar-subtitle': {
//                 fontSize: '0.75rem',
//                 color: 'white',
//                 whiteSpace: 'nowrap',
//                 overflow: 'hidden',
//                 textOverflow: 'ellipsis',
//                 width: '100%',
//                 [theme.breakpoints.up('md')]: { fontSize: '1rem' }
//               },
//               '& .MuiImageListItemBar-actionIcon': {
//                 width: '100%',
//                 display: 'flex',
//                 justifyContent: 'flex-end',
//                 padding: 0,
//                 marginTop: theme.spacing(0.01)
//               }
//             }}
//             title={
//               <Typography sx={{ color: 'white', fontWeight: 'bold' }} noWrap>
//                 {item.title}
//               </Typography>
//             }
//             subtitle={
//               <Typography sx={{ color: 'white', fontWeight: 'bold' }} noWrap variant='body2'>
//                 {item.details}
//               </Typography>
//             }
//             actionIcon={
//               <Box
//                 sx={{
//                   display: 'flex',
//                   gap: theme.spacing(1),
//                   background: 'rgba(255,255,255,0.1)',
//                   backdropFilter: 'blur(5px)',
//                   borderRadius: 1,
//                   padding: '4px'
//                 }}
//               >
//                 {[
//                   { icon: <VisibilityOutlinedIcon fontSize='small' />, action: handleViewQuiz },
//                   { icon: <BuildOutlinedIcon fontSize='small' />, action: handleBuildQuiz },
//                   { icon: <DeleteIcon color='error' fontSize='small' />, action: handleStartDeleteQuiz }
//                 ].map((btn, index) => (
//                   <Tooltip key={index} title={['View', 'Build', 'Delete'][index]}>
//                     <IconButtonTooltip title=''
//                       size='small'
//                       sx={{ color: 'common.white' }}
//                       onClick={e => {
//                         e.stopPropagation()
//                         btn.action(item)
//                       }}
//                     >
//                       {btn.icon}
//                     </IconButtonTooltip>
//                   </Tooltip>
//                 ))}
//               </Box>
//             }
//           />
//         </ImageListItem>
//       )
//     })
//   ) : (
//     <Box sx={{ width: '100%', textAlign: 'center', py: 4 }}>
//       <Typography variant='h6' color='text.secondary'>
//         No quizzes found
//       </Typography>
//     </Box>
//   )}
// </ImageList>
