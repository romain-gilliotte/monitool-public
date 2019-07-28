import winston from 'winston';

import application from './application';
import config from './config/config';
import database from './resource/database';

winston.add(new winston.transports.Console())

// Catch the uncaught errors that weren't wrapped in a domain or try catch statement
process.on('uncaughtException', function (err) {
	// This should absolutely never be called, as we handle all errors insides promises.
	console.log(err.stack)
});

async function tryStartApplication() {
	// Wait for database.
	try {
		await database.checkConnectivity();
	}
	catch (error) {
		winston.log('warning', 'Could not connect database: ' + error.message + '. Retry in 15 seconds.');
		setTimeout(startApplication, 15 * 1000);
		return;
	}

	// Create bucket / Migrate if needed
	await database.prepare();

	// Crash if we fail to listen.
	application.listen(config.port);
}

function startApplication() {
	tryStartApplication().catch(error => {
		winston.log('error', error.message);
		process.exit(1)
	});
}

startApplication();
