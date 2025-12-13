'use client'
import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  useTheme,
  alpha,
  useMediaQuery
} from '@mui/material'
import { useSession } from 'next-auth/react'

const DeleteDialog = ({
  open,
  onClose,
  selectedCount,
  menuMessage,
  messages,
  selectedMessages,
  onConfirm,
  isMessageDeletedForEveryone,
  fromMenu = false // New prop to indicate if opened from menu
}) => {
  const theme = useTheme()
  const isDarkMode = theme.palette.mode === 'dark'
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { data: session } = useSession()

  // Check if any selected message or menu message is deleted for everyone
  const hasDeletedForEveryone = selectedCount > 0
    ? messages.some(m => selectedMessages.has(m._id) && isMessageDeletedForEveryone(m))
    : menuMessage && isMessageDeletedForEveryone(menuMessage)

  // Check if all selected messages are from the current user
  const allMessagesAreFromUser = selectedCount > 0
    ? messages
        .filter(m => selectedMessages.has(m._id))
        .every(m => m.senderEmail === session?.user?.email)
    : menuMessage?.senderEmail === session?.user?.email

  // Show "delete for everyone" if:
  // 1. Not deleted for everyone
  // 2. All messages are from the current user (sender)
  // When opened from menu, we want to show both options if the message is from the user
  const canDeleteForEveryone = !hasDeletedForEveryone && allMessagesAreFromUser

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='sm'
      fullWidth
      PaperProps={{
        sx: {
          background: theme.palette.background.default
        }
      }}
    >
      <DialogTitle
        sx={{
          p: { xs: 1.5, sm: 2 },
          borderBottom: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.12 : 0.08)}`
        }}
      >
        <Typography
          variant={isMobile ? 'h6' : 'h5'}
          sx={{ fontSize: { xs: '1.1rem', sm: '1.5rem' } }}
        >
          Delete Message{selectedCount > 1 ? 's' : ''}?
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Typography sx={{ mb: 2, fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}>
          How would you like to delete {selectedCount > 1 ? 'these messages' : 'this message'}?
        </Typography>
        <Stack spacing={1.5}>
          <Button
            variant='outlined'
            fullWidth
            onClick={() => onConfirm(false)}
            sx={{
              py: { xs: 1.25, sm: 1.5 },
              fontSize: { xs: '0.875rem', sm: '0.9375rem' },
              textTransform: 'none'
            }}
          >
            Delete for me
          </Button>
          {canDeleteForEveryone && (
            <Button
              variant='outlined'
              fullWidth
              color='error'
              onClick={() => onConfirm(true)}
              sx={{
                py: { xs: 1.25, sm: 1.5 },
                fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                textTransform: 'none'
              }}
            >
              Delete for everyone
            </Button>
          )}
        </Stack>
      </DialogContent>
      <DialogActions
        sx={{
          p: { xs: 1.5, sm: 2 },
          borderTop: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.12 : 0.08)}`
        }}
      >
        <Button
          onClick={onClose}
          size={isMobile ? 'small' : 'medium'}
          variant='outlined'
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DeleteDialog

