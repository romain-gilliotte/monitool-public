const axios = require('axios');
const fs = require('fs');
const gm = require('gm');
const FormData = require('form-data');
const config = require('../../config');
const { getFile, updateFile } = require('../../storage/gridfs');

// fixme add exception handling
queue.process('generate-thumbnail', async job => {
    const { sourceId, sourceHash, thumbnailId, bucketName } = job.data;
    const original = await getFile(sourceId, sourceHash, bucketName);

    let document = {
        stream: original.stream,
        filename: original.file.filename,
        mimeType: original.file.metadata.mimeType,
    };

    if (document) {
        // if needed && possible, convert to pdf
        if (document.mimeType !== 'application/pdf' && config.unoconv.uri) {
            const form = new FormData();
            form.append('file', document.stream, document.filename);

            const response = await axios.post(config.unoconv.uri, form, {
                responseType: 'stream',
                headers: form.getHeaders(),
            });

            document = {
                stream: response.data,
                filename: 'document.pdf',
                mimeType: 'application/pdf',
            };
        }

        // Create thumbnail
        if (document.mimeType === 'application/pdf') {
            const newStream = gm(document.stream, document.filename).crop(595, 400).stream('PNG');

            document = { stream: newStream, filename: 'thumbnail.png', mimeType: 'image/png' };
        } else {
            document.stream.destroy();
            document = null;
        }
    }

    // Fallback to placeholder
    if (!document) {
        document = {
            filename: 'placeholder.png',
            mimeType: 'image/png',
            stream: fs.createReadStream('data/placeholder.png'),
        };
    }

    await updateFile(
        thumbnailId,
        sourceHash,
        document.filename,
        document.mimeType,
        () => document.stream,
        bucketName
    );
});
