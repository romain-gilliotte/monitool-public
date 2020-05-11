const { ObjectId } = require('mongodb');
const { InputOutput } = require('../../../io');

/**
 * @param {InputOutput} io
 * @param {string} projectId
 */
function loadProject(io, projectId) {
    // The names are needed for Excel file generation
    const filter = { _id: new ObjectId(projectId) };
    const options = {
        projection: {
            start: true,
            end: true,
            'entities.id': true,
            'entities.name': true,
            'groups.id': true,
            'groups.members': true,
            'forms.entities': true,
            'forms.periodicity': true,
            'forms.elements.id': true,
            'forms.elements.timeAgg': true,
            'forms.elements.geoAgg': true,
            'forms.elements.partitions.id': true,
            'forms.elements.partitions.aggregation': true,
            'forms.elements.partitions.elements.id': true,
            'forms.elements.partitions.elements.name': true,
            'forms.elements.partitions.groups.id': true,
            'forms.elements.partitions.groups.members': true,
        },
    };

    return io.database.collection('project').findOne(filter, options);
}

module.exports = { loadProject };
