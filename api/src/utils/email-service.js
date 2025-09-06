const nodemailer = require('nodemailer');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const config = require('../config');

class EmailService {
  constructor() {
    this.sesClient = new SESClient({
      region: config.aws.region || 'us-east-1',
      credentials: {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
      },
    });

    this.transporter = nodemailer.createTransport({
      SES: { ses: this.sesClient, aws: require('@aws-sdk/client-ses') },
    });

    this.fromEmail = config.email.from || 'noreply@monitool.org';
    this.appUrl = config.appUrl;
  }

  async sendVerificationEmail(email, name, token) {
    const verificationUrl = `${this.appUrl}/app.html#!/verify-email?token=${token}`;

    const mailOptions = {
      from: this.fromEmail,
      to: email,
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

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Verification email sent to ${email}`);
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw error;
    }
  }

  async sendPasswordResetEmail(email, name, token) {
    const resetUrl = `${this.appUrl}/app.html#!/reset-password?token=${token}`;

    const mailOptions = {
      from: this.fromEmail,
      to: email,
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

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Password reset email sent to ${email}`);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();
