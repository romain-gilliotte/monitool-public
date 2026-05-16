import Router from '@koa/router';
import { ObjectId } from 'mongodb';
import JSONStream from 'JSONStream';
import validateBody from '../middlewares/validate-body.js';
import { listWaitingInvitations, getInvitation } from '../storage/queries/invitations.js';
const router = new Router();

// liste mes invitations.
router.get('/invitation', async ctx => {
    const invitations = listWaitingInvitations(ctx.io, ctx.state.profile.email);

    ctx.response.type = 'application/json';
    ctx.response.body = invitations.stream().pipe(JSONStream.stringify());
});

// invite un nouvel utilisateur
router.post('/invitation', validateBody('invitation'), async ctx => {
    if (!(await ctx.state.profile.isOwnerOf(ctx.request.body.projectId))) {
        ctx.response.status = 403;
        return;
    }

    const newIvt = {
        ...ctx.request.body,
        projectId: new ObjectId(ctx.request.body.projectId),
    };

    await ctx.io.database.collection('invitation').insertOne(newIvt);
    ctx.response.body = newIvt;
});

// modifie / accepte une invitation
router.put('/invitation/:invitationId', validateBody('invitation'), async ctx => {
    const oldIvt = await getInvitation(ctx.io, ctx.state.profile.email, ctx.params.invitationId);
    const newIvt = {
        ...ctx.request.body,
        projectId: new ObjectId(ctx.request.body.projectId),
    };

    let isValid =
        oldIvt && oldIvt.projectId.equals(newIvt.projectId) && oldIvt.email === newIvt.email;
    if (oldIvt.email === ctx.state.profile.email)
        isValid = isValid && oldIvt.accepted === false && newIvt.accepted === true;

    if (!isValid) {
        ctx.response.status = 400;
        return;
    }

    await ctx.io.database.collection('invitation').replaceOne({ _id: oldIvt._id }, newIvt);

    ctx.response.body = newIvt;
});

// refuse une invitation ou deinvite un utilisateur
router.delete('/invitation/:invitationId', async ctx => {
    const oldIvt = await getInvitation(ctx.io, ctx.state.profile.email, ctx.params.invitationId);

    if (oldIvt) {
        await ctx.io.database.collection('invitation').deleteOne({ _id: oldIvt._id });
        ctx.response.status = 204;
    }
});

export default router;
