const Bull = require('bull');
const queue = new Bull('reporting');
const { executeQuery } = require('./query-runner');


queue.process('compute-report', async job => {
    try {
        const { projectId, output, ...query } = job.data;
        const result = await executeQuery(projectId, output, query);

        return result;
    }
    catch (e) {
        console.log(e);
        throw e;
    }
});
