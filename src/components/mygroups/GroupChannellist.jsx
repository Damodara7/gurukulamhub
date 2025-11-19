'use client'
import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Grid,
  Avatar,
  Stack,
  Button,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  TextField,
  InputAdornment,
  CircularProgress,
  Tooltip,
  useTheme
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import {
  Group as GroupIcon,
  Campaign as ChannelIcon,
  Public as PublicIcon,
  Lock as LockIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as HourglassEmptyIcon
} from '@mui/icons-material'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'

const GroupChannellist = ({ groups = [], channels = [] }) => {
  const theme = useTheme()
  const { data: session } = useSession()
  const [viewMode, setViewMode] = useState('groups')
  const [searchQuery, setSearchQuery] = useState('')
  const [requestStatus, setRequestStatus] = useState({})
  const [requestDetails, setRequestDetails] = useState({})
  const [loading, setLoading] = useState({})
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [userSocket, setUserSocket] = useState(null)
  const [isUserConnected, setIsUserConnected] = useState(false)

  // Check request status for each channel
  //To show correct button state (Send Request, Pending, Approved, Rejected)
  useEffect(() => {
    const checkRequestStatus = async () => {
      if (!session?.user?.email || channels.length === 0) return

      for (const channel of channels) {
        try {
          // Check user's request status for this group
          const result = await RestApi.get(`${API_URLS.v0.USERS_GROUP_REQUEST}?groupId=${channel._id}`)

          let userRequest = null
          let status = 'none'

          if (result?.status === 'success' && Array.isArray(result.result)) {
            userRequest = result.result.find(req => req.userEmail === session.user.email)
            if (userRequest) {
              status = userRequest.status
            }
          }

          setRequestStatus(prev => ({
            ...prev,
            [channel._id]: status
          }))

          if (userRequest) {
            setRequestDetails(prev => ({
              ...prev,
              [channel._id]: userRequest
            }))
          }
        } catch (error) {
          console.error('Error checking request status:', error)
          // Set status to 'none' on error
          setRequestStatus(prev => ({
            ...prev,
            [channel._id]: 'none'
          }))
        }
      }
    }

    checkRequestStatus()
  }, [channels, session?.user?.email])

  // WebSocket connection for user-specific updates
  useEffect(() => {
    if (!session?.user?.email) return

    const userWsUrl =
      typeof window !== 'undefined'
        ? `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${
            window.location.host
          }/api/ws/users/${encodeURIComponent(session.user.email)}`
        : ''
    if (userWsUrl) {
      const userWsRef = new WebSocket(userWsUrl)
      userWsRef.onopen = () => {
        console.log('[WS] Connected to user-specific updates')
        setIsUserConnected(true)
        setUserSocket(userWsRef)
      }
      userWsRef.onmessage = event => {
        try {
          const msg = JSON.parse(event.data)
          if (msg.type === 'userUpdate') {
            console.log('[WS] User update received:', msg.data)

            if (msg.data.type === 'groupRequestApproved') {
              const requestData = msg.data.requestData
              console.log('Group request approved for user:', requestData)

              // Update request status to approved
              setRequestStatus(prev => ({
                ...prev,
                [requestData.groupId]: 'approved'
              }))
              setRequestDetails(prev => ({
                ...prev,
                [requestData.groupId]: requestData
              }))

              // Show success message
              toast.success('Your join request has been approved!')
            } else if (msg.data.type === 'groupRequestRejected') {
              const requestData = msg.data.requestData
              console.log('Group request rejected for user:', requestData)

              // Update request status to rejected
              setRequestStatus(prev => ({
                ...prev,
                [requestData.groupId]: 'rejected'
              }))
              setRequestDetails(prev => ({
                ...prev,
                [requestData.groupId]: requestData
              }))

              // Show rejection message
              toast.error(
                `Your join request was rejected. Reason: ${requestData.rejectedReason || 'No reason provided'}`
              )
            }
          }
        } catch (e) {
          console.error('[WS] Error parsing user update message', e)
        }
      }
      userWsRef.onerror = err => {
        console.error('[WS] User-specific WebSocket error', err)
        setIsUserConnected(false)
      }
      userWsRef.onclose = () => {
        console.log('[WS] User-specific WebSocket connection closed')
        setIsUserConnected(false)
      }

      return () => {
        userWsRef.close()
      }
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
            // Groups list updated - the parent MyGroupPage will handle the data processing
            // and update the channels prop, which will trigger the request status check
            console.log('[WS] Groups list updated, parent will handle data processing')
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

  // Check request status when channels prop changes (e.g., after groups list update)
  useEffect(() => {
    const checkRequestStatus = async () => {
      if (!session?.user?.email || channels.length === 0) return

      for (const channel of channels) {
        try {
          const result = await RestApi.get(`${API_URLS.v0.USERS_GROUP_REQUEST}?groupId=${channel._id}`)
          let userRequest = null
          let status = 'none'

          if (result?.status === 'success' && Array.isArray(result.result)) {
            userRequest = result.result.find(req => req.userEmail === session.user.email)
            if (userRequest) {
              status = userRequest.status
            }
          }

          setRequestStatus(prev => ({
            ...prev,
            [channel._id]: status
          }))

          if (userRequest) {
            setRequestDetails(prev => ({
              ...prev,
              [channel._id]: userRequest
            }))
          }
        } catch (error) {
          console.error('Error checking request status:', error)
          setRequestStatus(prev => ({
            ...prev,
            [channel._id]: 'none'
          }))
        }
      }
    }

    checkRequestStatus()
  }, [channels, session?.user?.email])

  // Store the view mode when user manually switches to channels
  const [userSelectedChannels, setUserSelectedChannels] = useState(false)

  // To send join request to a channel
  const handleSendRequest = async channelId => {
    if (!session?.user?.email) {
      toast.error('Please log in to send join request')
      return
    }

    setLoading(prev => ({ ...prev, [channelId]: true }))
    try {
      const result = await RestApi.post(`${API_URLS.v0.USERS_GROUP_REQUEST}`, {
        groupId: channelId
      })
      if (result?.status === 'success') {
        toast.success('Join request sent successfully!')
        setRequestStatus(prev => ({ ...prev, [channelId]: 'pending' }))
        // Clear any previous request details
        setRequestDetails(prev => ({ ...prev, [channelId]: null }))
        // Don't refresh groups data immediately - WebSocket will handle real-time updates
      } else {
        toast.error(result?.message || 'Failed to send join request')
      }
    } catch (error) {
      console.error('Error sending join request:', error)
      toast.error('An error occurred while sending join request')
    } finally {
      setLoading(prev => ({ ...prev, [channelId]: false }))
    }
  }

  const getRequestButton = channel => {
    const status = requestStatus[channel._id] || 'none'
    const requestDetail = requestDetails[channel._id]
    const isLoading = loading[channel._id]

    // Return loading state if currently loading
    if (isLoading) {
      return (
        <Button variant='outlined' size='small' disabled startIcon={<CircularProgress size={16} />}>
          Sending...
        </Button>
      )
    }

    // Use ternary operators instead of switch statement
    return status === 'pending' ? (
      <Button
        variant='outlined'
        size='small'
        startIcon={<HourglassEmptyIcon />}
        color='warning'
        sx={{ fontSize: { xs: '0.8rem', sm: '0.85rem' }, px: { xs: 1.5, sm: 2 } }}
      >
        Pending
      </Button>
    ) : status === 'approved' ? (
      <Chip
        icon={<CheckCircleIcon />}
        label='Approved'
        color='success'
        variant='outlined'
        size='small'
        sx={{ width: { xs: 'auto', sm: '110px' }, fontSize: { xs: '0.75rem', sm: '0.8rem' } }}
      />
    ) : status === 'rejected' ? (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Chip
          icon={<CancelIcon />}
          label='Rejected'
          color='error'
          variant='outlined'
          size='small'
          sx={{ width: { xs: 'auto', sm: '110px' }, fontSize: { xs: '0.75rem', sm: '0.8rem' } }}
        />
        {requestDetail?.rejectedReason ? (
          <Tooltip title={`Reason: ${requestDetail.rejectedReason}`} arrow placement='top'>
            <Typography
              variant='caption'
              color='error'
              sx={{
                fontSize: '0.7rem',
                textAlign: 'center',
                display: 'block',
                mt: 0.5,
                width: { xs: 'min(160px, 60vw)', sm: '110px' },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                cursor: 'help',
                height: '20px',
                lineHeight: '20px'
              }}
            >
              Reason: {requestDetail?.rejectedReason}
            </Typography>
          </Tooltip>
        ) : (
          <Typography
            variant='caption'
            color='text.secondary'
            sx={{
              fontSize: '0.7rem',
              textAlign: 'center',
              display: 'block',
              mt: 0.5,
              fontStyle: 'italic',
              height: '20px',
              width: { xs: 'min(160px, 60vw)', sm: '110px' },
              lineHeight: '20px'
            }}
          >
            No reason provided
          </Typography>
        )}
      </Box>
    ) : (
      <Button
        variant='contained'
        component='label'
        size='small'
        sx={{
          color: 'white',
          width: { xs: '100%', sm: '140px' },
          fontSize: { xs: '0.85rem', sm: '0.9rem' },
          py: { xs: 1, sm: 1.25 }
        }}
        onClick={() => handleSendRequest(channel._id)}
      >
        Send Request
      </Button>
    )
  }

  // Filter channels based on search query
  const filteredChannels = channels.filter(channel => {
    if (!searchQuery.trim()) return true
    return (
      channel.groupName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      channel.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  // Handle view mode change and clear search
  const handleViewModeChange = mode => {
    setViewMode(mode)
    if (mode === 'groups') {
      setSearchQuery('') // Clear search when switching to groups
      setUserSelectedChannels(false) // Reset the flag when user goes to groups
    } else if (mode === 'channels') {
      setUserSelectedChannels(true) // Mark that user manually selected channels
    }
  }

  const renderGroupItem = item => (
    <ListItem
      key={item._id}
      sx={{
        px: { xs: 1.5, sm: 2 },
        py: { xs: 1.25, sm: 1.5 },
        border: '1px solid',
        borderColor: alpha(theme.palette.divider, 0.5),
        borderRadius: 2,
        mb: { xs: 1.25, sm: 1.5 },
        backgroundColor: 'background.paper',
        transition: 'all 0.3s ease-in-out',
        cursor: 'pointer'
      }}
    >
      <ListItemAvatar sx={{ minWidth: { xs: 56, sm: 72 } }}>
        <Avatar
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${alpha(
              theme.palette.secondary.main,
              0.72
            )})`,
            width: { xs: 44, sm: 50 },
            height: { xs: 44, sm: 50 },
            color: 'white',
            boxShadow: `0 2px 8px ${alpha(theme.palette.secondary.main, 0.3)}`
          }}
        >
          <GroupIcon fontSize='small' />
        </Avatar>
      </ListItemAvatar>

      <ListItemText
        primary={
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              justifyContent: 'space-between',
              gap: { xs: 1, sm: 0 }
            }}
          >
            <Tooltip title={item.groupName || 'Untitled Group'} arrow>
              <Typography
                variant='subtitle1'
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                  width: { xs: '100%', sm: '170px' },
                  fontSize: { xs: '0.98rem', sm: '1rem' }
                }}
              >
                {item.groupName || 'Untitled Group'}
              </Typography>
            </Tooltip>

            <Chip
              size='small'
              icon={
                item?.status === 'public' ? <PublicIcon sx={{ fontSize: 14 }} /> : <LockIcon sx={{ fontSize: 14 }} />
              }
              label={item?.status === 'public' ? 'Public' : 'Private'}
              color={item?.status === 'public' ? 'success' : 'warning'}
              variant='outlined'
              sx={{
                mt: { xs: 0.5, sm: 0 },
                alignSelf: { xs: 'flex-start', sm: 'center' },
                fontSize: { xs: '0.75rem', sm: '0.8rem' }
              }}
            />
          </Box>
        }
        secondary={
          <Box>
            {item.description && (
              <Tooltip title={item.description} arrow>
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    mb: 0.5,
                    fontSize: { xs: '0.85rem', sm: '0.9rem' }
                  }}
                >
                  {item.description}
                </Typography>
              </Tooltip>
            )}
            <Typography variant='caption' color='text.secondary' sx={{ fontSize: { xs: '0.78rem', sm: '0.8rem' } }}>
              {item.membersCount || item.members?.length || 0} members
            </Typography>
          </Box>
        }
      />
    </ListItem>
  )

  const renderChannelItem = item => (
    <ListItem
      key={item._id}
      sx={{
        px: { xs: 1.5, sm: 2 },
        py: { xs: 1.25, sm: 1.5 },
        border: '1px solid',
        borderColor: alpha(theme.palette.divider, 0.5),
        borderRadius: 2,
        mb: { xs: 1.25, sm: 1.5 },
        backgroundColor: 'background.paper',
        transition: 'all 0.3s ease-in-out',
        cursor: 'pointer',
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: { xs: 1, sm: 0 }
      }}
    >
      <ListItemAvatar sx={{ minWidth: { xs: 56, sm: 72 } }}>
        <Avatar
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            width: { xs: 44, sm: 50 },
            height: { xs: 44, sm: 50 },
            color: 'white',
            boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`
          }}
        >
          <ChannelIcon fontSize='small' />
        </Avatar>
      </ListItemAvatar>

      <ListItemText
        primary={
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              justifyContent: 'space-between',
              gap: { xs: 1, sm: 0 }
            }}
          >
            <Tooltip title={item.groupName || 'Untitled Channel'} arrow>
              <Typography
                variant='subtitle1'
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                  width: { xs: '100%', sm: '170px' },
                  fontSize: { xs: '0.98rem', sm: '1rem' }
                }}
              >
                {item.groupName || 'Untitled Channel'}
              </Typography>
            </Tooltip>

            <Chip
              size='small'
              icon={<ChannelIcon sx={{ fontSize: 14 }} />}
              label='Channel'
              color='primary'
              variant='outlined'
              sx={{
                mt: { xs: 0.5, sm: 0 },
                alignSelf: { xs: 'flex-start', sm: 'center' },
                fontSize: { xs: '0.75rem', sm: '0.8rem' }
              }}
            />
          </Box>
        }
        secondary={
          <Box sx={{ pr: { xs: 0, sm: 2 } }}>
            {item.description && (
              <Tooltip title={item.description} arrow>
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    mb: 0.5,
                    fontSize: { xs: '0.85rem', sm: '0.9rem' }
                  }}
                >
                  {item.description}
                </Typography>
              </Tooltip>
            )}
            <Typography variant='caption' color='text.secondary' sx={{ fontSize: { xs: '0.78rem', sm: '0.8rem' } }}>
              {item.membersCount || item.members?.length || 0} members
            </Typography>
          </Box>
        }
      />

      <Box sx={{ ml: { xs: 0, sm: 2 }, mt: { xs: 1.25, sm: 0 }, width: { xs: '100%', sm: 'auto' } }}>
        {getRequestButton(item)}
      </Box>
    </ListItem>
  )

  const currentData = viewMode === 'groups' ? groups : filteredChannels
  const currentTitle = viewMode === 'groups' ? 'My Groups' : 'Channels'

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header with Toggle Buttons */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          px: { xs: 2, sm: 3 },
          py: { xs: 2.5, md: 3 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: { xs: 2, sm: 2.5 },
          backgroundColor: alpha('#fff', 0.82),
          backdropFilter: 'blur(10px)'
        }}
      >
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            justifyContent: 'center',
            gap: { xs: 1.25, sm: 1.75 }
          }}
        >
          <Button
            variant={viewMode === 'groups' ? 'contained' : 'outlined'}
            component={viewMode === 'groups' ? 'label' : 'button'}
            size='medium'
            onClick={() => handleViewModeChange('groups')}
            startIcon={<GroupIcon />}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              color: viewMode === 'groups' ? 'white' : 'text.primary',
              px: { xs: 2.8, sm: 3 },
              py: { xs: 1.1, sm: 1.25 },
              fontWeight: 600,
              minWidth: { xs: '100%', sm: 150 },
              fontSize: { xs: '0.95rem', sm: '1rem' },
              boxShadow: viewMode === 'groups' ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}` : 'none',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, viewMode === 'groups' ? 0.4 : 0.1)}`
              }
            }}
          >
            Groups ({groups.length})
          </Button>
          <Button
            variant={viewMode === 'channels' ? 'contained' : 'outlined'}
            component={viewMode === 'channels' ? 'label' : 'button'}
            size='medium'
            onClick={() => handleViewModeChange('channels')}
            startIcon={<ChannelIcon />}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              color: viewMode === 'channels' ? 'white' : 'text.primary',
              px: { xs: 2.8, sm: 3 },
              py: { xs: 1.1, sm: 1.25 },
              fontWeight: 600,
              minWidth: { xs: '100%', sm: 150 },
              fontSize: { xs: '0.95rem', sm: '1rem' },
              boxShadow: viewMode === 'channels' ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}` : 'none',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, viewMode === 'channels' ? 0.4 : 0.1)}`
              }
            }}
          >
            Channels ({channels.length})
          </Button>
        </Box>

        {/* Selected button text below */}
        <Typography
          variant='h6'
          sx={{
            color: 'text.primary',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            fontSize: { xs: '1.05rem', sm: '1.2rem' }
          }}
        >
          {viewMode === 'groups' ? <GroupIcon fontSize='small' /> : <ChannelIcon fontSize='small' />}
          <Typography component='span' sx={{ fontSize: 'inherit', fontWeight: 'inherit' }}>
            {currentTitle} ({currentData.length})
          </Typography>
        </Typography>

        {/* Search bar for channels */}
        {viewMode === 'channels' && (
          <TextField
            placeholder='Search channels by name...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            size='medium'
            sx={{
              width: '100%',
              maxWidth: 400,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                height: { xs: 44, sm: 48 },
                fontSize: { xs: '0.95rem', sm: '1rem' }
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon color='action' />
                </InputAdornment>
              )
            }}
          />
        )}
      </Box>

      {/* Content with scrollable area */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        {currentData.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              height: '100%',
              justifyContent: 'center'
            }}
          >
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(
                  theme.palette.secondary.main,
                  0.08
                )})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.08)}`
              }}
            >
              {viewMode === 'groups' ? (
                <GroupIcon sx={{ fontSize: 60, color: alpha(theme.palette.primary.main, 0.4) }} />
              ) : (
                <ChannelIcon sx={{ fontSize: 60, color: alpha(theme.palette.primary.main, 0.4) }} />
              )}
            </Box>
            <Typography
              variant='h6'
              sx={{
                fontWeight: 600,
                color: 'text.primary'
              }}
            >
              {viewMode === 'groups' ? 'You are not a member of any groups yet' : 'No public channels available'}
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ fontSize: '0.95rem' }}>
              {viewMode === 'groups' ? 'Join groups to see them here' : 'Check back later for new public channels'}
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              height: '100%',
              overflow: 'auto',
              px: { xs: 1.5, sm: 2 },
              py: { xs: 2, sm: 2.5 },
              '&::-webkit-scrollbar': {
                width: '8px'
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '4px'
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#c1c1c1',
                borderRadius: '4px',
                '&:hover': {
                  background: '#a8a8a8'
                }
              }
            }}
          >
            {viewMode === 'groups'
              ? groups.map(item => renderGroupItem(item))
              : filteredChannels.map(item => renderChannelItem(item))}
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default GroupChannellist
