'use client'
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react'
import React, { useEffect, useState } from 'react'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/free-mode'
import 'swiper/css/navigation'
import 'swiper/css/thumbs'

import { FreeMode, Navigation, Thumbs } from 'swiper/modules'

import './ViewQuiz.css'
import CustomInputVertical from '@/@core/components/custom-inputs/Vertical'
import {
  Badge,
  Box,
  Button,
  Grid,
  Tab,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  styled,
  Container,
  useTheme
} from '@mui/material'
import { alpha } from '@mui/material/styles'

import * as RestApi from '@/utils/restApiUtil'
import { API_URLS as ApiUrls } from '@/configs/apiConfig'
import { toast } from 'react-toastify'
import QuizCardList from './QuizCardList'
import PendingQuizzesForApproval from './PendingQuizzesForApproval'
import ApprovedQuizzes from './ApprovedQuizzes'
import RejectedQuizzes from './RejectedQuizzes'
import PublishedQuizzes from './PublishedQuizzes'
import { useSession } from 'next-auth/react'
import TabContext from '@mui/lab/TabContext'
import CustomTabList from '@/@core/components/mui/TabList'

// Mui icons
import DraftsOutlinedIcon from '@mui/icons-material/DraftsOutlined'
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined'
import NewReleasesOutlinedIcon from '@mui/icons-material/NewReleasesOutlined'
import PublishOutlinedIcon from '@mui/icons-material/PublishOutlined'
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined'
import SaveIcon from '@mui/icons-material/Save'
import TabPanel from '@mui/lab/TabPanel'
import SavedQuizzes from './SavedQuizzes'

const ViewQuiz = ({ data, theme: themeFromProps, onSelectQuiz, isAdmin = false }) => {
  const theme = useTheme()
  const { data: session, status } = useSession()
  const [privacyType, setPrivacyType] = useState('PUBLIC')
  const [invalidateQuizzes, setInvalidateQuizzes] = useState(false)
  const [loading, setLoading] = useState(false)
  const [myQuizzes, setMyQuizzes] = useState([])
  const [activeTab, setActiveTab] = useState('drafts')

  function handleChangePrivacyType(newPrivacyType) {
    setPrivacyType(newPrivacyType)
  }

  const tabPanelObject = {
    drafts: (
      <QuizCardList
        setInvalidateQuizzes={setInvalidateQuizzes}
        onChangePrivacyType={handleChangePrivacyType}
        onSelectQuiz={onSelectQuiz}
        itemData={myQuizzes}
        isAdmin={isAdmin}
      />
    ),
    saved: (
      <SavedQuizzes
        setInvalidateQuizzes={setInvalidateQuizzes}
        onChangePrivacyType={handleChangePrivacyType}
        onSelectQuiz={onSelectQuiz}
        itemData={myQuizzes}
        isAdmin={isAdmin}
      />
    ),
    pending: (
      <PendingQuizzesForApproval
        setInvalidateQuizzes={setInvalidateQuizzes}
        onSelectQuiz={onSelectQuiz}
        itemData={myQuizzes}
      />
    ),
    approved: (
      <ApprovedQuizzes setInvalidateQuizzes={setInvalidateQuizzes} onSelectQuiz={onSelectQuiz} itemData={myQuizzes} />
    ),
    rejected: (
      <RejectedQuizzes setInvalidateQuizzes={setInvalidateQuizzes} onSelectQuiz={onSelectQuiz} itemData={myQuizzes} />
    ),
    published: (
      <PublishedQuizzes
        setInvalidateQuizzes={setInvalidateQuizzes}
        onChangePrivacyType={handleChangePrivacyType}
        onSelectQuiz={onSelectQuiz}
        itemData={myQuizzes}
        isAdmin={isAdmin}
      />
    )
  }

  async function getQuizData() {
    // toast.success('Fetching My Quiz Data now...')
    setLoading(true)
    const result = await RestApi.get(
      `${ApiUrls.v0.USERS_QUIZ}?email=${session?.user?.email}&privacyFilter=${privacyType}`
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

  const handleChangeTab = (event, newValue) => {
    setActiveTab(newValue)
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `radial-gradient(circle at 20% 20%, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 50%),
                     radial-gradient(circle at 80% 80%, ${alpha(
                       theme.palette.secondary.main,
                       0.05
                     )} 0%, transparent 50%),
                     ${theme.palette.background.default}`
      }}
    >
      {/* Elegant Header */}
      <Box
        sx={{
          backdropFilter: 'blur(20px)',
          bgcolor: alpha('#fff', 0.7),
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
          pt: { xs: 4, md: 6 },
          pb: { xs: 4, md: 6 }
        }}
      >
        <Container maxWidth='lg'>
          <Box sx={{ textAlign: 'center' }}>
            {/* Icon and Title */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 2,
                mb: 2
              }}
            >
              <Box
                sx={{
                  width: { xs: 48, sm: 56 },
                  height: { xs: 48, sm: 56 },
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.3)}`
                }}
              >
                <i className='ri-file-list-3-line' style={{ fontSize: '28px', color: 'white' }} />
              </Box>
              <Typography
                sx={{
                  fontSize: { xs: '2rem', md: '2.5rem' },
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.02em'
                }}
              >
                My Quiz Collection
              </Typography>
            </Box>
            <Typography
              variant='body1'
              color='text.secondary'
              sx={{
                fontSize: '1.05rem',
                lineHeight: 1.8,
               width: '100%',
                mx: 'auto',
                fontWeight: 400
              }}
            >
              Manage and organize your quizzes across different stages
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Content Area with Tabs */}
      <Container maxWidth='lg' sx={{ py: { xs: 3, md: 4 } }}>
        <TabContext value={activeTab}>
          <Grid container spacing={0}>
            <Grid item xs={12}>
              <div className='w-full flex justify-center'>
                <CustomTabList
                  onChange={handleChangeTab}
                  variant='scrollable'
                  pill='true'
                  scrollButtons='auto'
                  allowScrollButtonsMobile
                >
                  <Tab
                    value='drafts'
                    label={
                      <div className='flex items-center gap-1.5'>
                        <DraftsOutlinedIcon />
                        Drafts
                      </div>
                    }
                  />
                  {!isAdmin && (
                    <Tab
                      value='saved'
                      label={
                        <div className='flex items-center gap-1.5'>
                          <SaveIcon />
                          Saved
                        </div>
                      }
                    />
                  )}
                  {!isAdmin && (
                    <Tab
                      value='pending'
                      label={
                        <div className='flex items-center gap-1.5'>
                          <PendingActionsOutlinedIcon />
                          Pending
                        </div>
                      }
                    />
                  )}
                  {
                    <Tab
                      value='approved'
                      label={
                        <div className='flex items-center gap-1.5'>
                          <VerifiedOutlinedIcon />
                          {isAdmin ? `Saved & Approved` : 'Approved'}
                        </div>
                      }
                    />
                  }
                  {!isAdmin && (
                    <Tab
                      value='rejected'
                      label={
                        <div className='flex items-center gap-1.5'>
                          <NewReleasesOutlinedIcon />
                          Rejected
                        </div>
                      }
                    />
                  )}
                  <Tab
                    value='published'
                    label={
                      <div className='flex items-center gap-1.5'>
                        <PublishOutlinedIcon />
                        Published
                      </div>
                    }
                  />
                </CustomTabList>
              </div>
            </Grid>

            <Grid item xs={12}>
              <TabPanel value={activeTab} sx={{ p: 0, pt: 2 }}>
                {tabPanelObject[activeTab]}
              </TabPanel>
            </Grid>
          </Grid>
        </TabContext>
      </Container>
    </Box>
  )
}

export default ViewQuiz
