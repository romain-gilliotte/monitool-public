const xl = require('excel4node');
const { ObjectId } = require('mongodb');
const stream = require('stream');
const { updateFile } = require('../../storage/gridfs');

const mime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

queue.process('generate-datasource-xlsx', async job => {
    const { cacheId, cacheHash, prjId, dsId } = job.data;
    const project = await database.collection('project').findOne(
        { _id: new ObjectId(prjId) },
        { projection: { forms: { $elemMatch: { id: dsId } } } }
    );

    if (project && project.forms.length) {
        const dataSource = project.forms[0];
        const title = dataSource.name || 'data-source';

        await updateFile(cacheId, cacheHash, `${title}.xlsx`, mime, async () => {
            const wb = await getWorkbook(dataSource);
            const buffer = await wb.writeToBuffer();

            const passThrough = new stream.PassThrough();
            passThrough.write(buffer);
            passThrough.end();

            return passThrough;
        });
    }
});


function getWorkbook(dataSource) {
    const wb = new xl.Workbook();
    const ws = wb.addWorksheet('Data Entry');
    const titleStyle = wb.createStyle({ font: { bold: true, size: 10 } });
    const tableStyle = wb.createStyle({
        font: { size: 10 },
        border: {
            left: { style: 'thin', color: '#000000' },
            right: { style: 'thin', color: '#000000' },
            top: { style: 'thin', color: '#000000' },
            bottom: { style: 'thin', color: '#000000' },
        }
    });

    ws.cell(1, 1, 1, 2, true).string('Collection site').style(titleStyle);
    ws.cell(1, 4, 1, 5, true).string('Covered period').style(titleStyle);
    ws.cell(1, 7, 1, 8, true).string('Collected by').style(titleStyle);

    ws.cell(2, 1, 2, 2, true).style(tableStyle);
    ws.cell(2, 4, 2, 5, true).style(tableStyle);
    ws.cell(2, 7, 2, 8, true).style(tableStyle);

    let currentRow = 4;
    for (let variable of dataSource.elements) {
        ws.cell(currentRow, 1, currentRow, 10, true).string(variable.name).style(titleStyle);
        currentRow += 1;

        const tableStartRow = currentRow;
        const rowPartitions = variable.partitions.slice(0, variable.distribution);
        const colPartitions = variable.partitions.slice(variable.distribution);

        addTitlesOnTop(ws, colPartitions, currentRow, 1 + rowPartitions.length);
        currentRow += colPartitions.length;

        addTitlesOnLeft(ws, rowPartitions, currentRow, 1);
        currentRow += 2 + rowPartitions.reduce((m, d) => m * d.elements.length, 1);

        const tableWidth = rowPartitions.length + colPartitions.reduce((m, d) => m * d.elements.length, 1);
        const tableHeight = colPartitions.length + rowPartitions.reduce((m, d) => m * d.elements.length, 1);
        ws
            .cell(tableStartRow, 1, tableStartRow + tableHeight - 1, tableWidth)
            .style(tableStyle);
    }

    return wb;
}

function addTitlesOnTop(ws, partitions, startRow, startCol, index = 0) {
    if (index == partitions.length)
        return;

    const colspan = partitions.slice(index + 1).reduce((m, d) => m * d.elements.length, 1);
    const elements = partitions[index].elements;

    for (let [itemIndex, element] of elements.entries()) {
        const itemStartCol = startCol + itemIndex * colspan;
        const itemEndCol = itemStartCol + colspan - 1;

        let cells = colspan == 1 ?
            ws.cell(startRow, itemStartCol) :
            ws.cell(startRow, itemStartCol, startRow, itemEndCol, true);

        cells.string(element.name);

        addTitlesOnTop(ws, partitions, startRow + 1, itemStartCol, index + 1)
    }
}

function addTitlesOnLeft(ws, partitions, startRow, startCol, index = 0) {
    if (index == partitions.length)
        return;

    const rowspan = partitions.slice(index + 1).reduce((m, d) => m * d.elements.length, 1);
    const elements = partitions[index].elements;

    for (let [itemIndex, element] of elements.entries()) {
        const itemStartRow = startRow + itemIndex * rowspan;
        const itemEndRow = itemStartRow + rowspan - 1;

        let cells = rowspan == 1 ?
            ws.cell(itemStartRow, startCol) :
            ws.cell(itemStartRow, startCol, itemEndRow, startCol, true);

        cells.string(element.name);

        addTitlesOnLeft(ws, partitions, itemStartRow, startCol + 1, index + 1)
    }
}
