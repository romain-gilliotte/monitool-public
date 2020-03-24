const Bull = require('bull');
const CubeLoader = require('./cube-loader');
const queue = new Bull('reporting');

const loader = new CubeLoader();

queue.process('compute-report', async job => {
    // Load cube.
    try {
        console.log(job.data)

        const { projectId, formula, parameters } = job.data;
        let cube = await loader.getIndicatorCube(projectId, formula, parameters);

        console.log(cube)

        // Execute query (dice, keepDimensions, drillUp).
        const { dice, aggregate } = job.data;
        dice.forEach(dice => {
            if (dice.range) cube = cube.diceRange(dice.id, dice.attribute, dice.range[0], dice.range[1]);
            else cube = cube.dice(dice.id, dice.attribute, dice.items);
        })

        cube = cube.project(aggregate.map(agg => agg.id));
        aggregate.forEach(agg => {
            // if (cube.getDimension(agg.id).attributes.includes(agg.attribute))
            cube = cube.drillUp(agg.id, agg.attribute);
            // else
            //     cube = cube.drillDown(agg.id, agg.attribute);
        });

        // Format response.
        const { output } = job.data;
        if (output == 'report') {
            const report = {};
            report.detail = cube.getNestedObject('main');
            report.total = cube.keepDimensions([]).getNestedObject('main')
            return report;
        }
        else if (output == 'flatArray') return cube.getFlatArray('main');
        else if (output == 'nestedArray') return cube.getNestedArray('main');
        else return cube.getNestedObject('main');
    }
    catch (e) {
        console.log(e);
        throw e;
    }
});

// queue.process('update-report-cache', async job => {
//     const input = job.data;

//     input.content.forEach(content => {
//         // FIXME
//         const dimensions = content.dimensions.map(dim => {
//             if (dim.id === 'time') {
//                 return new TimeDimension('time', dim.attribute, dim.items[0], dim.items[dim.items.length - 1]);
//             }
//             else {
//                 return new GenericDimension(dim.id, dim.attribute, dim.items);
//             }
//         });

//         const inputCube = new Cube(dimensions);
//         inputCube.createStoredMeasure('main');
//         inputCube.setFlatArray('main', content.data);

//         cube.hydrateFromCube(inputCube);
//     })

// })