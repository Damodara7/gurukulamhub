'use client'
import React, { useEffect, useState } from 'react'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { Box, CircularProgress, Alert, Container, Typography, useTheme } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { useSession } from 'next-auth/react'
import GroupChannellist from '@/components/mygroups/GroupChannellist'
export default function MyGroupsPage() {
  const theme = useTheme()
  const [userGroups, setUserGroups] = useState([])
  const [channels, setChannels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { data: session } = useSession()
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)

  // Helper function to process groups data and update state
  const processGroupsData = groups => {
    const userEmail = session?.user?.email
    if (!userEmail) return

    // Filter user's groups (groups where user is a member)
    const userGroupsFiltered = groups.filter(group => {
      // First check if user is in the members array
      const isMemberInArray = group.members?.some(member => {
        if (typeof member === 'object' && member.email) {
          return member.email === userEmail
        }
        return false
      })

      // For now, we'll rely on the groupIds approach which should be updated
      // when a user is added to a group through the request approval process
      return isMemberInArray
    })
    setUserGroups(userGroupsFiltered)

    // Filter channels (public groups where user is not a member)
    const channelsFiltered = groups.filter(group => {
      const isPublic = group.status === 'public'
      const isNotMember = !group.members?.some(member => {
        if (typeof member === 'object' && member.email) {
          return member.email === userEmail
        }
        return false
      })
      return isPublic && isNotMember
    })
    setChannels(channelsFiltered)
  }

  const getGroupsData = async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await RestApi.get(`${API_URLS.v0.USERS_GROUP}`)

      if (result?.status === 'success') {
        const groups = result.result || []
        processGroupsData(groups)
      } else {
        console.error('Error Fetching groups:', result.message)
        setError(result.message || 'Failed to fetch groups')
      }
    } catch (error) {
      console.error('Error fetching groups:', error)
      setError('An error occurred while fetching groups')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user?.email) {
      getGroupsData()
    }
  }, [session?.user?.email])

  // WebSocket connection for groups list updates
  useEffect(() => {
    const wsUrl =
      typeof window !== 'undefined'
        ? `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/api/ws/groups`
        : ''
    if (wsUrl) {
      const wsRef = new WebSocket(wsUrl)
      wsRef.onopen = () => {
        console.log('[WS] Connected to groups list updates')
        setIsConnected(true)
        setSocket(wsRef)
      }
      wsRef.onmessage = event => {
        try {
          const msg = JSON.parse(event.data)
          if (msg.type === 'groupsList') {
            // Update groups data directly (no refresh feeling)
            console.log('[WS] Groups list updated, processing data directly')
            processGroupsData(msg.data || [])
          }
        } catch (e) {
          console.error('[WS] Error parsing groups list message', e)
        }
      }
      wsRef.onerror = err => {
        console.error('[WS] Groups list error', err)
        setIsConnected(false)
      }
      wsRef.onclose = () => {
        console.log('[WS] Groups list connection closed')
        setIsConnected(false)
      }

      return () => {
        wsRef.close()
      }
    }
  }, [])

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='100vh'>
        <CircularProgress size={60} />
      </Box>
    )
  }

  if (error) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='100vh' p={2}>
        <Alert severity='error' sx={{ maxWidth: 500 }}>
          {error}
        </Alert>
      </Box>
    )
  }

  return (
    <Box
      component='main'
      sx={{
        minHeight: { xs: '100dvh', md: '100vh' },
        display: 'flex',
        flexDirection: 'column',
        background: theme => `
          radial-gradient(circle at 20% 18%, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 55%),
          radial-gradient(circle at 80% 80%, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 55%),
          ${theme.palette.background.default}`
      }}
    >
      {/* Elegant Header */}
      <Box
        sx={{
          position: 'relative',
          backdropFilter: 'blur(18px)',
          bgcolor: alpha('#fff', 0.78),
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
          px: { xs: 2.5, md: 4 },
          pt: { xs: 4, sm: 5, md: 6 },
          pb: { xs: 4, sm: 5, md: 6 }
        }}
      >
        <Container maxWidth='lg'>
          <Box
            sx={{
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: { xs: 2.5, md: 3 }
            }}
          >
            {/* Icon and Title */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: { xs: 1.75, sm: 2.25 },
                flexWrap: 'wrap'
              }}
            >
              <Box
                sx={{
                  width: { xs: 48, sm: 56, md: 64 },
                  height: { xs: 48, sm: 56, md: 64 },
                  borderRadius: { xs: '14px', md: '16px' },
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 10px 30px ${alpha(theme.palette.primary.main, 0.28)}`
                }}
              >
                <i
                  className='ri-group-line'
                  style={{ fontSize: 'clamp(24px, 6vw, 30px)', color: 'white', lineHeight: 1 }}
                />
              </Box>
              <Typography
                component='h1'
                sx={{
                  fontSize: {
                    xs: 'clamp(1.75rem, 6vw, 2.2rem)',
                    sm: 'clamp(2.05rem, 4.2vw, 2.55rem)',
                    md: 'clamp(2.4rem, 3vw, 2.95rem)',
                    lg: 'clamp(2.7rem, 2.2vw, 3.3rem)'
                  },
                  lineHeight: { xs: 1.18, sm: 1.2, md: 1.25 },
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: { xs: '-0.015em', md: '-0.02em' },
                  textAlign: 'center'
                }}
              >
                My Groups & Channels
              </Typography>
            </Box>
            <Typography
              variant='body1'
              color='text.secondary'
              sx={{
                fontSize: {
                  xs: 'clamp(0.9rem, 4.2vw, 1rem)',
                  sm: 'clamp(0.98rem, 3vw, 1.08rem)',
                  md: 'clamp(1.05rem, 2.3vw, 1.18rem)'
                },
                lineHeight: { xs: 1.65, sm: 1.78, md: 1.85 },
                maxWidth: { xs: '100%', sm: '540px', md: '620px' },
                fontWeight: 400,
                px: { xs: 1, sm: 0 }
              }}
            >
              Connect with your communities and discover new channels to join
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Content Area */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 3, md: 4 },
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: '1200px',
            mx: 'auto',
            bgcolor: alpha(theme.palette.background.paper, 0.85),
            borderRadius: { xs: 2, md: 3 },
            boxShadow: `0 12px 32px ${alpha(theme.palette.common.black, 0.08)}`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
            backdropFilter: 'blur(12px)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <GroupChannellist groups={userGroups} channels={channels} />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
