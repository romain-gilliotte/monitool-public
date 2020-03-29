const { ObjectId } = require('mongodb');
const { Cube, TimeDimension, GenericDimension } = require('olap-in-memory');
const TimeSlot = require('timeslot-dag');

const PROJECT_PROJECTION = {
    'start': true,
    'end': true,
    'entities.id': true,
    'groups.id': true,
    'groups.members': true,
    'forms.start': true,
    'forms.end': true,
    'forms.entities': true,
    'forms.periodicity': true,
    // FIXME this projection is overfetching, we need only access to a single variable
    'forms.elements.id': true,
    'forms.elements.timeAgg': true,
    'forms.elements.geoAgg': true,
    'forms.elements.partitions.id': true,
    'forms.elements.partitions.aggregation': true,
    'forms.elements.partitions.elements.id': true,
    'forms.elements.partitions.groups.id': true,
    'forms.elements.partitions.groups.members': true,
};

/**
 * Build a variable cube from data entries
 * 
 * @param {string} projectId 
 * @param {string} variableId 
 */
async function getVariableCube(projectId, variableId) {
    const project = await database.collection('project').findOne(
        { _id: new ObjectId(projectId) },
        { projection: PROJECT_PROJECTION }
    );

    const form = project.forms.find(f => f.elements.find(v => v.id === variableId));
    const variable = form.elements.find(v => v.id === variableId);

    const dimensions = createVariableDimensions(project, form, variable, true);
    const aggregation = createVariableAggregation(variable);

    let cube = new Cube(dimensions);
    cube.createStoredMeasure('main', aggregation);

    await database.collection('input')
        .find(
            { 'projectId': new ObjectId(project._id), 'content.variableId': variable.id },
            {
                projection: { 'content.$': true },
                sort: [['_id', 1]] // most recent last, so that recent data overwrites old data.
            }
        )
        .forEach(input => {
            input.content.forEach(content => {
                // FIXME: aggregation rules are missing
                const dimensions = content.dimensions.map(dim => {
                    if (dim.id === 'time')
                        return new TimeDimension('time', dim.attribute, dim.items[0], dim.items[dim.items.length - 1]);
                    else
                        return new GenericDimension(dim.id, dim.attribute, dim.items);
                });

                const inputCube = new Cube(dimensions);
                inputCube.createStoredMeasure('main');
                inputCube.setFlatArray('main', content.data);

                cube.hydrateFromCube(inputCube);
            })
        });

    return cube;
}

/** Create Cube dimensions for a given variable. This is needed to build a cube */
function createVariableDimensions(project, form, variable, drillDownTime = false) {
    // Time dimension
    const periodicity = drillDownTime ? 'day' : form.periodicity;
    const start = [project.start, form.start].filter(a => a).sort().pop();
    const end = [project.end, form.end].sort().shift();
    const time = new TimeDimension(
        'time',
        periodicity,
        TimeSlot.fromDate(start, periodicity).value,
        TimeSlot.fromDate(end, periodicity).value
    );

    // location dimension
    const entity = new GenericDimension('location', 'entity', form.entities);
    project.groups.forEach(group => {
        entity.addChildAttribute(
            'entity',
            group.id,
            entityId => group.members.includes(entityId) ? 'in' : 'out'
        );
    });

    // partitions
    const partitions = variable.partitions.map(partition => {
        const dim = new GenericDimension(partition.id, 'element', partition.elements.map(e => e.id));

        partition.groups.forEach(group => {
            dim.addChildAttribute(
                'element',
                group.id,
                elementId => group.members.includes(elementId) ? 'in' : 'out'
            );
        })

        return dim;
    });

    return [time, entity, ...partitions];
}

/** Create aggregation rules for a given variable. This is needed to build a cube */
function createVariableAggregation(variable) {
    const aggregation = {};
    aggregation.location = variable.geoAgg;
    aggregation.time = variable.timeAgg;
    variable.partitions.forEach(partition => {
        aggregation[partition.id] = partition.aggregation;
    });

    return aggregation
}

module.exports = { getVariableCube };
