/*!
 * This file is part of Monitool.
 *
 * Monitool is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Monitool is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Monitool. If not, see <http://www.gnu.org/licenses/>.
 */

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
