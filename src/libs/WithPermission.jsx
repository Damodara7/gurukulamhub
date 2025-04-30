'use client'
import { useEffect, useState } from 'react'
import * as permissionUtils from '@/utils/permissionUtils'
import AccessDenied from './AccessDenied'
import Loading from '@/components/Loading'

// Permission Wrapper Component
const WithPermission = ({ roles, userRoles, featureName, permissionName, children }) => {
  const [isAuthorized, setIsAuthorized] = useState(null)

  useEffect(() => {
    if (roles && userRoles) {
      const authorized = permissionUtils.hasPermission(roles, userRoles, featureName, permissionName)
      setIsAuthorized(authorized)
    }
  }, [roles, userRoles, featureName, permissionName])

  if (isAuthorized === null) {
    return <Loading />
  }

  return isAuthorized ? <>{children}</> : <AccessDenied />
}

export default WithPermission
