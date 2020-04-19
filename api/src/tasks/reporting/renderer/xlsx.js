const xl = require('excel4node');

const filename = 'report.xlsx';
const mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

module.exports = async (cube, rendererOpts) => {
    const distribution = typeof rendererOpts === 'number' && rendererOpts < cube.numDimensions ?
        rendererOpts :
        Math.floor(cube.numDimensions / 2);

    const payload = await getWorkbook(cube, distribution).writeToBuffer();
    return { mimeType, filename, payload };
};

function getWorkbook(cube, distribution) {
    const wb = new xl.Workbook();
    const ws = wb.addWorksheet('Report');

    const rowDimensions = cube.dimensions.slice(0, distribution);
    const colDimensions = cube.dimensions.slice(distribution);
    const width = colDimensions.reduce((m, d) => m * d.numItems, 1);

    addTitlesOnTop(ws, colDimensions, 1, 1 + rowDimensions.length);
    addTitlesOnLeft(ws, rowDimensions, 1 + colDimensions.length, 1);

    for (let [index, value] of cube.getData('main').entries()) {
        const row = 1 + colDimensions.length + Math.floor(index / width);
        const col = 1 + rowDimensions.length + (index % width);

        if (!Number.isNaN(value))
            ws.cell(row, col).number(value);
    }

    return wb;
}

function addTitlesOnTop(ws, dimensions, startRow, startCol, index = 0) {
    if (index == dimensions.length)
        return;

    const colspan = dimensions.slice(index + 1).reduce((m, d) => m * d.numItems, 1);
    const items = dimensions[index].getEntries();

    for (let [itemIndex, [item, human]] of items.entries()) {
        const itemStartCol = startCol + itemIndex * colspan;
        const itemEndCol = itemStartCol + colspan - 1;

        let cells = colspan == 1 ?
            ws.cell(startRow, itemStartCol) :
            ws.cell(startRow, itemStartCol, startRow, itemEndCol, true);

        cells.string(human);

        addTitlesOnTop(ws, dimensions, startRow + 1, itemStartCol, index + 1)
    }
}

function addTitlesOnLeft(ws, dimensions, startRow, startCol, index = 0) {
    if (index == dimensions.length)
        return;

    const rowspan = dimensions.slice(index + 1).reduce((m, d) => m * d.numItems, 1);
    const items = dimensions[index].getEntries();

    for (let [itemIndex, [item, human]] of items.entries()) {
        const itemStartRow = startRow + itemIndex * rowspan;
        const itemEndRow = itemStartRow + rowspan - 1;

        let cells = rowspan == 1 ?
            ws.cell(itemStartRow, startCol) :
            ws.cell(itemStartRow, startCol, itemEndRow, startCol, true);

        cells.string(human);

        addTitlesOnLeft(ws, dimensions, itemStartRow, startCol + 1, index + 1)
    }
}
