/**
 * Custom error throwing utility to standardize error creation with status codes.
 * 
 * @param {number} statusCode HTTP status code associated with the error.
 * @param {string} message Error message for the error.
 */
export function throwError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
}
