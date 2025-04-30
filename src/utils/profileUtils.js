export const calculateProfileCompletion = profile => {
    const allFields = [
        'email',
        'firstname',
        'lastname',
        'gender',
        'age',
        'activeAssociatedOrganizationIds',
        'currentWorkingPositionId',
        'linkedInUrl',
        'facebookUrl',
        'instagramUrl',
        'phone',
        'knownLanguageIds',
        'motherTongue',
        'religion',
        'caste',
        'category',
        'country',
        'region',
        'zipcode',
        'locality',
        'timezone',
        'street',
        'colony',
        'village',
        'accountType',
        // Conditional fields for accountType === 'INDIVIDUAL'
        ...(profile?.accountType === 'INDIVIDUAL' ? ['nickname', 'openToWork', 'currentSchoolId'] : []),
        // Conditional fields for accountType === 'BUSINESS' or 'NGO'
        ...(profile?.accountType === 'BUSINESS' || profile?.accountType === 'NGO'
            ? [
                'organization',
                'websiteUrl',
                'roleInOrganization',
                'organizationRegistrationNumber',
                'organizationGSTNumber',
                'organizationPANNumber',
                'hiring'
            ]
            : [])
    ]

    const totalFields = allFields.length

    // Count how many fields are filled (not null, undefined, or empty strings)
    const filledFields = allFields.filter(
        field => profile?.[field] !== null && profile?.[field] !== undefined && profile?.[field] !== ''
    ).length

    // Calculate percentage
    const completionPercentage = Math.round((filledFields / totalFields) * 100)

    return completionPercentage
}
