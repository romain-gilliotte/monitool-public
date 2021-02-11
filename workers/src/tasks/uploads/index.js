const { ObjectId } = require('mongodb');
const { InputOutput } = require('../../io');
const { generateThumbnail } = require('../../helpers/thumbnail');
const { FormDataExtractor, FormData } = require('tallysheet-timemachine');
const { PdfExtractorPlugin } = require('tallysheet-timemachine-pdf');
const { ExcelExtractorPlugin, ExcelFormData } = require('tallysheet-timemachine-xlsx');
const { PaperExtractorPlugin, PaperFormData } = require('tallysheet-timemachine-paper');
const { ZipExtractorPlugin } = require('tallysheet-timemachine-zip');

const plugins = [
    new PdfExtractorPlugin(),
    new ExcelExtractorPlugin(),
    new PaperExtractorPlugin(),
    new ZipExtractorPlugin(),
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

    // Create new documents from extracted pages.
    const extractor = new FormDataExtractor(plugins, async id => {
        const form = await io.database.collection('forms').findOne({ randomId: id });
        return form.metadata;
    });

    const { data, name, mimeType } = upload.original;
    const generator = extractor.process(data.buffer, mimeType, name);
    let update;
    if (['application/zip', 'application/pdf'].includes(mimeType)) {
        update = {
            status: 'hidden',
            thumbnail: await processThumbnail(upload),
        };

        for await (let formData of generator) {
            await addUpload(upload.projectId, formData);
        }
    } else {
        const iteration = await generator.next();
        const formData = iteration.value;

        if (formData) {
            update = {
                status: 'pending_dataentry',
                thumbnail: await processThumbnail(formData.file, formData.mimeType),
                processed: await processFormData(io, iteration.value),
            };
        } else {
            update = { status: 'failed', reason: 'No form was found.' };
        }
    }

    await collection.updateOne({ _id: upload._id }, { $set: update });
}

/**
 *
 * @param {string} projectId
 * @param {FormData} formData
 */
async function addUpload(projectId, formData) {
    try {
        const upload = {
            status: 'pending_dataentry',
            projectId: projectId,
            original: {
                sha1: new Hash('sha1').update(formData.file).digest(),
                name: formData.filename,
                size: formData.file.byteLength,
                mimeType: formData.mimeType,
                data: formData.file,
            },
            thumbnail: await processThumbnail(formData.file, formData.mimeType),
            processed: await processFormData(io, formData),
        };

        await io.database.collection('input_upload').insertOne(upload);
    } catch (e) {
        if (!e.message.includes('duplicate key error')) {
            throw e;
        }
    }
}

async function processThumbnail(buffer, mimeType) {
    const thumbPng = await generateThumbnail(buffer, mimeType);

    return {
        size: thumbPng.byteLength,
        mimeType: 'image/png',
        data: thumbPng,
    };
}

async function processFormData(io, formData) {
    const form = await io.database.collection('forms').findOne({ randomId: formData.formId });

    // Common information among formats.
    const processed = {
        dataSourceId: form.dataSourceId,
        extracted: await formData.getData(),
        regions: await formData.getQuestionBoundaries(),
    };

    // Specific information (depends on format).
    if (formData instanceof PaperFormData) {
        const image = await formData.getImage();

        processed.processor = 'paper';
        processed.size = image.byteLength;
        processed.mimeType = 'image/jpeg';
        processed.data = image;
    } else if (formData instanceof ExcelFormData) {
        processed.processor = 'excel';
    } else {
        processed.processor = 'unknown';
    }

    return processed;
}

module.exports = { initUploads };
