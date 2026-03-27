const nodemailer = require('nodemailer');
const ClientSES = require('@aws-sdk/client-ses');
const logger = require('./logger');
const config = require('../config');
const { generateVerificationEmail, generatePasswordResetEmail } = require('./email-templates');

class EmailService {
  constructor() {
    this.sesClient = new ClientSES.SESClient({
      region: config.aws.region || 'us-east-1',
      credentials: {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
      },
    });

    this.transporter = nodemailer.createTransport({
      SES: { ses: this.sesClient, aws: ClientSES },
    });

    this.fromEmail = config.email.from || 'noreply@monitool.org';
    this.appUrl = config.appUrl;
  }

  async sendVerificationEmail(email, name, token) {
    const verificationUrl = `${this.appUrl}/app.html#!/verify-email?token=${token}`;
    const template = generateVerificationEmail(name, verificationUrl);

    const mailOptions = {
      from: this.fromEmail,
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`Verification email sent to ${email}`);
    } catch (error) {
      logger.error('Error sending verification email:', error);
      throw error;
    }
  }

  async sendPasswordResetEmail(email, name, token) {
    const resetUrl = `${this.appUrl}/app.html#!/reset-password?token=${token}`;
    const template = generatePasswordResetEmail(name, resetUrl);

    const mailOptions = {
      from: this.fromEmail,
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`Password reset email sent to ${email}`);
    } catch (error) {
      logger.error('Error sending password reset email:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();
