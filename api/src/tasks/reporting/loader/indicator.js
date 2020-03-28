const _ = require('lodash');
const { getVariableCube } = require('./variable');

/**
 * Generate an indicator cube from scratch
 *
 * @param {string} projectId 
 * @param {string} formula 
 * @param {object} parameters 
 */
async function getIndicatorCube(projectId, formula, parameters) {
    const cubes = await Promise.all(_.toPairs(parameters).map(async ([paramName, parameter]) => {
        let cube = await getVariableCube(projectId, parameter.variableId);
        cube = cube.renameMeasure('main', paramName)

        parameter.dice.forEach(d => {
            // This happens only for partitions, so we should not have calls to 'diceRange'
            if (d.range)
                cube = cube.diceRange(d.id, d.attribute, d.range[0], d.range[1]);
            else
                cube = cube.dice(d.id, d.attribute, d.items);

            // Dimensions which are used to dice in parameters should not be manipulated after that
            // in the global dice / aggregation of the query.
            cube = cube.removeDimension(d.id);
        });

        return cube;
    }));

    const cube = cubes.reduce((m, c) => m.compose(c));
    cube.createComputedMeasure('main', formula);
    return cube;
}

module.exports = { getIndicatorCube };