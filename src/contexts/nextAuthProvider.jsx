'use client'

// Third-party Imports
import { SessionProvider } from 'next-auth/react'

export const NextAuthProvider = ({ children, session, ...rest }) => {
  return (
    <SessionProvider session={session} {...rest}>
      {children}
    </SessionProvider>
  )
}
