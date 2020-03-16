const winston = require('winston');
const application = require('./application');
const config = require('./config/config');
const MongoClient = require('mongodb').MongoClient;
const Redis = require("ioredis");

winston.add(new winston.transports.Console())

// Catch the uncaught errors that weren't wrapped in a domain or try catch statement
process.on('uncaughtException', function (err) {
	// This should absolutely never be called, as we handle all errors insides promises.
	console.log(err.stack)
});

async function startApplication() {

	try {
		const client = await MongoClient.connect('mongodb://admin:admin@localhost:27017', {
			useUnifiedTopology: true
		});

		global.database = client.db('monitool');
		global.redis = new Redis();

		application.listen(config.port);
		winston.log('info', `Listening on ${config.port}`);
	}
	catch (e) {
		// Crash if we fail
		winston.log('error', e.message);
		process.exit(1)
	}
}

startApplication();
