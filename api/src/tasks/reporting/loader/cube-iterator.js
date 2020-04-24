const { Cube, GenericDimension, TimeDimension } = require('olap-in-memory');

/**
 * This module allows iterating inputs in the database.
 *
 * Alls calls to a given variables which happen in the same event-loop frame will be grouped
 * together to avoid hitting the database too much for the same data.
 *
 * More aggresive caching could be implemented.
 */

const waiting = {};

async function queueIterate(projectId, variableId, rules, itemHandler) {
    return new Promise(resolve => {
        const key = `${projectId}:${variableId}`;

        if (!waiting[key]) {
            const handler = runIterate.bind(null, key);
            waiting[key] = {
                projectId,
                variableId,
                rules,
                callers: [{ itemHandler, end: resolve }],
            };

            setTimeout(handler, 0);
        } else {
            waiting[key].callers.push({ itemHandler, end: resolve });
        }
    });
}

async function runIterate(key) {
    const { projectId, variableId, rules, callers } = waiting[key];
    delete waiting[key];

    const sequenceIds = await database
        .collection('input_seq')
        .find({ projectIds: projectId }, { projection: { _id: true } })
        .map(s => s._id)
        .toArray();

    await database
        .collection('input')
        .find(
            { sequenceId: { $in: sequenceIds }, 'content.variableId': variableId },
            { projection: { 'content.$': true }, sort: [['_id', 1]] }
        )
        .forEach(input => {
            input.content.forEach(content => {
                const dimensions = createInputDimensions(content);
                const cube = new Cube(dimensions);
                cube.createStoredMeasure('main', rules);
                cube.setData('main', content.data);

                callers.forEach(caller => caller.itemHandler(cube));
            });
        });

    callers.forEach(caller => caller.end());
}

/**
 * Create cube dimensions from an input in the database.
 *
 * We don't bother with child attributes, as the interface does not allow
 * aggregating sites or partition elements over time.
 *
 * It could however be done on "advanced mode" if we were smarter with building
 * the aggregation rules which are used for the input cubes.
 */
function createInputDimensions(content) {
    return content.dimensions.map(dim => {
        if (dim.id === 'time') {
            return new TimeDimension(
                'time',
                dim.attribute,
                dim.items[0],
                dim.items[dim.items.length - 1]
            );
        } else {
            return new GenericDimension(dim.id, dim.attribute, dim.items);
        }
    });
}

module.exports = queueIterate;
