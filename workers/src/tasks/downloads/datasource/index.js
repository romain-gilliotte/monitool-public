const { createPdf } = require('./pdf');
const { createXlsx } = require('./xlsx');
const { generateThumbnail } = require('../../../helpers/thumbnail');
const { InputOutput } = require('../../../io');

/**
 * @param {InputOutput} io
 * @param {string} prjId
 * @param {string} dsId
 * @param {'en'|'es'|'fr'} language
 * @param {'portrait'|'landscape'} orientation
 */
async function generateForm(io, id, start, end, sites, dataSource, language, orientation, format) {
    const randomId = createRandomId(6);

    let content, mimeType, metadata;
    if (format === 'pdf') {
        const result = await createPdf(randomId, dataSource, orientation, language);
        content = result[0];
        mimeType = 'application/pdf';
        metadata = { boundaries: result[1], orientation };
    } else if (format === 'xlsx') {
        const result = await createXlsx(randomId, start, end, sites, dataSource, language);
        content = result[0];
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        metadata = { boundaries: result[1] };
    } else {
        throw new Error('Unsupported format');
    }

    await io.database.collection('forms').insertOne({
        _id: id,
        dataSourceId: dataSource.id,
        randomId,
        filename: `${dataSource.name || 'data-source'}.${format}`,
        mimeType,
        content,
        thumbnail: await generateThumbnail(content, mimeType),
        ...metadata,
    });
}

function createRandomId(length) {
    const bytes = Buffer.alloc(length);
    for (let i = 0; i < length; ++i) {
        bytes[i] = 256 * Math.random();
    }
    return bytes;
}

module.exports = { generateForm };
