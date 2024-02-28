const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const responseTime = require('koa-response-time');
const winston = require('winston');
const config = require('./config');
const { InputOutput } = require('./io');

winston.add(new winston.transports.Console());

// Catch the uncaught errors that weren't wrapped in a domain or try catch statement
process.on('uncaughtException', e => {
    // This should never be called, as we handle all errors insides promises.
    console.log('uncaughtException!!!', e);
    // winston.log('error', e.message);
    process.exit(1);
});

async function start() {
    const app = new Koa();
    app.context.io = new InputOutput();
    await app.context.io.connect();

    app.use(cors());
    app.use(responseTime());
    app.use(bodyParser({ enableTypes: ['json'] }));
    app.use(require('./middlewares/error-handler'));
    app.use(require('./routers/health').routes());
    app.use(require('./middlewares/load-profile'));
    app.use(require('./routers/downloads').routes());
    app.use(require('./routers/invitations').routes());
    app.use(require('./routers/input').routes());
    app.use(require('./routers/project').routes());
    app.use(require('./routers/rpc').routes());
    app.use(require('./routers/uploads').routes());

    const server = app.listen(config.port);
    winston.log('info', `Listening on ${config.port}.`);

    return async () => {
        winston.log('info', `Closing gracefully.`);

        server.close(); // should listen to the event handler
        await app.context.io.disconnect();
        process.exit(0);
    };
}

if (require.main === module) {
    // This file was executed: Start application.
    if (config.cluster && cluster.isMaster) {
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
} else {
    module.exports = { start };
}
