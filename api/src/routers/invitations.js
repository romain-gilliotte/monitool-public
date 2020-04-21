const Router = require('@koa/router');
const ObjectId = require('mongodb').ObjectID;
const JSONStream = require('JSONStream');
const validateBody = require('../middlewares/validate-body');
const { listWaitingInvitations, getInvitation } = require('../storage/queries/invitations');

const router = new Router();

// liste mes invitations.
router.get('/invitation', async ctx => {
    const invitations = listWaitingInvitations(ctx.state.profile.email);

    ctx.response.type = 'application/json';
    ctx.response.body = invitations.pipe(JSONStream.stringify());
});

// invite un nouvel utilisateur
router.post('/invitation', validateBody('invitation'), async ctx => {
    if (!await ctx.state.profile.isOwnerOf(ctx.request.body.projectId)) {
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
router.put('/invitation/:id', validateBody('invitation'), async ctx => {
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


module.exports = router;