/**
 * Generates a random alphanumeric code of specified length
 * @param {number} length - Length of the code (default: 7)
 * @returns {string} - Random code
 */
function generateShortCode(length = 7) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Validates if a short code contains only alphanumeric characters
 * @param {string} code - The code to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function isValidShortCode(code) {
  if (!code || typeof code !== 'string') {
    return false;
  }
  
  // Allow alphanumeric characters, 6-8 characters long
  const codeRegex = /^[A-Za-z0-9]{6,8}$/;
  return codeRegex.test(code);
}

module.exports = {
  generateShortCode,
  isValidShortCode,
};

