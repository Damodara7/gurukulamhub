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
  Badge,
  IconButton,
  useTheme,
  useMediaQuery
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
  HourglassEmpty as HourglassEmptyIcon,
  ChevronRight as ChevronRightIcon,
  Person as PersonIcon,
  Star as StarIcon
} from '@mui/icons-material'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import ManagementPaginatedCards from '@/components/management/ManagementPaginatedCards'
import { MY_GROUPS_LIST_PAGE_SIZE } from '@/constants/managementCardPagination'

const GroupChannellist = ({ groups = [], channels = [], viewMode: externalViewMode = 'groups', searchQuery: externalSearchQuery = '' }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'))
  const isDesktop = useMediaQuery(theme.breakpoints.between('md', 'lg'))
  const isDarkMode = theme.palette.mode === 'dark'
  const { data: session } = useSession()
  const router = useRouter()
  // Use external props if provided, otherwise use internal state (for backward compatibility)
  const [internalViewMode, setInternalViewMode] = useState('groups')
  const [internalSearchQuery, setInternalSearchQuery] = useState('')
  const viewMode = externalViewMode !== undefined ? externalViewMode : internalViewMode
  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery
  const [requestStatus, setRequestStatus] = useState({})
  const [requestDetails, setRequestDetails] = useState({})
  const [loading, setLoading] = useState({})
  const [unreadCounts, setUnreadCounts] = useState({})
  const [loadingUnreadCounts, setLoadingUnreadCounts] = useState(false)
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

  // WebSocket connection for groups list updates and real-time message updates
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

  // WebSocket connections for each group to listen for new messages
  useEffect(() => {
    if (!session?.user?.email || groups.length === 0) return

    const groupSockets = {}

    groups.forEach(group => {
      const wsUrl =
        typeof window !== 'undefined'
          ? `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${
              window.location.host
            }/api/ws/groups/${group._id}/chat`
          : ''

      if (wsUrl) {
        const wsRef = new WebSocket(wsUrl)

        wsRef.onopen = () => {
          console.log(`[WS] Connected to group ${group._id} chat`)
        }

        wsRef.onmessage = event => {
          try {
            const msg = JSON.parse(event.data)

            if (msg.type === 'newMessage' || msg.type === 'newChatMessage') {
              const message = msg.data
              // Only increment if message is not from current user and not deleted
              if (
                message.senderEmail !== session.user.email &&
                !message.deletedFor?.some(d => d.userEmail === session.user.email) &&
                !message.deletedForEveryone
              ) {
                // Check if message is already read
                const isRead = message.readBy?.some(reader => reader.userEmail === session.user.email)
                if (!isRead) {
                  setUnreadCounts(prev => ({
                    ...prev,
                    [group._id]: (prev[group._id] || 0) + 1
                  }))
                }
              }
            } else if (msg.type === 'messageUpdate') {
              const message = msg.data
              // If message was marked as read, decrement count
              const isRead = message.readBy?.some(reader => reader.userEmail === session.user.email)
              if (isRead && message.senderEmail !== session.user.email) {
                setUnreadCounts(prev => {
                  const currentCount = prev[group._id] || 0
                  if (currentCount > 0) {
                    return {
                      ...prev,
                      [group._id]: currentCount - 1
                    }
                  }
                  return prev
                })
              }
            }
          } catch (e) {
            console.error(`[WS] Error parsing message for group ${group._id}:`, e)
          }
        }

        wsRef.onerror = err => {
          console.error(`[WS] Error for group ${group._id}:`, err)
        }

        wsRef.onclose = () => {
          console.log(`[WS] Connection closed for group ${group._id}`)
        }

        groupSockets[group._id] = wsRef
      }
    })

    return () => {
      Object.values(groupSockets).forEach(ws => {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.close()
        }
      })
    }
  }, [groups, session?.user?.email])

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

  // Fetch unread message counts for groups
  useEffect(() => {
    const fetchUnreadCounts = async () => {
      if (!session?.user?.email || groups.length === 0) return

      setLoadingUnreadCounts(true)
      try {
        const counts = {}
        
        // Fetch counts for all groups in parallel
        const fetchPromises = groups.map(async (group) => {
          try {
            // Fetch recent messages (most recent first, limit 500 to catch more unread messages)
            const result = await RestApi.get(
              `${API_URLS.v0.USERS_GROUP_CHAT}?groupId=${group._id}&limit=500&userEmail=${session.user.email}`
            )
            
            if (result?.status === 'success' && Array.isArray(result.result)) {
              // Count messages that are not read by this user and not sent by this user
              const unreadCount = result.result.filter(msg => {
                // Don't count own messages
                if (msg.senderEmail === session.user.email) return false
                // Don't count messages deleted for this user
                if (msg.deletedFor?.some(d => d.userEmail === session.user.email)) return false
                // Don't count messages deleted for everyone
                if (msg.deletedForEveryone) return false
                // Check if message is read by this user
                const isRead = msg.readBy?.some(reader => reader.userEmail === session.user.email)
                return !isRead
              }).length
              
              return { groupId: group._id, count: unreadCount }
            }
            return { groupId: group._id, count: 0 }
          } catch (error) {
            console.error(`Error fetching unread count for group ${group._id}:`, error)
            return { groupId: group._id, count: 0 }
          }
        })
        
        const results = await Promise.all(fetchPromises)
        
        // Build counts object
        results.forEach(({ groupId, count }) => {
          if (count > 0) {
            counts[groupId] = count
          }
        })
        
        setUnreadCounts(counts)
      } catch (error) {
        console.error('Error fetching unread counts:', error)
      } finally {
        setLoadingUnreadCounts(false)
      }
    }

    fetchUnreadCounts()
  }, [groups, session?.user?.email])

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
        <Button
          variant='outlined'
          size='small'
          disabled
          startIcon={<CircularProgress size={16} />}
          sx={{
            width: { xs: '100%', sm: '140px', md: '150px' },
            fontSize: { xs: '0.83rem', sm: '0.87rem', md: '0.9rem' },
            borderRadius: { xs: 1.5, sm: 2 },
            ...(isDarkMode && {
              borderColor: alpha(theme.palette.divider, 0.3)
            })
          }}
        >
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
        sx={{
          fontSize: { xs: '0.78rem', sm: '0.82rem', md: '0.85rem' },
          px: { xs: 1.5, sm: 1.75, md: 2 },
          width: { xs: '100%', sm: 'auto' },
          borderRadius: { xs: 1.5, sm: 2 },
          ...(isDarkMode && {
            borderColor: alpha(theme.palette.warning.main, 0.5),
            '&:hover': {
              borderColor: theme.palette.warning.main,
              backgroundColor: alpha(theme.palette.warning.main, 0.1)
            }
          })
        }}
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
        sx={{
          width: { xs: 'auto', sm: '110px', md: '120px' },
          fontSize: { xs: '0.73rem', sm: '0.77rem', md: '0.8rem' },
          ...(isDarkMode && {
            borderColor: alpha(theme.palette.success.main, 0.5)
          })
        }}
      />
    ) : status === 'rejected' ? (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Chip
          icon={<CancelIcon />}
          label='Rejected'
          color='error'
          variant='outlined'
          size='small'
          sx={{
            width: { xs: 'auto', sm: '110px', md: '120px' },
            fontSize: { xs: '0.73rem', sm: '0.77rem', md: '0.8rem' },
            ...(isDarkMode && {
              borderColor: alpha(theme.palette.error.main, 0.5)
            })
          }}
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
          color: 'white !important',
          width: { xs: '100%', sm: '140px', md: '150px' },
          fontSize: { xs: '0.83rem', sm: '0.87rem', md: '0.9rem' },
          py: { xs: 0.9, sm: 1.1, md: 1.25 },
          borderRadius: { xs: 1.5, sm: 2 },
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: isDarkMode
            ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
            : undefined,
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: isDarkMode
              ? `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`
              : undefined
          }
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

  // Filter groups based on search query
  const filteredGroups = groups.filter(group => {
    if (!searchQuery.trim()) return true
    return (
      group.groupName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  const renderGroupItem = item => {
    const unreadCount = unreadCounts[item._id] || 0
    
    return (
      <ListItem
        key={item._id}
        onClick={() => router.push(`/mygroups/${item._id}/chat`)}
        sx={{
          px: { xs: 1.5, sm: 2, md: 2.5 },
          py: { xs: 1.25, sm: 1.5, md: 1.75 },
          border: '1px solid',
          borderColor: alpha(theme.palette.divider, isDarkMode ? 0.3 : 0.1),
          borderRadius: { xs: 1.5, sm: 2 },
          mb: { xs: 1.25, sm: 1.5, md: 1.75 },
          backgroundColor: isDarkMode
            ? alpha(theme.palette.background.paper, 0.6)
            : 'background.paper',
          transition: 'all 0.3s ease-in-out',
          cursor: 'pointer',
          position: 'relative',
          '&:hover': {
            transform: 'translateY(-2px)',
            borderColor: alpha(theme.palette.primary.dark, isDarkMode ? 0.4 : 1),
            boxShadow: isDarkMode
              ? `0 8px 24px ${alpha(theme.palette.common.black, 0.3)}`
              : '0 8px 24px rgba(0,0,0,0.08)',
            backgroundColor: isDarkMode
              ? alpha(theme.palette.background.paper, 0.8)
              : alpha(theme.palette.primary.dark, 0.1),
            '& .arrow-icon': {
              transform: 'translateX(4px)',
              opacity: 1
            }
          }
        }}
      >
        <ListItemAvatar sx={{ minWidth: { xs: 56, sm: 64, md: 72 } }}>
          <Badge
            badgeContent={unreadCount > 0 ? (unreadCount > 99 ? '99+' : unreadCount) : null}
            color='error'
            overlap='circular'
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right'
            }}
            sx={{
              '& .MuiBadge-badge': {
                fontSize: { xs: '0.65rem', sm: '0.7rem' },
                fontWeight: 700,
                minWidth: { xs: 18, sm: 20 },
                height: { xs: 18, sm: 20 },
                padding: { xs: '0 5px', sm: '0 6px' },
                borderRadius: '10px',
                backgroundColor: '#25D366', // WhatsApp green
                color: 'white',
                border: `2px solid ${isDarkMode ? theme.palette.background.paper : 'white'}`,
                boxShadow: `0 2px 8px ${alpha('#25D366', 0.4)}`,
                top: { xs: 2, sm: 4 },
                right: { xs: 2, sm: 4 }
              }
            }}
          >
            <Avatar
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.secondary?.main || theme.palette.primary.main}, ${alpha(
                  theme.palette.secondary?.main || theme.palette.primary.main,
                  0.72
                )})`,
                width: { xs: 44, sm: 48, md: 50 },
                height: { xs: 44, sm: 48, md: 50 },
                color: theme.palette.common.white,
                boxShadow: isDarkMode
                  ? `0 2px 8px ${alpha(theme.palette.secondary?.main || theme.palette.primary.main, 0.4)}`
                  : `0 2px 8px ${alpha(theme.palette.secondary?.main || theme.palette.primary.main, 0.3)}`
              }}
            >
              <GroupIcon fontSize='small' />
            </Avatar>
          </Badge>
        </ListItemAvatar>

      <ListItemText
        primary={
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              justifyContent: 'space-between',
              gap: { xs: 1, sm: 0 },
              mb: { xs: 0.5, sm: 0.75 }
            }}
          >
            <Tooltip title={item.groupName || 'Untitled Group'} arrow>
              <Typography
                variant='h6'
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                  width: { xs: '100%', sm: '170px', md: '200px' },
                  fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.3rem' },
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary?.main || theme.palette.primary.dark})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  color: 'transparent',
                  lineHeight: 1.3
                }}
              >
                {item.groupName || 'Untitled Group'}
              </Typography>
            </Tooltip>

            <Chip
              size='small'
              icon={
                item?.status === 'public' ? (
                  <PublicIcon sx={{ fontSize: { xs: 13, sm: 14 } }} />
                ) : (
                  <LockIcon sx={{ fontSize: { xs: 13, sm: 14 } }} />
                )
              }
              label={item?.status === 'public' ? 'Public' : 'Private'}
              color={item?.status === 'public' ? 'success' : 'warning'}
              variant='outlined'
              sx={{
                mt: { xs: 0.5, sm: 0 },
                alignSelf: { xs: 'flex-start', sm: 'center' },
                fontSize: { xs: '0.73rem', sm: '0.77rem', md: '0.8rem' },
                ...(isDarkMode && {
                  borderColor: alpha(
                    item?.status === 'public' ? theme.palette.success.main : theme.palette.warning.main,
                    0.5
                  )
                })
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
                    mb: 0.75,
                    fontSize: { xs: '0.83rem', sm: '0.87rem', md: '0.9rem' }
                  }}
                >
                  {item.description}
                </Typography>
              </Tooltip>
            )}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 1.5, sm: 2 },
                flexWrap: 'wrap'
              }}
            >
              {/* Creator Info */}
              {item.creatorEmail && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    px: { xs: 0.75, sm: 1 },
                    py: { xs: 0.25, sm: 0.5 },
                    borderRadius: 1,
                    background: isDarkMode
                      ? alpha(theme.palette.primary.main, 0.15)
                      : alpha(theme.palette.primary.main, 0.08),
                    border: `1px solid ${alpha(theme.palette.primary.main, isDarkMode ? 0.3 : 0.2)}`
                  }}
                >
                  <StarIcon
                    sx={{
                      fontSize: { xs: 14, sm: 16 },
                      color: theme.palette.primary.main
                    }}
                  />
                  <Tooltip
                    title={`Created by: ${item.creatorEmail}`}
                    arrow
                  >
                    <Typography
                      variant='caption'
                      sx={{
                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                        color: 'text.primary',
                        fontWeight: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: { xs: '120px', sm: '150px' }
                      }}
                    >
                      {item.creatorEmail.split('@')[0]}
                    </Typography>
                  </Tooltip>
                </Box>
              )}
              
              {/* Members Count */}
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{
                  fontSize: { xs: '0.76rem', sm: '0.78rem', md: '0.8rem' },
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                <GroupIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />
                {item.membersCount || item.members?.length || 0} members
              </Typography>
            </Box>
          </Box>
        }
      />
      <IconButton
        className='arrow-icon'
        sx={{
          ml: { xs: 0, sm: 1 },
          color: 'text.secondary',
          opacity: { xs: 1, sm: 0.6 },
          transition: 'all 0.3s ease',
          p: { xs: 0.5, sm: 0.75 },
          '&:hover': {
            color: 'primary.main',
            backgroundColor: 'transparent'
          }
        }}
        onClick={(e) => {
          e.stopPropagation()
          router.push(`/mygroups/${item._id}/chat`)
        }}
      >
        <ChevronRightIcon sx={{ fontSize: { xs: 24, sm: 28 } }} />
      </IconButton>
    </ListItem>
    )
  }

  const renderChannelItem = item => (
    <ListItem
      key={item._id}
      sx={{
        px: { xs: 1.5, sm: 2, md: 2.5 },
        py: { xs: 1.25, sm: 1.5, md: 1.75 },
        border: '1px solid',
        borderColor: alpha(theme.palette.divider, isDarkMode ? 0.3 : 0.5),
        borderRadius: { xs: 1.5, sm: 2 },
        mb: { xs: 1.25, sm: 1.5, md: 1.75 },
        backgroundColor: isDarkMode
          ? alpha(theme.palette.background.paper, 0.6)
          : 'background.paper',
        transition: 'all 0.3s ease-in-out',
        cursor: 'pointer',
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: { xs: 1, sm: 0 },
        '&:hover': {
          transform: 'translateY(-2px)',
          borderColor: alpha(theme.palette.primary.main, isDarkMode ? 0.4 : 0.3),
          boxShadow: isDarkMode
            ? `0 8px 24px ${alpha(theme.palette.common.black, 0.3)}`
            : '0 8px 24px rgba(0,0,0,0.08)',
          backgroundColor: isDarkMode
            ? alpha(theme.palette.background.paper, 0.8)
            : undefined
        }
      }}
    >
      <ListItemAvatar sx={{ minWidth: { xs: 56, sm: 64, md: 72 } }}>
        <Avatar
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary?.main || theme.palette.primary.light})`,
            width: { xs: 44, sm: 48, md: 50 },
            height: { xs: 44, sm: 48, md: 50 },
            color: theme.palette.common.white,
            boxShadow: isDarkMode
              ? `0 2px 8px ${alpha(theme.palette.primary.main, 0.4)}`
              : `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`
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
              width: { xs: '100%', sm: '170px', md: '200px' },
              fontSize: { xs: '0.95rem', sm: '0.98rem', md: '1rem' }
                }}
              >
                {item.groupName || 'Untitled Channel'}
              </Typography>
            </Tooltip>

            <Chip
              size='small'
              icon={<ChannelIcon sx={{ fontSize: { xs: 13, sm: 14 } }} />}
              label='Channel'
              color='primary'
              variant='outlined'
              sx={{
                mt: { xs: 0.5, sm: 0 },
                alignSelf: { xs: 'flex-start', sm: 'center' },
                fontSize: { xs: '0.73rem', sm: '0.77rem', md: '0.8rem' },
                ...(isDarkMode && {
                  borderColor: alpha(theme.palette.primary.main, 0.5)
                })
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
                    fontSize: { xs: '0.83rem', sm: '0.87rem', md: '0.9rem' }
                  }}
                >
                  {item.description}
                </Typography>
              </Tooltip>
            )}
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ fontSize: { xs: '0.76rem', sm: '0.78rem', md: '0.8rem' } }}
            >
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

  const currentData = viewMode === 'groups' ? filteredGroups : filteredChannels

  return (
    <Box sx={{ width: '100%' }}>
        {currentData.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: { xs: 6, sm: 7, md: 8 },
              px: { xs: 2, sm: 3 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: { xs: 2.5, sm: 2.75, md: 3 },
              minHeight: { xs: 280, sm: 320 },
              justifyContent: 'center'
            }}
          >
            <Box
              sx={{
                width: { xs: 100, sm: 110, md: 120 },
                height: { xs: 100, sm: 110, md: 120 },
                borderRadius: '50%',
                background: isDarkMode
                  ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)}, ${alpha(
                      theme.palette.secondary?.main || theme.palette.primary.main,
                      0.15
                    )})`
                  : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(
                      theme.palette.secondary?.main || theme.palette.primary.main,
                      0.08
                    )})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isDarkMode
                  ? `0 4px 16px ${alpha(theme.palette.primary.main, 0.2)}`
                  : `0 4px 16px ${alpha(theme.palette.primary.main, 0.08)}`,
                border: isDarkMode ? `1px solid ${alpha(theme.palette.divider, 0.3)}` : 'none'
              }}
            >
              {viewMode === 'groups' ? (
                <GroupIcon
                  sx={{
                    fontSize: { xs: 50, sm: 55, md: 60 },
                    color: alpha(theme.palette.primary.main, isDarkMode ? 0.6 : 0.4)
                  }}
                />
              ) : (
                <ChannelIcon
                  sx={{
                    fontSize: { xs: 50, sm: 55, md: 60 },
                    color: alpha(theme.palette.primary.main, isDarkMode ? 0.6 : 0.4)
                  }}
                />
              )}
            </Box>
            <Typography
              variant='h6'
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                textAlign: 'center',
                px: { xs: 2, sm: 3 }
              }}
            >
              {viewMode === 'groups' ? 'You are not a member of any groups yet' : 'No public channels available'}
            </Typography>
            <Typography
              variant='body2'
              color='text.secondary'
              sx={{
                fontSize: { xs: '0.88rem', sm: '0.92rem', md: '0.95rem' },
                textAlign: 'center',
                px: { xs: 2, sm: 3 },
                maxWidth: { xs: '100%', sm: 400, md: 500 }
              }}
            >
              {viewMode === 'groups' ? 'Join groups to see them here' : 'Check back later for new public channels'}
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              px: { xs: 1.5, sm: 2 },
              py: { xs: 2, sm: 2.5 },
              pb: { xs: 3, sm: 4 }
            }}
          >
            <ManagementPaginatedCards
              key={viewMode}
              variant='list'
              pageSize={MY_GROUPS_LIST_PAGE_SIZE}
              items={currentData}
              renderContent={paginatedItems => (
                <List disablePadding sx={{ width: '100%' }}>
                  {viewMode === 'groups'
                    ? paginatedItems.map(item => renderGroupItem(item))
                    : paginatedItems.map(item => renderChannelItem(item))}
                </List>
              )}
            />
          </Box>
        )}
    </Box>
  )
}

export default GroupChannellist
