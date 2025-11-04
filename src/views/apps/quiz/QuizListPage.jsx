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
import { Grid, Tab, Box, Typography, Container, useTheme } from '@mui/material'
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
                <i className='ri-questionnaire-line' style={{ fontSize: '28px', color: 'white' }} />
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
                Quiz Management
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
              Manage, review, and publish quizzes across all stages
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

export default QuizListPage
