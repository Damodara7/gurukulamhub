// **Validate Alert Create Request DTO**
export function validateAlertCreateRequestDto(data) {
    const errors = {};

    // // Validate email
    // if (!data.email || typeof data.email !== 'string' || !validateEmail(data.email)) {
    //     errors.email = 'Email is required and must be a valid string.';
    // }

    // Validate alertType
    if (!data.alertType || typeof data.alertType !== 'string') {
        errors.alertType = 'AlertType is required and must be a string.';
    }
    // Validate name
    if (!data.name || typeof data.name !== 'string') {
        errors.alertType = 'Alert name is required and must be a string.';
    }

    // Validate videos (optional and should be an array of ObjectIds)
    if (data.videos && !Array.isArray(data.videos)) {
        errors.videos = 'Videos must be an array of ObjectIds.';
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

// **Validate Alert Update Request DTO**
export function validateAlertUpdateRequestDto(data) {
    const errors = {};

    // // Validate email (optional for updates)
    // if (data.email && typeof data.email !== 'string') {
    //     errors.email = 'Email must be a valid string.';
    // } else if (data.email && !validateEmail(data.email)) {
    //     errors.email = 'Email must be a valid email address.';
    // }

    // Validate alertType (optional for updates)
    if (data.alertType && typeof data.alertType !== 'string') {
        errors.alertType = 'AlertType must be a string.';
    }

    // Validate name (optional for updates)
    if (data.name && typeof data.name !== 'string') {
        errors.alertType = 'Alert name must be a string.';
    }

    // Validate videos (optional for updates, should be an array of ObjectIds)
    if (data.videos && !Array.isArray(data.videos)) {
        errors.videos = 'Videos must be an array of ObjectIds.';
    }

    // Validate updatedBy (required)
    if (!data.updatedBy && (typeof data?.updatedBy !== 'string' || !validateEmail(data.updatedBy))) {
        errors.updatedBy = 'UpdatedBy must be a valid email';
    }

    // If there are any errors, throw an error with the collected messages
    if (Object.keys(errors).length > 0) {
        throw new Error(JSON.stringify(errors));
    }
}

// **Email Validation Function**
function validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}
