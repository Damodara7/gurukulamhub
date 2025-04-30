// utils/log.js

/**
 * Logging utility for standardized application logs.
 */
export const log = {
  info: (message) => {
      console.info(new Date().toISOString(), 'INFO:', message);
  },
  error: (message) => {
      console.error(new Date().toISOString(), 'ERROR:', message);
  },
  debug: (message) => {
      console.debug(new Date().toISOString(), 'DEBUG:', message);
  },
  warn: (message) => {
      console.warn(new Date().toISOString(), 'WARN:', message);
  }
};

