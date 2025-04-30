import React, { useEffect, useRef, useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { calculateProfileCompletion } from '@/utils/profileUtils'
import { getUserAndProfile } from '@/actions/user'
import { updateUserAlertByAlertId } from '@/actions/userAlerts'
import { addLearingRecordsForUser } from '@/actions/userLearning'
import themeConfig from '@/configs/themeConfig'
import AlertVideos from './AlertVideos'
import dynamic from 'next/dynamic'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

const FreshLoginPopup = ({ alertData = {}, refreshData = () => {} }) => {
  // {alert, status, completionStatus} = alertData
  const { data: session } = useSession()
  const alertVideosRef = useRef(null)
  const router = useRouter()
  const [open, setOpen] = useState(true)
  const [profileCompletion, setProfileCompletion] = useState(0)
  const [isAllVideosWatched, setIsAllVideosWatched] = useState(false)

  useEffect(() => {
    async function func() {
      const userAndProfileResponse = await getUserAndProfile({ email: session?.user?.email })
      if (userAndProfileResponse?.status === 'error') {
        console.error('Error fetching user and profile: ', userAndProfileResponse.message)
        return
      }
      const { user, profile } = userAndProfileResponse.result
      const profileCompletionPercentage = calculateProfileCompletion(profile)
      setProfileCompletion(profileCompletionPercentage)
    }
    func()
  }, [])

  const handleVideoEnd = watchedCount => {
    const allVideosWatched = watchedCount === alertData.alert.videos.length
    setIsAllVideosWatched(allVideosWatched)
  }

  const handleOnContinue = async () => {
    let learningPointsRecords = []

    if (alertVideosRef?.current) {
      learningPointsRecords = alertVideosRef.current.getLearningPointsRecords()
    }

    console.log({ learningPointsRecords })

    if (learningPointsRecords?.length > 0) {
      let data = learningPointsRecords

      if (learningPointsRecords.length === 1) {
        data = learningPointsRecords[0]
      }

      try {
        const response = await addLearingRecordsForUser({ email: session?.user?.email, data })
        if (response.status === 'success') {
          console.log('Learning points records added successfully')
        } else {
          console.error(response.message)
        }
      } catch (error) {
        console.error('Error adding learning points records: ', error)
      }
    }

    try {
      const response = await updateUserAlertByAlertId({
        email: session.user.email,
        alertId: alertData.alert._id,
        data: { completionStatus: 'completed' }
      })
      if (response.status === 'success') {
        console.log('Update alert completion status')
      } else {
        console.error('Error updating alert: ', response.message)
      }
    } catch (error) {
      console.error('Error updating alert: ', error)
    } finally {
      onClose()
      // router.refresh() //-> only refetches server-side data and does not trigger a full page reload.
      // window.location.reload() //-> (hard reload) feels too heavy
      refreshData()
    }
  }

  const handleRemindMeLater = async () => {
    try {
      const response = await updateUserAlertByAlertId({
        email: session.user.email,
        alertId: alertData.alert._id,
        data: { status: 'inactive' }
      })
      if (response.status === 'success') {
        console.log('Alert temporarily deactivated')
      } else {
        console.error('Error updating alert: ', response.message)
      }
    } catch (error) {
      console.error('Error updating alert: ', error)
    } finally {
      onClose()
      refreshData()
    }
  }

  function onClose() {
    setOpen(false)
  }

  const handleClose = (event, reason) => {
    if (reason === 'backdropClick' || reason === 'escapeKeyDown') return
    onClose()
  }

  const quillFormats = [
    'header',
    'font',
    'size',
    'bold',
    'italic',
    'underline',
    'strike',
    'color',
    'background',
    'script',
    'blockquote',
    'code-block',
    'list',
    'bullet',
    'check',
    'indent',
    'direction',
    'align',
    'link',
    'image',
    'video',
    'formula'
  ]

  if (!alertData) {
    return null // Return early if alertData is not provided. This prevents potential bugs.
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='md' fullWidth>
      {/* <DialogTitle>
        <Typography variant='h5' component='span' fontWeight='bold' color='primary'>
          Welcome to {themeConfig.templateName} App!
        </Typography>
      </DialogTitle> */}
      <DialogContent>
        {alertData?.alert?.content?.htmlContent &&
          (alertData?.alert?.content?.source === 'react-quill' ? (
            <ReactQuill
              value={alertData?.alert?.content?.htmlContent}
              readOnly={true}
              theme='snow' // Same theme as the editor
              modules={{ toolbar: false }} // Disable the toolbar
              formats={quillFormats}
              className='custom-quill-readOnly' // in globals.css
            />
          ) : null)}

        <AlertVideos ref={alertVideosRef} videos={alertData?.alert?.videos} onVideoEnd={handleVideoEnd} />
      </DialogContent>
      <DialogActions className='pt-2'>
        <Button onClick={handleRemindMeLater} variant='outlined' color='secondary' disabled={isAllVideosWatched}>
          Remind me later
        </Button>
        <Button
          onClick={handleOnContinue}
          color='primary'
          component='label'
          variant='contained'
          sx={{ color: 'white' }}
          disabled={!isAllVideosWatched}
        >
          Continue
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default FreshLoginPopup

// 'use client'

// import React, { useEffect, useState } from 'react'
// import Dialog from '@mui/material/Dialog'
// import DialogTitle from '@mui/material/DialogTitle'
// import DialogContent from '@mui/material/DialogContent'
// import DialogActions from '@mui/material/DialogActions'
// import Typography from '@mui/material/Typography'
// import Button from '@mui/material/Button'
// import VideoPlayer from './VideoPlayer'

// import * as RestApi from '@/utils/restApiUtil'
// import { API_URLS } from '@/configs/apiConfig'
// import Loading from '@/components/Loading'
// import themeConfig from '@/configs/themeConfig'
// import { useRouter } from 'next/navigation'
// import { useSession } from 'next-auth/react'
// import { calculateProfileCompletion } from '@/utils/profileUtils'
// import { getUserAndProfile } from '@/actions/user'
// import { updateAlert } from '@/actions/alerts'
// import MediaPreviewPopup from '../videos/MediaPreviewPopup'

// const FreshLoginPopup = ({ alertData = {} }) => {
//   const { data: session } = useSession()
//   const router = useRouter()
//   const [open, setOpen] = useState(true)
//   const [isVideoWatchedCount, setIsVideoWatchedCount] = useState(0)
//   const [profileCompletion, setProfileCompletion] = useState(0)

//   useEffect(() => {
//     async function func() {
//       const userAndProfileResponse = await getUserAndProfile({ email: session?.user?.email })
//       if (userAndProfileResponse?.status === 'error') {
//         console.error('Error fetching user and profile: ', userAndProfileResponse.message)
//         return
//       }
//       const { user, profile } = userAndProfileResponse.result
//       const profileCompletionPercentage = calculateProfileCompletion(profile)
//       setProfileCompletion(profileCompletionPercentage)
//     }
//     func()
//   }, [])

//   function onClose() {
//     setOpen(false)
//   }

//   const handleClose = (event, reason) => {
//     if (reason === 'backdropClick' || reason === 'escapeKeyDown') return
//     onClose()
//   }

//   // Track if each video is watched
//   const handleVideoEnd = () => {
//     setIsVideoWatchedCount(prevCount => prevCount + 1)
//   }

//   const allVideosWatched = alertData.alert.videos && isVideoWatchedCount === alertData.alert.videos.length

//   async function handleOnContinue() {
//     try {
//       const response = await updateAlert({ id: alertData._id, data: { completionStatus: 'completed' } })
//       if (response.status === 'success') {
//         console.log('Update alert completion status')
//       } else {
//         console.error('Error updating alert: ', response.message)
//       }
//     } catch (error) {
//       console.error('Error updating alert: ', error)
//     } finally {
//       router.push('/pages/user-profile')
//     }
//   }

//   const handleRemindMeLater = async () => {
//     try {
//       const response = await updateAlert({
//         id: alertData._id,
//         data: { status: 'inactive' }
//       })
//       if (response.status === 'success') {
//         console.log('Alert temporarily deactivated')
//       } else {
//         console.error('Error updating alert: ', response.message)
//       }
//     } catch (error) {
//       console.error('Error updating alert: ', error)
//     } finally {
//       onClose()
//       router.refresh()
//     }
//   }

//   return (
//     <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
//       <DialogTitle>
//         <Typography variant='h5' component='span' fontWeight='bold' color='primary'>
//           Welcome to {themeConfig.templateName} App!
//         </Typography>
//       </DialogTitle>
//       <DialogContent>
//         <Typography variant='body1' paragraph>
//           Get started with {themeConfig.templateName}! Here’s a quick introduction to our app.
//         </Typography>

//         <Typography variant='h6' fontWeight='bold' paragraph>
//           {themeConfig.templateName} is a Quiz application designed to help you earn rewards and prizes while learning
//           and spreading knowledge about Indian Knowledge Systems.
//         </Typography>

//         <Typography variant='body1' color='textPrimary' paragraph>
//           To learn more about the features, check out the video guides by clicking the <strong>Website Guide</strong>{' '}
//           button in the top-left corner of the header.
//         </Typography>

//         <Typography variant='subtitle1' color='textSecondary' paragraph>
//           You have completed <strong>{profileCompletion}%</strong> of your profile. Complete your profile to unlock
//           exciting features.
//         </Typography>

//         <Typography variant='body2' color='textSecondary' paragraph>
//           Before updating your profile, watch this short video to understand the profile fields better.
//         </Typography>

//         {/* VideoAd component */}
//         <div className='flex flex-col gap-3'>
//           {alertData.alert.videos &&
//             alertData.alert.videos.length > 0 &&
//             alertData.alert.videos.map((video, index) => {
//               const isLastVideo = index === alertData.alert.videos.length - 1
//               return (
//                 <VideoPlayer
//                   key={video._id}
//                   url={video.url}
//                   showPause={true}
//                   showMute={true}
//                   autoPlay={false}
//                   row={false}
//                   controls={false}
//                   loop={false}
//                   width='100%'
//                   height='300px'
//                   onEnded={handleVideoEnd}
//                   isLastVideo={isLastVideo}
//                   remainingVideos={alertData.alert.videos.length - isVideoWatchedCount}
//                 />
//               )
//             })}
//         </div>
//       </DialogContent>
//       <DialogActions className='pt-2'>
//         <Button onClick={handleRemindMeLater} disabled={!allVideosWatched} color='secondary'>
//           Remind me later
//         </Button>
//         <Button
//           onClick={handleOnContinue}
//           color='primary'
//           component='label'
//           variant='contained'
//           sx={{ color: 'white' }}
//           disabled={!allVideosWatched}
//         >
//           Continue
//         </Button>
//       </DialogActions>
//     </Dialog>
//   )
// }

// export default FreshLoginPopup
