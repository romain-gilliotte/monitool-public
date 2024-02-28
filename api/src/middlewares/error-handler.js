const winston = require('winston');
const config = require('../config');

module.exports = async (ctx, next) => {
    try {
        await next();
        winston.log('info', { method: ctx.method, url: ctx.url, status: ctx.response.status });
    } catch (error) {
        ctx.response.status = error?.status || 500;
        ctx.response.body = {
            message: error.message,
            stack: config.debug ? error.stack : '🤫',
        };

        winston.log('warn', error.message, { stack: error.stack, route: ctx.url });
    }
};
