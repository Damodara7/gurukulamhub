'use client'
import React from 'react'
import { Box, Chip, IconButton, Typography, CircularProgress, useTheme, alpha, useMediaQuery } from '@mui/material'
import SystemMessage from './SystemMessage'
import MessageBubble from './MessageBubble'

const MessagesArea = ({
  messages,
  messagesContainerRef,
  messagesEndRef,
  loading,
  loadingMore,
  hasMore,
  onLoadMore,
  selectionMode,
  selectedMessages,
  onToggleMessageSelection,
  onMessageMenuOpen,
  formatMessageTime,
  formatDateHeader,
  shouldShowDateHeader,
  getSenderName,
  getSenderAvatar,
  getColorFromString,
  getAvatarBackgroundColor,
  getReadStatusIcon,
  isMessageDeletedForMe,
  isMessageDeletedForEveryone,
  groupData,
  getAllMembers,
  session,
  theme,
  isMobile
}) => {
  const isDarkMode = theme.palette.mode === 'dark'

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          gap: 2
        }}
      >
        <CircularProgress size={isMobile ? 32 : 40} />
        <Typography
          variant='body2'
          color='text.secondary'
          sx={{ fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}
        >
          Loading messages...
        </Typography>
      </Box>
    )
  }

  return (
    <Box
      ref={messagesContainerRef}
      sx={{
        flex: 1,
        overflow: 'auto',
        p: { xs: 1, sm: 1.5, md: 2 },
        '&::-webkit-scrollbar': {
          width: { xs: '6px', sm: '8px' }
        },
        '&::-webkit-scrollbar-track': {
          background: alpha(theme.palette.divider, isDarkMode ? 0.15 : 0.1),
          borderRadius: '4px'
        },
        '&::-webkit-scrollbar-thumb': {
          background: alpha(theme.palette.primary.main, isDarkMode ? 0.5 : 0.4),
          borderRadius: '4px',
          '&:hover': {
            background: alpha(theme.palette.primary.main, isDarkMode ? 0.7 : 0.6)
          }
        }
      }}
    >
      {hasMore && messages.length > 0 && (
        <Box sx={{ textAlign: 'center', mb: { xs: 1.5, sm: 2 } }}>
          <IconButton
            onClick={onLoadMore}
            disabled={loadingMore}
            size={isMobile ? 'small' : 'medium'}
            sx={{
              color: 'text.secondary',
              minWidth: { xs: 120, sm: 140 },
              minHeight: { xs: 36, sm: 40 },
              '&:hover': {
                background: alpha(theme.palette.primary.main, isDarkMode ? 0.12 : 0.08)
              }
            }}
          >
            {loadingMore ? (
              <CircularProgress size={isMobile ? 18 : 20} />
            ) : (
              <Typography
                variant='caption'
                sx={{ fontSize: { xs: '0.75rem', sm: '0.8125rem' } }}
              >
                Load older messages
              </Typography>
            )}
          </IconButton>
        </Box>
      )}

      {messages.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            py: { xs: 6, sm: 8 },
            px: { xs: 2, sm: 3 }
          }}
        >
          <Typography
            variant={isMobile ? 'subtitle1' : 'h6'}
            color='text.secondary'
            sx={{
              mb: 1,
              fontSize: { xs: '1rem', sm: '1.25rem' },
              textAlign: 'center'
            }}
          >
            No messages yet
          </Typography>
          <Typography
            variant='body2'
            color='text.secondary'
            sx={{
              fontSize: { xs: '0.875rem', sm: '0.9375rem' },
              textAlign: 'center'
            }}
          >
            Start the conversation by sending a message
          </Typography>
        </Box>
      ) : (
        messages.map((message, index) => {
          const isOwnMessage = message.senderEmail === session?.user?.email
          const previousMessage = index > 0 ? messages[index - 1] : null
          const showDateHeader = shouldShowDateHeader(message, previousMessage)
          // Show avatar if:
          // 1. No previous message
          // 2. Different sender
          // 3. More than 5 minutes gap
          // 4. Previous message was deleted for everyone (to show sender name context)
          const previousWasDeletedForEveryone = previousMessage && isMessageDeletedForEveryone(previousMessage)
          const showAvatar = !previousMessage || previousMessage.senderEmail !== message.senderEmail ||
            (new Date(message.createdAt) - new Date(previousMessage.createdAt)) > 300000 || // 5 minutes
            previousWasDeletedForEveryone
          const isSystemMessage = message.messageType === 'system'

          return (
            <React.Fragment key={message._id || index}>
              {showDateHeader && (
                <Box sx={{ textAlign: 'center', my: { xs: 1.5, sm: 2 } }}>
                  <Chip
                    label={formatDateHeader(message.createdAt)}
                    size='small'
                    sx={{
                      background: alpha(theme.palette.divider, isDarkMode ? 0.15 : 0.1),
                      color: 'text.secondary',
                      fontSize: { xs: '0.7rem', sm: '0.75rem' },
                      height: { xs: 20, sm: 24 }
                    }}
                  />
                </Box>
              )}
              {isSystemMessage ? (
                <SystemMessage message={message} getSenderName={getSenderName} />
              ) : (
                <MessageBubble
                  message={message}
                  isOwnMessage={isOwnMessage}
                  showAvatar={showAvatar}
                  selectionMode={selectionMode}
                  isSelected={selectedMessages.has(message._id)}
                  onToggleSelection={() => onToggleMessageSelection(message._id)}
                  onMenuOpen={onMessageMenuOpen}
                  formatMessageTime={formatMessageTime}
                  getSenderName={getSenderName}
                  getSenderAvatar={getSenderAvatar}
                  getColorFromString={getColorFromString}
                  getAvatarBackgroundColor={getAvatarBackgroundColor}
                  getReadStatusIcon={getReadStatusIcon}
                  isMessageDeletedForMe={isMessageDeletedForMe}
                  isMessageDeletedForEveryone={isMessageDeletedForEveryone}
                  groupData={groupData}
                  getAllMembers={getAllMembers}
                  theme={theme}
                  isMobile={isMobile}
                />
              )}
            </React.Fragment>
          )
        })
      )}
      <div ref={messagesEndRef} />
    </Box>
  )
}

export default MessagesArea

