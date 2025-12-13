'use client'
import React, { useEffect, useState } from 'react'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { Box, CircularProgress, Alert, Container, Typography, useTheme, useMediaQuery } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { useSession } from 'next-auth/react'
import GroupChannellist from '@/components/mygroups/GroupChannellist'
export default function MyGroupsPage() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'))
  const isDesktop = useMediaQuery(theme.breakpoints.between('md', 'lg'))
  const isDarkMode = theme.palette.mode === 'dark'
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
    if (!userEmail) {
      // If no user email, clear the groups and channels
      setUserGroups([])
      setChannels([])
      return
    }

    // Filter user's groups (groups where user is a member OR creator)
    const userGroupsFiltered = groups.filter(group => {
      // Check if user is the creator
      const isCreator = group.creatorEmail === userEmail
      
      // Check if user is in the members array
      const isMemberInArray = group.members?.some(member => {
        if (typeof member === 'object' && member.email) {
          return member.email === userEmail
        }
        return false
      })

      // User is in the group if they are creator or member
      return isCreator || isMemberInArray
    })
    setUserGroups(userGroupsFiltered)

    // Filter channels (public groups where user is not a member and not creator)
    const channelsFiltered = groups.filter(group => {
      const isPublic = group.status === 'public'
      const isCreator = group.creatorEmail === userEmail
      const isNotMember = !group.members?.some(member => {
        if (typeof member === 'object' && member.email) {
          return member.email === userEmail
        }
        return false
      })
      // Channel: public, not creator, and not a member
      return isPublic && !isCreator && isNotMember
    })
    setChannels(channelsFiltered)
  }

  const getGroupsData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all groups by passing a parameter to bypass creator filter
      // The API will return all groups, and we'll filter on the frontend
      const result = await RestApi.get(`${API_URLS.v0.USERS_GROUP}?all=true`)

      if (result?.status === 'success') {
        const groups = result.result || []
        // Process groups data to filter user's groups and channels
        if (session?.user?.email) {
          processGroupsData(groups)
        }
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
    // Only connect WebSocket if session is available
    if (!session?.user?.email) return

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
  }, [session?.user?.email])

  if (loading) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='100vh'
        bgcolor={isDarkMode ? theme.palette.background.default : undefined}
      >
        <CircularProgress size={isMobile ? 50 : isTablet ? 55 : 60} />
      </Box>
    )
  }

  if (error) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='100vh'
        p={{ xs: 2, sm: 3 }}
        bgcolor={isDarkMode ? theme.palette.background.default : undefined}
      >
        <Alert
          severity='error'
          sx={{
            maxWidth: { xs: '100%', sm: 500 },
            borderRadius: { xs: 2, sm: 2.5 }
          }}
        >
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
        background: isDarkMode
          ? `
          radial-gradient(circle at 20% 18%, ${alpha(theme.palette.primary.main, 0.15)} 0%, transparent 55%),
          radial-gradient(circle at 80% 80%, ${alpha(theme.palette.secondary?.main || theme.palette.primary.main, 0.15)} 0%, transparent 55%),
          ${theme.palette.background.default}`
          : `
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
          bgcolor: isDarkMode
            ? alpha(theme.palette.background.paper, 0.85)
            : alpha('#fff', 0.78),
          borderBottom: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.1 : 0.08)}`,
          px: { xs: 2, sm: 2.5, md: 3, lg: 4 },
          pt: { xs: 3.5, sm: 4.5, md: 5.5, lg: 6 },
          pb: { xs: 3.5, sm: 4.5, md: 5.5, lg: 6 }
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
                  width: { xs: 48, sm: 56, md: 64, lg: 68 },
                  height: { xs: 48, sm: 56, md: 64, lg: 68 },
                  borderRadius: { xs: '14px', sm: '15px', md: '16px' },
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary?.main || theme.palette.primary.light})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isDarkMode
                    ? `0 10px 30px ${alpha(theme.palette.primary.main, 0.4)}`
                    : `0 10px 30px ${alpha(theme.palette.primary.main, 0.28)}`
                }}
              >
                <i
                  className='ri-group-line'
                  style={{
                    fontSize: 'clamp(22px, 5.5vw, 28px)',
                    color: theme.palette.common.white,
                    lineHeight: 1
                  }}
                />
              </Box>
              <Typography
                component='h1'
                sx={{
                  fontSize: {
                    xs: 'clamp(1.7rem, 5.5vw, 2.1rem)',
                    sm: 'clamp(2rem, 4vw, 2.5rem)',
                    md: 'clamp(2.3rem, 2.8vw, 2.9rem)',
                    lg: 'clamp(2.6rem, 2vw, 3.2rem)'
                  },
                  lineHeight: { xs: 1.18, sm: 1.2, md: 1.25 },
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary?.main || theme.palette.primary.light})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: { xs: '-0.015em', sm: '-0.018em', md: '-0.02em' },
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
                  xs: 'clamp(0.88rem, 4vw, 0.98rem)',
                  sm: 'clamp(0.95rem, 2.8vw, 1.05rem)',
                  md: 'clamp(1rem, 2.2vw, 1.15rem)',
                  lg: 'clamp(1.05rem, 1.8vw, 1.18rem)'
                },
                lineHeight: { xs: 1.65, sm: 1.75, md: 1.8 },
                maxWidth: { xs: '100%', sm: '540px', md: '600px', lg: '620px' },
                fontWeight: 400,
                px: { xs: 1, sm: 0 },
                color: isDarkMode ? alpha(theme.palette.text.secondary, 0.9) : undefined
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
          px: { xs: 1.5, sm: 2.5, md: 3, lg: 4 },
          py: { xs: 2.5, sm: 3, md: 3.5, lg: 4 },
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: { xs: '100%', sm: '1100px', md: '1200px', lg: '1280px' },
            mx: 'auto',
            bgcolor: isDarkMode
              ? alpha(theme.palette.background.paper, 0.9)
              : alpha(theme.palette.background.paper, 0.85),
            borderRadius: { xs: 2, sm: 2.5, md: 3 },
            boxShadow: isDarkMode
              ? `0 12px 32px ${alpha(theme.palette.common.black, 0.4)}`
              : `0 12px 32px ${alpha(theme.palette.common.black, 0.08)}`,
            border: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.2 : 0.08)}`,
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
