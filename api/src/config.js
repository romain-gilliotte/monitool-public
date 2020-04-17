const fs = require('fs');

require('dotenv').config();

const toBool = function (str) {
	return str
		&& str !== '0'
		&& str.toLowerCase() !== 'false'
		&& str.toLowerCase() !== 'f';
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
	cluster: toBool(readEnv('MONITOOL_CLUSTER', 'FALSE')),

	jwt: {
		jwksHost: readEnv('MONITOOL_JWKS_HOST'),
		audience: readEnv('MONITOOL_AUDIENCE'),
		issuer: readEnv('MONITOOL_ISSUER'),
	},

	mongo: {
		uri: readEnv('MONITOOL_MONGO_URI'),
		database: readEnv('MONITOOL_MONGO_DB')
	},

	redis: {
		uri: readEnv('MONITOOL_REDIS_URI')
	},

	unoconv: {
		uri: readEnv('MONITOOL_UNOCONV_URI')
	},

	limits: {
		dataEntryGracePeriod: parseInt(
			readEnv('MONITOOL_DATA_ENTRY_GRACE_PERIOD', '15')
		),
	},
};
