const nodemailer = require('nodemailer');

/**
 * Email Configuration
 * Using Gmail SMTP for email notifications
 */

// Create transporter with Gmail SMTP settings
const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;

  if (!emailUser || !emailPassword) {
    console.warn('⚠️  Email credentials not configured. Email notifications will be disabled.');
    console.warn('   Set EMAIL_USER and EMAIL_PASSWORD in .env file to enable email notifications.');
    return null;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPassword
      }
    });

    console.log('✅ Email transporter configured successfully');
    return transporter;
  } catch (error) {
    console.error('❌ Failed to create email transporter:', error.message);
    return null;
  }
};

// Initialize transporter
const transporter = createTransporter();

/**
 * Send email function with error handling
 */
const sendEmail = async (mailOptions) => {
  if (!transporter) {
    console.log('📧 Email notification skipped (email not configured)');
    return { success: false, message: 'Email service not configured' };
  }

  try {
    // Add default sender if not specified
    if (!mailOptions.from) {
      mailOptions.from = process.env.EMAIL_FROM || process.env.EMAIL_USER;
    }

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Verify email configuration
 */
const verifyEmailConfig = async () => {
  if (!transporter) {
    return { success: false, message: 'Email service not configured' };
  }

  try {
    await transporter.verify();
    console.log('✅ Email server is ready to send messages');
    return { success: true, message: 'Email configuration verified' };
  } catch (error) {
    console.error('❌ Email configuration verification failed:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmail,
  verifyEmailConfig,
  isConfigured: () => transporter !== null
};
