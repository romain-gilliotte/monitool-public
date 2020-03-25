const fs = require('fs');

require('dotenv').config();

const toBool = function (str) {
	return str && str !== '0' && str.toLowerCase() != 'false';
};

const readEnv = function (key, defaultValue = undefined) {
	let value = process.env[key];

	if (value === undefined) {
		try { value = fs.readFileSync(secret, "utf8").trim(); }
		catch (e) { }
	}

	if (value === undefined) {
		value = defaultValue;
	}

	return value;
}

module.exports = {
	debug: toBool(readEnv('MONITOOL_DEBUG', 'TRUE')),
	port: parseInt(readEnv('MONITOOL_PORT', '8080')),

	jwt: {
		jwksHost: readEnv('MONITOOL_JWKS_HOST'),
		audience: readEnv('MONITOOL_AUDIENCE'),
		issuer: readEnv('MONITOOL_ISSUER'),
	}
};
