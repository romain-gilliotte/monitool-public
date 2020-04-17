const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const gm = require('gm');
const { GridFSBucket } = require('mongodb');
const stream = require('stream');
const util = require('util');
const config = require('../config');

async function getOriginal(cacheId, cacheHash, bucketName = 'fs') {
    const bucket = new GridFSBucket(database, { bucketName });
    const collection = database.collection(`${bucketName}.files`);
    const file = await collection.findOne({ _id: cacheId });

    if (file && file.metadata.hash === cacheHash) {
        return { file, stream: bucket.openDownloadStream(cacheId) }
    }
}

async function getThumbnail(cacheId, cacheHash, bucketName = 'fs') {
    const thumbnailId = `${cacheId}:thumb`;

    // Try to fetch thumbnail.
    const thumbnail = await getOriginal(thumbnailId, cacheHash, bucketName);
    if (thumbnail)
        return thumbnail;

    // Try to fetch original file, and make thumbnail from it.
    const original = await getOriginal(cacheId, cacheHash, bucketName);
    if (original) {
        const originalMime = original.file.metadata.mimeType;

        if (originalMime === 'application/pdf' || config.unoconv.uri) {
            await updateFile(thumbnailId, cacheHash, 'thumbnail.png', 'image/png', async () => {
                let originalStream = original.stream;

                // Convert to PDF
                if (originalMime !== 'application/pdf') {
                    const form = new FormData();
                    form.append('file', original.stream, original.file.filename);

                    const response = await axios.post(config.unoconv.uri, form, {
                        responseType: 'stream',
                        headers: form.getHeaders(),
                    });

                    originalStream = response.data;
                }

                // Conver to PNG
                return gm(originalStream, 'file.pdf').crop(595, 400).stream('PNG');
            });

            return getOriginal(thumbnailId, cacheHash, bucketName);
        }
        else {
            // close the stream
            original.stream.destroy();
        }
    }
}

async function getFile(cacheId, cacheHash, thumbnail = false, bucketName = 'fs') {
    if (thumbnail)
        return getThumbnail(cacheId, cacheHash, bucketName);
    else
        return getOriginal(cacheId, cacheHash, bucketName);
}

async function getGeneratedFile(cacheId, cacheHash, task, taskAttr, thumbnail = false, bucketName = 'fs') {
    let result = await getFile(cacheId, cacheHash, thumbnail, bucketName);

    if (!result) {
        const job = await queue.add(
            task,
            { cacheId, cacheHash, ...taskAttr },
            { attempts: 1, removeOnComplete: true }
        );

        await job.finished();

        result = await getFile(cacheId, cacheHash, thumbnail, bucketName);
    }

    if (!result && thumbnail) {
        return {
            file: { length: 20351, filename: 'placeholder.png', metadata: { mimeType: 'image/png' } },
            stream: fs.createReadStream('data/placeholder.png')
        }
    }

    return result;
}

async function updateFile(cacheId, cacheHash, filename, mimeType, createStream, bucketName = 'fs') {
    const bucket = new GridFSBucket(database, { bucketName });
    const collection = database.collection(`${bucketName}.files`);
    const file = await collection.findOne({ _id: cacheId });

    if (!file || file.metadata.hash !== cacheHash) {
        if (file)
            await bucket.delete(cacheId);

        const readStream = await createStream();
        const writeStream = bucket.openUploadStreamWithId(
            cacheId,
            filename,
            { metadata: { hash: cacheHash, mimeType: mimeType } }
        );

        await util.promisify(stream.pipeline)(readStream, writeStream);
    }
}

module.exports = { getGeneratedFile, updateFile };
