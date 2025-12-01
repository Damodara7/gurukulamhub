import { ROLES_LOOKUP } from '@/configs/roles-lookup'

export function hasPermission(roles, userRoles, featureName, permissionName) {
    if(!userRoles || userRoles.length === 0) {
        return null
    }
    
    // SUPER_ADMIN has all permissions for all features
    if (userRoles.includes(ROLES_LOOKUP.SUPER_ADMIN)) {
        return true
    }
    
    return roles?.some(
        role =>
            userRoles.includes(role.name) &&
            role.features.some(feature => feature.name === featureName && feature.permissions.includes(permissionName))
    )
}

/**
 * Check if user is SUPER_ADMIN
 */
export function isSuperAdmin(userRoles) {
    return userRoles?.includes(ROLES_LOOKUP.SUPER_ADMIN) || false
}

/**
 * Check if user is ADMIN or SUPER_ADMIN
 */
export function isAdminOrSuperAdmin(userRoles) {
    return userRoles?.includes(ROLES_LOOKUP.ADMIN) || userRoles?.includes(ROLES_LOOKUP.SUPER_ADMIN) || false
}
