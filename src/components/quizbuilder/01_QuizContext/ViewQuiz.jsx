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
import { Badge, Box, Button, Grid, Tab, ToggleButton, ToggleButtonGroup, Typography, styled } from '@mui/material'

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
import SaveIcon from '@mui/icons-material/Save';
import TabPanel from '@mui/lab/TabPanel'
import SavedQuizzes from './SavedQuizzes'

const ViewQuiz = ({ data, theme, onSelectQuiz, isAdmin=false }) => {
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
    <div style={{ position: 'relative' }}>
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
                <Tab
                  value='saved'
                  label={
                    <div className='flex items-center gap-1.5'>
                      <SaveIcon />
                      Saved
                    </div>
                  }
                />
                {!isAdmin && <Tab
                  value='pending'
                  label={
                    <div className='flex items-center gap-1.5'>
                      <PendingActionsOutlinedIcon />
                      Pending
                    </div>
                  }
                />}
                {!isAdmin && <Tab
                  value='approved'
                  label={
                    <div className='flex items-center gap-1.5'>
                      <VerifiedOutlinedIcon />
                      Approved
                    </div>
                  }
                />}
                {!isAdmin && <Tab
                  value='rejected'
                  label={
                    <div className='flex items-center gap-1.5'>
                      <NewReleasesOutlinedIcon />
                      Rejected
                    </div>
                  }
                />}
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
            <TabPanel value={activeTab}>{tabPanelObject[activeTab]}</TabPanel>
          </Grid>
        </Grid>
      </TabContext>
    </div>
  )
}

export default ViewQuiz
