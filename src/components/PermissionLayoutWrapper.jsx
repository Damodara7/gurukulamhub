'use client'

import WithPermission from '@/libs/WithPermission'
import Loading from '@/components/Loading'
import { useSession } from 'next-auth/react'
import useRoles from '@/hooks/useRoles'

function PermissionLayoutWrapper({ children, featureName, permissionName }) {
  const { data: session, status } = useSession()
  const { roles, loading } = useRoles()

  const userRoles = session?.user?.roles || []

  if (loading) {
    return <Loading />
  }

  return (
    <WithPermission roles={roles} userRoles={userRoles} featureName={featureName} permissionName={permissionName}>
      {children}
    </WithPermission>
  )
}

export default PermissionLayoutWrapper
