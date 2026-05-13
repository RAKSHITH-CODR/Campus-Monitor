const logger = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  error: (msg) => console.error(`❌ ${msg}`),
  warn: (msg) => console.warn(`⚠️  ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  debug: (msg) => console.log(`🐛 ${msg}`),
};

module.exports = logger;
