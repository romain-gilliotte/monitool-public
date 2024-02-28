const { InputOutput } = require('../io');

/**
 * @param {InputOutput} io
 */
function initDummy(io) {
    io.queue.process('dummy', () => {
        return true;
    });
}

module.exports = { initDummy };
