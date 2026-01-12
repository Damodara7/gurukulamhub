'use client'
import React from 'react'
import { Menu, MenuItem, useTheme, alpha, useMediaQuery } from '@mui/material'
import {
  Info as InfoIcon,
  CheckBoxOutlineBlank as CheckboxOutlineBlankIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material'

const MessageMenu = ({
  anchorEl,
  open,
  onClose,
  menuMessage,
  session,
  onInfoClick,
  onSelectMode,
  onEditClick,
  onDeleteClick,
  isMessageDeletedForEveryone,
  isMessageDeletedForMe
}) => {
  const theme = useTheme()
  const isDarkMode = theme.palette.mode === 'dark'
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  if (!menuMessage) return null

  const isMenuMessageOwn = menuMessage.senderEmail === session?.user?.email
  const isDeletedForEveryone = isMessageDeletedForEveryone(menuMessage)
  const isDeletedForMe = isMessageDeletedForMe(menuMessage)

  // Check if message is older than 1 hour
  const messageAge = menuMessage.createdAt 
    ? Date.now() - new Date(menuMessage.createdAt).getTime() 
    : Infinity
  const oneHour = 60 * 60 * 1000
  const isOlderThanOneHour = messageAge > oneHour

  // Info should be available for own messages (not others') that are not deleted for everyone
  // Show Info even if no one has seen it yet
  const canShowInfo = isMenuMessageOwn && !isDeletedForEveryone
  
  // Edit is only available for own messages that are not deleted and not older than 1 hour
  const canEdit = isMenuMessageOwn && !isDeletedForMe && !isOlderThanOneHour

  // If deleted for everyone, only show "Delete for me" option
  if (isDeletedForEveryone) {
    return (
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            minWidth: { xs: 180, sm: 200 },
            background: theme.palette.background.paper,
            border: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.12 : 0.08)}`
          }
        }}
      >
        <MenuItem
          onClick={onDeleteClick}
          sx={{
            py: { xs: 1, sm: 1.25 },
            fontSize: { xs: '0.875rem', sm: '0.9375rem' },
            color: 'error.main'
          }}
        >
          <DeleteIcon sx={{ mr: 1.5, fontSize: { xs: 18, sm: 20 } }} />
          Delete for me
        </MenuItem>
      </Menu>
    )
  }

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          minWidth: { xs: 180, sm: 200 },
          background: theme.palette.background.paper,
          border: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.12 : 0.08)}`
        }
      }}
    >
      {canShowInfo && (
        <MenuItem
          onClick={onInfoClick}
          sx={{ py: { xs: 1, sm: 1.25 }, fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}
        >
          <InfoIcon sx={{ mr: 1.5, fontSize: { xs: 18, sm: 20 } }} />
          Info
        </MenuItem>
      )}
      <MenuItem
        onClick={onSelectMode}
        sx={{ py: { xs: 1, sm: 1.25 }, fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}
      >
        <CheckboxOutlineBlankIcon sx={{ mr: 1.5, fontSize: { xs: 18, sm: 20 } }} />
        Select
      </MenuItem>
      {canEdit && (
        <MenuItem
          onClick={onEditClick}
          sx={{ py: { xs: 1, sm: 1.25 }, fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}
        >
          <EditIcon sx={{ mr: 1.5, fontSize: { xs: 18, sm: 20 } }} />
          Edit
        </MenuItem>
      )}
      <MenuItem
        onClick={onDeleteClick}
        sx={{
          py: { xs: 1, sm: 1.25 },
          fontSize: { xs: '0.875rem', sm: '0.9375rem' },
          color: 'error.main'
        }}
      >
        <DeleteIcon sx={{ mr: 1.5, fontSize: { xs: 18, sm: 20 } }} />
        Delete
      </MenuItem>
    </Menu>
  )
}

export default MessageMenu

