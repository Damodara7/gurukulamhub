import React from 'react'
import AlertsTable from './AlertsTable'
import { Box } from '@mui/material'
async function Alerts() {
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
      <AlertsTable />
    </Box>
  )
}

export default Alerts
