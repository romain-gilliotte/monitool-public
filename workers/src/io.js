const Bull = require('bull');
const MongoClient = require('mongodb').MongoClient;
const config = require('./config');

class InputOutput {
    async connect() {
        this.mongo = await MongoClient.connect(config.mongo.uri, { useUnifiedTopology: true });
        this.database = this.mongo.db(config.mongo.database);
        this.cache = this.mongo.db(config.mongo.database + '_cache');
        this.queue = new Bull('workers', config.redis.uri);

        this.queue.on('completed', function (job) {
            console.log(job.name, job.data, job.returnvalue);
        });

        this.queue.on('failed', function (job, error) {
            console.log(job.name, job.data, job.stacktrace);
        });
    }

    async disconnect() {
        this.mongo.close(true);
        this.queue.close();
        this.server.close();
    }
}

module.exports = { InputOutput };
