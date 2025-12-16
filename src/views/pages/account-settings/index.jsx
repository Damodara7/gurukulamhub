'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import { Box, Chip, Container, Stack, Typography } from '@mui/material'
import HubOutlinedIcon from '@mui/icons-material/HubOutlined'
import { alpha, useTheme } from '@mui/material/styles'

// Component Imports
import CustomTabList from '@core/components/mui/TabList'

const AccountSettings = ({ tabContentList }) => {
  // States
  const theme = useTheme()
  const [activeTab, setActiveTab] = useState('account')

  const handleChange = (event, value) => {
    setActiveTab(value)
  }

  return (
    <TabContext value={activeTab}>
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: theme.palette.background.default,
          overflow: 'hidden'
        }}
      >
        {/* Header Section - Fixed */}
        <Box
          sx={{
            flexShrink: 0,
            bgcolor: theme.palette.background.default,
            py: { xs: 4, md: 6 },
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
          }}
        >
          <Container maxWidth='lg'>
            <Stack spacing={2} sx={{ mb: 5 }}>
              <Chip
                label='Profile Centre'
                sx={{
                  alignSelf: 'flex-start',
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.22 : 0.12),
                  color: theme.palette.primary.main,
                  borderRadius: 2,
                  px: 1.5
                }}
              />
              <Stack spacing={1.5}>
                <Typography
                  variant='h4'
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '1.85rem', md: '2.45rem' },
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  Manage Your Account Experience
                </Typography>
                <Typography variant='body1' sx={{ color: 'text.secondary', maxWidth: 760 }}>
                  Review your profile, strengthen security preferences, and explore your Gurukulam Hub network from one
                  central workspace.
                </Typography>
              </Stack>
            </Stack>

            <Grid container spacing={6}>
              <Grid item xs={12}>
                <CustomTabList
                  onChange={handleChange}
                  variant='scrollable'
                  pill='true'
                  scrollButtons='auto'
                  allowScrollButtonsMobile
                >
                  <Tab
                    label={
                      <div className='flex items-center gap-1.5'>
                        <i className='ri-group-line text-lg' />
                        Account
                      </div>
                    }
                    value='account'
                  />
                  <Tab
                    label={
                      <div className='flex items-center gap-1.5'>
                        <i className='ri-lock-unlock-line text-lg' />
                        Security
                      </div>
                    }
                    value='security'
                  />
                  <Tab
                    label={
                      <div className='flex items-center gap-1.5'>
                        <HubOutlinedIcon />
                        Network Tree
                      </div>
                    }
                    value='network-tree'
                  />
                </CustomTabList>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Tab Content - Scrollable */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            minHeight: 0,
            WebkitOverflowScrolling: 'touch',
            scrollbarGutter: 'stable',
            // Custom scrollbar styling
            '&::-webkit-scrollbar': {
              width: '8px'
            },
            '&::-webkit-scrollbar-track': {
              background: alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.1 : 0.05),
              borderRadius: '4px'
            },
            '&::-webkit-scrollbar-thumb': {
              background:
                theme.palette.mode === 'dark'
                  ? alpha(theme.palette.common.white, 0.3)
                  : alpha(theme.palette.common.black, 0.2),
              borderRadius: '4px',
              '&:hover': {
                background:
                  theme.palette.mode === 'dark'
                    ? alpha(theme.palette.common.white, 0.4)
                    : alpha(theme.palette.common.black, 0.3)
              }
            }
          }}
        >
          <Container maxWidth='lg' sx={{ py: { xs: 4, md: 6 }, pb: { xs: 6, sm: 8, md: 10 } }}>
            <TabPanel value={activeTab} sx={{ p: 0 }}>
              {tabContentList[activeTab]}
            </TabPanel>
          </Container>
        </Box>
      </Box>
    </TabContext>
  )
}

export default AccountSettings
