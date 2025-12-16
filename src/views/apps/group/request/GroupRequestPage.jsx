'use client'
import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Box, Button, CircularProgress, Alert, Container, Typography, useTheme, IconButton } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { ArrowBack as ArrowBackIcon, ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon } from '@mui/icons-material'
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
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false)

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
      <Box display='flex' justifyContent='center' alignItems='center' height='100%'>
        <CircularProgress size={60} />
      </Box>
    )
  }

  if (error) {
    return (
      <Box
        sx={{
          p: 3,
          height: '100%',
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
          height: '100%',
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
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
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
          bgcolor: alpha(theme.palette.background.paper, 0.8),
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
          pt: isHeaderCollapsed ? { xs: 1, sm: 1.25, md: 1.5 } : { xs: 1.5, sm: 2, md: 2.5 },
          pb: isHeaderCollapsed ? { xs: 1, sm: 1.25, md: 1.5 } : { xs: 1.5, sm: 2, md: 2.5 },
          transition: 'all 0.3s ease'
        }}
      >
        <Container maxWidth='lg'>
          <Box>
            {/* Icon and Title */}
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 1, sm: 1.25 },
                mb: isHeaderCollapsed ? 0 : { xs: 1, sm: 1.5 },
                flexWrap: 'nowrap'
              }}
            >
              <Box
                sx={{
                  width: { xs: 36, sm: 40, md: 44 },
                  height: { xs: 36, sm: 40, md: 44 },
                  borderRadius: { xs: '10px', sm: '12px' },
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 3px 10px ${alpha(theme.palette.primary.main, 0.25)}`,
                  flexShrink: 0
                }}
              >
                <i className='ri-user-add-line' style={{ fontSize: 'clamp(18px, 4vw, 22px)', color: 'white' }} />
              </Box>
              <Typography
                sx={{
                  fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.6rem' },
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.3,
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: isHeaderCollapsed ? 1 : 2,
                  WebkitBoxOrient: 'vertical',
                  wordBreak: 'break-word',
                  textAlign: 'left',
                  flex: 1
                }}
                title={group?.groupName || 'Group'}
              >
                {group?.groupName || 'Group'}
              </Typography>
              <IconButton
                onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
                size="small"
                sx={{
                  color: 'text.secondary',
                  flexShrink: 0,
                  ml: 'auto',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: 'text.primary'
                  }
                }}
              >
                {isHeaderCollapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
              </IconButton>
            </Box>
            {!isHeaderCollapsed && group?.description && (
              <Typography
                variant='body2'
                color='text.secondary'
                sx={{
                  fontSize: { xs: '0.8rem', sm: '0.875rem', md: '0.9375rem' },
                  lineHeight: { xs: 1.4, sm: 1.5, md: 1.6 },
                  fontWeight: 400,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '100%',
                  mb: { xs: 1, sm: 1.25 }
                }}
              >
                {group.description}
              </Typography>
            )}
          </Box>
        </Container>
      </Box>

      {/* Content Area */}
      <Box sx={{ py: { xs: 3, md: 4 }, flex: 1, overflow: 'auto' }}>
        <JoinRequestScreen group={group} />
      </Box>
    </Box>
  )
}
export default GroupRequestPage
