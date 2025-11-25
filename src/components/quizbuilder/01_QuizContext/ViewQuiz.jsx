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
import useMediaQuery from '@mui/material/useMediaQuery'

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
import SavedQuizzes from './SavedQuizzes'
import TabPanel from '@mui/lab/TabPanel'

const ViewQuiz = ({ data, theme: themeFromProps, onSelectQuiz, isAdmin = false }) => {
  const theme = useTheme()
  const isSmDown = useMediaQuery(theme.breakpoints.down('sm'))
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
  const mobileTabPanelMaxHeight = 'calc(100vh - 170px)'
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default, pb: { xs: 4, sm: 6 } }}>
      <TabContext value={activeTab}>
        {/* Header Section */}
        <Box
          sx={{
            bgcolor: theme.palette.background.paper,
            pt: { xs: 2, sm: 3, md: 4 },
            pb: { xs: 2, sm: 3, md: 4 },
            px: { xs: 1, sm: 0 },
            borderBottom: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.12 : 0.08)}`,
            mb: { xs: 2, sm: 3, md: 4 }
          }}
        >
          <Container maxWidth='xl'>
            <Box sx={{ textAlign: 'center', mb: { xs: 2, sm: 3 }, px: { xs: 1, sm: 0 } }}>
              {/* Title */}
              <Typography
                variant='h4'
                fontWeight={800}
                sx={{
                  fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.5rem' },
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: { xs: 0.75, sm: 1 },
                  px: { xs: 1, sm: 0 }
                }}
              >
                My Quiz Collection
              </Typography>

              <Typography
                variant='body1'
                sx={{
                  color: theme.palette.text.secondary,
                  maxWidth: '800px',
                  mx: 'auto',
                  fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
                  px: { xs: 1, sm: 2, md: 0 },
                  lineHeight: { xs: 1.5, sm: 1.6 }
                }}
              >
                Manage and organize your quizzes across different stages
              </Typography>
            </Box>

            {/* Tabs in Header */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
                // overflowX: 'auto',
                // '&::-webkit-scrollbar': {
                //   display: 'none'
                // },
                // scrollbarWidth: 'none',
                px: { xs: 1, sm: 0 }
              }}
            >
              <CustomTabList
                onChange={handleChangeTab}
                variant='scrollable'
                pill='true'
                scrollButtons='auto'
                allowScrollButtonsMobile
                sx={{
                  width: '100%',
                  maxWidth: '100%',
                  '& .MuiTabs-scrollButtons': {
                    '&.Mui-disabled': {
                      opacity: 0.3
                    },
                    fontSize: { xs: '1rem', sm: '1.25rem' }
                  },
                  '& .MuiTabs-flexContainer': {
                    gap: { xs: 1, sm: 1.5, md: 3 },
                    justifyContent: { xs: 'flex-start', sm: 'center' }
                  }
                }}
              >
                <Tab
                  value='drafts'
                  label={
                    <div className='flex items-center' style={{ gap: '6px' }}>
                      <DraftsOutlinedIcon sx={{ fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' } }} />
                      <span style={{ fontSize: 'inherit' }}>Drafts</span>
                    </div>
                  }
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
                    px: { xs: 1.5, sm: 2, md: 2.5 },
                    py: { xs: 1, sm: 1.25 },
                    minHeight: { xs: 36, sm: 40, md: 44 },
                    textTransform: 'none',
                    whiteSpace: 'nowrap'
                  }}
                />
                {!isAdmin && (
                  <Tab
                    value='saved'
                    label={
                      <div className='flex items-center' style={{ gap: '6px' }}>
                        <SaveIcon sx={{ fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' } }} />
                        <span style={{ fontSize: 'inherit' }}>Saved</span>
                      </div>
                    }
                    sx={{
                      fontWeight: 600,
                      fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
                      px: { xs: 1.5, sm: 2, md: 2.5 },
                      py: { xs: 1, sm: 1.25 },
                      minHeight: { xs: 36, sm: 40, md: 44 },
                      textTransform: 'none',
                      whiteSpace: 'nowrap'
                    }}
                  />
                )}
                {!isAdmin && (
                  <Tab
                    value='pending'
                    label={
                      <div className='flex items-center' style={{ gap: '6px' }}>
                        <PendingActionsOutlinedIcon sx={{ fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' } }} />
                        <span style={{ fontSize: 'inherit' }}>Pending</span>
                      </div>
                    }
                    sx={{
                      fontWeight: 600,
                      fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
                      px: { xs: 1.5, sm: 2, md: 2.5 },
                      py: { xs: 1, sm: 1.25 },
                      minHeight: { xs: 36, sm: 40, md: 44 },
                      textTransform: 'none',
                      whiteSpace: 'nowrap'
                    }}
                  />
                )}
                <Tab
                  value='approved'
                  label={
                    <div className='flex items-center' style={{ gap: '6px' }}>
                      <VerifiedOutlinedIcon sx={{ fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' } }} />
                      <span style={{ fontSize: 'inherit' }}>{isAdmin ? `Saved & Approved` : 'Approved'}</span>
                    </div>
                  }
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
                    px: { xs: 1.5, sm: 2, md: 2.5 },
                    py: { xs: 1, sm: 1.25 },
                    minHeight: { xs: 36, sm: 40, md: 44 },
                    textTransform: 'none',
                    whiteSpace: 'nowrap'
                  }}
                />
                {!isAdmin && (
                  <Tab
                    value='rejected'
                    label={
                      <div className='flex items-center' style={{ gap: '6px' }}>
                        <NewReleasesOutlinedIcon sx={{ fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' } }} />
                        <span style={{ fontSize: 'inherit' }}>Rejected</span>
                      </div>
                    }
                    sx={{
                      fontWeight: 600,
                      fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
                      px: { xs: 1.5, sm: 2, md: 2.5 },
                      py: { xs: 1, sm: 1.25 },
                      minHeight: { xs: 36, sm: 40, md: 44 },
                      textTransform: 'none',
                      whiteSpace: 'nowrap'
                    }}
                  />
                )}
                <Tab
                  value='published'
                  label={
                    <div className='flex items-center' style={{ gap: '6px' }}>
                      <PublishOutlinedIcon sx={{ fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' } }} />
                      <span style={{ fontSize: 'inherit' }}>Published</span>
                    </div>
                  }
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
                    px: { xs: 1.5, sm: 2, md: 2.5 },
                    py: { xs: 1, sm: 1.25 },
                    minHeight: { xs: 36, sm: 40, md: 44 },
                    textTransform: 'none',
                    whiteSpace: 'nowrap'
                  }}
                />
              </CustomTabList>
            </Box>
          </Container>
        </Box>

        {/* Content Area */}
        <Container
          maxWidth='xl'
          sx={{
            px: { xs: 1.5, sm: 2, md: 3 },
            py: { xs: 2, sm: 3, md: 4 }
          }}
        >
          <TabPanel
            value={activeTab}
            sx={{
              p: 0,
              mt: { xs: 1, sm: 2 },
              '& > div': {
                px: { xs: 0, sm: 0.5 }
              },
              maxHeight: isSmDown ? mobileTabPanelMaxHeight : 'none',
              overflowY: isSmDown ? 'auto' : 'visible',
              pr: { xs: 0, sm: 0.5 }
            }}
          >
            {tabPanelObject[activeTab]}
          </TabPanel>
        </Container>
      </TabContext>
    </Box>
  )
}

export default ViewQuiz
