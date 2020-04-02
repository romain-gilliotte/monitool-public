const _ = require('lodash');
const { getIndicatorCube } = require('./loader/indicator');

async function executeQuery(projectId, output, query) {
    const cube = await loadQueryCube(projectId, query);

    // Format response.
    if (output == 'report') return cube.getNestedObject('main', true, true);
    else if (output == 'flatArray') return cube.getData('main');
    else if (output == 'nestedArray') return cube.getNestedArray('main');
    else return cube.getNestedObject('main');
}

async function loadQueryCube(projectId, query) {
    const { formula, parameters, aggregate, dice } = query;

    let cube = await getIndicatorCube(projectId, formula, parameters, aggregate, dice);

    // // Execute query (dice, keepDimensions, drillUp).
    // dice.forEach(dice => {
    //     if (dice.range) cube = cube.diceRange(dice.id, dice.attribute, dice.range[0], dice.range[1]);
    //     else cube = cube.dice(dice.id, dice.attribute, dice.items);
    // });

    // cube = cube.project(aggregate.map(agg => agg.id));
    // aggregate.forEach(agg => {
    //     cube = cube.drillUp(agg.id, agg.attribute);
    // });

    return cube;
}

module.exports = { executeQuery };