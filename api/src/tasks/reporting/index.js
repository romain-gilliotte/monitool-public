const zlib = require('zlib');
const { getIndicatorCube } = require('./loader/indicator');
const renderJson = require('./renderer/json');
const renderXlsx = require('./renderer/xlsx');

queue.process('compute-report', async job => {
    const { projectId, formula, parameters, aggregate, dice } = job.data;
    const cube = await getIndicatorCube(projectId, formula, parameters, aggregate, dice);

    const { renderer, rendererOpts } = job.data;
    let result;
    if (renderer === 'json') result = await renderJson(cube, rendererOpts);
    else if (renderer === 'xlsx') result = await renderXlsx(cube, rendererOpts);
    else throw new Error('Unknown renderer');

    const { mimeType, filename, payload } = result;
    return JSON.stringify({
        mimeType,
        filename,
        payload: zlib.gzipSync(payload).toString('base64'),
    });
});
