require('dotenv').config();

const fs = require('fs');
const validator = require('is-my-json-valid');
const winston = require('winston');
const schema = require('./schema.json');


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
		jwksHost: process.env.MONITOOL_JWKS_HOST,
		audience: process.env.MONITOOL_AUDIENCE,
		issuer: process.env.MONITOOL_ISSUER,
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

module.exports = config;
