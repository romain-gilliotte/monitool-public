const Router = require('koa-router');
const ObjectId = require('mongodb').ObjectID;
const JSONStream = require('JSONStream');
const validateBody = require('../middlewares/validate-body');
const { listProjectInvitations, listWaitingInvitations, getInvitation } = require('../storage/queries');

const validator = validateBody(require('../storage/validator/invitation'))

const router = new Router();

// liste mes invitations.
router.get('/resources/invitation', async ctx => {
    const invitations = listWaitingInvitations(ctx.state.profile.email);

    ctx.response.type = 'application/json';
    ctx.response.body = invitations.pipe(JSONStream.stringify());
});

router.get('/resources/project/:id/invitation', async ctx => {
    const invitations = listProjectInvitations(ctx.state.profile.email, ctx.params.id);

    ctx.response.type = 'application/json';
    ctx.response.body = invitations.pipe(JSONStream.stringify());
})

// invite un nouvel utilisateur
router.post('/resources/invitation', validator, async ctx => {

});


// modifie / accepte une invitation
router.put('/resources/invitation/:id', validator, async ctx => {
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
router.delete('/resources/invitation/:id', async ctx => {
    const oldIvt = await getInvitation(ctx.state.profile.email, ctx.params.id);

    if (oldIvt) {
        await database.collection('invitation').deleteOne({ _id: oldIvt._id });
        ctx.response.status = 204;
    }
});


// liste les utilisateurs d'un projet
router.get('/resources/project/:projectId/invitation', async ctx => {
    if (this.state.profile.ownsProject(ctx.params.projectId)) {
        const invitations = database.collection('invitation').find({
            projectId: new ObjectId(ctx.params.projectId)
        });

        ctx.response.type = 'application/json';
        ctx.response.body = invitations.pipe(JSONStream.stringify());
    }
});


module.exports = router;