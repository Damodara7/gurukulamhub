'use client'
import { Button, Typography, Box, Paper } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import React from 'react'

const AccessDenied = () => {
  const theme = useTheme()

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        p: 4,
        backgroundColor: theme.palette.background.default,
        textAlign: 'center'
      }}
    >
      <Paper
        elevation={theme.palette.mode === 'dark' ? 8 : 3}
        sx={{
          p: 4,
          maxWidth: '28rem',
          mx: 'auto',
          borderRadius: 2,
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`
        }}
      >
        <Typography variant='h3' color='error' sx={{ mb: 2 }}>
          Access Denied!
        </Typography>
        <Typography
          variant='body1'
          sx={{
            mb: 3,
            color: theme.palette.text.secondary
          }}
        >
          You do not have permission to view this page.
        </Typography>
        <Button
          variant='contained'
          onClick={() => (window.location.href = '/')}
          sx={{
            mt: 1,
            px: 3,
            py: 1.5
          }}
        >
          Go to Home
        </Button>
      </Paper>
    </Box>
  )
}

export default AccessDenied
