const { getIndicatorCube } = require('./loader/indicator');
const renderJson = require('./renderer/json')
const renderXlsx = require('./renderer/xlsx')

queue.process('compute-report', async job => {
    const { projectId, formula, parameters, aggregate, dice } = job.data;
    const cube = await getIndicatorCube(projectId, formula, parameters, aggregate, dice);

    const { renderer, rendererOpts } = job.data;
    if (renderer === 'json')
        return renderJson(cube, rendererOpts);
    else if (renderer === 'xlsx')
        return renderXlsx(cube, rendererOpts);
    else
        throw new Error('Unknown renderer');
});
