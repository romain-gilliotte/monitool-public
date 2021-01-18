const { ObjectId } = require('mongodb');
const { InputOutput } = require('../../io');
const { generateThumbnail } = require('../../helpers/thumbnail');
const { FormDataExtractor } = require('tallysheet-timemachine');
const { PdfExtractorPlugin } = require('tallysheet-timemachine-pdf');
const { ExcelExtractorPlugin, ExcelFormData } = require('tallysheet-timemachine-xlsx');
const { PaperExtractorPlugin, PaperFormData } = require('tallysheet-timemachine-paper');
const { ZipExtractorPlugin } = require('tallysheet-timemachine-zip');

const plugins = [
    new PdfExtractorPlugin(),
    new ExcelExtractorPlugin(),
    new PaperExtractorPlugin(),
    new ZipExtractorPlugin()
];

const containerMime = ['application/zip', 'application/pdf'];
const contentMime = [
    'image/png',
    'image/jpeg',
    'image/tiff',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];


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

    addThumbnailToUpload(upload);
    
    if (containerMime.includes(upload.original.mimeType))
        processContainer(upload);
    
    if (contentMime.includes(upload.original.mimeType))
        processContent(upload);
}

async function addThumbnailToUpload(upload) {
    if (!upload.thumbnail) {
        const thumbPng = await generateThumbnail(upload.original.data.buffer, upload.original.mimeType);
    
        await collection.updateOne(
            { _id: upload._id },
            { $set: { thumbnail: { size: thumbPng.byteLength, mimeType: 'image/png', data: thumbPng }}}
        );
    }
}

async function processContainer(upload) {
    // Hide container
    await collection.updateOne({ _id: upload._id }, { $set: { status: 'hidden' } });

    // Create new documents from extracted pages.
    const extractor = new FormDataExtractor(
        plugins,
        async id => {
            const form = await io.database.collection('forms').findOne({ randomId: id })
            return form.metadata;
        }
    );

    for await (let formData of extractor.process(upload.original.data.buffer)) {
        try {
            const insertion = await io.database.collection('input_upload').insertOne({
                projectId: upload.projectId,
                original: {
                    sha1: new Hash('sha1').update(buffer).digest(),
                    name: filename,
                    size: buffer.byteLength,
                    mimeType: type.mime,
                    data: buffer,
                },
                ...await computeContentUploadUpdate(io, formData)
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
}

async function processContent(upload) {
    // Extract FormData from upload
    const extractor = new FormDataExtractor(
        plugins,
        async id => {
            const form = await io.database.collection('forms').findOne({ randomId: id })
            return form.metadata;
        }
    );

    // Get first entry (there can be only one).
    const {value: formData} = await extractor.process(upload.original.data.buffer).next();

    // Update upload
    const update = await computeContentUploadUpdate(io, formData);
    await collection.updateOne({ _id: upload._id }, { $set: update});
}


async function computeContentUploadUpdate(io, formData) {
    // Update upload entry, depending on result.
    const update = {};
    if (formData) {
        const form = await io.database.collection('forms').findOne({ randomId: formData.formId });

        // Common information among formats.
        update.status = 'pending_dataentry';
        update.processed = {
            dataSourceId: form.dataSourceId,
            extracted: await formData.getData(),
            regions: await formData.getQuestionBoundaries()
        }

        // Specific information (depends on format).
        if (formData instanceof PaperFormData) {
            const image = await formData.getImage();
            
            update.processed.processor = 'paper';
            update.processed.size = image.byteLength;
            update.processed.mimeType = 'image/jpeg';
            update.processed.data = image;
        }
        else if (formData instanceof ExcelFormData) {
            update.processed.processor = 'excel';
        }
        else {
            update.processed.processor = 'unknown';
        }
    }
    else {
        update.status = 'failed';
        update.reason = 'No form was found.';
    }

    return update;
}


module.exports = { initUploads };
