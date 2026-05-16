import { createHash } from 'node:crypto';
import gm from 'gm';
import { promisify } from 'node:util';
import { InputOutput } from '../../../io.js';
/**
 * Screenshot every page with ~200dpi and queue for image processing.
 * @see https://stackoverflow.com/questions/6605006/convert-pdf-to-image-with-high-resolution
 *
 * @param {InputOutput} io
 * @param {any} upload
 */
async function processPdfUpload(io, upload) {
    const pdf = gm(upload.original.data.buffer, 'file.pdf');
    const identify = promisify(pdf.identify.bind(pdf));
    const toBuffer = promisify(pdf.toBuffer.bind(pdf));

    const information = await identify();

    // No more than 25 pages per PDF.
    const numPages = Math.min(
        25,
        Array.isArray(information.Format) ? information.Format.length : 1
    );

    for (let i = numPages - 1; i >= 0; --i) {
        pdf.selectFrame(i).in('-density', '140');

        await queueJpg(
            io,
            upload.projectId,
            `${upload.original.name.slice(0, -4)} - page ${i + 1}.jpg`,
            await toBuffer('JPG')
        );
    }

    return { $set: { status: 'hidden' } };
}

async function queueJpg(io, projectId, filename, buffer) {
    try {
        const insertion = await io.database.collection('input_upload').insertOne({
            status: 'pending_processing',
            projectId: projectId,
            original: {
                sha1: createHash('sha1').update(buffer).digest(),
                name: filename,
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
    } catch (e) {
        if (!e.message.includes('duplicate key error')) {
            throw e;
        }
    }
}

export { processPdfUpload };
