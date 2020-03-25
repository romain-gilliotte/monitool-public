const MongoClient = require('mongodb').MongoClient;

async function connectDatabase() {
    const client = await MongoClient.connect('mongodb://admin:admin@localhost:27017', {
        useUnifiedTopology: true
    });

    return client.db('monitool');
}

module.exports = connectDatabase();
