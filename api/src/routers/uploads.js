const Router = require('@koa/router');
const multer = require('@koa/multer');
const { ObjectId } = require('mongodb');
const JSONStream = require('JSONStream');

const router = new Router();

router.get('/project/:id/upload', async ctx => {
    const forms = await database
        .collection('input_upload')
        .find(
            { projectId: new ObjectId(ctx.params.id) },
            { projection: { 'original.data': 0, 'reprojected.data': 0 } }
        );

    ctx.response.type = 'application/json';
    ctx.response.body = forms.pipe(JSONStream.stringify());
});

router.get('/project/:projectId/upload/:id', async ctx => {
    ctx.response.body = await database.collection('input_upload').findOne(
        { _id: new ObjectId(ctx.params.id), projectId: new ObjectId(ctx.params.projectId) },
        {
            'original.data': 0,
            'reprojected.data': 0,
        }
    );
});

router.get('/project/:projectId/upload/:id/:name(original|reprojected)', async ctx => {
    const upload = await database
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

    const insertion = await database.collection('input_upload').insertOne({
        status: 'pending_processing',
        projectId: new ObjectId(ctx.params.projectId),
        original: {
            name: file.originalname,
            size: file.size,
            mimeType: file.mimetype,
            data: file.buffer,
        },
    });

    await queue.add(
        'process-upload',
        { uploadId: insertion.insertedId },
        { attempts: 1, removeOnComplete: true }
    );

    ctx.response.status = 204;
});

// router.patch('/project/:projectId/upload/:id', async ctx => {
//     await database.collection('input_upload').updateOne(
//         {
//             _id: new ObjectId(ctx.params.id),
//             projectId: new ObjectId(ctx.params.projectId),
//         },
//         { $set: { inputId: ctx.body.inputId } }
//     );
// });

module.exports = router;
