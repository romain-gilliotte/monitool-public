import ExcelJS from 'exceljs';
import { InputOutput } from '../../../io.js';
/**
 * @param {InputOutput} io
 * @param {any} upload
 */
async function processXlsxUpload(io, upload) {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(upload.original.data.buffer);

    const metadata = wb.getWorksheet('Metadata');
    const templateId = Buffer.from(metadata.getCell('J1').value, 'base64');
    const template = await io.database.collection('forms').findOne({ randomId: templateId });
    if (!template) {
        throw Error('Could not find associated form');
    }

    const extracted = {};
    for (let key in template.boundaries) {
        const addr = template.boundaries[key];
        const ws = wb.getWorksheet(addr.sheet);
        if (!ws) continue;

        const value = ws.getCell(addr.cell).value;
        if (value !== null && value !== undefined) extracted[key] = value;
    }

    for (let key of ['site', 'period']) {
        if (extracted[`${key}Name`]) {
            const target = extracted[`${key}Name`];
            let found = null;

            metadata.eachRow({ includeEmpty: false }, row => {
                if (found) return;
                row.eachCell({ includeEmpty: false }, cell => {
                    if (!found && cell.value == target) {
                        found = { row: cell.row, col: cell.col };
                    }
                });
            });

            if (found) {
                extracted[key] = metadata.getCell(found.row, found.col - 1).value;
                delete extracted[`${key}Name`];
            }
        }
    }

    return {
        $set: {
            status: 'pending_dataentry',
            processed: {
                dataSourceId: template.dataSourceId,
                extracted,
            },
        },
    };
}

export { processXlsxUpload };
