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
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material'
import {
  Group as GroupIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'

const GroupDetailsPopup = ({ open, group, onClose }) => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (open && group) {
      fetchGroupUsers()
    }
  }, [open, group])

  const fetchGroupUsers = async () => {
    if (!group) return
    
    setLoading(true)
    setError(null)
    
          try {
        // Fetch all users and filter by groupIds
        const result = await RestApi.get(`${API_URLS.v0.USER}`)
        if (result?.status === 'success') {
          const allUsers = Array.isArray(result.result) ? result.result : [result.result]
          const groupUsers = allUsers.filter(user => 
            user.groupIds && user.groupIds.includes(group._id)
          )
          
          // For now, we'll work with the basic user data
          // In a real implementation, you might want to fetch profile data separately
          // or modify the API to populate profile data
          setUsers(groupUsers)
        } else {
          setError('Failed to fetch group members')
        }
      } catch (error) {
      console.error('Error fetching group users:', error)
      setError('An error occurred while fetching group members')
    } finally {
      setLoading(false)
    }
  }

  if (!group) return null

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }



  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <GroupIcon color="primary" />
          <Typography variant="h6">{group.groupName}</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Group Information */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Group Information</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            {group.description && (
              <Typography variant="body2" color="text.secondary">
                {group.description}
              </Typography>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {group.ageGroup && (
              <Chip 
                icon={<TimeIcon />}
                label={`Age: ${group.ageGroup.min}-${group.ageGroup.max}`} 
                variant="outlined" 
                size="small"
              />
            )}
            {group.gender && (
              <Chip 
                icon={<PersonIcon />}
                label={`Gender: ${group.gender}`} 
                variant="outlined" 
                size="small"
              />
            )}
            {group.location?.city && (
              <Chip 
                icon={<LocationIcon />}
                label={`${group.location.city}`} 
                variant="outlined" 
                size="small"
              />
            )}
            {group.location?.region && (
              <Chip 
                icon={<LocationIcon />}
                label={`${group.location.region}`} 
                variant="outlined" 
                size="small"
              />
            )}
            {group.location?.country && (
              <Chip 
                icon={<LocationIcon />}
                label={`${group.location.country}`} 
                variant="outlined" 
                size="small"
              />
            )}
          </Box>
          
          <Box sx={{ mt: 2, display: 'flex', gap: 2, color: 'text.secondary' }}>
            <Typography variant="body2">
              Created: {formatDate(group.createdAt)}
            </Typography>
            <Typography variant="body2">
              Members: {users.length}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Group Members */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Group Members ({users.length})
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
            </Box>
          ) : users.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
              No members found in this group
            </Typography>
          ) : (
            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
              {users.map((user, index) => (
                <React.Fragment key={user._id}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body1" fontWeight="medium">
                          {user.email}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Member ID: {user.memberId || 'N/A'}
                          </Typography>
                          {user.roles && user.roles.length > 0 && (
                            <Typography variant="body2" color="text.secondary">
                              Roles: {user.roles.join(', ')}
                            </Typography>
                          )}
                          {user.isVerified && (
                            <Typography variant="body2" color="text.secondary">
                              ✓ Verified
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < users.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default GroupDetailsPopup 