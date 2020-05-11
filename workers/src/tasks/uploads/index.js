const { ObjectId } = require('mongodb');
const { InputOutput } = require('../../io');
const { processImageUpload } = require('./image/process');
const { processPdfUpload } = require('./pdf/process');

/**
 * @param {InputOutput} io
 */
function initUploads(io) {
    io.queue.process('process-upload', job => {
        const { uploadId } = job.data;
        return processUpload(io, uploadId);
    });
}

/**
 * @param {InputOutput} io
 * @param {ObjectId} uploadId
 */
async function processUpload(io, uploadId) {
    const collection = io.database.collection('input_upload');
    const upload = await collection.findOne({ _id: new ObjectId(uploadId) });

    let update;
    try {
        if (upload.original.mimeType.startsWith('image/')) {
            update = await processImageUpload(io, upload);
        } else if (upload.original.mimeType.startsWith('application/pdf')) {
            update = await processPdfUpload(io, upload);
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
}

module.exports = { initUploads };
