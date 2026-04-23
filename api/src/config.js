const fs = require('fs');
const logger = require('./utils/logger');

let success = true;

const toBool = function (str) {
  return str && str !== '0' && str.toLowerCase() !== 'false' && str.toLowerCase() !== 'f';
};

const readEnv = function (key, defaultValue = undefined) {
  let value = process.env[key];

  if (value === undefined) {
    try {
      value = fs.readFileSync(secret, 'utf8').trim();
    } catch (e) {}
  }

  if (value === undefined) {
    if (defaultValue === undefined) {
      logger.warn(`Missing environment variable: ${key}`);
      success = false;
    } else {
      value = defaultValue;
    }
  }

  return value;
};

const config = {
  debug: toBool(readEnv('MONITOOL_DEBUG', 'FALSE')),
  port: parseInt(readEnv('MONITOOL_PORT', '8000')),
  cluster: toBool(readEnv('MONITOOL_CLUSTER', 'TRUE')),

  jwt: {
    secret: readEnv('MONITOOL_JWT_SECRET'),
    expiresIn: readEnv('MONITOOL_JWT_EXPIRES_IN', '7d'),
  },

  session: {
    secret: readEnv('MONITOOL_SESSION_SECRET'),
  },

  oauth: {
    google: {
      clientId: readEnv('MONITOOL_GOOGLE_CLIENT_ID'),
      clientSecret: readEnv('MONITOOL_GOOGLE_CLIENT_SECRET'),
    },
    microsoft: {
      clientId: readEnv('MONITOOL_MICROSOFT_CLIENT_ID'),
      clientSecret: readEnv('MONITOOL_MICROSOFT_CLIENT_SECRET'),
    },
  },

  aws: {
    region: readEnv('MONITOOL_AWS_REGION', 'us-east-1'),
    accessKeyId: readEnv('MONITOOL_AWS_ACCESS_KEY_ID'),
    secretAccessKey: readEnv('MONITOOL_AWS_SECRET_ACCESS_KEY'),
  },

  email: {
    from: readEnv('MONITOOL_EMAIL_FROM', 'no-reply@monitool.org'),
  },

  appUrl: readEnv('MONITOOL_APP_URL', 'http://localhost:3000'),

  mongo: {
    uri: readEnv('MONITOOL_MONGO_URI'),
    database: readEnv('MONITOOL_MONGO_DB', 'monitool'),
  },

  redis: {
    uri: readEnv('MONITOOL_REDIS_URI'),
  },
};

if (!success && process.env.NODE_ENV !== 'test') {
  logger.error('Failed to start');
  process.exit(1);
}

module.exports = config;
