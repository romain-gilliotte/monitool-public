import Router from '@koa/router';
import hash from 'object-hash';
import { ObjectId } from 'mongodb';
const router = new Router({ prefix: '/project/:projectId' });

router.use('/project/:projectId', async (ctx, next) => {
    const { projectId } = ctx.params;

    if (await ctx.state.profile.isInvitedTo(projectId)) {
        await next();
    }
});

/** Logical framework */
router.get('/logical-frame/:logFrameId.pdf', ctx => sendLogFrame(ctx, false));
router.get('/logical-frame/:logFrameId.pdf.png', ctx => sendLogFrame(ctx, true));

async function sendLogFrame(ctx, thumbnail) {
    const { projectId, logFrameId } = ctx.params;
    const { language, orientation } = validateDownloadParams(ctx);

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
            format: 'pdf',
        });
    }
}

/** Paper & Excel forms */
router.get('/data-source/:dataSourceId.pdf', ctx => sendDataSource(ctx, 'pdf', false));
router.get('/data-source/:dataSourceId.pdf.png', ctx => sendDataSource(ctx, 'pdf', true));
router.get('/data-source/:dataSourceId.xlsx', ctx => sendDataSource(ctx, 'xlsx', false));
router.get('/data-source/:dataSourceId.xlsx.png', ctx => sendDataSource(ctx, 'xlsx', true));

async function sendDataSource(ctx, format, thumbnail) {
    const { projectId, dataSourceId } = ctx.params;
    const { language, orientation } = validateDownloadParams(ctx);

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
}

/** Render file containing all data entry up to a given date */
router.get('/export/:periodicity.xlsx', ctx => sendExport(ctx, false));
router.get('/export/:periodicity.xlsx.png', ctx => sendExport(ctx, true));

async function sendExport(ctx, thumbnail) {
    const { projectId } = ctx.params;
    const { language, periodicity } = validateDownloadParams(ctx);

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
}

function validateDownloadParams(ctx) {
    let { periodicity } = ctx.params;
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

    if (!['en', 'es', 'fr'].includes(language)) language = 'en';
    if (!['portrait', 'landscape'].includes(orientation)) orientation = 'portrait';
    if (!periodicities.includes(periodicity)) periodicity = 'month';

    return { language, orientation, periodicity };
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

export default router;
