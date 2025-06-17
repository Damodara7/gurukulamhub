// Component Imports
import Login from '@views/Login'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

export const metadata = {
  title: 'Login',
  description: 'Login to your account'
}

const LoginPage = ({ searchParams }) => {
  // Vars
  const mode = getServerMode()

  return <Login gamePin={searchParams.gamePin} intialSearchParams={searchParams} mode={mode} />
}

export default LoginPage
