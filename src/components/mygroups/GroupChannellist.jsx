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
  Tooltip
} from '@mui/material'
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
import GroupCard from '../group/GroupCard'

const GroupChannellist = ({ groups = [], channels = [], onRequestProcessed }) => {
  const { data: session } = useSession()
  const [viewMode, setViewMode] = useState('groups')
  const [searchQuery, setSearchQuery] = useState('')
  const [requestStatus, setRequestStatus] = useState({})
  const [requestDetails, setRequestDetails] = useState({})
  const [loading, setLoading] = useState({})
  const [isSendingRequest, setIsSendingRequest] = useState(false)

  console.log('GroupChannellist received - groups:', groups.length, 'channels:', channels.length)
  console.log('Groups data:', groups)
  console.log('Channels data:', channels)

  // Check request status for each channel
  useEffect(() => {
    const checkRequestStatus = async () => {
      if (!session?.user?.email || channels.length === 0) return

      for (const channel of channels) {
        try {
          // Check user's request status for this group
          const result = await RestApi.get(`${API_URLS.v0.USERS_GROUP_REQUEST}?groupId=${channel._id}`)
          console.log('API result for channel', channel._id, ':', result)

          let userRequest = null
          let status = 'none'

          if (result?.status === 'success' && Array.isArray(result.result)) {
            userRequest = result.result.find(req => req.userEmail === session.user.email)
            if (userRequest) {
              status = userRequest.status
              console.log('User request found:', userRequest)
              console.log('Rejection reason:', userRequest.rejectedReason)
            }
          }

          setRequestStatus(prev => ({
            ...prev,
            [channel._id]: status
          }))

          if (userRequest) {
            console.log('Setting request details for channel:', channel._id, userRequest)
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

  // Refresh request status periodically for all requests
  useEffect(() => {
    const interval = setInterval(() => {
      const hasPendingRequests = Object.values(requestStatus).some(status => status === 'pending')
      const hasRejectedRequests = Object.values(requestStatus).some(status => status === 'rejected')

      if ((hasPendingRequests || hasRejectedRequests) && channels.length > 0) {
        console.log('Refreshing request status for all requests...')
        // Re-check request status for all channels
        const checkRequestStatus = async () => {
          if (!session?.user?.email) return

          for (const channel of channels) {
            try {
              const result = await RestApi.get(`${API_URLS.v0.USERS_GROUP_REQUEST}?groupId=${channel._id}`)
              if (result?.status === 'success' && Array.isArray(result.result)) {
                const userRequest = result.result.find(req => req.userEmail === session.user.email)
                if (userRequest) {
                  console.log('Updating request details for channel:', channel._id, userRequest)
                  console.log('Request status:', userRequest.status)
                  console.log('Rejection reason:', userRequest.rejectedReason)

                  const previousStatus = requestStatus[channel._id]

                  // Update both status and details
                  setRequestStatus(prev => ({
                    ...prev,
                    [channel._id]: userRequest.status
                  }))

                  setRequestDetails(prev => ({
                    ...prev,
                    [channel._id]: userRequest
                  }))

                  // If request was approved, notify parent to refresh groups
                  if (previousStatus === 'pending' && userRequest.status === 'approved') {
                    console.log('Request approved! Refreshing groups...')
                    if (onRequestProcessed) {
                      onRequestProcessed()
                    }
                  }
                }
              }
            } catch (error) {
              console.error('Error refreshing request status:', error)
            }
          }
        }
        checkRequestStatus()
      }
    }, 5000) // Check every 5 seconds

    return () => clearInterval(interval)
  }, [requestStatus, channels, session?.user?.email, onRequestProcessed])

  // Store the view mode when user manually switches to channels
  const [userSelectedChannels, setUserSelectedChannels] = useState(false)

  // Maintain channels view when user has manually selected it and is sending requests
  useEffect(() => {
    if (userSelectedChannels && isSendingRequest) {
      // If user manually selected channels and is sending a request, stay on channels
      if (viewMode !== 'channels') {
        setViewMode('channels')
      }
    }
  }, [userSelectedChannels, isSendingRequest, viewMode])

  const handleSendRequest = async channelId => {
    if (!session?.user?.email) {
      toast.error('Please log in to send join request')
      return
    }

    setIsSendingRequest(true)
    setLoading(prev => ({ ...prev, [channelId]: true }))
    try {
      console.log('API_URLS.v0.USERS_GROUP_REQUEST:', API_URLS.v0.USERS_GROUP_REQUEST)
      console.log('Sending request with groupId:', channelId)

      const result = await RestApi.post(`${API_URLS.v0.USERS_GROUP_REQUEST}`, {
        groupId: channelId
      })
      console.log('API Response:', result)
      if (result?.status === 'success') {
        toast.success('Join request sent successfully!')
        setRequestStatus(prev => ({ ...prev, [channelId]: 'pending' }))
        // Clear any previous request details
        setRequestDetails(prev => ({ ...prev, [channelId]: null }))
        // Don't refresh groups data immediately - let the periodic check handle it
        // This prevents the page from refreshing and switching tabs when sending requests
      } else {
        toast.error(result?.message || 'Failed to send join request')
      }
    } catch (error) {
      console.error('Error sending join request:', error)
      toast.error('An error occurred while sending join request')
    } finally {
      setLoading(prev => ({ ...prev, [channelId]: false }))
      setIsSendingRequest(false)
    }
  }

  const getRequestButton = channel => {
    const status = requestStatus[channel._id] || 'none'
    const requestDetail = requestDetails[channel._id]
    const isLoading = loading[channel._id]

    console.log('Rendering button for channel:', channel._id, 'status:', status, 'requestDetail:', requestDetail)
    console.log('Rejection reason:', requestDetail?.rejectedReason)
    console.log('Full requestDetail object:', JSON.stringify(requestDetail, null, 2))

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
      <Button variant='outlined' size='small' startIcon={<HourglassEmptyIcon />} color='warning'>
        Approval Pending
      </Button>
    ) : status === 'approved' ? (
      <Button variant='outlined' size='small' startIcon={<CheckCircleIcon />} color='success' disabled>
        Approved
      </Button>
    ) : status === 'rejected' ? (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Button variant='outlined' size='small' startIcon={<CancelIcon />} color='error' disabled>
          Rejected
        </Button>
        {requestDetail?.rejectedReason ? (
          <Typography
            variant='caption'
            color='error'
            sx={{ fontSize: '0.7rem', textAlign: 'center', display: 'block', mt: 0.5 }}
          >
            Reason: {requestDetail?.rejectedReason}
          </Typography>
        ) : (
          <Typography
            variant='caption'
            color='text.secondary'
            sx={{ fontSize: '0.7rem', textAlign: 'center', display: 'block', mt: 0.5, fontStyle: 'italic' }}
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
        sx={{ color: 'white' }}
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
        px: 2,
        py: 1.5,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        mb: 1,
        backgroundColor: 'background.paper'
      }}
    >
      <ListItemAvatar>
        <Avatar
          sx={{
            bgcolor: 'secondary.main',
            width: 50,
            height: 50
          }}
        >
          <GroupIcon />
        </Avatar>
      </ListItemAvatar>

      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Tooltip title={item.groupName || 'Untitled Group'} arrow>
              <Typography
                variant='subtitle1'
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                  mr: 1,
                  maxWidth: '100px'
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
              sx={{ minWidth: 'auto' }}
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
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    mb: 0.5,
                    maxWidth: '200px'
                  }}
                >
                  {item.description}
                </Typography>
              </Tooltip>
            )}
            <Typography variant='caption' color='text.secondary'>
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
        px: 2,
        py: 1.5,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        mb: 1,
        backgroundColor: 'background.paper'
      }}
    >
      <ListItemAvatar>
        <Avatar
          sx={{
            bgcolor: 'primary.main',
            width: 50,
            height: 50
          }}
        >
          <ChannelIcon />
        </Avatar>
      </ListItemAvatar>

      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Tooltip title={item.groupName || 'Untitled Channel'} arrow>
              <Typography
                variant='subtitle1'
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                  mr: 1,
                  maxWidth: '150px'
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
              sx={{ minWidth: 'auto' }}
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
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    mb: 0.5,
                    maxWidth: '250px'
                  }}
                >
                  {item.description}
                </Typography>
              </Tooltip>
            )}
            <Typography variant='caption' color='text.secondary'>
              {item.membersCount || item.members?.length || 0} members
            </Typography>
          </Box>
        }
      />

      {getRequestButton(item)}
    </ListItem>
  )

  const currentData = viewMode === 'groups' ? groups : filteredChannels
  const currentTitle = viewMode === 'groups' ? 'My Groups' : 'Channels'

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header with Toggle Buttons */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          borderBottom: '1px solid',
          borderColor: 'divider',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 5,
          backgroundColor: 'background.paper'
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant={viewMode === 'groups' ? 'contained' : 'outlined'}
            component={viewMode === 'groups' ? 'label' : 'button'}
            size='medium'
            onClick={() => handleViewModeChange('groups')}
            sx={{
              textTransform: 'none',
              borderRadius: 1,
              color: viewMode === 'groups' ? 'white' : 'black',
              px: 3,
              py: 1
            }}
          >
            Groups ({groups.length})
          </Button>
          <Button
            variant={viewMode === 'channels' ? 'contained' : 'outlined'}
            component={viewMode === 'channels' ? 'label' : 'button'}
            size='medium'
            onClick={() => handleViewModeChange('channels')}
            sx={{
              textTransform: 'none',
              borderRadius: 1,
              color: viewMode === 'channels' ? 'white' : 'black',
              px: 3,
              py: 1
            }}
          >
            Channels ({channels.length})
          </Button>
        </Box>

        {/* Selected button text below */}
        <Typography variant='h6' sx={{ color: 'text.primary', fontWeight: 500 }}>
          {currentTitle} ({currentData.length})
        </Typography>

        {/* Search bar for channels */}
        {viewMode === 'channels' && (
          <TextField
            placeholder='Search channels by name...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            size='small'
            sx={{
              width: '100%',
              maxWidth: 400,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
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
              py: 6,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              height: '100%',
              justifyContent: 'center'
            }}
          >
            <Avatar sx={{ bgcolor: 'grey.300', width: 80, height: 80 }}>
              {viewMode === 'groups' ? <GroupIcon sx={{ fontSize: 40 }} /> : <ChannelIcon sx={{ fontSize: 40 }} />}
            </Avatar>
            <Typography variant='h6' color='text.secondary'>
              {viewMode === 'groups' ? 'You are not a member of any groups yet' : 'No public channels available'}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {viewMode === 'groups' ? 'Join groups to see them here' : 'Check back later for new public channels'}
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              height: '100%',
              overflow: 'auto',
              p: 2,
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
