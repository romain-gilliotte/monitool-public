const { getIndicatorCube } = require('./loader/indicator');

queue.process('compute-report-json', async job => {
    try {
        const { projectId, output, formula, parameters, aggregate, dice } = job.data;
        const cube = await getIndicatorCube(projectId, formula, parameters, aggregate, dice);

        // Format response.
        if (output == 'report') return cube.getNestedObject('main', true, true);
        else if (output == 'flatArray') return cube.getData('main');
        else if (output == 'nestedArray') return cube.getNestedArray('main');
        else return cube.getNestedObject('main');
    }
    catch (e) {
        console.log(e);
        throw e;
    }
});
