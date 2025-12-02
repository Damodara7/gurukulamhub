'use client'
import React, { useState, useEffect } from 'react'
import {
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  TextField,
  Alert,
  CircularProgress,
  Divider,
  Stack,
  Card,
  CardContent,
  Grid,
  Paper,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Badge,
  useTheme,
  useMediaQuery
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AccessTime as AccessTimeIcon,
  Info as InfoIcon,
  Visibility as VisibilityIcon,
  ArrowBack as ArrowBackIcon,
  Group as GroupIcon,
  Person as PersonIcon
} from '@mui/icons-material'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { toast } from 'react-toastify'
import UserDetailsPopup from './UserDetailsPopup'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

// Tab constants using string values
const values = {
  pending: 'pending',
  all: 'all',
  approved: 'approved',
  rejected: 'rejected'
}

const JoinRequestScreen = ({ group, removebutton }) => {
  const theme = useTheme()
  const router = useRouter()
  const { data: session } = useSession()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState({})
  const [rejectionReason, setRejectionReason] = useState('')
  const [selectedRequestId, setSelectedRequestId] = useState(null)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showUserDetails, setShowUserDetails] = useState(false)
  const [selectedUserDetails, setSelectedUserDetails] = useState(null)
  const [activeTab, setActiveTab] = useState(values.pending)
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (group) {
      fetchPendingRequests()
    }
  }, [group])

  // WebSocket connection for group requests
  useEffect(() => {
    if (!group?._id) return

    const wsUrl =
      typeof window !== 'undefined'
        ? `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/api/ws/group-requests/${
            group._id
          }`
        : ''
    if (wsUrl) {
      const wsRef = new WebSocket(wsUrl)
      wsRef.onopen = () => {
        console.log(`[WS] Connected to group requests for group ${group._id}`)
        setIsConnected(true)
        setSocket(wsRef)
      }
      wsRef.onmessage = event => {
        try {
          const msg = JSON.parse(event.data)
          if (msg.type === 'groupRequests') {
            console.log('[WS] Group requests updated:', msg.data)

            switch (msg.data.type) {
              case 'requestSent':
                console.log('New group request received:', msg.data)
                if (msg.data.groupId === group?._id) {
                  // Add new request to the list
                  setRequests(prev => [msg.data, ...prev])
                }
                break

              case 'requestApproved':
                console.log('Group request approved:', msg.data)
                if (msg.data.groupId === group?._id) {
                  // Update the request status in the list
                  setRequests(prev =>
                    prev.map(req =>
                      req._id === msg.data._id ? { ...req, status: 'approved', approvedAt: msg.data.approvedAt } : req
                    )
                  )
                }
                break

              case 'requestRejected':
                console.log('Group request rejected:', msg.data)
                if (msg.data.groupId === group?._id) {
                  // Update the request status in the list
                  setRequests(prev =>
                    prev.map(req =>
                      req._id === msg.data._id
                        ? {
                            ...req,
                            status: 'rejected',
                            rejectedAt: msg.data.rejectedAt,
                            rejectedReason: msg.data.rejectedReason
                          }
                        : req
                    )
                  )
                }
                break

              default:
                console.log('Unknown request type:', msg.data.type)
            }
          }
        } catch (e) {
          console.error('[WS] Error parsing group requests message', e)
        }
      }
      wsRef.onerror = err => {
        console.error(`[WS] Group requests error for group ${group._id}`, err)
        setIsConnected(false)
      }
      wsRef.onclose = () => {
        console.log(`[WS] Group requests connection closed for group ${group._id}`)
        setIsConnected(false)
      }

      return () => {
        wsRef.close()
      }
    }
  }, [group?._id])

  const fetchPendingRequests = async () => {
    if (!group?._id) return

    setLoading(true)
    try {
      const result = await RestApi.get(`${API_URLS.v0.USERS_GROUP_REQUEST}?groupId=${group._id}`)
      if (result?.status === 'success') {
        setRequests(result.result || [])
      } else {
        console.error('Error fetching requests:', result)
        toast.error('Failed to fetch join requests')
      }
    } catch (error) {
      console.error('Error fetching requests:', error)
      toast.error('An error occurred while fetching join requests')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async requestId => {
    setProcessing(prev => ({ ...prev, [requestId]: true }))
    try {
      const result = await RestApi.put(`${API_URLS.v0.USERS_GROUP_REQUEST}`, {
        requestId,
        action: 'approve'
      })

      if (result?.status === 'success') {
        toast.success('Join request approved successfully!')
        // Changes will be reflected after page refresh
        // No immediate UI updates
      } else {
        toast.error(result?.message || 'Failed to approve request')
      }
    } catch (error) {
      console.error('Error approving request:', error)
      toast.error('An error occurred while approving the request')
    } finally {
      setProcessing(prev => ({ ...prev, [requestId]: false }))
    }
  }

  const handleReject = async (requestId, reason) => {
    setProcessing(prev => ({ ...prev, [requestId]: true }))
    try {
      const result = await RestApi.put(`${API_URLS.v0.USERS_GROUP_REQUEST}`, {
        requestId,
        action: 'reject',
        rejectedReason: reason
      })

      if (result?.status === 'success') {
        toast.success('Join request rejected successfully!')
        // Changes will be reflected after page refresh
        // No immediate UI updates
      } else {
        toast.error(result?.message || 'Failed to reject request')
      }
    } catch (error) {
      console.error('Error rejecting request:', error)
      toast.error('An error occurred while rejecting the request')
    } finally {
      setProcessing(prev => ({ ...prev, [requestId]: false }))
      closeRejectDialog()
    }
  }

  const openRejectDialog = requestId => {
    setSelectedRequestId(requestId)
    setRejectionReason('')
    setShowRejectDialog(true)
  }

  const closeRejectDialog = () => {
    setShowRejectDialog(false)
    setSelectedRequestId(null)
    setRejectionReason('')
  }

  const openUserDetails = userDetails => {
    setSelectedUserDetails(userDetails)
    setShowUserDetails(true)
  }

  const closeUserDetails = () => {
    setShowUserDetails(false)
    setSelectedUserDetails(null)
  }

  // Status chip configuration object
  const statusChipConfig = {
    pending: {
      icon: <AccessTimeIcon />,
      label: 'Pending',
      color: 'warning'
    },
    approved: {
      icon: <CheckCircleIcon />,
      label: 'Approved',
      color: 'success'
    },
    rejected: {
      icon: <CancelIcon />,
      label: 'Rejected',
      color: 'error'
    }
  }

  const getStatusChip = status => {
    const config = statusChipConfig[status]
    if (!config) return null

    return (
      <Chip
        icon={config.icon}
        label={config.label}
        color={config.color}
        size='small'
        variant='outlined'
        sx={{
          height: { xs: 24, sm: 28 },
          fontSize: { xs: '0.7rem', sm: '0.75rem' },
          '& .MuiChip-icon': {
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }
        }}
      />
    )
  }

  // Filter requests based on active tab
  const getFilteredRequests = () => {
    if (activeTab === values.pending) {
      return requests.filter(req => req.status === 'pending')
    }
    if (activeTab === values.approved) {
      return requests.filter(req => req.status === 'approved')
    }
    if (activeTab === values.rejected) {
      return requests.filter(req => req.status === 'rejected')
    }
    // Default to all requests
    return requests
  }

  const filteredRequests = getFilteredRequests()

  // Get counts for each status
  const getStatusCounts = () => {
    const pending = requests.filter(req => req.status === 'pending').length
    const approved = requests.filter(req => req.status === 'approved').length
    const rejected = requests.filter(req => req.status === 'rejected').length
    const all = requests.length
    return { pending, approved, rejected, all }
  }

  const statusCounts = getStatusCounts()

  if (!group) return null

  return (
    <Box
      sx={{
        maxHeight: { xs: '100vh', sm: '100vh' },
        display: 'flex',
        flexDirection: 'column',
        bgcolor: theme.palette.mode === 'dark' ? theme.palette.background.default : '#f0f2f5'
      }}
    >
      {/* Header */}
      <Paper
        elevation={1}
        sx={{
          p: { xs: 1, sm: 2 },
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: theme.palette.background.paper
        }}
      >
        {/* Status Filter Tabs */}
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant={isMobile ? 'scrollable' : 'fullWidth'}
          scrollButtons='auto'
          allowScrollButtonsMobile
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              minHeight: { xs: 40, sm: 48 },
              fontSize: { xs: '0.7rem', sm: removebutton ? '0.75rem' : '0.875rem' },
              px: { xs: 1.5, sm: 1 },
              minWidth: { xs: 'auto', sm: 0 },
              mr: { xs: 1, sm: 0 }
            }
          }}
        >
          <Tab
            value={values.all}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 }, flexWrap: 'nowrap' }}>
                <PersonIcon sx={{ fontSize: { xs: '0.875rem', sm: '1.25rem' } }} />
                <Typography
                  sx={{ fontSize: { xs: '0.7rem', sm: removebutton ? '0.75rem' : '0.875rem' }, whiteSpace: 'nowrap' }}
                >
                  All
                </Typography>
                {statusCounts.all > 0 && (
                  <Typography
                    sx={{
                      color: 'text.secondary',
                      fontSize: { xs: '0.65rem', sm: removebutton ? '0.7rem' : '0.875rem' },
                      whiteSpace: 'nowrap'
                    }}
                  >
                    ({statusCounts.all})
                  </Typography>
                )}
              </Box>
            }
          />
          <Tab
            value={values.pending}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 }, flexWrap: 'nowrap' }}>
                <AccessTimeIcon sx={{ fontSize: { xs: '0.875rem', sm: '1.25rem' } }} />
                <Typography
                  sx={{ fontSize: { xs: '0.7rem', sm: removebutton ? '0.75rem' : '0.875rem' }, whiteSpace: 'nowrap' }}
                >
                  Pending
                </Typography>
                {statusCounts.pending > 0 && (
                  <Typography
                    sx={{
                      color: 'text.secondary',
                      fontSize: { xs: '0.65rem', sm: removebutton ? '0.7rem' : '0.875rem' },
                      whiteSpace: 'nowrap'
                    }}
                  >
                    ({statusCounts.pending})
                  </Typography>
                )}
              </Box>
            }
          />

          <Tab
            value={values.approved}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 }, flexWrap: 'nowrap' }}>
                <CheckCircleIcon sx={{ fontSize: { xs: '0.875rem', sm: '1.25rem' } }} />
                <Typography
                  sx={{ fontSize: { xs: '0.7rem', sm: removebutton ? '0.75rem' : '0.875rem' }, whiteSpace: 'nowrap' }}
                >
                  Approved
                </Typography>
                {statusCounts.approved > 0 && (
                  <Typography
                    sx={{
                      color: 'text.secondary',
                      fontSize: { xs: '0.65rem', sm: removebutton ? '0.7rem' : '0.875rem' },
                      whiteSpace: 'nowrap'
                    }}
                  >
                    ({statusCounts.approved})
                  </Typography>
                )}
              </Box>
            }
          />
          <Tab
            value={values.rejected}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 }, flexWrap: 'nowrap' }}>
                <CancelIcon sx={{ fontSize: { xs: '0.875rem', sm: '1.25rem' } }} />
                <Typography
                  sx={{ fontSize: { xs: '0.7rem', sm: removebutton ? '0.75rem' : '0.875rem' }, whiteSpace: 'nowrap' }}
                >
                  Rejected
                </Typography>
                {statusCounts.rejected > 0 && (
                  <Typography
                    sx={{
                      color: 'text.secondary',
                      fontSize: { xs: '0.65rem', sm: removebutton ? '0.7rem' : '0.875rem' },
                      whiteSpace: 'nowrap'
                    }}
                  >
                    ({statusCounts.rejected})
                  </Typography>
                )}
              </Box>
            }
          />
        </Tabs>
      </Paper>

      {/* Content - WhatsApp Style List */}
      <Box
        sx={{
          flex: 1,
          overflow: 'hidden',
          bgcolor: theme.palette.mode === 'dark' ? theme.palette.background.default : '#f0f2f5'
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: { xs: '50vh', sm: '100%' },
              minHeight: { xs: 300, sm: 'auto' }
            }}
          >
            <CircularProgress size={{ xs: 40, sm: 60 }} />
          </Box>
        ) : filteredRequests.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: { xs: 4, sm: 8 }, px: { xs: 2, sm: 3 } }}>
            <Box
              sx={{
                width: { xs: 80, sm: 120 },
                height: { xs: 80, sm: 120 },
                borderRadius: '50%',
                bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.divider, 0.3) : '#e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: { xs: 2, sm: 3 }
              }}
            >
              <PersonIcon
                sx={{
                  fontSize: { xs: 40, sm: 60 },
                  color: theme.palette.mode === 'dark' ? theme.palette.text.secondary : '#9ca3af'
                }}
              />
            </Box>
            <Typography
              variant='h6'
              color='text.secondary'
              sx={{ mb: 1, fontWeight: 500, fontSize: { xs: '1rem', sm: '1.25rem' } }}
            >
              No {activeTab === values.all ? '' : activeTab} requests
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
              {activeTab === values.pending
                ? 'All join requests have been processed'
                : activeTab === values.all
                  ? 'No join requests found'
                  : activeTab === values.approved
                    ? 'No approved requests yet'
                    : 'No rejected requests yet'}
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              height: { xs: 'auto', sm: '100%' },
              overflow: 'auto',
              maxHeight: { xs: 'calc(100vh - 200px)', sm: 'none' }
            }}
          >
            <List sx={{ p: 0 }}>
              {filteredRequests.map((request, index) => (
                <ListItem
                  key={request._id}
                  sx={{
                    bgcolor: theme.palette.background.paper,
                    borderBottom: `1px solid ${alpha(
                      theme.palette.divider,
                      theme.palette.mode === 'dark' ? 0.12 : 0.08
                    )}`,
                    px: { xs: 1, sm: 2 },
                    py: { xs: 1.5, sm: 2 },
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    gap: { xs: 1.5, sm: 2 },
                    '&:hover': {
                      bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.action.hover, 0.5) : '#f9fafb'
                    }
                  }}
                >
                  {/* Avatar on the left */}
                  <Avatar
                    sx={{
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      width: { xs: 40, sm: 56 },
                      height: { xs: 40, sm: 56 },
                      fontSize: { xs: '0.95rem', sm: '1.3rem' },
                      fontWeight: 600,
                      color: 'white',
                      boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
                      flexShrink: 0
                    }}
                  >
                    {request.userDetails?.profile?.firstname && request.userDetails?.profile?.lastname
                      ? `${request.userDetails.profile.firstname[0]} ${request.userDetails.profile.lastname[0]}`
                      : request.userDetails?.profile?.firstname[0] || request.userDetails?.profile?.lastname[0] || 'U'}
                  </Avatar>

                  {/* Name, Email, and Request Date - Middle Section */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Tooltip
                      title={
                        request.userDetails?.profile?.firstname && request.userDetails?.profile?.lastname
                          ? `${request.userDetails.profile.firstname} ${request.userDetails.profile.lastname}`
                          : request.userDetails?.profile?.firstname ||
                            request.userDetails?.profile?.lastname ||
                            'Unknown User'
                      }
                      arrow
                    >
                      <Typography
                        variant='subtitle1'
                        sx={{
                          fontWeight: 600,
                          color: 'text.primary',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease-in-out',
                          fontSize: { xs: '0.9375rem', sm: '1rem' },
                          mb: 0.5,
                          '&:hover': {
                            color: 'primary.main'
                          }
                        }}
                      >
                        {request.userDetails?.profile?.firstname && request.userDetails?.profile?.lastname
                          ? `${request.userDetails.profile.firstname} ${request.userDetails.profile.lastname}`
                          : request.userDetails?.profile?.firstname || 'Unknown User'}
                      </Typography>
                    </Tooltip>

                    <Tooltip title={request.userEmail} arrow>
                      <Typography
                        variant='body2'
                        color='text.secondary'
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease-in-out',
                          fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                          mb: 0.5,
                          '&:hover': {
                            color: 'primary.main'
                          }
                        }}
                      >
                        {request.userEmail}
                      </Typography>
                    </Tooltip>

                    <Typography
                      variant='caption'
                      color='text.secondary'
                      sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' }, display: 'block' }}
                    >
                      Requested on {new Date(request.createdAt).toLocaleDateString()}
                    </Typography>

                    {request.rejectedReason && (
                      <Tooltip title={`Reason: ${request.rejectedReason}`} arrow>
                        <Typography
                          variant='caption'
                          color='error'
                          sx={{
                            display: 'block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            mt: 0.5,
                            fontSize: { xs: '0.7rem', sm: '0.75rem' }
                          }}
                        >
                          Reason: {request.rejectedReason}
                        </Typography>
                      </Tooltip>
                    )}
                  </Box>

                  {/* Status Chip and Action Buttons - Right Side */}
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: { xs: 1, sm: 1.5 },
                      flexShrink: 0
                    }}
                  >
                    {/* Status Chip on top right */}
                    <Box>{getStatusChip(request.status)}</Box>

                    {/* View Icon and Action Buttons below */}
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: { xs: 0.5, sm: 0.75 }
                      }}
                    >
                      <Tooltip title='View Details'>
                        <IconButton
                          size='small'
                          onClick={() => openUserDetails(request.userDetails)}
                          sx={{
                            color: theme.palette.mode === 'dark' ? theme.palette.text.secondary : '#6b7280',
                            width: { xs: 36, sm: 40 },
                            height: { xs: 36, sm: 40 }
                          }}
                        >
                          <VisibilityIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                        </IconButton>
                      </Tooltip>

                      {request.status === 'pending' && (
                        <>
                          <Tooltip title='Approve'>
                            <IconButton
                              size='small'
                              onClick={() => handleApprove(request._id)}
                              disabled={processing[request._id]}
                              sx={{
                                color: theme.palette.success.main,
                                width: { xs: 36, sm: 40 },
                                height: { xs: 36, sm: 40 }
                              }}
                            >
                              {processing[request._id] ? (
                                <CircularProgress size={{ xs: 14, sm: 16 }} />
                              ) : (
                                <CheckCircleIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                              )}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title='Reject'>
                            <IconButton
                              size='small'
                              onClick={() => openRejectDialog(request._id)}
                              disabled={processing[request._id]}
                              sx={{
                                color: theme.palette.error.main,
                                width: { xs: 36, sm: 40 },
                                height: { xs: 36, sm: 40 }
                              }}
                            >
                              <CancelIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Box>
                  </Box>
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Box>

      {/* Bottom Back Button */}
      {!removebutton && (
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            bgcolor: theme.palette.background.paper,
            borderTop: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.12 : 0.08)}`
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              variant='contained'
              component='label'
              onClick={() => router.push('/management/group')}
              sx={{
                px: { xs: 3, sm: 4 },
                py: { xs: 1, sm: 1.5 },
                borderRadius: 2,
                fontWeight: 600,
                fontSize: { xs: '0.875rem', sm: '1rem' },
                color: 'white',
                minWidth: { xs: 140, sm: 'auto' }
              }}
            >
              Back to Groups
            </Button>
          </Box>
        </Box>
      )}

      {/* Rejection Dialog */}
      {showRejectDialog && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1300,
            p: { xs: 2, sm: 0 }
          }}
        >
          <Paper
            sx={{
              p: { xs: 2, sm: 3 },
              maxWidth: 500,
              width: '100%',
              maxHeight: { xs: '90vh', sm: '80vh' },
              overflow: 'auto'
            }}
          >
            <Typography variant='h6' sx={{ mb: 2, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              Reject Join Request
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
              Please provide a reason for rejecting this join request. This will help the user understand why their
              request was not approved.
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              label='Rejection Reason'
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              placeholder='Enter the reason for rejection...'
              required
              error={!rejectionReason.trim()}
              helperText={!rejectionReason.trim() ? 'Rejection reason is required' : ''}
              sx={{ mb: 3 }}
              InputProps={{
                sx: {
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }
              }}
              InputLabelProps={{
                sx: {
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }
              }}
            />
            <Stack direction='row' spacing={2} justifyContent='flex-end' flexWrap='wrap' sx={{ gap: { xs: 1, sm: 2 } }}>
              <Button
                onClick={closeRejectDialog}
                component='label'
                variant='outlined'
                color='primary'
                sx={{
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  px: { xs: 2, sm: 3 },
                  py: { xs: 0.75, sm: 1 },
                  color: theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.text.primary
                }}
              >
                Cancel
              </Button>
              <Button
                variant='contained'
                component='label'
                color='error'
                onClick={() => handleReject(selectedRequestId, rejectionReason)}
                disabled={!rejectionReason.trim()}
                sx={{
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  px: { xs: 2, sm: 3 },
                  py: { xs: 0.75, sm: 1 }
                }}
              >
                Reject Request
              </Button>
            </Stack>
          </Paper>
        </Box>
      )}

      {/* User Details Popup */}
      <UserDetailsPopup open={showUserDetails} userDetails={selectedUserDetails} onClose={closeUserDetails} />
    </Box>
  )
}

export default JoinRequestScreen
