const Router = require('@koa/router');
const { ObjectId } = require('mongodb');
const _ = require('lodash');
const JSONStream = require('JSONStream');
const validateBody = require('../middlewares/validate-body');
const { getProject } = require('../storage/queries/project');
const { getSequenceIds, getCurrentSequenceId } = require('../storage/queries/input');

const router = new Router();

router.get('/project/:id/input', async ctx => {
    const filter = { sequenceId: { $in: await getSequenceIds(ctx.io, ctx.params.id) } };
    if (ctx.query.cursor) {
        filter._id = { $lt: new ObjectId(ctx.query.cursor) };
    }

    const inputs = await ctx.io.database.collection('input').find(filter, {
        projection: { sequenceId: 0 },
        limit: +ctx.query.limit,
        sort: [['_id', -1]],
    });

    ctx.response.type = 'application/json';
    ctx.response.body = inputs.pipe(JSONStream.stringify());
});

router.get('/project/:projectId/input/:id', async ctx => {
    ctx.response.body = await ctx.io.database.collection('input').findOne(
        {
            _id: new ObjectId(ctx.params.id),
            sequenceId: { $in: await getSequenceIds(ctx.io, ctx.params.projectId) },
        },
        { projection: { sequenceId: 0 } }
    );
});

router.post('/project/:id/input', validateBody('input'), async ctx => {
    const inputs = ctx.io.database.collection('input');
    const invitations = ctx.io.database.collection('invitation');
    const email = ctx.state.profile.email;

    try {
        const project = await getProject(ctx.io, email, ctx.params.id);
        const invitation = await invitations.findOne({
            projectId: project._id,
            email,
            accepted: true,
        });

        if (project.owner === email || verifyInvitation(invitation, ctx.request.body)) {
            const input = {
                sequenceId: await getCurrentSequenceId(ctx.io, ctx.params.id),
                author: email,
                content: ctx.request.body.content.map(c => ({
                    variableId: c.variableId,
                    dimensions: c.dimensions,
                    data: c.data.map(d => (typeof d === 'number' ? d : NaN)), // cast null to NaN
                })),
            };

            await inputs.insertOne(input);
            ctx.io.redis.del(`reporting:${project._id}`); // reporting cache

            delete input.sequenceId;
            ctx.response.body = input;
        } else {
            throw new Error('forbidden');
        }
    } catch (e) {
        if (/forbidden/i.test(e.message)) ctx.response.status = 403;
        else if (/not found/i.test(e.message)) ctx.response.status = 404;
        else throw e;
    }
});

router.put('/project/:projectId/input/:id', validateBody('input'), async ctx => {
    const inputs = ctx.io.database.collection('input');

    try {
        const input = await inputs.findOne({ _id: new ObjectId(ctx.params.id) });
        const age = new Date() - input._id.getTimestamp();

        // The author can edit for 1 hour
        if (input.author === ctx.state.profile.email && age < 60 * 60 * 1000) {
            await inputs.updateOne(
                { _id: input._id },
                { $set: { content: ctx.request.body.content } }
            );

            ctx.io.redis.del(`reporting:${ctx.params.projectId}`); // reporting cache

            ctx.response.body = { ...input, content: ctx.request.body.content };
        } else {
            throw new Error('forbidden');
        }
    } catch (e) {
        if (/forbidden/i.test(e.message)) ctx.response.status = 403;
        else if (/not found/i.test(e.message)) ctx.response.status = 404;
        else throw e;
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
