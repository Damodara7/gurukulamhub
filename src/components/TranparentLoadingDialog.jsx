import React from 'react'
import { Dialog, CircularProgress, Box } from '@mui/material'

const LoadingDialog = ({ open }) => {
  return (
    <Dialog
      open={open}
      PaperProps={{
        style: {
          backgroundColor: 'transparent', // Transparent background for dialog
          boxShadow: 'none',
          overflow: 'hidden'
        }
      }}
      sx={{
        // backdropFilter: 'blur(2px)', // Adds blur effect to the background
        backgroundColor: 'rgba(255, 255, 255, 0.2)', // Whitish mask
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh' // Fullscreen loading dialog
        }}
      >
        <CircularProgress size={60} color="primary" />
      </Box>
    </Dialog>
  )
}

export default LoadingDialog
