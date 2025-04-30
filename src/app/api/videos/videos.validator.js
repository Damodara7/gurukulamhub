// **Validate Email Function**
function validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}

// **Validate Video Create Request DTO**
export function validateVideoCreateRequestDto(data) {
    const errors = {};

    // Validate name
    if (!data.name || typeof data.name !== 'string') {
        errors.name = 'Name is required and must be a string.';
    }

    // Validate description
    if (!data.description || typeof data.description !== 'string') {
        errors.description = 'Description is required and must be a string.';
    }

    // Validate URL
    if (!data.url || typeof data.url !== 'string') {
        errors.url = 'URL is required and must be a string.';
    }

    // Validate contextIds
    if (!Array.isArray(data.contextIds) || data.contextIds.some(id => typeof id !== 'string')) {
        errors.contextIds = 'ContextIds is required and must be an array of strings.';
    }

    // Validate genericContextIds
    if (!Array.isArray(data.genericContextIds) || data.genericContextIds.some(id => typeof id !== 'string')) {
        errors.genericContextIds = 'GenericContextIds is required and must be an array of strings.';
    }

    // Validate academicContextIds (optional)
    if (data.academicContextIds && !Array.isArray(data.academicContextIds)) {
        errors.academicContextIds = 'AcademicContextIds must be an array of strings if provided.';
    }

    // Validate createdBy
    if (!data.createdBy || typeof data.createdBy !== 'string' || !validateEmail(data.createdBy)) {
        errors.createdBy = 'CreatedBy is required and must be a valid email.';
    }

    // If there are any errors, throw an error with the collected messages
    if (Object.keys(errors).length > 0) {
        throw new Error(JSON.stringify(errors));
    }
}

// **Validate Video Update Request DTO**
export function validateVideoUpdateRequestDto(data) {
    const errors = {};

    // Validate name (optional)
    if (data.name && typeof data.name !== 'string') {
        errors.name = 'Name must be a string if provided.';
    }

    // Validate description (optional)
    if (data.description && typeof data.description !== 'string') {
        errors.description = 'Description must be a string if provided.';
    }

    // Validate URL (optional)
    if (data.url && typeof data.url !== 'string') {
        errors.url = 'URL must be a string if provided.';
    }

    // Validate contextIds (optional)
    if (data.contextIds && (!Array.isArray(data.contextIds) || data.contextIds.some(id => typeof id !== 'string'))) {
        errors.contextIds = 'ContextIds must be an array of strings if provided.';
    }

    // Validate genericContextIds (optional)
    if (data.genericContextIds && (!Array.isArray(data.genericContextIds) || data.genericContextIds.some(id => typeof id !== 'string'))) {
        errors.genericContextIds = 'GenericContextIds must be an array of strings if provided.';
    }

    // Validate academicContextIds (optional)
    if (data.academicContextIds && !Array.isArray(data.academicContextIds)) {
        errors.academicContextIds = 'AcademicContextIds must be an array of strings if provided.';
    }

    // Validate updatedBy (required)
    if (!data.updatedBy && (typeof data.updatedBy !== 'string' || !validateEmail(data.updatedBy))) {
        errors.updatedBy = 'UpdatedBy must be a valid email.';
    }

    // If there are any errors, throw an error with the collected messages
    if (Object.keys(errors).length > 0) {
        throw new Error(JSON.stringify(errors));
    }
}
