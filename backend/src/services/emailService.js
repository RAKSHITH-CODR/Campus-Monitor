/**
 * Email Service
 * Handles sending emails for alerts and notifications
 * Can be configured with SMTP or use console logging for development
 */

const nodemailer = require('nodemailer');
const env = require('../config/env');

let transporter = null;

// Initialize email transporter
const initializeMailer = () => {
  if (transporter) return transporter;

  // Use Gmail, SendGrid, or other providers
  // For development, use console logging
  if (env.emailProvider === 'test' || !env.smtpHost) {
    console.log('[EMAIL] Using test transporter (console logging)');
    transporter = {
      sendMail: async (options) => {
        console.log('[EMAIL] Would send:', options);
        return { messageId: 'test-' + Date.now() };
      },
    };
  } else {
    transporter = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort || 587,
      secure: env.smtpSecure || false,
      auth: {
        user: env.smtpUser,
        pass: env.smtpPass,
      },
    });
  }

  return transporter;
};

// Send alert email
const sendAlertEmail = async (to, alert, room) => {
  try {
    const mailer = initializeMailer();

    const severityColors = {
      CRITICAL: '#ff4757',
      HIGH: '#ff9f43',
      MEDIUM: '#ffa502',
      LOW: '#1e90ff',
    };

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">🚨 Campus Monitor Alert</h2>
        </div>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 0 0 8px 8px;">
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 5px solid ${severityColors[alert.severity]};">
            <h3 style="color: #333; margin-top: 0;">${alert.message}</h3>
            
            <div style="margin: 20px 0; padding: 15px; background: #f9f9f9; border-radius: 4px;">
              <p style="margin: 8px 0;"><strong>Severity:</strong> <span style="color: ${severityColors[alert.severity]}; font-weight: bold;">${alert.severity}</span></p>
              <p style="margin: 8px 0;"><strong>Room:</strong> ${room?.name || alert.room}</p>
              <p style="margin: 8px 0;"><strong>Status:</strong> ${alert.status}</p>
              <p style="margin: 8px 0;"><strong>Time:</strong> ${new Date(alert.createdAt).toLocaleString()}</p>
            </div>

            ${alert.sensorData ? `
              <div style="margin: 20px 0;">
                <h4 style="color: #333; margin-bottom: 10px;">Sensor Data:</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                  ${alert.sensorData.temperature ? `<p><strong>Temperature:</strong> ${alert.sensorData.temperature.toFixed(1)}°C</p>` : ''}
                  ${alert.sensorData.airQuality ? `<p><strong>Air Quality:</strong> ${alert.sensorData.airQuality}</p>` : ''}
                  ${alert.sensorData.energyUsage ? `<p><strong>Energy Usage:</strong> ${alert.sensorData.energyUsage}W</p>` : ''}
                </div>
              </div>
            ` : ''}

            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
              <a href="${env.frontendUrl}/alerts" style="display: inline-block; background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
                View in Dashboard
              </a>
            </div>
          </div>

          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
            <p>Campus Monitor Alert System | ${new Date().getFullYear()}</p>
          </div>
        </div>
      </div>
    `;

    const mailOptions = {
      from: env.emailFrom || 'alerts@campus-monitor.local',
      to,
      subject: `[${alert.severity}] Campus Alert - ${alert.message.substring(0, 40)}`,
      html: htmlContent,
    };

    const result = await mailer.sendMail(mailOptions);
    console.log('[EMAIL] Alert email sent to', to, 'Message ID:', result.messageId);
    return result;
  } catch (error) {
    console.error('[EMAIL] Error sending alert email:', error.message);
    throw error;
  }
};

// Send test email
const sendTestEmail = async (to) => {
  try {
    const mailer = initializeMailer();

    const mailOptions = {
      from: env.emailFrom || 'alerts@campus-monitor.local',
      to,
      subject: 'Campus Monitor - Test Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2>Campus Monitor Test Email</h2>
          <p>This is a test email to verify your email settings are configured correctly.</p>
          <p>If you received this email, your email notifications are working!</p>
          <hr />
          <p style="color: #666; font-size: 12px;">Sent at: ${new Date().toLocaleString()}</p>
        </div>
      `,
    };

    const result = await mailer.sendMail(mailOptions);
    console.log('[EMAIL] Test email sent to', to);
    return result;
  } catch (error) {
    console.error('[EMAIL] Error sending test email:', error.message);
    throw error;
  }
};

module.exports = {
  initializeMailer,
  sendAlertEmail,
  sendTestEmail,
};
