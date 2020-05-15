const Router = require('@koa/router');
const ObjectId = require('mongodb').ObjectID;
const _ = require('lodash');
const validateBody = require('../middlewares/validate-body');
const { getProject } = require('../storage/queries/project');

const router = new Router();

router.post('/project/:id/input', validateBody('input'), async ctx => {
    let project;
    try {
        project = await getProject(ctx.io, ctx.state.profile.email, ctx.params.id);
    } catch (e) {
        ctx.response.status = 404;
    }

    let allowed;
    if (!project) allowed = false;
    else if (project.owner === ctx.state.profile.email) allowed = true;
    else {
        const invitation = await ctx.io.database
            .collection('invitation')
            .findOne({ projectId: project._id, email: ctx.state.profile.email, accepted: true });

        allowed =
            invitation &&
            ctx.request.body.content.every(content => {
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
            });
    }

    // FIXME do not allow data entry in the future

    if (allowed) {
        // Save input on last sequence of the project.
        const sequence = await ctx.io.database
            .collection('input_seq')
            .findOne(
                { projectIds: new ObjectId(project._id) },
                { projection: { _id: true }, sort: [['_id', -1]] }
            );

        const input = {
            sequenceId: sequence._id,
            content: ctx.request.body.content.map(c => ({
                variableId: c.variableId,
                dimensions: c.dimensions,
                data: c.data.map(d => (typeof d === 'number' ? d : NaN)), // cast null to NaN
            })),
        };

        await ctx.io.database.collection('input').insertOne(input);

        // Clear reporting cache
        ctx.io.redis.del(`reporting:${project._id}`);

        delete input._id;
        delete input.sequenceId;
        ctx.response.body = input;
    } else {
        ctx.response.status = 403;
    }
});

module.exports = router;
