import ExcelJS from 'exceljs';
const filename = 'report.xlsx';
const mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export default async (cube, rendererOpts) => {
    const distribution =
        typeof rendererOpts === 'number' && rendererOpts < cube.dimensions.length
            ? rendererOpts
            : Math.floor(cube.dimensions.length / 2);
    const wb = getWorkbook(cube, distribution);
    const payload = await wb.xlsx.writeBuffer();
    return { mimeType, filename, payload };
};

function getWorkbook(cube, distribution) {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Report');

    const rowDimensions = cube.dimensions.slice(0, distribution);
    const colDimensions = cube.dimensions.slice(distribution);
    const width = colDimensions.reduce((m, d) => m * d.numItems, 1);

    addTitlesOnTop(ws, colDimensions, 1, 1 + rowDimensions.length);
    addTitlesOnLeft(ws, rowDimensions, 1 + colDimensions.length, 1);

    for (let [index, value] of cube.getData('main').entries()) {
        const row = 1 + colDimensions.length + Math.floor(index / width);
        const col = 1 + rowDimensions.length + (index % width);

        if (!Number.isNaN(value)) ws.getCell(row, col).value = value;
    }

    return wb;
}

function addTitlesOnTop(ws, dimensions, startRow, startCol, index = 0) {
    if (index == dimensions.length) return;

    const colspan = dimensions.slice(index + 1).reduce((m, d) => m * d.numItems, 1);
    const items = dimensions[index].getEntries();

    for (let [itemIndex, [item, human]] of items.entries()) {
        const itemStartCol = startCol + itemIndex * colspan;
        const itemEndCol = itemStartCol + colspan - 1;

        if (colspan > 1) ws.mergeCells(startRow, itemStartCol, startRow, itemEndCol);
        ws.getCell(startRow, itemStartCol).value = human;

        addTitlesOnTop(ws, dimensions, startRow + 1, itemStartCol, index + 1);
    }
}

function addTitlesOnLeft(ws, dimensions, startRow, startCol, index = 0) {
    if (index == dimensions.length) return;

    const rowspan = dimensions.slice(index + 1).reduce((m, d) => m * d.numItems, 1);
    const items = dimensions[index].getEntries();

    for (let [itemIndex, [item, human]] of items.entries()) {
        const itemStartRow = startRow + itemIndex * rowspan;
        const itemEndRow = itemStartRow + rowspan - 1;

        if (rowspan > 1) ws.mergeCells(itemStartRow, startCol, itemEndRow, startCol);
        ws.getCell(itemStartRow, startCol).value = human;

        addTitlesOnLeft(ws, dimensions, itemStartRow, startCol + 1, index + 1);
    }
}
