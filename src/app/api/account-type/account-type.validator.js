// account-type.validator.js

export function validateAccountTypeCreateRequestDto(data) {
    const errors = {};

    // Validate name
    if (!data.name || typeof data.name !== 'string') {
        errors.name = 'Name is required and must be a string.';
    }

    // Validate createdBy
    if (!data.createdBy || typeof data.createdBy !== 'string') {
        errors.createdBy = 'CreatedBy is required and must be a string.';
    }

    // Validate creatorEmail
    if (!data.creatorEmail || typeof data.creatorEmail !== 'string') {
        errors.creatorEmail = 'Creator Email is required and must be a string.';
    }

    // If there are any errors, throw an error with the collected messages
    if (Object.keys(errors).length > 0) {
        throw new Error(JSON.stringify(errors));
    }
}

export function validateAccountTypeUpdateRequestDto(data) {
    const errors = {};

    // Validate name (optional for updates)
    if (data.name && typeof data.name !== 'string') {
        errors.name = 'Name must be a string.';
    }

    // Validate updatedBy (Required for updates)
    if (!data.updatedBy || typeof data.updatedBy !== 'string') {
        throw new Error('updatedBy is required for updates.');
    }

    // Validate updaterEmail (Required for updates)
    if (!data.updaterEmail || typeof data.updaterEmail !== 'string') {
        throw new Error('updaterEmail is required for updates.');
    }

    // If there are any errors, throw an error with the collected messages
    if (Object.keys(errors).length > 0) {
        throw new Error(JSON.stringify(errors));
    }
}

