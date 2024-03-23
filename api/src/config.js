const fs = require('fs');

let success = true;

const toBool = function (str) {
    return str && str !== '0' && str.toLowerCase() !== 'false' && str.toLowerCase() !== 'f';
};

const readEnv = function (key, defaultValue = undefined) {
    let value = process.env[key];

    if (value === undefined) {
        try {
            value = fs.readFileSync(secret, 'utf8').trim();
        } catch (e) {}
    }

    if (value === undefined) {
        if (defaultValue === undefined) {
            console.log(`Missing environment variable: ${key}`);
            success = false;
        } else {
            value = defaultValue;
        }
    }

    return value;
};

const config = {
    debug: toBool(readEnv('MONITOOL_DEBUG', 'FALSE')),
    port: parseInt(readEnv('MONITOOL_PORT', '8000')),
    cluster: toBool(readEnv('MONITOOL_CLUSTER', 'TRUE')),

    jwt: {
        jwksHost: readEnv('MONITOOL_JWKS_HOST'),
        audience: readEnv('MONITOOL_AUDIENCE'),
        issuer: readEnv('MONITOOL_ISSUER'),
    },

    mongo: {
        uri: readEnv('MONITOOL_MONGO_URI'),
        database: readEnv('MONITOOL_MONGO_DB', 'monitool'),
    },

    redis: {
        uri: readEnv('MONITOOL_REDIS_URI'),
    },
};

if (!success) {
    console.log('Failed to start');
    process.exit(1);
}

module.exports = config;
