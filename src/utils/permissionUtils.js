export function hasPermission(roles, userRoles, featureName, permissionName) {
    if(!userRoles || userRoles.length === 0) {
        return null
    }
    return roles?.some(
        role =>
            userRoles.includes(role.name) &&
            role.features.some(feature => feature.name === featureName && feature.permissions.includes(permissionName))
    )
}
