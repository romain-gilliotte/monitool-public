const _ = require('lodash');
const { GenericDimension } = require('olap-in-memory');
const { getIndicatorCube } = require('./loader/indicator');

async function executeQuery(projectId, output, query) {
    const cube = await loadQueryCube(projectId, query);

    // Format response.
    if (output == 'report') {
        if (query.aggregate.length === 0) {
            return cube.getNestedObject('main')
        }
        else {
            const report = {};

            for (let j = 0; j < 2 ** cube.dimensions.length; ++j) {
                const dimensionIds = cube.dimensionIds.slice();

                let subCube = cube;
                for (let i = 0; i < cube.dimensions.length; ++i) {
                    const include = j & (1 << i);
                    if (include !== 0) {
                        dimensionIds[i] = `total_${i}`;
                        subCube = subCube
                            .removeDimension(cube.dimensions[i].id)
                            .addDimension(new GenericDimension(`total_${i}`, 'none', ['_total']))
                    }
                }

                const subReport = subCube.reorderDimensions(dimensionIds).getNestedObject('main');
                _.merge(report, subReport);
            }

            return report;
        }
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

module.exports = { executeQuery };