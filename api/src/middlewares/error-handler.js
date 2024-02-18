const winston = require('winston');
const config = require("../config");

module.exports = async (ctx, next) => {
    try {
        await next();
    } catch (error) {
        ctx.response.status = error?.status || 500;
        ctx.response.body = {
            message: error.message,
            stack: config.debug ? error.stack : '🤫',
        };

        winston.log('warn', error.message, { stack: error.stack });
    }
};
