const { ObjectId } = require('mongodb');
const { InputOutput } = require('../../io');
const { processImageUpload } = require('./image/process');
const { processPdfUpload } = require('./pdf/process');
const { processXlsxUpload } = require('./xlsx/process');
const { processZipUpload } = require('./zip/process');
const { generateThumbnail } = require('../../helpers/thumbnail');

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

    // Process file
    let update;
    try {
        const mimeType = upload.original.mimeType;
        if (mimeType.startsWith('image/')) {
            update = await processImageUpload(io, upload);
        } else if (mimeType.startsWith('application/pdf')) {
            update = await processPdfUpload(io, upload);
        } else if (mimeType == 'application/zip') {
            update = await processZipUpload(io, upload);
        } else if (
            mimeType == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ) {
            update = await processXlsxUpload(io, upload);
        } else {
            throw new Error('Unsupported');
        }
    } catch (e) {
        console.log(e);
        update = { $set: { status: 'failed', reason: e.message } };
    }

    // Add thumbnail
    const thumbPng = await generateThumbnail(upload.original.data.buffer, upload.original.mimeType);
    update.$set.thumbnail = { size: thumbPng.byteLength, mimeType: 'image/png', data: thumbPng };

    // Update
    await collection.updateOne({ _id: upload._id }, update);
}

module.exports = { initUploads };
