'use client'
import React from 'react'
import {
  Menu,
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  useTheme,
  alpha,
  useMediaQuery
} from '@mui/material'
import { CheckCircle as CheckCircleIcon, DoneAll as DoneAllIcon } from '@mui/icons-material'
import { formatDistanceToNow } from 'date-fns'

const ReadReceiptsMenu = ({
  anchorEl,
  open,
  onClose,
  message,
  getAllMembers,
  isIndividualChat = false // Flag to indicate individual chat
}) => {
  const theme = useTheme()
  const isDarkMode = theme.palette.mode === 'dark'
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  if (!message) return null

  // Filter out sender's own read receipt
  const readByExcludingSender = message.readBy?.filter(reader => reader.userEmail !== message.senderEmail) || []
  // Total members excluding sender
  const totalMembersExcludingSender = getAllMembers().filter(m => m.email !== message.senderEmail).length
  
  // For individual chats, check if the other person has read it
  const isRead = isIndividualChat && readByExcludingSender.length > 0

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          minWidth: { xs: 280, sm: 300 },
          maxWidth: { xs: '90vw', sm: 350 },
          maxHeight: { xs: '70vh', sm: 400 },
          background: theme.palette.background.paper,
          border: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.12 : 0.08)}`
        }
      }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
        {isIndividualChat ? (
          <>
            {isRead ? (
              <Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 0.5
                  }}
                >
                  <DoneAllIcon
                    sx={{
                      fontSize: { xs: 18, sm: 20 },
                      color: theme.palette.primary.main
                    }}
                  />
                  <Typography
                    variant='body2'
                    sx={{
                      color: 'text.primary',
                      fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                      fontWeight: 600
                    }}
                  >
                    Read
                  </Typography>
                </Box>
                {readByExcludingSender[0]?.readAt && (
                  <Typography
                    variant='caption'
                    sx={{
                      color: 'text.secondary',
                      fontSize: { xs: '0.7rem', sm: '0.75rem' },
                      ml: { xs: 3.5, sm: 4 }
                    }}
                  >
                    {formatDistanceToNow(new Date(readByExcludingSender[0].readAt), { addSuffix: true })}
                  </Typography>
                )}
              </Box>
            ) : (
              <Typography
                variant='body2'
                sx={{
                  color: 'text.secondary',
                  fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                  fontStyle: 'italic'
                }}
              >
                Not read yet
              </Typography>
            )}
          </>
        ) : (
          <>
            <Typography
              variant='subtitle2'
              sx={{
                mb: 1.5,
                fontWeight: 600,
                fontSize: { xs: '0.875rem', sm: '0.9375rem' }
              }}
            >
              Read by ({readByExcludingSender.length} / {totalMembersExcludingSender})
            </Typography>
            {readByExcludingSender.length === 0 ? (
              <Box
                sx={{
                  py: { xs: 3, sm: 4 },
                  textAlign: 'center'
                }}
              >
                <Typography
                  variant='body2'
                  sx={{
                    color: 'text.secondary',
                    fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                    fontStyle: 'italic'
                  }}
                >
                  No one has seen this message yet
                </Typography>
              </Box>
            ) : (
              <List dense>
                {readByExcludingSender.map((reader, index) => {
                  const member = getAllMembers().find(m => m.email === reader.userEmail)
                  return (
                    <ListItem
                      key={index}
                      sx={{
                        px: { xs: 1, sm: 1.5 },
                        py: { xs: 0.75, sm: 1 }
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            width: { xs: 36, sm: 40 },
                            height: { xs: 36, sm: 40 },
                            fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                            bgcolor: theme.palette.primary.main
                          }}
                        >
                          {member?.profile
                            ? (member.profile.firstname?.[0] || member.profile.lastname?.[0] || reader.userEmail[0] || 'U').toUpperCase()
                            : (reader.userEmail[0] || 'U').toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography
                            sx={{
                              fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                              fontWeight: 500
                            }}
                          >
                            {member?.profile
                              ? `${member.profile.firstname || ''} ${member.profile.lastname || ''}`.trim() || reader.userEmail.split('@')[0]
                              : reader.userEmail.split('@')[0]}
                          </Typography>
                        }
                        secondary={
                          <Typography
                            variant='caption'
                            sx={{
                              fontSize: { xs: '0.7rem', sm: '0.75rem' },
                              color: 'text.secondary'
                            }}
                          >
                            {formatDistanceToNow(new Date(reader.readAt), { addSuffix: true })}
                          </Typography>
                        }
                      />
                      <CheckCircleIcon
                        sx={{
                          fontSize: { xs: 18, sm: 20 },
                          color: theme.palette.primary.main,
                          ml: 1
                        }}
                      />
                    </ListItem>
                  )
                })}
              </List>
            )}
          </>
        )}
      </Box>
    </Menu>
  )
}

export default ReadReceiptsMenu

