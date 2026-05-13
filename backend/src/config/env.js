require('dotenv').config();

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  groqApiKey: process.env.GROQ_API_KEY,
  adminEmail: process.env.ADMIN_EMAIL,
  adminPassword: process.env.ADMIN_PASSWORD,
  // Email Configuration
  emailProvider: process.env.EMAIL_PROVIDER || 'test', // 'test', 'gmail', 'sendgrid', etc.
  smtpHost: process.env.SMTP_HOST,
  smtpPort: process.env.SMTP_PORT || 587,
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  smtpSecure: process.env.SMTP_SECURE === 'true',
  emailFrom: process.env.EMAIL_FROM || 'alerts@campus-monitor.local',
};

// Validate required environment variables
const required = ['MONGO_URI', 'JWT_SECRET', 'GROQ_API_KEY'];
const missing = required.filter(key => !process.env[key]);

if (missing.length > 0) {
  console.error('❌ Missing critical environment variables:', missing.join(', '));
  console.error('📝 Please check your .env file');
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

module.exports = env;
