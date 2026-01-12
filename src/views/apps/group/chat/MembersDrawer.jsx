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
  PersonRemove as PersonRemoveIcon
} from '@mui/icons-material'

const MembersDrawer = ({
  open,
  onClose,
  members,
  isCreator,
  onAddMember,
  onRemoveMember
}) => {
  const theme = useTheme()
  const isDarkMode = theme.palette.mode === 'dark'
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [visibleCount, setVisibleCount] = useState(15)

  // Reset visible count when drawer opens or members change
  useEffect(() => {
    if (open) {
      setVisibleCount(15)
    }
  }, [open, members.length])

  const handleShowMore = () => {
    setVisibleCount(prev => Math.min(prev + 10, members.length))
  }

  const visibleMembers = members.slice(0, visibleCount)
  const hasMore = members.length > visibleCount

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
              {members.length}
            </Box>
          </Stack>
          <Stack direction='row' spacing={{ xs: 0.5, sm: 1 }}>
            {isCreator && (
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
        <List sx={{ py: 0, flex: 1 }}>
          {visibleMembers.map((member, index) => (
            <ListItem
              key={member.email || index}
              secondaryAction={
                isCreator && !member.isCreator && (
                  <Tooltip title='Remove user' arrow>
                    <IconButton
                      edge='end'
                      onClick={(e) => onRemoveMember(member, e)}
                      color='error'
                      size={isMobile ? 'small' : 'medium'}
                      sx={{
                        minWidth: { xs: 40, sm: 48 },
                        minHeight: { xs: 40, sm: 48 }
                      }}
                    >
                      <PersonRemoveIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                    </IconButton>
                  </Tooltip>
                )
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
                    {member.isCreator && (
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
                    {member.email}
                  </Typography>
                }
              />
            </ListItem>
          ))}
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
              Show More ({members.length - visibleCount} remaining)
            </Button>
          </Box>
        )}
      </Box>
    </Drawer>
  )
}

export default MembersDrawer

