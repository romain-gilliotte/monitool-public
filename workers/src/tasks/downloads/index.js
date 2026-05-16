import { generateForm } from './datasource/index.js';
import { generateLogFramePdf } from './logframe/pdf.js';
import { generateReportingXlsx } from './reporting/xlsx.js';
import { InputOutput } from '../../io.js';
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

export { initDownloads };
