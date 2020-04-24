const zlib = require('zlib');
const { promisify } = require('util');
const { getQueryCube } = require('./loader/cube-query');
const renderJson = require('./renderer/json');
const renderXlsx = require('./renderer/xlsx');
const Cache = require('lru-cache');
const { loadProject } = require('./loader/project');

const cache = new Cache({ maxAge: 10000 });
setInterval(cache.prune.bind(cache), 60 * 1000);

queue.process('compute-report', async job => {
    const { projectId, formula, parameters, aggregate, dice } = job.data;

    let project = await cache.get(projectId);
    if (!project) {
        const promise = loadProject(projectId);
        cache.set(projectId, promise);
        project = await promise;
    }

    const cube = await getQueryCube(project, formula, parameters, aggregate, dice);
    const { renderer, rendererOpts } = job.data;
    let result;
    if (renderer === 'json') result = await renderJson(cube, rendererOpts);
    else if (renderer === 'xlsx') result = await renderXlsx(cube, rendererOpts);
    else throw new Error('Unknown renderer');

    const { mimeType, filename, payload } = result;
    const packed = await promisify(zlib.gzip)(payload);
    return JSON.stringify({
        mimeType,
        filename,
        payload: packed.toString('base64'),
    });
});
