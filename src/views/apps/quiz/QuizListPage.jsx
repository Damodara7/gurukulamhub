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
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined'
import NewReleasesOutlinedIcon from '@mui/icons-material/NewReleasesOutlined'
import PublishOutlinedIcon from '@mui/icons-material/PublishOutlined'
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined'
import QuizIcon from '@mui/icons-material/Quiz'
import { Tab, Box, Typography, Container, useTheme, Stack } from '@mui/material'
import { alpha } from '@mui/material/styles'

function QuizListPage() {
  const theme = useTheme()
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
              {/* Icon and Title */}
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1.5} justifyContent="center">
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1.5,
                      bgcolor: theme.palette.primary.main,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <QuizIcon sx={{ fontSize: 22 }} />
                  </Box>
                  <Typography
                    variant="h4"
                    fontWeight={800}
                    sx={{
                      fontSize: { xs: '1.5rem', md: '2rem' },
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    Quiz Management
                  </Typography>
                </Stack>
                
                <Typography variant="body1" sx={{ color: '#5f6368', mx: 'auto' }}>
                  Manage, review, and publish quizzes across all stages
                </Typography>
              </Stack>
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

export default QuizListPage
