const cv = require('opencv4nodejs');

/**
 * Use Edge detection to find something big and with four sides on a picture.
 * This allows finding a form in a simple background with reasonable accuracy.
 *
 * @see https://bretahajek.com/2017/01/scanning-documents-photos-opencv/
 * @see https://stackoverflow.com/questions/43009923/how-to-complete-close-a-contour-in-python-opencv
 * @see https://stackoverflow.com/questions/8667818/opencv-c-obj-c-detecting-a-sheet-of-paper-square-detection
 */
function getPageContour(image) {
    const minArea = 0.3 * image.sizes[0] * image.sizes[1];

    let bestArea = minArea;
    let bestContour = null;

    const [r, g, b] = image.split();
    const l = image.cvtColor(cv.COLOR_BGR2GRAY);

    for (let sensibility = 1; sensibility < 3; ++sensibility) {
        const channels = [r, g, b, l];
        for (let channel of channels) {
            const edges = getEdges(channel, sensibility);
            const contours = edges.findContours(cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE);

            for (let contour of contours) {
                // FIXME assuming size is around the standard one we've be using...
                // => express this as a % of width + height
                const approx = contour.approxPolyDPContour(30, true);

                if (approx.numPoints == 4 && approx.isConvex && minArea < approx.area) {
                    bestContour = approx;
                    bestArea = approx.area;
                }
            }
        }

        if (bestContour) {
            return bestContour;
        }
    }
}

function getEdges(image, sensibility = 1) {
    image = image.normalize(0, 255, cv.NORM_MINMAX);
    // image = image.bilateralFilter(9, 75, 75); // noise removal
    // image = image.adaptiveThreshold(255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 115, -10);
    image = image.medianBlur(9);
    image = image.canny(5 / sensibility, 30 / sensibility, 3);
    image = image.dilate(new cv.Mat(), new cv.Point2(-1, -1), 1);

    return image;
}

module.exports = { getEdges, getPageContour };
