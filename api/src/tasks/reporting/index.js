const Bull = require('bull');
const queue = new Bull('reporting');
const { executeQuery } = require('./query-runner');


queue.process('compute-report', async job => {
    // Load cube.
    try {
        const { projectId, output, ...query } = job.data;
        return executeQuery(projectId, output, query);
    }
    catch (e) {
        console.log(e);
        throw e;
    }
});
