const { ObjectId } = require('mongodb');
const PdfPrinter = require('pdfmake');
const { updateFile } = require('../../storage/gridfs');
const ArucoMarker = require('aruco-marker');

queue.process('generate-datasource-pdf', async job => {
    const { cacheId, cacheHash, prjId, dsId, language, orientation } = job.data;
    const project = await database
        .collection('project')
        .findOne(
            { _id: new ObjectId(prjId) },
            { projection: { forms: { $elemMatch: { id: dsId } } } }
        );

    if (!project && !project.forms.length) throw new Error('Not found');

    const dataSource = project.forms[0];
    const title = dataSource.name || 'data-source';

    await updateFile(cacheId, cacheHash, `${title}.pdf`, 'application/pdf', async () => {
        const docDef = createDataSourceDocDef(project._id, dataSource, orientation, language);
        const stream = printer.createPdfKitDocument(docDef);
        stream.end(); // work around bug in pdfkit never ending the stream.

        return stream;
    });
});

const printer = new PdfPrinter({
    Roboto: {
        normal: 'node_modules/roboto-fontface/fonts/roboto/Roboto-Regular.woff',
        bold: 'node_modules/roboto-fontface/fonts/roboto/Roboto-Medium.woff',
    },
});

const strings = Object.freeze({
    fr: Object.freeze({
        collection_site: 'Lieu de collecte',
        covered_period: 'Période couverte',
        collected_by: 'Saisie par',
    }),
    en: Object.freeze({
        collection_site: 'Collection site',
        covered_period: 'Covered period',
        collected_by: 'Collected by',
    }),
    es: Object.freeze({
        collection_site: 'Lugar de colecta',
        covered_period: 'Periodo',
        collected_by: 'Rellenado por',
    }),
});

function createDataSourceDocDef(
    projectId,
    dataSource,
    pageOrientation = 'portrait',
    language = 'en'
) {
    return {
        pageSize: 'A4',
        pageOrientation: pageOrientation,
        pageMargins: [20, 105, 20, 45],
        styles: {
            header: { fontSize: 22, bold: true, margin: [0, 0, 0, 16] },
            variableName: { fontSize: 10, bold: true, margin: [0, 10, 0, 5] },
            normal: { fontSize: 8, margin: [0, 0, 0, 0] },
        },
        header: function (currentPage) {
            const packedPrjId = projectId.toHexString();
            const packedDsId = dataSource.id.replace(/\-/g, '').substring(0, 8);
            const packedPage = currentPage.toString(16).padStart(2, '0');
            const buffer = Buffer.from(packedPrjId + packedDsId + packedPage, 'hex');

            return [
                {
                    margin: [20, 20, 20, 0],
                    columns: [
                        {
                            width: '*',
                            stack: [
                                { text: dataSource.name, style: 'header' },
                                createMetadata(language),
                            ],
                        },
                        {
                            width: 'auto',
                            qr: buffer,
                            eccLevel: 'L',
                            mode: 'octet',
                            fit: 90,
                            margin: [20, 0, 0, 0],
                        },
                    ],
                },
            ];
        },
        footer: function (currentPage, pageCount) {
            return {
                margin: [20, 0, 20, 0],
                columns: [
                    {
                        alignment: 'left',
                        svg: new ArucoMarker(62).toSVG('25px'),
                    },
                    {
                        alignment: 'center',
                        text: `${currentPage} of ${pageCount}`,
                        margin: [0, 10, 0, 0],
                    },
                    {
                        alignment: 'right',
                        svg: new ArucoMarker(207).toSVG('25px'),
                    },
                ],
            };
        },
        content: [
            ...dataSource.elements.filter(variable => variable.active).map(createVariableDocDef),
        ],
    };
}

function createMetadata(language) {
    return {
        columns: [
            {
                stack: [
                    {
                        style: 'variableName',
                        text: strings[language].collection_site,
                    },
                    {
                        table: {
                            headerRows: 0,
                            widths: ['*'],
                            body: [[{ style: 'normal', text: ' ' }]],
                        },
                        margin: [0, 0, 10, 0],
                    },
                ],
            },
            {
                stack: [
                    {
                        style: 'variableName',
                        text: strings[language].covered_period,
                    },
                    {
                        table: {
                            headerRows: 0,
                            widths: ['*'],
                            body: [[{ style: 'normal', text: ' ' }]],
                        },
                        margin: [0, 0, 10, 0],
                    },
                ],
            },
            {
                stack: [
                    { style: 'variableName', text: strings[language].collected_by },
                    {
                        table: {
                            headerRows: 0,
                            widths: ['*'],
                            body: [[{ style: 'normal', text: ' ' }]],
                        },
                        margin: [0, 0, 0, 0],
                    },
                ],
            },
        ],
    };
}

function createVariableDocDef(variable) {
    var body, widths;

    // remove inactive partitions and elements before generating layout
    var activePartitions = variable.partitions
        .filter(p => p.active)
        .map(p => ({
            ...p,
            elements: p.elements.filter(pe => pe.active),
        }));

    var colPartitions = activePartitions.slice(variable.distribution),
        rowPartitions = activePartitions.slice(0, variable.distribution);

    var topRows = makeTopRows(colPartitions),
        bodyRows = makeLeftCols(rowPartitions);

    if (!bodyRows.length) bodyRows.push([]);

    var dataColsPerRow = topRows.length ? topRows[0].length : 1;

    // Add empty data fields to bodyRows
    bodyRows.forEach(function (bodyRow) {
        for (var i = 0; i < dataColsPerRow; ++i) bodyRow.push({ text: ' ', style: 'normal' });
    });

    // Add empty field in the top-left corner for topRows
    topRows.forEach(function (topRow, index) {
        for (var i = 0; i < rowPartitions.length; ++i)
            topRow.unshift({
                text: { text: ' ', style: 'normal' },
                colSpan: i == rowPartitions.length - 1 ? rowPartitions.length : 1,
                rowSpan: index == 0 ? topRows.length : 1,
            });
    });

    body = topRows.concat(bodyRows);

    widths = [];
    for (var i = 0; i < rowPartitions.length; ++i) widths.push('auto');
    for (var j = 0; j < dataColsPerRow; ++j) widths.push('*');

    // Create stack with label and table.
    return {
        _varId: variable.id,
        _varName: variable.name,
        unbreakable: true,
        stack: [
            { style: 'variableName', text: variable.name },
            {
                table: {
                    headerRows: colPartitions.length,
                    dontBreakRows: true,
                    widths: widths,
                    body: [...topRows, ...bodyRows],
                },
            },
        ],
    };
}

function makeTopRows(partitions) {
    var totalCols = partitions.reduce(function (memo, tp) {
            return memo * tp.elements.length;
        }, 1),
        currentColSpan = totalCols;

    var body = [];

    // Create header rows for top partitions
    partitions.forEach(function (tp) {
        // Update currentColSpan
        currentColSpan /= tp.elements.length;

        // Create header row
        var row = [];

        // Add one field for each element in tp, with current colspan
        for (var colIndex = 0; colIndex < totalCols; ++colIndex) {
            // Add field
            var tpe = tp.elements[(colIndex / currentColSpan) % tp.elements.length];
            row.push({ colSpan: currentColSpan, style: 'normal', text: tpe.name });

            // Add as many fillers as the colSpan value - 1
            var colLimit = colIndex + currentColSpan - 1;
            for (; colIndex < colLimit; ++colIndex) row.push('');
        }

        // push to body
        body.push(row);
    });

    return body;
}

function makeLeftCols(partitions) {
    let rows = makeTopRows(partitions);

    if (rows.length === 0) return [];

    var result = new Array(rows[0].length);

    for (var x = 0; x < rows[0].length; ++x) {
        result[x] = new Array(rows.length);

        for (var y = 0; y < rows.length; ++y) {
            result[x][y] = JSON.parse(JSON.stringify(rows[y][x]));

            if (result[x][y].colSpan) {
                result[x][y].rowSpan = result[x][y].colSpan;
                delete result[x][y].colSpan;
            } else if (result[x][y].rowSpan) {
                result[x][y].colSpan = result[x][y].rowSpan;
                delete result[x][y].rowSpan;
            }
        }
    }

    return result;
}

module.exports = { printer, createDataSourceDocDef };
