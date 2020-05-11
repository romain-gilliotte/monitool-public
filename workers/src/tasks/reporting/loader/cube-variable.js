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
async function getVariableCube(io, project, variableId, aggregate, dices) {
    const form = project.forms.find(f => f.elements.find(v => v.id === variableId));
    const variable = form.elements.find(v => v.id === variableId);
    const dimensions = createVariableDimensions(project, form, variable, 'day');
    const rules = createVariableRules(variable);

    // Compute both pre and post aggregated cubes.
    const [preAggregatedCube, postAggregatedCube] = await Promise.all([
        getPreAggregated(io, dimensions, project._id, variable.id, rules, aggregate, dices),
        getPostAggregated(io, dimensions, project._id, variable.id, rules, aggregate, dices),
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
 * This will have good data, however, all data will be marked as interpolated.
 *
 * Dicing beforehand improves performance a lot, but does not change the final result.
 * If we wanted, we could move the dice afterwards, and load the prefilled cube from from cache.
 */
async function getPostAggregated(io, dimensions, projectId, variableId, rules, aggregate, dices) {
    let cube = new Cube(dimensions);
    cube = cube.drillUp('time', 'all');
    cube = dice(cube, dices);

    cube.createStoredMeasure('main', rules);
    await iterateCubes(io, projectId, variableId, rules, inputCube => {
        const myAttribute = cube.getDimension('time').rootAttribute;
        const inputAttribute = inputCube.getDimension('time').rootAttribute;
        const attr = greatestCommonDivisor(inputAttribute, myAttribute);

        cube = cube.drillDown('time', attr);
        cube.hydrateFromCube(inputCube);
    });

    return projection(cube, aggregate);
}

/**
 * Compute cube built directly with the requested aggregation level.
 * The data will be wrong, because loading cubes will overwrite previously entered data.
 * However, we need this to approximate interpolation status of fields.
 */
async function getPreAggregated(io, dimensions, projectId, variableId, rules, aggregate, dices) {
    let cube = new Cube(dimensions);
    cube = dice(cube, dices);
    cube = projection(cube, aggregate);

    cube.createStoredMeasure('main', rules);
    await iterateCubes(io, projectId, variableId, rules, cube.hydrateFromCube.bind(cube));

    return cube;
}

function dice(cube, dices) {
    dices.forEach(dice => {
        if (dice.range) {
            cube = cube.diceRange(dice.id, dice.attribute, dice.range[0], dice.range[1]);
        } else {
            cube = cube.dice(dice.id, dice.attribute, dice.items);
        }
    });

    return cube;
}

function projection(cube, aggregate) {
    aggregate.forEach(agg => {
        const up = cube.getDimension(agg.id).attributes.includes(agg.attribute);

        if (up) cube = cube.drillUp(agg.id, agg.attribute);
        else cube = cube.drillDown(agg.id, agg.attribute);
    });

    return cube.project(aggregate.map(agg => agg.id));
}

/**
 * Given two time attributs, which one can accurately represent the data?
 * FIXME: should be moved to TimeSlot?
 */
function greatestCommonDivisor(attr1, attr2) {
    if (attr1 == attr2) {
        return attr1;
    }

    const periods = [
        ['day', 'month_week_sat', 'week_sat', 'month', 'quarter', 'semester', 'year', 'all'],
        ['day', 'month_week_sun', 'week_sun', 'month', 'quarter', 'semester', 'year', 'all'],
        ['day', 'month_week_mon', 'week_mon', 'month', 'quarter', 'semester', 'year', 'all'],
    ];

    for (let i = 0; i < 3; ++i) {
        const index1 = periods[i].indexOf(attr1);
        const index2 = periods[i].indexOf(attr2);
        if (index1 !== -1 && index2 !== -1) {
            return index1 < index2 ? attr1 : attr2;
        }
    }

    return 'day';
}

module.exports = { getVariableCube };
