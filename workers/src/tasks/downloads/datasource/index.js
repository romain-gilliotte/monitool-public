const { QuestionList } = require('tallysheet-timemachine');
const { PaperForm } = require('tallysheet-timemachine-paper');
const { ExcelForm } = require('tallysheet-timemachine-xlsx');
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
    // Build question list.
    const ql = new QuestionList(dataSource.name, start, end, dataSource.periodicity, sites);

    dataSource.elements.filter(v => v.active).forEach(variable => {
        ql.addQuestion(variable.id, variable.name, variable.distribution);
        variable.partitions.filter(p => p.active).forEach(partition => {
            ql.addDisagregation(variable.id, partition.id, partition.name);
            partition.elements.filter(e => e.active).forEach(element => {
                ql.addDisagregationElement(variable.id, partition.id, element.id, element.name);
            })
        });
    });

    // Generate form
    let form = null;
    if (format === 'pdf')
        form = new PaperForm(ql, orientation, language);
    else if (format === 'xlsx')
        form = new ExcelForm(ql);
    else
        throw new Error('Unsupported format');

    await io.database.collection('forms').insertOne({
        _id: id,
        dataSourceId: dataSource.id,
        randomId: form.id,
        filename: `${dataSource.name || 'data-source'}.${format}`,
        mimeType: form.mimeType,
        content: form.generateOutput(),
        thumbnail: await generateThumbnail(content, form.mimeType),
        metadata: await form.generateMetadata(),
    });
}

module.exports = { generateForm };
