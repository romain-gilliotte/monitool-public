const { Hash } = require('crypto');
const gm = require('gm');
const { promisify } = require('util');
const { InputOutput } = require('../../../io');

/**
 * Screenshot every page with ~200dpi and queue for image processing.
 * @see https://stackoverflow.com/questions/6605006/convert-pdf-to-image-with-high-resolution
 *
 * @param {InputOutput} io
 * @param {any} upload
 */
async function processPdfUpload(io, upload) {
    const collection = io.database.collection('input_upload');

    const pdf = gm(upload.original.data.buffer, 'file.pdf');
    const identify = promisify(pdf.identify.bind(pdf));
    const toBuffer = promisify(pdf.toBuffer.bind(pdf));

    const information = await identify();
    const numPages = Array.isArray(information.Format) ? information.Format.length : 1;

    for (let i = 0; i < numPages; ++i) {
        pdf.selectFrame(i).in('-density', '200');

        const buffer = await toBuffer('JPG');
        const insertion = await collection.insertOne({
            status: 'pending_processing',
            projectId: upload.projectId,
            original: {
                sha1: new Hash('sha1').update(buffer).digest(),
                name: `${upload.original.name} [${i + 1}]`,
                size: buffer.byteLength,
                mimeType: 'image/jpeg',
                data: buffer,
            },
        });

        await io.queue.add(
            'process-upload',
            { uploadId: insertion.insertedId },
            { attempts: 1, removeOnComplete: true }
        );
    }

    return null;
}

module.exports = { processPdfUpload };
