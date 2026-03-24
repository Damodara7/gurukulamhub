'use client'

import React from 'react'
import { Stack, TextField, IconButton, alpha } from '@mui/material'
import { Send as SendIcon } from '@mui/icons-material'

function AIChatInput({
  value,
  onChange,
  onKeyDown,
  onSend,
  disabled,
  canSend,
  isMobile,
  theme,
  isDarkMode,
  inputRef
}) {
  return (
    <Stack direction='row' spacing={1} alignItems='flex-end' sx={{ mx: 'auto' }}>
      <TextField
        inputRef={inputRef}
        autoFocus
        fullWidth
        multiline
        maxRows={4}
        placeholder='Message AI...'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={disabled}
        variant='outlined'
        size={isMobile ? 'small' : 'medium'}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            bgcolor: alpha(theme.palette.background.default, isDarkMode ? 0.5 : 0.6),
            fontSize: { xs: '0.875rem', sm: '0.9375rem' },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: alpha(theme.palette.divider, isDarkMode ? 0.45 : 0.3)
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: alpha(theme.palette.primary.main, isDarkMode ? 0.75 : 0.55)
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.palette.primary.main,
              borderWidth: 2
            },
            '&.Mui-focused': {
              boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, isDarkMode ? 0.2 : 0.12)}`
            }
          }
        }}
      />
      <IconButton
        color='primary'
        component='span'
        onClick={onSend}
        disabled={!canSend || disabled}
        sx={{
          mb: 0.25,
          width: 48,
          height: 48,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          color: 'white',
          '&:hover': {
            background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`
          },
          '&.Mui-disabled': {
            background: alpha(theme.palette.action.disabledBackground, 0.5),
            color: theme.palette.action.disabled
          }
        }}
        aria-label='Send message'
      >
        <SendIcon sx={{ fontSize: 22 }} />
      </IconButton>
    </Stack>
  )
}

export default AIChatInput
