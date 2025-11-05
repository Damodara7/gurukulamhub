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
                <i className='ri-group-line' style={{ fontSize: '28px', color: 'white' }} />
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
                My Groups & Channels
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
              Connect with your communities and discover new channels to join
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Content Area */}
      <Box sx={{ height: 'calc(100vh - 240px)', overflow: 'hidden' }}>
        <GroupChannellist groups={userGroups} channels={channels} />
      </Box>
    </Box>
  )
}
