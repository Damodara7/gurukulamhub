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
  Badge
} from '@mui/material'
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

// Tab constants using string values
const values = {
  pending: 'pending',
  all: 'all',
  approved: 'approved',
  rejected: 'rejected'
}

const JoinRequestScreen = ({ group, removebutton }) => {
  const router = useRouter()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState({})
  const [rejectionReason, setRejectionReason] = useState('')
  const [selectedRequestId, setSelectedRequestId] = useState(null)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showUserDetails, setShowUserDetails] = useState(false)
  const [selectedUserDetails, setSelectedUserDetails] = useState(null)
  const [activeTab, setActiveTab] = useState(values.all)

  useEffect(() => {
    if (group) {
      fetchPendingRequests()
    }
  }, [group])

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

    return <Chip icon={config.icon} label={config.label} color={config.color} size='small' variant='outlined' />
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
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f0f2f5' }}>
      {/* Header */}
      <Paper elevation={1} sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#fff' }}>
        {/* Centered Group Name */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <GroupIcon color='primary' />
            <Typography
              variant='h6'
              component='h1'
              sx={{
                fontWeight: 600,
                color: '#1f2937',
                textAlign: 'center',
                wordBreak: 'break-word',
                maxWidth: '100%'
              }}
            >
              {group.groupName}
            </Typography>
          </Box>
        </Box>

        {/* Status Filter Tabs */}
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant='fullWidth'
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              minHeight: 48
            }
          }}
        >
          <Tab
            value={values.all}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon fontSize='small' />
                <Typography>All</Typography>
                {statusCounts.all > 0 && (
                  <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>({statusCounts.all})</Typography>
                )}
              </Box>
            }
          />
          <Tab
            value={values.pending}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTimeIcon fontSize='small' />
                <Typography>Pending</Typography>
                {statusCounts.pending > 0 && (
                  <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                    ({statusCounts.pending})
                  </Typography>
                )}
              </Box>
            }
          />

          <Tab
            value={values.approved}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon fontSize='small' />
                <Typography>Approved</Typography>
                {statusCounts.approved > 0 && (
                  <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                    ({statusCounts.approved})
                  </Typography>
                )}
              </Box>
            }
          />
          <Tab
            value={values.rejected}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CancelIcon fontSize='small' />
                <Typography>Rejected</Typography>
                {statusCounts.rejected > 0 && (
                  <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                    ({statusCounts.rejected})
                  </Typography>
                )}
              </Box>
            }
          />
        </Tabs>
      </Paper>

      {/* Content - WhatsApp Style List */}
      <Box sx={{ flex: 1, overflow: 'hidden', bgcolor: '#f0f2f5' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress size={60} />
          </Box>
        ) : filteredRequests.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, px: 3 }}>
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                bgcolor: '#e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3
              }}
            >
              <PersonIcon sx={{ fontSize: 60, color: '#9ca3af' }} />
            </Box>
            <Typography variant='h6' color='text.secondary' sx={{ mb: 1, fontWeight: 500 }}>
              No {activeTab === values.all ? '' : activeTab} requests
            </Typography>
            <Typography variant='body2' color='text.secondary'>
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
          <Box sx={{ height: '100%', overflow: 'auto' }}>
            <List sx={{ p: 0 }}>
              {filteredRequests.map((request, index) => (
                <ListItem
                  key={request._id}
                  sx={{
                    bgcolor: '#fff',
                    borderBottom: '1px solid #e5e7eb',
                    px: 2,
                    py: 1.5,
                    '&:hover': {
                      bgcolor: '#f9fafb'
                    }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: '#3b82f6',
                        width: 50,
                        height: 50,
                        fontSize: '1.2rem',
                        fontWeight: 600
                      }}
                    >
                      {request.userDetails?.profile?.firstname?.[0] || 'U'}
                    </Avatar>
                  </ListItemAvatar>

                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant='subtitle1' sx={{ fontWeight: 600, color: '#1f2937' }}>
                          {request.userDetails?.profile?.firstname && request.userDetails?.profile?.lastname
                            ? `${request.userDetails.profile.firstname} ${request.userDetails.profile.lastname}`
                            : request.userDetails?.profile?.firstname || 'Unknown User'}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getStatusChip(request.status)}
                        </Box>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant='body2' color='text.secondary' sx={{ mb: 0.5 }}>
                          {request.userEmail}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          Requested on {new Date(request.createdAt).toLocaleDateString()}
                        </Typography>
                        {request.rejectedReason && (
                          <Typography variant='caption' color='error' sx={{ display: 'block', mt: 0.5 }}>
                            Reason: {request.rejectedReason}
                          </Typography>
                        )}
                      </Box>
                    }
                  />

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
                    <Tooltip title='View Details'>
                      <IconButton
                        size='small'
                        onClick={() => openUserDetails(request.userDetails)}
                        sx={{ color: '#6b7280' }}
                      >
                        <VisibilityIcon fontSize='small' />
                      </IconButton>
                    </Tooltip>

                    {request.status === 'pending' && (
                      <>
                        <Tooltip title='Approve'>
                          <IconButton
                            size='small'
                            onClick={() => handleApprove(request._id)}
                            disabled={processing[request._id]}
                            sx={{ color: '#10b981' }}
                          >
                            {processing[request._id] ? (
                              <CircularProgress size={16} />
                            ) : (
                              <CheckCircleIcon fontSize='small' />
                            )}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title='Reject'>
                          <IconButton
                            size='small'
                            onClick={() => openRejectDialog(request._id)}
                            disabled={processing[request._id]}
                            sx={{ color: '#ef4444' }}
                          >
                            <CancelIcon fontSize='small' />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </Box>
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Box>

      {/* Bottom Back Button */}
      {!removebutton && (
        <Box sx={{ p: 3, bgcolor: '#fff', borderTop: '1px solid #e5e7eb' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              variant='contained'
              component='label'
              onClick={() => router.push('/management/group')}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                fontWeight: 600,
                color: 'white'
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
            zIndex: 1300
          }}
        >
          <Paper sx={{ p: 3, maxWidth: 500, width: '90%', maxHeight: '80vh', overflow: 'auto' }}>
            <Typography variant='h6' sx={{ mb: 2 }}>
              Reject Join Request
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
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
            />
            <Stack direction='row' spacing={2} justifyContent='flex-end'>
              <Button onClick={closeRejectDialog} component='label' variant='outlined' color='primary'>
                Cancel
              </Button>
              <Button
                variant='contained'
                component='label'
                color='error'
                onClick={() => handleReject(selectedRequestId, rejectionReason)}
                disabled={!rejectionReason.trim()}
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
