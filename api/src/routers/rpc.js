const _ = require('lodash');
const Router = require('@koa/router');
const { ObjectId } = require('mongodb');

const router = new Router();

router.post('/rpc/clone-project', async ctx => {
    try {
        // Load old project
        const oldProject = await ctx.io.database.collection('project').findOne({
            _id: new ObjectId(ctx.request.body.projectId),
            owner: ctx.state.profile.email,
        });

        if (!oldProject) throw new Error('Not found');

        // Create new one.
        const newProject = _.cloneDeep(oldProject);
        delete newProject._id;
        newProject.name = `Copy of ${newProject.name}`;
        await ctx.io.database.collection('project').insertOne(newProject);
        await ctx.io.database.collection('input_seq').insertOne({ projectIds: [newProject._id] });

        // Update input sequences if requested.
        if (ctx.request.body.withInputs) {
            await ctx.io.database
                .collection('input_seq')
                .updateMany(
                    { projectIds: oldProject._id },
                    { $addToSet: { projectIds: newProject._id } }
                );

            await ctx.io.database
                .collection('input_seq')
                .insertOne({ projectIds: [oldProject._id] });
        }

        ctx.response.body = newProject;
    } catch (e) {
        if (e.message === 'Not found' || /must be .* 24 hex characters/.test(e.message))
            ctx.response.status = 400;
        else throw e;
    }
});

/** Get the data of the last data entry for all projects */
router.get('/rpc/get-last-inputs', async ctx => {
    const userEmail = ctx.state.profile.email;

    ctx.response.body = await ctx.io.database
        .collection('project')
        .aggregate([
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
            { $project: { _id: 1 } },
            {
                $lookup: {
                    from: 'input_seq',
                    localField: '_id',
                    foreignField: 'projectIds',
                    as: 'sequences',
                },
            },
            { $project: { sequenceId: '$sequences._id' } },
            { $unwind: '$sequenceId' },
            {
                $lookup: {
                    from: 'input',
                    localField: 'sequenceId',
                    foreignField: 'sequenceId',
                    as: 'inputs',
                },
            },
            { $project: { inputId: '$inputs._id' } },
            { $unwind: '$inputId' },
            { $group: { _id: '$_id', lastEntry: { $last: '$inputId' } } },
            // Those last 4 steps could be performed in the nodejs process.
            { $project: { value: [{ $toString: '$_id' }, { $toDate: '$lastEntry' }] } },
            { $group: { _id: null, value: { $push: '$value' } } },
            { $project: { value: { $arrayToObject: '$value' } } },
            { $replaceRoot: { newRoot: '$value' } },
        ])
        .next();
});

module.exports = router;
