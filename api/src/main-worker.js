const database = require('./storage/database');

async function startApplication() {
    global.database = await database;
}

startApplication();

require('./tasks/mail');
require('./tasks/reporting');
