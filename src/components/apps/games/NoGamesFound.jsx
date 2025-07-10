'use client'
import React from 'react'
import { Box, Button, Card, CardContent, Typography } from '@mui/material'
import { useRouter } from 'next/navigation'


function NoGamesFound({isSuperUser = false}) {
  const router = useRouter()
  return (
    <Box display='flex' flexDirection='column' alignItems='center' bgcolor='#f5f5f5' px={2} py={4} gap={4}>
      <Card sx={{ maxWidth: 500, p: 3, textAlign: 'center' }}>
        <CardContent>
          <Typography variant='h5' gutterBottom>
            🎮 Game is Not Available
          </Typography>

          <Typography variant='body1' sx={{ mt: 2 }}>
            You can go back to the all games
          </Typography>
          <Typography variant='h6' color='primary' sx={{ mt: 1 }}></Typography>

          <Box display='flex' gap={6} flexWrap='wrap' mt={2} alignItems='center' justifyContent='center'>
            <Button
              component='label'
              size='small'
              variant='contained'
              onClick={() => router.push( isSuperUser ? '/manage-games' :'/apps/games')}
              sx={{ color: 'white' }}
            >
              Back To All Games
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default NoGamesFound