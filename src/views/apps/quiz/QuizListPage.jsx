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
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa', pb: { xs: 3, sm: 4, md: 6 } }}>
      <TabContext value={activeTab}>
        {/* Header Section */}
        <Box
          sx={{
            bgcolor: 'white',
            pt: { xs: 2, sm: 3, md: 4 },
            pb: { xs: 2, sm: 3, md: 4 },
            borderBottom: '1px solid #e8eaed',
            mb: { xs: 2, sm: 3, md: 4 }
          }}
        >
          <Container maxWidth='xl' sx={{ px: { xs: 1.5, sm: 2, md: 3 } }}>
            <Box sx={{ textAlign: 'center', mb: { xs: 2, sm: 2.5, md: 3 } }}>
              {/* Icon and Title */}
              <Stack spacing={{ xs: 0.75, sm: 1 }}>
                <Stack
                  direction='row'
                  alignItems='center'
                  spacing={{ xs: 1, sm: 1.5 }}
                  justifyContent='center'
                  sx={{ flexWrap: { xs: 'wrap', sm: 'nowrap' } }}
                >
                  <Box
                    sx={{
                      width: { xs: 36, sm: 40, md: 48 },
                      height: { xs: 36, sm: 40, md: 48 },
                      borderRadius: { xs: 1.25, sm: 1.5 },
                      bgcolor: theme.palette.primary.main,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <QuizIcon sx={{ fontSize: { xs: 20, sm: 22, md: 26 } }} />
                  </Box>
                  <Typography
                    variant='h4'
                    fontWeight={800}
                    sx={{
                      fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem', lg: '2.5rem' },
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      lineHeight: 1.2,
                      textAlign: { xs: 'center', sm: 'left' }
                    }}
                  >
                    Quiz Management
                  </Typography>
                </Stack>

                <Typography
                  variant='body1'
                  sx={{
                    color: '#5f6368',
                    mx: 'auto',
                    fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '1rem' },
                    px: { xs: 1, sm: 0 },
                    maxWidth: { xs: '100%', sm: '600px', md: '700px' }
                  }}
                >
                  Manage, review, and publish quizzes across all stages
                </Typography>
              </Stack>
            </Box>

            {/* Tabs in Header */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
                overflowX: 'auto',
                '&::-webkit-scrollbar': {
                  display: 'none'
                },
                scrollbarWidth: 'none'
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
                    }
                  },
                  '& .MuiTabs-flexContainer': {
                    gap: { xs: 1, sm: 2, md: 3 },
                    justifyContent: { xs: 'flex-start', sm: 'center' }
                  }
                }}
              >
                <Tab
                  value='pending'
                  sx={{
                    minHeight: { xs: 36, sm: 38, md: 44 },
                    px: { xs: 2, sm: 3, md: 4 },
                    py: { xs: 0.75, sm: 1 },
                    fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
                    fontWeight: 600,
                    textTransform: 'none',
                    whiteSpace: 'nowrap'
                  }}
                  label={
                    <Box
                      component='div'
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: { xs: 0.75, sm: 1, md: 1.5 }
                      }}
                    >
                      <PendingActionsOutlinedIcon sx={{ fontSize: { xs: 16, sm: 18, md: 20 } }} />
                      <Box component='span'>Pending</Box>
                    </Box>
                  }
                />
                <Tab
                  value='approved'
                  sx={{
                    minHeight: { xs: 36, sm: 38, md: 44 },
                    px: { xs: 2, sm: 3, md: 4 },
                    py: { xs: 0.75, sm: 1 },
                    fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
                    fontWeight: 600,
                    textTransform: 'none',
                    whiteSpace: 'nowrap'
                  }}
                  label={
                    <Box
                      component='div'
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: { xs: 0.75, sm: 1, md: 1.5 }
                      }}
                    >
                      <VerifiedOutlinedIcon sx={{ fontSize: { xs: 16, sm: 18, md: 20 } }} />
                      <Box component='span'>Approved</Box>
                    </Box>
                  }
                />
                <Tab
                  value='rejected'
                  sx={{
                    minHeight: { xs: 36, sm: 38, md: 44 },
                    px: { xs: 2, sm: 3, md: 4 },
                    py: { xs: 0.75, sm: 1 },
                    fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
                    fontWeight: 600,
                    textTransform: 'none',
                    whiteSpace: 'nowrap'
                  }}
                  label={
                    <Box
                      component='div'
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: { xs: 0.75, sm: 1, md: 1.5 }
                      }}
                    >
                      <NewReleasesOutlinedIcon sx={{ fontSize: { xs: 16, sm: 18, md: 20 } }} />
                      <Box component='span'>Rejected</Box>
                    </Box>
                  }
                />
                <Tab
                  value='published'
                  sx={{
                    minHeight: { xs: 36, sm: 38, md: 44 },
                    px: { xs: 2, sm: 3, md: 4 },
                    py: { xs: 0.75, sm: 1 },
                    fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
                    fontWeight: 600,
                    textTransform: 'none',
                    whiteSpace: 'nowrap'
                  }}
                  label={
                    <Box
                      component='div'
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: { xs: 0.75, sm: 1, md: 1.5 }
                      }}
                    >
                      <PublishOutlinedIcon sx={{ fontSize: { xs: 16, sm: 18, md: 20 } }} />
                      <Box component='span'>Published</Box>
                    </Box>
                  }
                />
              </CustomTabList>
            </Box>
          </Container>
        </Box>

        {/* Content Area */}
        <Container maxWidth='xl' sx={{ px: { xs: 1.5, sm: 2, md: 3 } }}>
          <TabPanel value={activeTab} sx={{ p: 0, mt: { xs: 1, sm: 2 } }}>
            {tabPanelObject[activeTab]}
          </TabPanel>
        </Container>
      </TabContext>
    </Box>
  )
}

export default QuizListPage
