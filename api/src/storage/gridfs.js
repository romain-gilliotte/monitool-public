const gm = require('gm');
const { GridFSBucket } = require('mongodb');
const stream = require('stream');
const util = require('util');

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
        await updateFile(thumbnailId, cacheHash, 'thumbnail.png', 'image/png', async () => {
            return gm(original.stream).crop(595, 400).stream('PNG');
        });

        return getOriginal(thumbnailId, cacheHash, bucketName);
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

module.exports = { getFile, getGeneratedFile, updateFile };
