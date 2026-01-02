import React from 'react'
import { Box } from '@mui/material'
import ChatList from '@/components/messenger/ChatList'

export default async function MessengerPage() {
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ChatList />
    </Box>
  )
}
