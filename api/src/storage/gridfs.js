const { GridFSBucket } = require('mongodb');
const stream = require('stream');
const util = require('util');

async function getFile(cacheId, cacheHash, bucketName = 'fs') {
    const bucket = new GridFSBucket(database, { bucketName });
    const collection = database.collection(`${bucketName}.files`);
    const file = await collection.findOne({ _id: cacheId });

    if (file && file.metadata.hash === cacheHash) {
        return { file, stream: bucket.openDownloadStream(cacheId) };
    }
}

async function updateFile(cacheId, cacheHash, filename, mimeType, createStream, bucketName = 'fs') {
    const bucket = new GridFSBucket(database, { bucketName });
    const collection = database.collection(`${bucketName}.files`);
    const file = await collection.findOne({ _id: cacheId });

    if (!file || file.metadata.hash !== cacheHash) {
        if (file) await bucket.delete(cacheId);

        const readStream = await createStream();
        const writeStream = bucket.openUploadStreamWithId(cacheId, filename, {
            metadata: { hash: cacheHash, mimeType: mimeType },
        });

        await util.promisify(stream.pipeline)(readStream, writeStream);
    }
}

async function deleteFiles(cacheIdPrefix, bucketName = 'fs') {
    const bucket = new GridFSBucket(database, { bucketName });
    const collection = database.collection(`${bucketName}.files`);
    const files = await collection
        .find({ _id: { $regex: new RegExp(`^${cacheIdPrefix}`) } }, { projection: { _id: 1 } })
        .toArray();

    await Promise.all(files.map(file => bucket.delete(file._id)));
}

async function getGeneratedFile(
    sourceId,
    sourceHash,
    task,
    taskAttr,
    thumbnail = false,
    bucketName = 'fs'
) {
    let result;

    if (thumbnail) {
        const thumbnailId = `${sourceId}:thumb`;

        result = await getFile(thumbnailId, sourceHash, bucketName);
        if (!result) {
            // Make sure original is cached by recursing.
            const original = await getGeneratedFile(
                sourceId,
                sourceHash,
                task,
                taskAttr,
                false,
                bucketName
            );
            original.stream.destroy();

            const thumbnailJob = await queue.add(
                'generate-thumbnail',
                { sourceId, sourceHash, thumbnailId, bucketName },
                { attempts: 1, removeOnComplete: true }
            );

            await thumbnailJob.finished();

            result = getFile(thumbnailId, sourceHash, bucketName);
        }
    } else {
        result = await getFile(sourceId, sourceHash, bucketName);
        if (!result) {
            const documentJob = await queue.add(
                task,
                { cacheId: sourceId, cacheHash: sourceHash, ...taskAttr },
                { attempts: 1, removeOnComplete: true }
            );

            await documentJob.finished();

            result = await getFile(sourceId, sourceHash, bucketName);
        }
    }

    return result;
}

module.exports = { getFile, getGeneratedFile, updateFile, deleteFiles };
