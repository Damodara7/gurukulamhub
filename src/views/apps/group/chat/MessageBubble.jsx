'use client'
import React, { useState, useMemo } from 'react'
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
  useMediaQuery,
  Tooltip
} from '@mui/material'
import {
  MoreVert as MoreVertIcon,
  Block as BlockIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  InsertDriveFile as InsertDriveFileIcon
} from '@mui/icons-material'
import MessageImageViewerModal from './MessageImageViewerModal'

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
  isMobile,
  needApprovalForMessages = false,
  isGroupManager = false
}) => {
  const isDarkMode = theme.palette.mode === 'dark'
  const status = message.approvalStatus || null
  const editedByManager = message.editedByManager && status !== 'rejected'
  const attachments = message.attachments || []
  const isImageType = (type) => (type || '').startsWith('image/')
  const isImageByExtension = (fileName) => /\.(jpe?g|png|webp|gif)$/i.test(fileName || '')
  const isImageAttachment = (att) => isImageType(att.fileType) || isImageByExtension(att.fileName)
  const resolveAttachmentUrl = (att) => {
    let url = att.url
    if (!url) return ''
    if (url.startsWith('http')) return url
    if (url.startsWith('/')) {
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      url = origin ? `${origin}${url}` : url
    } else {
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      url = `${origin}/${url.replace(/^\//, '')}`
    }
    const match = url.match(/^(.+\/([^/]+))\/([^/]+)$/)
    if (match && match[2] === match[3]) {
      return match[1]
    }
    return url
  }

  const imageAttachmentsForPreview = useMemo(() => {
    return attachments
      .filter((att) => isImageAttachment(att))
      .map((att) => ({ url: resolveAttachmentUrl(att), fileName: att.fileName }))
  }, [attachments])

  const imageCount = imageAttachmentsForPreview.length
  const fileAttachments = useMemo(
    () => attachments.filter((att) => !isImageAttachment(att)),
    [attachments]
  )
  const showImageGrid = imageCount > 3

  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewIndex, setPreviewIndex] = useState(0)

  const openPreviewAt = (index) => {
    setPreviewIndex(index)
    setPreviewOpen(true)
  }

  const thumbSx = {
    display: 'block',
    width: '100%',
    maxWidth: 220,
    aspectRatio: '1',
    borderRadius: 1,
    overflow: 'hidden',
    border: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.3 : 0.2)}`,
    cursor: 'pointer',
    flex: 1,
    minWidth: 0
  }
  const imgSx = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
    verticalAlign: 'middle'
  }
  // Smaller thumbnails for grid when more than 3 images
  const gridThumbSx = {
    ...thumbSx,
    maxWidth: 140
  }
  const gridImgSx = { ...imgSx }

  // Status icon for sender (student/trainer): pending / rejected / edited by manager / approved
  const showSenderStatusIcon = needApprovalForMessages && !isGroupManager && isOwnMessage &&
    !isMessageDeletedForMe(message) && !isMessageDeletedForEveryone(message)
  const senderStatusIcon = showSenderStatusIcon && (() => {
    if (status === 'pending') return { Icon: ScheduleIcon, label: 'Pending approval', color: 'warning.main' }
    if (status === 'rejected') return { Icon: CancelIcon, label: 'Rejected', color: 'error.main' }
    if (editedByManager) return { Icon: EditIcon, label: 'Edited by manager', color: 'info.main' }
    if (status === 'approved') return { Icon: CheckCircleIcon, label: 'Approved', color: 'success.main' }
    return null
  })()

  // Status icon for group manager: pending / rejected / approved (on any message, to grab attention)
  const showManagerStatusIcon = needApprovalForMessages && isGroupManager &&
    !isMessageDeletedForMe(message) && !isMessageDeletedForEveryone(message) && status
  const managerStatusIcon = showManagerStatusIcon && (() => {
    if (status === 'pending') return { Icon: ScheduleIcon, label: 'Pending', color: 'warning.main' }
    if (status === 'rejected') return { Icon: CancelIcon, label: 'Rejected', color: 'error.main' }
    if (status === 'approved') return { Icon: CheckCircleIcon, label: 'Approved', color: 'success.main' }
    return null
  })()

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
            flexDirection: 'row',
            alignItems: 'flex-end',
            gap: 0.5,
            flexWrap: 'nowrap'
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
              flex: '1 1 auto',
              minWidth: 0,
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
              cursor: selectionMode ? 'pointer' : (isOwnMessage && message.readBy?.length > 0 && message.approvalStatus !== 'pending' && message.approvalStatus !== 'rejected' ? 'pointer' : 'default'),
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
                    {groupData?.groupType === 'classroom' && message.senderEmail === groupData?.groupManagerEmail && (
                      <Chip
                        label='Manager'
                        size='small'
                        sx={{
                          height: { xs: 14, sm: 16 },
                          fontSize: { xs: '0.55rem', sm: '0.6rem' },
                          ml: 0.5,
                          background: alpha(theme.palette.secondary.main, isDarkMode ? 0.2 : 0.12),
                          color: theme.palette.secondary.main
                        }}
                      />
                    )}
                    {groupData?.groupType === 'classroom' && message.senderEmail === groupData?.trainerEmail && (
                      <Chip
                        label='Trainer'
                        size='small'
                        sx={{
                          height: { xs: 14, sm: 16 },
                          fontSize: { xs: '0.55rem', sm: '0.6rem' },
                          ml: 0.5,
                          background: alpha(theme.palette.info.main, isDarkMode ? 0.2 : 0.12),
                          color: theme.palette.info.main
                        }}
                      />
                    )}
                  </Typography>
                )}
                {attachments.length > 0 && (
                  <Stack direction='column' spacing={0.75} sx={{ mb: 0.75 }}>
                    {showImageGrid ? (
                      <>
                        <Stack direction='row' spacing={0.75} sx={{ flexWrap: 'nowrap', maxWidth: 295 }}>
                          {[0, 1].map((i) => (
                            <Box
                              key={`img-${i}`}
                              onClick={(e) => { e.preventDefault(); openPreviewAt(i) }}
                              sx={gridThumbSx}
                            >
                              <Box
                                component='img'
                                src={imageAttachmentsForPreview[i].url}
                                alt={imageAttachmentsForPreview[i].fileName || 'Image'}
                                sx={gridImgSx}
                              />
                            </Box>
                          ))}
                        </Stack>
                        <Stack direction='row' spacing={0.75} sx={{ flexWrap: 'nowrap', maxWidth: 295 }}>
                          <Box
                            onClick={(e) => { e.preventDefault(); openPreviewAt(2) }}
                            sx={gridThumbSx}
                          >
                            <Box
                              component='img'
                              src={imageAttachmentsForPreview[2].url}
                              alt={imageAttachmentsForPreview[2].fileName || 'Image'}
                              sx={gridImgSx}
                            />
                          </Box>
                          <Box
                            onClick={(e) => { e.preventDefault(); openPreviewAt(3) }}
                            sx={{
                              ...gridThumbSx,
                              position: 'relative',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              minHeight: 120
                            }}
                          >
                            <Box
                              component='img'
                              src={imageAttachmentsForPreview[3]?.url}
                              alt=''
                              sx={{
                                position: 'absolute',
                                inset: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                opacity: 0.45
                              }}
                            />
                            <Box
                              sx={{
                                position: 'relative',
                                zIndex: 1,
                                borderRadius: 1,
                                px: 0.5
                              }}
                            >
                              <Typography
                                variant='h1'
                                sx={{
                                  color: theme.palette.common.white,
                                  fontWeight: 700,
                                  textShadow: '0 1px 3px rgba(0, 0, 0, 0.7)'
                                }}
                              >
                                +{imageCount - 3}
                              </Typography>
                            </Box>
                          </Box>
                        </Stack>
                        {fileAttachments.map((att, idx) => {
                          const url = resolveAttachmentUrl(att)
                          return (
                            <Box
                              key={att.key || `file-${idx}`}
                              component='a'
                              href={url}
                              target='_blank'
                              rel='noopener noreferrer'
                              download={att.fileName}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.75,
                                px: 1,
                                py: 0.75,
                                borderRadius: 1,
                                textDecoration: 'none',
                                color: isOwnMessage ? 'white' : theme.palette.primary.main,
                                backgroundColor: alpha(theme.palette.primary.main, isOwnMessage ? 0.2 : 0.08),
                                border: `1px solid ${alpha(theme.palette.primary.main, isOwnMessage ? 0.4 : 0.25)}`,
                                maxWidth: 220,
                                '&:hover': {
                                  backgroundColor: alpha(theme.palette.primary.main, isOwnMessage ? 0.3 : 0.12)
                                }
                              }}
                            >
                              <InsertDriveFileIcon sx={{ fontSize: 20, flexShrink: 0 }} />
                              <Typography
                                variant='caption'
                                sx={{
                                  fontSize: '0.75rem',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {att.fileName || 'File'}
                              </Typography>
                            </Box>
                          )
                        })}
                      </>
                    ) : (
                      (() => {
                        let imageIdx = 0
                        return attachments.map((att, idx) => {
                          const isImage = isImageAttachment(att)
                          const url = resolveAttachmentUrl(att)
                          if (isImage) {
                            const thisImageIndex = imageIdx
                            imageIdx += 1
                            return (
                              <Box
                                key={att.key || idx}
                                onClick={(e) => {
                                  e.preventDefault()
                                  openPreviewAt(thisImageIndex)
                                }}
                                sx={{ ...thumbSx, flex: 'none' }}
                              >
                                <Box
                                  component='img'
                                  src={url}
                                  alt={att.fileName || 'Image'}
                                  sx={imgSx}
                                />
                              </Box>
                            )
                          }
                          return (
                            <Box
                              key={att.key || idx}
                              component='a'
                              href={url}
                              target='_blank'
                              rel='noopener noreferrer'
                              download={att.fileName}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.75,
                                px: 1,
                                py: 0.75,
                                borderRadius: 1,
                                textDecoration: 'none',
                                color: isOwnMessage ? 'white' : theme.palette.primary.main,
                                backgroundColor: alpha(theme.palette.primary.main, isOwnMessage ? 0.2 : 0.08),
                                border: `1px solid ${alpha(theme.palette.primary.main, isOwnMessage ? 0.4 : 0.25)}`,
                                maxWidth: 220,
                                '&:hover': {
                                  backgroundColor: alpha(theme.palette.primary.main, isOwnMessage ? 0.3 : 0.12)
                                }
                              }}
                            >
                              <InsertDriveFileIcon sx={{ fontSize: 20, flexShrink: 0 }} />
                              <Typography
                                variant='caption'
                                sx={{
                                  fontSize: '0.75rem',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {att.fileName || 'File'}
                              </Typography>
                            </Box>
                          )
                        })
                      })()
                    )}
                  </Stack>
                )}
                {imageAttachmentsForPreview.length > 0 && (
                  <MessageImageViewerModal
                    open={previewOpen}
                    onClose={() => setPreviewOpen(false)}
                    imageAttachments={imageAttachmentsForPreview}
                    initialIndex={previewIndex}
                  />
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
                {/* Classroom: approval status for own messages (pending / rejected / edited by manager) */}
                {isOwnMessage && (message.approvalStatus === 'pending' || message.approvalStatus === 'rejected' || message.editedByManager) && (
                  <Box sx={{ mt: 0.5 }}>
                    {message.approvalStatus === 'pending' && (
                      <Chip
                        label='Pending approval'
                        size='small'
                        sx={{
                          height: 20,
                          fontSize: '0.7rem',
                          background: alpha(theme.palette.warning.main, 0.3),
                          color: isOwnMessage ? 'white' : theme.palette.warning.dark
                        }}
                      />
                    )}
                    {message.approvalStatus === 'rejected' && (
                      <Chip
                        label={message.rejectedReason ? `Rejected: ${message.rejectedReason}` : 'Rejected'}
                        size='small'
                        sx={{
                          height: 20,
                          fontSize: '0.7rem',
                          background: alpha(theme.palette.error.main, 0.3),
                          color: isOwnMessage ? 'white' : theme.palette.error.dark
                        }}
                      />
                    )}
                    {message.editedByManager && message.approvalStatus !== 'rejected' && (
                      <Chip
                        label='Edited by manager'
                        size='small'
                        sx={{
                          height: 20,
                          fontSize: '0.7rem',
                          background: alpha(theme.palette.info.main, 0.3),
                          color: isOwnMessage ? 'white' : theme.palette.info.dark
                        }}
                      />
                    )}
                  </Box>
                )}
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
                  {isOwnMessage && message.approvalStatus !== 'pending' && message.approvalStatus !== 'rejected' && (
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
          {/* Approval status icon to the right of bubble (no overlap) */}
          {(senderStatusIcon || managerStatusIcon) && (() => {
            const statusInfo = senderStatusIcon || managerStatusIcon
            const StatusIcon = statusInfo.Icon
            return (
              <Box
                sx={{
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  alignSelf: 'flex-end',
                  color: statusInfo.color,
                  pb: 0.25
                }}
              >
                <Tooltip title={statusInfo.label} arrow placement='top'>
                  <Box component='span' sx={{ lineHeight: 0, display: 'inline-flex' }}>
                    <StatusIcon sx={{ fontSize: 14, opacity: 0.95 }} />
                  </Box>
                </Tooltip>
              </Box>
            )
          })()}
        </Box>
      </Box>
    </Box>
  )
}

export default MessageBubble

