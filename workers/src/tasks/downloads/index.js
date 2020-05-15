const { generateForm } = require('./datasource');
const { generateLogFramePdf } = require('./logframe/pdf');
const { generateReportingXlsx } = require('./reporting/xlsx');
const { InputOutput } = require('../../io');

/**
 * @param {InputOutput} io
 */
function initDownloads(io) {
    io.queue.process('generate-form', job => {
        const { id, start, end, sites, dataSource, language, orientation, format } = job.data;
        return generateForm(io, id, start, end, sites, dataSource, language, orientation, format);
    });

    io.queue.process('generate-logframe', job => {
        const { id, logFrame, dataSources, language, orientation } = job.data;
        return generateLogFramePdf(io, id, logFrame, dataSources, language, orientation);
    });

    io.queue.process('generate-reporting', job => {
        const { id, projectId, periodicity } = job.data;
        return generateReportingXlsx(io, id, projectId, periodicity);
    });
}

module.exports = { initDownloads };
