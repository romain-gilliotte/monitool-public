const { GridFSBucket } = require('mongodb');
const stream = require('stream');
const util = require('util');

async function cacheFile(cacheId, cacheHash, filename, createStream, bucketName = 'fs') {
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
            { metadata: { 'hash': cacheHash } }
        );

        await util.promisify(stream.pipeline)(readStream, writeStream);
    }

    return bucket.openDownloadStream(cacheId);
}

module.exports = cacheFile;
