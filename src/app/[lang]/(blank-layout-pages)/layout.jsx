// Component Imports
import Providers from '@components/Providers'
import BlankLayout from '@layouts/BlankLayout'

// Config Imports
import { i18n } from '@configs/i18n'

// Util Imports
import { getSystemMode } from '@core/utils/serverHelpers'
import { auth } from '@/libs/auth'
import { redirect } from 'next/navigation'

// Constants
const HOME_PAGE_URL = '/home'

const Layout = async ({ children, params }) => {
  // Check if user is logged in - if so, redirect from guest routes to home
  const session = await auth()
  
  if (session?.user) {
    // User is logged in - redirect from guest routes to home
    // Check user role for admin redirect
    if (session?.user.role === 'admin' || session?.user.roles?.includes('SUPER_ADMIN')) {
      redirect(`/${params.lang}${HOME_PAGE_URL}`)
    }
    redirect(`/${params.lang}${HOME_PAGE_URL}`)
  }

  // Vars
  const direction = i18n.langDirection[params.lang]
  const systemMode = getSystemMode()

  return (
    <Providers direction={direction}>
      <BlankLayout systemMode={systemMode}>{children}</BlankLayout>
    </Providers>
  )
}

export default Layout
