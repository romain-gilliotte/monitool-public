const Bull = require('bull');
const Redis = require("ioredis");
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const responseTime = require('koa-response-time');
const winston = require('winston');
const config = require('./config');
const MongoClient = require('mongodb').MongoClient;

winston.add(new winston.transports.Console())

// Catch the uncaught errors that weren't wrapped in a domain or try catch statement
process.on('uncaughtException', function (err) {
	// This should never be called, as we handle all errors insides promises.
	winston.log('error', e.message);
	process.exit(1)
});

// Init global variables
global.mongo = null;
global.database = null;
global.redis = null;
global.queue = null;
global.server = null;

async function start(web = true, worker = true) {
	global.mongo = await MongoClient.connect(
		'mongodb://admin:admin@localhost:27017',
		{ useUnifiedTopology: true }
	);

	global.database = global.mongo.db('monitool');
	global.redis = new Redis();
	global.queue = new Bull('workers');

	if (web) {
		app = new Koa();
		app.use(cors());
		app.use(responseTime());
		app.use(bodyParser({ jsonLimit: '1mb' }));
		app.use(require('./middlewares/error-handler'));
		app.use(require('./middlewares/authentication'));
		app.use(require('./middlewares/load-profile'));
		app.use(require('./routers/input').routes());
		app.use(require('./routers/pdf-datasource').routes());
		app.use(require('./routers/pdf-logframe').routes());
		app.use(require('./routers/project').routes());

		global.server = app.listen(config.port);
		winston.log('info', `Listening on ${config.port}.`);
	}

	if (worker) {
		require('./tasks/mail');
		require('./tasks/reporting');
		winston.log('info', `All tasks registered.`);
	}
}

async function stop() {
	if (global.mongo)
		global.mongo.close(true);

	if (global.redis)
		global.redis.disconnect();

	if (global.server)
		global.server.close();

	if (global.queue)
		global.queue.close();
}

// Start application if this file is executed.
if (require.main === module) {
	start();
}

module.exports = { start, stop };
