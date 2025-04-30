// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import TwoFactorAuthenticationCard from './TwoFactorAuthenticationCard'
import CreateApiKey from './CreateApiKey'
import ApiKeyList from './ApiKeyList'
import RecentDevicesTable from './RecentDevicesTable'
import PasswordCard from './PasswordCard'
import { auth } from '../../../../libs/auth'

const Security = async () => {
  const session = await auth()
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
          <PasswordCard session={session} />
      </Grid>
      {/* <Grid item xs={12}>
        <TwoFactorAuthenticationCard />
      </Grid> */}
      {/* <Grid item xs={12}>
        <CreateApiKey />
      </Grid>
      <Grid item xs={12}>
        <ApiKeyList />
      </Grid>
      <Grid item xs={12}>
        <RecentDevicesTable />
      </Grid> */}
    </Grid>
  )
}

export default Security
