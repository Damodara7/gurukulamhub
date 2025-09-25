'use client'
import React, { useEffect, useState, useRef } from 'react'
import {
  Avatar,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Typography,
  Tooltip
} from '@mui/material'
import { Person as PersonIcon } from '@mui/icons-material'

// Helper functions
const getInitials = user => {
  const firstname = user?.firstname || user?.profile?.firstname
  const lastname = user?.lastname || user?.profile?.lastname
  const firstInitial = firstname?.[0]?.toUpperCase() || ''
  const lastInitial = lastname?.[0]?.toUpperCase() || ''
  return firstInitial + lastInitial || ''
}

const getDisplayName = user => {
  const firstname = user?.firstname || user?.profile?.firstname
  const lastname = user?.lastname || user?.profile?.lastname

  if (firstname && lastname) {
    return `${firstname} ${lastname}`
  }
  return firstname || lastname || 'No name'
}

const getLocation = user => {
  const profile = user?.profile || {}
  const locationParts = []

  if (profile.locality) locationParts.push(profile.locality)
  if (profile.region) locationParts.push(profile.region)
  if (profile.country) locationParts.push(profile.country)

  return locationParts.length > 0 ? locationParts.join(', ') : 'No location'
}

const getGender = user => {
  const gender = user?.profile?.gender
  return gender ? gender.charAt(0).toUpperCase() + gender.slice(1) : 'No gender'
}

const getAge = user => {
  const age = user?.profile?.age
  return age ? `${age} years` : 'No age'
}

const UserMultiSelect = ({ users, matchedUserIds = [], hasFilters = false }) => {
  const [open, setOpen] = useState(false)
  const [visibleUsers, setVisibleUsers] = useState([])
  const [overflowCount, setOverflowCount] = useState(0)
  const containerRef = useRef(null)

  // Calculate how many users can fit in one line based on container width
  useEffect(() => {
    const calculateVisibleUsers = () => {
      if (!containerRef.current) return

      const container = containerRef.current
      const containerWidth = container.offsetWidth
      const userItemWidth = 60 // Reduced width of each user item
      const gap = 4 // Reduced gap between users
      const countWidth = 70 // Reduced width of the count display
      const countMargin = 8 // Reduced margin of the count display

      // Calculate how many users can fit in one line, leaving minimal space for count
      const availableWidth = containerWidth - countWidth - countMargin - gap
      const maxUsersPerLine = Math.floor(availableWidth / (userItemWidth + gap))

      // Ensure at least 1 user is shown, but try to show more
      const maxVisible = Math.max(1, Math.min(maxUsersPerLine + 1, maxUsersPerLine))

      // Get matched users
      const selected = users.filter(user => matchedUserIds.includes(user._id))

      // Show users that fit in one line
      const visible = selected.slice(0, maxVisible)
      const overflow = selected.length - maxVisible

      setVisibleUsers(visible)
      setOverflowCount(overflow > 0 ? overflow : 0)
    }

    // Initial calculation
    calculateVisibleUsers()

    // Recalculate on resize
    const resizeObserver = new ResizeObserver(calculateVisibleUsers)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    // Cleanup
    return () => {
      resizeObserver.disconnect()
    }
  }, [users, matchedUserIds])

  const renderSelectedUsers = () => {
    return (
      <Box
        ref={containerRef}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          minHeight: 64
        }}
      >
        {/* Users display in one line with count on right */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            mb: 1
          }}
        >
          {/* Users container - responsive width */}
          <Box
            sx={{
              display: 'flex',
              gap: 0.5,
              alignItems: 'center',
              flexWrap: 'nowrap',
              overflow: 'hidden',
              flex: 1,
              mr: 1
            }}
          >
            {visibleUsers.map(user => (
              <Box
                key={user._id}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: 60,
                  position: 'relative',
                  flexShrink: 0
                }}
              >
                <Avatar
                  src={user?.image || user?.profile?.image}
                  sx={{
                    width: 40,
                    height: 40,
                    mb: 0.5
                  }}
                >
                  {getInitials(user)}
                </Avatar>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: 'grey.100',
                    borderRadius: 1,
                    px: 1,
                    width: '100%',
                    justifyContent: 'space-between',
                    minHeight: 20
                  }}
                >
                  <Tooltip title={getDisplayName(user)} placement='bottom' arrow>
                    <Typography
                      variant='body2'
                      sx={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        flex: 1,
                        mr: 0.5,
                        fontSize: '0.75rem'
                      }}
                    >
                      {getDisplayName(user).split(' ')[0]}
                    </Typography>
                  </Tooltip>
                </Box>
              </Box>
            ))}

            {/* Overflow indicator */}
            {overflowCount > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: 60,
                  position: 'relative',
                  flexShrink: 0
                }}
              >
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    mb: 0.5,
                    backgroundColor: 'grey.300',
                    color: 'grey.600'
                  }}
                >
                  ...
                </Avatar>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: 'grey.200',
                    borderRadius: 1,
                    px: 1,
                    width: '100%',
                    justifyContent: 'center',
                    minHeight: 20
                  }}
                >
                  <Typography
                    variant='body2'
                    sx={{
                      fontSize: '0.75rem',
                      color: 'grey.600',
                      fontWeight: 500
                    }}
                  >
                    +{overflowCount}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>

          {/* Total count on the right - fixed width, simple styling */}
          <Box
            sx={{
              width: 80,
              flexShrink: 0,
              textAlign: 'right'
            }}
          >
            <Typography
              variant='body2'
              sx={{
                fontSize: '0.875rem',
                fontWeight: 500
              }}
            >
              {matchedUsers.length} / {users.length}
            </Typography>
          </Box>
        </Box>
      </Box>
    )
  }

  // Get matched users only
  const getMatchedUsers = () => {
    // If no filters applied and no matchedUserIds, show all users
    if (!hasFilters && matchedUserIds.length === 0) {
      return users
    }
    // Otherwise, filter based on matchedUserIds
    return users.filter(user => matchedUserIds.includes(user._id))
  }

  const matchedUsers = getMatchedUsers()

  console.log('🔍 UserMultiSelect Debug:', {
    totalUsers: users.length,
    matchedUserIds: matchedUserIds.length,
    matchedUsers: matchedUsers.length,
    hasFilters: hasFilters,
    matchedUserIdsArray: matchedUserIds
  })

  return (
    <Box>
      <Box
        onClick={() => setOpen(true)}
        sx={{
          border: 1,
          borderRadius: 1,
          p: 2,
          cursor: 'pointer',

          minHeight: 60,
          minWidth: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {matchedUsers.length > 0 ? (
          renderSelectedUsers()
        ) : (
          <Typography sx={{ textAlign: 'center' }}>
            {`Audience Members (${matchedUsers.length} / ${users.length})`}
          </Typography>
        )}
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth='md' fullWidth>
        <DialogTitle>Audience Members</DialogTitle>
        <DialogContent>
          <List>
            {/* Always show matched users section */}
            <ListItem>
              <Typography variant='subtitle2' color='primary'>
                Matching Users ({matchedUsers.length})
              </Typography>
            </ListItem>

            {matchedUsers.map(user => (
              <ListItem key={user._id}>
                <ListItemAvatar>
                  <Avatar src={user?.image || user?.profile?.image}>{getInitials(user)}</Avatar>
                </ListItemAvatar>
                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                  <ListItemText primary={getDisplayName(user)} secondary={user.email} />
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 2,
                      mt: 1,
                      flexWrap: 'wrap'
                    }}
                  >
                    <Chip label={getGender(user)} size='small' variant='outlined' sx={{ fontSize: '0.7rem' }} />
                    <Chip label={getLocation(user)} size='small' variant='outlined' sx={{ fontSize: '0.7rem' }} />
                    <Chip label={getAge(user)} size='small' variant='outlined' sx={{ fontSize: '0.7rem' }} />
                  </Box>
                </Box>
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default UserMultiSelect
