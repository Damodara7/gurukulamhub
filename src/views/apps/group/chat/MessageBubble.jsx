'use client'
import React from 'react'
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Stack,
  IconButton,
  Chip,
  useTheme,
  alpha,
  Checkbox,
  useMediaQuery
} from '@mui/material'
import {
  MoreVert as MoreVertIcon,
  Block as BlockIcon
} from '@mui/icons-material'

const MessageBubble = ({
  message,
  isOwnMessage,
  showAvatar,
  selectionMode,
  isSelected,
  onToggleSelection,
  onMenuOpen,
  formatMessageTime,
  getSenderName,
  getSenderAvatar,
  getColorFromString,
  getAvatarBackgroundColor,
  getReadStatusIcon,
  isMessageDeletedForMe,
  isMessageDeletedForEveryone,
  groupData,
  getAllMembers,
  theme,
  isMobile
}) => {
  const isDarkMode = theme.palette.mode === 'dark'

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        mb: showAvatar ? 0.5 : 0.5,
        alignItems: 'flex-start',
        position: 'relative',
        background: isSelected
          ? alpha(theme.palette.primary.main, isDarkMode ? 0.1 : 0.05)
          : 'transparent',
        borderRadius: 1,
        transition: 'background-color 0.2s ease',
        py: 0.5,
        cursor: selectionMode ? 'pointer' : 'default',
        '&:hover': {
          background: isSelected
            ? alpha(theme.palette.primary.main, isDarkMode ? 0.12 : 0.07)
            : alpha(theme.palette.action.hover, isDarkMode ? 0.05 : 0.02)
        }
      }}
      onClick={selectionMode ? onToggleSelection : undefined}
    >
      {/* Selection Checkbox - Fixed left position */}
      {selectionMode && (
        <Box
          sx={{
            position: 'absolute',
            left: { xs: 4, sm: 8 },
            top: { xs: 4, sm: 6 },
            display: 'flex',
            alignItems: 'flex-start',
            zIndex: 1
          }}
        >
          <Checkbox
            checked={isSelected}
            onChange={onToggleSelection}
            onClick={(e) => e.stopPropagation()}
            size={isMobile ? 'small' : 'medium'}
            sx={{
              color: theme.palette.primary.main,
              '&.Mui-checked': {
                color: theme.palette.primary.main
              }
            }}
          />
        </Box>
      )}
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
          alignItems: 'flex-start',
          gap: 1,
          // pl: selectionMode
          //   ? isOwnMessage
          //     ? { xs: 40, sm: 48 }
          //     : { xs: 0, sm: 0 }
          //   : 0,
          pr: 1
        }}
      >
        {!isOwnMessage && (
          <Box
            sx={{
              width: { xs: 28, sm: 32 },
              height: { xs: 28, sm: 32 },
              mr: { xs: 0.75, sm: 1 },
              flexShrink: 0,
              display: 'flex',
              alignItems: 'flex-start',
              ml: selectionMode ? { xs: 10, sm: 10 } : 0
            }}
          >
            <Avatar
              sx={{
                color: 'white',
                width: { xs: 28, sm: 32 },
                height: { xs: 28, sm: 32 },
                background: getAvatarBackgroundColor 
                  ? getAvatarBackgroundColor(message.senderEmail)
                  : `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                fontWeight: 600,
                display: showAvatar ? 'flex' : 'none'
              }}
            >
              {getSenderAvatar(message.senderEmail)}
            </Avatar>
          </Box>
        )}
        <Box
          sx={{
            maxWidth: { xs: '85%', sm: '75%', md: '60%' },
            display: 'flex',
            flexDirection: 'column',
            alignItems: isOwnMessage ? 'flex-end' : 'flex-start',
            position: 'relative'
          }}
        >
          <Paper
            elevation={0}
            onContextMenu={(e) => {
              if (!selectionMode && !isMessageDeletedForMe(message) && !isMessageDeletedForEveryone(message)) {
                e.preventDefault()
                onMenuOpen(e, message)
              }
            }}
            sx={{
              p: { xs: 1.25, sm: 1.5 },
              borderRadius: { xs: 1.5, sm: 2 },
              background: isOwnMessage
                ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
                : isDarkMode
                  ? alpha(theme.palette.background.paper, 0.95)
                  : '#ffffff',
              color: isOwnMessage ? 'white' : 'text.primary',
              wordBreak: 'break-word',
              position: 'relative',
              cursor: selectionMode ? 'pointer' : (isOwnMessage && message.readBy?.length > 0 ? 'pointer' : 'default'),
              border: isOwnMessage
                ? 'none'
                : isDarkMode
                  ? `1px solid ${alpha(theme.palette.divider, 0.2)}`
                  : `1px solid ${alpha(theme.palette.divider, 0.15)}`,
              boxShadow: !isOwnMessage && !isDarkMode
                ? '0 1px 2px rgba(0, 0, 0, 0.05)'
                : 'none',
              position: 'relative',
              '&:hover': !selectionMode ? {
                '& .message-menu-dots': {
                  opacity: 1
                }
              } : {}
            }}
          >
            {isMessageDeletedForEveryone(message) ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <BlockIcon 
                  sx={{ 
                    fontSize: { xs: 16, sm: 18 }, 
                    color: isOwnMessage ? alpha('#fff', 0.8) : 'text.secondary',
                    flexShrink: 0
                  }} 
                />
                <Typography
                  variant='body2'
                  sx={{
                    fontStyle: 'italic',
                    color: isOwnMessage ? alpha('#fff', 0.7) : 'text.secondary',
                    fontSize: { xs: '0.875rem', sm: '0.9375rem' }
                  }}
                >
                  {isOwnMessage
                    ? 'You deleted this message'
                    : `${getSenderName(message.senderEmail)} deleted this message`}
                </Typography>
              </Box>
            ) : isMessageDeletedForMe(message) ? (
              <Typography
                variant='body2'
                sx={{
                  fontStyle: 'italic',
                  color: isOwnMessage ? alpha('#fff', 0.7) : 'text.secondary',
                  fontSize: { xs: '0.875rem', sm: '0.9375rem' }
                }}
              >
                This message was deleted
              </Typography>
            ) : (
              <>
                {!isOwnMessage && showAvatar && (
                  <Typography
                    variant='caption'
                    sx={{
                      mb: 0.5,
                      fontWeight: 600,
                      fontSize: { xs: '0.7rem', sm: '0.75rem' },
                      color: getAvatarBackgroundColor 
                        ? getAvatarBackgroundColor(message.senderEmail)
                        : getColorFromString(message.senderEmail),
                      display: 'block'
                    }}
                  >
                    {getSenderName(message.senderEmail)}
                    {message.senderEmail === groupData?.creatorEmail && (
                      <Chip
                        label='Admin'
                        size='small'
                        sx={{
                          height: { xs: 14, sm: 16 },
                          fontSize: { xs: '0.55rem', sm: '0.6rem' },
                          ml: 0.5,
                          background: alpha(theme.palette.primary.main, isDarkMode ? 0.2 : 0.12),
                          color: theme.palette.primary.main
                        }}
                      />
                    )}
                  </Typography>
                )}
                <Typography
                  variant='body2'
                  component='div'
                  sx={{
                    fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                    color: isOwnMessage ? 'white' : 'text.primary',
                    mb: 0,
                    mr: 10,
                    whiteSpace: 'pre-wrap', // Preserve newlines and wrap text
                    wordBreak: 'break-word' // Break long words if needed
                  }}
                >
                  {message.message}
                </Typography>
                {/* Three dots menu - appears on hover for all messages, span not IconButton */}
                {!selectionMode && !isMessageDeletedForMe(message) && !isMessageDeletedForEveryone(message) && (
                  <Box
                    component='span'
                    className='message-menu-dots'
                    onClick={(e) => {
                      e.stopPropagation()
                      onMenuOpen(e, message)
                    }}
                    sx={{
                      position: 'absolute',
                      top: { xs: 4, sm: 6 },
                      right: { xs: 4, sm: 6 },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      opacity: 0,
                      transition: 'opacity 0.2s',
                      color: isOwnMessage ? 'white' : 'text.secondary',
                      zIndex: 1
                    }}
                  >
                    <MoreVertIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                  </Box>
                )}
                {/* Timestamp container at bottom */}
                <Stack
                  direction='row'
                  alignItems='center'
                  spacing={1}
                  sx={{
                    mt: 0,
                    justifyContent: 'flex-end',
                    width: '100%'
                  }}
                >
                  {message.isEdited && (
                    <Typography
                      variant='caption'
                      sx={{
                        fontSize: { xs: '0.6rem', sm: '0.65rem' },
                        opacity: isOwnMessage ? 0.8 : 0.6,
                        color: isOwnMessage ? 'white' : 'text.secondary',
                        fontStyle: 'italic'
                      }}
                    >
                      Edited
                    </Typography>
                  )}
                  <Typography
                    variant='caption'
                    sx={{
                      fontSize: { xs: '0.65rem', sm: '0.7rem' },
                      opacity: isOwnMessage ? 0.8 : 0.6,
                      color: isOwnMessage ? 'white' : 'text.secondary',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {formatMessageTime(message.createdAt)}
                  </Typography>
                  {isOwnMessage && (
                    <Box
                      sx={{
                        ml: 0.25,
                        display: 'inline-flex',
                        alignItems: 'center',
                        '& svg': {
                          fontSize: { xs: 16, sm: 18 },
                          filter: (() => {
                            // Filter out sender's own read receipt
                            const readByExcludingSender = message.readBy?.filter(reader => reader.userEmail !== message.senderEmail) || []
                            const totalMembersExcludingSender = getAllMembers().filter(m => m.email !== message.senderEmail).length
                            return readByExcludingSender.length === totalMembersExcludingSender
                              ? 'drop-shadow(0 0 2px rgba(33, 150, 243, 0.5))'
                              : 'none'
                          })()
                        }
                      }}
                    >
                      {getReadStatusIcon(message)}
                    </Box>
                  )}
                </Stack>
              </>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  )
}

export default MessageBubble

