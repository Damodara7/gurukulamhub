// 'use client'

// import { useSession } from 'next-auth/react'
// import { auth } from '@/libs/auth'

const RBACMenuWrapper = async ({ roles, children, session }) => {
  //   const { data: session } = useSession()
  //   const session = await auth()

  // Check if the user has at least one of the required roles
  const hasRequiredRole = roles.some(role => session?.user?.roles.includes(role))

  // Render children if the required role(s) are present, else render null
  return hasRequiredRole ? children : null
}

export default RBACMenuWrapper
