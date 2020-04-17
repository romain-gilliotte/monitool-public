const Router = require('@koa/router');
const ObjectId = require('mongodb').ObjectID;
const JSONStream = require('JSONStream');
const validateBody = require('../middlewares/validate-body');
const { listWaitingInvitations, getInvitation, getProject } = require('../storage/queries');

const validator = validateBody(require('../storage/validator/invitation'))

const router = new Router();

// liste mes invitations.
router.get('/invitation', async ctx => {
    const invitations = listWaitingInvitations(ctx.state.profile.email);

    ctx.response.type = 'application/json';
    ctx.response.body = invitations.pipe(JSONStream.stringify());
});

// invite un nouvel utilisateur
router.post('/invitation', validator, async ctx => {
    if (!await ctx.state.profile.ownsProject(ctx.request.body.projectId)) {
        ctx.response.status = 403;
        return;
    }

    const newIvt = {
        ...ctx.request.body,
        projectId: new ObjectId(ctx.request.body.projectId)
    };

    await database.collection('invitation').insertOne(newIvt);
    ctx.response.body = newIvt;
});

// modifie / accepte une invitation
router.put('/invitation/:id', validator, async ctx => {
    const oldIvt = await getInvitation(ctx.state.profile.email, ctx.params.id);
    const newIvt = {
        ...ctx.request.body,
        projectId: new ObjectId(ctx.request.body.projectId)
    };

    let isValid = oldIvt && oldIvt.projectId.equals(newIvt.projectId) && oldIvt.email === newIvt.email
    if (oldIvt.email === ctx.state.profile.email)
        isValid = isValid && oldIvt.accepted === false && newIvt.accepted === true;

    if (!isValid) {
        ctx.response.status = 400;
        return;
    }

    await database.collection('invitation').replaceOne({ _id: oldIvt._id }, newIvt);

    ctx.response.body = newIvt;
});

// refuse une invitation ou deinvite un utilisateur
router.delete('/invitation/:id', async ctx => {
    const oldIvt = await getInvitation(ctx.state.profile.email, ctx.params.id);

    if (oldIvt) {
        await database.collection('invitation').deleteOne({ _id: oldIvt._id });
        ctx.response.status = 204;
    }
});

router.get('/project/:id/user', async ctx => {
    const project = await getProject(ctx.state.profile.email, ctx.params.id, { owner: 1 });

    if (project) {
        const invitations = await database.collection('invitation').find({
            projectId: new ObjectId(ctx.params.id),
            accepted: true,
        }, { email: 1 }).toArray();

        const emails = [project.owner, ...invitations.map(i => i.email)];
        const users = database.collection('user').find({ _id: { $in: emails } });

        ctx.response.type = 'application/json';
        ctx.response.body = users.pipe(JSONStream.stringify());
    }
});

module.exports = router;