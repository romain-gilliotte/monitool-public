const { Hash } = require('crypto');
const { readFile } = require('fs');
const { promisify } = require('util');
const Router = require('@koa/router');
const multer = require('@koa/multer');
const { ObjectId } = require('mongodb');
const JSONStream = require('JSONStream');
const { Transform, pipeline } = require('stream');

const router = new Router();

router.get('/project/:id/upload', async ctx => {
    const collection = ctx.io.database.collection('input_upload');

    if (ctx.request.accepts('application/json')) {
        const filter = { projectId: new ObjectId(ctx.params.id) };
        const projection = { 'original.data': 0, 'thumbnail.data': 0, 'reprojected.data': 0 };
        const forms = collection.find(
            { ...filter, status: { $ne: 'done' } },
            { projection, sort: [['_id', -1]] }
        );

        ctx.response.type = 'application/json';
        ctx.response.body = forms.pipe(JSONStream.stringify());
    } else if (ctx.request.accepts('text/event-stream')) {
        const options = { batchSize: 1, fullDocument: 'updateLookup' };
        const wpipeline = [
            { $match: { 'fullDocument.projectId': new ObjectId(ctx.params.id) } },
            {
                $project: {
                    'fullDocument.original.data': 0,
                    'fullDocument.thumbnail.data': 0,
                    'fullDocument.reprojected.data': 0,
                    'updateDescription.updatedFields.thumbnail.data': 0,
                    'updateDescription.updatedFields.reprojected.data': 0,
                },
            },
        ];

        const changeLog = collection.watch(wpipeline, options);
        const transform = new Transform({
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

        // Close changelog on all errors (most notably, client disconnect when leaving the page).
        pipeline(changeLog, transform, error => void changeLog.close());

        ctx.response.type = 'text/event-stream';
        ctx.response.body = transform;
    } else {
        ctx.response.status = 406;
    }
});

router.get('/project/:projectId/upload/:id', async ctx => {
    ctx.response.body = await ctx.io.database.collection('input_upload').findOne(
        { _id: new ObjectId(ctx.params.id), projectId: new ObjectId(ctx.params.projectId) },
        {
            'original.data': 0,
            'reprojected.data': 0,
        }
    );
});

router.get('/project/:projectId/upload/:id/:name(original|reprojected|thumbnail)', async ctx => {
    const upload = await ctx.io.database
        .collection('input_upload')
        .findOne(
            { _id: new ObjectId(ctx.params.id), projectId: new ObjectId(ctx.params.projectId) },
            { [ctx.params.name]: 1 }
        );

    if (upload[ctx.params.name]) {
        ctx.response.type = upload[ctx.params.name].mimeType;
        ctx.response.body = upload[ctx.params.name].data.buffer;
    }
});

router.post('/project/:projectId/upload', multer().single('file'), async ctx => {
    const file = ctx.request.file;

    try {
        const insertion = await ctx.io.database.collection('input_upload').insertOne({
            status: 'pending_processing',
            projectId: new ObjectId(ctx.params.projectId),
            original: {
                sha1: new Hash('sha1').update(file.buffer).digest(),
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

// router.patch('/project/:projectId/upload/:id', async ctx => {
//     await ctx.io.database.collection('input_upload').updateOne(
//         {
//             _id: new ObjectId(ctx.params.id),
//             projectId: new ObjectId(ctx.params.projectId),
//         },
//         { $set: { status: 'done' } }
//     );

// ctx.response.status = 204;
// });

router.delete('/project/:projectId/upload/:id', async ctx => {
    await ctx.io.database.collection('input_upload').deleteOne({
        _id: new ObjectId(ctx.params.id),
        projectId: new ObjectId(ctx.params.projectId),
    });

    ctx.response.status = 204;
});

module.exports = router;
