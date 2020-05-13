const Bull = require('bull');
const MongoClient = require('mongodb').MongoClient;
const config = require('./config');

class InputOutput {
    async connect() {
        this.mongo = await MongoClient.connect(config.mongo.uri, { useUnifiedTopology: true });
        this._createDatabase();

        this.cache = this.mongo.db(config.mongo.database + '_cache');
        this.queue = new Bull('workers', config.redis.uri);

        this.queue.on('completed', function (job) {
            console.log(job.name, 'completed');
        });

        this.queue.on('failed', function (job, error) {
            console.log(job.name, job.stacktrace);
        });
    }

    async disconnect() {
        this.mongo.close(true);
        this.queue.close();
        this.server.close();
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
