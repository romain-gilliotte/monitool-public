const { ObjectId } = require('mongodb');
const { printer, createDataSourceDocDef } = require('../../downloads/datasource-pdf');
const TableProcessor = require('pdfmake/src/tableProcessor');

/**
 * Retrieve variables tables from correctly aligned page image.
 */
async function extractVariables(page, project, dataSource) {
    const [height, width] = page.sizes;
    const boundaries = getVariableBoundaries(project, dataSource, 'portrait', 'en', width, height);

    for (let [index, boundary] of boundaries.entries()) {
        const rect = new cv.Rect(
            boundary.x - 15,
            boundary.y - 15,
            boundary.w + 30,
            boundary.h + 30
        );
        const table = page.getRegion(rect);

        cv.imwrite(`${index}.png`, table);
    }
}

/**
 * Retrieve the coordinates of all tables within a given paper form.
 *
 * This works by hooking pdfmake's templating engine, and running the generation
 * in order to steal the positions of the items of interest.
 */
function getVariableBoundaries(
    project,
    dataSource,
    pageOrientation = 'portrait',
    language = 'en',
    width = 1050,
    height = 1485
) {
    const boundaries = [];
    const stack = [];

    // Hook pdfmake
    const hookedBegin = TableProcessor.prototype.beginTable;
    TableProcessor.prototype.beginTable = function (writer) {
        const { x, y, page, pages } = writer.context();
        stack.push({
            x,
            y,
            pageId: page,
            numItems: pages[page].items.length,
        });

        return hookedBegin.apply(this, arguments);
    };

    const hookedEnd = TableProcessor.prototype.endTable;
    TableProcessor.prototype.endTable = function (writer) {
        const result = hookedEnd.apply(this, arguments);
        const item = stack.pop();

        // Ignore nested tables
        if (stack.length > 0) {
            return;
        }

        const { page, pages } = writer.context();
        const items = pages[page].items.slice(item.numItems);

        let [minX, maxX, minY, maxY] = [Infinity, 0, Infinity, 0];
        for (let item of items) {
            if (item.type === 'vector') {
                if (item.item.x1 && item.item.x1 < minX) minX = item.item.x1;
                if (item.item.x2 && item.item.x2 > maxX) maxX = item.item.x2;
                if (item.item.y1 && item.item.y1 < minY) minY = item.item.y1;
                if (item.item.y2 && item.item.y2 > maxY) maxY = item.item.y2;
            }
        }

        const widthRatio = width / 595.28;
        const heightRatio = height / 841.89;

        boundaries.push({
            x: minX * widthRatio,
            y: minY * heightRatio,
            w: (maxX - minX) * widthRatio,
            h: (maxY - minY) * heightRatio,
        });

        return result;
    };

    // Render pdf
    const docDef = createDataSourceDocDef(project._id, dataSource, pageOrientation, language);
    const stream = printer.createPdfKitDocument(docDef);
    stream.end(); // work around bug in pdfkit never ending the stream.

    // Fix pdfmake.
    TableProcessor.prototype.beginTable = hookedBegin;
    TableProcessor.prototype.endTable = hookedEnd;

    return boundaries;
}

module.exports = { cutImage: extractVariables };
