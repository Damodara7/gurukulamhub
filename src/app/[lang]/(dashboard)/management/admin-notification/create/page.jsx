import React from 'react'
import CreateAdminNotificationPage from '@/views/apps/admin-notification/create-admin-notification'
import { Box } from '@mui/material'

function page({ params, searchParams }) {
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <CreateAdminNotificationPage />
      </Box>
    </Box>
  )
}

export default page
