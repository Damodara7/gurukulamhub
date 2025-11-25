'use client'
import React, { useEffect, useState, useRef } from 'react'
import {
  Avatar,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
  Tooltip,
  Stack,
  useTheme
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import IconButtonTooltip from '@/components/IconButtonTooltip'

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

// Helper function to get user chips based on applied filters
const getUserChips = (user, filterCriteria) => {
  const chips = []

  // Only show age if audience has age filter
  if (filterCriteria?.ageGroup?.min && filterCriteria?.ageGroup?.max) {
    const age = user?.profile?.age
    if (age !== undefined && age !== null) {
      chips.push({
        label: `Age: ${age} years`,
        size: 'small',
        variant: 'outlined',
        color: 'primary'
      })
    }
  }

  // Only show gender if audience has gender filter
  if (filterCriteria?.gender) {
    let genderValues = []

    // Handle both old array format and new object format with values property
    if (Array.isArray(filterCriteria.gender)) {
      genderValues = filterCriteria.gender
    } else if (filterCriteria.gender.values && Array.isArray(filterCriteria.gender.values)) {
      genderValues = filterCriteria.gender.values
    } else if (typeof filterCriteria.gender === 'string') {
      genderValues = [filterCriteria.gender]
    }

    if (genderValues.length > 0) {
      const gender = user?.profile?.gender
      if (gender) {
        chips.push({
          label: `Gender: ${gender.charAt(0).toUpperCase() + gender.slice(1)}`,
          size: 'small',
          variant: 'outlined',
          color: 'secondary'
        })
      }
    }
  }

  // Only show location if audience has location filter
  if (filterCriteria?.location) {
    const locationParts = []
    if (filterCriteria.location.city && user?.profile?.locality) {
      locationParts.push(user.profile.locality)
    }
    if (filterCriteria.location.region && user?.profile?.region) {
      locationParts.push(user.profile.region)
    }
    if (filterCriteria.location.country && user?.profile?.country) {
      locationParts.push(user.profile.country)
    }

    if (locationParts.length > 0) {
      chips.push({
        label: `Location: ${locationParts.join(', ')}`,
        size: 'small',
        variant: 'outlined',
        color: 'default'
      })
    }
  }

  return chips
}

const AudienceUserMultiSelect = ({ users, matchedUserIds = [], hasFilters = false, filterCriteria = null }) => {
  const theme = useTheme()
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

      // Fully dynamic calculation based on actual container width
      // Fixed item dimensions (consistent across all screen sizes)
      const userItemWidth = 56 // Fixed width for each user item (reduced from 60 to fit more users)
      const gap = 6 // Fixed gap between items (reduced from 8 to fit more users)

      // Responsive count width based on container width
      // Smaller on mobile, larger on desktop
      const countWidth = containerWidth < 400 ? 60 : containerWidth < 600 ? 70 : 75
      const countMargin = containerWidth < 400 ? 8 : 10

      // Calculate container padding dynamically (2-3% of container width, min 12px, max 28px)
      const containerPadding = Math.max(12, Math.min(28, Math.floor(containerWidth * 0.025)))

      // Calculate how many users can fit in one line, leaving space for count and padding
      const availableWidth = containerWidth - countWidth - countMargin - containerPadding * 2
      const maxUsersPerLine = Math.max(1, Math.floor(availableWidth / (userItemWidth + gap)))

      // Get matched users
      const selected = users.filter(user => matchedUserIds.includes(user._id))

      // Show users that fit in one line
      const visible = selected.slice(0, maxUsersPerLine)
      const overflow = selected.length - maxUsersPerLine

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
            mb: 1,
            gap: { xs: 0.5, sm: 1 },
            overflow: 'hidden'
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
              minWidth: 0,
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
                  width: '56px',
                  minWidth: '56px',
                  maxWidth: '56px',
                  position: 'relative',
                  flexShrink: 0
                }}
              >
                <Avatar
                  src={user?.image || user?.profile?.image}
                  sx={{
                    width: 40,
                    height: 40,
                    mb: 0.5,
                    fontSize: '1rem'
                  }}
                >
                  {getInitials(user)}
                </Avatar>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor:
                      theme.palette.mode === 'dark'
                        ? alpha(theme.palette.grey[800], 0.5)
                        : alpha(theme.palette.grey[100], 1),
                    borderRadius: 1,
                    px: 1,
                    width: '100%',
                    justifyContent: 'center',
                    minHeight: 20,
                    maxWidth: '100%'
                  }}
                >
                  <Tooltip title={getDisplayName(user)} placement='bottom' arrow>
                    <Typography
                      variant='body2'
                      sx={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        width: '100%',
                        textAlign: 'center',
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
                  width: '56px',
                  minWidth: '56px',
                  maxWidth: '56px',
                  position: 'relative',
                  flexShrink: 0
                }}
              >
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    mb: 0.5,
                    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[300],
                    color: theme.palette.mode === 'dark' ? theme.palette.grey[200] : theme.palette.grey[600],
                    fontSize: '1rem'
                  }}
                >
                  ...
                </Avatar>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor:
                      theme.palette.mode === 'dark'
                        ? alpha(theme.palette.grey[800], 0.5)
                        : alpha(theme.palette.grey[200], 1),
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
                      color: theme.palette.mode === 'dark' ? theme.palette.grey[300] : theme.palette.grey[600],
                      fontWeight: 500
                    }}
                  >
                    +{overflowCount}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>

          {/* Total count on the right - responsive width and styling */}
          <Box
            sx={{
              width: { xs: '60px', sm: '70px', md: '75px' },
              minWidth: { xs: '60px', sm: '70px', md: '75px' },
              flexShrink: 0,
              textAlign: 'right',
              ml: { xs: 0.5, sm: 1 }
            }}
          >
            <Typography
              variant='body2'
              sx={{
                fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
                fontWeight: 500,
                whiteSpace: 'nowrap',
                lineHeight: 1.2
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
          borderColor: 'divider',
          borderRadius: { xs: 1.5, sm: 2 },
          p: { xs: 1.5, sm: 2 },
          cursor: 'pointer',
          minHeight: { xs: 56, sm: 60 },
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.palette.background.paper,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.1 : 0.04)
          }
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

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth='md'
        fullWidth
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'none',
            WebkitBackdropFilter: 'none'
          }
        }}
        PaperProps={{
          sx: {
            borderRadius: { xs: 3, sm: 4 },
            mx: { xs: 2, sm: 2 },
            my: { xs: 2, sm: 3 },
            width: { xs: 'calc(100% - 32px)', sm: 'auto' },
            maxWidth: { xs: 'calc(100% - 32px)', sm: '600px' },
            height: { xs: 'calc(100dvh - 32px)', sm: '90dvh' },
            maxHeight: { xs: 'calc(100dvh - 32px)', sm: '90dvh' },
            border: theme => `1px solid ${theme.palette.divider}`,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
          }
        }}
      >
        <DialogTitle
          sx={{
            px: { xs: 3, sm: 5 },
            py: { xs: 2.5, sm: 3 },
            borderBottom: theme => `1px solid ${alpha(theme.palette.divider, 0.3)}`,
            flexShrink: 0
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2
            }}
          >
            <Stack spacing={0.5} sx={{ flex: 1 }}>
              <Typography variant='h6' sx={{ fontWeight: 600, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                Audience Members
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}>
                Matching Users ({matchedUsers.length})
              </Typography>
            </Stack>
            <IconButtonTooltip
              title='Close'
              onClick={() => setOpen(false)}
              sx={{
                color: theme => theme.palette.text.secondary,
                '&:hover i': { color: theme => theme.palette.text.primary }
              }}
            >
              <i className='ri-close-line text-xl' />
            </IconButtonTooltip>
          </Box>
        </DialogTitle>
        <DialogContent
          sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 2, sm: 3 },
            overflowY: 'auto',
            flex: 1,
            minHeight: 0,
            '&::-webkit-scrollbar': {
              width: '8px'
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'transparent'
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: alpha(theme.palette.primary.main, 0.3),
              borderRadius: '4px',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.5)
              }
            }
          }}
        >
          <List sx={{ pt: 0 }}>
            {matchedUsers.length > 0 ? (
              matchedUsers.map(user => {
                const userChips = getUserChips(user, filterCriteria)
                return (
                  <ListItem
                    key={user._id}
                    sx={{
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      py: { xs: 2, sm: 1.5 },
                      px: { xs: 1.5, sm: 2 },
                      borderBottom: theme => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      '&:last-child': {
                        borderBottom: 'none'
                      }
                    }}
                  >
                    <ListItemAvatar
                      sx={{
                        mr: { xs: 1.5, sm: 2 },
                        flexShrink: 0
                      }}
                    >
                      <Avatar
                        src={user?.image || user?.profile?.image}
                        sx={{
                          width: { xs: 48, sm: 56 },
                          height: { xs: 48, sm: 56 }
                        }}
                      >
                        {getInitials(user)}
                      </Avatar>
                    </ListItemAvatar>
                    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', minWidth: 0, flex: 1 }}>
                      <ListItemText
                        primary={
                          <Typography
                            variant='subtitle1'
                            sx={{
                              fontWeight: 600,
                              fontSize: { xs: '0.9375rem', sm: '1rem' },
                              mb: 0.5
                            }}
                          >
                            {getDisplayName(user)}
                          </Typography>
                        }
                        secondary={
                          <Typography
                            variant='body2'
                            color='text.secondary'
                            sx={{
                              fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                              wordBreak: 'break-word'
                            }}
                          >
                            {user.email}
                          </Typography>
                        }
                      />
                      {userChips.length > 0 && (
                        <Box
                          sx={{
                            display: 'flex',
                            gap: { xs: 1, sm: 1.5 },
                            mt: { xs: 1.5, sm: 1 },
                            flexWrap: 'wrap'
                          }}
                        >
                          {userChips.map((chip, index) => (
                            <Chip
                              key={index}
                              title={chip.title}
                              label={chip.label}
                              size={chip.size}
                              variant={chip.variant}
                              color={chip.color}
                              sx={{
                                fontSize: { xs: '0.65rem', sm: '0.7rem' },
                                height: { xs: 20, sm: 24 }
                              }}
                            />
                          ))}
                        </Box>
                      )}
                    </Box>
                  </ListItem>
                )
              })
            ) : (
              <ListItem>
                <Typography variant='body2' color='text.secondary' sx={{ textAlign: 'center', width: '100%', py: 4 }}>
                  No matching users found
                </Typography>
              </ListItem>
            )}
          </List>
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default AudienceUserMultiSelect
