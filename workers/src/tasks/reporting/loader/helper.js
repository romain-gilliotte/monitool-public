const { TimeDimension, GenericDimension } = require('olap-in-memory');

/**
 * Create dimensions for a given variable
 */
function createVariableDimensions(project, form, variable, periodicity = null) {
    // Time dimension
    const time = new TimeDimension(
        'time',
        periodicity || form.periodicity,
        project.start,
        project.end
    );

    // location dimension
    const entity = new GenericDimension(
        'location',
        'entity',
        form.entities,
        'Site',
        item => project.entities.find(s => s.id == item).name
    );

    project.groups.forEach(group => {
        entity.addAttribute('entity', group.id, entityId =>
            group.members.includes(entityId) ? 'in' : 'out'
        );
    });

    // partitions
    const partitions = variable.partitions.map(partition => {
        const dim = new GenericDimension(
            partition.id,
            'element',
            partition.elements.map(e => e.id),
            partition.name,
            item => partition.elements.find(e => e.id == item).name
        );

        partition.groups.forEach(group => {
            dim.addAttribute('element', group.id, elementId =>
                group.members.includes(elementId) ? 'in' : 'out'
            );
        });

        return dim;
    });

    return [time, entity, ...partitions];
}

/**
 * Create aggregation rules for a given variable.
 */
function createVariableRules(variable) {
    const aggregation = {};
    aggregation.location = variable.geoAgg;
    aggregation.time = variable.timeAgg;
    variable.partitions.forEach(partition => {
        aggregation[partition.id] = partition.aggregation;
    });

    return aggregation;
}

module.exports = { createVariableDimensions, createVariableRules };
