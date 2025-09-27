/**
 * Email templates index file
 * Provides easy access to all email templates
 */

const { generateVerificationEmail } = require('./verification-email');
const { generatePasswordResetEmail } = require('./password-reset-email');

module.exports = {
  generateVerificationEmail,
  generatePasswordResetEmail,
};
