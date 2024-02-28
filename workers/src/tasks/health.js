const { InputOutput } = require('../io');

/**
 * @param {InputOutput} io
 */
function initHealthCheck(io) {
    io.queue.process('health-check', async () => {
        return { error: null };
    });
}

module.exports = { initHealthCheck };
