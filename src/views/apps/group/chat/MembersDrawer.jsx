'use client'
import React, { useState, useEffect } from 'react'
import {
  Drawer,
  Box,
  Stack,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Tooltip,
  useTheme,
  alpha,
  useMediaQuery,
  Button
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  SwapHoriz as ChangeIcon
} from '@mui/icons-material'

const MembersDrawer = ({
  open,
  onClose,
  members,
  isCreator,
  isGroupManager = false,
  onAddMember,
  onRemoveMember,
  groupData = null,
  currentUserEmail = null,
  onChangeTrainer = null,
  onChangeManager = null,
  onAddTrainer = null
}) => {
  const isClassroom = groupData?.groupType === 'classroom'
  const isGroupManagerEmail = (email) => email && groupData?.groupManagerEmail === email
  const isTrainerEmail = (email) => email && groupData?.trainerEmail === email
  const canAddMember = isCreator || isGroupManager
  const hasNoTrainer = isClassroom && !groupData?.trainerEmail
  const showAddTrainerForManager = isClassroom && isGroupManager && hasNoTrainer && onAddTrainer
  const memberAddedBy = groupData?.memberAddedBy && typeof groupData.memberAddedBy === 'object' ? groupData.memberAddedBy : {}
  const wasAddedByManager = (member) => {
    if (!member?._id || !currentUserEmail || !isGroupManager) return false
    const id = member._id.toString?.() || member._id
    return memberAddedBy[id] === currentUserEmail
  }
  const theme = useTheme()
  const isDarkMode = theme.palette.mode === 'dark'
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [visibleCount, setVisibleCount] = useState(15)

  // Sort so current user is first
  const sortedMembers = React.useMemo(() => {
    if (!currentUserEmail || !members.length) return members
    const current = members.find(m => m.email === currentUserEmail)
    const rest = members.filter(m => m.email !== currentUserEmail)
    return current ? [current, ...rest] : members
  }, [members, currentUserEmail])

  useEffect(() => {
    if (open) {
      setVisibleCount(15)
    }
  }, [open, sortedMembers.length])

  const handleShowMore = () => {
    setVisibleCount(prev => Math.min(prev + 10, sortedMembers.length))
  }

  const visibleMembers = sortedMembers.slice(0, visibleCount)
  const hasMore = sortedMembers.length > visibleCount

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 380, md: 400 },
          background: theme.palette.background.default,
          borderLeft: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.12 : 0.08)}`,
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }
      }}
    >
      {/* Fixed Header */}
      <Box sx={{ 
        p: { xs: 1.5, sm: 2 },
        borderBottom: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.12 : 0.08)}`,
        flexShrink: 0
      }}>
        <Stack direction='row' alignItems='center' justifyContent='space-between'>
          <Stack direction='row' alignItems='center' spacing={{ xs: 1, sm: 1.5 }}>
            <Typography
              variant={isMobile ? 'subtitle1' : 'h6'}
              sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
            >
              Group Members
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: { xs: 22, sm: 24 },
                height: { xs: 22, sm: 24 },
                borderRadius: '50%',
                bgcolor: theme.palette.primary.main,
                color: 'white',
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                fontWeight: 600
              }}
            >
              {sortedMembers.length}
            </Box>
          </Stack>
          <Stack direction='row' spacing={{ xs: 0.5, sm: 1 }}>
            {canAddMember && onAddMember && (
              <Tooltip title='Add new member' arrow>
                <IconButton
                  onClick={onAddMember}
                  color='primary'
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    background: alpha(theme.palette.primary.main, isDarkMode ? 0.15 : 0.1),
                    '&:hover': {
                      background: alpha(theme.palette.primary.main, isDarkMode ? 0.25 : 0.2)
                    }
                  }}
                >
                  <PersonAddIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                </IconButton>
              </Tooltip>
            )}
            <IconButton
              onClick={onClose}
              size={isMobile ? 'small' : 'medium'}
            >
              <ArrowBackIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
            </IconButton>
          </Stack>
        </Stack>
      </Box>

      {/* Scrollable Members List */}
      <Box sx={{ 
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {showAddTrainerForManager && (
          <Box sx={{ p: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.12 : 0.08)}` }}>
            <Button
              fullWidth
              variant='outlined'
              startIcon={<ChangeIcon />}
              onClick={onAddTrainer}
              sx={{ textTransform: 'none' }}
            >
              Add trainer
            </Button>
          </Box>
        )}
        <List sx={{ py: 0, flex: 1 }}>
          {visibleMembers.map((member, index) => {
            const isYou = currentUserEmail && member.email === currentUserEmail
            const isCreatorMember = member.role === 'creator' || (!member.masked && groupData?.creatorEmail && member.email === groupData.creatorEmail)
            const isManagerMember = member.role === 'manager' || (isClassroom && !member.masked && member.email && isGroupManagerEmail(member.email))
            const isTrainerMember = member.role === 'trainer' || (isClassroom && !member.masked && member.email && isTrainerEmail(member.email))
            return (
            <ListItem
              key={member._id || member.email || index}
              sx={isYou ? {
                background: alpha(theme.palette.primary.main, isDarkMode ? 0.15 : 0.08),
                borderLeft: `3px solid ${theme.palette.primary.main}`,
                borderRadius: 1,
                mb: 0.5
              } : undefined}
              secondaryAction={
                (() => {
                  if (isCreatorMember) return null
                  const isTrainer = isTrainerMember
                  const isManager = isManagerMember
                  if (isTrainer && onChangeTrainer && isCreator) {
                    return (
                      <Tooltip title='Change trainer' arrow>
                        <IconButton
                          edge='end'
                          onClick={(e) => onChangeTrainer(member, e)}
                          color='primary'
                          size={isMobile ? 'small' : 'medium'}
                          sx={{ minWidth: { xs: 40, sm: 48 }, minHeight: { xs: 40, sm: 48 } }}
                        >
                          <ChangeIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                        </IconButton>
                      </Tooltip>
                    )
                  }
                  if (isManager && onChangeManager && isCreator) {
                    return (
                      <Tooltip title='Change group manager' arrow>
                        <IconButton
                          edge='end'
                          onClick={(e) => onChangeManager(member, e)}
                          color='primary'
                          size={isMobile ? 'small' : 'medium'}
                          sx={{ minWidth: { xs: 40, sm: 48 }, minHeight: { xs: 40, sm: 48 } }}
                        >
                          <ChangeIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                        </IconButton>
                      </Tooltip>
                    )
                  }
                  if (isCreator && !isTrainer && !isManager && onRemoveMember) {
                    return (
                      <Tooltip title='Remove user' arrow>
                        <IconButton
                          edge='end'
                          onClick={(e) => onRemoveMember(member, e)}
                          color='error'
                          size={isMobile ? 'small' : 'medium'}
                          sx={{ minWidth: { xs: 40, sm: 48 }, minHeight: { xs: 40, sm: 48 } }}
                        >
                          <PersonRemoveIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                        </IconButton>
                      </Tooltip>
                    )
                  }
                  if (isGroupManager && !isTrainer && !isManager && wasAddedByManager(member) && onRemoveMember) {
                    return (
                      <Tooltip title='Remove user (added by you)' arrow>
                        <IconButton
                          edge='end'
                          onClick={(e) => onRemoveMember(member, e)}
                          color='error'
                          size={isMobile ? 'small' : 'medium'}
                          sx={{ minWidth: { xs: 40, sm: 48 }, minHeight: { xs: 40, sm: 48 } }}
                        >
                          <PersonRemoveIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                        </IconButton>
                      </Tooltip>
                    )
                  }
                  return null
                })()
              }
            >
              <ListItemAvatar>
                <Avatar
                  sx={{
                    width: { xs: 36, sm: 40 },
                    height: { xs: 36, sm: 40 },
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                  }}
                >
                  {member.profile
                    ? (member.profile.firstname?.[0] || member.profile.lastname?.[0] || member.email[0] || 'U').toUpperCase()
                    : (member.email[0] || 'U').toUpperCase()}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Stack direction='row' alignItems='center' spacing={1} sx={{ flexWrap: 'wrap' }}>
                    <Typography
                      sx={{
                        fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                        fontWeight: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: { xs: '150px', sm: '200px', md: '250px' }
                      }}
                    >
                      {member.profile
                        ? `${member.profile.firstname || ''} ${member.profile.lastname || ''}`.trim() || member.email.split('@')[0]
                        : member.email.split('@')[0]}
                    </Typography>
                    {isYou && (
                      <Chip
                        label='You'
                        size='small'
                        sx={{
                          height: { xs: 18, sm: 20 },
                          fontSize: { xs: '0.6rem', sm: '0.65rem' },
                          fontWeight: 600,
                          background: theme.palette.primary.main,
                          color: theme.palette.primary.contrastText
                        }}
                      />
                    )}
                    {isCreatorMember && (
                      <Chip
                        label='Admin'
                        size='small'
                        sx={{
                          height: { xs: 18, sm: 20 },
                          fontSize: { xs: '0.6rem', sm: '0.65rem' },
                          background: alpha(theme.palette.primary.main, isDarkMode ? 0.2 : 0.12),
                          color: theme.palette.primary.main
                        }}
                      />
                    )}
                    {isClassroom && isManagerMember && (
                      <Chip
                        label='Group Manager'
                        size='small'
                        sx={{
                          height: { xs: 18, sm: 20 },
                          fontSize: { xs: '0.6rem', sm: '0.65rem' },
                          background: alpha(theme.palette.secondary.main, isDarkMode ? 0.2 : 0.12),
                          color: theme.palette.secondary.main
                        }}
                      />
                    )}
                    {isClassroom && isTrainerMember && (
                      <Chip
                        label='Trainer'
                        size='small'
                        sx={{
                          height: { xs: 18, sm: 20 },
                          fontSize: { xs: '0.6rem', sm: '0.65rem' },
                          background: alpha(theme.palette.info.main, isDarkMode ? 0.2 : 0.12),
                          color: theme.palette.info.main
                        }}
                      />
                    )}
                  </Stack>
                }
                secondary={
                  <Typography
                    variant='caption'
                    sx={{
                      fontSize: { xs: '0.7rem', sm: '0.75rem' },
                      color: 'text.secondary',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: { xs: '200px', sm: '250px', md: '300px' }
                    }}
                  >
                    {member.email || (member.masked && member.displayId ? `ID: ${member.displayId}` : '')}
                  </Typography>
                }
              />
            </ListItem>
          )})}
        </List>
        {hasMore && (
          <Box sx={{ 
            p: 2, 
            borderTop: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.12 : 0.08)}`,
            flexShrink: 0
          }}>
            <Button
              fullWidth
              variant='outlined'
              onClick={handleShowMore}
              sx={{
                textTransform: 'none',
                fontSize: { xs: '0.875rem', sm: '0.9375rem' }
              }}
            >
              Show More ({sortedMembers.length - visibleCount} remaining)
            </Button>
          </Box>
        )}
      </Box>
    </Drawer>
  )
}

export default MembersDrawer

