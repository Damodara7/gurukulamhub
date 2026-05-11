import { ROLES_LOOKUP } from '@/configs/roles-lookup'
import { FEATURES_LOOKUP } from '@/configs/features-lookup'

export function hasPermission(roles, userRoles, featureName, permissionName) {
    if(!userRoles || userRoles.length === 0) {
        return null
    }
    
    // SUPER_ADMIN has all permissions for all features
    if (userRoles.includes(ROLES_LOOKUP.SUPER_ADMIN)) {
        return true
    }
    
    // ADMIN and SUPER_ADMIN: allow VIEW, CREATE, and UPDATE for ADMIN_NOTIFICATION even if not in role features (avoids "Access Denied" until role is configured in DB)
    if (featureName === FEATURES_LOOKUP.ADMIN_NOTIFICATION && userRoles.includes(ROLES_LOOKUP.ADMIN)) {
        if (permissionName === 'VIEW' || permissionName === 'CREATE' || permissionName === 'UPDATE') {
            return true
        }
    }
    
    return roles?.some(
        role =>
            userRoles.includes(role.name) &&
            role.isActive !== false &&
            role.features?.some(feature => feature.name === featureName && feature.permissions?.includes(permissionName))
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

/**
 * Check if a specific role is active by looking it up in the fetched roles list.
 * Returns false if the role is not found (means it doesn't exist or is deleted).
 * Returns true only if roles haven't been loaded yet (graceful fallback).
 */
export function isRoleActive(roles, roleName) {
    if (!roles || !Array.isArray(roles) || roles.length === 0) return true
    const roleObj = roles.find(r => r.name === roleName)
    if (!roleObj) return false
    return roleObj.isActive !== false
}

/**
 * Check if user has an active admin-level role.
 * The user must both HAVE the role AND the role must be active.
 */
export function hasActiveAdminRole(roles, userRoles) {
    if (!userRoles || userRoles.length === 0) return false
    if (userRoles.includes(ROLES_LOOKUP.SUPER_ADMIN) && isRoleActive(roles, ROLES_LOOKUP.SUPER_ADMIN)) return true
    if (userRoles.includes(ROLES_LOOKUP.ADMIN) && isRoleActive(roles, ROLES_LOOKUP.ADMIN)) return true
    return false
}

/**
 * Check if user has an active specific role.
 */
export function hasActiveRole(roles, userRoles, roleName) {
    if (!userRoles || userRoles.length === 0) return false
    return userRoles.includes(roleName) && isRoleActive(roles, roleName)
}
