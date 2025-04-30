// feature.validator.js

export function validateFeatureCreateRequestDto(data) {
    const errors = {};

    // Validate name
    if (!data.name || typeof data.name !== 'string') {
        errors.name = 'Name is required and must be a string.';
    }

    // Validate createdBy
    if (!data.createdBy || typeof data.createdBy !== 'string') {
        errors.createdBy = 'CreatedBy is required and must be a string.';
    }

    // Validate permissions
    if (!Array.isArray(data.permissions) || data.permissions.length === 0) {
        errors.permissions = 'Permissions are required and must be a non-empty array of strings.';
    } else {
        data.permissions.forEach((permission, index) => {
            if (typeof permission !== 'string') {
                errors[`permissions[${index}]`] = `Permission at index ${index} must be a string.`;
            }
        });
    }

    // If there are any errors, throw an error with the collected messages
    if (Object.keys(errors).length > 0) {
        throw new Error(JSON.stringify(errors));
    }
}

export function validateFeatureUpdateRequestDto(data) {
    const errors = {};

    // Validate name (optional for updates)
    if (data.name && typeof data.name !== 'string') {
        errors.name = 'Name must be a string.';
    }

    // Validate createdBy (optional for updates, usually not changed)
    if (data.createdBy && typeof data.createdBy !== 'string') {
        errors.createdBy = 'CreatedBy must be a string.';
    }

    // Validate updatedBy (Required for updates)
    if (!data.updatedBy || typeof data.updatedBy !== 'string') {
        throw new Error('updatedBy is required for updates.');
    }

    // Validate permissions (optional for updates)
    if (data.permissions && (!Array.isArray(data.permissions) || data.permissions.length === 0)) {
        errors.permissions = 'Permissions must be a non-empty array of strings if provided.';
    } else if (data.permissions) {
        data.permissions.forEach((permission, index) => {
            if (typeof permission !== 'string') {
                errors[`permissions[${index}]`] = `Permission at index ${index} must be a string.`;
            }
        });
    }

    // If there are any errors, throw an error with the collected messages
    if (Object.keys(errors).length > 0) {
        throw new Error(JSON.stringify(errors));
    }
}
