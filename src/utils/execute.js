/**
 * Executes a promise and returns an object with either an error or a response.
 * 
 * @param {Promise} promise The promise to execute
 * @returns {Promise<{err: Error | null, response: any | null}>} A promise that resolves with either an error or the result of the promise
 */
export async function execute(promise) {
  try {
    const response = await promise;
    return { err: null, response };
  } catch (err) {
    return { err, response: null };
  }
}

