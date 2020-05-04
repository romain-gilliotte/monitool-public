const { ObjectId } = require('mongodb');
const { processImageUpload } = require('./image/process');

queue.process('process-upload', async job => {
    const collection = database.collection('input_upload');
    const upload = await collection.findOne({ _id: new ObjectId(job.data.uploadId) });

    let update;
    try {
        if (upload.original.mimeType.startsWith('image/')) {
            update = await processImageUpload(upload);
        } else throw new Error('Unsupported');

        console.log('done');
    } catch (e) {
        console.log(e);
        update = {
            $set: {
                status: 'failed',
                reason: e.toString(),
            },
        };
    }

    await collection.updateOne({ _id: upload._id }, update);
});
