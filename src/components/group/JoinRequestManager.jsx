'use client'
import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  CardContent
} from '@mui/material'
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AccessTime as AccessTimeIcon,
  Info as InfoIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { toast } from 'react-toastify'
import UserDetailsPopup from './UserDetailsPopup'

const JoinRequestManager = ({ open, group, onClose, onRequestProcessed, onGroupCreated, onRefreshGroups }) => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState({})
  const [rejectionReason, setRejectionReason] = useState('')
  const [selectedRequestId, setSelectedRequestId] = useState(null)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showUserDetails, setShowUserDetails] = useState(false)
  const [selectedUserDetails, setSelectedUserDetails] = useState(null)

  useEffect(() => {
    if (open && group) {
      fetchPendingRequests()
    }
  }, [open, group])

  const fetchPendingRequests = async () => {
    if (!group?._id) return

    setLoading(true)
    try {
      // Fetch all requests (pending, approved, rejected) to show complete history
      const result = await RestApi.get(`${API_URLS.v0.USERS_GROUP_REQUEST}?groupId=${group._id}`)
      if (result?.status === 'success') {
        setRequests(result.result || [])
      } else {
        console.error('Error fetching requests:', result.message)
        toast.error('Failed to fetch join requests')
      }
    } catch (error) {
      console.error('Error fetching requests:', error)
      toast.error('An error occurred while fetching requests')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async requestId => {
    setProcessing(prev => ({ ...prev, [requestId]: 'approve' }))
    try {
      const result = await RestApi.put(`${API_URLS.v0.USERS_GROUP_REQUEST}`, {
        requestId,
        action: 'approve'
      })

      if (result?.status === 'success') {
        toast.success('Request approved successfully!')
        // Remove the approved request from the list
        setRequests(prev => prev.filter(req => req._id !== requestId))
        if (onRequestProcessed) {
          onRequestProcessed()
        }
        // Refresh groups data to update member counts
        if (onRefreshGroups) {
          onRefreshGroups()
        }
      } else {
        toast.error(result?.message || 'Failed to approve request')
      }
    } catch (error) {
      console.error('Error approving request:', error)
      toast.error('An error occurred while approving request')
    } finally {
      setProcessing(prev => ({ ...prev, [requestId]: null }))
    }
  }

  const handleReject = async (requestId, reason) => {
    if (!reason || reason.trim() === '') {
      toast.error('Please provide a reason for rejection')
      return
    }

    setProcessing(prev => ({ ...prev, [requestId]: 'reject' }))
    try {
      const result = await RestApi.put(`${API_URLS.v0.USERS_GROUP_REQUEST}`, {
        requestId,
        action: 'reject',
        rejectedReason: reason.trim()
      })

      if (result?.status === 'success') {
        toast.success('Request rejected successfully!')
        // Remove the rejected request from the list
        setRequests(prev => prev.filter(req => req._id !== requestId))
        if (onRequestProcessed) {
          onRequestProcessed()
        }
      } else {
        toast.error(result?.message || 'Failed to reject request')
      }
    } catch (error) {
      console.error('Error rejecting request:', error)
      toast.error('An error occurred while rejecting request')
    } finally {
      setProcessing(prev => ({ ...prev, [requestId]: null }))
      setShowRejectDialog(false)
      setRejectionReason('')
      setSelectedRequestId(null)
    }
  }

  const openRejectDialog = requestId => {
    setSelectedRequestId(requestId)
    setShowRejectDialog(true)
  }

  const closeRejectDialog = () => {
    setShowRejectDialog(false)
    setRejectionReason('')
    setSelectedRequestId(null)
  }

  const handleViewUserDetails = request => {
    setSelectedUserDetails(request.userDetails)
    setShowUserDetails(true)
  }

  const closeUserDetails = () => {
    setShowUserDetails(false)
    setSelectedUserDetails(null)
  }
  console.log('request details', requests)
  if (!group) return null

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccessTimeIcon color='warning' />
            <Typography variant='h6'>Join Requests for "{group.groupName}"</Typography>
          </Box>
        </DialogTitle>

        <DialogContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
            </Box>
          ) : requests.length === 0 ? (
            <Alert severity='info' sx={{ mt: 2 }}>
              No join requests for this group.
            </Alert>
          ) : (
            <List sx={{ maxHeight: 500, overflow: 'auto' }}>
              {requests.map((request, index) => (
                <React.Fragment key={request._id}>
                  <ListItem sx={{ px: 0, py: 2 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {request.userDetails?.profile?.firstname && request.userDetails?.profile?.lastname
                          ? request.userDetails?.profile?.firstname[0]?.toUpperCase() &&
                            request.userDetails?.profile?.lastname[0]?.toUpperCase()
                          : request.userDetails?.profile?.firstname[0]?.toUpperCase() ||
                            request.userDetails?.profile?.lastname[0]?.toUpperCase() ||
                            'U'}
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
                            gap: 1
                          }}
                        >
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant='subtitle1' fontWeight={600} sx={{ wordBreak: 'break-word' }}>
                              {request.userDetails?.profile?.firstname && request.userDetails?.profile?.lastname
                                ? `${request.userDetails.profile.firstname} ${request.userDetails.profile.lastname}`
                                : request.userDetails.profile.firstname ||
                                  request.userDetails.profile.lastname ||
                                  'no name'}
                            </Typography>
                            <Typography variant='body2' color='text.secondary' sx={{ wordBreak: 'break-word' }}>
                              {request.userEmail}
                            </Typography>
                            {request.userDetails?.profile && (
                              <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                                {request.userDetails.profile.age && (
                                  <Chip
                                    size='small'
                                    label={`Age: ${request.userDetails.profile.age}`}
                                    variant='outlined'
                                    color='primary'
                                  />
                                )}
                                {request.userDetails.profile.gender && (
                                  <Chip
                                    size='small'
                                    label={
                                      request.userDetails.profile.gender.charAt(0).toUpperCase() +
                                      request.userDetails.profile.gender.slice(1)
                                    }
                                    variant='outlined'
                                    color='secondary'
                                  />
                                )}
                                {request.userDetails.profile.locality && (
                                  <Chip
                                    size='small'
                                    label={request.userDetails.profile.locality}
                                    variant='outlined'
                                    color='default'
                                  />
                                )}
                              </Box>
                            )}
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                            <Chip
                              icon={
                                request.status === 'pending' ? (
                                  <AccessTimeIcon sx={{ fontSize: 16 }} />
                                ) : request.status === 'approved' ? (
                                  <CheckCircleIcon sx={{ fontSize: 16 }} />
                                ) : (
                                  <CancelIcon sx={{ fontSize: 16 }} />
                                )
                              }
                              label={
                                request.status === 'pending'
                                  ? 'Pending'
                                  : request.status === 'approved'
                                    ? 'Approved'
                                    : 'Rejected'
                              }
                              color={
                                request.status === 'pending'
                                  ? 'warning'
                                  : request.status === 'approved'
                                    ? 'success'
                                    : 'error'
                              }
                              size='small'
                              variant='outlined'
                            />
                          </Box>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant='caption' color='text.secondary' sx={{ mb: 1, display: 'block' }}>
                            Requested: {new Date(request.createdAt).toLocaleDateString()}
                          </Typography>
                          {request.status === 'rejected' && request.rejectionReason && (
                            <Box
                              sx={{
                                mt: 1,
                                p: 1,
                                bgcolor: 'error.light',
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'error.main'
                              }}
                            >
                              <Typography
                                variant='caption'
                                color='error'
                                sx={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 0.5 }}
                              >
                                <InfoIcon sx={{ fontSize: 14 }} />
                                Rejection Reason:
                              </Typography>
                              <Typography
                                variant='caption'
                                color='error'
                                sx={{ display: 'block', mt: 0.5, fontSize: '0.7rem' }}
                              >
                                {request.rejectionReason}
                              </Typography>
                            </Box>
                          )}
                          {request.status === 'approved' && request.approvedAt && (
                            <Typography variant='caption' color='success.main' sx={{ display: 'block', mt: 0.5 }}>
                              Approved: {new Date(request.approvedAt).toLocaleDateString()}
                            </Typography>
                          )}
                        </Box>
                      }
                    />

                    <Box
                      sx={{
                        display: 'flex',
                        gap: 1,
                        ml: { xs: 0, sm: 2 },
                        mt: { xs: 1, sm: 0 },
                        flexWrap: 'wrap',
                        justifyContent: { xs: 'flex-start', sm: 'flex-end' }
                      }}
                    >
                      <Button
                        variant='outlined'
                        color='info'
                        size='small'
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleViewUserDetails(request)}
                        disabled={!request.userDetails}
                        sx={{ minWidth: 'auto', flex: { xs: '1 1 auto', sm: '0 0 auto' } }}
                      >
                        <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>View Details</Box>
                        <Box sx={{ display: { xs: 'inline', sm: 'none' } }}>View</Box>
                      </Button>
                      {request.status === 'pending' && (
                        <>
                          <Button
                            variant='contained'
                            color='success'
                            size='small'
                            startIcon={
                              processing[request._id] === 'approve' ? (
                                <CircularProgress size={16} />
                              ) : (
                                <CheckCircleIcon />
                              )
                            }
                            onClick={() => handleApprove(request._id)}
                            disabled={processing[request._id]}
                            sx={{ minWidth: 'auto', flex: { xs: '1 1 auto', sm: '0 0 auto' } }}
                          >
                            {processing[request._id] === 'approve' ? 'Approving...' : 'Approve'}
                          </Button>
                          <Button
                            variant='outlined'
                            color='error'
                            size='small'
                            startIcon={
                              processing[request._id] === 'reject' ? <CircularProgress size={16} /> : <CancelIcon />
                            }
                            onClick={() => openRejectDialog(request._id)}
                            disabled={processing[request._id]}
                            sx={{ minWidth: 'auto', flex: { xs: '1 1 auto', sm: '0 0 auto' } }}
                          >
                            {processing[request._id] === 'reject' ? 'Rejecting...' : 'Reject'}
                          </Button>
                        </>
                      )}
                    </Box>
                  </ListItem>
                  {index < requests.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} color='primary'>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rejection Reason Dialog */}
      <Dialog open={showRejectDialog} onClose={closeRejectDialog} maxWidth='sm' fullWidth>
        <DialogTitle>Reject Join Request</DialogTitle>
        <DialogContent>
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
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeRejectDialog} color='primary'>
            Cancel
          </Button>
          <Button
            onClick={() => handleReject(selectedRequestId, rejectionReason)}
            color='error'
            variant='contained'
            disabled={!rejectionReason.trim()}
          >
            Reject Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Details Popup */}
      <UserDetailsPopup open={showUserDetails} userDetails={selectedUserDetails} onClose={closeUserDetails} />
    </>
  )
}

export default JoinRequestManager
