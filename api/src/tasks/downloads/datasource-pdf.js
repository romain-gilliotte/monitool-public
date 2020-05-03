const ArucoMarker = require('aruco-marker');
const { ObjectId } = require('mongodb');
const PdfPrinter = require('pdfmake');
const LayoutBuilder = require('pdfmake/src/layoutBuilder');
const { updateFile } = require('../../storage/gridfs');

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

    await updateFile(cacheId, cacheHash, `${title}.pdf`, async () => {
        const docDef = createDataSourceDocDef(project._id, dataSource, orientation, language);
        const [stream, boundaries] = createPdfStream(docDef);
        const metadata = { hash: cacheHash, mimeType: 'application/pdf', boundaries };

        return [stream, metadata];
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

/**
 * Retrieve the coordinates of all tables within a given paper form.
 *
 * This works by hooking pdfmake's templating engine, and running the generation
 * in order to steal the positions of the items of interest.
 *
 * We do this to be able to retrieve table locations to deal with uploads of form pictures / scans
 */
function createPdfStream(docDef) {
    const METADATA_MARGIN = 1;
    const VAR_MARGIN_TOP = -20;
    const VAR_MARGIN_OTHER = 5;
    const WR = 1 / 595.28; // "width ratio"
    const HR = 1 / 841.89;

    // Those we can just hardcode, they are always the same.
    const boundaries = [
        {
            id: 'site',
            x: (20 - METADATA_MARGIN) * WR,
            y: (88 - METADATA_MARGIN) * HR,
            w: (141 + 2 * METADATA_MARGIN) * WR,
            h: (16 + 2 * METADATA_MARGIN) * HR,
        },
        {
            id: 'period',
            x: (170 - METADATA_MARGIN) * WR,
            y: (88 - METADATA_MARGIN) * HR,
            w: (141 + 2 * METADATA_MARGIN) * WR,
            h: (16 + 2 * METADATA_MARGIN) * HR,
        },
        {
            id: 'collectedBy',
            x: (320 - METADATA_MARGIN) * WR,
            y: (88 - METADATA_MARGIN) * HR,
            w: (152 + 2 * METADATA_MARGIN) * WR,
            h: (16 + 2 * METADATA_MARGIN) * HR,
        },
    ];

    let baseY = Infinity; // We need the baseY to deal with the first table of page 2 and more.

    const hookedProcessNode = LayoutBuilder.prototype.processNode;
    LayoutBuilder.prototype.processNode = function (node) {
        let pageNo, x, y, w, h;

        if (node._varId) {
            // Save position before rendering table
            const position = this.writer.writer.getCurrentPositionOnPage();
            pageNo = position.pageNumber;
            x = position.left;
            y = position.top;

            if (y < baseY) {
                baseY = y; // Remember lowest y
            }
        }

        hookedProcessNode.apply(this, arguments);

        if (node._varId) {
            // Compare new position on document with previously saved one.
            // This will tell us where the table is.
            const position = this.writer.writer.getCurrentPositionOnPage();
            if (pageNo !== position.pageNumber) {
                pageNo = position.pageNumber;
                y = baseY;
            }

            w = position.pageInnerWidth;
            h = position.top - y;

            boundaries.push({
                id: node._varId,
                pageNo,
                x: (x - VAR_MARGIN_OTHER) * WR,
                y: (y - VAR_MARGIN_TOP) * HR, // variable labels have 15 margin on top
                w: (w + 2 * VAR_MARGIN_OTHER) * WR,
                h: (h + VAR_MARGIN_TOP + VAR_MARGIN_OTHER) * HR,
            });
        }
    };

    // Render pdf
    const stream = printer.createPdfKitDocument(docDef);
    stream.end(); // work around bug in pdfkit never ending the stream.

    // Fix pdfmake.
    LayoutBuilder.prototype.processNode = hookedProcessNode;

    return [stream, boundaries];
}

function createDataSourceDocDef(projectId, dataSource, pageOrientation, language) {
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
                            // Styling
                            width: 'auto',
                            margin: [20, 0, 0, 0],

                            // Version 1 (21x21) will be used
                            qr: buffer,
                            eccLevel: 'L',
                            mode: 'octet',

                            // This is approximative: the generator rounds each block size to be an integer
                            // number of pixels
                            fit: 90,
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
                    // FIXME: putting the page counter somewhere else, and adding a marker would certainly not hurt detection
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

// FIXME this is messy, rewrite with recursive functions like reporting-xlsx
// This should be 30 lignes of code
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
