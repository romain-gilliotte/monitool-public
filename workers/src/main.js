const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const winston = require('winston');
const config = require('./config');
const { InputOutput } = require('./io');
const { initDownloads } = require('./tasks/downloads');
const { initReporting } = require('./tasks/reporting');
const { initUploads } = require('./tasks/uploads');
const { initHealthCheck } = require('./tasks/health');

winston.add(new winston.transports.Console());

// Catch the uncaught errors that weren't wrapped in a domain or try catch statement
process.on('uncaughtException', e => {
    // This should never be called, as we handle all errors insides promises.
    console.log('uncaughtException!!!', e);
    // winston.log('error', e.message);
    process.exit(1);
});

async function start() {
    const io = new InputOutput();
    await io.connect();

    initHealthCheck(io);
    initDownloads(io);
    initReporting(io);
    initUploads(io);

    winston.log('info', `All tasks registered.`);

    return async () => {
        await io.disconnect();
    };
}

// Start application only if this file is executed.
// Otherwise just export the start/stop functions
if (require.main === module) {
    if (config.cluster && cluster.isMaster) {
        for (let i = 0; i < numCPUs; i++) {
            cluster.fork();
        }
    } else {
        start();
    }
} else {
    module.exports = { start };
}
