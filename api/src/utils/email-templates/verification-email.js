/**
 * Email verification template
 * @param {string} name - User's name
 * @param {string} verificationUrl - Email verification URL
 * @returns {Object} - Email template with HTML and text content
 */
function generateVerificationEmail(name, verificationUrl) {
  return {
    subject: 'Verify your Monitool account',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2>Welcome to Monitool, ${name}!</h2>
        <p>Thank you for creating an account. Please verify your email address by clicking the link below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all;">${verificationUrl}</p>
        <p>This verification link will expire in 24 hours.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          If you didn't create this account, you can safely ignore this email.
        </p>
      </div>
    `,
    text: `
Welcome to Monitool, ${name}!

Thank you for creating an account. Please verify your email address by visiting this link:
${verificationUrl}

This verification link will expire in 24 hours.

If you didn't create this account, you can safely ignore this email.
    `,
  };
}

module.exports = { generateVerificationEmail };
