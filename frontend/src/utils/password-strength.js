/**
 * Calculate password strength
 * @param {string} password - The password to analyze
 * @returns {object} - Object with level, text, and score
 */
export function calculatePasswordStrength(password) {
  if (!password) {
    return null;
  }

  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  let result;
  if (strength <= 2) result = { level: 'weak', text: 'Weak', score: strength };
  else if (strength <= 3) result = { level: 'medium', text: 'Medium', score: strength };
  else result = { level: 'strong', text: 'Strong', score: strength };

  return result;
}

/**
 * Get password strength with caching to prevent infinite digest loops
 * @param {string} password - The password to analyze
 * @param {object} cache - Cache object with _lastPassword and _cachedPasswordStrength
 * @returns {object} - Object with level, text, and score
 */
export function getPasswordStrength(password, cache = {}) {
  if (!password) {
    cache._cachedPasswordStrength = null;
    return null;
  }

  // Cache the result to prevent infinite digest loops
  if (cache._lastPassword === password && cache._cachedPasswordStrength) {
    return cache._cachedPasswordStrength;
  }

  const result = calculatePasswordStrength(password);

  // Cache the result
  cache._lastPassword = password;
  cache._cachedPasswordStrength = result;

  return result;
}
