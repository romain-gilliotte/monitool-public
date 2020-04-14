const _ = require('lodash');
const { getVariableCube } = require('./variable');

/**
 * Generate an indicator cube from scratch
 *
 * @param {string} projectId 
 * @param {string} formula 
 * @param {object} parameters 
 */
async function getIndicatorCube(projectId, formula, parameters, aggregate, dice) {
    const cubes = await Promise.all(_.toPairs(parameters).map(async ([paramName, parameter]) => {
        let cube = await getVariableCube(
            projectId,
            parameter.variableId,
            aggregate, [...dice, ...parameter.dice]
        );

        cube = cube.renameMeasure('main', paramName)

        return cube;
    }));

    const cube = cubes.reduce((m, c) => m.compose(c, true));
    cube.createComputedMeasure('main', formula);
    return cube;
}

module.exports = { getIndicatorCube };