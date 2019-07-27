import fs from 'fs';
import validator from 'is-my-json-valid';
import winston from 'winston';
import schema from './schema.json';

const toBool = function (str) {
	return str && str !== '0' && str.toLowerCase() != 'false';
};

const readFile = function (secret) {
	try {
		return fs.readFileSync(secret, "utf8").trim();
	}
	catch (e) {
		return null;
	}
};

const config = {
	"debug": toBool(process.env.MONITOOL_DEBUG) || false,
	"baseUrl": process.env.MONITOOL_BASE_URL || "http://localhost:8000",
	"port": parseInt(process.env.MONITOOL_PORT) || 8000,
	"tokenSecret":
		process.env.MONITOOL_TOKEN_SECRET ||
		readFile(process.env.MONITOOL_TOKEN_SECRET_FILE),

	"couchdb": {
		"host": process.env.MONITOOL_COUCHDB_HOST || "localhost",
		"port": parseInt(process.env.MONITOOL_COUCHDB_PORT) || 5984,
		"bucket": process.env.MONITOOL_COUCHDB_DATABUCKET || "monitool",
		"username":
			process.env.MONITOOL_COUCHDB_USER ||
			readFile(process.env.MONITOOL_COUCHDB_USER_FILE) ||
			"",
		"password":
			process.env.MONITOOL_COUCHDB_PASS ||
			readFile(process.env.MONITOOL_COUCHDB_PASS_FILE) ||
			""
	}
};

// Validate that nothing is missing from the configuration file.
let validate = validator(schema);

validate(config);

var errors = validate.errors || [];
if (errors.length) {
	// if there is errors, log them and exit the process.
	errors.forEach(function (error) {
		winston.log('error', 'Invalid config', error);
	});

	process.exit(1);
}

export default config;
