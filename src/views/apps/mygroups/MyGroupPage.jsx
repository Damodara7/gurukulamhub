'use client'
import React, { useEffect, useState } from 'react'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { Box, CircularProgress, Alert, Container, Typography, useTheme, useMediaQuery, Button, TextField, InputAdornment, Stack } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { useSession } from 'next-auth/react'
import GroupChannellist from '@/components/mygroups/GroupChannellist'
import { Group as GroupIcon, Campaign as ChannelIcon, Search as SearchIcon } from '@mui/icons-material'

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
  const [viewMode, setViewMode] = useState('groups')
  const [searchQuery, setSearchQuery] = useState('')
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
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
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
          px: { xs: 1.5, sm: 2, md: 2.5 },
          pt: { xs: 1.5, sm: 2, md: 2.5 },
          pb: { xs: 1.5, sm: 2, md: 2.5 }
        }}
      >
        <Container maxWidth='lg'>
          <Box
            sx={{
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: { xs: 1.5, sm: 2 }
            }}
          >
            {/* Icon and Title */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: { xs: 1, sm: 1.25 },
                flexWrap: 'wrap'
              }}
            >
              <Box
                sx={{
                  width: { xs: 36, sm: 40, md: 44 },
                  height: { xs: 36, sm: 40, md: 44 },
                  borderRadius: { xs: '10px', sm: '12px', md: '14px' },
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary?.main || theme.palette.primary.light})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isDarkMode
                    ? `0 6px 20px ${alpha(theme.palette.primary.main, 0.3)}`
                    : `0 6px 20px ${alpha(theme.palette.primary.main, 0.2)}`
                }}
              >
                <i
                  className='ri-group-line'
                  style={{
                    fontSize: 'clamp(18px, 4vw, 22px)',
                    color: theme.palette.common.white,
                    lineHeight: 1
                  }}
                />
              </Box>
              <Typography
                component='h1'
                sx={{
                  fontSize: {
                    xs: 'clamp(1.3rem, 4vw, 1.6rem)',
                    sm: 'clamp(1.5rem, 3vw, 1.8rem)',
                    md: 'clamp(1.7rem, 2.5vw, 2rem)'
                  },
                  lineHeight: { xs: 1.2, sm: 1.25 },
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary?.main || theme.palette.primary.light})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: { xs: '-0.01em', sm: '-0.015em' },
                  textAlign: 'center'
                }}
              >
                My Groups & Channels
              </Typography>
            </Box>
            <Typography
              variant='body2'
              color='text.secondary'
              sx={{
                fontSize: {
                  xs: 'clamp(0.8rem, 3vw, 0.875rem)',
                  sm: 'clamp(0.85rem, 2.5vw, 0.9rem)',
                  md: 'clamp(0.875rem, 2vw, 0.95rem)'
                },
                lineHeight: { xs: 1.5, sm: 1.6 },
                maxWidth: { xs: '100%', sm: '500px', md: '550px' },
                fontWeight: 400,
                px: { xs: 1, sm: 0 },
                color: isDarkMode ? alpha(theme.palette.text.secondary, 0.9) : undefined
              }}
            >
              Connect with your communities and discover new channels to join
            </Typography>
          </Box>

          {/* Tabs and Search */}
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: { xs: 1.25, sm: 1.5 },
              mt: { xs: 1.5, sm: 2 }
            }}
          >
            {/* Toggle Buttons */}
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: 'center',
                justifyContent: 'center',
                gap: { xs: 1, sm: 1.25 },
                maxWidth: { xs: '100%', sm: 450, md: 500 }
              }}
            >
              <Button
                variant={viewMode === 'groups' ? 'contained' : 'outlined'}
                size='small'
                component='label'
                onClick={() => {
                  setViewMode('groups')
                  setSearchQuery('')
                }}
                startIcon={<GroupIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                sx={{
                  textTransform: 'none',
                  borderRadius: { xs: 1.25, sm: 1.5 },
                  color: viewMode === 'groups' ? 'white' : 'text.primary',
                  px: { xs: 2, sm: 2.25, md: 2.5 },
                  py: { xs: 0.75, sm: 0.875, md: 1 },
                  fontWeight: 600,
                  minWidth: { xs: '100%', sm: 120, md: 130 },
                  fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' },
                  boxShadow: viewMode === 'groups'
                    ? isDarkMode
                      ? `0 3px 10px ${alpha(theme.palette.primary.main, 0.3)}`
                      : `0 3px 10px ${alpha(theme.palette.primary.main, 0.25)}`
                    : 'none',
                  transition: 'all 0.3s ease',
                  ...(isDarkMode &&
                    viewMode !== 'groups' && {
                      borderColor: alpha(theme.palette.divider, 0.3),
                      '&:hover': {
                        borderColor: alpha(theme.palette.primary.main, 0.5),
                        backgroundColor: alpha(theme.palette.primary.main, 0.08)
                      }
                    }),
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, viewMode === 'groups' ? (isDarkMode ? 0.4 : 0.3) : 0.1)}`
                  }
                }}
              >
                Groups ({userGroups.length})
              </Button>
              <Button
                variant={viewMode === 'channels' ? 'contained' : 'outlined'}
                component='label'
                size='small'
                onClick={() => {
                  setViewMode('channels')
                  setSearchQuery('')
                }}
                startIcon={<ChannelIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                sx={{
                  textTransform: 'none',
                  borderRadius: { xs: 1.25, sm: 1.5 },
                  color: viewMode === 'channels' ? 'white' : 'text.primary',
                  px: { xs: 2, sm: 2.25, md: 2.5 },
                  py: { xs: 0.75, sm: 0.875, md: 1 },
                  fontWeight: 600,
                  minWidth: { xs: '100%', sm: 120, md: 130 },
                  fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' },
                  boxShadow: viewMode === 'channels'
                    ? isDarkMode
                      ? `0 3px 10px ${alpha(theme.palette.primary.main, 0.3)}`
                      : `0 3px 10px ${alpha(theme.palette.primary.main, 0.25)}`
                    : 'none',
                  transition: 'all 0.3s ease',
                  ...(isDarkMode &&
                    viewMode !== 'channels' && {
                      borderColor: alpha(theme.palette.divider, 0.3),
                      '&:hover': {
                        borderColor: alpha(theme.palette.primary.main, 0.5),
                        backgroundColor: alpha(theme.palette.primary.main, 0.08)
                      }
                    }),
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, viewMode === 'channels' ? (isDarkMode ? 0.4 : 0.3) : 0.1)}`
                  }
                }}
              >
                Channels ({channels.length})
              </Button>
            </Box>

            {/* Search Bar */}
            <TextField
              placeholder={viewMode === 'groups' ? 'Search groups by name...' : 'Search channels by name...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              size='small'
              sx={{
                width: '100%',
                maxWidth: { xs: '100%', sm: 360, md: 400 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: { xs: 1.25, sm: 1.5 },
                  height: { xs: 36, sm: 40, md: 42 },
                  fontSize: { xs: '0.85rem', sm: '0.875rem', md: '0.9rem' },
                  backgroundColor: isDarkMode
                    ? alpha(theme.palette.background.default, 0.6)
                    : undefined,
                  ...(isDarkMode && {
                    '& fieldset': {
                      borderColor: alpha(theme.palette.divider, 0.3)
                    },
                    '&:hover fieldset': {
                      borderColor: alpha(theme.palette.primary.main, 0.5)
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main
                    }
                  })
                },
                '& .MuiInputBase-input': {
                  color: isDarkMode ? theme.palette.text.primary : undefined
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <SearchIcon sx={{ fontSize: { xs: 18, sm: 20 } }} color={isDarkMode ? 'action' : 'action'} />
                  </InputAdornment>
                )
              }}
            />
          </Box>
        </Container>
      </Box>

      {/* Content Area — scrollable like admin notifications */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
          px: { xs: 1.5, sm: 2.5, md: 3, lg: 4 },
          py: { xs: 2.5, sm: 3, md: 3.5, lg: 4 },
          pb: { xs: 4, sm: 5 },
          '&::-webkit-scrollbar': { width: '8px' },
          '&::-webkit-scrollbar-track': {
            background: isDarkMode ? alpha(theme.palette.background.default, 0.5) : '#f1f1f1',
            borderRadius: '4px'
          },
          '&::-webkit-scrollbar-thumb': {
            background: isDarkMode ? alpha(theme.palette.divider, 0.5) : '#c1c1c1',
            borderRadius: '4px',
            '&:hover': {
              background: isDarkMode ? alpha(theme.palette.divider, 0.7) : '#a8a8a8'
            }
          }
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: { xs: '100%', sm: '1100px', md: '1200px', lg: '1280px' },
            mx: 'auto',
            bgcolor: isDarkMode ? alpha(theme.palette.background.paper, 0.9) : undefined
          }}
        >
          <GroupChannellist
            groups={userGroups}
            channels={channels}
            viewMode={viewMode}
            searchQuery={searchQuery}
          />
        </Box>
      </Box>
    </Box>
  )
}
