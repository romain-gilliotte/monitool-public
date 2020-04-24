const _ = require('lodash');
const { getVariableCube } = require('./cube-variable');

/**
 * Generate a cube from a query.
 *
 * This delegates most of the work to single variable cube generator, and
 * then compose the results and add the relevant computed measure.
 */
async function getQueryCube(project, formula, parameters, aggregate, dice) {
    const cubes = await Promise.all(
        _.toPairs(parameters).map(async ([paramName, parameter]) => {
            let cube = await getVariableCube(project, parameter.variableId, aggregate, [
                ...dice,
                ...parameter.dice,
            ]);

            cube = cube.renameMeasure('main', paramName);

            return cube;
        })
    );

    const cube = cubes.reduce((m, c) => m.compose(c, true));
    cube.createComputedMeasure('main', formula);
    return cube;
}

module.exports = { getQueryCube };
