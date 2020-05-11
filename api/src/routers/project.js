const Ajv = require('ajv');
const crypto = require('crypto');
const jiff = require('jiff');
const Router = require('@koa/router');
const ObjectId = require('mongodb').ObjectID;
const JSONStream = require('JSONStream');
const validateBody = require('../middlewares/validate-body');
const { listProjects, getProject } = require('../storage/queries/project');
const { listProjectInvitations } = require('../storage/queries/invitations');
const reportingSchema = require('../storage/schema/reporting');

const router = new Router();

router.get('/project', async ctx => {
    const projects = listProjects(ctx.io, ctx.state.profile.email);

    ctx.response.type = 'application/json';
    ctx.response.body = projects.pipe(JSONStream.stringify());
});

/**
 * Retrieve one project
 */
router.get('/project/:id', async ctx => {
    try {
        ctx.response.body = await getProject(ctx.io, ctx.state.profile.email, ctx.params.id);
    } catch (e) {
        if (e.message === 'not found' || /must be .* 24 hex characters/.test(e.message)) {
            ctx.response.status = 404;
        } else throw e;
    }
});

/**
 * Create project
 */
router.post('/project', validateBody('project'), async ctx => {
    const project = ctx.request.body;

    if (project.owner !== ctx.state.profile.email) {
        ctx.response.status = 403;
        return;
    }

    await ctx.io.database.collection('project').insertOne(project);
    await ctx.io.database.collection('input_seq').insertOne({ projectIds: [project._id] });

    ctx.response.body = project;
});

/**
 * Save an existing project
 */
router.put('/project/:id', validateBody('project'), async ctx => {
    const newProject = ctx.request.body;

    // Update ctx.io.database and fetch previous version.
    const filter = { _id: new ObjectId(ctx.params.id), owner: ctx.state.profile.email };
    const projection = { projection: { _id: false } };
    const { value: oldProject } = await ctx.io.database
        .collection('project')
        .findOneAndReplace(filter, newProject, projection);

    if (!oldProject) {
        ctx.response.status = 404;
        return;
    }

    // Insert patch in ctx.io.database.
    await ctx.io.database.collection('revision').insertOne({
        projectId: new ObjectId(ctx.params.id),
        user: ctx.state.profile.email,
        time: new Date(),
        backwards: jiff.diff(newProject, oldProject, {
            invertible: false,
            makeContext: () => undefined,
        }),
    });

    // Clear reporting cache
    ctx.io.redis.del(`reporting:${ctx.params.id}`);

    ctx.response.body = { _id: ctx.params.id, ...newProject };
});

/**
 * Retrieve project revisions
 */
router.get('/project/:id/revisions', async ctx => {
    if (await ctx.state.profile.isOwnerOf(ctx.params.id)) {
        const revisions = ctx.io.database.collection('revision').find(
            { projectId: new ObjectId(ctx.params.id) },
            {
                skip: +ctx.request.query.offset || 0,
                limit: +ctx.request.query.limit || 10,
                sort: [['time', -1]],
                projection: { projectId: false, _id: false },
            }
        );

        ctx.response.type = 'application/json';
        ctx.response.body = revisions.pipe(JSONStream.stringify());
    }
});

// liste les invitations du projet
// si pas owner, ne contiendra que celle de l'utilisateur.
router.get('/project/:id/invitation', async ctx => {
    const invitations = listProjectInvitations(ctx.io, ctx.state.profile.email, ctx.params.id);

    ctx.response.type = 'application/json';
    ctx.response.body = invitations.pipe(JSONStream.stringify());
});

router.get('/project/:id/user', async ctx => {
    const project = await getProject(ctx.io, ctx.state.profile.email, ctx.params.id, { owner: 1 });

    if (project) {
        const invitations = await ctx.io.database
            .collection('invitation')
            .find(
                {
                    projectId: new ObjectId(ctx.params.id),
                    accepted: true,
                },
                { email: 1 }
            )
            .toArray();

        const emails = [project.owner, ...invitations.map(i => i.email)];
        const users = ctx.io.database.collection('user').find({ _id: { $in: emails } });

        ctx.response.type = 'application/json';
        ctx.response.body = users.pipe(JSONStream.stringify());
    }
});

router.get('/project/:id/report/:query([-_=a-z0-9]+)', async ctx => {
    const projectId = ctx.params.id;
    if (!(await ctx.state.profile.isInvitedTo(projectId))) {
        ctx.response.status = 404;
        return;
    }

    const sha1 = crypto.createHash('sha1').update(ctx.params.query).digest('hex');
    let result = await ctx.io.redis.hget(`reporting:${projectId}`, sha1);
    if (!result) {
        try {
            // Decode and validate query
            const ajv = new Ajv();
            const b64query = ctx.params.query.replace('-', '+').replace('_', '/');
            const query = JSON.parse(Buffer.from(b64query, 'base64').toString());
            if (!ajv.validate(reportingSchema, query)) {
                throw new Error('validation failed');
            }

            // Submit reporting job to workers
            const jobParams = { ...query, projectId };
            const job = await ctx.io.queue.add('compute-report', jobParams, {
                attempts: 1,
                removeOnComplete: true,
            });
            result = await job.finished();

            // Update cache
            await ctx.io.redis.hset(`reporting:${projectId}`, sha1, result);
        } catch (e) {
            ctx.response.status = 400;
            return;
        }
    }

    const { payload, mimeType, filename } = JSON.parse(result);
    ctx.response.body = Buffer.from(payload, 'base64');
    ctx.response.type = mimeType;
    ctx.response.set('content-encoding', 'gzip');
    if (filename) {
        ctx.response.attachment(filename, { type: 'inline' });
    }
});

module.exports = router;
