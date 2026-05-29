import { createHash } from 'node:crypto';
import Router from '@koa/router';
import multer from '@koa/multer';
import { ObjectId } from 'mongodb';
import JSONStream from 'JSONStream';
import { Transform, pipeline } from 'node:stream';
import isInvited from '../middlewares/is-invited.js';
const router = new Router();

router.get('/project/:projectId/upload', isInvited, async ctx => {
    const collection = ctx.io.database.collection('input_upload');
    const filter = { projectId: new ObjectId(ctx.params.projectId) };
    const projection = { 'original.data': 0, 'thumbnail.data': 0, 'processed.data': 0 };
    const forms = collection.find(
        { ...filter, status: { $nin: ['done', 'hidden'] } },
        { projection, sort: [['_id', -1]] }
    );

    ctx.response.type = 'application/json';
    ctx.response.body = forms.stream().pipe(JSONStream.stringify());
});

router.post('/project/:projectId/upload-sse', isInvited, async ctx => {
    if (!ctx.request.accepts('text/event-stream')) {
        ctx.response.status = 406;
        return;
    }

    const collection = ctx.io.database.collection('input_upload');
    const options = { batchSize: 1, fullDocument: 'updateLookup' };
    const wpipeline = [
        { $match: { 'fullDocument.projectId': new ObjectId(ctx.params.projectId) } },
        {
            $project: {
                'fullDocument.original.data': 0,
                'fullDocument.thumbnail.data': 0,
                'fullDocument.processed.data': 0,
                'updateDescription.updatedFields.thumbnail.data': 0,
                'updateDescription.updatedFields.processed.data': 0,
            },
        },
    ];

    const changeLog = collection.watch(wpipeline, options);
    const transform = mongoWatchToEventStream();

    // Own the raw response instead of handing Koa a stream body: the client holds
    // this SSE stream open until it leaves the page, so the eventual disconnect
    // reaches us as a premature close on res. Piping res here (rather than letting
    // Koa do it) keeps that expected event in this callback — where we just close
    // the change stream — instead of bubbling it to the app-level error handler.
    ctx.status = 200;
    ctx.response.type = 'text/event-stream';
    ctx.respond = false;
    pipeline(changeLog.stream(), transform, ctx.res, () => void changeLog.close());
});

router.get('/project/:projectId/upload-history', isInvited, async ctx => {
    const collection = ctx.io.database.collection('input_upload');
    const projection = { 'original.data': 0, 'thumbnail.data': 0, 'processed.data': 0 };
    const filter = { projectId: new ObjectId(ctx.params.projectId), status: 'done' };
    if (ctx.query.before) {
        filter._id = { $lt: new ObjectId(ctx.query.before) };
    }

    const forms = collection.find(filter, {
        projection,
        sort: [['_id', -1]],
        limit: +ctx.query.limit,
    });

    ctx.response.type = 'application/json';
    ctx.response.body = forms.stream().pipe(JSONStream.stringify());
});

router.get('/project/:projectId/upload/:uploadId', isInvited, async ctx => {
    ctx.response.body = await ctx.io.database
        .collection('input_upload')
        .findOne(
            {
                _id: new ObjectId(ctx.params.uploadId),
                projectId: new ObjectId(ctx.params.projectId),
            },
            { projection: { 'original.data': 0, 'thumbnail.data': 0, 'processed.data': 0 } }
        );
});

router.get(
    '/project/:projectId/upload/:uploadId/:name',
    isInvited,
    async ctx => {
        if (!['original', 'processed', 'thumbnail'].includes(ctx.params.name)) {
            ctx.response.status = 404;
            return;
        }

        const upload = await ctx.io.database
            .collection('input_upload')
            .findOne(
                {
                    _id: new ObjectId(ctx.params.uploadId),
                    projectId: new ObjectId(ctx.params.projectId),
                },
                { [ctx.params.name]: 1 }
            );

        if (upload[ctx.params.name]) {
            ctx.response.type = upload[ctx.params.name].mimeType;
            ctx.response.body = upload[ctx.params.name].data.buffer;
            if (upload[ctx.params.name].name) {
                ctx.response.attachment(upload[ctx.params.name].name, { type: 'inline' });
            }
        }
    }
);

router.post('/project/:projectId/upload', multer().single('file'), isInvited, async ctx => {
    const file = ctx.request.file;

    try {
        const insertion = await ctx.io.database.collection('input_upload').insertOne({
            status: 'pending_processing',
            projectId: new ObjectId(ctx.params.projectId),
            original: {
                sha1: createHash('sha1').update(file.buffer).digest(),
                name: file.originalname,
                size: file.size,
                mimeType: file.mimetype,
                data: file.buffer,
            },
        });

        await ctx.io.queue.add(
            'process-upload',
            { uploadId: insertion.insertedId },
            { attempts: 1, removeOnComplete: true }
        );
    } catch (e) {
        if (!e.message.includes('duplicate key error')) {
            throw e;
        }
    }

    ctx.response.status = 204;
});

router.patch('/project/:projectId/upload/:uploadId', isInvited, async ctx => {
    await ctx.io.database.collection('input_upload').updateOne(
        {
            _id: new ObjectId(ctx.params.uploadId),
            projectId: new ObjectId(ctx.params.projectId),
        },
        { $set: { status: 'done' } }
    );

    ctx.response.status = 204;
});

router.delete('/project/:projectId/upload/:uploadId', isInvited, async ctx => {
    await ctx.io.database.collection('input_upload').deleteOne({
        _id: new ObjectId(ctx.params.uploadId),
        projectId: new ObjectId(ctx.params.projectId),
    });

    ctx.response.status = 204;
});

export default router;
function mongoWatchToEventStream() {
    return new Transform({
        objectMode: true,
        highWaterMark: 1,
        transform: (chunk, encoding, callback) => {
            if (['insert', 'update'].includes(chunk.operationType)) {
                let action = { type: chunk.operationType, id: chunk.documentKey._id };

                if (action.type === 'insert') {
                    action.document = chunk.fullDocument;
                } else if (action.type === 'update') {
                    action.update = chunk.updateDescription.updatedFields;
                }

                callback(null, `data: ${JSON.stringify(action)}\n\n`);
            }
        },
    });
}
