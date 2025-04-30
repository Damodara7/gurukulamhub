'use client'

import React, { useEffect, useState } from 'react'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS as ApiUrls } from '@/configs/apiConfig'
import AdminPendingQuizzes from '@/components/admin-quizzes/pending/AdminPendingQuizzes'
import AdminApprovedQuizzes from '@/components/admin-quizzes/approved/AdminApprovedQuizzes'
import AdminRejectedQuizzes from '@/components/admin-quizzes/rejected/AdminRejectedQuizzes'
import AdminPublishedQuizzes from '@/components/admin-quizzes/published/AdminPublishedQuizzes'
import TabContext from '@mui/lab/TabContext'
import CustomTabList from '@/@core/components/mui/TabList'
import TabPanel from '@mui/lab/TabPanel'

// Mui icons
import DraftsOutlinedIcon from '@mui/icons-material/DraftsOutlined'
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined'
import NewReleasesOutlinedIcon from '@mui/icons-material/NewReleasesOutlined'
import PublishOutlinedIcon from '@mui/icons-material/PublishOutlined'
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined'
import { Grid, Tab } from '@mui/material'

function QuizListPage() {
  const [activeTab, setActiveTab] = useState('pending')

  const tabPanelObject = {
    pending: <AdminPendingQuizzes />,
    approved: <AdminApprovedQuizzes />,
    rejected: <AdminRejectedQuizzes />,
    published: <AdminPublishedQuizzes />
  }

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
                  value='pending'
                  label={
                    <div className='flex items-center gap-1.5'>
                      <PendingActionsOutlinedIcon />
                      Pending
                    </div>
                  }
                />
                <Tab
                  value='approved'
                  label={
                    <div className='flex items-center gap-1.5'>
                      <VerifiedOutlinedIcon />
                      Approved
                    </div>
                  }
                />
                <Tab
                  value='rejected'
                  label={
                    <div className='flex items-center gap-1.5'>
                      <NewReleasesOutlinedIcon />
                      Rejected
                    </div>
                  }
                />
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

export default QuizListPage
