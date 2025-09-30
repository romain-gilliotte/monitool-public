const crypto = require('crypto');

/**
 * Generate a Gravatar URL for a given email address
 * @param {string} email - The email address
 * @param {object} options - Options for the Gravatar URL
 * @param {number} options.size - Size of the image (default: 80)
 * @param {string} options.default - Default image type (default: 'mp')
 * @param {string} options.rating - Content rating (default: 'pg')
 * @returns {string} The Gravatar URL
 */
function getGravatarUrl(email, options = {}) {
  if (!email || typeof email !== 'string') {
    return null;
  }

  const {
    size = 80,
    default: defaultImage = 'mp', // mp = mystery person (generic outline of a person)
    rating = 'pg',
  } = options;

  // Create MD5 hash of the email (normalized to lowercase and trimmed)
  const normalizedEmail = email.toLowerCase().trim();
  const hash = crypto.createHash('md5').update(normalizedEmail).digest('hex');

  // Build the Gravatar URL
  const baseUrl = 'https://www.gravatar.com/avatar/';
  const params = new URLSearchParams({
    s: size.toString(),
    d: defaultImage,
    r: rating,
  });

  return `${baseUrl}${hash}?${params.toString()}`;
}

module.exports = {
  getGravatarUrl,
};
