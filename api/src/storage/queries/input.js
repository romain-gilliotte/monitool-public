const { ObjectId } = require('mongodb');

async function getSequenceIds(io, projectId) {
    if (typeof projectId === 'string') {
        projectId = new ObjectId(projectId);
    }

    return io.database
        .collection('input_seq')
        .find({ projectIds: projectId }, { projection: { _id: true } })
        .map(s => s._id)
        .toArray();
}

async function getCurrentSequenceId(io, projectId) {
    if (typeof projectId === 'string') {
        projectId = new ObjectId(projectId);
    }

    const sequence = await io.database
        .collection('input_seq')
        .findOne({ projectIds: projectId }, { projection: { _id: true }, sort: [['_id', -1]] });

    return sequence._id;
}

module.exports = { getSequenceIds, getCurrentSequenceId };
