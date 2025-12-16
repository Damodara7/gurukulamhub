import React from 'react'
// import { getAlertUsersByAlertId } from '@/actions/userAlerts'
import AlertUsersTable from '@/views/apps/alerts/AlertUsersTable'
import { Box } from '@mui/material'

async function page({ params }) {
  const { id } = params

  // const alertUsers = await getAlertUsersByAlertId({ alertId: id })

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
      <AlertUsersTable alertId={id} />
    </Box>
  )
}

export default page
