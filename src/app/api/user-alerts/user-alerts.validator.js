// **Validate User Alert Create Request DTO**
export function validateUserAlertCreateRequestDto(data) {
    const errors = {};

    // Validate email
    if (!data.email || typeof data.email !== 'string' || !validateEmail(data.email)) {
        errors.email = 'Email is required and must be a valid string.';
    }

    // Validate alerts (optional and should be an array of ObjectIds)
    if (data.alerts && !Array.isArray(data.alerts)) {
        errors.alerts = 'Alerts must be an array of ObjectIds.';
    }

    // If there are any errors, throw an error with the collected messages
    if (Object.keys(errors).length > 0) {
        throw new Error(JSON.stringify(errors));
    }
}

// **Validate User Alert Update Request DTO**
export function validateUserAlertUpdateRequestDto(data) {
    const errors = {};

    // Validate email (optional for updates)
    if (data.email && typeof data.email !== 'string') {
        errors.email = 'Email must be a valid string.';
    } else if (data.email && !validateEmail(data.email)) {
        errors.email = 'Email must be a valid email address.';
    }

    // Validate alerts (optional for updates, should be an array of ObjectIds)
    if (data.alerts && !Array.isArray(data.alerts)) {
        errors.alerts = 'Alerts must be an array of ObjectIds.';
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
