import cluster from 'node:cluster';
import { cpus } from 'node:os';
import { pathToFileURL } from 'node:url';
import winston from 'winston';
import config from './config.js';
import { InputOutput } from './io.js';
import { init as initCv } from './helpers/cv.js';
import { initDownloads } from './tasks/downloads/index.js';
import { initReporting } from './tasks/reporting/index.js';
import { initUploads } from './tasks/uploads/index.js';
import { initHealthCheck } from './tasks/health.js';

const numCPUs = cpus().length;

winston.add(new winston.transports.Console());

// Catch the uncaught errors that weren't wrapped in a domain or try catch statement
process.on('uncaughtException', e => {
    // This should never be called, as we handle all errors insides promises.
    console.log('uncaughtException!!!', e);
    // winston.log('error', e.message);
    process.exit(1);
});

export async function start() {
    const io = new InputOutput();
    await Promise.all([io.connect(), initCv()]);

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
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    if (config.cluster && cluster.isPrimary) {
        for (let i = 0; i < numCPUs; i++) {
            cluster.fork();
        }
    } else {
        start();
    }
}
