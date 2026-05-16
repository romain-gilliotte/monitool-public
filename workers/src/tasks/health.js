import { InputOutput } from '../io.js';
/**
 * @param {InputOutput} io
 */
function initHealthCheck(io) {
    io.queue.process('health-check', async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return { error: null };
    });
}

export { initHealthCheck };
