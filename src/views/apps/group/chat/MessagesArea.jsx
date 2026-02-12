'use client'
import React from 'react'
import { Box, Chip, Typography, CircularProgress, useTheme, alpha } from '@mui/material'
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
  isMobile,
  isIndividualChat = false,
  needApprovalForMessages = false,
  isGroupManager = false
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
        <Box 
          sx={{ 
            textAlign: 'center', 
            mb: { xs: 1.5, sm: 2 },
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Box
            component='button'
            onClick={onLoadMore}
            disabled={loadingMore}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              px: { xs: 2.5, sm: 3 },
              py: { xs: 1, sm: 1.25 },
              minWidth: { xs: 160, sm: 180 },
              borderRadius: '20px',
              border: 'none',
              background: isDarkMode
                ? alpha(theme.palette.background.paper, 0.6)
                : alpha(theme.palette.grey[200], 0.8),
              color: 'text.secondary',
              cursor: loadingMore ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              fontSize: { xs: '0.8125rem', sm: '0.875rem' },
              fontWeight: 500,
              fontFamily: theme.typography.fontFamily,
              boxShadow: isDarkMode
                ? '0 2px 4px rgba(0, 0, 0, 0.1)'
                : '0 1px 3px rgba(0, 0, 0, 0.08)',
              '&:hover:not(:disabled)': {
                background: isDarkMode
                  ? alpha(theme.palette.background.paper, 0.8)
                  : alpha(theme.palette.grey[300], 0.9),
                transform: 'translateY(-1px)',
                boxShadow: isDarkMode
                  ? '0 4px 8px rgba(0, 0, 0, 0.15)'
                  : '0 2px 6px rgba(0, 0, 0, 0.12)'
              },
              '&:active:not(:disabled)': {
                transform: 'translateY(0)',
                boxShadow: isDarkMode
                  ? '0 2px 4px rgba(0, 0, 0, 0.1)'
                  : '0 1px 3px rgba(0, 0, 0, 0.08)'
              },
              '&:disabled': {
                opacity: 0.6,
                cursor: 'not-allowed'
              }
            }}
          >
            {loadingMore ? (
              <>
                <CircularProgress size={isMobile ? 16 : 18} thickness={4} />
                <Typography
                  variant='caption'
                  sx={{ 
                    fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                    fontWeight: 500
                  }}
                >
                  Loading...
                </Typography>
              </>
            ) : (
              <Typography
                variant='caption'
                sx={{ 
                  fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                  fontWeight: 500
                }}
              >
                Load older messages
              </Typography>
            )}
          </Box>
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
          // For individual chats, don't show avatar for the other person (only show for own messages if needed)
          const previousWasDeletedForEveryone = previousMessage && isMessageDeletedForEveryone(previousMessage)
          let showAvatar = !previousMessage || previousMessage.senderEmail !== message.senderEmail ||
            (new Date(message.createdAt) - new Date(previousMessage.createdAt)) > 300000 || // 5 minutes
            previousWasDeletedForEveryone
          
          // For individual chats, hide avatar for the other person's messages
          if (isIndividualChat && !isOwnMessage) {
            showAvatar = false
          }
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
                  needApprovalForMessages={needApprovalForMessages}
                  isGroupManager={isGroupManager}
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

