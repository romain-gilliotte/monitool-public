const { ObjectId } = require('mongodb');

function listWaitingInvitations(io, userEmail) {
    return io.database.collection('invitation').aggregate([
        { $match: { email: userEmail, accepted: false } },
        {
            $lookup: {
                from: 'project',
                localField: 'projectId',
                foreignField: '_id',
                as: 'project',
            },
        },
        { $unwind: '$project' },
        {
            $project: {
                projectId: 1,
                email: 1,
                accepted: 1,
                dataEntry: 1,
                'project.owner': 1,
                'project.country': 1,
                'project.name': 1,
                'project.start': 1,
                'project.end': 1,
            },
        },
    ]);
}

function listProjectInvitations(io, userEmail, projectId) {
    return io.database.collection('invitation').aggregate([
        { $match: { projectId: new ObjectId(projectId) } },
        {
            $lookup: {
                from: 'project',
                localField: 'projectId',
                foreignField: '_id',
                as: 'project',
            },
        },
        { $unwind: '$project' },
        { $match: { $or: [{ email: userEmail }, { 'project.owner': userEmail }] } },
        { $project: { projectId: 1, email: 1, accepted: 1, dataEntry: 1 } },
    ]);
}

async function getInvitation(io, userEmail, id) {
    return io.database
        .collection('invitation')
        .aggregate([
            { $match: { _id: new ObjectId(id) } },
            {
                $lookup: {
                    from: 'project',
                    localField: 'projectId',
                    foreignField: '_id',
                    as: 'project',
                },
            },
            { $unwind: '$project' },
            { $match: { $or: [{ email: userEmail }, { 'project.owner': userEmail }] } },
            { $project: { projectId: 1, email: 1, accepted: 1, dataEntry: 1 } },
        ])
        .next();
}

module.exports = { listWaitingInvitations, listProjectInvitations, getInvitation };
