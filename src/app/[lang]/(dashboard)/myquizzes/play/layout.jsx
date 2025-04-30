'use client'

import { FEATURES_LOOKUP } from '@/configs/features-lookup'
import { PERMISSIONS_LOOKUP } from '@/configs/permissions-lookup'
import PermissionLayoutWrapper from '@/components/PermissionLayoutWrapper'

function Layout({ children }) {
  return (
    <PermissionLayoutWrapper featureName={FEATURES_LOOKUP.MY_QUIZZES} permissionName={PERMISSIONS_LOOKUP.PLAY}>
      {children}
    </PermissionLayoutWrapper>
  )
}

export default Layout
