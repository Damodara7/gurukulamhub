import React from 'react'
import { Box, Typography, Button } from '@mui/material'
import { useRouter } from 'next/navigation'
const  NonEditableGamePage = () => {
  
  const router = useRouter()
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        p: 3
      }}
    >
      <Typography variant='h5' color='error' sx={{ mb: 2 }}>
        Cannot Edit This Game
      </Typography>
      <Typography variant='body1' sx={{ mb: 3 }}>
        Only games with "created" status can be edited. This game is either approved , live, completed, or cancelled.
      </Typography>
      <Button variant='contained' onClick={() => router.push(`/apps/games`)}>
        Back to All Games
      </Button>
    </Box>
  )
}

export default NonEditableGamePage