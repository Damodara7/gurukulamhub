// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'

// Config Imports
import { i18n } from '@configs/i18n'

// Style Imports
import '@/app/globals.css'

// Generated Icon CSS Imports
//import '@assets/iconify-icons/generated-icons.css'
import 'remixicon/fonts/remixicon.css'

// Note: animate.css is imported in client components where it's needed
// to avoid server-side CSS parsing issues

import { scheduleCleanupUnverifiedUsers } from '@/actions/scheduler'
import { initializeScheduler } from '@/app/api/game/game.scheduler'
import { initializeProfileScheduler } from '@/app/api/profile/profile.scheduler'

// Execute only on server
if (typeof window === 'undefined') {
  scheduleCleanupUnverifiedUsers()
  initializeScheduler()
  initializeProfileScheduler()
  
  // Initialize SUPER_ADMIN on server startup (runs only once per server instance)
  // This is moved here from instrumentation.ts to avoid Edge runtime eval() issues
  if (process.env.SUPER_ADMIN_EMAIL || process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL) {
    // Use a module-level flag to ensure this only runs once
    if (!global.__superAdminInitialized) {
      global.__superAdminInitialized = true
      // Dynamic import to avoid loading during build
      import('@/scripts/seedSuperAdmin')
        .then(({ initializeSuperAdmin }) => {
          return initializeSuperAdmin()
        })
        .then(() => {
          console.log('✅ SUPER_ADMIN initialization completed on server startup')
        })
        .catch((error) => {
          if (!error.message?.includes('Cannot find module') && !error.message?.includes('Cannot resolve')) {
            console.error('⚠️  SUPER_ADMIN initialization failed on startup (non-critical):', error.message)
          }
        })
    }
  }
}

export const metadata = {
  title: 'GurukulamHub - Indian Knowledge Systems',
  description: 'GurukulamHub - Indian Knowledge Systems',
  manifest: '/api/manifest', // Use dynamic manifest API route that checks authentication
  themeColor: '#000000',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'GurukulamHub'
  },
  formatDetection: {
    telephone: false
  },
  openGraph: {
    type: 'website',
    siteName: 'GurukulamHub',
    title: 'GurukulamHub - Indian Knowledge Systems',
    description: 'GurukulamHub - Indian Knowledge Systems'
  }
}

const RootLayout = ({ children, params }) => {
  // Vars
  const direction = i18n.langDirection[params.lang]

  return (
    <html id='__next' lang={params.lang} dir={direction}>
      <body className='flex is-full min-bs-full flex-auto flex-col full-viewport'>{children}</body>
    </html>
  )
}

export default RootLayout
