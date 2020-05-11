const xl = require('excel4node');
const { ObjectId } = require('mongodb');
const { TimeDimension } = require('olap-in-memory');
const { getVariableCube } = require('../../reporting/loader/cube-variable');
const { getQueryCube } = require('../../reporting/loader/cube-query');
const { generateThumbnail } = require('../../../helpers/thumbnail');

const mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

async function generateReportingXlsx(io, id, projectId, periodicity) {
    const objProjectId = new ObjectId(projectId);
    const project = await io.database.collection('project').findOne({ _id: objProjectId });
    if (!project) throw new Error('Project not found');

    const wb = await getWorkbook(io, project, periodicity);
    const content = await wb.writeToBuffer();

    await io.database.collection('forms').insertOne({
        _id: id,
        filename: `${project.name || 'report'}.xlsx`,
        mimeType,
        content,
        thumbnail: generateThumbnail(content, mimeType),
    });
}

async function getWorkbook(io, project, periodicity = 'month') {
    const wb = new xl.Workbook();
    wb.myStyles = createStyles(wb);

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

function createWorksheet(wb, name, timeDimension) {
    // Initialize sheet
    const ws = wb.addWorksheet(name, { outline: { summaryBelow: false } });
    ws.column(1).setWidth(30);
    ws.column(1).freeze();
    ws.row(1).freeze();

    timeDimension.getEntries().forEach(([_, human], index) => {
        ws.cell(1, 2 + index).string(human);
    });

    ws.currentRow = 2;

    return ws;
}

function createStyles(wb) {
    return {
        header: wb.createStyle({
            font: {
                color: '#FFFFFF',
                bold: true,
            },
            fill: {
                type: 'pattern',
                patternType: 'solid',
                bgColor: '#999999',
                fgColor: '#999999',
            },
        }),
        total: {
            text: wb.createStyle({ font: { color: '#333333', size: 11 } }),
            number: wb.createStyle({ font: { color: '#333333', size: 11 } }),
        },
        other: {
            text: wb.createStyle({
                font: { color: '#666666', size: 10 },
                alignment: { indent: 1 },
            }),
            number: wb.createStyle({ font: { color: '#666666', size: 10 } }),
        },
    };
}

function appendHeader(ws, name, timeDimension) {
    ws.cell(ws.currentRow, 1, ws.currentRow, 1 + timeDimension.numItems, true)
        .string(name)
        .style(ws.wb.myStyles.header);

    ws.currentRow++;
}

function appendIndicator(ws, indicator, cube) {
    const cubeSum = cube.keepDimensions(['time']);
    appendDataRowRec(ws, cubeSum, [], [], true);
    ws.cell(ws.currentRow - 1, 1)
        .string(indicator.display)
        .style(ws.wb.myStyles.total.text); // overwrite title
}

function appendVariable(ws, variable, cube) {
    // Insert variable total.
    const cubeSum = cube.keepDimensions(['time']);
    appendDataRowRec(ws, cubeSum, [], [], true);
    ws.cell(ws.currentRow - 1, 1)
        .string(variable.name)
        .style(ws.wb.myStyles.total.text); // overwrite title

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
        const variableStyle = ws.wb.myStyles[total ? 'total' : 'other'];

        // Row title
        const name = partitions
            .map((p, pIndex) => p.elements[partitionElsIdxs[pIndex]].name)
            .join(' / ');

        ws.cell(ws.currentRow, 1).string(name).style(variableStyle.text);

        // Insert data
        const data = cube.keepDimensions(['time']).getData('main');
        for (let x = 0; x < data.length; ++x)
            if (!Number.isNaN(data[x]))
                ws.cell(ws.currentRow, 2 + x)
                    .number(Math.round(data[x]))
                    .style(variableStyle.number);

        // Configure collapse
        if (!total) {
            ws.row(ws.currentRow).group(1, true);
            ws.row(ws.currentRow).setHeight(12);
        }

        ws.currentRow++;
    }
}

module.exports = { generateReportingXlsx, getWorkbook };
