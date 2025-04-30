// Error codes
export const ERROR_USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS';
export const ERROR_USER_ALREADY_EXISTS_UNVERIFIED = 'USER_ALREADY_EXISTS_UNVERIFIED';
export const ERROR_UNKNOWN = 'UNKNOWN_ERROR';
// Add more error codes as needed


//Action Codes
export const ACTION_SHOW_LOGIN_FORM = 'LOGIN_FORM';
export const ACTION_SHOW_ALERT = 'SHOW_ALERT';
export const ACTION_SHOW_TOAST = 'SHOW_TOAST';
export const ACTION_CONFIRM_TO_NAVIGATE_TO_PAGE = 'CONFIRM_TO_NAVIGATE_TO_PAGE';


// Translation function
export const translateError = (errorCode, language) => {
  // Implement translation logic based on language
  switch (errorCode) {
      case ERROR_USER_ALREADY_EXISTS:
          return language === 'en' ? 'User with this email already exists' : 'Utilisateur avec cet e-mail existe déjà';
      case ERROR_UNKNOWN:
      default:
          return language === 'en' ? 'An unknown error occurred' : 'Une erreur inconnue est survenue';
  }
};
