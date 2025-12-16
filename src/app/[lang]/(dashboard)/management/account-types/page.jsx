// Component Imports
import { Box } from '@mui/material'
import AccountTypes from '@views/apps/account-types'

const AccountTypesApp = async () => {
  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
      <AccountTypes />
    </Box>
  )
}

export default AccountTypesApp

