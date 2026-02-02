'use client'

import React from 'react'
import { Box, Button, Card, CardContent, Typography } from '@mui/material'
import { useRouter } from 'next/navigation'

const AdminNotificationFallBackCard = ({ error = null, path = '/management/Admin-Notification', content = null, btnText = 'Back to Admin Notifications' }) => {
  const router = useRouter()
  return (
    <Box display='flex' flexDirection='column' alignItems='center' px={2} py={4} gap={4}>
      <Card sx={{ maxWidth: 600, p: 3, textAlign: 'center' }}>
        <CardContent>
          <Typography variant='h4' gutterBottom>
            {error ? '⚠️ Error Occurred' : '📬 No Admin Notifications'}
          </Typography>
          {error ? (
            <Typography color='error' variant='body1' sx={{ mt: 2 }}>
              {error}
            </Typography>
          ) : (
            <Typography variant='body1' sx={{ mt: 2 }}>
              {content || 'No admin notifications yet. Create one to get started.'}
            </Typography>
          )}
          <Box display='flex' gap={2} flexWrap='wrap' mt={4} justifyContent='center'>
            <Button component='label' variant='outlined' onClick={() => router.push(path)}>
              {btnText}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default AdminNotificationFallBackCard
