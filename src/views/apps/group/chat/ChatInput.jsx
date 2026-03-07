'use client'
import React, { useEffect, useRef, useState, useMemo } from 'react'
import { Paper, Box, Stack, TextField, IconButton, Typography, CircularProgress, useTheme, alpha, useMediaQuery, Chip, InputAdornment } from '@mui/material'
import { Send as SendIcon, AttachFile as AttachFileIcon, Close as CloseIcon } from '@mui/icons-material'
import AttachmentPreviewRow from './AttachmentPreviewRow'
import ImageViewerModal from './ImageViewerModal'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ACCEPT_FILE_TYPES = 'image/jpeg,image/png,image/webp,image/gif,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,video/mp4,video/webm,video/quicktime'

const ChatInput = ({
  newMessage,
  setNewMessage,
  canSend,
  isConnected,
  sending,
  onSend,
  onKeyPress,
  inputRef,
  groupData,
  editingMessage,
  onCancelEdit,
  formatMessageTime,
  getSenderName,
  selectedFiles = [],
  onRemoveFile,
  onFilesSelected,
  uploadProgress
}) => {
  const theme = useTheme()
  const isDarkMode = theme.palette.mode === 'dark'
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const fileInputRef = useRef(null)

  const handleAttachmentClick = () => {
    if (!canSend || !isConnected || sending || editingMessage) return
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    if (!files.length) return
    const valid = []
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) continue
      valid.push(file)
    }
    if (valid.length) onFilesSelected?.(valid)
    e.target.value = ''
  }

  const isImage = (file) => file?.type?.startsWith('image/')
  const canSubmit = (newMessage?.trim() || selectedFiles?.length) && isConnected && !sending

  const imageFilesOnly = useMemo(
    () => (selectedFiles || []).filter((f) => isImage(f)),
    [selectedFiles]
  )
  const imageFileIndices = useMemo(() => {
    const inds = []
    ;(selectedFiles || []).forEach((f, i) => {
      if (isImage(f)) inds.push(i)
    })
    return inds
  }, [selectedFiles])
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerIndex, setViewerIndex] = useState(0)
  const openViewer = (imageIndex) => {
    setViewerIndex(imageIndex)
    setViewerOpen(true)
  }
  const handleRemoveImageInModal = (imageIndex) => {
    const fileIndex = imageFileIndices[imageIndex]
    if (fileIndex != null) onRemoveFile?.(fileIndex)
    if (imageFilesOnly.length <= 1) setViewerOpen(false)
  }

  // Helper function to focus the input
  const focusInput = React.useCallback(() => {
    if (!canSend || !isConnected) return
    
    // Try to focus with a small delay to ensure DOM is ready
    const attemptFocus = () => {
      if (!inputRef.current) return
      
      // For MUI TextField with inputRef, the ref points directly to the input/textarea element
      // But sometimes it might be the TextField wrapper, so we check both
      let inputElement = inputRef.current
      
      // If it's not a textarea/input, try to find it
      if (inputElement.tagName !== 'TEXTAREA' && inputElement.tagName !== 'INPUT') {
        inputElement = inputRef.current.querySelector('textarea') || 
                       inputRef.current.querySelector('input') ||
                       inputRef.current
      }
      
      if (inputElement && typeof inputElement.focus === 'function') {
        try {
          inputElement.focus()
        } catch (e) {
          console.error('Error focusing input:', e)
        }
      }
    }
    
    // Try immediately and with delays
    attemptFocus()
    setTimeout(attemptFocus, 100)
    setTimeout(attemptFocus, 250)
  }, [canSend, isConnected])

  // Auto-focus input when component mounts or when conditions change
  useEffect(() => {
    if (canSend && isConnected && !editingMessage) {
      focusInput()
    }
  }, [canSend, isConnected, editingMessage, focusInput])

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Edit Message Popup - Above input, not over it */}
      {editingMessage && (
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            bottom: '100%',
            left: 0,
            right: 0,
            mb: 1,
            p: { xs: 1.25, sm: 1.5 },
            background: isDarkMode
              ? alpha(theme.palette.primary.main, 0.15)
              : alpha(theme.palette.primary.main, 0.8),
            border: `1px solid ${alpha(theme.palette.primary.main, isDarkMode ? 0.4 : 0.3)}`,
            borderRadius: { xs: 1.5, sm: 2 },
            zIndex: 10,
            backdropFilter: 'blur(100px)'
          }}
        >
          <Stack direction='row' spacing={1} alignItems='center' justifyContent='space-between'>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction='row' spacing={0.75} alignItems='center' sx={{ mb: 0.5 }}>
                <Chip
                  label='Editing'
                  size='small'
                  sx={{
                    height: { xs: 20, sm: 22 },
                    fontSize: { xs: '0.65rem', sm: '0.7rem' },
                    fontWeight: 600,
                    color: 'primary.main',
                    backgroundColor: 'white'
                  }}
                />
                <Typography
                  variant='caption'
                  sx={{
                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    color: 'white',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {getSenderName(editingMessage.senderEmail)} • {formatMessageTime(editingMessage.createdAt)}
                </Typography>
              </Stack>
              <Typography
                variant='h6'
                sx={{
                  color: 'white',
                  fontStyle: 'italic',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}
              >
                {editingMessage.message}
              </Typography>
            </Box>
            <IconButton
              size='small'
              onClick={onCancelEdit}
              sx={{
                color: 'white',
                width: { xs: 28, sm: 32 },
                height: { xs: 28, sm: 32 },
                flexShrink: 0
              }}
            >
              <CloseIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
            </IconButton>
          </Stack>
        </Paper>
      )}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, sm: 2 },
          borderTop: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.12 : 0.08)}`,
          background: isDarkMode
            ? alpha(theme.palette.background.paper, 0.95)
            : alpha(theme.palette.background.paper, 0.9),
          backdropFilter: 'blur(20px)'
        }}
      >
      {!canSend ? (
        <Box
          sx={{
            p: { xs: 1.5, sm: 2 },
            textAlign: 'center',
            background: alpha(theme.palette.warning.main, isDarkMode ? 0.15 : 0.1),
            borderRadius: { xs: 1.5, sm: 2 },
            border: `1px solid ${alpha(theme.palette.warning.main, isDarkMode ? 0.3 : 0.2)}`
          }}
        >
          <Typography
            variant='body2'
            color='text.secondary'
            sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
          >
            {groupData?.isAnnouncementOnly
              ? 'Only the group creator can send messages in announcement mode'
              : 'You must be a member of this group to send messages'}
          </Typography>
        </Box>
      ) : (
        <>
          <input
            type='file'
            ref={fileInputRef}
            accept={ACCEPT_FILE_TYPES}
            multiple
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          {selectedFiles?.length > 0 && (
            <AttachmentPreviewRow
              selectedFiles={selectedFiles}
              onRemoveFile={onRemoveFile}
              onPreviewImage={openViewer}
            />
          )}
          <ImageViewerModal
            open={viewerOpen}
            onClose={() => setViewerOpen(false)}
            imageFiles={imageFilesOnly}
            initialIndex={viewerIndex}
            onRemoveImage={handleRemoveImageInModal}
          />
          {uploadProgress != null && uploadProgress < 100 && (
            <Box sx={{ mb: 0.5 }}>
              <Typography variant='caption' color='text.secondary'>Uploading… {uploadProgress}%</Typography>
            </Box>
          )}
          <Stack direction='row' spacing={{ xs: 0.75, sm: 1 }} alignItems='flex-end'>
            <TextField
              inputRef={inputRef}
              fullWidth
              multiline
              maxRows={isMobile ? 3 : 4}
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyPress={onKeyPress}
              placeholder={editingMessage ? 'Edit your message...' : 'Type a message...'}
              disabled={!isConnected || sending}
              variant='outlined'
              size={isMobile ? 'small' : 'medium'}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start' sx={{ alignSelf: 'center', mr: 0 }}>
                    <IconButton
                      size='small'
                      onClick={handleAttachmentClick}
                      // disabled={!isConnected || sending || !!editingMessage}
                      disabled={true}
                      sx={{ color: theme.palette.text.secondary }}
                      aria-label='Attach file'
                    >
                      <AttachFileIcon sx={{ fontSize: { xs: 22, sm: 24 } }} />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  alignItems: 'center',
                  borderRadius: { xs: 2, sm: 3 },
                  background: isDarkMode
                    ? alpha(theme.palette.background.default, 0.7)
                    : alpha(theme.palette.background.default, 0.5),
                  fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                  '& fieldset': {
                    borderColor: alpha(theme.palette.divider, isDarkMode ? 0.4 : 0.3)
                  },
                  '&:hover fieldset': {
                    borderColor: alpha(theme.palette.primary.main, isDarkMode ? 0.6 : 0.5)
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main
                  }
                }
              }}
            />
            <IconButton
              onClick={() => onSend(newMessage?.trim() ?? '', selectedFiles)}
              disabled={!canSubmit}
              component='span'
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              color: 'white',
              width: { xs: 44, sm: 48 },
              height: { xs: 44, sm: 48 },
              minWidth: { xs: 44, sm: 48 },
              minHeight: { xs: 44, sm: 48 },
              '&:hover:not(:disabled)': {
                background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`
              },
              '&:disabled': {
                background: alpha(theme.palette.secondary.main, isDarkMode ? 0.2 : 0.12),
                color: theme.palette.action.disabled,
                cursor: 'not-allowed',
                '& *': {
                  color: `${theme.palette.action.disabled} !important`,
                  opacity: '1 !important'
                }
              }
            }}
          >
            {sending ? (
              <CircularProgress
                size={isMobile ? 18 : 20}
                sx={{
                  color: 'white'
                }}
              />
            ) : (
              <SendIcon
                sx={{
                  fontSize: { xs: 18, sm: 20 },
                  color: 'white'
                }}
              />
            )}
          </IconButton>
        </Stack>
        </>
      )}
      </Paper>
    </Box>
  )
}

export default ChatInput

