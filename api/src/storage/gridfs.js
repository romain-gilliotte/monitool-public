const { GridFSBucket } = require('mongodb');
const stream = require('stream');
const util = require('util');

async function getFile(id, hash) {
    const bucket = new GridFSBucket(database);
    const collection = database.collection(`fs.files`);
    const file = await collection.findOne({ _id: id });

    if (file && file.metadata.hash === hash) {
        return { file, stream: bucket.openDownloadStream(id) };
    }
}

async function updateFile(id, hash, filename, createFile) {
    const bucket = new GridFSBucket(database);
    const collection = database.collection(`fs.files`);
    const file = await collection.findOne({ _id: id });

    if (!file || file.metadata.hash !== hash) {
        if (file) await bucket.delete(id);

        const [readStream, metadata] = await createFile();
        const writeStream = bucket.openUploadStreamWithId(id, filename, {
            metadata: { ...metadata, hash },
        });

        await util.promisify(stream.pipeline)(readStream, writeStream);
    }
}

async function deleteFiles(idPrefix) {
    const bucket = new GridFSBucket(database);
    const collection = database.collection(`fs.files`);
    const files = await collection
        .find({ _id: { $regex: new RegExp(`^${idPrefix}`) } }, { projection: { _id: 1 } })
        .toArray();

    await Promise.all(files.map(file => bucket.delete(file._id)));
}

async function getGeneratedFile(fromId, fromHash, task, taskAttr, thumb = false) {
    let result;

    if (thumb) {
        const thumbId = `${fromId}:thumb`;

        result = await getFile(thumbId, fromHash);
        if (!result) {
            // Make sure original is cached by recursing.
            const original = await getGeneratedFile(fromId, fromHash, task, taskAttr, false);
            original.stream.destroy();

            const thumbnailJob = await queue.add(
                'generate-thumbnail',
                { sourceId: fromId, sourceHash: fromHash, thumbnailId: thumbId },
                { attempts: 1, removeOnComplete: true }
            );

            await thumbnailJob.finished();

            result = getFile(thumbId, fromHash);
        }
    } else {
        result = await getFile(fromId, fromHash);
        if (!result) {
            const documentJob = await queue.add(
                task,
                { cacheId: fromId, cacheHash: fromHash, ...taskAttr },
                { attempts: 1, removeOnComplete: true }
            );

            await documentJob.finished();

            result = await getFile(fromId, fromHash);
        }
    }

    return result;
}

module.exports = { getFile, getGeneratedFile, updateFile, deleteFiles };
