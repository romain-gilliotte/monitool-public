import fs from 'fs';
import aws from 'aws-sdk';
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
	debug: toBool(process.env.MONITOOL_DEBUG),
	port: parseInt(process.env.MONITOOL_PORT),

	jwt: {
		jwks: process.env.MONITOOL_JWT_JWKS
	},

	couchdb: {
		host: process.env.MONITOOL_COUCHDB_HOST,
		port: parseInt(process.env.MONITOOL_COUCHDB_PORT),
		bucket: process.env.MONITOOL_COUCHDB_DATABUCKET,
		username:
			process.env.MONITOOL_COUCHDB_USER ||
			readFile(process.env.MONITOOL_COUCHDB_USER_FILE) ||
			"",
		password:
			process.env.MONITOOL_COUCHDB_PASS ||
			readFile(process.env.MONITOOL_COUCHDB_PASS_FILE) ||
			""
	}
};

aws.config.region = 'eu-west-1';





// Validate that nothing is missing from the configuration file.
let validate = validator(schema);

validate(config);

var errors = validate.errors || [];
if (errors.length) {
	// if there is errors, log them and exit the process.
	errors.forEach(function (error) {
		winston.log('error', 'Invalid config ', error);
	});

	process.exit(1);
}

export default config;
