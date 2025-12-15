'use client'
import React, { useEffect, useState, useRef } from 'react'
import {
  Avatar,
  Box,
  Checkbox,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
  Tooltip,
  Stack,
  useTheme
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import IconButtonTooltip from '@/components/IconButtonTooltip'
import {
  Person as PersonIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  IndeterminateCheckBox as IndeterminateCheckBoxIcon,
  Close as CloseIcon
} from '@mui/icons-material'

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

const GroupUserMultiSelect = ({ users, selectedUsers, onSelectChange, matchedUserIds = [], unmatchedUserIds = [] }) => {
  const theme = useTheme()
  const [open, setOpen] = useState(false)
  const [selectAll, setSelectAll] = useState(true)
  const [intermediate, setIntermediate] = useState(false)
  const [visibleUsers, setVisibleUsers] = useState([])
  const [overflowCount, setOverflowCount] = useState(0)
  const containerRef = useRef(null)
  // Track manually selected users (users selected from "Not Selected Users" section)
  const [manuallySelectedUserIds, setManuallySelectedUserIds] = useState(new Set())
  // Search state
  const [searchQuery, setSearchQuery] = useState('')

  // Calculate how many users can fit in one line based on container width
  useEffect(() => {
    const calculateVisibleUsers = () => {
      if (!containerRef.current) return

      const container = containerRef.current
      const containerWidth = container.offsetWidth

      // Fully dynamic calculation based on actual container width
      // Fixed item dimensions (consistent across all screen sizes)
      const userItemWidth = 60 // Fixed width for each user item
      const gap = 6 // Fixed gap between items

      // Responsive count width based on container width
      // Smaller on mobile, larger on desktop
      const countWidth = containerWidth < 400 ? 60 : containerWidth < 600 ? 70 : 80
      const countMargin = containerWidth < 400 ? 8 : 10

      // Calculate container padding dynamically (2-3% of container width, min 12px, max 28px)
      const containerPadding = Math.max(12, Math.min(28, Math.floor(containerWidth * 0.025)))

      // Calculate how many users can fit in one line, leaving space for count and padding
      const availableWidth = containerWidth - countWidth - countMargin - containerPadding * 2
      const maxUsersPerLine = Math.max(1, Math.floor(availableWidth / (userItemWidth + gap)))

      // Get selected users
      const selected = users.filter(user => selectedUsers.includes(user._id))

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
  }, [users, selectedUsers])

  console.log('selectedUsers in the multi select component', selectedUsers)
  useEffect(() => {
    if (selectedUsers.length === users.length) {
      setSelectAll(true)
      setIntermediate(false)
    } else if (selectedUsers.length > 0) {
      setSelectAll(false)
      setIntermediate(true)
    } else {
      setSelectAll(false)
      setIntermediate(false)
    }
  }, [selectedUsers, users.length])

  // Track if we've initialized manually selected users and the last selectedUsers count
  // This helps detect when new data loads (e.g., switching groups in edit mode)
  const hasInitialized = useRef(false)
  const lastSelectedCount = useRef(0)

  // Initialize manually selected users when component loads with existing data (edit mode)
  // Users that are selected but NOT in matchedUserIds are considered manually selected
  // Reset initialization if selectedUsers count changes significantly (new data loaded)
  useEffect(() => {
    // Detect if new data has been loaded (selectedUsers count changed significantly)
    const countChanged = Math.abs(selectedUsers.length - lastSelectedCount.current) > 0
    if (countChanged && hasInitialized.current) {
      // Reset initialization when new data loads
      hasInitialized.current = false
      setManuallySelectedUserIds(new Set())
    }
    lastSelectedCount.current = selectedUsers.length

    // Only initialize once when we have both selectedUsers and matchedUserIds calculated
    // This handles edit mode where data loads asynchronously
    if (!hasInitialized.current && selectedUsers.length > 0 && users.length > 0) {
      // Wait for matchedUserIds to be calculated (when filters are applied or when all users are matched)
      // If matchedUserIds is empty, it means no filters are applied, so all selected users are filter-selected
      // If matchedUserIds has values, users selected but not in matchedUserIds are manually selected
      if (matchedUserIds.length > 0) {
        // Users selected but not matching current filter criteria are manually selected
        const initiallyManuallySelected = selectedUsers.filter(userId => !matchedUserIds.includes(userId))

        if (initiallyManuallySelected.length > 0) {
          setManuallySelectedUserIds(new Set(initiallyManuallySelected))
          hasInitialized.current = true
        } else {
          // All selected users match the filter, so none are manually selected
          hasInitialized.current = true
        }
      } else if (matchedUserIds.length === 0 && selectedUsers.length > 0) {
        // No filters applied - all selected users are filter-selected (not manually selected)
        hasInitialized.current = true
      }
    }
  }, [matchedUserIds, selectedUsers, users.length]) // Run when filters or selections change

  const handleToggleAll = () => {
    if (selectAll || intermediate) {
      onSelectChange([])
    } else {
      onSelectChange(users.map(user => user._id))
    }
  }

  const handleToggle = userId => {
    const currentIndex = selectedUsers.indexOf(userId)
    const newSelected = [...selectedUsers]
    const isCurrentlyUnmatched = unmatchedUserIds.includes(userId)

    if (currentIndex === -1) {
      newSelected.push(userId)
      // If selecting from unmatched users, track as manually selected
      if (isCurrentlyUnmatched) {
        setManuallySelectedUserIds(prev => new Set([...prev, userId]))
      }
    } else {
      newSelected.splice(currentIndex, 1)
      // Remove from manually selected if it was manually selected
      setManuallySelectedUserIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(userId)
        return newSet
      })
    }

    onSelectChange(newSelected)
  }

  const handleRemoveUser = (userId, e) => {
    e.stopPropagation()
    handleToggle(userId)
  }

  const getSelectedUsers = () => {
    return users.filter(user => selectedUsers.includes(user._id))
  }

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
                  width: '60px',
                  minWidth: '60px',
                  maxWidth: '60px',
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
                    backgroundColor:
                      theme.palette.mode === 'dark'
                        ? alpha(theme.palette.action.hover, 0.5)
                        : theme.palette.action.hover,
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
                  <Tooltip title='remove user' placement='bottom' arrow>
                    <IconButton
                      size='small'
                      onClick={e => handleRemoveUser(user._id, e)}
                      sx={{
                        color: 'error.main',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.error.main, 0.1)
                        },
                        p: 0,
                        minWidth: 16,
                        minHeight: 16
                      }}
                    >
                      <CloseIcon sx={{ fontSize: 12 }} />
                    </IconButton>
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
                  width: '60px',
                  minWidth: '60px',
                  maxWidth: '60px',
                  position: 'relative',
                  flexShrink: 0
                }}
              >
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    mb: 0.5,
                    backgroundColor:
                      theme.palette.mode === 'dark' ? alpha(theme.palette.divider, 0.3) : theme.palette.grey[300],
                    color: theme.palette.mode === 'dark' ? theme.palette.text.secondary : theme.palette.grey[600]
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
                        ? alpha(theme.palette.action.selected, 0.3)
                        : theme.palette.grey[200],
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
                      color: theme.palette.mode === 'dark' ? theme.palette.text.secondary : theme.palette.grey[600],
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
              width: { xs: '60px', sm: '70px', md: '80px' },
              minWidth: { xs: '60px', sm: '70px', md: '80px' },
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
              {selectedUsers.length} / {users.length}
            </Typography>
          </Box>
        </Box>
      </Box>
    )
  }

  // Categorize users based on selection state (selected = matched, not selected = unmatched)
  const getFilteredUsers = () => {
    // Separate users based on selection state
    const selected = users.filter(user => selectedUsers.includes(user._id))
    const notSelected = users.filter(user => !selectedUsers.includes(user._id))

    return {
      matchedUsers: selected, // Selected users go to matched section
      unmatchedUsers: notSelected // Not selected users go to unmatched section
    }
  }

  const { matchedUsers, unmatchedUsers } = getFilteredUsers()

  // Helper to check if a user matches the filter criteria
  const userMatchesFilter = user => {
    // If no filters applied, all users match
    if (matchedUserIds.length === 0 && unmatchedUserIds.length === 0) {
      return true
    }
    return matchedUserIds.includes(user._id)
  }

  // Search filter function - searches by name, email, location, gender, age
  const matchesSearch = user => {
    if (!searchQuery.trim()) return true

    const query = searchQuery.toLowerCase().trim()
    const name = getDisplayName(user).toLowerCase()
    const email = (user.email || '').toLowerCase()
    const location = getLocation(user).toLowerCase()
    const gender = getGender(user).toLowerCase()
    const age = getAge(user).toLowerCase()

    return (
      name.includes(query) ||
      email.includes(query) ||
      location.includes(query) ||
      gender.includes(query) ||
      age.includes(query)
    )
  }

  // Separate selected users into manually selected and filter-selected
  // Manually selected = users in the manuallySelectedUserIds Set (regardless of filter match)
  // Filter selected = users that match filter but are NOT manually selected
  const getSeparatedSelectedUsers = () => {
    const manuallySelected = users.filter(
      user => selectedUsers.includes(user._id) && manuallySelectedUserIds.has(user._id) && matchesSearch(user)
    )
    const filterSelected = users.filter(
      user =>
        selectedUsers.includes(user._id) &&
        !manuallySelectedUserIds.has(user._id) &&
        matchedUserIds.includes(user._id) &&
        matchesSearch(user)
    )

    return {
      manuallySelected,
      filterSelected
    }
  }

  const { manuallySelected, filterSelected } = getSeparatedSelectedUsers()

  // Apply search filter to unmatched users
  const filteredUnmatchedUsers = unmatchedUsers.filter(matchesSearch)

  return (
    <Box>
      <Box
        onClick={() => setOpen(true)}
        sx={{
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          p: 2,
          cursor: 'pointer',
          backgroundColor: theme.palette.background.paper,
          minHeight: 60,
          minWidth: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor:
              theme.palette.mode === 'dark' ? alpha(theme.palette.action.hover, 0.5) : theme.palette.action.hover,
            borderColor: theme.palette.primary.main
          }
        }}
      >
        {selectedUsers.length > 0 ? (
          renderSelectedUsers()
        ) : (
          <Typography sx={{ textAlign: 'center' }}>
            {`Selected Users (${selectedUsers.length} / ${users.length})`}
          </Typography>
        )}
      </Box>

      <Dialog
        open={open}
        onClose={() => {
          setOpen(false)
          setSearchQuery('') // Clear search when dialog closes
        }}
        maxWidth='lg'
        fullWidth
        BackdropProps={{
          sx: {
            backgroundColor:
              theme.palette.mode === 'dark'
                ? alpha(theme.palette.common.black, 0.7)
                : alpha(theme.palette.common.black, 0.3),
            backdropFilter: 'none',
            WebkitBackdropFilter: 'none'
          }
        }}
        PaperProps={{
          sx: {
            borderRadius: { xs: 2, sm: 3, md: 4 },
            mx: { xs: 1, sm: 2, md: 3 },
            my: { xs: 1, sm: 2, md: 3 },
            width: {
              xs: 'calc(100% - 16px)',
              sm: 'calc(100% - 32px)',
              md: '90%',
              lg: '85%',
              xl: '80%'
            },
            maxWidth: {
              xs: 'calc(100% - 16px)',
              sm: '600px',
              md: '800px',
              lg: '1200px',
              xl: '1600px'
            },
            height: {
              xs: 'calc(100dvh - 16px)',
              sm: 'calc(100dvh - 32px)',
              md: '90dvh',
              lg: '85dvh',
              xl: '80dvh'
            },
            maxHeight: {
              xs: 'calc(100dvh - 16px)',
              sm: 'calc(100dvh - 32px)',
              md: '90dvh',
              lg: '85dvh',
              xl: '80dvh'
            },
            border: theme => `1px solid ${alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.12 : 0.08)}`,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative',
            boxShadow:
              theme.palette.mode === 'dark'
                ? `0 8px 32px ${alpha(theme.palette.common.black, 0.5)}`
                : '0 8px 32px rgba(0, 0, 0, 0.12)'
          }
        }}
      >
        <DialogTitle
          sx={{
            px: { xs: 2, sm: 3, md: 4, lg: 5, xl: 6 },
            py: { xs: 2, sm: 2.5, md: 3 },
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
                Group Members
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}>
                {selectedUsers.length > 0
                  ? `${selectedUsers.length} member${selectedUsers.length > 1 ? 's' : ''} selected`
                  : 'Select members for this group'}
              </Typography>
              {/* Search Bar */}
              <TextField
                fullWidth
                placeholder='Search users by name, email, location...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                size='small'
                sx={{
                  mt: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor:
                      theme.palette.mode === 'dark'
                        ? alpha(theme.palette.background.paper, 0.5)
                        : alpha(theme.palette.background.paper, 0.8),
                    '&:hover': {
                      backgroundColor:
                        theme.palette.mode === 'dark'
                          ? alpha(theme.palette.background.paper, 0.7)
                          : alpha(theme.palette.background.paper, 0.9)
                    },
                    '&.Mui-focused': {
                      backgroundColor:
                        theme.palette.mode === 'dark'
                          ? alpha(theme.palette.background.paper, 0.8)
                          : theme.palette.background.paper
                    }
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='ri-search-line' style={{ color: theme.palette.text.secondary }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position='end'>
                      <IconButton
                        size='small'
                        onClick={() => setSearchQuery('')}
                        sx={{ color: theme.palette.text.secondary }}
                      >
                        <i className='ri-close-line' />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
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
            px: { xs: 2, sm: 3, md: 4, lg: 5, xl: 6 },
            py: { xs: 2, sm: 3, md: 4 },
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
            <ListItem
              sx={{
                py: { xs: 1.5, sm: 1, md: 1.5 },
                px: { xs: 1.5, sm: 2, md: 2.5, lg: 3 },
                borderBottom: theme =>
                  `1px solid ${alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.12 : 0.1)}`,
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? alpha(theme.palette.primary.main, 0.08)
                    : alpha(theme.palette.primary.main, 0.04)
              }}
            >
              <ListItemButton role={undefined} onClick={handleToggleAll} dense>
                <ListItemAvatar>
                  <Avatar sx={{ width: { xs: 40, sm: 48, md: 56 }, height: { xs: 40, sm: 48, md: 56 } }}>
                    {selectAll ? (
                      <CheckBoxIcon sx={{ fontSize: { xs: 20, sm: 24, md: 28 } }} />
                    ) : intermediate ? (
                      <IndeterminateCheckBoxIcon sx={{ fontSize: { xs: 20, sm: 24, md: 28 } }} />
                    ) : (
                      <CheckBoxOutlineBlankIcon sx={{ fontSize: { xs: 20, sm: 24, md: 28 } }} />
                    )}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography sx={{ fontSize: { xs: '0.9375rem', sm: '1rem' }, fontWeight: 600 }}>
                      All Members
                    </Typography>
                  }
                />
              </ListItemButton>
              <Chip
                label={`${selectedUsers.length}/${users.length} selected`}
                size='small'
                sx={{
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  height: { xs: 24, sm: 28 }
                }}
              />
            </ListItem>
            <Divider />

            {/* Show manually selected users first */}
            {manuallySelected.length > 0 && (
              <>
                <ListItem
                  sx={{
                    py: { xs: 1, sm: 0.75, md: 1 },
                    px: { xs: 1.5, sm: 2, md: 2.5, lg: 3 }
                  }}
                >
                  <Typography
                    variant='subtitle2'
                    color='primary'
                    sx={{
                      fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                      fontWeight: 600
                    }}
                  >
                    Manually Selected Users ({manuallySelected.length}
                    {searchQuery &&
                      ` of ${
                        users.filter(u => selectedUsers.includes(u._id) && manuallySelectedUserIds.has(u._id)).length
                      }`}
                    )
                  </Typography>
                </ListItem>

                {manuallySelected.map(user => {
                  const labelId = `checkbox-list-label-${user._id}`
                  const isSelected = selectedUsers.indexOf(user._id) !== -1

                  return (
                    <ListItem
                      key={user._id}
                      disablePadding
                      onClick={() => handleToggle(user._id)}
                      sx={{
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        py: { xs: 2, sm: 1.5, md: 2 },
                        px: { xs: 1.5, sm: 2, md: 2.5, lg: 3 },
                        borderBottom: theme => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        cursor: 'pointer',
                        backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.08 : 0.04),
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.action.hover, 0.5)
                        },
                        '&:last-child': {
                          borderBottom: 'none'
                        }
                      }}
                    >
                      <ListItemAvatar
                        sx={{
                          mr: { xs: 1.5, sm: 2, md: 2.5 },
                          flexShrink: 0
                        }}
                      >
                        <Avatar
                          src={user?.image || user?.profile?.image}
                          sx={{
                            width: { xs: 48, sm: 56, md: 64 },
                            height: { xs: 48, sm: 56, md: 64 }
                          }}
                        >
                          {getInitials(user)}
                        </Avatar>
                      </ListItemAvatar>
                      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', minWidth: 0, flex: 1 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            width: '100%',
                            alignItems: 'flex-start'
                          }}
                        >
                          <ListItemText
                            id={labelId}
                            primary={
                              <Typography
                                variant='subtitle1'
                                sx={{
                                  fontWeight: 600,
                                  fontSize: { xs: '0.9375rem', sm: '1rem', md: '1.0625rem' },
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
                                  fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                                  wordBreak: 'break-word'
                                }}
                              >
                                {user.email}
                              </Typography>
                            }
                          />
                          <Checkbox
                            edge='end'
                            checked={isSelected}
                            onChange={e => {
                              e.stopPropagation()
                              handleToggle(user._id)
                            }}
                            onClick={e => e.stopPropagation()}
                            tabIndex={-1}
                            disableRipple
                            inputProps={{ 'aria-labelledby': labelId }}
                            sx={{
                              mt: { xs: 0.5, sm: 0 }
                            }}
                          />
                        </Box>
                        <Box
                          sx={{
                            display: 'flex',
                            gap: { xs: 1, sm: 1.5 },
                            mt: { xs: 1.5, sm: 1 },
                            flexWrap: 'wrap'
                          }}
                        >
                          <Chip
                            label={getGender(user)}
                            size='small'
                            variant='outlined'
                            sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' }, height: { xs: 20, sm: 24 } }}
                          />
                          <Chip
                            label={getLocation(user)}
                            size='small'
                            variant='outlined'
                            sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' }, height: { xs: 20, sm: 24 } }}
                          />
                          <Chip
                            label={getAge(user)}
                            size='small'
                            variant='outlined'
                            sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' }, height: { xs: 20, sm: 24 } }}
                          />
                        </Box>
                      </Box>
                    </ListItem>
                  )
                })}

                {filterSelected.length > 0 && <Divider sx={{ my: { xs: 1, sm: 0.5 } }} />}
              </>
            )}

            {/* Show filter-selected users below manually selected */}
            {filterSelected.length > 0 && (
              <>
                <ListItem
                  sx={{
                    py: { xs: 1, sm: 0.75, md: 1 },
                    px: { xs: 1.5, sm: 2, md: 2.5, lg: 3 }
                  }}
                >
                  <Typography
                    variant='subtitle2'
                    color='text.secondary'
                    sx={{
                      fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                      fontWeight: 600
                    }}
                  >
                    Filter Selected Users ({filterSelected.length}
                    {searchQuery &&
                      ` of ${
                        users.filter(
                          u =>
                            selectedUsers.includes(u._id) &&
                            !manuallySelectedUserIds.has(u._id) &&
                            matchedUserIds.includes(u._id)
                        ).length
                      }`}
                    )
                  </Typography>
                </ListItem>

                {filterSelected.map(user => {
                  const labelId = `checkbox-list-label-${user._id}`
                  const isSelected = selectedUsers.indexOf(user._id) !== -1

                  return (
                    <ListItem
                      key={user._id}
                      disablePadding
                      onClick={() => handleToggle(user._id)}
                      sx={{
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        py: { xs: 2, sm: 1.5, md: 2 },
                        px: { xs: 1.5, sm: 2, md: 2.5, lg: 3 },
                        borderBottom: theme => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.action.hover, 0.5)
                        },
                        '&:last-child': {
                          borderBottom: 'none'
                        }
                      }}
                    >
                      <ListItemAvatar
                        sx={{
                          mr: { xs: 1.5, sm: 2, md: 2.5 },
                          flexShrink: 0
                        }}
                      >
                        <Avatar
                          src={user?.image || user?.profile?.image}
                          sx={{
                            width: { xs: 48, sm: 56, md: 64 },
                            height: { xs: 48, sm: 56, md: 64 }
                          }}
                        >
                          {getInitials(user)}
                        </Avatar>
                      </ListItemAvatar>
                      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', minWidth: 0, flex: 1 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            width: '100%',
                            alignItems: 'flex-start'
                          }}
                        >
                          <ListItemText
                            id={labelId}
                            primary={
                              <Typography
                                variant='subtitle1'
                                sx={{
                                  fontWeight: 600,
                                  fontSize: { xs: '0.9375rem', sm: '1rem', md: '1.0625rem' },
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
                                  fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                                  wordBreak: 'break-word'
                                }}
                              >
                                {user.email}
                              </Typography>
                            }
                          />
                          <Checkbox
                            edge='end'
                            checked={isSelected}
                            onChange={e => {
                              e.stopPropagation()
                              handleToggle(user._id)
                            }}
                            onClick={e => e.stopPropagation()}
                            tabIndex={-1}
                            disableRipple
                            inputProps={{ 'aria-labelledby': labelId }}
                            sx={{
                              mt: { xs: 0.5, sm: 0 }
                            }}
                          />
                        </Box>
                        <Box
                          sx={{
                            display: 'flex',
                            gap: { xs: 1, sm: 1.5 },
                            mt: { xs: 1.5, sm: 1 },
                            flexWrap: 'wrap'
                          }}
                        >
                          <Chip
                            label={getGender(user)}
                            size='small'
                            variant='outlined'
                            sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' }, height: { xs: 20, sm: 24 } }}
                          />
                          <Chip
                            label={getLocation(user)}
                            size='small'
                            variant='outlined'
                            sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' }, height: { xs: 20, sm: 24 } }}
                          />
                          <Chip
                            label={getAge(user)}
                            size='small'
                            variant='outlined'
                            sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' }, height: { xs: 20, sm: 24 } }}
                          />
                        </Box>
                      </Box>
                    </ListItem>
                  )
                })}
              </>
            )}

            {/* Always show not selected users section (unmatched users) */}
            {filteredUnmatchedUsers.length > 0 && (
              <>
                <Divider sx={{ my: { xs: 1, sm: 0.5 } }} />
                <ListItem
                  sx={{
                    py: { xs: 1, sm: 0.75, md: 1 },
                    px: { xs: 1.5, sm: 2, md: 2.5, lg: 3 }
                  }}
                >
                  <Typography
                    variant='subtitle2'
                    color='text.secondary'
                    sx={{
                      fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                      fontWeight: 600
                    }}
                  >
                    Not Selected Users ({filteredUnmatchedUsers.length}
                    {searchQuery && ` of ${unmatchedUsers.length}`})
                  </Typography>
                </ListItem>
                {filteredUnmatchedUsers.map(user => {
                  const labelId = `checkbox-list-label-${user._id}`
                  const isSelected = selectedUsers.indexOf(user._id) !== -1

                  return (
                    <ListItem
                      key={user._id}
                      disablePadding
                      onClick={() => handleToggle(user._id)}
                      sx={{
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        py: { xs: 2, sm: 1.5, md: 2 },
                        px: { xs: 1.5, sm: 2, md: 2.5, lg: 3 },
                        borderBottom: theme => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        opacity: userMatchesFilter(user) ? 1 : 0.6,
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.action.hover, 0.5)
                        },
                        '&:last-child': {
                          borderBottom: 'none'
                        }
                      }}
                    >
                      <ListItemAvatar
                        sx={{
                          mr: { xs: 1.5, sm: 2, md: 2.5 },
                          flexShrink: 0
                        }}
                      >
                        <Avatar
                          src={user?.image || user?.profile?.image}
                          sx={{
                            width: { xs: 48, sm: 56, md: 64 },
                            height: { xs: 48, sm: 56, md: 64 }
                          }}
                        >
                          {getInitials(user)}
                        </Avatar>
                      </ListItemAvatar>
                      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', minWidth: 0, flex: 1 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            width: '100%',
                            alignItems: 'flex-start'
                          }}
                        >
                          <ListItemText
                            id={labelId}
                            primary={
                              <Typography
                                variant='subtitle1'
                                sx={{
                                  fontWeight: 600,
                                  fontSize: { xs: '0.9375rem', sm: '1rem', md: '1.0625rem' },
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
                                  fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                                  wordBreak: 'break-word'
                                }}
                              >
                                {user.email}
                              </Typography>
                            }
                          />
                          <Checkbox
                            edge='end'
                            checked={isSelected}
                            onChange={e => {
                              e.stopPropagation()
                              handleToggle(user._id)
                            }}
                            onClick={e => e.stopPropagation()}
                            tabIndex={-1}
                            disableRipple
                            inputProps={{ 'aria-labelledby': labelId }}
                            sx={{
                              mt: { xs: 0.5, sm: 0 }
                            }}
                          />
                        </Box>
                        <Box
                          sx={{
                            display: 'flex',
                            gap: { xs: 1, sm: 1.5 },
                            mt: { xs: 1.5, sm: 1 },
                            flexWrap: 'wrap'
                          }}
                        >
                          <Chip
                            label={getGender(user)}
                            size='small'
                            variant='outlined'
                            sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' }, height: { xs: 20, sm: 24 }, opacity: 0.5 }}
                          />
                          <Chip
                            label={getLocation(user)}
                            size='small'
                            variant='outlined'
                            sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' }, height: { xs: 20, sm: 24 }, opacity: 0.5 }}
                          />
                          <Chip
                            label={getAge(user)}
                            size='small'
                            variant='outlined'
                            sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' }, height: { xs: 20, sm: 24 }, opacity: 0.5 }}
                          />
                        </Box>
                      </Box>
                    </ListItem>
                  )
                })}
              </>
            )}
          </List>
        </DialogContent>
      </Dialog>
    </Box>
  )
}
export default GroupUserMultiSelect
