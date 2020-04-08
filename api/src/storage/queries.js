const { ObjectId } = require('mongodb');

/**
 * Why is this called twice every time?
 */
function trimProject(userEmail, record) {
    const { invitations, ...project } = record;

    console.log(project._id, project.owner, invitations)
    return project;
}

function listProjects(userEmail) {
    return database.collection('project')
        .aggregate([
            { $lookup: { from: 'invitation', localField: '_id', foreignField: 'projectId', as: 'invitations' } },
            {
                $match: {
                    $or: [
                        { owner: userEmail },
                        { invitations: { $elemMatch: { email: userEmail, accepted: true } } }
                    ]
                }
            }
        ])
        .map(project => trimProject(userEmail, project));
}

async function getProject(userEmail, projectId) {
    const project = await database
        .collection('project')
        .aggregate([
            { $match: { _id: new ObjectId(projectId) } },
            { $lookup: { from: 'invitation', localField: '_id', foreignField: 'projectId', as: 'invitations' } },
            {
                $match: {
                    $or: [
                        { owner: userEmail },
                        { invitations: { $elemMatch: { email: userEmail, accepted: true } } }
                    ]
                }
            }
        ])
        .next();

    if (!project)
        throw new Error('not found');

    return trimProject(userEmail, project);
}

function listWaitingInvitations(userEmail) {
    return database.collection('invitation').aggregate([
        { $match: { email: userEmail, accepted: false } },
        { $lookup: { from: 'project', localField: 'projectId', foreignField: '_id', as: 'project' } },
        { $unwind: '$project' },
        {
            $project: {
                'projectId': 1, 'email': 1, 'accepted': 1,
                'project.owner': 1, 'project.country': 1, 'project.name': 1, 'project.start': 1, 'project.end': 1
            }
        }
    ]);
}

function listProjectInvitations(userEmail, projectId) {
    return database.collection('invitation').aggregate([
        { $match: { projectId: new ObjectId(projectId) } },
        { $lookup: { from: 'project', localField: 'projectId', foreignField: '_id', as: 'project' } },
        { $unwind: '$project' },
        { $match: { $or: [{ email: userEmail }, { 'project.owner': userEmail }] } },
        { $project: { 'projectId': 1, 'email': 1, 'accepted': 1 } }
    ]);
}

async function getInvitation(userEmail, id) {
    return database.collection('invitation').aggregate([
        { $match: { _id: new ObjectId(id) } },
        { $lookup: { from: 'project', localField: 'projectId', foreignField: '_id', as: 'project' } },
        { $unwind: '$project' },
        { $match: { $or: [{ email: userEmail }, { 'project.owner': userEmail }] } },
        { $project: { 'projectId': 1, 'email': 1, 'accepted': 1 } }
    ]).next();
}


module.exports = { listProjects, getProject, listWaitingInvitations, listProjectInvitations, getInvitation };
