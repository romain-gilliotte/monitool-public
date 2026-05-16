import ExcelJS from 'exceljs';
import olap from 'olap-in-memory';
const { TimeDimension } = olap;
import { TimeSlot } from 'timeslot-dag';
async function createXlsx(id, start, end, sites, dataSource) {
    const [wb, boundaries] = getWorkbook(id, start, end, sites, dataSource);
    return [Buffer.from(await wb.xlsx.writeBuffer()), boundaries];
}

function getWorkbook(id, start, end, sites, dataSource) {
    const boundaries = {};
    const wb = new ExcelJS.Workbook();

    wb.myStyles = {
        titleStyle: { font: { bold: true, size: 10 } },
        tableStyle: {
            font: { size: 10 },
            border: {
                left: { style: 'thin', color: { argb: 'FF000000' } },
                right: { style: 'thin', color: { argb: 'FF000000' } },
                top: { style: 'thin', color: { argb: 'FF000000' } },
                bottom: { style: 'thin', color: { argb: 'FF000000' } },
            },
        },
    };

    const ws = wb.addWorksheet('Data Entry');

    addMetadata(ws, boundaries, id, start, end, sites, dataSource);
    addForm(ws, boundaries, dataSource);

    return [wb, boundaries];
}

function applyStyle(cell, style) {
    if (style.font) cell.font = style.font;
    if (style.fill) cell.fill = style.fill;
    if (style.border) cell.border = style.border;
    if (style.alignment) cell.alignment = style.alignment;
}

function applyStyleRange(ws, r1, c1, r2, c2, style) {
    for (let r = r1; r <= r2; r++) {
        for (let c = c1; c <= c2; c++) {
            applyStyle(ws.getCell(r, c), style);
        }
    }
}

function addMetadata(ws, boundaries, id, start, end, sites, dataSource) {
    const { titleStyle, tableStyle } = ws.workbook.myStyles;

    // Add metadata sheet
    const metadata = ws.workbook.addWorksheet('Metadata');
    metadata.state = 'hidden';
    const activeSites = sites.filter(site => dataSource.entities.includes(site.id) && site.active);
    metadata.getCell(1, 1).value = activeSites.length;
    activeSites.forEach((site, index) => {
        metadata.getCell(1 + index, 2).value = site.id;
        metadata.getCell(1 + index, 3).value = site.name;
    });

    const periods = new TimeDimension('time', dataSource.periodicity, start, end).getItems();
    metadata.getCell(1, 4).value = periods.length;
    periods.forEach((period, index) => {
        const ts = new TimeSlot(period);
        const start = ts.firstDate.toISOString().substring(0, 10);
        const end = ts.lastDate.toISOString().substring(0, 10);

        metadata.getCell(1 + index, 5).value = period;
        metadata.getCell(1 + index, 6).value = `${ts.humanizeValue()} (${start} -> ${end})`;
    });

    // Write form id, so that we can find it when importing
    boundaries['qr'] = { sheet: 'Metadata', cell: 'J1' };
    metadata.getCell(1, 10).value = id.toString('base64');

    // Add fields to enter site name, period, collected by
    boundaries['siteName'] = { sheet: 'Data Entry', cell: 'A2' };
    ws.mergeCells(1, 1, 1, 2);
    const siteTitle = ws.getCell(1, 1);
    siteTitle.value = 'Collection site';
    applyStyle(siteTitle, titleStyle);
    ws.mergeCells(2, 1, 2, 2);
    applyStyleRange(ws, 2, 1, 2, 2, tableStyle);
    ws.dataValidations.add('A2:B2', {
        type: 'list',
        allowBlank: true,
        showInputMessage: true,
        prompt: 'Choose from dropdown',
        showErrorMessage: true,
        error: 'Invalid choice was chosen',
        formulae: [`=Metadata!$C$1:$C$${1 + activeSites.length}`],
    });

    boundaries['periodName'] = { sheet: 'Data Entry', cell: 'D2' };
    ws.mergeCells(1, 4, 1, 5);
    const periodTitle = ws.getCell(1, 4);
    periodTitle.value = 'Covered period';
    applyStyle(periodTitle, titleStyle);
    ws.mergeCells(2, 4, 2, 5);
    applyStyleRange(ws, 2, 4, 2, 5, tableStyle);
    ws.dataValidations.add('D2:E2', {
        type: 'list',
        allowBlank: true,
        showInputMessage: true,
        prompt: 'Choose from dropdown',
        showErrorMessage: true,
        error: 'Invalid choice was chosen',
        formulae: [`=Metadata!$F$1:$F$${1 + periods.length}`],
    });

    boundaries['collectedBy'] = { sheet: 'Metadata', cell: 'G2' };
    ws.mergeCells(1, 7, 1, 8);
    const collectedByTitle = ws.getCell(1, 7);
    collectedByTitle.value = 'Collected by';
    applyStyle(collectedByTitle, titleStyle);
    ws.mergeCells(2, 7, 2, 8);
    applyStyleRange(ws, 2, 7, 2, 8, tableStyle);
}

function addForm(ws, boundaries, dataSource) {
    const { titleStyle, tableStyle } = ws.workbook.myStyles;

    let currentRow = 4;
    for (let variable of dataSource.elements) {
        ws.mergeCells(currentRow, 1, currentRow, 10);
        const varTitle = ws.getCell(currentRow, 1);
        varTitle.value = variable.name;
        applyStyle(varTitle, titleStyle);
        currentRow += 1;

        const tableStartRow = currentRow;
        const rowParts = variable.partitions.slice(0, variable.distribution);
        const colParts = variable.partitions.slice(variable.distribution);

        addTitlesOnTop(ws, colParts, currentRow, 1 + rowParts.length);
        currentRow += colParts.length;

        addTitlesOnLeft(ws, rowParts, currentRow, 1);
        currentRow += 2 + rowParts.reduce((m, d) => m * d.elements.length, 1);

        const tblWidth = rowParts.length + colParts.reduce((m, d) => m * d.elements.length, 1);
        const tblHeight = colParts.length + rowParts.reduce((m, d) => m * d.elements.length, 1);
        applyStyleRange(ws, tableStartRow, 1, tableStartRow + tblHeight - 1, tblWidth, tableStyle);

        if (variable.partitions.length) {
            const els = cartesian(variable.partitions.map(p => p.elements.map(e => e.id)));
            const dataWidth = tblWidth - rowParts.length;
            for (let i = 0; i < els.length; ++i) {
                const key = els[i].reduce(
                    (m, el, i) => m + `[${variable.partitions[i].id}=${el}]`,
                    variable.id
                );

                boundaries[key] = {
                    sheet: 'Data Entry',
                    cell: ws.getCell(
                        tableStartRow + colParts.length + Math.floor(i / dataWidth),
                        1 + rowParts.length + (i % dataWidth)
                    ).address,
                };
            }
        } else {
            boundaries[variable.id] = {
                sheet: 'Data Entry',
                cell: ws.getCell(tableStartRow, 1).address,
            };
        }
    }
}

function addTitlesOnTop(ws, partitions, startRow, startCol, index = 0) {
    if (index == partitions.length) return;

    const colspan = partitions.slice(index + 1).reduce((m, d) => m * d.elements.length, 1);
    const elements = partitions[index].elements;

    for (let [itemIndex, element] of elements.entries()) {
        const itemStartCol = startCol + itemIndex * colspan;
        const itemEndCol = itemStartCol + colspan - 1;

        if (colspan > 1) ws.mergeCells(startRow, itemStartCol, startRow, itemEndCol);
        ws.getCell(startRow, itemStartCol).value = element.name;

        addTitlesOnTop(ws, partitions, startRow + 1, itemStartCol, index + 1);
    }
}

function addTitlesOnLeft(ws, partitions, startRow, startCol, index = 0) {
    if (index == partitions.length) return;

    const rowspan = partitions.slice(index + 1).reduce((m, d) => m * d.elements.length, 1);
    const elements = partitions[index].elements;

    for (let [itemIndex, element] of elements.entries()) {
        const itemStartRow = startRow + itemIndex * rowspan;
        const itemEndRow = itemStartRow + rowspan - 1;

        if (rowspan > 1) ws.mergeCells(itemStartRow, startCol, itemEndRow, startCol);
        ws.getCell(itemStartRow, startCol).value = element.name;

        addTitlesOnLeft(ws, partitions, itemStartRow, startCol + 1, index + 1);
    }
}

function cartesian(arr) {
    return arr.reduce(
        function (a, b) {
            return a
                .map(function (x) {
                    return b.map(function (y) {
                        return x.concat([y]);
                    });
                })
                .reduce(function (a, b) {
                    return a.concat(b);
                }, []);
        },
        [[]]
    );
}

export { createXlsx };
