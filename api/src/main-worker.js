const MongoClient = require('mongodb').MongoClient;

async function startApplication() {
    const client = await MongoClient.connect('mongodb://admin:admin@localhost:27017', {
        useUnifiedTopology: true
    });
    global.database = client.db('monitool');
}

startApplication();

require('./workers/mail');
require('./workers/reporting');
