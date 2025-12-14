'use client'
import React from 'react'
import { Paper, Typography, Stack, IconButton, Tooltip, useTheme, alpha, useMediaQuery } from '@mui/material'
import { Delete as DeleteIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material'

const SelectionActionBar = ({
  selectedCount,
  onDelete,
  onCancel
}) => {
  const theme = useTheme()
  const isDarkMode = theme.palette.mode === 'dark'
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        p: { xs: 1.5, sm: 2 },
        borderTop: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.12 : 0.08)}`,
        background: isDarkMode
          ? alpha(theme.palette.background.paper, 0.95)
          : alpha(theme.palette.background.paper, 0.9),
        backdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2
      }}
    >
      <Typography variant='body2' sx={{ fontWeight: 600 }}>
        {selectedCount > 0 ? `${selectedCount} selected` : 'Select messages'}
      </Typography>
      <Stack direction='row' spacing={1}>
        {selectedCount > 0 && (
          <Tooltip title='Delete' arrow>
            <IconButton
              onClick={onDelete}
              color='error'
              size={isMobile ? 'small' : 'medium'}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title='Exit selection mode (ESC)' arrow>
          <IconButton
            onClick={onCancel}
            size={isMobile ? 'small' : 'medium'}
          >
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
      </Stack>
    </Paper>
  )
}

export default SelectionActionBar

