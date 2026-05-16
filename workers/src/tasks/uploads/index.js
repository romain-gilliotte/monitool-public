import { ObjectId } from 'mongodb';
import { InputOutput } from '../../io.js';
import { processImageUpload } from './image/process.js';
import { processPdfUpload } from './pdf/process.js';
import { processXlsxUpload } from './xlsx/process.js';
import { processZipUpload } from './zip/process.js';
import { generateThumbnail } from '../../helpers/thumbnail.js';
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

export { initUploads };
