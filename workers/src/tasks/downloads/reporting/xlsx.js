import ExcelJS from 'exceljs';
import { ObjectId } from 'mongodb';
import olap from 'olap-in-memory';
const { TimeDimension } = olap;
import { getVariableCube } from '../../reporting/loader/cube-variable.js';
import { getQueryCube } from '../../reporting/loader/cube-query.js';
import { generateThumbnail } from '../../../helpers/thumbnail.js';
const mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

async function generateReportingXlsx(io, id, projectId, periodicity) {
    const objProjectId = new ObjectId(projectId);
    const project = await io.database.collection('project').findOne({ _id: objProjectId });
    if (!project) throw new Error('Project not found');

    const wb = await getWorkbook(io, project, periodicity);
    const content = Buffer.from(await wb.xlsx.writeBuffer());

    await io.database.collection('forms').insertOne({
        _id: id,
        filename: `${project.name || 'report'}.xlsx`,
        mimeType,
        content
    });
}

async function getWorkbook(io, project, periodicity = 'month') {
    const wb = new ExcelJS.Workbook();
    wb.myStyles = createStyles();

    const timeDimension = new TimeDimension('time', periodicity, project.start, project.end);
    const globalWs = createWorksheet(wb, 'Global', timeDimension);
    const siteWs = project.entities.map(site => createWorksheet(wb, site.name, timeDimension));

    for (let logFrame of project.logicalFrames) {
        // lf header
        const title = `Logical Framework: ${logFrame.name}`;
        appendHeader(globalWs, title, timeDimension);
        for (let [i, site] of project.entities.entries())
            if (logFrame.entities.includes(site.id)) appendHeader(siteWs[i], title, timeDimension);

        // indicators
        for (let indicator of getLogFrameIndicators(logFrame)) {
            const query = getQuery(logFrame, indicator);
            if (!query) {
                continue;
            }

            const { formula, parameters, dice } = query;
            const cube = await getQueryCube(
                io,
                project,
                null,
                formula,
                parameters,
                [
                    { id: 'time', attribute: periodicity },
                    { id: 'location', attribute: 'entity' },
                ],
                dice
            );

            appendIndicator(globalWs, indicator, cube);

            for (let [i, site] of project.entities.entries()) {
                if (logFrame.entities.includes(site.id)) {
                    const siteCube = cube.slice('location', 'entity', site.id);
                    appendIndicator(siteWs[i], indicator, siteCube);
                }
            }
        }
    }

    for (let dataSource of project.forms) {
        // Data source headers
        const title = `Data Source: ${dataSource.name}`;
        appendHeader(globalWs, title, timeDimension);
        for (let [i, site] of project.entities.entries())
            if (dataSource.entities.includes(site.id))
                appendHeader(siteWs[i], title, timeDimension);

        // Variables
        for (let variable of dataSource.elements) {
            const cube = await getVariableCube(
                io,
                project,
                null,
                variable.id,
                [
                    { id: 'time', attribute: periodicity },
                    { id: 'location', attribute: 'entity' },
                    ...variable.partitions.map(p => ({ id: p.id, attribute: 'element' })),
                ],
                []
            );

            appendVariable(globalWs, variable, cube);

            for (let [i, site] of project.entities.entries()) {
                if (dataSource.entities.includes(site.id)) {
                    const siteCube = cube.slice('location', 'entity', site.id);
                    appendVariable(siteWs[i], variable, siteCube);
                }
            }
        }
    }

    return wb;
}

function getLogFrameIndicators(logFrame) {
    return [
        ...logFrame.indicators,
        ...logFrame.purposes.reduce(
            (m, p) => [
                ...m,
                ...p.indicators,
                ...p.outputs.reduce(
                    (m, o) => [
                        ...m,
                        ...o.indicators,
                        ...o.activities.reduce((m, a) => [...m, ...a.indicators], []),
                    ],
                    []
                ),
            ],
            []
        ),
    ];
}

// FIXME clean up mess: this code is copy pasted from the client.
function getQuery(logicalFrame, indicator) {
    if (!indicator.computation) return null;

    const formula = indicator.computation.formula;

    // Compute parameters from indicator definition
    const parameters = {};
    for (let key in indicator.computation.parameters) {
        const parameter = indicator.computation.parameters[key];

        parameters[key] = { variableId: parameter.elementId, dice: [] };

        for (let partitionId in parameter.filter) {
            parameters[key].dice.push({
                id: partitionId,
                attribute: 'element',
                items: parameter.filter[partitionId],
            });
        }
    }

    const dice = [
        { id: 'location', attribute: 'entity', items: logicalFrame.entities },
        { id: 'time', attribute: 'day', range: [logicalFrame.start, logicalFrame.end] },
    ];

    return { formula, parameters, dice };
}

// Excel caps sheet names at 31 chars and requires uniqueness — truncate
// and disambiguate so two sites sharing a long prefix don't collide.
function uniqueSheetName(wb, name) {
    const MAX = 31;
    const base = name.slice(0, MAX);
    if (!wb.getWorksheet(base)) return base;

    for (let i = 2; i < 1000; i++) {
        const suffix = ` (${i})`;
        const candidate = name.slice(0, MAX - suffix.length) + suffix;
        if (!wb.getWorksheet(candidate)) return candidate;
    }
    throw new Error(`Cannot derive unique sheet name for "${name}"`);
}

function createWorksheet(wb, name, timeDimension) {
    // Initialize sheet
    const ws = wb.addWorksheet(uniqueSheetName(wb, name));
    ws.properties.outlineProperties = { summaryBelow: false };
    ws.getColumn(1).width = 30;
    ws.views = [{ state: 'frozen', xSplit: 1, ySplit: 1 }];

    timeDimension.getEntries().forEach(([_, human], index) => {
        ws.getCell(1, 2 + index).value = human;
    });

    ws.currentRow = 2;

    return ws;
}

function createStyles() {
    return {
        header: {
            font: { color: { argb: 'FFFFFFFF' }, bold: true },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF999999' } },
        },
        total: {
            text: { font: { color: { argb: 'FF333333' }, size: 11 } },
            number: { font: { color: { argb: 'FF333333' }, size: 11 } },
        },
        other: {
            text: {
                font: { color: { argb: 'FF666666' }, size: 10 },
                alignment: { indent: 1 },
            },
            number: { font: { color: { argb: 'FF666666' }, size: 10 } },
        },
    };
}

function applyStyle(cell, style) {
    if (style.font) cell.font = style.font;
    if (style.fill) cell.fill = style.fill;
    if (style.border) cell.border = style.border;
    if (style.alignment) cell.alignment = style.alignment;
}

function appendHeader(ws, name, timeDimension) {
    ws.mergeCells(ws.currentRow, 1, ws.currentRow, 1 + timeDimension.numItems);
    const cell = ws.getCell(ws.currentRow, 1);
    cell.value = name;
    applyStyle(cell, ws.workbook.myStyles.header);

    ws.currentRow++;
}

function appendIndicator(ws, indicator, cube) {
    const cubeSum = cube.keepDimensions(['time']);
    appendDataRowRec(ws, cubeSum, [], [], true);

    const cell = ws.getCell(ws.currentRow - 1, 1);
    cell.value = indicator.display;
    applyStyle(cell, ws.workbook.myStyles.total.text); // overwrite title
}

function appendVariable(ws, variable, cube) {
    // Insert variable total.
    const cubeSum = cube.keepDimensions(['time']);
    appendDataRowRec(ws, cubeSum, [], [], true);

    const cell = ws.getCell(ws.currentRow - 1, 1);
    cell.value = variable.name;
    applyStyle(cell, ws.workbook.myStyles.total.text); // overwrite title

    // Insert details if relevant
    if (variable.partitions.length) appendDataRowRec(ws, cube, variable.partitions, [], false);
}

function appendDataRowRec(ws, cube, partitions, partitionElsIdxs, total) {
    if (partitionElsIdxs.length < partitions.length) {
        const partition = partitions[partitionElsIdxs.length];

        for (let i = 0; i < partition.elements.length; ++i) {
            const element = partition.elements[i];
            const childCube = cube.slice(partition.id, 'element', element.id);

            partitionElsIdxs.push(i);
            appendDataRowRec(ws, childCube, partitions, partitionElsIdxs, total);
            partitionElsIdxs.pop();
        }
    } else {
        const variableStyle = ws.workbook.myStyles[total ? 'total' : 'other'];

        // Row title
        const name = partitions
            .map((p, pIndex) => p.elements[partitionElsIdxs[pIndex]].name)
            .join(' / ');

        const titleCell = ws.getCell(ws.currentRow, 1);
        titleCell.value = name;
        applyStyle(titleCell, variableStyle.text);

        // Insert data
        const data = cube.keepDimensions(['time']).getData('main');
        for (let x = 0; x < data.length; ++x) {
            if (!Number.isNaN(data[x])) {
                const dataCell = ws.getCell(ws.currentRow, 2 + x);
                dataCell.value = Math.round(data[x]);
                applyStyle(dataCell, variableStyle.number);
            }
        }

        // Configure collapse
        if (!total) {
            const row = ws.getRow(ws.currentRow);
            row.outlineLevel = 1;
            row.hidden = true;
            row.height = 12;
        }

        ws.currentRow++;
    }
}

export { generateReportingXlsx, getWorkbook };
