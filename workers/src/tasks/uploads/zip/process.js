const AdmZip = require('adm-zip');
const { Hash } = require('crypto');
const FileType = require('file-type');
const { InputOutput } = require('../../../io');

/**
 * @param {InputOutput} io
 * @param {any} upload
 */
async function processZipUpload(io, upload) {
    const zip = new AdmZip(upload.original.data.buffer);
    for (let entry of zip.getEntries()) {
        const buffer = entry.getData();

        console.log(buffer);
        // FIXME: protect against zip bombs!

        await queueFile(io, upload.projectId, entry.name, buffer);
    }

    return { $set: { status: 'done' } };
}

async function queueFile(io, projectId, filename, buffer) {
    const { ext, mime } = await FileType.fromBuffer(buffer);

    try {
        const insertion = await io.database.collection('input_upload').insertOne({
            status: 'pending_processing',
            projectId: projectId,
            original: {
                sha1: new Hash('sha1').update(buffer).digest(),
                name: filename,
                size: buffer.byteLength,
                mimeType: mime,
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

module.exports = { processZipUpload };
