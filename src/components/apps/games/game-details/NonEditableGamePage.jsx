import React from 'react'
import { Box, Typography, Button , Card , CardContent } from '@mui/material'
import { useRouter } from 'next/navigation'

const statusMessages = {
  approved: 'This game has already been approved and cannot be edited.',
  lobby: 'This game is now in the lobby. Editing is disabled.',
  live: 'The game is currently live. Editing is not allowed.',
  completed: 'This game has been completed and cannot be modified.'
}
const  NonEditableGamePage = ( {gameData}) => {
  const router = useRouter()

  return (
    <Box display='flex' justifyContent='center' alignItems='center' height='100%' bgcolor='#f5f5f5' px={2}>
      <Card sx={{ maxWidth: 500, p: 3, textAlign: 'center' }}>
        <CardContent>
          <Typography variant='h5' color='error' gutterBottom>
            Cannot Edit This Game
          </Typography>
          <Typography variant='body1' sx={{ mt: 2 }}>
            <strong>Status : </strong>
            <Box component='span' sx={{ color: 'primary.main', fontWeight: 500 }}>
              {gameData.status}
            </Box>
          </Typography>
          <Typography variant='body2' sx={{ mt: 1, mb: 3 }}>
            {statusMessages[gameData.status] || 'Editing is restricted due to the current game status.'}
          </Typography>
          <Button variant='contained' onClick={() => router.push(`/apps/games`)} sx={{ mt: 2 }}>
            Back to All Games
          </Button>
        </CardContent>
      </Card>
    </Box>
  )
}

export default NonEditableGamePage