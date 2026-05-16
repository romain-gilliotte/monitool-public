const { cv } = require('../../../../helpers/cv');

/**
 * Use edge detection to find something white-ish, square-ish and using at least 30% of the pixels.
 *
 * Allows finding a form in a contrasted background with reasonable accuracy when we can't find
 * the aruco markers (or miss some of them).
 *
 * @see https://bretahajek.com/2017/01/scanning-documents-photos-opencv/
 * @see https://stackoverflow.com/questions/43009923/how-to-complete-close-a-contour-in-python-opencv
 * @see https://stackoverflow.com/questions/8667818/opencv-c-obj-c-detecting-a-sheet-of-paper-square-detection
 *
 * @param {import('@techstark/opencv-js').Mat} image
 * @returns {Promise<Array<{x: number, y: number}> | null>}
 */
async function getPageContour(image) {
    const c = cv();
    const minArea = 0.3 * image.rows * image.cols;
    let bestArea = minArea;
    let bestPoints = null;

    const channelMats = [];
    const mv = new c.MatVector();
    c.split(image, mv);
    for (let i = 0; i < mv.size(); i++) {
        channelMats.push(mv.get(i));
    }
    mv.delete();

    const gray = new c.Mat();
    c.cvtColor(image, gray, c.COLOR_BGR2GRAY);
    channelMats.push(gray);

    try {
        for (let sensibility = 1; sensibility < 3; ++sensibility) {
            for (const channel of channelMats) {
                const edges = getEdges(channel, sensibility);
                const contours = new c.MatVector();
                const hier = new c.Mat();
                try {
                    c.findContours(edges, contours, hier, c.RETR_TREE, c.CHAIN_APPROX_SIMPLE);
                    for (let i = 0; i < contours.size(); i++) {
                        const contour = contours.get(i);
                        const approx = new c.Mat();
                        try {
                            c.approxPolyDP(contour, approx, 30, true);
                            const area = c.contourArea(approx);
                            if (
                                approx.rows === 4 &&
                                c.isContourConvex(approx) &&
                                bestArea < area
                            ) {
                                const data = approx.data32S;
                                bestPoints = [
                                    { x: data[0], y: data[1] },
                                    { x: data[2], y: data[3] },
                                    { x: data[4], y: data[5] },
                                    { x: data[6], y: data[7] },
                                ];
                                bestArea = area;
                            }
                        } finally {
                            approx.delete();
                            contour.delete();
                        }
                    }
                } finally {
                    contours.delete();
                    hier.delete();
                    edges.delete();
                }
            }
        }
    } finally {
        for (const m of channelMats) m.delete();
    }

    return bestPoints;
}

/**
 * @param {import('@techstark/opencv-js').Mat} image
 * @param {number} sensibility
 * @returns {import('@techstark/opencv-js').Mat}
 */
function getEdges(image, sensibility = 1) {
    const c = cv();
    const normalized = new c.Mat();
    const blurred = new c.Mat();
    const edges = new c.Mat();
    const dilated = new c.Mat();
    const kernel = new c.Mat();
    const anchor = new c.Point(-1, -1);

    try {
        c.normalize(image, normalized, 0, 255, c.NORM_MINMAX);
        c.medianBlur(normalized, blurred, 9);
        c.Canny(blurred, edges, 5 / sensibility, 30 / sensibility, 3);
        c.dilate(edges, dilated, kernel, anchor, 1);
    } finally {
        normalized.delete();
        blurred.delete();
        edges.delete();
        kernel.delete();
    }

    return dilated;
}

module.exports = { getEdges, getPageContour };
