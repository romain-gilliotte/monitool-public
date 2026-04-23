const winston = require('winston');

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'monitool-api' },
  transports: [
    // Console transport with colorization in development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        // Add colorization for development
        ...(process.env.NODE_ENV !== 'production' ? [winston.format.colorize()] : [])
      ),
    }),
  ],
});

module.exports = logger;
