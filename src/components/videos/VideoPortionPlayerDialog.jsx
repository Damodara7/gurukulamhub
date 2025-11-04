import React from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography, Box } from '@mui/material'
import VideoPortionPlayer from './VideoPortionPlayer'

function VideoPortionPlayerDialog({ data, open, onClose }) {
  return (
    <Dialog
      fullWidth
      maxWidth='lg'
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: theme => theme.shadows[8]
        }
      }}
    >
      <DialogTitle
        sx={{
          textAlign: 'center',
          pt: { xs: 4, sm: 6 },
          pb: 2,
          px: { xs: 3, sm: 6 }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 1.5 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #c4b5fd 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(139, 92, 246, 0.3)'
            }}
          >
            <i className='ri-play-circle-line' style={{ fontSize: '24px', color: 'white' }} />
          </Box>
          <Typography
            variant='h4'
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #8b5cf6 0%, #c4b5fd 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Video Preview
          </Typography>
        </Box>
        <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
          This is how your video plays on user devices
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ px: { xs: 3, sm: 6 }, py: 3 }}>
        <VideoPortionPlayer data={data} />
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ justifyContent: 'center', px: { xs: 3, sm: 6 }, pb: { xs: 3, sm: 4 } }}>
        <Button
          onClick={onClose}
          variant='contained'
          startIcon={<i className='ri-close-line' />}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            px: 4,
            boxShadow: theme => theme.shadows[2],
            '&:hover': {
              boxShadow: theme => theme.shadows[4]
            }
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default VideoPortionPlayerDialog
