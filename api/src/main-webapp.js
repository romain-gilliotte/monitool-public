const Redis = require("ioredis");
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const responseTime = require('koa-response-time');
const winston = require('winston');

const config = require('./config');
const database = require('./storage/database');

winston.add(new winston.transports.Console())

// Catch the uncaught errors that weren't wrapped in a domain or try catch statement
process.on('uncaughtException', function (err) {
	// This should never be called, as we handle all errors insides promises.
	winston.log('error', e.message);
	process.exit(1)
});

async function startApplication() {
	try {
		global.database = await database;
		global.redis = new Redis();
	}
	catch (e) {
		winston.log('error', e.message);
		process.exit(1)
	}

	const app = new Koa();

	// Generic middlewares
	app.use(cors());
	app.use(responseTime()); // Add x-reponse-time header
	app.use(bodyParser({ jsonLimit: '1mb' }));

	app.use(require('./middlewares/error-handler'));
	app.use(require('./middlewares/authentication'));
	app.use(require('./middlewares/load-profile'));

	// Serve authentication related endpoints.
	app.use(require('./routers/input').routes());
	app.use(require('./routers/pdf-datasource').routes());
	app.use(require('./routers/pdf-logframe').routes());
	app.use(require('./routers/project').routes());

	app.listen(config.port);

	winston.log('info', `Listening on ${config.port}`);
}

startApplication();
