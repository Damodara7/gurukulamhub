'use client'
import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Box, Button, CircularProgress, Alert, Container, Typography, useTheme } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import JoinRequestScreen from '@/components/group/JoinRequestScreen'

const GroupRequestPage = () => {
  const theme = useTheme()
  const router = useRouter()
  const params = useParams()
  const [group, setGroup] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const groupId = params.id

  useEffect(() => {
    if (groupId) {
      fetchGroupDetails()
    } else {
      setError('No group ID provided')
      setLoading(false)
    }
  }, [groupId])

  const fetchGroupDetails = async () => {
    try {
      console.log('Fetching group details for groupId:', groupId)
      console.log('API URL:', `${API_URLS.v0.USERS_GROUP}?id=${groupId}`)

      const result = await RestApi.get(`${API_URLS.v0.USERS_GROUP}?id=${groupId}`)
      console.log('API Response:', result)

      if (result?.status === 'success') {
        setGroup(result.result)
      } else {
        console.error('API returned error:', result)
        setError(result?.message || 'Failed to fetch group details')
      }
    } catch (error) {
      console.error('Error fetching group details:', error)
      setError(`Failed to fetch group details: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='100vh'>
        <CircularProgress size={60} />
      </Box>
    )
  }

  if (error) {
    return (
      <Box
        sx={{
          p: 3,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Alert severity='error' sx={{ mb: 3, maxWidth: 500 }}>
          {error}
        </Alert>
        <Button variant='outlined' startIcon={<ArrowBackIcon />} onClick={() => router.back()}>
          Go Back
        </Button>
      </Box>
    )
  }

  if (!group) {
    return (
      <Box
        sx={{
          p: 3,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Alert severity='warning' sx={{ mb: 3, maxWidth: 500 }}>
          Group not found
        </Alert>
        <Button variant='outlined' startIcon={<ArrowBackIcon />} onClick={() => router.back()}>
          Go Back
        </Button>
      </Box>
    )
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
                <i className='ri-user-add-line' style={{ fontSize: '28px', color: 'white' }} />
              </Box>
              <Typography
                sx={{
                  fontSize: { xs: '2rem', md: '2.5rem' },
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.02em',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '100%'
                }}
              >
                {group?.groupName || 'Group'}
              </Typography>
            </Box>
            {group?.description && (
              <Typography
                variant='body1'
                color='text.secondary'
                sx={{
                  fontSize: '1.05rem',
                  lineHeight: 1.8,
                  width: '70%',
                  mx: 'auto',
                  fontWeight: 400,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '100%'
                }}
              >
                {group.description}
              </Typography>
            )}
          </Box>
        </Container>
      </Box>

      {/* Content Area */}
      <Box sx={{ py: { xs: 3, md: 4 } }}>
        <JoinRequestScreen group={group} />
      </Box>
    </Box>
  )
}
export default GroupRequestPage
