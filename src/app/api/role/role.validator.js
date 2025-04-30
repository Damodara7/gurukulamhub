// role.validator.js

export function validateRoleCreateRequestDto(data) {
    const errors = {};

    // Validate name
    if (!data.name || typeof data.name !== 'string') {
        errors.name = 'Name is required and must be a string.';
    }

    // Validate createdBy
    if (!data.createdBy || typeof data.createdBy !== 'string') {
        errors.createdBy = 'CreatedBy is required and must be a string.';
    }

    // Validate features
    if (!Array.isArray(data.features) || data.features.length === 0) {
        errors.features = 'Features are required and must be a non-empty array of objects.';
    } else {
        data.features.forEach((feature, index) => {
            if (typeof feature !== 'object') {
                errors[`features[${index}]`] = `Feature at index ${index} must be an object.`;
            }
        });
    }

    // If there are any errors, throw an error with the collected messages
    if (Object.keys(errors).length > 0) {
        throw new Error(JSON.stringify(errors));
    }
}

export function validateRoleUpdateRequestDto(data) {
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

    // Validate features (optional for updates)
    if (data.features && (!Array.isArray(data.features) || data.features.length === 0)) {
        errors.features = 'Features must be a non-empty array of objects if provided.';
    } else if (data.features) {
        data.features.forEach((feature, index) => {
            if (typeof feature !== 'object') {
                errors[`features[${index}]`] = `Feature at index ${index} must be an object.`;
            }
        });
    }

    // If there are any errors, throw an error with the collected messages
    if (Object.keys(errors).length > 0) {
        throw new Error(JSON.stringify(errors));
    }
}
