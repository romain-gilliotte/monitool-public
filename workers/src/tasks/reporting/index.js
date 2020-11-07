const zlib = require('zlib');
const Cache = require('lru-cache');
const { promisify } = require('util');
const { getQueryCube } = require('./loader/cube-query');
const { loadProject } = require('./loader/project');
const renderJson = require('./renderer/json');
const renderXlsx = require('./renderer/xlsx');

const { InputOutput } = require('../../io');

const cache = new Cache({ max: 25, maxAge: 10000 });

/**
 * @param {InputOutput} io
 */
function initReporting(io) {
    io.queue.process('compute-report', async job => {
        const { projectId, formula, parameters, aggregate, dice, upto } = job.data;
        const { renderer, rendererOpts } = job.data;

        return computeReport(
            io,
            projectId,
            formula,
            parameters,
            aggregate,
            dice,
            upto,
            renderer,
            rendererOpts
        );
    });
}

/**
 *
 * @param {InputOutput} io
 * @param {string} projectId
 * @param {string} formula
 * @param {Record<string, any>} parameters
 * @param {Array<{id: string, attribute: string}>} aggregate
 * @param {Array<{id: string, attribute: string, items: string[]}>} dice
 */
async function computeReport(
    io,
    projectId,
    formula,
    parameters,
    aggregate,
    dice,
    upto,
    renderer,
    rendererOpts
) {
    let project = await cache.get(projectId);
    if (!project) {
        const promise = loadProject(io, projectId);
        cache.set(projectId, promise);
        project = await promise;
    }

    const cube = await getQueryCube(io, project, upto, formula, parameters, aggregate, dice);
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
}

module.exports = { initReporting, computeReport };
