'use client'

import WithPermission from '@/libs/WithPermission'
import { FEATURES_LOOKUP } from '@/configs/features-lookup'
import { PERMISSIONS_LOOKUP } from '@/configs/permissions-lookup'
import * as clientApi from '@/app/api/client/client.api'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Loading from '@/components/Loading'

function Layout({ children }) {
  // const [roles, setRoles] = useState(['USER'])
  // const [loading, setLoading] = useState(false)
  // const { data: session, status } = useSession()

  // const userRoles = session?.user?.roles || ['USER']

  // // Flag to avoid redundant fetching
  // const [hasFetchedRoles, setHasFetchedRoles] = useState(false)

  // const getRolesData = async () => {
  //   if (hasFetchedRoles) return // Skip fetch if roles are already loaded

  //   setLoading(true)
  //   try {
  //     const result = await clientApi.getAllRoles()
  //     if (result?.status === 'success') {
  //       setRoles(result.result || [])
  //       setHasFetchedRoles(true) // Mark roles as fetched
  //     } else {
  //       console.error('Error fetching roles:', result?.message)
  //     }
  //   } catch (error) {
  //     console.error('Error fetching roles:', error)
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  // useEffect(() => {
  //   // Fetch roles only when session is ready and roles are not fetched
  //   if (status === 'authenticated' && !hasFetchedRoles) {
  //     getRolesData()
  //   }
  // }, [status, hasFetchedRoles])

  // if (loading || status === 'loading') {
  //   return <Loading />
  // }
  return <>{children}</>

  return (
    <WithPermission
      roles={roles}
      userRoles={userRoles}
      featureName={FEATURES_LOOKUP.ROLES_PERMISSIONS}
      permissionName={PERMISSIONS_LOOKUP.VIEW}
    >
      {children}
    </WithPermission>
  )
}

export default Layout
