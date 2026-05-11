'use client'
import { useEffect, useState } from 'react'
import * as permissionUtils from '@/utils/permissionUtils'
import { useActiveRole } from '@/contexts/ActiveRoleContext'
import AccessDenied from './AccessDenied'
import Loading from '@/components/Loading'

const WithPermission = ({ roles, userRoles, featureName, permissionName, children }) => {
  const [isAuthorized, setIsAuthorized] = useState(null)
  const { getEffectiveRoles } = useActiveRole()

  const effectiveRoles = getEffectiveRoles(userRoles)

  useEffect(() => {
    if (roles && effectiveRoles) {
      const authorized = permissionUtils.hasPermission(roles, effectiveRoles, featureName, permissionName)
      setIsAuthorized(authorized)
    }
  }, [roles, effectiveRoles, featureName, permissionName])

  if (isAuthorized === null) {
    return <Loading />
  }

  return isAuthorized ? <>{children}</> : <AccessDenied />
}

export default WithPermission
