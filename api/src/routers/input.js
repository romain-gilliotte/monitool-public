const Router = require('@koa/router');
const ObjectId = require('mongodb').ObjectID;
const _ = require('lodash');
const JSONStream = require('JSONStream');
const validateBody = require('../middlewares/validate-body');
const { getProject } = require('../storage/queries/project');

const router = new Router();

router.get('/project/:id/input', async ctx => {
    // move this to a function somewhere.
    const sequenceIds = await ctx.io.database
        .collection('input_seq')
        .find({ projectIds: new ObjectId(ctx.params.id) }, { projection: { _id: true } })
        .map(s => s._id)
        .toArray();

    const filter = { sequenceId: { $in: sequenceIds } };
    if (ctx.query.cursor) filter._id = { $lt: new ObjectId(ctx.query.cursor) };

    const inputs = await ctx.io.database
        .collection('input')
        .find(filter, { limit: +ctx.query.limit, sort: [['_id', -1]] });

    ctx.response.type = 'application/json';
    ctx.response.body = inputs.pipe(JSONStream.stringify());
});

router.get('/project/:projectId/input/:id', async ctx => {
    const sequenceIds = await ctx.io.database
        .collection('input_seq')
        .find({ projectIds: new ObjectId(ctx.params.projectId) }, { projection: { _id: true } })
        .map(s => s._id)
        .toArray();

    ctx.response.body = await ctx.io.database.collection('input').findOne({
        _id: new ObjectId(ctx.params.id),
        sequenceId: { $in: sequenceIds },
    });
});

router.post('/project/:id/input', validateBody('input'), async ctx => {
    const email = ctx.state.profile.email;

    try {
        const project = await getProject(ctx.io, email, ctx.params.id);
        const invitation = await ctx.io.database
            .collection('invitation')
            .findOne({ projectId: project._id, email, accepted: true });

        // User is allowed if owner of the project, or if their is an invitation which contains
        // the data sources and sites that he is trying to write to.
        // FIXME do not allow data entry in the future
        if (project.owner !== email && !verifyInvitation(invitation, ctx.request.body))
            throw new Error('forbidden');

        // Save input on last sequence of the project.
        const sequence = await ctx.io.database
            .collection('input_seq')
            .findOne(
                { projectIds: new ObjectId(project._id) },
                { projection: { _id: true }, sort: [['_id', -1]] }
            );

        const input = {
            sequenceId: sequence._id,
            author: email,
            content: ctx.request.body.content.map(c => ({
                variableId: c.variableId,
                dimensions: c.dimensions,
                data: c.data.map(d => (typeof d === 'number' ? d : NaN)), // cast null to NaN
            })),
        };

        await ctx.io.database.collection('input').insertOne(input);
        ctx.response.body = input;

        // Clear reporting cache
        ctx.io.redis.del(`reporting:${project._id}`);
    } catch (e) {
        if (/forbidden/i.test(e.message)) ctx.response.status = 403;
        else if (/not found/i.test(e.message)) ctx.response.status = 404;
        else ctx.response.status = 500;
    }
});

router.put('/project/:projectId/input/:id', validateBody('input'), async ctx => {
    const email = ctx.state.profile.email;
    const input = await ctx.io.database
        .collection('input')
        .findOne({ _id: new ObjectId(ctx.params.id) });

    // The author of a data-entry has a grace period of 1h to make changes without
    // them going into the changelog.
    const age = new Date() - input._id.getTimestamp();
    if (input.author !== email && age > 60 * 60 * 1000) {
        throw new Error('forbidden');
    }
});

function verifyInvitation(invitation, input) {
    return (
        invitation &&
        input.content.every(content => {
            const dataSource = project.forms.find(ds =>
                ds.elements.some(v => v.id == content.variableId)
            );

            const location = content.dimensions.find(dim => dim.id === 'location');
            return (
                dataSource &&
                location &&
                invitation.dataEntry.dataSourceIds.includes(dataSource.id) &&
                _.difference(location.items, invitation.dataEntry.siteIds).length === 0
            );
        })
    );
}

module.exports = router;
