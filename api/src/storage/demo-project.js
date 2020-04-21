const TimeSlot = require('timeslot-dag');
const demoProject = require('../../data/demo-project/project.json');
const demoInputs = require('../../data/demo-project/inputs.json');

async function insertDemoProject(email) {
    const dateFrom = new Date(demoProject.start + 'T00:00:00Z');
    const dateTo = new Date();
    const monthOffset =
        dateTo.getUTCMonth() - dateFrom.getUTCMonth()
        + 12 * (dateTo.getUTCFullYear() - dateFrom.getUTCFullYear())
        - 15; // we have 16 months of data in the demo project

    const project = offsetProject({ owner: email, ...demoProject }, monthOffset);
    await database.collection('project').insertOne(project);

    const sequence = { projectIds: [project._id] };
    await database.collection('input_seq').insertOne(sequence);

    const inputs = demoInputs.map(input => offsetInput({ sequenceId: sequence._id, ...input }, monthOffset));
    await database.collection('input').insertMany(inputs);
}

function offsetProject(project, offset) {
    return {
        ...project,
        start: offsetTimeSlot(project.start, offset),
        end: offsetTimeSlot(project.end, offset),
        logicalFrames: project.logicalFrames.map(lf => ({
            ...lf,
            start: offsetTimeSlot(lf.start, offset),
            end: offsetTimeSlot(lf.end, offset),
        })),
    };
}

function offsetInput(input, offset) {
    return {
        ...input,
        content: input.content.map(content => ({
            ...content,
            dimensions: content.dimensions.map(dim =>
                dim.id === 'time' ?
                    { ...dim, items: dim.items.map(item => offsetTimeSlot(item, offset)) } :
                    dim
            )
        }))
    }
}

function offsetTimeSlot(slot, months) {
    if (slot) {
        const ts = new TimeSlot(slot);
        const time = new Date(.5 * (ts.firstDate.getTime() + ts.lastDate.getTime()));
        time.setUTCMonth(time.getUTCMonth() + months);
        return TimeSlot.fromDate(time, ts.periodicity).value;
    }
    else {
        return slot;
    }
}


module.exports = insertDemoProject;