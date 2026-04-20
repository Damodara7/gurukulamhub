'use client'

import React from 'react'
import EditAdminNotificationPage from '@/views/apps/admin-notification/edit-admin-notification'
import { Box } from '@mui/material'

function Page({ params }) {
  const { id } = params || {}

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <EditAdminNotificationPage adminNotificationId={id} />
      </Box>
    </Box>
  )
}

export default Page
