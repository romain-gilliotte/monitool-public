const { getIndicatorCube } = require('./loader/indicator');

async function executeQuery(projectId, output, query) {
    let cube = await loadQueryCube(projectId, query);

    // Format response.
    if (output == 'report') {
        const report = cube.getNestedObject('main');
        while (cube.dimensions.length > 0) {
            cube = cube.removeDimension(cube.dimensionIds[cube.dimensions.length - 1]);
            mergeNestedObject(report, cube.getNestedObject('main'));
        }

        return report;
    }
    else if (output == 'flatArray') return cube.getFlatArray('main');
    else if (output == 'nestedArray') return cube.getNestedArray('main');
    else return cube.getNestedObject('main');
}

async function loadQueryCube(projectId, query) {
    const { formula, parameters } = query;
    let cube = await getIndicatorCube(projectId, formula, parameters);

    // Execute query (dice, keepDimensions, drillUp).
    const { dice, aggregate } = query;
    dice.forEach(dice => {
        if (dice.range) cube = cube.diceRange(dice.id, dice.attribute, dice.range[0], dice.range[1]);
        else cube = cube.dice(dice.id, dice.attribute, dice.items);
    });

    cube = cube.project(aggregate.map(agg => agg.id));
    aggregate.forEach(agg => {
        cube = cube.drillUp(agg.id, agg.attribute);
    });

    return cube;
}

function mergeNestedObject(base, totals) {
    if (typeof totals === 'number') {
        base._total = totals;
    }
    else {
        for (let key in base) {
            mergeNestedObject(base[key], totals[key]);
        }
    }
}

module.exports = { executeQuery };