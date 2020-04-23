const { ObjectId } = require('mongodb');
const TimeSlot = require('timeslot-dag');
const demoProject = require('../../../data/demo-project/project.json');
const demoInputs = require('../../../data/demo-project/inputs.json');

function listProjects(userEmail, projection = null) {
    const pipeline = [
        {
            $lookup: {
                from: 'invitation',
                localField: '_id',
                foreignField: 'projectId',
                as: 'invitations',
            },
        },
        {
            $match: {
                $or: [
                    { owner: userEmail },
                    { invitations: { $elemMatch: { email: userEmail, accepted: true } } },
                ],
            },
        },
        { $project: { invitations: false } },
        ...(projection ? [{ $project: projection }] : []),
    ];

    return database.collection('project').aggregate(pipeline);
}

async function getProject(userEmail, projectId, projection = null) {
    const pipeline = [
        { $match: { _id: new ObjectId(projectId) } },
        {
            $lookup: {
                from: 'invitation',
                localField: '_id',
                foreignField: 'projectId',
                as: 'invitations',
            },
        },
        {
            $match: {
                $or: [
                    { owner: userEmail },
                    { invitations: { $elemMatch: { email: userEmail, accepted: true } } },
                ],
            },
        },
        { $project: { invitations: false } },
        ...(projection ? [{ $project: projection }] : []),
    ];

    const project = await database.collection('project').aggregate(pipeline).next();
    if (!project) throw new Error('not found');

    return project;
}

async function insertDemoProject(email) {
    function _offsetProject(project, offset) {
        return {
            ...project,
            start: _offsetTimeSlot(project.start, offset),
            end: _offsetTimeSlot(project.end, offset),
            logicalFrames: project.logicalFrames.map(lf => ({
                ...lf,
                start: _offsetTimeSlot(lf.start, offset),
                end: _offsetTimeSlot(lf.end, offset),
            })),
        };
    }

    function _offsetInput(input, offset) {
        return {
            ...input,
            content: input.content.map(content => ({
                ...content,
                dimensions: content.dimensions.map(dim =>
                    dim.id === 'time'
                        ? { ...dim, items: dim.items.map(item => _offsetTimeSlot(item, offset)) }
                        : dim
                ),
            })),
        };
    }

    function _offsetTimeSlot(slot, months) {
        if (slot) {
            const ts = new TimeSlot(slot);
            const time = new Date(0.5 * (ts.firstDate.getTime() + ts.lastDate.getTime()));
            time.setUTCMonth(time.getUTCMonth() + months);
            return TimeSlot.fromDate(time, ts.periodicity).value;
        } else {
            return slot;
        }
    }

    const dateFrom = new Date(demoProject.start + 'T00:00:00Z');
    const dateTo = new Date();
    const monthOffset =
        dateTo.getUTCMonth() -
        dateFrom.getUTCMonth() +
        12 * (dateTo.getUTCFullYear() - dateFrom.getUTCFullYear()) -
        15; // we have 16 months of data in the demo project

    const project = _offsetProject({ owner: email, ...demoProject }, monthOffset);
    await database.collection('project').insertOne(project);

    const sequence = { projectIds: [project._id] };
    await database.collection('input_seq').insertOne(sequence);

    const inputs = demoInputs.map(input =>
        _offsetInput({ sequenceId: sequence._id, ...input }, monthOffset)
    );
    await database.collection('input').insertMany(inputs);
}

module.exports = { listProjects, getProject, insertDemoProject };
