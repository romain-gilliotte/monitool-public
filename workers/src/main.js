const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const Bull = require('bull');
const winston = require('winston');
const config = require('./config');
const MongoClient = require('mongodb').MongoClient;

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
    global.mongo = await MongoClient.connect(config.mongo.uri, {
        useUnifiedTopology: true,
    });

    global.database = global.mongo.db(config.mongo.database);
    global.queue = new Bull('workers', config.redis.uri);

    require('./tasks/downloads');
    require('./tasks/reporting');
    require('./tasks/thumbnail');
    require('./tasks/uploads');
    winston.log('info', `All tasks registered.`);
}

async function stop() {
    if (global.mongo) global.mongo.close(true);

    if (global.queue) global.queue.close();

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
