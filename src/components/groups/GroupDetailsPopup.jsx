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
  Cake as CakeIcon
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
        const groupUsers = allUsers.filter(user => user.groupIds && user.groupIds.includes(group._id))

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

  const formatDate = dateString => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <GroupIcon color='primary' />
          <Typography variant='h6'>{group.groupName}</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Group Information */}
        <Box sx={{ mb: 3 }}>
          <Typography variant='h6' gutterBottom>
            Group Information
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            {group.description && (
              <Typography variant='body2' color='text.secondary'>
                {group.description}
              </Typography>
            )}
          </Box>

          {(() => {
            const filterChips = []
            
            if (group.ageGroup?.min && group.ageGroup?.max) {
              filterChips.push(
                <Chip
                  key="age"
                  icon={<CakeIcon sx={{ fontSize: 16 }} />}
                  label={`Age: ${group.ageGroup.min}-${group.ageGroup.max}`}
                  variant='outlined'
                  size='small'
                  color='primary'
                />
              )
            }
            
            if (group.gender && Array.isArray(group.gender) && group.gender.length > 0) {
              filterChips.push(
                <Chip
                  key="gender"
                  icon={<PersonIcon sx={{ fontSize: 16 }} />}
                  label={`Gender: ${group.gender.map(g => g.charAt(0).toUpperCase() + g.slice(1)).join(', ')}`}
                  variant='outlined'
                  size='small'
                  color='success'
                />
              )
            }
            
            if (group.location) {
              const locationParts = []
              if (group.location.country) locationParts.push(group.location.country)
              if (group.location.region) locationParts.push(group.location.region)
              if (group.location.city) locationParts.push(group.location.city)

              if (locationParts.length > 0) {
                filterChips.push(
                  <Chip
                    key="location"
                    icon={<LocationIcon sx={{ fontSize: 16 }} />}
                    label={`Location: ${locationParts.join(', ')}`}
                    variant='outlined'
                    size='small'
                    color='secondary'
                  />
                )
              }
            }

            return filterChips.length > 0 ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {filterChips}
              </Box>
            ) : (
              <Typography variant='body2' color='text.secondary' sx={{ fontStyle: 'italic' }}>
                No filters applied
              </Typography>
            )
          })()}

          <Box sx={{ mt: 2, display: 'flex', gap: 2, color: 'text.secondary' }}>
            <Typography variant='body2'>Created: {formatDate(group.createdAt)}</Typography>
            <Typography variant='body2'>Members: {users.length}</Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Group Members */}
        <Box>
          <Typography variant='h6' gutterBottom>
            Group Members ({users.length})
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
            </Box>
          ) : users.length === 0 ? (
            <Typography variant='body2' color='text.secondary' sx={{ textAlign: 'center', py: 3 }}>
              No members found in this group
            </Typography>
          ) : (
            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
              {users.map((user, index) => (
                <React.Fragment key={user._id}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        {user.profile?.firstname?.[0] ||
                          user.profile?.lastname?.[0] ||
                          user.email?.[0]?.toUpperCase() ||
                          'U'}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box>
                          {user.profile?.firstname && user.profile?.lastname ? (
                            <Typography variant='body1' fontWeight='medium' sx={{ mb: 0.5 }}>
                              {user.profile.firstname} {user.profile.lastname}
                            </Typography>
                          ) : user.profile?.firstname ? (
                            <Typography variant='body1' fontWeight='medium' sx={{ mb: 0.5 }}>
                              {user.profile.firstname}
                            </Typography>
                          ) : user.profile?.lastname ? (
                            <Typography variant='body1' fontWeight='medium' sx={{ mb: 0.5 }}>
                              {user.profile.lastname}
                            </Typography>
                          ) : null}
                          <Typography variant='body2' color='text.secondary'>
                            {user.email}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant='body2' color='text.secondary'>
                            Member ID: {user.memberId || 'N/A'}
                          </Typography>
                          {/* {user.roles && user.roles.length > 0 && (
                             <Typography variant="body2" color="text.secondary">
                               Roles: {user.roles.join(', ')}
                             </Typography>
                           )}
                           {user.isVerified && (
                             <Typography variant="body2" color="text.secondary">
                               ✓ Verified
                             </Typography>
                           )} */}

                          {/* Show filter-related information based on group filters */}
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', mt: 1 }}>
                            {(() => {
                              const chips = []

                              // Show age only if group has age filter
                              if (group?.ageGroup?.min && group?.ageGroup?.max && user.profile?.age) {
                                chips.push({
                                  label: `Age: ${user.profile.age}`,
                                  color: 'primary'
                                })
                              }

                              // Show gender only if group has gender filter
                              if (
                                group?.gender &&
                                Array.isArray(group.gender) &&
                                group.gender.length > 0 &&
                                user.profile?.gender
                              ) {
                                chips.push({
                                  label: `Gender: ${
                                    user.profile.gender.charAt(0).toUpperCase() + user.profile.gender.slice(1)
                                  }`,
                                  color: 'success'
                                })
                              }

                              // Show location as single chip if group has location filter
                              if (group?.location) {
                                const locationParts = []
                                if (group.location.city && user.profile?.locality)
                                  locationParts.push(user.profile.locality)
                                if (group.location.region && user.profile?.region)
                                  locationParts.push(user.profile.region)
                                if (group.location.country && user.profile?.country)
                                  locationParts.push(user.profile.country)

                                if (locationParts.length > 0) {
                                  chips.push({
                                    label: `Location: ${locationParts.join(', ')}`,
                                    color: 'secondary'
                                  })
                                }
                              }

                              return chips.length > 0 ? (
                                <>
                                  <Typography variant='body2' sx={{ fontWeight: 500, color: 'text.secondary' }}>
                                    Users Criteria:
                                  </Typography>
                                  {chips.map((chip, chipIndex) => (
                                    <Chip
                                      key={chipIndex}
                                      size='small'
                                      label={chip.label}
                                      variant='outlined'
                                      color={chip.color}
                                      sx={{ fontSize: '0.75rem' }}
                                    />
                                  ))}
                                </>
                              ) : (
                                <Typography variant='caption' color='text.secondary' sx={{ fontStyle: 'italic' }}>
                                  No criteria applied
                                </Typography>
                              )
                            })()}
                          </Box>
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
        <Button onClick={onClose} color='primary'>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default GroupDetailsPopup
