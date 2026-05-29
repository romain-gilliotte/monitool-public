import cluster from 'node:cluster';
import { cpus } from 'node:os';
import { pathToFileURL } from 'node:url';
import Koa from 'koa';
import { bodyParser } from '@koa/bodyparser';
import cors from '@koa/cors';
import winston from 'winston';
import config from './config.js';
import { InputOutput } from './io.js';
import errorHandler from './middlewares/error-handler.js';
import loadProfile from './middlewares/load-profile.js';
import healthRouter from './routers/health.js';
import downloadsRouter from './routers/downloads.js';
import invitationsRouter from './routers/invitations.js';
import inputRouter from './routers/input.js';
import projectRouter from './routers/project.js';
import rpcRouter from './routers/rpc.js';
import uploadsRouter from './routers/uploads.js';

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
    const app = new Koa();
    app.context.io = new InputOutput();
    await app.context.io.connect();

    // Koa pipes streamed bodies (Mongo cursors -> JSON) to the socket *after* the
    // middleware chain has resolved, so an error there (typically a client that
    // navigated away mid-stream) surfaces here rather than in error-handler.js.
    // Without a listener Koa dumps a raw stack to stderr; route it through winston
    // with the offending route instead. Registering this before listen() also
    // suppresses Koa's default stderr handler.
    app.on('error', (err, ctx) => {
        if (['ERR_STREAM_PREMATURE_CLOSE', 'ECONNRESET', 'EPIPE'].includes(err.code)) {
            winston.log('warn', `Client aborted response (${err.code})`, {
                method: ctx?.method,
                route: ctx?.url,
            });
            return;
        }

        winston.log('error', err.message, { stack: err.stack, route: ctx?.url });
    });

    app.use(cors());
    app.use(async (ctx, next) => {
        const start = process.hrtime.bigint();
        await next();
        const ms = Number(process.hrtime.bigint() - start) / 1e6;
        ctx.set('X-Response-Time', `${ms.toFixed(3)}ms`);
    });
    app.use(bodyParser({ enableTypes: ['json'] }));
    app.use(errorHandler);
    app.use(healthRouter.routes());
    app.use(loadProfile);
    app.use(downloadsRouter.routes());
    app.use(invitationsRouter.routes());
    app.use(inputRouter.routes());
    app.use(projectRouter.routes());
    app.use(rpcRouter.routes());
    app.use(uploadsRouter.routes());

    const server = app.listen(config.port);
    winston.log('info', `Listening on ${config.port}.`);

    return async () => {
        winston.log('info', `Closing gracefully.`);

        server.close(); // should listen to the event handler
        await app.context.io.disconnect();
        process.exit(0);
    };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    // This file was executed: Start application.
    if (config.cluster && cluster.isPrimary) {
        for (let i = 0; i < numCPUs; i++) {
            cluster.fork();
        }
    } else {
        start()
            .then(stop => {
                process.on('SIGINT', stop);
            })
            .catch(e => {
                winston.log('error', e.message);
                process.exit(1);
            });
    }
}
