const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const Bull = require('bull');
const Redis = require('ioredis');
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const responseTime = require('koa-response-time');
const winston = require('winston');
const config = require('./config');
const MongoClient = require('mongodb').MongoClient;
const Redlock = require('redlock');

winston.add(new winston.transports.Console());

// Catch the uncaught errors that weren't wrapped in a domain or try catch statement
process.on('uncaughtException', e => {
    // This should never be called, as we handle all errors insides promises.
    console.log('uncaughtException!!!', e);
    // winston.log('error', e.message);
    process.exit(1);
});

// Init global variables
global.mongo = null;
global.database = null;
global.redis = null;
global.redisLock = null;
global.queue = null;
global.server = null;

async function start() {
    global.mongo = await MongoClient.connect(config.mongo.uri, { useUnifiedTopology: true });

    global.database = global.mongo.db(config.mongo.database);
    global.database
        .collection('invitation')
        .createIndex({ projectId: 1, email: 1 }, { unique: true });
    global.database.collection('input').createIndex({ sequenceId: 1, 'content.variableId': 1 });
    global.database.collection('user').createIndex({ subs: 1 });

    // FIXME move this somewhere else

    global.redis = new Redis(config.redis.uri);
    global.redisLock = new Redlock([redis]);
    global.queue = new Bull('workers', config.redis.uri);

    app = new Koa();
    app.use(cors());
    app.use(responseTime());
    app.use(bodyParser({ enableTypes: ['json'] }));
    app.use(require('./middlewares/error-handler'));
    app.use(require('./middlewares/load-profile'));
    app.use(require('./routers/invitations').routes());
    app.use(require('./routers/input').routes());
    app.use(require('./routers/downloads').routes());
    app.use(require('./routers/project').routes());
    app.use(require('./routers/rpc').routes());
    app.use(require('./routers/uploads').routes());

    global.server = app.listen(config.port);
    winston.log('info', `Listening on ${config.port}.`);
}

async function stop() {
    if (global.mongo) global.mongo.close(true);

    if (global.queue) global.queue.close();

    if (global.redis) global.redis.disconnect();

    if (global.server) global.server.close();
}

// Start application only if this file is executed.
// Otherwise just export the start/stop functions
if (require.main === module) {
    if (config.cluster && cluster.isMaster) for (let i = 0; i < numCPUs; i++) cluster.fork();
    else start();
} else {
    module.exports = { start, stop };
}
