const logger = require('../utils/logger');
const config = require('../config');

module.exports = async (ctx, next) => {
  try {
    await next();
    logger.info('Request completed', {
      method: ctx.method,
      url: ctx.url,
      status: ctx.response.status,
    });
  } catch (error) {
    ctx.response.status = error?.status || 500;
    ctx.response.body = {
      message: error.message,
      stack: config.debug ? error.stack : '🤫',
    };

    logger.warn('Request error', { message: error.message, stack: error.stack, route: ctx.url });
  }
};
