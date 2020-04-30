const cv = require('opencv4nodejs');
const LayoutBuilder = require('pdfmake/src/layoutBuilder');
const { printer, createDataSourceDocDef } = require('../../downloads/datasource-pdf');

const METADATA_MARGIN = 1;
const VAR_MARGIN_TOP = -20;
const VAR_MARGIN_OTHER = 5;

/**
 * Retrieve variables tables from correctly aligned page image.
 */
function extractVarImgs(project, dataSource, orientation, language, page, pageNo) {
    // Extract boundaries of all tables.
    const boundaries = getTableBoundaries(
        project,
        dataSource,
        orientation,
        language,
        page.sizes[1],
        page.sizes[0]
    );

    const result = {};
    boundaries.forEach(bounds => {
        if (bounds.pageNo === undefined || bounds.pageNo === pageNo) {
            const rect = new cv.Rect(bounds.x, bounds.y, bounds.w, bounds.h);

            result[bounds.id] = page.getRegion(rect);
        }
    });

    return result;
}

/**
 * Retrieve variables tables from correctly aligned page image.
 */
function extractVarCoords(project, dataSource, orientation, language, page, pageNo) {
    // Extract boundaries of all tables.
    const boundaries = getTableBoundaries(
        project,
        dataSource,
        orientation,
        language,
        page.sizes[1],
        page.sizes[0]
    );

    const result = {};
    boundaries.forEach(bounds => {
        if (bounds.pageNo === undefined || bounds.pageNo === pageNo) {
            const { x, y, w, h } = bounds;
            result[bounds.id] = { x, y, w, h };
        }
    });

    return result;
}

/**
 * Retrieve the coordinates of all tables within a given paper form.
 *
 * This works by hooking pdfmake's templating engine, and running the generation
 * in order to steal the positions of the items of interest.
 */
function getTableBoundaries(project, dataSource, orientation, language, width, height) {
    const widthRatio = width / 595.28;
    const heightRatio = height / 841.89;
    const boundaries = [];

    const hookedProcessNode = LayoutBuilder.prototype.processNode;
    let baseY = Infinity;

    LayoutBuilder.prototype.processNode = function (node) {
        let pageNo, x, y, w, h;

        if (node._varId) {
            const position = this.writer.writer.getCurrentPositionOnPage();
            pageNo = position.pageNumber;
            x = position.left;
            y = position.top;

            // Remember lowest y
            if (y < baseY) {
                baseY = y;
            }
        }

        hookedProcessNode.apply(this, arguments);

        if (node._varId) {
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
                x: (x - VAR_MARGIN_OTHER) * widthRatio,
                y: (y - VAR_MARGIN_TOP) * heightRatio, // variable labels have 15 margin on top
                w: (w + 2 * VAR_MARGIN_OTHER) * widthRatio,
                h: (h + VAR_MARGIN_TOP + VAR_MARGIN_OTHER) * heightRatio,
            });
        }
    };

    // Render pdf
    const docDef = createDataSourceDocDef(project._id, dataSource, orientation, language);
    const stream = printer.createPdfKitDocument(docDef);
    stream.end(); // work around bug in pdfkit never ending the stream.

    // Fix pdfmake.
    LayoutBuilder.prototype.processNode = hookedProcessNode;

    return [
        {
            id: 'site',
            x: (20 - METADATA_MARGIN) * widthRatio,
            y: (88 - METADATA_MARGIN) * heightRatio,
            w: (141 + 2 * METADATA_MARGIN) * widthRatio,
            h: (16 + 2 * METADATA_MARGIN) * heightRatio,
        },
        {
            id: 'period',
            x: (170 - METADATA_MARGIN) * widthRatio,
            y: (88 - METADATA_MARGIN) * heightRatio,
            w: (141 + 2 * METADATA_MARGIN) * widthRatio,
            h: (16 + 2 * METADATA_MARGIN) * heightRatio,
        },
        {
            id: 'collectedBy',
            x: (320 - METADATA_MARGIN) * widthRatio,
            y: (88 - METADATA_MARGIN) * heightRatio,
            w: (152 + 2 * METADATA_MARGIN) * widthRatio,
            h: (16 + 2 * METADATA_MARGIN) * heightRatio,
        },

        ...boundaries,
    ];
}

module.exports = { extractVarImgs, extractVarCoords };
