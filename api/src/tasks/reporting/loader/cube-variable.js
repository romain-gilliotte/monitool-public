const { Cube } = require('olap-in-memory');
const iterateCubes = require('./cube-iterator');
const { createVariableDimensions, createVariableRules } = require('./helper');

/**
 * Because of memory constraints, it is inconvenient to keep the dimensions attribute
 * which allowed filling each cell in the olap-cubes.
 *
 * To work around that, but still have more-or-less exact flags of which data was
 * interpolated, and which was not (it won't work in boundaries), we perform the query
 * two time, on cubes which have the same dimensions, but different aggregation levels.
 */
async function getVariableCube(project, variableId, aggregate, dices) {
    const form = project.forms.find(f => f.elements.find(v => v.id === variableId));
    const variable = form.elements.find(v => v.id === variableId);
    const dimensions = createVariableDimensions(project, form, variable, 'day');
    const rules = createVariableRules(variable);

    // Compute both pre and post aggregated cubes.
    const [preAggregatedCube, postAggregatedCube] = await Promise.all([
        getPreAggregatedCube(dimensions, project._id, variable.id, rules, aggregate, dices),
        getPostAggregatedCube(dimensions, project._id, variable.id, rules, aggregate, dices),
    ]);

    // Steal interpolation status from the preAggregatedCube.
    const length = postAggregatedCube.storedMeasures['main']._status.length;
    for (let i = 0; i < length; ++i) {
        const postAggregatedStatus = postAggregatedCube.storedMeasures['main']._status[i];
        const preAggregatedStatus = preAggregatedCube.storedMeasures['main']._status[i];

        postAggregatedCube.storedMeasures['main']._status[i] =
            (~4 & postAggregatedStatus) | (4 & preAggregatedStatus);
    }

    return postAggregatedCube;
}

/**
 * Compute cube built with the finest detail, and then aggregate to requested dimension attributes.
 * This will have good data, incomplete flags.
 * However, all data will be marked as interpolated.
 */
async function getPostAggregatedCube(dimensions, projectId, variableId, rules, aggregate, dices) {
    const cube = new Cube(dimensions);
    cube.createStoredMeasure('main', rules);

    await iterateCubes(projectId, variableId, rules, inputCube => {
        cube.hydrateFromCube(inputCube);
    });

    return drillDiceProject(cube, aggregate, dices);
}

/**
 * Compute cube built directly with the requested aggregation level.
 * The data will be wrong, because loading cubes will overwrite previously entered data.
 * However, we need this to approximate interpolation status of fields.
 */
async function getPreAggregatedCube(dimensions, projectId, variableId, rules, aggregate, dices) {
    let cube = drillDiceProject(new Cube(dimensions), aggregate, dices);
    cube.createStoredMeasure('main', rules);

    await iterateCubes(projectId, variableId, rules, inputCube => {
        cube.hydrateFromCube(inputCube);
    });

    return cube;
}

/** As the name implies, applies aggregate and dice operations to a cube */
function drillDiceProject(cube, aggregate, dices) {
    dices.forEach(dice => {
        if (dice.range) {
            cube = cube.diceRange(dice.id, dice.attribute, dice.range[0], dice.range[1]);
        } else {
            cube = cube.dice(dice.id, dice.attribute, dice.items);
        }
    });

    aggregate.forEach(agg => {
        cube = cube.drillUp(agg.id, agg.attribute);
    });

    return cube.project(aggregate.map(agg => agg.id));
}

module.exports = { getVariableCube };
