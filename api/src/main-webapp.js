const winston = require('winston');
const application = require('./application');
const config = require('./config/config');
const database = require('./resource/database');

winston.add(new winston.transports.Console())

// Catch the uncaught errors that weren't wrapped in a domain or try catch statement
process.on('uncaughtException', function (err) {
	// This should absolutely never be called, as we handle all errors insides promises.
	console.log(err.stack)
});


async function startApplication() {
	// Check connection with couchdb
	let connected = false;
	while (!connected) {
		try {
			connected = !!await database.checkConnectivity();
		}
		catch (error) {
			winston.log('warn', 'Could not connect database: ' + error.message + '. Retry in 15 seconds.');
			await new Promise(resolve => setTimeout(resolve, 15 * 1000));
		}
	}

	// Launch application
	try {
		// Create bucket / Migrate if needed
		await database.prepare();

		// Crash if we fail to listen.
		application.listen(config.port);
	}
	catch (e) {
		winston.log('error', e.message);
		process.exit(1)
	}
}

startApplication();
