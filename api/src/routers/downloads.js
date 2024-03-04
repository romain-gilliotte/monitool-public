const Router = require('@koa/router');
const hash = require('object-hash');
const { ObjectId } = require('mongodb');

const router = new Router({ prefix: '/project/:projectId([0-9a-f]{24})' });

router.use('/project/:projectId', async (ctx, next) => {
    const { projectId } = ctx.params;

    if (await ctx.state.profile.isInvitedTo(projectId)) {
        await next();
    }
});

/** Logical framework */
router.get('/logical-frame/:logFrameId.:format(pdf):thumbnail(.png)?', async ctx => {
    const { projectId, logFrameId, thumbnail } = ctx.params;
    const { language, orientation, format } = validateDownloadParams(ctx, 'pdf');

    const projects = ctx.io.database.collection('project');
    const project = await projects.findOne(
        { _id: new ObjectId(projectId) },
        {
            projection: {
                logicalFrames: { $elemMatch: { id: logFrameId } },
                forms: 1,
            },
        }
    );

    if (project && project.logicalFrames[0]) {
        await sendFile(ctx, thumbnail, 'generate-logframe', {
            logFrame: project.logicalFrames[0],
            dataSources: project.forms,
            language,
            orientation,
            format,
        });
    }
});

/** Paper & Excel forms */
router.get('/data-source/:dataSourceId.:format(xlsx|pdf):thumbnail(.png)?', async ctx => {
    const { projectId, dataSourceId, thumbnail } = ctx.params;
    const { language, orientation, format } = validateDownloadParams(ctx, 'pdf');

    const projects = ctx.io.database.collection('project');
    const project = await projects.findOne(
        { _id: new ObjectId(projectId) },
        {
            projection: {
                start: 1,
                end: 1,
                entities: 1,
                forms: { $elemMatch: { id: dataSourceId } },
            },
        }
    );

    if (project && project.forms[0]) {
        await sendFile(ctx, thumbnail, 'generate-form', {
            start: project.start,
            end: project.end,
            sites: project.entities,
            dataSource: project.forms[0],
            language,
            orientation,
            format,
        });
    }
});

/** Render file containing all data entry up to a given date */
router.get('/export/:periodicity.:format(xlsx):thumbnail(.png)?', async ctx => {
    const { projectId, thumbnail } = ctx.params;
    const { language, format, periodicity } = validateDownloadParams(ctx, 'xlsx');

    // We need the project and last input id for the invalidation
    const objProjectId = new ObjectId(projectId);
    const project = await ctx.io.database
        .collection('project')
        .findOne({ _id: objProjectId }, { projection: { _id: 0, logicalFrames: 1, forms: 1 } });

    const sequenceIds = await ctx.io.database
        .collection('input_seq')
        .find({ projectIds: objProjectId }, { projection: { _id: true } })
        .map(s => s._id)
        .toArray();

    const lastInput = await ctx.io.database
        .collection('input')
        .find({ sequenceId: { $in: sequenceIds } }, { projection: { _id: 1 }, sort: [['_id', -1]] })
        .next();

    // Send reponse
    if (project && lastInput) {
        await sendFile(
            ctx,
            thumbnail,
            'generate-reporting',
            { projectId, periodicity, language },
            { project, lastInputId: lastInput._id.toHexString() }
        );
    }
});

function validateDownloadParams(ctx) {
    let { format, periodicity } = ctx.params;
    let { language, orientation } = ctx.request.query;
    const periodicities = [
        'day',
        'month_week_sat',
        'month_week_sun',
        'month_week_mon',
        'week_sat',
        'week_sun',
        'week_mon',
        'month',
        'quarter',
        'semester',
        'year',
    ];

    if (!['xlsx', 'pdf'].includes(format)) format = 'pdf';
    if (!['en', 'es', 'fr'].includes(language)) language = 'en';
    if (!['portrait', 'landscape'].includes(orientation)) orientation = 'portrait';
    if (!periodicities.includes(periodicity)) periodicity = 'month';

    return { format, language, orientation, periodicity };
}

async function sendFile(ctx, thumbnail, jobName, jobParams, invalidationParams = {}) {
    const forms = ctx.io.database.collection('forms');
    const fileId = hash({ ...jobParams, ...invalidationParams });

    let form = await forms.findOne({ _id: fileId });
    if (!form) {
        const job = await ctx.io.queue.add(
            jobName,
            { id: fileId, ...jobParams },
            {
                attempts: 1,
                removeOnComplete: false,
            }
        );
        await job.finished();
        await job.remove();

        form = await forms.findOne({ _id: fileId });
        if (!form) throw new Error('not found');
    }

    if (thumbnail) {
        ctx.response.type = 'image/png';
        ctx.response.body = form.thumbnail.buffer;
    } else {
        ctx.response.type = form.mimeType;
        ctx.response.body = form.content.buffer;
        ctx.response.attachment(form.filename);
    }
}

module.exports = router;
