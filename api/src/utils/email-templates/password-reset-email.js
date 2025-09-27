/**
 * Password reset template
 * @param {string} name - User's name
 * @param {string} resetUrl - Password reset URL
 * @returns {Object} - Email template with HTML and text content
 */
function generatePasswordResetEmail(name, resetUrl) {
  return {
    subject: 'Reset your Monitool password',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2>Password Reset Request</h2>
        <p>Hello ${name},</p>
        <p>We received a request to reset your password for your Monitool account. Click the link below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all;">${resetUrl}</p>
        <p>This reset link will expire in 1 hour.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.
        </p>
      </div>
    `,
    text: `
Password Reset Request

Hello ${name},

We received a request to reset your password for your Monitool account. Visit this link to reset your password:
${resetUrl}

This reset link will expire in 1 hour.

If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.
    `,
  };
}

module.exports = { generatePasswordResetEmail };
