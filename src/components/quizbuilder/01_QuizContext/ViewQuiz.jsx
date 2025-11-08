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
import SavedQuizzes from './SavedQuizzes'
import TabPanel from '@mui/lab/TabPanel'

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
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa', pb: 6 }}>
      <TabContext value={activeTab}>
        {/* Header Section */}
        <Box
          sx={{
            bgcolor: 'white',
            pt: { xs: 3, md: 4 },
            pb: { xs: 3, md: 4 },
            borderBottom: '1px solid #e8eaed',
            mb: 4
          }}
        >
          <Container maxWidth="xl">
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              {/* Title */}
              <Typography
                variant="h4"
                fontWeight={800}
                sx={{
                  fontSize: { xs: '1.5rem', md: '2rem' },
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1
                }}
              >
                My Quiz Collection
              </Typography>
              
              <Typography variant="body1" sx={{ color: '#5f6368', maxWidth: '800px', mx: 'auto' }}>
                Manage and organize your quizzes across different stages
              </Typography>
            </Box>

            {/* Tabs in Header */}
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
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
                <Tab
                  value='approved'
                  label={
                    <div className='flex items-center gap-1.5'>
                      <VerifiedOutlinedIcon />
                      {isAdmin ? `Saved & Approved` : 'Approved'}
                    </div>
                  }
                />
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
            </Box>
          </Container>
        </Box>

        {/* Content Area */}
        <Container maxWidth='xl'>
          <TabPanel value={activeTab} sx={{ p: 0 }}>
            {tabPanelObject[activeTab]}
          </TabPanel>
        </Container>
      </TabContext>
    </Box>
  )
}

export default ViewQuiz
