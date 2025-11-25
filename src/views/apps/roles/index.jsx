'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import { alpha, useTheme } from '@mui/material/styles'

// Component Imports
import RoleCards from './RoleCards'
import RolesTable from './RolesTable'

// API Utils
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import * as clientApi from '@/app/api/client/client.api'

const Roles = ({}) => {
  const theme = useTheme()
  const [users, setUsers] = useState([])

  const getUsersData = async () => {
    console.log('Fetching Users Data now...')

    try {
      const result = await RestApi.get(API_URLS.v0.USER)
      if (result?.status === 'success') {
        console.log('Users Fetched result', result)
        setUsers(result?.result || [])
      } else {
        console.log('Error:' + result?.message)
        console.log('Error Fetching users:', result)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  useEffect(() => {
    getUsersData()
  }, [])

  async function refreshUsers() {
    await getUsersData()
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
          bgcolor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.8 : 0.7),
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
                <i className='ri-shield-user-line' style={{ fontSize: '28px', color: 'white' }} />
              </Box>
              <Typography
                sx={{
                  fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.5rem' },
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.02em'
                }}
              >
                Roles Management
              </Typography>
            </Box>
            <Typography
              variant='body1'
              color='text.secondary'
              sx={{
                fontSize: '1.05rem',
                lineHeight: 1.8,
                Width: '100%',
                mx: 'auto',
                fontWeight: 400
              }}
            >
              Define roles to control access to menus and features for your administrators
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Content Area */}
      <Container maxWidth='lg' sx={{ py: { xs: 3, md: 4 } }}>
        <Grid container spacing={{ xs: 3, sm: 4, md: 6 }}>
          {/* Role Cards Section */}
          <Grid item xs={12}>
            <RoleCards />
          </Grid>

          {/* Users Table Section */}
          <Grid item xs={12}>
            <Box
              sx={{
                background: theme.palette.background.paper,
                borderRadius: 3,
                p: { xs: 3, sm: 4 },
                boxShadow: theme => theme.shadows[2],
                border: theme => `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                mb: 3
              }}
            >
              <Typography
                variant='h5'
                sx={{
                  fontWeight: 700,
                  mb: 1,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                Users with Roles
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                View and manage all administrator accounts and their assigned roles
              </Typography>
            </Box>
            <RolesTable tableData={users} refreshUsers={refreshUsers} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default Roles
