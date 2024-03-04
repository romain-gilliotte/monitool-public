const Bull = require('bull');
const Redis = require('ioredis');
const config = require('./config');
const MongoClient = require('mongodb').MongoClient;
const Redlock = require('redlock');

class InputOutput {
    async connect() {
        this.mongo = await MongoClient.connect(config.mongo.uri, {
            useUnifiedTopology: true,
            poolSize: 50,
        });

        this.redis = new Redis(config.redis.uri, { showFriendlyErrorStack: true });
        this.redisLock = new Redlock([this.redis]);
        this.queue = new Bull('workers', config.redis.uri);

        this._createDatabase();
    }

    async disconnect() {
        this.mongo.close(true);
        this.queue.close();
        this.redis.disconnect();
    }

    _createDatabase() {
        this.database = this.mongo.db(config.mongo.database);
        this.database
            .collection('invitation')
            .createIndex({ projectId: 1, email: 1 }, { unique: true });

        this.database
            .collection('input_upload')
            .createIndex({ 'original.sha1': 1 }, { unique: true });

        this.database.collection('input').createIndex({ sequenceId: 1, 'content.variableId': 1 });
        this.database.collection('user').createIndex({ subs: 1 });
    }
}

module.exports = { InputOutput };
