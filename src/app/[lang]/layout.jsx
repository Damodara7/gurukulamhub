// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'

// Config Imports
import { i18n } from '@configs/i18n'

// Style Imports
import '@/app/globals.css'

import 'animate.css'

// Generated Icon CSS Imports
//import '@assets/iconify-icons/generated-icons.css'
import 'remixicon/fonts/remixicon.css'

import { scheduleCleanupUnverifiedUsers } from '@/actions/scheduler'

// Execute only on server
if (typeof window === 'undefined') {
  scheduleCleanupUnverifiedUsers()
}

export const metadata = {
  title: 'GurukulamHub - Indian Knowledge Systems',
  description: '  - Indian Knowledge Systems.'
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
