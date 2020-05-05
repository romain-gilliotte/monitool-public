const { ObjectId } = require('mongodb');
const { processImageUpload } = require('./image/process');
const { processPdfUpload } = require('./pdf/process');

queue.process('process-upload', async job => {
    const collection = database.collection('input_upload');
    const upload = await collection.findOne({ _id: new ObjectId(job.data.uploadId) });

    let update;
    try {
        if (upload.original.mimeType.startsWith('image/')) {
            update = await processImageUpload(upload);
        } else if (upload.original.mimeType.startsWith('application/pdf')) {
            update = await processPdfUpload(upload);
        } else throw new Error('Unsupported');
    } catch (e) {
        console.log(e);
        update = {
            $set: { status: 'failed', reason: e.message },
        };
    }

    if (update) {
        await collection.updateOne({ _id: upload._id }, update);
    } else {
        await collection.deleteOne({ _id: upload._id });
    }
});
